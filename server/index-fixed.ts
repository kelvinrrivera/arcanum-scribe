// Temporary fixed version to identify the syntax error
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { query } from './db.js';
import { LLMService } from './llm-service.js';
import { generateImages } from './image-service.js';
import { PDFService } from './pdf-service.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simple test endpoint
app.post('/api/test/generate-adventure', async (req, res) => {
  try {
    const { prompt, gameSystem = 'dnd5e', professionalMode } = req.body;
    
    console.log(`[TEST] Professional mode: ${professionalMode?.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    // Mock adventure data
    const mockAdventure = {
      title: 'Test Adventure',
      summary: 'A test adventure',
      scenes: [{ title: 'Scene 1', objectives: ['Test'] }],
      monsters: [{ name: 'Test Monster', armorClass: 15, hitPoints: 45 }]
    };
    
    // Apply professional mode if enabled
    if (professionalMode?.enabled) {
      console.log(`[TEST] Applying professional enhancements...`);
      
      try {
        // Import quality validation
        const { validateAdventureQuality } = await import('./enhanced-adventure-prompt.js');
        
        // Validate quality
        const qualityCheck = validateAdventureQuality(mockAdventure);
        console.log(`[TEST] Quality score: ${qualityCheck.qualityScore}/100`);
        
        // Add professional enhancement
        mockAdventure.professionalEnhancement = {
          professionalGrade: 'A+',
          qualityMetrics: { overallScore: qualityCheck.qualityScore },
          qualityValidation: qualityCheck
        };
        
      } catch (professionalError) {
        console.warn(`[TEST] Professional mode failed:`, professionalError);
      }
    }
    
    const response = {
      adventure: {
        id: 'test-' + Date.now(),
        title: mockAdventure.title,
        content: mockAdventure,
        game_system: gameSystem,
        created_at: new Date().toISOString()
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('[TEST] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT}`);
  });
}

export default app;