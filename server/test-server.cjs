// Simple test server to verify the enhanced prompt works
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import the enhanced prompt
const { ENHANCED_ADVENTURE_PROMPT, validateAdventureQuality } = require('./enhanced-adventure-prompt.cjs');

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/test/generate-adventure', async (req, res) => {
  try {
    const { prompt, gameSystem = 'dnd5e', professionalMode } = req.body;
    
    console.log(`[TEST] Professional mode: ${professionalMode?.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    // Mock adventure data for testing
    const mockAdventure = {
      title: 'Test Professional Adventure',
      summary: 'A test adventure to verify professional mode',
      scenes: [
        {
          title: 'Scene 1',
          objectives: ['Test objective 1', 'Test objective 2'],
          readAloudText: 'You enter a mysterious chamber...'
        },
        {
          title: 'Scene 2', 
          objectives: ['Test objective 3'],
          readAloudText: 'The adventure continues...'
        },
        {
          title: 'Scene 3',
          objectives: ['Final objective'],
          readAloudText: 'The climax approaches...'
        }
      ],
      adventureHooks: [
        {
          hookType: 'Personal',
          description: 'A test hook to motivate players',
          implementation: 'Present this to the players'
        }
      ],
      monsters: [
        {
          name: 'Test Monster',
          armorClass: 15,
          hitPoints: 45,
          challengeRating: '3',
          whenEncountered: 'In scene 2'
        }
      ],
      puzzlesAndChallenges: [
        {
          name: 'Test Puzzle',
          solutions: [
            { approach: 'Method 1', dc: '15' },
            { approach: 'Method 2', dc: '16' },
            { approach: 'Method 3', dc: '14' }
          ]
        }
      ],
      gmGuidance: {
        pacing: 'Test pacing advice',
        scalingAdvice: 'Test scaling advice'
      }
    };
    
    // Apply professional mode if enabled
    if (professionalMode?.enabled) {
      console.log(`[TEST] Applying professional enhancements...`);
      
      // Validate quality
      const qualityCheck = validateAdventureQuality(mockAdventure);
      console.log(`[TEST] Quality validation: ${qualityCheck.isValid ? 'PASSED' : 'FAILED'}`);
      console.log(`[TEST] Quality score: ${qualityCheck.qualityScore}/100`);
      
      if (qualityCheck.issues.length > 0) {
        console.log(`[TEST] Issues found:`, qualityCheck.issues);
      }
      
      // Add professional enhancement
      mockAdventure.professionalEnhancement = {
        professionalGrade: qualityCheck.qualityScore >= 90 ? 'A+' : 'B+',
        qualityMetrics: {
          overallScore: qualityCheck.qualityScore,
          contentAccuracy: 95,
          mechanicalBalance: 90,
          editorialStandards: 95,
          userExperience: 90
        },
        professionalFeatures: professionalMode.features || {},
        enhancementTimestamp: new Date().toISOString(),
        processingTime: 1.5,
        featuresApplied: Object.keys(professionalMode.features || {}),
        qualityValidation: {
          isValid: qualityCheck.isValid,
          issues: qualityCheck.issues,
          validationScore: qualityCheck.qualityScore
        }
      };
    }
    
    // Mock response structure
    const response = {
      adventure: {
        id: 'test-' + Date.now(),
        user_id: 'test-user',
        title: mockAdventure.title,
        content: mockAdventure,
        game_system: gameSystem,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_urls: [],
        image_generation_cost: 0,
        regenerations_used: 0
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('[TEST] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`📋 Enhanced prompt length: ${ENHANCED_ADVENTURE_PROMPT.length}`);
});

module.exports = app;