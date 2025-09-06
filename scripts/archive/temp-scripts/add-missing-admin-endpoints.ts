#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Adding missing admin endpoints...');

try {
  const filePath = 'server/index.ts';
  let content = readFileSync(filePath, 'utf8');
  
  // Find where to insert the new endpoints (after existing admin routes)
  const insertPoint = content.indexOf('// Get system configuration (admin only)');
  
  if (insertPoint === -1) {
    console.error('❌ Could not find insertion point');
    process.exit(1);
  }
  
  const newEndpoints = `
// Admin routes for users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const { rows: users } = await query(\`
      SELECT id, email, username, tier, subscription_tier, magic_credits, credits_used, 
             downloads_used, created_at, updated_at, subscription_status
      FROM users 
      ORDER BY created_at DESC
    \`);
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin routes for prompt logs
app.get('/api/admin/prompt-logs', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const { rows: logs } = await query(\`
      SELECT pl.*, u.email as user_email
      FROM prompt_logs pl
      LEFT JOIN users u ON pl.user_id = u.id
      ORDER BY pl.timestamp DESC
      LIMIT $1
    \`, [limit]);
    
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching prompt logs:', error);
    res.status(500).json({ error: 'Failed to fetch prompt logs' });
  }
});

// Admin routes for usage stats
app.get('/api/admin/stats/usage', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const { rows: stats } = await query(\`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as count,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
        AVG(response_time_ms) as avg_response_time
      FROM prompt_logs 
      WHERE timestamp >= NOW() - INTERVAL '\${days} days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    \`);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage stats' });
  }
});

// Admin routes for invite codes
app.get('/api/admin/invite-codes', authenticateToken, async (req, res) => {
  try {
    const { rows: codes } = await query(\`
      SELECT id, code, max_uses, current_uses, expires_at, created_at, is_active
      FROM invite_codes 
      ORDER BY created_at DESC
    \`);
    
    res.json({ codes });
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    res.status(500).json({ error: 'Failed to fetch invite codes' });
  }
});

app.post('/api/admin/invite-codes', authenticateToken, async (req, res) => {
  try {
    const { max_uses = 1, expires_in_days = 30 } = req.body;
    
    // Generate random code
    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + expires_in_days);
    
    const { rows } = await query(\`
      INSERT INTO invite_codes (code, max_uses, expires_at, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *
    \`, [code, max_uses, expires_at]);
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error creating invite code:', error);
    res.status(500).json({ error: 'Failed to create invite code' });
  }
});

// Admin routes for image providers (placeholder)
app.get('/api/admin/image-providers', authenticateToken, async (req, res) => {
  try {
    // For now, return Fal.ai as the main provider
    const providers = [
      {
        id: 'fal-ai',
        name: 'Fal.ai',
        provider_type: 'fal',
        is_active: true,
        priority: 1
      }
    ];
    
    res.json({ providers });
  } catch (error) {
    console.error('Error fetching image providers:', error);
    res.status(500).json({ error: 'Failed to fetch image providers' });
  }
});

// Admin routes for image models (placeholder)
app.get('/api/admin/image-models', authenticateToken, async (req, res) => {
  try {
    // Return Fal models from existing endpoint
    const { rows: models } = await query(\`
      SELECT id, model_name, display_name, is_active, cost_per_image
      FROM fal_models 
      ORDER BY display_name ASC
    \`);
    
    res.json({ models });
  } catch (error) {
    console.error('Error fetching image models:', error);
    res.status(500).json({ error: 'Failed to fetch image models' });
  }
});

`;
  
  // Insert the new endpoints
  const beforeInsert = content.substring(0, insertPoint);
  const afterInsert = content.substring(insertPoint);
  
  const newContent = beforeInsert + newEndpoints + afterInsert;
  
  writeFileSync(filePath, newContent);
  console.log('✅ Added missing admin endpoints');
  
} catch (error) {
  console.error('❌ Error adding admin endpoints:', error);
  process.exit(1);
}