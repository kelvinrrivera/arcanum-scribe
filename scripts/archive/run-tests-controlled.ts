#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';

interface TestResult {
  name: string;
  passed: number;
  failed: number;
  total: number;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
}

class ControlledTestRunner {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧙‍♂️ ARCANUM SCRIBE - CONTROLLED TEST EXECUTION');
    console.log('='.repeat(60));

    // Test suites in order of complexity
    const testSuites = [
      {
        name: 'Validation Utils',
        command: 'npx vitest run tests/utils/validation.test.ts --config vitest.config.simple.ts',
        critical: true
      },
      {
        name: 'Auth Hooks (Simple)',
        command: 'npx vitest run tests/hooks/useAuth-simple.test.ts --config vitest.config.simple.ts',
        critical: true
      },
      {
        name: 'LLM Service',
        command: 'npx vitest run tests/server/llm-service.test.ts',
        critical: true
      },
      {
        name: 'Auth Service',
        command: 'npx vitest run tests/server/auth-service.test.ts',
        critical: true
      },
      {
        name: 'Tier Service',
        command: 'npx vitest run tests/server/tier-service.test.ts',
        critical: true
      },
      {
        name: 'Adventure Service',
        command: 'npx vitest run tests/server/adventure-service.test.ts',
        critical: true
      },
      {
        name: 'Billing Service',
        command: 'npx vitest run tests/server/billing-service.test.ts',
        critical: true
      },
      {
        name: 'Quality Validation',
        command: 'npx vitest run tests/quality-validation.test.ts',
        critical: false
      },
      {
        name: 'Market Differentiation',
        command: 'npx vitest run tests/market-differentiation-unit.test.ts',
        critical: false
      }
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite.name, suite.command, suite.critical);
      
      // Clean database between critical tests
      if (suite.critical) {
        await this.cleanDatabase();
      }
    }

    this.generateSummary();
  }

  private async runTestSuite(name: string, command: string, critical: boolean): Promise<void> {
    console.log(`\n📋 Running ${name}...`);
    
    try {
      const startTime = Date.now();
      const output = execSync(command, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const duration = Date.now() - startTime;
      const result = this.parseOutput(output, name, duration);
      this.results.push(result);

      const status = result.failed === 0 ? '✅' : '⚠️';
      console.log(`${status} ${name}: ${result.passed}/${result.total} passed (${duration}ms)`);
      
    } catch (error: any) {
      const duration = Date.now() - Date.now();
      console.log(`❌ ${name}: Failed to execute`);
      
      // Try to parse error output
      const errorOutput = error.stdout || error.stderr || '';
      const result = this.parseOutput(errorOutput, name, duration);
      result.status = 'FAIL';
      this.results.push(result);
    }
  }

  private parseOutput(output: string, name: string, duration: number): TestResult {
    // Parse vitest output
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    const totalMatch = output.match(/Tests\s+(\d+)/);

    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const total = totalMatch ? parseInt(totalMatch[1]) : passed + failed;

    return {
      name,
      passed,
      failed,
      total,
      status: failed === 0 ? 'PASS' : 'FAIL',
      duration
    };
  }

  private async cleanDatabase(): Promise<void> {
    try {
      execSync('psql -d arcanum_test -c "TRUNCATE TABLE migration_log, adventure_ratings, adventure_stats, adventures, users RESTART IDENTITY CASCADE;"', {
        stdio: 'pipe'
      });
    } catch (error) {
      // Database cleanup failed, but continue
      console.log('⚠️  Database cleanup skipped');
    }
  }

  private generateSummary(): void {
    const totalTests = this.results.reduce((sum, r) => sum + r.total, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n' + '='.repeat(60));
    console.log('🧙‍♂️ CONTROLLED TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      const percentage = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : '0.0';
      console.log(`${status} ${result.name.padEnd(25)} ${result.passed}/${result.total} (${percentage}%)`);
    });

    console.log('='.repeat(60));
    console.log(`📊 TOTAL: ${totalPassed}/${totalTests} tests passed (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
    console.log(`⏱️  Duration: ${(totalDuration/1000).toFixed(2)}s`);
    console.log(`🎯 Success Rate: ${((totalPassed/totalTests)*100).toFixed(1)}%`);

    if (totalFailed === 0) {
      console.log('🎉 ALL TESTS PASSED! System is ready for production.');
    } else {
      console.log(`⚠️  ${totalFailed} test(s) need attention.`);
    }

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        successRate: (totalPassed/totalTests)*100,
        duration: totalDuration
      },
      suites: this.results
    };

    fs.writeFileSync('controlled-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📋 Detailed report saved to: controlled-test-report.json');
  }
}

// Main execution
async function main() {
  const runner = new ControlledTestRunner();
  await runner.runAllTests();
}

// Execute if this is the main module
main().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});