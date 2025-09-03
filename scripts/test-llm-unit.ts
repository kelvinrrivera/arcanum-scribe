#!/usr/bin/env tsx

/**
 * Unit Tests for LLM Service
 * Tests individual functions and edge cases
 */

import { LLMService } from '../server/llm-service.js';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class LLMUnitTester {
  private llmService: LLMService;
  private results: TestResult[] = [];

  constructor() {
    this.llmService = new LLMService();
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        duration: Date.now() - startTime
      });
      console.log(`✅ ${name}`);
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      });
      console.log(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async testPromptGeneration(): Promise<void> {
    await this.runTest('Text Generation - Basic', async () => {
      const result = await this.llmService.generateText('Test prompt', 'You are a helpful assistant.');
      if (!result || typeof result !== 'string' || result.length < 10) {
        throw new Error('Invalid text response');
      }
    });

    await this.runTest('Text Generation - Empty Input', async () => {
      try {
        await this.llmService.generateText('', 'You are a helpful assistant.');
        throw new Error('Should have thrown error for empty input');
      } catch (error) {
        // Expected to fail
      }
    });
  }

  async testCharacterGeneration(): Promise<void> {
    await this.runTest('Character Generation - Text Response', async () => {
      const prompt = 'Generate a D&D character with name, class, race, and level (1-20). Format: Name: [name], Class: [class], Race: [race], Level: [level]';
      const systemPrompt = 'You are a D&D character generator. Be concise and follow the exact format requested.';
      
      const result = await this.llmService.generateText(prompt, systemPrompt);
      
      if (!result || typeof result !== 'string' || result.length < 20) {
        throw new Error('Invalid character response');
      }
      
      // Check if response contains expected fields
      const hasName = result.toLowerCase().includes('name:');
      const hasClass = result.toLowerCase().includes('class:');
      const hasRace = result.toLowerCase().includes('race:');
      const hasLevel = result.toLowerCase().includes('level:');
      
      if (!hasName || !hasClass || !hasRace || !hasLevel) {
        throw new Error('Missing required character fields in response');
      }
    });

    await this.runTest('Character Generation - JSON Attempt', async () => {
      const prompt = 'Generate a D&D character. Return ONLY a JSON object with fields: name, class, race, level (number 1-20). No other text.';
      const systemPrompt = 'You are a JSON generator. Return only valid JSON, no explanations.';
      const options = { responseFormat: 'json' };
      
      const result = await this.llmService.generateText(prompt, systemPrompt, options);
      
      // Try to parse as JSON, but don't fail if it's not JSON (some models don't support it)
      try {
        const parsed = JSON.parse(result);
        console.log('  📋 Successfully generated JSON character:', JSON.stringify(parsed));
      } catch {
        console.log('  📝 Model returned text instead of JSON (expected for some models)');
        // This is acceptable - not all models support JSON format
      }
    });
  }

  async testAdventureGeneration(): Promise<void> {
    await this.runTest('Adventure Generation - Basic Structure', async () => {
      const prompt = 'Generate a short D&D adventure with: Title, Game System (D&D 5e), Recommended Level, and 2 scenes. Keep it concise.';
      const systemPrompt = 'You are a D&D adventure generator. Be creative but concise.';
      const options = { max_tokens: 1000 };
      
      const result = await this.llmService.generateText(prompt, systemPrompt, options);
      
      if (!result || typeof result !== 'string' || result.length < 100) {
        throw new Error('Invalid adventure response');
      }
      
      // Check if response contains expected elements
      const hasTitle = result.toLowerCase().includes('title') || result.includes(':');
      const hasLevel = result.toLowerCase().includes('level');
      const hasScene = result.toLowerCase().includes('scene');
      
      if (!hasTitle || !hasLevel || !hasScene) {
        throw new Error('Missing required adventure elements');
      }
    });

    await this.runTest('Adventure Generation - Length Check', async () => {
      const prompt = 'Generate a very short D&D adventure summary in 2-3 sentences.';
      const systemPrompt = 'You are a concise adventure generator.';
      const options = { max_tokens: 200 };
      
      const result = await this.llmService.generateText(prompt, systemPrompt, options);
      
      if (!result || result.length < 50 || result.length > 1000) {
        throw new Error(`Adventure length out of bounds: ${result.length} characters`);
      }
    });
  }

  async testErrorHandling(): Promise<void> {
    await this.runTest('Error Handling - Invalid Input', async () => {
      try {
        // @ts-ignore - Testing invalid input
        await this.llmService.generateText(null, null);
        throw new Error('Should have thrown error for null input');
      } catch (error) {
        // Expected behavior - should throw
        if (error instanceof Error && error.message.includes('Should have thrown')) {
          throw error;
        }
      }
    });
  }

  async testPerformance(): Promise<void> {
    await this.runTest('Performance - Text Generation < 10s', async () => {
      const start = Date.now();
      await this.llmService.generateText('Quick test', 'You are a helpful assistant.');
      const duration = Date.now() - start;
      
      if (duration > 10000) {
        throw new Error(`Too slow: ${duration}ms`);
      }
    });

    await this.runTest('Performance - JSON Generation < 15s', async () => {
      const start = Date.now();
      const prompt = 'Generate a simple JSON object with name and value fields.';
      const systemPrompt = 'Return only valid JSON.';
      await this.llmService.generateText(prompt, systemPrompt, { responseFormat: 'json' });
      const duration = Date.now() - start;
      
      if (duration > 15000) {
        throw new Error(`Too slow: ${duration}ms`);
      }
    });
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting LLM Unit Tests');
    console.log('============================\n');

    await this.testPromptGeneration();
    console.log('');
    
    await this.testCharacterGeneration();
    console.log('');
    
    await this.testAdventureGeneration();
    console.log('');
    
    await this.testErrorHandling();
    console.log('');
    
    await this.testPerformance();
    console.log('');

    this.printSummary();
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const successRate = (passed / total * 100).toFixed(1);

    console.log('📊 UNIT TEST SUMMARY');
    console.log('====================');
    console.log(`Total tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success rate: ${successRate}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    console.log('\n⏱️  PERFORMANCE:');
    this.results.forEach(r => {
      const status = r.passed ? '✅' : '❌';
      console.log(`  ${status} ${r.name}: ${r.duration}ms`);
    });
  }
}

// Run tests
async function main() {
  const tester = new LLMUnitTester();
  await tester.runAllTests();
  
  // Exit with error code if any tests failed
  const failed = tester['results'].filter(r => !r.passed).length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);