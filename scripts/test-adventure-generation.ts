#!/usr/bin/env tsx

/**
 * Test Adventure Generation
 * Tests the complete adventure generation with increased max_tokens
 */

import { LLMService } from '../server/llm-service.js';

async function testAdventureGeneration() {
  console.log('🏰 Testing Complete Adventure Generation');
  console.log('=======================================\n');

  try {
    // Initialize LLM service
    const llmService = new LLMService();
    await llmService.initialize();
    console.log('✅ LLM Service initialized\n');

    // Test adventure generation with the same parameters as the real endpoint
    console.log('🧪 Generating adventure with max_tokens=8192...');
    
    const adventurePrompt = `Create a complete D&D 5e adventure with the following structure:

{
  "title": "Adventure Title",
  "gameSystem": "dnd5e", 
  "recommendedLevel": "1-3",
  "partySize": "4-5 players",
  "estimatedDuration": "4-6 hours",
  "summary": "Brief adventure summary",
  "scenes": [
    {
      "title": "Scene Title",
      "description": "Detailed scene description",
      "objectives": ["Objective 1", "Objective 2"],
      "challenges": ["Challenge 1", "Challenge 2"],
      "rewards": ["Reward 1", "Reward 2"]
    }
  ],
  "monsters": [
    {
      "name": "Monster Name",
      "type": "Monster Type", 
      "challengeRating": "1/2",
      "description": "Monster description"
    }
  ],
  "items": [
    {
      "name": "Item Name",
      "type": "Item Type",
      "rarity": "Common",
      "description": "Item description"
    }
  ]
}

Theme: Mysterious forest with ancient secrets
Create 4-5 scenes with varied challenges including combat, exploration, and social encounters.`;

    const systemPrompt = `You are an expert D&D adventure designer. Create a complete, engaging adventure following the exact JSON structure provided. Ensure all fields are filled with creative, detailed content. The adventure should be cohesive and exciting for players.`;

    const startTime = Date.now();
    
    const result = await llmService.generateText(adventurePrompt, systemPrompt, {
      temperature: 0.8,
      max_tokens: 8192,
      responseFormat: 'json'
    });

    const duration = Date.now() - startTime;
    
    console.log(`⏱️  Generation time: ${duration}ms`);
    console.log(`📝 Response type: ${typeof result}`);
    console.log(`📝 Response length: ${result?.length || 'undefined'} characters`);
    console.log(`📄 Response preview: ${JSON.stringify(result).substring(0, 200)}...\n`);

    // Convert result to string if it's an object
    const resultString = typeof result === 'string' ? result : JSON.stringify(result);

    // Try to parse as JSON
    try {
      const adventure = typeof result === 'string' ? JSON.parse(result) : result;
      
      console.log('✅ JSON parsing successful!');
      console.log(`🏰 Adventure: "${adventure.title}"`);
      console.log(`🎮 Game System: ${adventure.gameSystem}`);
      console.log(`📊 Recommended Level: ${adventure.recommendedLevel}`);
      console.log(`👥 Party Size: ${adventure.partySize}`);
      console.log(`⏰ Duration: ${adventure.estimatedDuration}`);
      console.log(`📖 Scenes: ${adventure.scenes?.length || 0}`);
      console.log(`👹 Monsters: ${adventure.monsters?.length || 0}`);
      console.log(`🎁 Items: ${adventure.items?.length || 0}`);
      
      if (adventure.scenes && adventure.scenes.length > 0) {
        console.log('\n📋 Scene Details:');
        adventure.scenes.forEach((scene: any, index: number) => {
          console.log(`  ${index + 1}. ${scene.title}`);
          console.log(`     Objectives: ${scene.objectives?.length || 0}`);
          console.log(`     Challenges: ${scene.challenges?.length || 0}`);
        });
      }

      console.log('\n🎉 Adventure generation test PASSED!');
      console.log('💡 The max_tokens increase to 8192 resolved the JSON truncation issue.');
      
    } catch (parseError) {
      console.log('❌ JSON parsing failed');
      console.log('📄 Raw response preview:');
      console.log(JSON.stringify(result).substring(0, 500) + '...');
      console.log('\n🔍 Parse error:', parseError instanceof Error ? parseError.message : parseError);
      
      // Check if it's truncated
      const resultStr = JSON.stringify(result);
      if (resultStr.endsWith('...') || !resultStr.includes('}')) {
        console.log('⚠️  Response appears to be truncated - may need higher max_tokens');
      }
    }

  } catch (error) {
    console.log('❌ Adventure generation failed');
    console.log('Error:', error instanceof Error ? error.message : error);
  }
}

// Run the test
testAdventureGeneration().catch(console.error);