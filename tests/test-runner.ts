#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: number;
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  totalDuration: number;
  overallCoverage: number;
  suites: TestResult[];
  errors: string[];
}

class TestRunner {
  private results: TestResult[] = [];
  private errors: string[] = [];

  async runAllTests(): Promise<TestReport> {
    console.log('🚀 Starting comprehensive test suite...\n');

    const testSuites = [
      { name: 'Unit Tests - Server', pattern: 'tests/server/**/*.test.ts' },
      { name: 'Unit Tests - Frontend', pattern: 'tests/frontend/**/*.test.tsx' },
      { name: 'Unit Tests - Hooks', pattern: 'tests/hooks/**/*.test.ts' },
      { name: 'Unit Tests - Utils', pattern: 'tests/utils/**/*.test.ts' },
      { name: 'Integration Tests', pattern: 'tests/integration/**/*.test.ts' },
      { name: 'Quality Validation', pattern: 'tests/quality-validation*.test.ts' },
      { name: 'Market Differentiation', pattern: 'tests/market-differentiation*.test.ts' },
      { name: 'Existing Tests', pattern: 'tests/*.test.ts' }
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite.name, suite.pattern);
    }

    return this.generateReport();
  }

  private async runTestSuite(suiteName: string, pattern: string): Promise<void> {
    console.log(`📋 Running ${suiteName}...`);
    
    try {
      const startTime = Date.now();
      
      // Check if test files exist for this pattern
      const testFiles = this.findTestFiles(pattern);
      if (testFiles.length === 0) {
        console.log(`⚠️  No test files found for pattern: ${pattern}`);
        return;
      }

      const command = `npx vitest run ${pattern} --reporter=json --coverage`;
      const output = execSync(command, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const duration = Date.now() - startTime;
      const result = this.parseTestOutput(output, suiteName, duration);
      this.results.push(result);

      console.log(`✅ ${suiteName}: ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped (${duration}ms)`);
      
    } catch (error: any) {
      const duration = Date.now() - Date.now();
      console.log(`❌ ${suiteName}: Failed to run tests`);
      
      this.errors.push(`${suiteName}: ${error.message}`);
      this.results.push({
        suite: suiteName,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration,
        coverage: 0
      });
    }
  }

  private findTestFiles(pattern: string): string[] {
    try {
      const glob = require('glob');
      return glob.sync(pattern);
    } catch {
      // Fallback to simple file existence check
      const testDir = pattern.split('**')[0];
      if (fs.existsSync(testDir)) {
        return fs.readdirSync(testDir, { recursive: true })
          .filter((file: any) => file.toString().endsWith('.test.ts') || file.toString().endsWith('.test.tsx'))
          .map((file: any) => path.join(testDir, file.toString()));
      }
      return [];
    }
  }

  private parseTestOutput(output: string, suiteName: string, duration: number): TestResult {
    try {
      // Try to parse JSON output from vitest
      const lines = output.split('\n');
      const jsonLine = lines.find(line => line.startsWith('{') && line.includes('testResults'));
      
      if (jsonLine) {
        const result = JSON.parse(jsonLine);
        return {
          suite: suiteName,
          passed: result.numPassedTests || 0,
          failed: result.numFailedTests || 0,
          skipped: result.numPendingTests || 0,
          duration,
          coverage: this.extractCoverage(output)
        };
      }
    } catch (error) {
      // Fallback to parsing text output
    }

    // Fallback parsing
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    const skippedMatch = output.match(/(\d+) skipped/);

    return {
      suite: suiteName,
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      skipped: skippedMatch ? parseInt(skippedMatch[1]) : 0,
      duration,
      coverage: this.extractCoverage(output)
    };
  }

  private extractCoverage(output: string): number {
    const coverageMatch = output.match(/All files\s+\|\s+([\d.]+)/);
    return coverageMatch ? parseFloat(coverageMatch[1]) : 0;
  }

  private generateReport(): TestReport {
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const avgCoverage = this.results.reduce((sum, r) => sum + (r.coverage || 0), 0) / this.results.length;

    return {
      timestamp: new Date().toISOString(),
      totalTests: totalPassed + totalFailed + totalSkipped,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalDuration,
      overallCoverage: avgCoverage,
      suites: this.results,
      errors: this.errors
    };
  }

  async generateHTMLReport(report: TestReport): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arcanum Scribe - Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { text-align: center; padding: 20px; border-radius: 8px; }
        .metric.passed { background: #d4edda; color: #155724; }
        .metric.failed { background: #f8d7da; color: #721c24; }
        .metric.skipped { background: #fff3cd; color: #856404; }
        .metric.coverage { background: #cce5ff; color: #004085; }
        .metric h3 { margin: 0; font-size: 2em; }
        .metric p { margin: 5px 0 0 0; font-weight: 500; }
        .suites { padding: 0 30px 30px 30px; }
        .suite { margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .suite-header { background: #f8f9fa; padding: 15px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
        .suite-stats { display: flex; gap: 15px; font-size: 0.9em; }
        .stat { padding: 4px 8px; border-radius: 4px; font-weight: 500; }
        .stat.passed { background: #d4edda; color: #155724; }
        .stat.failed { background: #f8d7da; color: #721c24; }
        .stat.skipped { background: #fff3cd; color: #856404; }
        .errors { padding: 0 30px 30px 30px; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin-bottom: 10px; color: #721c24; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #e0e0e0; }
        .progress-bar { width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 10px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧙‍♂️ Arcanum Scribe Test Report</h1>
            <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(report.totalPassed / report.totalTests) * 100}%"></div>
            </div>
        </div>
        
        <div class="summary">
            <div class="metric passed">
                <h3>${report.totalPassed}</h3>
                <p>Tests Passed</p>
            </div>
            <div class="metric failed">
                <h3>${report.totalFailed}</h3>
                <p>Tests Failed</p>
            </div>
            <div class="metric skipped">
                <h3>${report.totalSkipped}</h3>
                <p>Tests Skipped</p>
            </div>
            <div class="metric coverage">
                <h3>${report.overallCoverage.toFixed(1)}%</h3>
                <p>Code Coverage</p>
            </div>
        </div>

        <div class="suites">
            <h2>Test Suites</h2>
            ${report.suites.map(suite => `
                <div class="suite">
                    <div class="suite-header">
                        <span>${suite.suite}</span>
                        <div class="suite-stats">
                            <span class="stat passed">${suite.passed} passed</span>
                            ${suite.failed > 0 ? `<span class="stat failed">${suite.failed} failed</span>` : ''}
                            ${suite.skipped > 0 ? `<span class="stat skipped">${suite.skipped} skipped</span>` : ''}
                            <span>${suite.duration}ms</span>
                            ${suite.coverage ? `<span>${suite.coverage.toFixed(1)}% coverage</span>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        ${report.errors.length > 0 ? `
            <div class="errors">
                <h2>Errors</h2>
                ${report.errors.map(error => `<div class="error">${error}</div>`).join('')}
            </div>
        ` : ''}

        <div class="footer">
            <p>Total execution time: ${(report.totalDuration / 1000).toFixed(2)} seconds</p>
            <p>Arcanum Scribe - AI-powered TTRPG Adventure Generator</p>
        </div>
    </div>
</body>
</html>`;

    const reportPath = path.join(process.cwd(), 'test-report.html');
    fs.writeFileSync(reportPath, html);
    console.log(`📊 HTML report generated: ${reportPath}`);
  }

  async generateJSONReport(report: TestReport): Promise<void> {
    const reportPath = path.join(process.cwd(), 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 JSON report generated: ${reportPath}`);
  }

  printSummary(report: TestReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('🧙‍♂️ ARCANUM SCRIBE TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.totalPassed}`);
    console.log(`❌ Failed: ${report.totalFailed}`);
    console.log(`⏭️  Skipped: ${report.totalSkipped}`);
    console.log(`📈 Coverage: ${report.overallCoverage.toFixed(1)}%`);
    console.log(`⏱️  Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    if (report.totalFailed === 0) {
      console.log('🎉 All tests passed! System is ready for production.');
    } else {
      console.log(`⚠️  ${report.totalFailed} test(s) failed. Please review and fix.`);
    }

    if (report.overallCoverage < 80) {
      console.log(`📉 Code coverage is below 80%. Consider adding more tests.`);
    } else {
      console.log(`📈 Excellent code coverage!`);
    }
  }
}

// Main execution
async function main() {
  const runner = new TestRunner();
  
  try {
    const report = await runner.runAllTests();
    
    await runner.generateHTMLReport(report);
    await runner.generateJSONReport(report);
    runner.printSummary(report);
    
    // Exit with error code if tests failed
    process.exit(report.totalFailed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { TestRunner };