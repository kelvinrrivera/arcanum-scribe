#!/usr/bin/env tsx

/**
 * Master LLM Test Suite
 * Runs all LLM-related tests in sequence
 */

import { execSync } from 'child_process';

interface TestSuite {
  name: string;
  command: string;
  description: string;
}

const testSuites: TestSuite[] = [
  {
    name: 'Unit Tests',
    command: 'npm run test:llm-unit',
    description: 'Tests individual LLM service functions'
  },
  {
    name: 'Endpoint Tests',
    command: 'npm run test:llm',
    description: 'Tests LLM endpoints with sample data'
  },
  {
    name: 'Integration Tests',
    command: 'npm run test:llm-integration',
    description: 'Tests HTTP API endpoints (requires server running)'
  }
];

async function runTestSuite(suite: TestSuite): Promise<boolean> {
  console.log(`\n🧪 Running ${suite.name}`);
  console.log(`📝 ${suite.description}`);
  console.log('─'.repeat(50));
  
  try {
    execSync(suite.command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${suite.name} completed successfully`);
    return true;
  } catch (error) {
    console.log(`❌ ${suite.name} failed`);
    return false;
  }
}

async function main() {
  console.log('🚀 LLM Test Suite Runner');
  console.log('========================');
  console.log('Running comprehensive LLM tests...\n');

  const results: boolean[] = [];
  
  for (const suite of testSuites) {
    const success = await runTestSuite(suite);
    results.push(success);
  }

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  const failed = total - passed;

  console.log('\n📊 OVERALL TEST SUMMARY');
  console.log('========================');
  console.log(`Total test suites: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success rate: ${(passed / total * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All LLM tests passed! Your LLM integration is working perfectly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
    
    if (results[2] === false) {
      console.log('\n💡 TIP: Integration tests require the server to be running.');
      console.log('   Start the server with: npm run server');
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);