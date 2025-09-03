#!/usr/bin/env node

/**
 * Simple test script to verify LLM prompt generation works
 * This tests the core LLM functionality without requiring authentication
 */

const path = require('path');
const { LLMService } = require('../server/llm-service.ts');

async function testLLMPromptGeneration() {
  console.log('🧪 Testing LLM prompt generation functionality...\n');

  try {
    // Initialize LLM service
    console.log('🔧 Initializing LLM service...');
    const llmService = new LLMService();
    await llmService.initialize();
    console.log('✅ LLM service initialized successfully\n');

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

    const userPrompt = `Generate a completely unique and original adventure prompt for a tabletop RPG. Make it creative, atmospheric, and unlike anything commonly seen in fantasy adventures. Include specific details about locations, conflicts, and mysterious elements that would make players excited to explore this scenario.`;

    console.log('🎲 Generating adventure prompt using LLM...');
    
    const generatedPrompt = await llmService.generateText(userPrompt, systemPrompt);

    if (!generatedPrompt || generatedPrompt.trim().length === 0) {
      throw new Error('LLM failed to generate a valid prompt');
    }

    console.log('✅ Prompt generated successfully!\n');
    console.log('📝 Generated Adventure Prompt:');
    console.log('═'.repeat(80));
    console.log(generatedPrompt.trim());
    console.log('═'.repeat(80));
    console.log(`\n📊 Stats:`);
    console.log(`   Length: ${generatedPrompt.trim().length} characters`);
    console.log(`   Word count: ~${generatedPrompt.trim().split(' ').length} words`);
    
    console.log('\n🎉 SUCCESS: Divine Inspiration LLM functionality is working!');
    console.log('The function should now generate unique prompts instead of rotating through fixed ones.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Make sure your .env file has the correct LLM API keys');
    console.log('2. Check that your LLM service configuration is correct');
    console.log('3. Verify network connectivity to your LLM provider');
    console.log('4. Check server logs for more detailed error information');
  }
}

// Run the test
testLLMPromptGeneration();