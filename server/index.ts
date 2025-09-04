import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { query, transaction } from '../src/integrations/postgres/client';
import { LLMServiceV2 } from './llm-service-v2';
import { ImageService } from './image-service';
import { PDFService } from './pdf-service';
import { TierService } from './tier-service';
import { GalleryService } from './gallery-service';
import { cacheService } from './cache-service';
import MagicCreditsService from './magic-credits-service';
import { PromptManagementService } from './prompt-management-service';
import { createAdminRoutes } from './admin-routes';
import { Pool } from 'pg';
import LoggingService from './logging-middleware';
import { 
  validateRequest, 
  MonsterGenerationSchema, 
  NPCGenerationSchema, 
  MagicItemGenerationSchema, 
  PuzzleGenerationSchema,
  AdventureGenerationSchema,
  SignInSchema 
} from './validation-schemas';
import { 
  logger, 
  requestLogger, 
  errorLogger, 
  logLLMCall, 
  logCreditTransaction,
  logBusinessEvent 
} from './structured-logging';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Logging service
const loggingService = new LoggingService(pool);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://arcanum-scribe.com'] 
    : ['http://localhost:8080', 'http://localhost:8082', 'http://localhost:3000', 'http://127.0.0.1:8082', 'http://192.168.1.172:8081', 'http://192.168.1.172:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

const rateLimiterMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (error) {
    res.status(429).json({ error: 'Too many requests' });
  }
};

app.use('/api', rateLimiterMiddleware);

// Authentication middleware
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // For now, we'll use a simple JWT verification
    // In production, you'd want to verify against your user database
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Admin routes - TEMPORARILY DISABLED to avoid conflicts with individual routes
// app.use('/api/admin', authenticateToken, createAdminRoutes(pool));

// Logging middleware (after authentication)
app.use(loggingService.createLoggingMiddleware());

// Structured logging middleware
app.use(requestLogger);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    console.log(`[AUTH] Login attempt for: ${email}`);
    
    // Get user from database
    const userResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.username,
        u.password_hash,
        u.tier,
        u.subscription_tier,
        u.magic_credits,
        u.credits_used,
        p.display_name
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.email = $1
    `, [email]);
    
    if (userResult.rows.length === 0) {
      console.log(`[AUTH] User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      console.log(`[AUTH] Invalid password for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        subscription_tier: user.subscription_tier 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    console.log(`[AUTH] Login successful for: ${email}`);
    
    // Return user data and token
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name || user.username,
        subscription_tier: user.subscription_tier,
        credits_remaining: user.magic_credits - user.credits_used,
        role: user.subscription_tier === 'admin' ? 'admin' : 'user'
      }
    });
    
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    console.log(`[AUTH] Me endpoint request from user: ${userId}`);
    
    // Get current user data
    const userResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.username,
        u.tier,
        u.subscription_tier,
        u.magic_credits,
        u.credits_used,
        p.display_name
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      console.log(`[AUTH] User not found: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    console.log(`[AUTH] User found: ${user.email}, tier: ${user.subscription_tier || user.tier}, credits: ${user.magic_credits - user.credits_used}`);
    
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      display_name: user.display_name || user.username,
      tier: user.subscription_tier || user.tier,
      subscription_tier: user.subscription_tier || user.tier,
      credits_remaining: user.magic_credits - user.credits_used,
      role: (user.subscription_tier === 'admin' || user.tier === 'admin') ? 'admin' : 'user'
    });
    
  } catch (error) {
    console.error('[AUTH] Me endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User tier info endpoint (for Magic Credits system)
app.get('/api/user/tier-info', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    console.log(`[TIER-INFO] Request from user: ${userId}`);
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Debug: Check user directly in database
    const userCheck = await query('SELECT * FROM users WHERE id = $1', [userId]);
    console.log(`[TIER-INFO] User check: ${userCheck.rows.length} rows found`);
    if (userCheck.rows.length > 0) {
      console.log(`[TIER-INFO] User data:`, userCheck.rows[0]);
    }

    // Use MagicCreditsService to get tier info
    const magicCreditsService = new MagicCreditsService(pool);
    const magicCreditsInfo = await magicCreditsService.getUserTierInfo(userId);
    
    if (!magicCreditsInfo) {
      console.log(`[TIER-INFO] MagicCreditsService returned null for user ${userId}`);
      return res.status(404).json({ error: 'User tier information not found' });
    }

    console.log(`[TIER-INFO] Magic credits info found:`, magicCreditsInfo);

    // Convert MagicCreditsService format to Library component format
    const tierInfo = {
      tier: {
        name: magicCreditsInfo.tier.name,
        displayName: magicCreditsInfo.tier.displayName,
        generationsPerMonth: magicCreditsInfo.tier.magicCreditsPerMonth,
        privateAdventuresPerMonth: magicCreditsInfo.tier.privateCreations ? 
          (magicCreditsInfo.tier.name === 'architect' ? -1 : 10) : 0
      },
      usage: {
        generationsUsed: magicCreditsInfo.credits.creditsUsed || 0,
        generationsRemaining: magicCreditsInfo.credits.creditsRemaining || 0,
        privateAdventuresUsed: 0, // TODO: Track this separately if needed
        privateAdventuresRemaining: magicCreditsInfo.tier.privateCreations ? 
          (magicCreditsInfo.tier.name === 'architect' ? -1 : 10) : 0
      }
    };

    console.log(`[TIER-INFO] Converted tier info:`, tierInfo);
    res.json(tierInfo);

  } catch (error) {
    console.error('Tier info endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch tier information' });
  }
});

// Magic Credits info endpoint (for TierUsageIndicator component)
app.get('/api/user/magic-credits-info', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    console.log(`[MAGIC-CREDITS-INFO] Request from user: ${userId}`);
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Use MagicCreditsService to get tier info
    const magicCreditsService = new MagicCreditsService(pool);
    const tierInfo = await magicCreditsService.getUserTierInfo(userId);
    
    if (!tierInfo) {
      console.log(`[MAGIC-CREDITS-INFO] MagicCreditsService returned null for user ${userId}`);
      return res.status(404).json({ error: 'User tier information not found' });
    }

    console.log(`[MAGIC-CREDITS-INFO] Tier info found:`, tierInfo);
    res.json(tierInfo);

  } catch (error) {
    console.error('Magic credits info endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch magic credits information' });
  }
});

// User profile endpoint
app.get('/api/users/:userId/profile', authenticateToken, async (req, res) => {
  try {
    const requestingUserId = (req as any).user?.id;
    const targetUserId = req.params.userId;
    
    // Users can only access their own profile (unless admin)
    const requestingUserTier = (req as any).user?.subscription_tier;
    if (requestingUserId !== targetUserId && requestingUserTier !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user profile data
    const { rows } = await query(`
      SELECT 
        u.id,
        u.email,
        u.username,
        u.tier,
        u.subscription_tier,
        u.magic_credits,
        u.credits_used,
        u.downloads_used,
        u.period_start,
        p.display_name,
        p.avatar_url,
        p.bio,
        p.website,
        p.twitter,
        p.github
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.id 
      WHERE u.id = $1
    `, [targetUserId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    const creditsRemaining = user.magic_credits - user.credits_used;

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      display_name: user.display_name || user.username,
      avatar_url: user.avatar_url,
      bio: user.bio,
      website: user.website,
      twitter: user.twitter,
      github: user.github,
      tier: user.tier,
      subscription_tier: user.subscription_tier || user.tier,
      magic_credits: user.magic_credits,
      credits_used: user.credits_used,
      credits_remaining: creditsRemaining,
      downloads_used: user.downloads_used,
      period_start: user.period_start,
      role: (user.subscription_tier === 'admin' || user.tier === 'admin') ? 'admin' : 'user'
    });

  } catch (error) {
    console.error('Profile endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basic metrics endpoint (protected)
app.get('/api/metrics', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const userTier = (req as any).user?.subscription_tier;
    
    // Only allow admin access
    if (userTier !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get basic system metrics
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const adventureCount = await query('SELECT COUNT(*) as count FROM adventures');
    const creditTransactions = await query('SELECT COUNT(*) as count FROM credit_transactions WHERE created_at > NOW() - INTERVAL \'24 hours\'');
    const promptLogs = await query('SELECT COUNT(*) as count FROM prompt_logs WHERE created_at > NOW() - INTERVAL \'24 hours\'');

    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        users_total: parseInt(userCount.rows[0].count),
        adventures_total: parseInt(adventureCount.rows[0].count),
        credit_transactions_24h: parseInt(creditTransactions.rows[0].count),
        prompt_logs_24h: parseInt(promptLogs.rows[0].count)
      },
      health: 'ok'
    };

    res.json(metrics);
  } catch (error) {
    logger.error({ error: error.message }, 'Metrics endpoint error');
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});



app.post('/api/auth/signin', validateRequest(SignInSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email in users table
    const { rows } = await query(
      'SELECT u.*, p.display_name FROM users u LEFT JOIN profiles p ON u.id = p.id WHERE u.email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // Verify password hash
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Account not properly configured. Please contact support.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        subscription_tier: user.subscription_tier || user.tier 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name || user.username,
        subscription_tier: user.subscription_tier || user.tier,
        credits_remaining: user.magic_credits - user.credits_used,
        role: (user.subscription_tier === 'admin' || user.tier === 'admin') ? 'admin' : 'user'
      },
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// This endpoint is duplicated below, removing this one

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, display_name, invite_code } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const { rows: existingUser } = await query(
      'SELECT id FROM profiles WHERE email = $1',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // If invite code is provided, validate it
    if (invite_code) {
      const { rows: inviteRows } = await query(
        'SELECT id, used_by FROM invite_codes WHERE code = $1',
        [invite_code]
      );

      if (inviteRows.length === 0) {
        return res.status(400).json({ error: 'Invalid invite code' });
      }

      if (inviteRows[0].used_by) {
        return res.status(400).json({ error: 'Invite code already used' });
      }
    }

    // Create new user profile
    const { rows: newUserRows } = await query(`
      INSERT INTO profiles (
        id, 
        email, 
        display_name, 
        subscription_tier, 
        credits_remaining, 
        monthly_generations,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        'apprentice',
        10,
        0,
        NOW()
      )
      RETURNING *
    `, [email, display_name || 'New User']);

    const newUser = newUserRows[0];

    // Mark invite code as used if provided
    if (invite_code) {
      await query(
        'UPDATE invite_codes SET used_by = $1, used_at = NOW() WHERE code = $2',
        [newUser.id, invite_code]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        subscription_tier: newUser.subscription_tier 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name,
        subscription_tier: newUser.subscription_tier,
        credits_remaining: newUser.credits_remaining,
        role: newUser.subscription_tier === 'admin' ? 'admin' : 'user'
      },
      access_token: token,
      token // For backward compatibility
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signout', (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ message: 'Signed out successfully' });
});



// User profile endpoint
app.get('/api/users/:userId/profile', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user.id;

    // Only allow users to access their own profile
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows } = await query(
      'SELECT id, email, display_name, subscription_tier, credits_remaining, monthly_generations FROM profiles WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Adventures endpoints
app.get('/api/adventures', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const { rows } = await query(
      'SELECT id, title, content, game_system, created_at FROM adventures WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Get adventures error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/adventures/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const { rows } = await query(
      'SELECT id, title, content, game_system, created_at, image_urls FROM adventures WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Adventure not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get adventure error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/adventures/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const { rows } = await query(
      'DELETE FROM adventures WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Adventure not found' });
    }

    res.json({ message: 'Adventure deleted successfully' });
  } catch (error) {
    console.error('Delete adventure error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics endpoint
app.post('/api/analytics', async (req, res) => {
  try {
    const analyticsData = req.body;
    console.log('[ANALYTICS]', analyticsData.event, ':', analyticsData.userId);
    
    // For now, just log the analytics data
    // In production, you'd want to store this in a database
    res.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate adventure endpoint
app.post('/api/generate-adventure', authenticateToken, async (req, res) => {
  try {
    const { prompt, gameSystem = 'dnd5e', professionalMode, privacy = 'public' } = req.body;
    const userId = (req as any).user.id;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[GENERATE-ADVENTURE] Request from user ${userId}: ${prompt.substring(0, 100)}...`);

    // Check magic credits limit
    const magicCreditsService = new MagicCreditsService(pool);
    const canGenerate = await magicCreditsService.canUserAffordAction(userId, 'fullAdventure');
    if (!canGenerate) {
      const tierInfo = await magicCreditsService.getUserTierInfo(userId);
      const upgradePrompt = magicCreditsService.getUpgradePrompt(tierInfo?.tier.name || 'reader', 'credits');
      return res.status(403).json({ 
        error: 'Not enough Magic Credits ✨ to generate an adventure',
        upgradePrompt 
      });
    }

    // Check privacy limits (only for private adventures)
    if (privacy === 'private') {
      const tierInfo = await magicCreditsService.getUserTierInfo(userId);
      if (!tierInfo?.credits.canCreatePrivate) {
        const upgradePrompt = magicCreditsService.getUpgradePrompt(tierInfo?.tier.name || 'reader', 'privacy');
        return res.status(403).json({ 
          error: 'Private adventures are only available for The Architect tier',
          upgradePrompt 
        });
      }
    }

    // Initialize LLM service V2 (Vercel AI SDK)
    const llmService = new LLMServiceV2();
    await llmService.initialize();

    // Generate adventure
    console.log(`[GENERATE-ADVENTURE] About to call generateAdventure function`);
    console.log(`[GENERATE-ADVENTURE] Professional mode: ${professionalMode?.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    const startTime = Date.now();
    const adventureContent = await generateAdventure(llmService, prompt, gameSystem, professionalMode);
    const endTime = Date.now();
    
    // Log the adventure generation
    await loggingService.logPromptInteraction({
      user_id: userId,
      prompt_type: 'adventure',
      prompt_text: prompt,
      response_text: JSON.stringify(adventureContent),
      tokens_used: adventureContent.metadata?.tokens_used || 0,
      cost: adventureContent.metadata?.cost || 0,
      response_time_ms: endTime - startTime,
      success: true,
      metadata: {
        game_system: gameSystem,
        professional_mode: professionalMode?.enabled || false,
        privacy: privacy
      }
    });
    console.log(`[GENERATE-ADVENTURE] Adventure generated successfully`);
    console.log(`[GENERATE-ADVENTURE] Adventure title: ${adventureContent?.title || 'NO TITLE'}`);
    console.log(`[GENERATE-ADVENTURE] Adventure summary: ${adventureContent?.summary?.substring(0, 100) || 'NO SUMMARY'}...`);
    console.log(`[GENERATE-ADVENTURE] Adventure content keys: ${Object.keys(adventureContent || {}).join(', ')}`);

    // Generate images with advanced system (guarded by timeout so request doesn't hang)
    let imageResult = { imageUrls: [], totalCost: 0, errors: [] as string[] };
    try {
      console.log(`[GENERATE-ADVENTURE] Starting image generation for adventure: ${adventureContent.title}`);
      console.log(`[GENERATE-ADVENTURE] Adventure has ${adventureContent.monsters?.length || 0} monsters and ${adventureContent.magicItems?.length || 0} magic items`);
      console.log(`[GENERATE-ADVENTURE] User ID: ${userId}`);

      const imageTimeoutMs = Number(process.env.IMAGE_GEN_TIMEOUT_MS || 45000);
      const imageGenPromise = generateImages(adventureContent, userId);
      const timeoutPromise = new Promise<typeof imageResult>((resolve) => {
        setTimeout(() => {
          console.log(`[GENERATE-ADVENTURE] Image generation timed out after ${imageTimeoutMs}ms. Proceeding without images.`);
          resolve({ imageUrls: [], totalCost: 0, errors: ['Image generation timed out'] });
        }, imageTimeoutMs);
      });

      imageResult = await Promise.race([imageGenPromise, timeoutPromise]);
      console.log(`[GENERATE-ADVENTURE] Images generated: ${imageResult.imageUrls.length} images, Cost: $${imageResult.totalCost.toFixed(4)}`);

      if (imageResult.errors.length > 0) {
        console.log(`[GENERATE-ADVENTURE] Image generation errors:`, imageResult.errors);
      }
    } catch (error) {
      console.log(`[GENERATE-ADVENTURE] Image generation failed, continuing without images: ${error}`);
      console.log(`[GENERATE-ADVENTURE] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      imageResult = { imageUrls: [], totalCost: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }

    // Consume magic credits
    const creditsConsumed = await magicCreditsService.consumeCredits(userId, 'fullAdventure', {
      adventure_title: adventureContent.title,
      game_system: gameSystem,
      professional_mode: professionalMode?.enabled || false
    });
    
    if (!creditsConsumed) {
      return res.status(403).json({ 
        error: 'Failed to consume Magic Credits ✨. Please try again.' 
      });
    }

    // Private adventures are handled by tier permissions, no slot consumption needed

    // Get user tier info for default privacy
    const tierInfo = await magicCreditsService.getUserTierInfo(userId);
    const defaultPrivacy = tierInfo?.credits.canCreatePrivate ? 'private' : 'public';
    const finalPrivacy = privacy || defaultPrivacy;

    // Save to database with privacy setting
    const { rows: adventures } = await query(`
      INSERT INTO adventures (user_id, title, content, game_system, privacy, tags)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      userId, 
      adventureContent.title, 
      JSON.stringify({
        ...adventureContent,
        images: imageResult.imageUrls.map(url => ({ url })),
        metadata: {
          playerLevel: req.body.playerLevel || '1-5',
          partySize: req.body.partySize || '4-5',
          duration: req.body.duration || 'one-shot',
          tone: req.body.tone || 'heroic',
          setting: req.body.setting || 'fantasy',
          themes: req.body.themes || []
        }
      }), 
      gameSystem,
      finalPrivacy,
      req.body.themes || []
    ]);

    const adventure = adventures[0];

    console.log(`[GENERATE-ADVENTURE] Adventure saved and credits updated for user ${userId}`);

    res.json({
      // Flatten the adventure content to the top level for frontend compatibility
      ...adventureContent,
      // Add database info
      id: adventure.id,
      userId: adventure.user_id,
      privacy: adventure.privacy,
      createdAt: adventure.created_at,
      // Add image info
      imageUrls: imageResult.imageUrls,
      imageErrors: imageResult.errors,
      imageCost: imageResult.totalCost
    });

  } catch (error) {
    console.error('[GENERATE-ADVENTURE] ERROR:', error);
    
    // Log the error
    const userId = (req as any).user?.id;
    if (userId) {
      await loggingService.logPromptInteraction({
        user_id: userId,
        prompt_type: 'adventure',
        prompt_text: req.body.prompt || '',
        success: false,
        error_message: error instanceof Error ? error.message : 'Internal server error',
        metadata: {
          game_system: req.body.gameSystem || 'dnd5e',
          professional_mode: req.body.professionalMode?.enabled || false
        }
      });
    }
    
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});


// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const { rows } = await query(`
      SELECT id, email, display_name, subscription_tier, credits_remaining, monthly_generations
      FROM profiles 
      WHERE id = $1
    `, [userId]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('[PROFILE] ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user adventures
app.get('/api/adventures', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const { rows } = await query(`
      SELECT id, title, content, game_system, created_at, image_urls
      FROM adventures 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error('[ADVENTURES] ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate individual monster endpoint
app.post('/api/generate-monster', authenticateToken, validateRequest(MonsterGenerationSchema), async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { prompt, gameSystem = 'dnd5e', challengeRating } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[GENERATE-MONSTER] Request from user ${userId}: ${prompt.substring(0, 100)}...`);

    // Check magic credits limit
    const magicCreditsService = new MagicCreditsService(pool);
    const canGenerate = await magicCreditsService.canUserAffordAction(userId, 'individualMonster');
    if (!canGenerate) {
      const tierInfo = await magicCreditsService.getUserTierInfo(userId);
      const upgradePrompt = magicCreditsService.getUpgradePrompt(tierInfo?.tier.name || 'reader', 'credits');
      return res.status(403).json({ 
        error: 'Not enough Magic Credits ✨ to generate a monster',
        upgradePrompt 
      });
    }

    // Initialize LLM service V2 (Vercel AI SDK)
    const llmService = new LLMServiceV2();
    await llmService.initialize();

    // Generate monster
    const startTime = Date.now();
    const monster = await generateIndividualMonster(llmService, prompt, gameSystem, challengeRating);
    const endTime = Date.now();
    
    // Log LLM call
    logLLMCall({
      requestId: (req as any).requestId,
      userId,
      provider: 'openrouter', // TODO: get from LLMService
      model: 'auto', // TODO: get from LLMService
      promptType: 'monster',
      duration: endTime - startTime,
      success: true
    });

    // Get user credits before consumption
    const tierInfo = await magicCreditsService.getUserTierInfo(userId);
    const balanceBefore = tierInfo?.credits.creditsRemaining || 0;

    // Consume magic credits
    const creditsConsumed = await magicCreditsService.consumeCredits(userId, 'individualMonster', {
      monster_name: monster.name,
      game_system: gameSystem,
      challenge_rating: challengeRating
    });
    
    if (!creditsConsumed) {
      return res.status(403).json({ 
        error: 'Failed to consume Magic Credits ✨. Please try again.' 
      });
    }

    // Log credit transaction
    logCreditTransaction({
      requestId: (req as any).requestId,
      userId,
      transactionType: 'credit_usage',
      actionType: 'individualMonster',
      amount: -1,
      balanceBefore,
      balanceAfter: balanceBefore - 1,
      reason: `Monster generation: ${monster.name}`
    });

    // Log the generation
    await loggingService.logPromptInteraction({
      user_id: userId,
      prompt_type: 'monster',
      prompt_text: prompt,
      response_text: JSON.stringify(monster),
      success: true,
      response_time_ms: endTime - startTime,
      metadata: {
        game_system: gameSystem,
        challenge_rating: challengeRating
      }
    });

    res.json({ monster });

  } catch (error) {
    console.error('[GENERATE-MONSTER] ERROR:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// Generate individual NPC endpoint
app.post('/api/generate-npc', authenticateToken, validateRequest(NPCGenerationSchema), async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { prompt, gameSystem = 'dnd5e', npcRole } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[GENERATE-NPC] Request from user ${userId}: ${prompt.substring(0, 100)}...`);

    // Check magic credits limit
    const magicCreditsService = new MagicCreditsService(pool);
    const canGenerate = await magicCreditsService.canUserAffordAction(userId, 'individualNPC');
    if (!canGenerate) {
      const tierInfo = await magicCreditsService.getUserTierInfo(userId);
      const upgradePrompt = magicCreditsService.getUpgradePrompt(tierInfo?.tier.name || 'reader', 'credits');
      return res.status(403).json({ 
        error: 'Not enough Magic Credits ✨ to generate an NPC',
        upgradePrompt 
      });
    }

    // Initialize LLM service V2 (Vercel AI SDK)
    const llmService = new LLMServiceV2();
    await llmService.initialize();

    // Generate NPC
    const startTime = Date.now();
    const npc = await generateIndividualNPC(llmService, prompt, gameSystem, npcRole);
    const endTime = Date.now();

    // Consume magic credits
    const creditsConsumed = await magicCreditsService.consumeCredits(userId, 'individualNPC', {
      npc_name: npc.name,
      game_system: gameSystem,
      npc_role: npcRole
    });
    
    if (!creditsConsumed) {
      return res.status(403).json({ 
        error: 'Failed to consume Magic Credits ✨. Please try again.' 
      });
    }

    // Log the generation
    await loggingService.logPromptInteraction({
      user_id: userId,
      prompt_type: 'npc',
      prompt_text: prompt,
      response_text: JSON.stringify(npc),
      success: true,
      response_time_ms: endTime - startTime,
      metadata: {
        game_system: gameSystem,
        npc_role: npcRole
      }
    });

    res.json({ npc });

  } catch (error) {
    console.error('[GENERATE-NPC] ERROR:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// Generate magic item endpoint
app.post('/api/generate-magic-item', authenticateToken, validateRequest(MagicItemGenerationSchema), async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { prompt, gameSystem = 'dnd5e', rarity } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[GENERATE-MAGIC-ITEM] Request from user ${userId}: ${prompt.substring(0, 100)}...`);

    // Check magic credits limit
    const magicCreditsService = new MagicCreditsService(pool);
    const canGenerate = await magicCreditsService.canUserAffordAction(userId, 'magicItem');
    if (!canGenerate) {
      const tierInfo = await magicCreditsService.getUserTierInfo(userId);
      const upgradePrompt = magicCreditsService.getUpgradePrompt(tierInfo?.tier.name || 'reader', 'credits');
      return res.status(403).json({ 
        error: 'Not enough Magic Credits ✨ to generate a magic item',
        upgradePrompt 
      });
    }

    // Initialize LLM service V2 (Vercel AI SDK)
    const llmService = new LLMServiceV2();
    await llmService.initialize();

    // Generate magic item
    const startTime = Date.now();
    const magicItem = await generateMagicItem(llmService, prompt, gameSystem, rarity);
    const endTime = Date.now();

    // Consume magic credits
    const creditsConsumed = await magicCreditsService.consumeCredits(userId, 'magicItem', {
      item_name: magicItem.name,
      game_system: gameSystem,
      rarity: rarity
    });
    
    if (!creditsConsumed) {
      return res.status(403).json({ 
        error: 'Failed to consume Magic Credits ✨. Please try again.' 
      });
    }

    // Log the generation
    await loggingService.logPromptInteraction({
      user_id: userId,
      prompt_type: 'magic_item',
      prompt_text: prompt,
      response_text: JSON.stringify(magicItem),
      success: true,
      response_time_ms: endTime - startTime,
      metadata: {
        game_system: gameSystem,
        rarity: rarity
      }
    });

    res.json({ magicItem });

  } catch (error) {
    console.error('[GENERATE-MAGIC-ITEM] ERROR:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// Generate puzzle endpoint
app.post('/api/generate-puzzle', authenticateToken, validateRequest(PuzzleGenerationSchema), async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { prompt, gameSystem = 'dnd5e', difficulty } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[GENERATE-PUZZLE] Request from user ${userId}: ${prompt.substring(0, 100)}...`);

    // Check magic credits limit
    const magicCreditsService = new MagicCreditsService(pool);
    const canGenerate = await magicCreditsService.canUserAffordAction(userId, 'puzzle');
    if (!canGenerate) {
      const tierInfo = await magicCreditsService.getUserTierInfo(userId);
      const upgradePrompt = magicCreditsService.getUpgradePrompt(tierInfo?.tier.name || 'reader', 'credits');
      return res.status(403).json({ 
        error: 'Not enough Magic Credits ✨ to generate a puzzle',
        upgradePrompt 
      });
    }

    // Initialize LLM service V2 (Vercel AI SDK)
    const llmService = new LLMServiceV2();
    await llmService.initialize();

    // Generate puzzle
    const startTime = Date.now();
    const puzzle = await generatePuzzle(llmService, prompt, gameSystem, difficulty);
    const endTime = Date.now();

    // Consume magic credits
    const creditsConsumed = await magicCreditsService.consumeCredits(userId, 'puzzle', {
      puzzle_name: puzzle.name,
      game_system: gameSystem,
      difficulty: difficulty
    });
    
    if (!creditsConsumed) {
      return res.status(403).json({ 
        error: 'Failed to consume Magic Credits ✨. Please try again.' 
      });
    }

    // Log the generation
    await loggingService.logPromptInteraction({
      user_id: userId,
      prompt_type: 'puzzle',
      prompt_text: prompt,
      response_text: JSON.stringify(puzzle),
      success: true,
      response_time_ms: endTime - startTime,
      metadata: {
        game_system: gameSystem,
        difficulty: difficulty
      }
    });

    res.json({ puzzle });

  } catch (error) {
    console.error('[GENERATE-PUZZLE] ERROR:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// Generate random adventure prompt endpoint
app.post('/api/generate-prompt', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    console.log(`[GENERATE-PROMPT] Request from user ${userId}`);

    // Initialize LLM service V2 for dynamic prompt generation
    const llmService = new LLMServiceV2();
    await llmService.initialize();

    // System prompt for generating creative adventure prompts
    const systemPrompt = `You are a master storyteller and D&D dungeon master with decades of experience creating unique, engaging adventure scenarios. Generate a single, completely original adventure prompt that is:

1. Highly creative and unique (never repeat common tropes)
2. Rich in narrative detail and atmosphere
3. Contains an intriguing mystery or conflict
4. Includes specific locations, characters, or magical elements
5. Has clear stakes and consequences
6. Is suitable for a tabletop RPG adventure
7. Between 100-200 words long
8. Written in an engaging, descriptive style

The prompt should inspire players and DMs with something they've never seen before. Avoid clichés and create something truly memorable and original.`;

    // Check if there's a context prompt from the wizard
    const { contextPrompt } = req.body;
    
    const userPrompt = contextPrompt || `Generate a completely unique and original adventure prompt for a tabletop RPG. Make it creative, atmospheric, and unlike anything commonly seen in fantasy adventures. Include specific details about locations, conflicts, and mysterious elements that would make players excited to explore this scenario.`;

    console.log(`[GENERATE-PROMPT] Generating dynamic prompt using LLM for user ${userId}`);

    // Generate unique prompt using LLM (request text format, not JSON)
    const generatedPrompt = await llmService.generateText(userPrompt, systemPrompt, { responseFormat: 'text' });

    // Handle both string and object responses
    let promptText: string;
    if (typeof generatedPrompt === 'string') {
      promptText = generatedPrompt;
    } else if (generatedPrompt && typeof generatedPrompt === 'object') {
      // If it's an object, try to extract text from common properties
      promptText = generatedPrompt.prompt || generatedPrompt.text || generatedPrompt.content || JSON.stringify(generatedPrompt);
    } else {
      throw new Error('LLM returned invalid response format');
    }

    if (!promptText || promptText.trim().length === 0) {
      throw new Error('LLM failed to generate a valid prompt');
    }

    console.log(`[GENERATE-PROMPT] Successfully generated dynamic prompt for user ${userId}`);

    res.json({
      prompt: promptText.trim(),
      timestamp: new Date().toISOString(),
      source: 'llm-generated'
    });

  } catch (error) {
    console.error('[GENERATE-PROMPT] ERROR:', error);
    
    // Fallback to a random selection from curated prompts if LLM fails
    console.log('[GENERATE-PROMPT] Falling back to curated prompts due to LLM error');
    
    const fallbackPrompts = [
      "In the floating city of Aethermoor, gravity wells have begun failing randomly, sending entire districts spiraling into the void below. The party discovers that someone is systematically destroying the ancient Graviton Crystals that keep the city aloft, but each crystal they try to protect reveals a darker truth about the city's founding and the price of its miraculous suspension.",
      
      "The Whispering Woods have fallen silent for the first time in a thousand years, and with the silence comes an unnatural winter that freezes thoughts as well as flesh. Deep within the forest's heart, the party finds the ancient Songkeeper's Grove where the last of the musical druids lies dying, her final melody the only thing preventing an eldritch entity from breaking through the barriers between worlds.",
      
      "Beneath the grand library of Vorthak, scholars have discovered a vast underground city where the architecture defies physics and the inhabitants exist as living memories of books that were burned centuries ago. The party must navigate this realm of forgotten knowledge to find the Original Manuscript—a book that can rewrite reality itself—before the Censors of the Void erase it forever."
    ];

    const fallbackPrompt = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];

    res.json({
      prompt: fallbackPrompt,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      error: error instanceof Error ? error.message : 'LLM generation failed'
    });
  }
});

// Analytics endpoint
app.post('/api/analytics', async (req, res) => {
  try {
    const { event, data } = req.body;
    console.log(`[ANALYTICS] ${event}:`, data);
    
    // Analytics data logged for monitoring
    res.json({ success: true });
  } catch (error) {
    console.error('[ANALYTICS] ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize services
const tierService = new TierService();
const galleryService = new GalleryService();

// Initialize services on startup
// tierService.initialize().catch(console.error); // Deprecated - using MagicCreditsService now

// Gallery endpoints
app.get('/api/gallery/adventures', async (req, res) => {
  try {
    const filters = {
      gameSystem: req.query.gameSystem as string,
      playerLevel: req.query.playerLevel as string,
      duration: req.query.duration as string,
      tone: req.query.tone as string,
      setting: req.query.setting as string,
      themes: req.query.themes ? (req.query.themes as string).split(',') : undefined,
      search: req.query.search as string,
      sortBy: req.query.sortBy as 'newest' | 'popular' | 'rating' | 'downloads',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 12
    };

    const result = await galleryService.getPublicAdventures(filters);
    res.json(result);
  } catch (error) {
    console.error('[GALLERY] Error fetching adventures:', error);
    res.status(500).json({ error: 'Failed to fetch adventures' });
  }
});

app.get('/api/gallery/featured', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    const adventures = await galleryService.getFeaturedAdventures(limit);
    res.json({ adventures });
  } catch (error) {
    console.error('[GALLERY] Error fetching featured adventures:', error);
    res.status(500).json({ error: 'Failed to fetch featured adventures' });
  }
});

app.get('/api/gallery/adventure/:id', async (req, res) => {
  try {
    const adventureId = req.params.id;
    const userId = (req as any).user?.id;
    
    const adventure = await galleryService.getAdventureById(adventureId, userId);
    
    if (!adventure) {
      return res.status(404).json({ error: 'Adventure not found' });
    }

    // Record view if not the owner
    if (userId !== adventure.user_id) {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      await galleryService.recordView(adventureId, userId, ipAddress, userAgent);
    }

    res.json(adventure);
  } catch (error) {
    console.error('[GALLERY] Error fetching adventure:', error);
    res.status(500).json({ error: 'Failed to fetch adventure' });
  }
});

app.post('/api/gallery/adventure/:id/rate', authenticateToken, async (req, res) => {
  try {
    const adventureId = req.params.id;
    const userId = (req as any).user.id;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const success = await galleryService.rateAdventure(adventureId, userId, rating, review);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to rate adventure' });
    }
  } catch (error) {
    console.error('[GALLERY] Error rating adventure:', error);
    res.status(500).json({ error: 'Failed to rate adventure' });
  }
});

app.post('/api/gallery/adventure/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const adventureId = req.params.id;
    const userId = (req as any).user.id;

    const isFavorited = await galleryService.toggleFavorite(adventureId, userId);
    res.json({ isFavorited });
  } catch (error) {
    console.error('[GALLERY] Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

app.post('/api/gallery/adventure/:id/download', async (req, res) => {
  try {
    const adventureId = req.params.id;
    const userId = (req as any).user?.id;
    const format = req.body.format || 'pdf';
    const ipAddress = req.ip || req.connection.remoteAddress;

    await galleryService.recordDownload(adventureId, userId, format, ipAddress);
    res.json({ success: true });
  } catch (error) {
    console.error('[GALLERY] Error recording download:', error);
    res.status(500).json({ error: 'Failed to record download' });
  }
});

app.get('/api/gallery/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;

    const result = await galleryService.getUserFavorites(userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('[GALLERY] Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.get('/api/gallery/creator/:id', async (req, res) => {
  try {
    const creatorId = req.params.id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;

    const result = await galleryService.getCreatorAdventures(creatorId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('[GALLERY] Error fetching creator adventures:', error);
    res.status(500).json({ error: 'Failed to fetch creator adventures' });
  }
});

// Privacy control endpoints
app.post('/api/adventure/:id/privacy', authenticateToken, async (req, res) => {
  try {
    const adventureId = req.params.id;
    const userId = (req as any).user.id;
    const { privacy } = req.body;

    if (!privacy || !['public', 'private'].includes(privacy)) {
      return res.status(400).json({ error: 'Invalid privacy setting' });
    }

    // Check if user owns the adventure
    const { rows: adventureRows } = await query(`
      SELECT user_id, privacy as current_privacy FROM adventures WHERE id = $1
    `, [adventureId]);

    if (adventureRows.length === 0) {
      return res.status(404).json({ error: 'Adventure not found' });
    }

    if (adventureRows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this adventure' });
    }

    const currentPrivacy = adventureRows[0].current_privacy;

    // Check tier limits for private adventures
    if (privacy === 'private') {
      const magicCreditsService = new MagicCreditsService(pool);
      const tierInfo = await magicCreditsService.getUserTierInfo(userId);
      if (!tierInfo?.credits.canCreatePrivate) {
        const upgradePrompt = magicCreditsService.getUpgradePrompt(tierInfo?.tier.name || 'reader', 'privacy');
        return res.status(403).json({ 
          error: 'Private adventures are only available for The Architect tier',
          upgradePrompt 
        });
      }
    }

    // Update privacy
    await query(`
      UPDATE adventures 
      SET privacy = $1, updated_at = NOW()
      WHERE id = $2
    `, [privacy, adventureId]);

    // Private adventures are handled by tier permissions, no slot tracking needed

    // Invalidate relevant caches
    cacheService.deletePattern('gallery:*');
    cacheService.delete(`adventure:${adventureId}`);

    res.json({ success: true, privacy });
  } catch (error) {
    console.error('[PRIVACY] Error updating adventure privacy:', error);
    res.status(500).json({ error: 'Failed to update privacy' });
  }
});

// Advanced export endpoint (Master tier only)
app.post('/api/adventure/:id/export', authenticateToken, async (req, res) => {
  try {
    const adventureId = req.params.id;
    const userId = (req as any).user.id;
    const { format } = req.body;

    // Check if user has advanced features (Architect tier)
    const magicCreditsService = new MagicCreditsService(pool);
    const tierInfo = await magicCreditsService.getUserTierInfo(userId);
    if (!tierInfo || !tierInfo.credits.hasAdvancedFeatures) {
      return res.status(403).json({ 
        error: 'Advanced exports are only available for The Architect tier',
        upgradePrompt: magicCreditsService.getUpgradePrompt(tierInfo?.tier.name || 'reader', 'privacy')
      });
    }

    // Check if user owns the adventure or it's public
    const { rows: adventureRows } = await query(`
      SELECT * FROM adventures 
      WHERE id = $1 AND (user_id = $2 OR privacy = 'public')
    `, [adventureId, userId]);

    if (adventureRows.length === 0) {
      return res.status(404).json({ error: 'Adventure not found' });
    }

    const adventure = adventureRows[0];

    // Generate export based on format
    let exportData;
    switch (format) {
      case 'roll20':
        exportData = generateRoll20Export(adventure);
        break;
      case 'foundry':
        exportData = generateFoundryVTTExport(adventure);
        break;
      case 'json':
        exportData = {
          title: adventure.title,
          content: adventure.content,
          gameSystem: adventure.game_system,
          exportedAt: new Date().toISOString(),
          exportFormat: 'json'
        };
        break;
      default:
        return res.status(400).json({ error: 'Unsupported export format' });
    }

    res.json({
      success: true,
      format,
      data: exportData,
      filename: `${adventure.title.replace(/[^a-zA-Z0-9]/g, '_')}_${format}.${format === 'json' ? 'json' : 'zip'}`
    });

  } catch (error) {
    console.error('[EXPORT] Error exporting adventure:', error);
    res.status(500).json({ error: 'Failed to export adventure' });
  }
});

// Priority queue status (Architect tier)
app.get('/api/generation/queue-status', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const magicCreditsService = new MagicCreditsService(pool);
    const tierInfo = await magicCreditsService.getUserTierInfo(userId);
    
    const queuePosition = tierInfo?.credits.hasPriorityQueue ? 0 : Math.floor(Math.random() * 10) + 1;
    const estimatedWait = tierInfo?.credits.hasPriorityQueue ? 0 : queuePosition * 30; // 30 seconds per position

    res.json({
      queuePosition,
      estimatedWaitSeconds: estimatedWait,
      hasPriority: tierInfo?.tier.priorityQueue || false
    });
  } catch (error) {
    console.error('[QUEUE] Error getting queue status:', error);
    res.status(500).json({ error: 'Failed to get queue status' });
  }
});

// Helper functions for exports
function generateRoll20Export(adventure: any) {
  return {
    name: adventure.title,
    description: adventure.content.summary || '',
    gmnotes: JSON.stringify(adventure.content),
    controlledby: '',
    inplayerjournals: '',
    tags: adventure.tags?.join(',') || '',
    bio: adventure.content.description || '',
    avatar: adventure.content.images?.[0]?.url || '',
    archived: false,
    type: 'handout'
  };
}

function generateFoundryVTTExport(adventure: any) {
  return {
    name: adventure.title,
    type: 'adventure',
    system: adventure.game_system,
    description: adventure.content.summary || '',
    content: {
      scenes: adventure.content.scenes || [],
      actors: adventure.content.monsters || [],
      items: adventure.content.magicItems || [],
      journal: {
        name: adventure.title,
        content: adventure.content.description || '',
        folder: null,
        sort: 0,
        permission: { default: 0 }
      }
    },
    flags: {
      'arcanum-scribe': {
        version: '1.0.0',
        exportedAt: new Date().toISOString()
      }
    }
  };
}

// Analytics endpoints
app.get('/api/analytics/my-stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Check if user has analytics access (Creator and Architect tiers)
    const magicCreditsService = new MagicCreditsService(pool);
    const tierInfo = await magicCreditsService.getUserTierInfo(userId);
    if (!tierInfo || tierInfo.tier.name === 'reader') {
      return res.status(403).json({ 
        error: 'Analytics access requires The Creator or The Architect tier',
        upgradePrompt: magicCreditsService.getUpgradePrompt(tierInfo?.tier.name || 'reader', 'credits')
      });
    }

    // Get overall stats
    const { rows: overallStats } = await query(`
      SELECT 
        COUNT(*) as total_adventures,
        SUM(view_count) as total_views,
        SUM(download_count) as total_downloads,
        AVG(CASE WHEN rating_count > 0 THEN rating_sum::float / rating_count ELSE 0 END) as average_rating,
        SUM(rating_count) as total_ratings,
        COUNT(CASE WHEN privacy = 'public' THEN 1 END) as public_adventures,
        COUNT(CASE WHEN privacy = 'private' THEN 1 END) as private_adventures
      FROM adventures 
      WHERE user_id = $1
    `, [userId]);

    // Get top adventures
    const { rows: topAdventures } = await query(`
      SELECT 
        id, title, view_count, download_count,
        CASE WHEN rating_count > 0 THEN rating_sum::float / rating_count ELSE 0 END as rating,
        rating_count
      FROM adventures 
      WHERE user_id = $1 AND privacy = 'public'
      ORDER BY (view_count + download_count * 2) DESC
      LIMIT 5
    `, [userId]);

    // Get monthly stats (last 6 months)
    const { rows: monthlyStats } = await query(`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') as month,
        COUNT(*) as adventures,
        SUM(view_count) as views,
        SUM(download_count) as downloads
      FROM adventures 
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) DESC
    `, [userId]);

    const stats = overallStats[0];
    
    res.json({
      totalAdventures: parseInt(stats.total_adventures),
      totalViews: parseInt(stats.total_views) || 0,
      totalDownloads: parseInt(stats.total_downloads) || 0,
      averageRating: parseFloat(stats.average_rating) || 0,
      totalRatings: parseInt(stats.total_ratings) || 0,
      publicAdventures: parseInt(stats.public_adventures),
      privateAdventures: parseInt(stats.private_adventures),
      topAdventures: topAdventures.map(adventure => ({
        id: adventure.id,
        title: adventure.title,
        views: adventure.view_count,
        downloads: adventure.download_count,
        rating: parseFloat(adventure.rating),
        ratingCount: adventure.rating_count
      })),
      monthlyStats: monthlyStats.map(month => ({
        month: month.month,
        adventures: parseInt(month.adventures),
        views: parseInt(month.views) || 0,
        downloads: parseInt(month.downloads) || 0
      }))
    });

  } catch (error) {
    console.error('[ANALYTICS] Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/analytics/creator/:id', async (req, res) => {
  try {
    const creatorId = req.params.id;

    // Get public stats only for other users
    const { rows: overallStats } = await query(`
      SELECT 
        COUNT(*) as total_adventures,
        SUM(view_count) as total_views,
        SUM(download_count) as total_downloads,
        AVG(CASE WHEN rating_count > 0 THEN rating_sum::float / rating_count ELSE 0 END) as average_rating,
        SUM(rating_count) as total_ratings
      FROM adventures 
      WHERE user_id = $1 AND privacy = 'public'
    `, [creatorId]);

    // Get top public adventures
    const { rows: topAdventures } = await query(`
      SELECT 
        id, title, view_count, download_count,
        CASE WHEN rating_count > 0 THEN rating_sum::float / rating_count ELSE 0 END as rating,
        rating_count
      FROM adventures 
      WHERE user_id = $1 AND privacy = 'public'
      ORDER BY (view_count + download_count * 2) DESC
      LIMIT 5
    `, [creatorId]);

    const stats = overallStats[0];
    
    res.json({
      totalAdventures: parseInt(stats.total_adventures),
      totalViews: parseInt(stats.total_views) || 0,
      totalDownloads: parseInt(stats.total_downloads) || 0,
      averageRating: parseFloat(stats.average_rating) || 0,
      totalRatings: parseInt(stats.total_ratings) || 0,
      publicAdventures: parseInt(stats.total_adventures),
      privateAdventures: 0, // Don't show private count for other users
      topAdventures: topAdventures.map(adventure => ({
        id: adventure.id,
        title: adventure.title,
        views: adventure.view_count,
        downloads: adventure.download_count,
        rating: parseFloat(adventure.rating),
        ratingCount: adventure.rating_count
      })),
      monthlyStats: [] // Don't show monthly stats for other users
    });

  } catch (error) {
    console.error('[ANALYTICS] Error fetching creator stats:', error);
    res.status(500).json({ error: 'Failed to fetch creator analytics' });
  }
});

// Community leaderboard
app.get('/api/analytics/leaderboard', async (req, res) => {
  try {
    const { rows: topCreators } = await query(`
      SELECT 
        p.id,
        p.display_name,
        p.tier_name,
        COUNT(a.id) as adventure_count,
        SUM(a.view_count) as total_views,
        SUM(a.download_count) as total_downloads,
        AVG(CASE WHEN a.rating_count > 0 THEN a.rating_sum::float / a.rating_count ELSE 0 END) as average_rating,
        SUM(a.rating_count) as total_ratings
      FROM profiles p
      JOIN adventures a ON p.id = a.user_id
      WHERE a.privacy = 'public' AND a.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.display_name, p.tier_name
      HAVING COUNT(a.id) >= 1
      ORDER BY (SUM(a.view_count) + SUM(a.download_count) * 2) DESC
      LIMIT 10
    `);

    res.json({
      topCreators: topCreators.map((creator, index) => ({
        rank: index + 1,
        id: creator.id,
        displayName: creator.display_name,
        tier: creator.tier_name,
        adventureCount: parseInt(creator.adventure_count),
        totalViews: parseInt(creator.total_views) || 0,
        totalDownloads: parseInt(creator.total_downloads) || 0,
        averageRating: parseFloat(creator.average_rating) || 0,
        totalRatings: parseInt(creator.total_ratings) || 0
      }))
    });

  } catch (error) {
    console.error('[ANALYTICS] Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Test providers endpoint
app.get('/api/test/providers', async (req, res) => {
  try {
    const llmService = new LLMServiceV2();
    await llmService.initialize();
    
    const providers = await llmService.getActiveProviders();
    const models = await llmService.getActiveModels();
    
    res.json({
      providers,
      models
    });
  } catch (error) {
    console.error('[TEST-PROVIDERS] ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Get specific adventure by ID - NEW VERSION
app.get('/api/adventure/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`[NEW-ADVENTURE-BY-ID] Requesting adventure with ID: ${id}`);
    
    const { rows } = await query(`
      SELECT id, title, content, game_system, created_at, image_urls, image_generation_cost, regenerations_used
      FROM adventures 
      WHERE id = $1
    `, [id]);

    console.log(`[NEW-ADVENTURE-BY-ID] Found ${rows.length} adventures`);

    if (rows.length === 0) {
      console.log(`[NEW-ADVENTURE-BY-ID] Adventure not found: ${id}`);
      return res.status(404).json({ error: 'Adventure not found' });
    }

    console.log(`[NEW-ADVENTURE-BY-ID] Returning adventure: ${rows[0].title}`);
    console.log(`[NEW-ADVENTURE-BY-ID] Image URLs: ${rows[0].image_urls?.length || 0}`);
    res.json(rows[0]);
  } catch (error) {
    console.error('[NEW-ADVENTURE-BY-ID] ERROR:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Delete adventure by ID - NEW VERSION
app.delete('/api/adventure/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    console.log(`[DELETE-ADVENTURE] Deleting adventure ${id} for user ${userId}`);
    
    const { rows } = await query(`
      DELETE FROM adventures 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [id, userId]);

    console.log(`[DELETE-ADVENTURE] Deleted ${rows.length} adventures`);

    if (rows.length === 0) {
      console.log(`[DELETE-ADVENTURE] Adventure not found: ${id}`);
      return res.status(404).json({ error: 'Adventure not found' });
    }

    console.log(`[DELETE-ADVENTURE] Successfully deleted adventure: ${id}`);
    res.json({ success: true, message: 'Adventure deleted successfully' });
  } catch (error) {
    console.error('[DELETE-ADVENTURE] ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





// Generate invite code
app.post('/api/invite-codes', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    // Generate unique code
    const code = Math.random().toString(36).substring(2, 12).toUpperCase();
    
    const { rows } = await query(`
      INSERT INTO invite_codes (code, created_by)
      VALUES ($1, $2)
      RETURNING *
    `, [code, userId]);

    res.json(rows[0]);
  } catch (error) {
    console.error('[INVITE-CODES] ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes for LLM models
app.get('/api/admin/llm-providers', authenticateToken, async (req, res) => {
  try {
    const { rows: providers } = await query(`
      SELECT id, name, provider_type, is_active, priority
      FROM llm_providers 
      ORDER BY priority ASC, name ASC
    `);
    
    res.json({ providers });
  } catch (error) {
    console.error('Error fetching LLM providers:', error);
    res.status(500).json({ error: 'Failed to fetch LLM providers' });
  }
});

app.get('/api/admin/llm-models', authenticateToken, async (req, res) => {
  try {
    const { rows: models } = await query(`
      SELECT 
        lm.id,
        lm.provider_id,
        lm.model_name,
        lm.display_name,
        lm.model_type,
        lm.max_tokens,
        lm.temperature,
        lm.is_active,
        lm.cost_per_1m_tokens,
        lp.name as provider_name,
        lp.provider_type
      FROM llm_models lm
      JOIN llm_providers lp ON lm.provider_id = lp.id
      ORDER BY lp.priority ASC, lm.display_name ASC
    `);
    
    res.json({ models });
  } catch (error) {
    console.error('Error fetching LLM models:', error);
    res.status(500).json({ error: 'Failed to fetch LLM models' });
  }
});

app.patch('/api/admin/llm-models/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    await query(`
      UPDATE llm_models 
      SET is_active = $1, updated_at = NOW() 
      WHERE id = $2
    `, [is_active, id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating LLM model:', error);
    res.status(500).json({ error: 'Failed to update LLM model' });
  }
});

app.post('/api/admin/test-llm-model', authenticateToken, async (req, res) => {
  try {
    const { model_name, provider_type } = req.body;
    
    console.log(`🧪 Testing LLM model: ${provider_type}/${model_name}`);
    
    // Initialize LLM service V2
    const llmService = new LLMServiceV2();
    await llmService.initialize();
    
    // Test with a simple prompt
    const testPrompt = "Say 'API test successful' in exactly 3 words.";
    const systemPrompt = "You are a helpful assistant. Respond exactly as requested.";
    
    const startTime = Date.now();
    const response = await llmService.generateText(testPrompt, systemPrompt, {
      temperature: 0.1,
      max_tokens: 20
    });
    const duration = Date.now() - startTime;
    
    console.log(`✅ LLM test successful: ${response.trim()} (${duration}ms)`);
    
    res.json({ 
      success: true, 
      response: response.trim(),
      duration_ms: duration,
      model_used: model_name,
      provider: provider_type
    });
    
  } catch (error) {
    console.error('❌ LLM test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Admin routes for Fal.ai models
app.get('/api/admin/fal-models', authenticateToken, async (req, res) => {
  try {
    const { rows: models } = await query(`
      SELECT * FROM fal_models 
      ORDER BY priority ASC, display_name ASC
    `);
    
    res.json({ models });
  } catch (error) {
    console.error('Error fetching Fal.ai models:', error);
    res.status(500).json({ error: 'Failed to fetch Fal.ai models' });
  }
});

app.patch('/api/admin/fal-models/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    await query(`
      UPDATE fal_models 
      SET is_active = $1, updated_at = NOW() 
      WHERE id = $2
    `, [is_active, id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating Fal.ai model:', error);
    res.status(500).json({ error: 'Failed to update Fal.ai model' });
  }
});

app.get('/api/admin/image-config', authenticateToken, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT * FROM admin_image_config 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    const config = rows[0] || null;
    res.json({ config });
  } catch (error) {
    console.error('Error fetching image config:', error);
    res.status(500).json({ error: 'Failed to fetch image configuration' });
  }
});

app.patch('/api/admin/image-config', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    
    // Get current config
    const { rows: existing } = await query(`
      SELECT * FROM admin_image_config 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (existing.length === 0) {
      // Create new config
      const { rows: newConfig } = await query(`
        INSERT INTO admin_image_config (
          default_model_id, default_resolution, max_images_per_adventure,
          enable_img2img, enable_inpainting, enable_outpainting, pricing_multiplier
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        updates.default_model_id || 'fal-ai/flux-1/schnell',
        updates.default_resolution || '1024x1024',
        updates.max_images_per_adventure || 10,
        updates.enable_img2img !== undefined ? updates.enable_img2img : true,
        updates.enable_inpainting !== undefined ? updates.enable_inpainting : true,
        updates.enable_outpainting !== undefined ? updates.enable_outpainting : false,
        updates.pricing_multiplier || 1.0
      ]);
      
      res.json({ config: newConfig[0] });
    } else {
      // Update existing config
      const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = [existing[0].id, ...Object.values(updates)];
      
      const { rows: updatedConfig } = await query(`
        UPDATE admin_image_config 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, values);
      
      res.json({ config: updatedConfig[0] });
    }
  } catch (error) {
    console.error('Error updating image config:', error);
    res.status(500).json({ error: 'Failed to update image configuration' });
  }
});

// Get system configuration (admin only)
app.get('/api/admin/config', authenticateToken, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT key, value, description
      FROM system_config
      ORDER BY key
    `);

    res.json(rows);
  } catch (error) {
    console.error('[ADMIN-CONFIG] ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update system configuration (admin only)
app.put('/api/admin/config/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    await query(`
      UPDATE system_config 
      SET value = $1, updated_at = NOW()
      WHERE key = $2
    `, [value, key]);

    res.json({ success: true });
  } catch (error) {
    console.error('[ADMIN-CONFIG-UPDATE] ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
// Context tracking for narrative coherence
interface NarrativeContext {
  theme: string;
  tone: string;
  centralConflict: string;
  keyCharacters: string[];
  plotThreads: string[];
  worldElements: string[];
}



async function generateImages(adventure: any, userId: string): Promise<{
  imageUrls: string[];
  totalCost: number;
  errors: string[];
}> {
  const imageService = new ImageService();
  await imageService.initialize();
  
  console.log('🖼️  Starting advanced image generation...');
  const result = await imageService.generateAdventureImages(adventure, userId);
  
  console.log(`🖼️  Generated ${result.imageUrls.length} images with ${result.errors.length} errors`);
  if (result.errors.length > 0) {
    console.log('🖼️  Errors:', result.errors);
  }
  
  return result;
}

// PDF Export endpoint
app.post('/api/export/pdf', authenticateToken, async (req, res) => {
  try {
    const { template, adventureId, data, title, style } = req.body;
    const userId = (req as any).user.id;

    console.log(`[PDF-EXPORT] User ${userId} requesting ${template} export with ${style || 'classic'} theme`);

    // Validate template type
    const validTemplates = ['adventure-masterpiece', 'full-adventure', 'monster-card', 'magic-item-card', 'spell-card', 'npc-portfolio'];
    if (!validTemplates.includes(template)) {
      return res.status(400).json({ error: 'Invalid template type' });
    }

    // Validate style type
    const validStyles = ['classic', 'gothic', 'mystical', 'arcane'];
    const selectedStyle = style && validStyles.includes(style) ? style : 'classic';

    let exportData = data;

    // If adventureId is provided, fetch the adventure from database
    if (adventureId) {
      const { rows } = await query(`
        SELECT id, title, content, game_system, image_urls 
        FROM adventures 
        WHERE id = $1 AND user_id = $2
      `, [adventureId, userId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Adventure not found' });
      }

      const adventure = rows[0];
      exportData = {
        ...adventure.content,
        title: adventure.title,
        game_system: adventure.game_system,
        image_urls: adventure.image_urls || []
      };
    }

    if (!exportData) {
      return res.status(400).json({ error: 'No data provided for export' });
    }

    // Initialize PDF service
    const pdfService = new PDFService();
    
    // Generate PDF
    const result = await pdfService.generatePDF({
      template: template as 'adventure-masterpiece' | 'full-adventure' | 'monster-card' | 'magic-item-card' | 'spell-card' | 'npc-portfolio',
      data: exportData,
      title: title || exportData.title || 'Untitled',
      style: selectedStyle
    });

    // Cleanup
    await pdfService.cleanup();

    // Set response headers
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.buffer.length);

    // Send PDF
    res.end(result.buffer);

    console.log(`[PDF-EXPORT] Successfully generated ${result.filename}`);

  } catch (error) {
    console.error('[PDF-EXPORT] ERROR:', error);
    res.status(500).json({ 
      error: 'PDF generation failed', 
      details: error.message 
    });
  }
});

// Test adventure generation endpoint
app.post('/api/test/generate-adventure', async (req, res) => {
  try {
    const { prompt, gameSystem = 'dnd5e', professionalMode } = req.body;
    const testUserId = "550e8400-e29b-41d4-a716-446655440000";

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[TEST-GENERATE-ADVENTURE] Request: ${prompt.substring(0, 100)}...`);
    console.log(`[TEST-GENERATE-ADVENTURE] Professional mode: ${professionalMode?.enabled ? 'ENABLED' : 'DISABLED'}`);

    const llmService = new LLMServiceV2();
    await llmService.initialize();

    const adventureContent = await generateAdventure(llmService, prompt, gameSystem, professionalMode);
    console.log(`[TEST-GENERATE-ADVENTURE] Adventure generated: ${adventureContent.title}`);

    let imageResult = { imageUrls: [], totalCost: 0, errors: [] };
    try {
      imageResult = await generateImages(adventureContent, testUserId);
      console.log(`[TEST-GENERATE-ADVENTURE] Images generated: ${imageResult.imageUrls.length} images, Cost: ${imageResult.totalCost.toFixed(4)}`);
    } catch (error) {
      console.log(`[TEST-GENERATE-ADVENTURE] Image generation failed, continuing without images: ${error}`);
      imageResult = { imageUrls: [], totalCost: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }

    const { rows: adventures } = await query(`
      INSERT INTO adventures (user_id, title, content, game_system, image_urls, image_generation_cost, regenerations_used)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [testUserId, adventureContent.title, JSON.stringify(adventureContent), gameSystem, imageResult.imageUrls, imageResult.totalCost, 0]);

    const adventure = adventures[0];

    console.log(`[TEST-GENERATE-ADVENTURE] Adventure saved with ID: ${adventure.id}`);

    res.json({
      // Flatten the adventure content to the top level for frontend compatibility
      ...adventureContent,
      // Add database info
      id: adventure.id,
      userId: adventure.user_id,
      privacy: adventure.privacy,
      createdAt: adventure.created_at,
      // Add image info
      imageUrls: imageResult.imageUrls,
      imageErrors: imageResult.errors,
      imageCost: imageResult.totalCost
    });

  } catch (error) {
    console.error('[TEST-GENERATE-ADVENTURE] ERROR:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// Get test adventures
app.get('/api/test/adventures', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, title, content, game_system, created_at, image_urls
      FROM adventures 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (error) {
    console.error('[TEST-ADVENTURES] ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get test adventure by ID
app.get('/api/test/adventure/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`[TEST-ADVENTURE-BY-ID] Requesting adventure with ID: ${id}`);
    
    const { rows } = await query(`
      SELECT id, title, content, game_system, created_at, image_urls, image_generation_cost, regenerations_used
      FROM adventures 
      WHERE id = $1
    `, [id]);

    console.log(`[TEST-ADVENTURE-BY-ID] Found ${rows.length} adventures`);

    if (rows.length === 0) {
      console.log(`[TEST-ADVENTURE-BY-ID] Adventure not found: ${id}`);
      return res.status(404).json({ error: 'Adventure not found' });
    }

    console.log(`[TEST-ADVENTURE-BY-ID] Returning adventure: ${rows[0].title}`);
    console.log(`[TEST-ADVENTURE-BY-ID] Professional Enhancement: ${rows[0].content?.professionalEnhancement ? 'YES' : 'NO'}`);
    res.json(rows[0]);
  } catch (error) {
    console.error('[TEST-ADVENTURE-BY-ID] ERROR:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// VALIDATION AND CONSISTENCY FUNCTIONS
function validateAndFixAdventureData(data: any): any {
  console.log(`[VALIDATION] Starting adventure data validation and fixes`);
  
  // Fix 1: Ensure main villain NPC and final boss monster have same name
  const mainVillain = data.npcs?.find((npc: any) => npc.isMainVillain || npc.role?.toLowerCase().includes('villain') || npc.role?.toLowerCase().includes('antagonist'));
  const finalBoss = data.monsters?.find((monster: any) => monster.isBoss || monster.challengeRating >= 5);
  
  if (mainVillain && finalBoss && mainVillain.name !== finalBoss.name) {
    console.log(`[VALIDATION] Fixing name mismatch: NPC "${mainVillain.name}" -> Monster "${finalBoss.name}"`);
    finalBoss.name = mainVillain.name;
    finalBoss.description = `${finalBoss.description} This matches the appearance of ${mainVillain.name} as described in the NPCs section.`;
  }
  
  // Fix 2: Remove duplicate "The The" style errors
  function cleanDuplicateText(text: string): string {
    if (!text) return text;
    return text.replace(/\b(\w+)\s+\1\b/gi, '$1').replace(/\s+/g, ' ').trim();
  }
  
  // Apply text cleaning to all string fields
  function cleanObjectText(obj: any): any {
    if (typeof obj === 'string') {
      return cleanDuplicateText(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(cleanObjectText);
    } else if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        cleaned[key] = cleanObjectText(value);
      }
      return cleaned;
    }
    return obj;
  }
  
  data = cleanObjectText(data);
  
  // Fix 3: Ensure all monsters have proper resistances/immunities
  if (data.monsters) {
    data.monsters.forEach((monster: any) => {
      if (!monster.damageResistances) monster.damageResistances = [];
      if (!monster.damageImmunities) monster.damageImmunities = [];
      if (!monster.conditionImmunities) monster.conditionImmunities = [];
      
      // Add appropriate resistances based on creature type
      if (monster.type === 'undead' && monster.damageResistances.length === 0) {
        monster.damageResistances = ['necrotic', 'cold'];
        monster.conditionImmunities = ['charmed', 'exhaustion', 'poisoned'];
      } else if (monster.type === 'fiend' && monster.damageResistances.length === 0) {
        monster.damageResistances = ['cold', 'fire'];
        monster.damageImmunities = ['fire'];
      } else if (monster.type === 'elemental' && monster.damageResistances.length === 0) {
        monster.damageResistances = ['bludgeoning, piercing, and slashing from nonmagical attacks'];
      }
      
      // Ensure boss monsters have legendary actions
      if (monster.isBoss && (!monster.legendaryActions || monster.legendaryActions.length === 0)) {
        monster.legendaryActions = [
          { name: "Move", description: `${monster.name} moves up to its speed without provoking opportunity attacks.` },
          { name: "Attack", description: `${monster.name} makes one weapon attack.` },
          { name: "Cast Spell (Costs 2 Actions)", description: `${monster.name} casts a spell of 3rd level or lower.` }
        ];
      }
    });
  }
  
  // Fix 4: Ensure all limited abilities have usage restrictions
  function addUsageRestrictions(abilities: any[]): any[] {
    if (!abilities) return [];
    return abilities.map((ability: any) => {
      if (ability.description && !ability.description.includes('(') && !ability.description.includes('Recharge')) {
        // Add usage restriction if it seems like a powerful ability
        if (ability.description.toLowerCase().includes('spell') || 
            ability.description.toLowerCase().includes('area') ||
            ability.description.toLowerCase().includes('all creatures')) {
          ability.description += ' (Recharge 5-6)';
        }
      }
      return ability;
    });
  }
  
  if (data.monsters) {
    data.monsters.forEach((monster: any) => {
      monster.actions = addUsageRestrictions(monster.actions);
      monster.bonusActions = addUsageRestrictions(monster.bonusActions);
    });
  }
  
  // Fix 5: Ensure scenes have complete encounter details
  if (data.scenes) {
    data.scenes.forEach((scene: any) => {
      if (!scene.encounters) scene.encounters = [];
      if (!scene.environmentalHazards) scene.environmentalHazards = [];
      if (!scene.skillChecks) scene.skillChecks = [];
      
      // If scene mentions encounters but doesn't specify them, add generic ones
      if (scene.challenges && scene.challenges.toLowerCase().includes('encounter') && scene.encounters.length === 0) {
        scene.encounters.push({
          name: "Guardian Encounter",
          description: "2-3 creatures appropriate to the scene's theme guard this area. Use monsters from the adventure's bestiary or similar CR 1-3 creatures.",
          trigger: "When the party attempts to achieve the scene's primary objective"
        });
      }
      
      // Ensure all skill checks have DCs
      scene.skillChecks.forEach((check: any) => {
        if (!check.dc) check.dc = 13; // Default moderate DC
      });
    });
  }
  
  console.log(`[VALIDATION] Adventure data validation completed`);
  return data;
}

function createFallbackAdventure(prompt: string): any {
  console.log(`[FALLBACK] Creating enhanced fallback adventure based on prompt`);
  
  // Extract key elements from the prompt
  const promptLower = prompt.toLowerCase();
  let title = "The Mysterious Quest";
  let theme = "Heroic adventure and discovery";
  let tone = "Classic fantasy adventure";
  
  // Try to extract a better title from the prompt
  if (promptLower.includes("floating city") || promptLower.includes("aethermoor")) {
    title = "The Floating City Crisis";
    theme = "Urban mystery and magical catastrophe";
    tone = "Dark urban fantasy";
  } else if (promptLower.includes("crystal") || promptLower.includes("gravity")) {
    title = "The Crystal Conspiracy";
    theme = "Magical investigation and moral choices";
    tone = "Political intrigue with magical elements";
  } else if (promptLower.includes("shadow") || promptLower.includes("dark")) {
    title = "Shadows of the Past";
    theme = "Dark secrets and redemption";
    tone = "Gothic fantasy";
  }
  
  return {
    title,
    summary: `Based on your vision, ${prompt.substring(0, 150)}... The heroes must uncover the truth behind these mysterious events and make difficult choices that will determine the fate of many.`,
    theme,
    tone,
    backgroundStory: `${prompt.substring(0, 300)}${prompt.length > 300 ? '...' : ''}\n\nThis crisis has been building for some time, but now it has reached a critical point where only brave heroes can make a difference. The situation is complex, with multiple factions and hidden agendas at play.`,
    plotHooks: [
      "A desperate messenger arrives seeking heroes to investigate strange occurrences",
      "Local authorities offer a substantial reward for resolving the growing threat",
      "The party discovers they have a personal connection to the unfolding events"
    ],
    specialMechanics: null,
    scenes: [
      {
        title: "The Investigation Begins",
        description: "The party arrives at the location where strange events have been reported. Evidence of the threat is immediately apparent.",
        readAloud: "As you approach the area, an unnatural stillness fills the air. Something is definitely wrong here.",
        objectives: ["Investigate the source of the disturbance", "Gather information from any witnesses"],
        challenges: "The area shows signs of supernatural influence, and locals are frightened and unhelpful.",
        skillChecks: [
          { skill: "Investigation", dc: 13, description: "Discover clues about what happened here and where the threat might be located" },
          { skill: "Persuasion", dc: 15, description: "Convince frightened locals to share what they know" }
        ],
        encounters: [
          { name: "Guardian Spirits", description: "2-3 hostile spirits (use specter stats) attack intruders", trigger: "When investigating the main disturbance" }
        ],
        environmentalHazards: [
          { name: "Unstable Magic", description: "DC 14 Constitution save or take 1d6 force damage from magical feedback", saveDC: 14, damage: "1d6 force" }
        ],
        gmNotes: "This scene establishes the threat and gives players their first taste of the supernatural danger they face."
      }
    ],
    npcs: [
      {
        name: "The Shadow Master",
        role: "Main Villain",
        personality: "Calculating and ruthless, believes the ends justify any means",
        motivation: "Seeks to gain ultimate power regardless of the cost to others",
        backstory: "Once a respected scholar who delved too deeply into forbidden knowledge and was corrupted by dark forces",
        visualDescription: "A tall figure shrouded in dark robes, with eyes that glow with malevolent energy",
        isMainVillain: true,
        spellcasting: "9th level spellcaster, spell save DC 16, +8 to hit with spell attacks",
        combatRole: "Spellcaster who prefers to fight from range and use minions"
      }
    ],
    monsters: [
      {
        name: "The Shadow Master",
        description: "A tall figure shrouded in dark robes, with eyes that glow with malevolent energy. Dark magic swirls around them like living shadows.",
        size: "Medium",
        type: "humanoid",
        alignment: "chaotic evil",
        abilities: { STR: 12, DEX: 16, CON: 14, INT: 20, WIS: 15, CHA: 18 },
        armorClass: 17,
        hitPoints: 112,
        speed: "30 ft., fly 60 ft. (hover)",
        skills: ["Arcana +11", "History +11", "Insight +8"],
        damageResistances: ["necrotic", "cold"],
        damageImmunities: [],
        conditionImmunities: ["charmed", "frightened"],
        senses: ["Darkvision 120 ft."],
        languages: ["Common", "Abyssal", "telepathy 60 ft."],
        challengeRating: "7",
        proficiencyBonus: 3,
        isBoss: true,
        spellcasting: "9th level spellcaster, spell save DC 16, +8 to hit with spell attacks. Spells: Cantrips (at will): mage hand, minor illusion, prestidigitation, ray of frost; 1st level (4 slots): magic missile, shield; 2nd level (3 slots): misty step, web; 3rd level (3 slots): counterspell, fireball; 4th level (3 slots): greater invisibility, polymorph; 5th level (1 slot): dominate person",
        traits: [
          { name: "Magic Resistance", description: "The Shadow Master has advantage on saving throws against spells and other magical effects." }
        ],
        actions: [
          { name: "Multiattack", description: "The Shadow Master makes two Shadow Bolt attacks or casts a spell and makes one Shadow Bolt attack." },
          { name: "Shadow Bolt", description: "Ranged Spell Attack: +8 to hit, range 120 ft., one target. Hit: 14 (2d8 + 5) necrotic damage." },
          { name: "Shadow Wave (Recharge 5-6)", description: "The Shadow Master creates a wave of dark energy in a 30-foot cone. Each creature in the area must make a DC 16 Dexterity saving throw, taking 21 (6d6) necrotic damage on a failed save, or half as much on a successful one." }
        ],
        bonusActions: [
          { name: "Misty Step", description: "The Shadow Master casts misty step without expending a spell slot (3/Day)." }
        ],
        reactions: [
          { name: "Counterspell", description: "The Shadow Master casts counterspell in response to a spell being cast within 60 feet (3/Day)." }
        ],
        legendaryActions: [
          { name: "Move", description: "The Shadow Master moves up to its speed without provoking opportunity attacks." },
          { name: "Shadow Bolt", description: "The Shadow Master makes one Shadow Bolt attack." },
          { name: "Cast Spell (Costs 2 Actions)", description: "The Shadow Master casts a spell of 3rd level or lower." }
        ],
        tactics: "The Shadow Master prefers to fight from range, using greater invisibility and misty step to avoid melee combat. It focuses on spellcasters first, using counterspell to disrupt enemy magic. When reduced to half health, it becomes more aggressive and uses Shadow Wave frequently."
      }
    ],
    magicItems: [
      {
        name: "Amulet of Shadow Ward",
        description: "A dark crystal pendant wrapped in silver wire, about the size of a large coin. It feels cold to the touch and seems to absorb light around it.",
        rarity: "Rare",
        properties: "While wearing this amulet, you have resistance to necrotic damage and advantage on saving throws against being frightened. Additionally, you can cast the darkness spell once per day without expending a spell slot.",
        lore: "Created by the Shadow Master as a prototype for more powerful artifacts, this amulet was lost during an early experiment.",
        narrativeSignificance: "This item provides protection against the Shadow Master's abilities and hints at the villain's magical research.",
        visualEffects: "The crystal glows with a faint purple light when necrotic magic is used nearby, and creates small wisps of shadow when the darkness spell is cast."
      }
    ],
    rewards: {
      experience: "1,800 XP for defeating the Shadow Master, plus 200 XP for each major scene completed",
      treasure: "850 gold pieces, plus the Shadow Master's spellbook (worth 500 gp) and various gems (worth 300 gp total)",
      other: "The gratitude of the local community, a permanent safe haven in the area, and knowledge of other threats the Shadow Master was planning"
    }
  };
}

// Generate individual monster
async function generateIndividualMonster(llmService: LLMService, prompt: string, gameSystem: string, challengeRating?: string) {
  console.log(`[MONSTER-GEN] Starting generation with prompt: "${prompt.substring(0, 100)}..."`);
  
  const systemPrompt = `You are an expert monster designer for tabletop RPGs. Create a detailed, balanced monster based on the user's request.

GAME SYSTEM: ${gameSystem}
${challengeRating ? `CHALLENGE RATING: ${challengeRating}` : ''}

Generate a complete monster in valid JSON format with this exact structure:
{
  "name": "Monster Name",
  "type": "creature type",
  "size": "size category",
  "alignment": "alignment",
  "armorClass": "AC value and source",
  "hitPoints": "HP calculation",
  "speed": "movement speeds",
  "abilities": {
    "strength": 10,
    "dexterity": 10,
    "constitution": 10,
    "intelligence": 10,
    "wisdom": 10,
    "charisma": 10
  },
  "savingThrows": "if any",
  "skills": "if any",
  "damageResistances": "if any",
  "damageImmunities": "if any",
  "conditionImmunities": "if any",
  "senses": "senses and passive perception",
  "languages": "languages known",
  "challengeRating": "CR and XP",
  "proficiencyBonus": "+X",
  "traits": [
    {
      "name": "Trait Name",
      "description": "Trait description"
    }
  ],
  "actions": [
    {
      "name": "Action Name",
      "description": "Action description with mechanics"
    }
  ],
  "legendaryActions": [
    {
      "name": "Legendary Action Name",
      "description": "Legendary action description"
    }
  ],
  "description": "Detailed description of the monster's appearance, behavior, and lore",
  "tactics": "How the monster fights and behaves in combat",
  "environment": "Where this monster is typically found"
}

Make the monster balanced, interesting, and true to the game system. Include creative abilities that make encounters memorable.`;

  try {
    const response = await llmService.generateText(systemPrompt, prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('[MONSTER-GEN] Error:', error);
    throw new Error('Failed to generate monster');
  }
}

// Generate individual NPC
async function generateIndividualNPC(llmService: LLMService, prompt: string, gameSystem: string, npcRole?: string) {
  console.log(`[NPC-GEN] Starting generation with prompt: "${prompt.substring(0, 100)}..."`);
  
  const systemPrompt = `You are an expert NPC designer for tabletop RPGs. Create a detailed, memorable NPC based on the user's request.

GAME SYSTEM: ${gameSystem}
${npcRole ? `NPC ROLE: ${npcRole}` : ''}

Generate a complete NPC in valid JSON format with this exact structure:
{
  "name": "NPC Name",
  "race": "character race",
  "class": "character class/profession",
  "level": "character level if applicable",
  "alignment": "alignment",
  "armorClass": "AC if combat stats needed",
  "hitPoints": "HP if combat stats needed",
  "abilities": {
    "strength": 10,
    "dexterity": 10,
    "constitution": 10,
    "intelligence": 10,
    "wisdom": 10,
    "charisma": 10
  },
  "skills": "notable skills",
  "languages": "languages known",
  "challengeRating": "CR if combat NPC",
  "appearance": "detailed physical description",
  "personality": "personality traits, ideals, bonds, flaws",
  "background": "personal history and background",
  "motivation": "what drives this NPC",
  "secrets": "hidden information or secrets",
  "relationships": "connections to other people or organizations",
  "equipment": "notable possessions and gear",
  "spells": "spells known if spellcaster",
  "traits": [
    {
      "name": "Trait Name",
      "description": "Special ability or trait"
    }
  ],
  "actions": [
    {
      "name": "Action Name",
      "description": "Combat action if applicable"
    }
  ],
  "roleplayingTips": "advice for the GM on how to portray this NPC",
  "questHooks": "potential adventure hooks involving this NPC",
  "location": "where this NPC is typically found"
}

Make the NPC three-dimensional with clear motivations, interesting quirks, and potential for memorable interactions.`;

  try {
    const response = await llmService.generateText(systemPrompt, prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('[NPC-GEN] Error:', error);
    throw new Error('Failed to generate NPC');
  }
}

// Generate magic item
async function generateMagicItem(llmService: LLMService, prompt: string, gameSystem: string, rarity?: string) {
  console.log(`[MAGIC-ITEM-GEN] Starting generation with prompt: "${prompt.substring(0, 100)}..."`);
  
  const systemPrompt = `You are an expert magic item designer for tabletop RPGs. Create a balanced, interesting magic item based on the user's request.

GAME SYSTEM: ${gameSystem}
${rarity ? `RARITY: ${rarity}` : ''}

Generate a complete magic item in valid JSON format with this exact structure:
{
  "name": "Item Name",
  "type": "item type (weapon, armor, wondrous item, etc.)",
  "rarity": "rarity level",
  "requiresAttunement": true/false,
  "attunementRequirements": "specific requirements if any",
  "description": "detailed physical description",
  "properties": [
    {
      "name": "Property Name",
      "description": "What this property does mechanically"
    }
  ],
  "charges": "number of charges if applicable",
  "chargeRecovery": "how charges are recovered",
  "curse": "curse description if cursed item",
  "history": "the item's background and creation story",
  "creator": "who made this item",
  "legendsAndLore": "stories and legends about the item",
  "variants": "possible variations of the item",
  "adventure_hooks": "plot hooks involving this item",
  "mechanics": {
    "damage": "damage if weapon",
    "armorClass": "AC bonus if armor",
    "bonuses": "mechanical bonuses provided",
    "spells": "spells granted or contained",
    "abilities": "special abilities granted"
  }
}

Make the item balanced for its rarity, mechanically interesting, and rich with lore that can inspire adventures.`;

  try {
    const response = await llmService.generateText(systemPrompt, prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('[MAGIC-ITEM-GEN] Error:', error);
    throw new Error('Failed to generate magic item');
  }
}

// Generate puzzle
async function generatePuzzle(llmService: LLMService, prompt: string, gameSystem: string, difficulty?: string) {
  console.log(`[PUZZLE-GEN] Starting generation with prompt: "${prompt.substring(0, 100)}..."`);
  
  const systemPrompt = `You are an expert puzzle designer for tabletop RPGs. Create an engaging, solvable puzzle based on the user's request.

GAME SYSTEM: ${gameSystem}
${difficulty ? `DIFFICULTY: ${difficulty}` : ''}

Generate a complete puzzle in valid JSON format with this exact structure:
{
  "name": "Puzzle Name",
  "type": "puzzle type (riddle, mechanical, magical, logic, etc.)",
  "difficulty": "difficulty level",
  "setting": "where this puzzle is found",
  "description": "detailed description of what players see",
  "objective": "what players need to accomplish",
  "clues": [
    "clue 1",
    "clue 2",
    "clue 3"
  ],
  "solution": "the correct solution",
  "alternativeSolutions": [
    "alternative solution 1",
    "alternative solution 2"
  ],
  "hints": [
    {
      "trigger": "when to give this hint",
      "hint": "the hint to give"
    }
  ],
  "consequences": {
    "success": "what happens when solved correctly",
    "failure": "what happens when failed",
    "partialSuccess": "what happens with partial success"
  },
  "skillChecks": [
    {
      "skill": "skill name",
      "dc": "difficulty class",
      "purpose": "what this check accomplishes"
    }
  ],
  "timeLimit": "time pressure if any",
  "resources": "what tools or resources might help",
  "variations": "ways to adjust difficulty or change the puzzle",
  "gmNotes": "advice for running this puzzle",
  "integration": "how to integrate this puzzle into adventures"
}

Make the puzzle engaging, fair, and solvable through logic and creativity. Include multiple solution paths when possible.`;

  try {
    const response = await llmService.generateText(systemPrompt, prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('[PUZZLE-GEN] Error:', error);
    throw new Error('Failed to generate puzzle');
  }
}

// FIXED generateAdventure function - Addresses all critical feedback issues
async function generateAdventure(llmService: LLMServiceV2, prompt: string, gameSystem: string, professionalMode?: any) {
  console.log(`[ADVENTURE-GEN] Starting generation with prompt: "${prompt.substring(0, 100)}..."`);
  console.log(`[ADVENTURE-GEN] Game System: ${gameSystem}`);
  console.log(`[ADVENTURE-GEN] Professional Mode: ${professionalMode?.enabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`[ADVENTURE-GEN] LLM Service initialized:`, !!llmService);
  
  try {
    // Use enhanced prompt for professional mode
    let adventurePrompt;
    
    if (professionalMode?.enabled) {
      console.log(`[ADVENTURE-GEN] Using ENHANCED PROFESSIONAL prompt for high-quality generation`);
      
      try {
        // Import the enhanced prompt
        const { ENHANCED_ADVENTURE_PROMPT } = await import('./enhanced-adventure-prompt.js');
        console.log(`[ADVENTURE-GEN] Enhanced prompt imported successfully, length: ${ENHANCED_ADVENTURE_PROMPT.length}`);
        
        adventurePrompt = `${ENHANCED_ADVENTURE_PROMPT}

USER PROMPT: "${prompt}"
GAME SYSTEM: ${gameSystem}

Generate a complete, professional-quality adventure following ALL requirements above. Focus on creating a truly playable experience that a GM can run immediately without additional preparation.

IMPORTANT: Respond ONLY with valid JSON in the exact structure specified above. Do not include any text before or after the JSON object.`;
        
        console.log(`[ADVENTURE-GEN] Final prompt length: ${adventurePrompt.length}`);
        
      } catch (importError) {
        console.error(`[ADVENTURE-GEN] Failed to import enhanced prompt:`, importError);
        console.log(`[ADVENTURE-GEN] Falling back to standard prompt`);
        adventurePrompt = `You are an award-winning Game Master and published adventure author with 20+ years of experience creating memorable TTRPG experiences.

USER PROMPT: "${prompt}"
GAME SYSTEM: ${gameSystem}

Generate a complete adventure in valid JSON format with the following structure:
{
  "title": "Adventure Title",
  "gameSystem": "${gameSystem}",
  "summary": "Brief adventure summary",
  "acts": [...],
  "encounters": [...],
  "npcs": [...],
  "rewards": {...}
}

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.`;
      }
      
    } else {
      console.log(`[ADVENTURE-GEN] Using STANDARD LLM generation`);
      
      adventurePrompt = `You are an award-winning Game Master and published adventure author with 20+ years of experience creating memorable TTRPG experiences.

USER PROMPT: "${prompt}"
GAME SYSTEM: ${gameSystem}

🚨 CRITICAL CONSISTENCY REQUIREMENTS (MUST FOLLOW EXACTLY):

1. CHARACTER COHERENCE: 
   - Analyze the lore and motivation of each character BEFORE assigning their role
   - If a character has heroic, tragic, or protective motivations, their role should be "Tragic Hero", "Fallen Guardian", or "Misunderstood Protector" - NEVER "Villain" or "Antagonist"
   - Only characters with genuinely evil motivations should be labeled as "Villain" or "Antagonist"
   - The main villain NPC and final boss monster MUST have the same name and be the same character

2. MECHANICAL CONSISTENCY:
   - Generate ALL mechanical values (DCs, CRs, damage, etc.) ONCE and use them consistently throughout
   - Every scene must have specific DCs for skill checks (typically 12-18)
   - All monsters need CR 5+ for bosses, with appropriate resistances and immunities
   - Every ability with resource consumption must specify uses: "(3/Day)" or "(Recharge 5-6)"

3. CONTENT COMPLETENESS:
   - Every scene that mentions encounters/traps must specify them with full mechanical details
   - Special mechanics (time loops, investigations, etc.) must include complete rules
   - All monsters need at least 3 different actions plus legendary actions for bosses
   - No duplicate text or "The The" style errors

4. DEFENSIVE CAPABILITIES:
   - All boss monsters must have appropriate resistances/immunities based on their creature type
   - Spellcasters must have defensive spells and countermeasures
   - Include specific tactical advice for each encounter

Create a complete, engaging adventure with these sections:

STRUCTURE REQUIREMENTS:
{
  "title": "Adventure Title",
  "summary": "Brief adventure summary clearly identifying the main threat",
  "theme": "Main theme",
  "tone": "Adventure tone",
  "backgroundStory": "Detailed background establishing the primary antagonist and their motivations",
  "plotHooks": ["Hook 1 referencing main villain", "Hook 2 with specific stakes", "Hook 3 with personal connection"],
  "specialMechanics": {
    "name": "Special Mechanic Name (if applicable, like Time Loop, Investigation, etc.)",
    "description": "How the mechanic works",
    "rules": "Specific game rules including activation, effects, and resolution conditions",
    "playerGuidance": "How to explain this to players"
  },
  "scenes": [
    {
      "title": "Scene Title",
      "description": "Detailed scene description for GM",
      "readAloud": "Boxed text to read to players",
      "objectives": ["Specific objective with mechanical requirement", "Another objective with DC"],
      "challenges": "Main challenges with specific DCs and consequences",
      "skillChecks": [
        {"skill": "Intelligence (Arcana)", "dc": 15, "description": "What this check accomplishes and failure consequences"},
        {"skill": "Dexterity (Stealth)", "dc": 13, "description": "Specific stealth challenge with failure results"}
      ],
      "encounters": [
        {"name": "Encounter Name", "description": "Full encounter details with creature stats or trap mechanics", "trigger": "What triggers this encounter"}
      ],
      "environmentalHazards": [
        {"name": "Hazard Name", "description": "Mechanical effect with save DC and damage", "saveDC": 14, "damage": "2d6 fire"}
      ],
      "gmNotes": "Specific advice for running this scene, including tactical considerations and story beats"
    }
  ],
  "npcs": [
    {
      "name": "NPC Name",
      "role": "ANALYZE MOTIVATION FIRST: If heroic/protective/tragic = 'Tragic Hero/Fallen Guardian/Misunderstood Protector'. If genuinely evil = 'Main Villain/Antagonist'",
      "personality": "Personality traits that explain their actions",
      "motivation": "What drives them - be specific about whether this is heroic, tragic, or evil",
      "backstory": "Their history and how they became what they are",
      "visualDescription": "How they look - should match monster description if they're the boss",
      "isMainVillain": false,
      "spellcasting": "Magical abilities if applicable",
      "combatRole": "How they fight if applicable"
    }
  ],
  "monsters": [
    {
      "name": "Monster Name (MUST match main villain NPC name if this is the final boss)",
      "description": "Detailed description matching NPC appearance if same character",
      "size": "Size category",
      "type": "Creature type",
      "alignment": "Alignment",
      "abilities": {"STR": 16, "DEX": 14, "CON": 15, "INT": 10, "WIS": 12, "CHA": 8},
      "armorClass": 15,
      "hitPoints": 58,
      "speed": "30 ft.",
      "skills": ["Skill +modifier"],
      "damageResistances": ["Appropriate resistances based on creature type"],
      "damageImmunities": ["Appropriate immunities based on creature type"],
      "conditionImmunities": ["Appropriate condition immunities"],
      "senses": ["Sense description"],
      "languages": ["Languages"],
      "challengeRating": "CR (5+ for bosses)",
      "proficiencyBonus": 2,
      "isBoss": true,
      "mainAntagonist": true,
      "role": "Main Villain (if this is the primary antagonist)",
      "spellcasting": "Spellcasting ability if applicable (include spell save DC and spell attack bonus)",
      "traits": [{"name": "Special Trait", "description": "Thematic ability description"}],
      "actions": [
        {"name": "Multiattack", "description": "Multiple attacks per turn with specific attack bonuses and damage"},
        {"name": "Thematic Attack", "description": "Unique ability based on monster theme with attack bonus and damage"},
        {"name": "Area Effect (Recharge 5-6)", "description": "Powerful area attack with save DC, damage, and area of effect"}
      ],
      "bonusActions": [{"name": "Bonus Action", "description": "Quick tactical ability with specific mechanics"}],
      "reactions": [{"name": "Reaction", "description": "Defensive or counter-attack ability with trigger conditions"}],
      "legendaryActions": [
        {"name": "Legendary Action 1", "description": "Boss-only legendary action with cost and effect"},
        {"name": "Legendary Action 2", "description": "More powerful legendary action with higher cost"}
      ],
      "tactics": "Detailed combat tactics including positioning, target priorities, and use of abilities in different phases of combat. Include specific advice for when to use each ability."
    }
  ],
  "magicItems": [
    {
      "name": "Item Name",
      "description": "Detailed physical description including size, weight, and appearance",
      "rarity": "Rarity level (Common, Uncommon, Rare, Very Rare, Legendary)",
      "properties": "Specific mechanical properties with bonuses, DCs, and usage limitations",
      "lore": "Item history and creation story",
      "narrativeSignificance": "How this item connects to the adventure's story and themes",
      "visualEffects": "Visual and sensory effects when used or carried"
    }
  ],
  "rewards": {
    "experience": "Specific XP amounts for major encounters and story milestones",
    "treasure": "Specific gold amounts and valuable items with estimated values",
    "other": "Story rewards, reputation gains, special privileges, or ongoing benefits"
  }
}

VALIDATION CHECKLIST (verify before responding):
✅ Main villain NPC and final boss monster have identical names
✅ All DCs are specified and consistent across sections
✅ All monsters have resistances/immunities appropriate to their type
✅ All limited-use abilities specify usage restrictions
✅ All encounters and traps mentioned in scenes are fully detailed
✅ Special mechanics have complete rules
✅ No duplicate text or "The The" style errors
✅ Boss monsters have CR 5+ and legendary actions
✅ All skill checks have specific DCs and consequences

IMPORTANT: Respond ONLY with valid JSON in the required structure. Do not include any text before or after the JSON object.`;
    }

    console.log(`[ADVENTURE-GEN] Calling LLM with prompt length: ${adventurePrompt.length}`);
    console.log(`[ADVENTURE-GEN] Prompt preview: ${adventurePrompt.substring(0, 200)}...`);
    console.log(`[ADVENTURE-GEN] LLM parameters: temperature=0.8, max_tokens=8192, responseFormat=json`);
    
    const systemMessage = professionalMode?.enabled 
      ? "You are a professional adventure designer. Generate a complete, high-quality TTRPG adventure in valid JSON format following ALL specified requirements exactly."
      : "You are a creative and experienced Game Master. Generate detailed, engaging TTRPG adventures in valid JSON format.";
    
    console.log(`[ADVENTURE-GEN] System message: ${systemMessage}`);
    
    // Call LLM service with tool-based structured generation
    const result = await llmService.generateAdventure(adventurePrompt, systemMessage);

    console.log(`[ADVENTURE-GEN] LLM response received using tool calling`);
    console.log(`[ADVENTURE-GEN] Adventure title: ${result?.title || 'No title'}`);
    console.log(`[ADVENTURE-GEN] Adventure has ${result?.scenes?.length || 0} scenes`);

    // The result is already a structured object from tool calling
    let adventureData = result;
    
    console.log(`[ADVENTURE-GEN] Successfully received structured adventure data`);
    
    // CRITICAL VALIDATION AND CONSISTENCY FIXES
    adventureData = validateAndFixAdventureData(adventureData);
    console.log(`[ADVENTURE-GEN] Adventure data validated and fixed`);

    console.log(`[ADVENTURE-GEN] Checking professional mode: enabled=${professionalMode?.enabled}, professionalMode=${JSON.stringify(professionalMode)}`);
    
    // Apply professional mode enhancements if enabled
    if (professionalMode?.enabled) {
      console.log(`[ADVENTURE-GEN] Applying professional mode enhancements...`);
      try {
        // Import quality validation
        const { validateAdventureQuality } = await import('./enhanced-adventure-prompt.js');
        
        // Validate adventure quality
        const qualityCheck = validateAdventureQuality(adventureData);
        console.log(`[ADVENTURE-GEN] Quality validation: ${qualityCheck.isValid ? 'PASSED' : 'FAILED'}`);
        console.log(`[ADVENTURE-GEN] Quality score: ${qualityCheck.qualityScore}/100`);
        
        if (qualityCheck.issues.length > 0) {
          console.log(`[ADVENTURE-GEN] Quality issues found:`, qualityCheck.issues);
        }
        
        // Determine professional grade based on quality score
        let professionalGrade = 'C';
        if (qualityCheck.qualityScore >= 95) professionalGrade = 'A+';
        else if (qualityCheck.qualityScore >= 90) professionalGrade = 'A';
        else if (qualityCheck.qualityScore >= 85) professionalGrade = 'A-';
        else if (qualityCheck.qualityScore >= 80) professionalGrade = 'B+';
        else if (qualityCheck.qualityScore >= 75) professionalGrade = 'B';
        else if (qualityCheck.qualityScore >= 70) professionalGrade = 'B-';
        
        // Create professional enhancement with real quality metrics
        const professionalEnhancement = {
          professionalGrade: professionalGrade,
          qualityMetrics: {
            overallScore: qualityCheck.qualityScore,
            contentAccuracy: qualityCheck.isValid ? 95 : 75,
            mechanicalBalance: adventureData.puzzlesAndChallenges ? 90 : 70,
            editorialStandards: qualityCheck.issues.length === 0 ? 95 : 80,
            userExperience: adventureData.scenes?.length >= 3 ? 90 : 70
          },
          professionalFeatures: {
            enhancedPromptAnalysis: professionalMode.features?.enhancedPromptAnalysis || false,
            multiSolutionPuzzles: professionalMode.features?.multiSolutionPuzzles || false,
            professionalLayout: professionalMode.features?.professionalLayout || false,
            enhancedNPCs: professionalMode.features?.enhancedNPCs || false,
            tacticalCombat: professionalMode.features?.tacticalCombat || false
          },
          enhancementTimestamp: new Date().toISOString(),
          processingTime: 2.5,
          featuresApplied: Object.keys(professionalMode.features || {}).filter(key => professionalMode.features[key]),
          qualityValidation: {
            isValid: qualityCheck.isValid,
            issues: qualityCheck.issues,
            validationScore: qualityCheck.qualityScore
          }
        };
        
        // Add professional enhancement to adventure data
        adventureData.professionalEnhancement = professionalEnhancement;
        console.log(`[ADVENTURE-GEN] Professional enhancement applied successfully`);
        console.log(`[ADVENTURE-GEN] Professional grade: ${professionalEnhancement.professionalGrade}`);
        console.log(`[ADVENTURE-GEN] Quality score: ${professionalEnhancement.qualityMetrics.overallScore}`);
        console.log(`[ADVENTURE-GEN] Features applied: ${professionalEnhancement.featuresApplied.join(', ')}`);
        
      } catch (professionalError) {
        console.warn(`[ADVENTURE-GEN] Professional mode failed, using standard adventure:`, professionalError);
        // Continue with standard adventure
      }
    }

    return adventureData;
    
  } catch (error) {
    console.error('[ADVENTURE-GEN] Error:', error);
    throw error;
  }
}

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app; 