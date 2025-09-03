#!/usr/bin/env npx tsx

/**
 * Test the new Vercel AI SDK implementation
 */

import { LLMServiceV2 } from '../server/llm-service-v2.js';

async function testVercelAISDK() {
  console.log('🧪 Testing Vercel AI SDK Implementation');
  console.log('=====================================\n');

  const llmService = new LLMServiceV2();

  try {
    // Test 1: List available models
    console.log('📋 Test 1: Getting available models...');
    const models = await llmService.getAvailableModels();
    console.log(`   Found ${models.length} models:`);
    models.forEach((model: any) => {
      console.log(`   - ${model.display_name} (${model.model_name}) - ${model.provider_type}`);
    });

    // Test 2: Simple text generation with each provider
    console.log('\n🤖 Test 2: Testing text generation...');
    
    const testPrompt = "Write a very short story about a magical library in exactly 2 sentences.";
    
    // Test Anthropic
    try {
      console.log('\n   Testing Anthropic (Claude)...');
      const claudeModel = models.find((m: any) => m.provider_type === 'anthropic');
      if (claudeModel) {
        const claudeResponse = await llmService.generateSimpleText(testPrompt, {
          model: claudeModel.model_name,
          max_tokens: 100,
          temperature: 0.7
        });
        console.log(`   ✅ Claude Response: ${claudeResponse.slice(0, 100)}...`);
      } else {
        console.log('   ⚠️  No Anthropic model found');
      }
    } catch (error) {
      console.log(`   ❌ Claude failed: ${error.message}`);
    }

    // Test OpenAI
    try {
      console.log('\n   Testing OpenAI (GPT)...');
      const gptModel = models.find((m: any) => m.provider_type === 'openai');
      if (gptModel) {
        const gptResponse = await llmService.generateSimpleText(testPrompt, {
          model: gptModel.model_name,
          max_tokens: 100,
          temperature: 0.7
        });
        console.log(`   ✅ GPT Response: ${gptResponse.slice(0, 100)}...`);
      } else {
        console.log('   ⚠️  No OpenAI model found');
      }
    } catch (error) {
      console.log(`   ❌ GPT failed: ${error.message}`);
    }

    // Test Google
    try {
      console.log('\n   Testing Google (Gemini)...');
      const geminiModel = models.find((m: any) => m.provider_type === 'google');
      if (geminiModel) {
        const geminiResponse = await llmService.generateSimpleText(testPrompt, {
          model: geminiModel.model_name,
          max_tokens: 100,
          temperature: 0.7
        });
        console.log(`   ✅ Gemini Response: ${geminiResponse.slice(0, 100)}...`);
      } else {
        console.log('   ⚠️  No Google model found');
      }
    } catch (error) {
      console.log(`   ❌ Gemini failed: ${error.message}`);
    }

    // Test 3: Structured generation (adventure)
    console.log('\n🏰 Test 3: Testing structured adventure generation...');
    try {
      const adventure = await llmService.generateAdventure({
        theme: 'magical forest',
        difficulty: 'easy',
        length: 'short'
      });
      
      console.log('   ✅ Adventure generated successfully!');
      console.log(`   Title: ${adventure.title}`);
      console.log(`   Setting: ${adventure.setting}`);
      console.log(`   Characters: ${adventure.characters.length}`);
      console.log(`   Scenes: ${adventure.scenes.length}`);
    } catch (error) {
      console.log(`   ❌ Adventure generation failed: ${error.message}`);
    }

    console.log('\n🎉 Vercel AI SDK testing completed!');

  } catch (error) {
    console.log('❌ Test failed:', error);
    throw error;
  }
}

// Run tests
testVercelAISDK().catch(console.error);