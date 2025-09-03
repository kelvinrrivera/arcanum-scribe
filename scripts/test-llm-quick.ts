#!/usr/bin/env tsx

/**
 * Quick LLM Test Suite
 * Runs unit and endpoint tests (no server required)
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
  console.log('⚡ Quick LLM Test Suite');
  console.log('======================');
  console.log('Running essential LLM tests (no server required)...\n');

  const results: boolean[] = [];
  
  for (const suite of testSuites) {
    const success = await runTestSuite(suite);
    results.push(success);
  }

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  const failed = total - passed;

  console.log('\n📊 QUICK TEST SUMMARY');
  console.log('=====================');
  console.log(`Total test suites: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success rate: ${(passed / total * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All essential LLM tests passed!');
    console.log('💡 Your LLM service is working correctly.');
    console.log('🔗 Run "npm run test:llm-integration" with server running for full coverage.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);