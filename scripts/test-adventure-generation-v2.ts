#!/usr/bin/env npx tsx

/**
 * Test adventure generation with LLMServiceV2
 */

import { LLMServiceV2 } from '../server/llm-service-v2.js';

async function testAdventureGeneration() {
  console.log('🏰 Testing Adventure Generation with LLMServiceV2');
  console.log('================================================\n');

  try {
    const llmService = new LLMServiceV2();
    await llmService.initialize();

    console.log('✅ LLMServiceV2 initialized successfully');

    // Test simple adventure generation
    console.log('\n🎲 Testing simple adventure generation...');
    
    const prompt = "A mysterious tower appears overnight in the village square";
    const systemPrompt = `You are a creative Game Master. Create a short D&D 5e adventure.

Generate a JSON response with this structure:
{
  "title": "Adventure Title",
  "summary": "Brief summary",
  "scenes": [
    {
      "title": "Scene Title",
      "description": "What happens in this scene"
    }
  ],
  "npcs": [
    {
      "name": "NPC Name",
      "role": "Their role in the story"
    }
  ]
}

Keep it simple and focused.`;

    try {
      const result = await llmService.generateText(systemPrompt, prompt, {
        temperature: 0.8,
        max_tokens: 2048,
        responseFormat: 'json'
      });

      console.log('✅ Adventure generation successful!');
      console.log(`📝 Response length: ${result.length} characters`);
      
      // Try to parse as JSON
      try {
        const adventure = JSON.parse(result);
        console.log(`🏰 Adventure Title: ${adventure.title || 'No title'}`);
        console.log(`📖 Summary: ${adventure.summary || 'No summary'}`);
        console.log(`🎭 Scenes: ${adventure.scenes?.length || 0}`);
        console.log(`👥 NPCs: ${adventure.npcs?.length || 0}`);
      } catch (parseError) {
        console.log('⚠️  Response is not valid JSON, but generation worked');
        console.log(`📝 First 200 chars: ${result.substring(0, 200)}...`);
      }

    } catch (error) {
      console.log(`❌ Adventure generation failed: ${error.message}`);
    }

    console.log('\n🎉 Adventure generation test completed!');

  } catch (error) {
    console.log('❌ Test failed:', error);
    throw error;
  }
}

// Run test
testAdventureGeneration().catch(console.error);