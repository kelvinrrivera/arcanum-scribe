#!/usr/bin/env tsx

/**
 * Integration Tests for LLM Endpoints
 * Tests the actual HTTP endpoints used by the frontend
 */

import axios from 'axios';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  responseSize?: number;
}

class LLMIntegrationTester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
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

  async testServerHealth(): Promise<void> {
    await this.runTest('Server Health Check', async () => {
      try {
        const response = await axios.get(`${this.baseUrl}/health`, { timeout: 5000 });
        if (response.status !== 200) {
          throw new Error(`Server not healthy: ${response.status}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          throw new Error('Server is not running. Start with: npm run server');
        }
        throw error;
      }
    });
  }

  async testPromptEndpoint(): Promise<void> {
    await this.runTest('POST /api/generate-prompt', async () => {
      const response = await axios.post(`${this.baseUrl}/api/generate-prompt`, {
        prompt: 'Test prompt for integration test'
      }, { timeout: 15000 });

      if (response.status !== 200) {
        throw new Error(`Unexpected status: ${response.status}`);
      }

      if (!response.data || !response.data.result) {
        throw new Error('Missing result in response');
      }

      if (typeof response.data.result !== 'string' || response.data.result.length < 10) {
        throw new Error('Invalid prompt result');
      }

      this.results[this.results.length - 1].responseSize = response.data.result.length;
    });
  }

  async testCharacterEndpoint(): Promise<void> {
    await this.runTest('POST /api/generate-character', async () => {
      const response = await axios.post(`${this.baseUrl}/api/generate-character`, {
        // Empty body or character preferences could go here
      }, { timeout: 15000 });

      if (response.status !== 200) {
        throw new Error(`Unexpected status: ${response.status}`);
      }

      if (!response.data || !response.data.result) {
        throw new Error('Missing result in response');
      }

      // Character could be JSON object or formatted text
      const result = response.data.result;
      if (typeof result === 'string' && result.length < 20) {
        throw new Error('Character result too short');
      } else if (typeof result === 'object' && !result.name) {
        throw new Error('Character object missing name field');
      }

      this.results[this.results.length - 1].responseSize = JSON.stringify(result).length;
    });
  }

  async testAdventureEndpoint(): Promise<void> {
    await this.runTest('POST /api/generate-adventure', async () => {
      const response = await axios.post(`${this.baseUrl}/api/generate-adventure`, {
        theme: 'Test adventure theme',
        gameSystem: 'dnd5e',
        partyLevel: 3,
        partySize: 4
      }, { timeout: 30000 }); // Longer timeout for adventures

      if (response.status !== 200) {
        throw new Error(`Unexpected status: ${response.status}`);
      }

      if (!response.data || !response.data.result) {
        throw new Error('Missing result in response');
      }

      const result = response.data.result;
      if (typeof result === 'string' && result.length < 100) {
        throw new Error('Adventure result too short');
      } else if (typeof result === 'object' && !result.title) {
        throw new Error('Adventure object missing title field');
      }

      this.results[this.results.length - 1].responseSize = JSON.stringify(result).length;
    });
  }

  async testImageEndpoint(): Promise<void> {
    await this.runTest('POST /api/generate-image', async () => {
      const response = await axios.post(`${this.baseUrl}/api/generate-image`, {
        prompt: 'A fantasy character portrait for testing'
      }, { timeout: 30000 }); // Images can take longer

      if (response.status !== 200) {
        throw new Error(`Unexpected status: ${response.status}`);
      }

      if (!response.data || !response.data.result) {
        throw new Error('Missing result in response');
      }

      const result = response.data.result;
      if (typeof result !== 'string' || !result.startsWith('http')) {
        throw new Error('Invalid image URL result');
      }

      this.results[this.results.length - 1].responseSize = result.length;
    });
  }

  async testErrorHandling(): Promise<void> {
    await this.runTest('Error Handling - Invalid Endpoint', async () => {
      try {
        await axios.post(`${this.baseUrl}/api/nonexistent-endpoint`, {});
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // Expected 404 error
          return;
        }
        throw error;
      }
    });

    await this.runTest('Error Handling - Invalid JSON', async () => {
      try {
        await axios.post(`${this.baseUrl}/api/generate-prompt`, 'invalid json', {
          headers: { 'Content-Type': 'application/json' }
        });
        throw new Error('Should have returned 400');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          // Expected 400 error
          return;
        }
        throw error;
      }
    });
  }

  async runAllTests(): Promise<void> {
    console.log('🔗 Starting LLM Integration Tests');
    console.log('==================================\n');

    await this.testServerHealth();
    console.log('');

    if (this.results[0]?.passed) {
      await this.testPromptEndpoint();
      console.log('');
      
      await this.testCharacterEndpoint();
      console.log('');
      
      await this.testAdventureEndpoint();
      console.log('');
      
      await this.testImageEndpoint();
      console.log('');
      
      await this.testErrorHandling();
      console.log('');
    } else {
      console.log('⚠️  Skipping endpoint tests - server not available\n');
    }

    this.printSummary();
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const successRate = (passed / total * 100).toFixed(1);

    console.log('📊 INTEGRATION TEST SUMMARY');
    console.log('============================');
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
      const size = r.responseSize ? ` (${r.responseSize} chars)` : '';
      console.log(`  ${status} ${r.name}: ${r.duration}ms${size}`);
    });

    if (passed > 0) {
      console.log('\n💡 TIP: Run these tests regularly to ensure API stability');
    }
  }
}

// Run tests
async function main() {
  const tester = new LLMIntegrationTester();
  await tester.runAllTests();
  
  // Exit with error code if any tests failed
  const failed = tester['results'].filter(r => !r.passed).length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);