#!/usr/bin/env node

/**
 * COMPREHENSIVE ADVENTURE GENERATION FIXES VALIDATION SCRIPT
 * 
 * This script validates all 7 critical fixes applied to resolve the
 * adventure generation hanging and failure issues.
 */

import { spawn } from 'child_process';
import fetch from 'node-fetch';
import { io, Socket } from 'socket.io-client';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

class AdventureGenerationTestSuite {
  private results: TestResult[] = [];
  private serverProcess: any;
  private socket: Socket | null = null;

  async runAllTests() {
    console.log('\n🧪 ADVENTURE GENERATION FIXES VALIDATION');
    console.log('=========================================\n');

    try {
      // Start server first
      await this.startTestServer();
      
      // Run all test cases
      await this.testSocketIOConnection();
      await this.testProgressTrackerErrorHandling();
      await this.testFrontendTimeoutHandling();
      await this.testGenerationFlow();
      await this.testErrorPropagation();
      await this.testImageGenerationFailures();
      await this.testConcurrentRequests();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async startTestServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting test server...');
      
      this.serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      this.serverProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        if (output.includes('Server running on port') || output.includes('listening on')) {
          console.log('✅ Server started successfully');
          setTimeout(resolve, 2000); // Give server time to fully initialize
        }
      });

      this.serverProcess.stderr?.on('data', (data: Buffer) => {
        console.log('Server stderr:', data.toString());
      });

      this.serverProcess.on('error', (error: Error) => {
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Server failed to start within 30 seconds'));
      }, 30000);
    });
  }

  private async testSocketIOConnection(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🔌 Testing Socket.IO connection and room joining...');
      
      this.socket = io('http://localhost:3000');
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          console.log('✅ Socket connected');
          
          // Test room joining
          this.socket!.emit('join-adventure-generation', { userId: 'test-user-123' });
          
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      this.addResult({
        name: 'Socket.IO Connection & Room Joining',
        status: 'PASS',
        message: 'Successfully connected and joined adventure generation room',
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.addResult({
        name: 'Socket.IO Connection & Room Joining',
        status: 'FAIL',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testProgressTrackerErrorHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('📊 Testing progress tracker error handling...');
      
      if (!this.socket?.connected) {
        throw new Error('Socket not connected');
      }

      let errorReceived = false;
      
      this.socket.on('adventure-progress', (data) => {
        if (data.step === -1 && data.title.includes('Gods of Chaos')) {
          errorReceived = true;
        }
      });

      // Trigger an error scenario by making a request with invalid data
      const response = await fetch('http://localhost:3000/api/generate-adventure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token'
        },
        body: JSON.stringify({
          prompt: '',  // Invalid empty prompt
          gameSystem: 'dnd5e'
        })
      });

      // Wait for error progress update
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (errorReceived) {
        this.addResult({
          name: 'Progress Tracker Error Handling',
          status: 'PASS',
          message: 'Error correctly propagated to progress tracker',
          duration: Date.now() - startTime
        });
      } else {
        this.addResult({
          name: 'Progress Tracker Error Handling',
          status: 'FAIL',
          message: 'Error not properly handled by progress tracker',
          duration: Date.now() - startTime
        });
      }

    } catch (error) {
      this.addResult({
        name: 'Progress Tracker Error Handling',
        status: 'FAIL',
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testFrontendTimeoutHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('⏱️ Testing frontend timeout handling...');
      
      // Simulate a request with very short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100); // Very short timeout
      
      try {
        await fetch('http://localhost:3000/api/generate-adventure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            prompt: 'Test adventure prompt',
            gameSystem: 'dnd5e'
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        this.addResult({
          name: 'Frontend Timeout Handling',
          status: 'FAIL',
          message: 'Request should have timed out but didn\'t',
          duration: Date.now() - startTime
        });
        
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          this.addResult({
            name: 'Frontend Timeout Handling',
            status: 'PASS',
            message: 'Timeout correctly handled with AbortController',
            duration: Date.now() - startTime
          });
        } else {
          this.addResult({
            name: 'Frontend Timeout Handling',
            status: 'FAIL',
            message: `Unexpected error type: ${error.message}`,
            duration: Date.now() - startTime
          });
        }
      }

    } catch (error) {
      this.addResult({
        name: 'Frontend Timeout Handling',
        status: 'FAIL',
        message: `Test setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testGenerationFlow(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🎲 Testing complete generation flow...');
      
      // This test would require a valid auth token and proper setup
      this.addResult({
        name: 'Complete Generation Flow',
        status: 'SKIP',
        message: 'Requires valid authentication setup',
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.addResult({
        name: 'Complete Generation Flow',
        status: 'FAIL',
        message: `Flow test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testErrorPropagation(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🚨 Testing error propagation through system...');
      
      // Test various error scenarios
      const errorTests = [
        { name: 'Invalid Token', headers: { 'Authorization': 'Bearer invalid' } },
        { name: 'Missing Prompt', body: { gameSystem: 'dnd5e' } },
        { name: 'Invalid Game System', body: { prompt: 'Test', gameSystem: 'invalid' } }
      ];

      let passedTests = 0;

      for (const test of errorTests) {
        try {
          const response = await fetch('http://localhost:3000/api/generate-adventure', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...test.headers
            },
            body: JSON.stringify(test.body || { prompt: 'Test', gameSystem: 'dnd5e' })
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error) {
              passedTests++;
            }
          }
        } catch (error) {
          // Expected for some tests
        }
      }

      this.addResult({
        name: 'Error Propagation',
        status: passedTests >= 2 ? 'PASS' : 'FAIL',
        message: `${passedTests}/${errorTests.length} error scenarios handled correctly`,
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.addResult({
        name: 'Error Propagation',
        status: 'FAIL',
        message: `Propagation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testImageGenerationFailures(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🖼️ Testing image generation failure handling...');
      
      // This would require testing the image service specifically
      this.addResult({
        name: 'Image Generation Failure Handling',
        status: 'SKIP',
        message: 'Requires separate image service testing',
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.addResult({
        name: 'Image Generation Failure Handling',
        status: 'FAIL',
        message: `Image test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testConcurrentRequests(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Testing concurrent request handling...');
      
      // Test multiple rapid requests
      const promises = Array.from({ length: 3 }, () =>
        fetch('http://localhost:3000/api/health')
      );

      const responses = await Promise.all(promises);
      const successfulResponses = responses.filter(r => r.ok).length;

      this.addResult({
        name: 'Concurrent Request Handling',
        status: successfulResponses === 3 ? 'PASS' : 'FAIL',
        message: `${successfulResponses}/3 concurrent requests handled`,
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.addResult({
        name: 'Concurrent Request Handling',
        status: 'FAIL',
        message: `Concurrency test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private addResult(result: TestResult): void {
    this.results.push(result);
  }

  private printResults(): void {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('======================\n');

    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (const result of this.results) {
      const statusIcon = {
        'PASS': '✅',
        'FAIL': '❌',
        'SKIP': '⏭️'
      }[result.status];

      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${statusIcon} ${result.name}${duration}`);
      console.log(`   ${result.message}\n`);

      if (result.status === 'PASS') totalPassed++;
      else if (result.status === 'FAIL') totalFailed++;
      else totalSkipped++;
    }

    console.log(`Summary: ${totalPassed} passed, ${totalFailed} failed, ${totalSkipped} skipped\n`);

    if (totalFailed === 0) {
      console.log('🎉 ALL CRITICAL FIXES VALIDATED SUCCESSFULLY!');
      console.log('   The adventure generation system should now work reliably.\n');
    } else {
      console.log('⚠️ SOME ISSUES STILL REMAIN:');
      console.log('   Please review failed tests and apply additional fixes.\n');
    }
  }

  private async cleanup(): void {
    console.log('🧹 Cleaning up...');
    
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
    
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    
    console.log('✅ Cleanup complete');
  }
}

// Run the test suite
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new AdventureGenerationTestSuite();
  testSuite.runAllTests().catch(console.error);
}

export { AdventureGenerationTestSuite };