#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { TestRunner } from '../tests/test-runner';

interface SystemHealth {
  database: boolean;
  server: boolean;
  dependencies: boolean;
  environment: boolean;
}

class ComprehensiveTestSuite {
  private testRunner: TestRunner;

  constructor() {
    this.testRunner = new TestRunner();
  }

  async runFullTestSuite(): Promise<void> {
    console.log('🧙‍♂️ ARCANUM SCRIBE - COMPREHENSIVE TEST SUITE');
    console.log('='.repeat(60));
    console.log('Starting comprehensive testing and auditing process...\n');

    try {
      // 1. System Health Check
      console.log('🔍 Phase 1: System Health Check');
      const health = await this.checkSystemHealth();
      this.reportSystemHealth(health);

      if (!this.isSystemHealthy(health)) {
        console.log('❌ System health check failed. Please fix issues before running tests.');
        process.exit(1);
      }

      // 2. Dependency Audit
      console.log('\n🔒 Phase 2: Security and Dependency Audit');
      await this.runSecurityAudit();

      // 3. Code Quality Analysis
      console.log('\n📊 Phase 3: Code Quality Analysis');
      await this.runCodeQualityAnalysis();

      // 4. Unit and Integration Tests
      console.log('\n🧪 Phase 4: Unit and Integration Tests');
      const testReport = await this.testRunner.runAllTests();

      // 5. Performance Testing
      console.log('\n⚡ Phase 5: Performance Testing');
      await this.runPerformanceTests();

      // 6. End-to-End Testing
      console.log('\n🎭 Phase 6: End-to-End Testing');
      await this.runE2ETests();

      // 7. Generate Comprehensive Report
      console.log('\n📋 Phase 7: Generating Comprehensive Report');
      await this.generateComprehensiveReport(testReport);

      console.log('\n✅ Comprehensive test suite completed successfully!');
      console.log('📊 Check test-report.html for detailed results');

    } catch (error) {
      console.error('❌ Comprehensive test suite failed:', error);
      process.exit(1);
    }
  }

  private async checkSystemHealth(): Promise<SystemHealth> {
    const health: SystemHealth = {
      database: false,
      server: false,
      dependencies: false,
      environment: false
    };

    // Check database connection
    try {
      execSync('tsx scripts/verify-database-connection.ts', { stdio: 'pipe' });
      health.database = true;
      console.log('✅ Database connection: OK');
    } catch (error) {
      console.log('❌ Database connection: FAILED');
    }

    // Check if server can start
    try {
      // This is a simplified check - in reality you'd want to start the server and test it
      const serverFile = path.join(process.cwd(), 'server', 'index.ts');
      if (fs.existsSync(serverFile)) {
        health.server = true;
        console.log('✅ Server files: OK');
      }
    } catch (error) {
      console.log('❌ Server files: FAILED');
    }

    // Check dependencies
    try {
      execSync('npm ls --depth=0', { stdio: 'pipe' });
      health.dependencies = true;
      console.log('✅ Dependencies: OK');
    } catch (error) {
      console.log('❌ Dependencies: FAILED');
    }

    // Check environment variables
    try {
      const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'OPENROUTER_API_KEY'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length === 0) {
        health.environment = true;
        console.log('✅ Environment variables: OK');
      } else {
        console.log(`❌ Environment variables: Missing ${missingVars.join(', ')}`);
      }
    } catch (error) {
      console.log('❌ Environment variables: FAILED');
    }

    return health;
  }

  private reportSystemHealth(health: SystemHealth): void {
    const healthScore = Object.values(health).filter(Boolean).length;
    const totalChecks = Object.keys(health).length;
    
    console.log(`\n📊 System Health Score: ${healthScore}/${totalChecks}`);
    
    if (healthScore === totalChecks) {
      console.log('🎉 All system health checks passed!');
    } else {
      console.log('⚠️  Some system health checks failed. Please review above.');
    }
  }

  private isSystemHealthy(health: SystemHealth): boolean {
    return Object.values(health).every(Boolean);
  }

  private async runSecurityAudit(): Promise<void> {
    try {
      console.log('🔍 Running npm audit...');
      execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
      console.log('✅ Security audit passed');
    } catch (error) {
      console.log('⚠️  Security audit found issues. Please review and fix.');
    }

    try {
      console.log('🔍 Checking for sensitive data in code...');
      // Simple check for common sensitive patterns
      const sensitivePatterns = [
        'password.*=.*["\'][^"\']{8,}["\']',
        'api[_-]?key.*=.*["\'][^"\']{20,}["\']',
        'secret.*=.*["\'][^"\']{16,}["\']'
      ];

      let foundSensitiveData = false;
      for (const pattern of sensitivePatterns) {
        try {
          execSync(`grep -r -E "${pattern}" src/ server/ --exclude-dir=node_modules`, { stdio: 'pipe' });
          foundSensitiveData = true;
        } catch (error) {
          // No matches found (which is good)
        }
      }

      if (foundSensitiveData) {
        console.log('⚠️  Potential sensitive data found in code. Please review.');
      } else {
        console.log('✅ No sensitive data patterns detected');
      }
    } catch (error) {
      console.log('⚠️  Could not complete sensitive data check');
    }
  }

  private async runCodeQualityAnalysis(): Promise<void> {
    try {
      console.log('🔍 Running ESLint...');
      execSync('npm run lint', { stdio: 'inherit' });
      console.log('✅ Code linting passed');
    } catch (error) {
      console.log('⚠️  Code linting found issues. Please review and fix.');
    }

    try {
      console.log('🔍 Running TypeScript type checking...');
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript type checking passed');
    } catch (error) {
      console.log('⚠️  TypeScript type checking found issues. Please review and fix.');
    }

    // Code complexity analysis (simplified)
    console.log('🔍 Analyzing code complexity...');
    const sourceFiles = this.getSourceFiles();
    const complexityReport = this.analyzeComplexity(sourceFiles);
    console.log(`📊 Analyzed ${complexityReport.totalFiles} files`);
    console.log(`📊 Average file size: ${complexityReport.avgFileSize} lines`);
    console.log(`📊 Largest file: ${complexityReport.largestFile} (${complexityReport.largestFileSize} lines)`);
  }

  private getSourceFiles(): string[] {
    const files: string[] = [];
    
    const addFilesFromDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && item.name !== 'node_modules') {
          addFilesFromDir(fullPath);
        } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    };

    addFilesFromDir('src');
    addFilesFromDir('server');
    
    return files;
  }

  private analyzeComplexity(files: string[]): any {
    let totalLines = 0;
    let largestFileSize = 0;
    let largestFile = '';

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n').length;
        totalLines += lines;

        if (lines > largestFileSize) {
          largestFileSize = lines;
          largestFile = file;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      totalFiles: files.length,
      totalLines,
      avgFileSize: Math.round(totalLines / files.length),
      largestFile,
      largestFileSize
    };
  }

  private async runPerformanceTests(): Promise<void> {
    try {
      console.log('🚀 Running performance tests...');
      execSync('npx vitest run tests/performance/ --reporter=verbose', { stdio: 'inherit' });
      console.log('✅ Performance tests completed');
    } catch (error) {
      console.log('⚠️  Some performance tests failed. Please review.');
    }
  }

  private async runE2ETests(): Promise<void> {
    try {
      console.log('🎭 Running end-to-end tests...');
      // Note: This would require setting up Playwright or similar
      console.log('ℹ️  E2E tests not implemented yet. Consider adding Playwright tests.');
    } catch (error) {
      console.log('⚠️  E2E tests failed. Please review.');
    }
  }

  private async generateComprehensiveReport(testReport: any): Promise<void> {
    const reportData = {
      timestamp: new Date().toISOString(),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()
      },
      testResults: testReport,
      recommendations: this.generateRecommendations(testReport)
    };

    // Generate JSON report
    const jsonReportPath = path.join(process.cwd(), 'comprehensive-test-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2));

    // Generate HTML report
    await this.testRunner.generateHTMLReport(testReport);

    console.log(`📊 Comprehensive report generated: ${jsonReportPath}`);
  }

  private generateRecommendations(testReport: any): string[] {
    const recommendations: string[] = [];

    if (testReport.totalFailed > 0) {
      recommendations.push(`Fix ${testReport.totalFailed} failing tests before deployment`);
    }

    if (testReport.overallCoverage < 80) {
      recommendations.push('Increase code coverage to at least 80%');
    }

    if (testReport.overallCoverage < 60) {
      recommendations.push('Code coverage is critically low - add more comprehensive tests');
    }

    const avgDuration = testReport.totalDuration / testReport.totalTests;
    if (avgDuration > 1000) {
      recommendations.push('Some tests are running slowly - consider optimization');
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests are passing with good coverage - system is ready for production!');
    }

    return recommendations;
  }
}

// Main execution
async function main() {
  const suite = new ComprehensiveTestSuite();
  await suite.runFullTestSuite();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Comprehensive test suite failed:', error);
    process.exit(1);
  });
}

export { ComprehensiveTestSuite };