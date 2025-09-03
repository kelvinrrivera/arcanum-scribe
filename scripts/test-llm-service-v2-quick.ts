#!/usr/bin/env npx tsx

/**
 * Quick test of LLMServiceV2 compatibility
 */

import { LLMServiceV2 } from '../server/llm-service-v2.js';

async function testLLMServiceV2() {
  console.log('🧪 Testing LLMServiceV2 Compatibility');
  console.log('====================================\n');

  try {
    const llmService = new LLMServiceV2();
    await llmService.initialize();

    console.log('✅ LLMServiceV2 initialized successfully');

    // Test legacy interface (systemPrompt, prompt, options)
    console.log('\n🔄 Testing legacy interface...');
    try {
      const systemPrompt = "You are a helpful assistant.";
      const prompt = "Say hello in exactly 5 words.";
      
      const result = await llmService.generateText(systemPrompt, prompt, { 
        temperature: 0.7,
        max_tokens: 50 
      });
      
      console.log(`✅ Legacy interface works: "${result.slice(0, 50)}..."`);
    } catch (error) {
      console.log(`❌ Legacy interface failed: ${error.message}`);
    }

    // Test new interface (prompt, systemPrompt, options)
    console.log('\n🔄 Testing new interface...');
    try {
      const prompt = "Say goodbye in exactly 3 words.";
      const systemPrompt = "You are a helpful assistant.";
      
      const result = await llmService.generateText(prompt, systemPrompt, { 
        temperature: 0.7,
        max_tokens: 50,
        responseFormat: 'text'
      });
      
      console.log(`✅ New interface works: "${result.slice(0, 50)}..."`);
    } catch (error) {
      console.log(`❌ New interface failed: ${error.message}`);
    }

    console.log('\n🎉 LLMServiceV2 compatibility test completed!');

  } catch (error) {
    console.log('❌ Test failed:', error);
    throw error;
  }
}

// Run test
testLLMServiceV2().catch(console.error);