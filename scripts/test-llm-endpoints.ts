#!/usr/bin/env tsx

/**
 * Test script for LLM endpoints
 * Tests various LLM providers and models to ensure they work correctly
 */

import { LLMService } from '../server/llm-service';

interface TestResult {
  provider: string;
  model: string;
  test: string;
  success: boolean;
  error?: string;
  responseTime: number;
  responseLength?: number;
}

class LLMTester {
  private llmService: LLMService;
  private results: TestResult[] = [];

  constructor() {
    this.llmService = new LLMService();
  }

  async initialize() {
    await this.llmService.initialize();
  }

  async testTextGeneration() {
    console.log('🧪 Testing text generation...');
    
    const testPrompt = "Generate a short creative story about a dragon and a knight.";
    const systemPrompt = "You are a creative storyteller. Write engaging short stories.";
    
    const startTime = Date.now();
    
    try {
      const result = await this.llmService.generateText(testPrompt, systemPrompt, { 
        responseFormat: 'text',
        max_tokens: 500 
      });
      
      const responseTime = Date.now() - startTime;
      
      if (result && typeof result === 'string' && result.length > 50) {
        this.results.push({
          provider: 'Auto-selected',
          model: 'Auto-selected',
          test: 'Text Generation',
          success: true,
          responseTime,
          responseLength: result.length
        });
        console.log('✅ Text generation successful');
        console.log(`📝 Response length: ${result.length} characters`);
        console.log(`⏱️  Response time: ${responseTime}ms`);
      } else {
        throw new Error('Invalid text response');
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.results.push({
        provider: 'Auto-selected',
        model: 'Auto-selected',
        test: 'Text Generation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      });
      console.log('❌ Text generation failed:', error);
    }
  }

  async testJSONGeneration() {
    console.log('🧪 Testing JSON generation...');
    
    const testPrompt = `Generate a simple D&D character with name, class, race, and level.`;
    const systemPrompt = `You are a D&D character generator. Generate characters in valid JSON format with the following structure:
{
  "name": "character name",
  "class": "character class",
  "race": "character race", 
  "level": number
}`;
    
    const startTime = Date.now();
    
    try {
      const result = await this.llmService.generateText(testPrompt, systemPrompt, { 
        responseFormat: 'json',
        max_tokens: 500 
      });
      
      const responseTime = Date.now() - startTime;
      
      // Try to parse as JSON
      let parsedResult;
      if (typeof result === 'string') {
        parsedResult = JSON.parse(result);
      } else {
        parsedResult = result;
      }
      
      if (parsedResult && parsedResult.name && parsedResult.class && parsedResult.race && parsedResult.level) {
        this.results.push({
          provider: 'Auto-selected',
          model: 'Auto-selected',
          test: 'JSON Generation',
          success: true,
          responseTime,
          responseLength: JSON.stringify(parsedResult).length
        });
        console.log('✅ JSON generation successful');
        console.log(`📋 Generated character:`, parsedResult);
        console.log(`⏱️  Response time: ${responseTime}ms`);
      } else {
        throw new Error('Invalid JSON structure');
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.results.push({
        provider: 'Auto-selected',
        model: 'Auto-selected',
        test: 'JSON Generation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      });
      console.log('❌ JSON generation failed:', error);
    }
  }

  async testAdventureGeneration() {
    console.log('🧪 Testing adventure generation (simplified)...');
    
    const testPrompt = `Generate a simple D&D adventure about rescuing a kidnapped merchant.`;
    const systemPrompt = `You are an adventure designer. Generate a simple D&D adventure in JSON format with this structure:
{
  "title": "adventure title",
  "summary": "brief summary",
  "scenes": [
    {
      "title": "scene title",
      "description": "scene description"
    }
  ],
  "monsters": [
    {
      "name": "monster name",
      "challengeRating": "CR"
    }
  ]
}`;
    
    const startTime = Date.now();
    
    try {
      const result = await this.llmService.generateText(testPrompt, systemPrompt, { 
        responseFormat: 'json',
        max_tokens: 2048 
      });
      
      const responseTime = Date.now() - startTime;
      
      // Try to parse as JSON
      let parsedResult;
      if (typeof result === 'string') {
        parsedResult = JSON.parse(result);
      } else {
        parsedResult = result;
      }
      
      if (parsedResult && parsedResult.title && parsedResult.summary && parsedResult.scenes) {
        this.results.push({
          provider: 'Auto-selected',
          model: 'Auto-selected',
          test: 'Adventure Generation',
          success: true,
          responseTime,
          responseLength: JSON.stringify(parsedResult).length
        });
        console.log('✅ Adventure generation successful');
        console.log(`🏰 Adventure title: ${parsedResult.title}`);
        console.log(`📖 Scenes: ${parsedResult.scenes.length}`);
        console.log(`👹 Monsters: ${parsedResult.monsters?.length || 0}`);
        console.log(`⏱️  Response time: ${responseTime}ms`);
      } else {
        throw new Error('Invalid adventure structure');
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.results.push({
        provider: 'Auto-selected',
        model: 'Auto-selected',
        test: 'Adventure Generation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      });
      console.log('❌ Adventure generation failed:', error);
    }
  }

  printSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    
    console.log(`Total tests: ${totalTests}`);
    console.log(`✅ Successful: ${successfulTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.test}: ${result.error}`);
      });
    }
    
    console.log('\n⏱️  PERFORMANCE:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.test}: ${result.responseTime}ms`);
    });
  }
}

async function main() {
  console.log('🚀 Starting LLM Endpoint Tests');
  console.log('==============================\n');
  
  const tester = new LLMTester();
  
  try {
    await tester.initialize();
    console.log('✅ LLM Service initialized\n');
    
    await tester.testTextGeneration();
    console.log('');
    
    await tester.testJSONGeneration();
    console.log('');
    
    await tester.testAdventureGeneration();
    
    tester.printSummary();
    
  } catch (error) {
    console.error('💥 Test suite failed to initialize:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);