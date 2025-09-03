import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { performance } from 'perf_hooks';

describe('Performance and Load Testing', () => {
  const baseURL = process.env.TEST_SERVER_URL || 'http://localhost:3001';
  let authTokens: string[] = [];

  beforeAll(async () => {
    // Create multiple test users for load testing
    const userPromises = Array.from({ length: 10 }, async (_, i) => {
      const userData = {
        email: `loadtest${i}@example.com`,
        username: `loaduser${i}`,
        password: 'password123'
      };

      try {
        const response = await axios.post(`${baseURL}/api/auth/register`, userData);
        return response.data.token;
      } catch (error) {
        console.warn(`Failed to create test user ${i}:`, error);
        return null;
      }
    });

    const tokens = await Promise.all(userPromises);
    authTokens = tokens.filter(token => token !== null);
  });

  afterAll(async () => {
    // Clean up test users
    // Note: In a real scenario, you'd want to clean up the test data
  });

  describe('API Response Times', () => {
    it('should respond to health check within 100ms', async () => {
      const start = performance.now();
      
      const response = await axios.get(`${baseURL}/api/health`);
      
      const duration = performance.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100);
    });

    it('should handle authentication within 500ms', async () => {
      const loginData = {
        email: 'loadtest0@example.com',
        password: 'password123'
      };

      const start = performance.now();
      
      const response = await axios.post(`${baseURL}/api/auth/login`, loginData);
      
      const duration = performance.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });

    it('should load gallery within 1000ms', async () => {
      const start = performance.now();
      
      const response = await axios.get(`${baseURL}/api/adventures/public`);
      
      const duration = performance.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous gallery requests', async () => {
      const concurrentRequests = 20;
      const requests = Array.from({ length: concurrentRequests }, () =>
        axios.get(`${baseURL}/api/adventures/public`)
      );

      const start = performance.now();
      const responses = await Promise.all(requests);
      const duration = performance.now() - start;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Average response time should be reasonable
      const avgResponseTime = duration / concurrentRequests;
      expect(avgResponseTime).toBeLessThan(2000);
    });

    it('should handle multiple simultaneous authentication requests', async () => {
      const concurrentLogins = 10;
      const loginRequests = Array.from({ length: concurrentLogins }, (_, i) => ({
        email: `loadtest${i}@example.com`,
        password: 'password123'
      }));

      const requests = loginRequests.map(loginData =>
        axios.post(`${baseURL}/api/auth/login`, loginData)
      );

      const start = performance.now();
      const responses = await Promise.allSettled(requests);
      const duration = performance.now() - start;

      // Most requests should succeed (some might fail due to rate limiting)
      const successfulResponses = responses.filter(
        result => result.status === 'fulfilled' && result.value.status === 200
      );

      expect(successfulResponses.length).toBeGreaterThan(concurrentLogins * 0.7); // At least 70% success
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not leak memory during repeated requests', async () => {
      const iterations = 100;
      const endpoint = `${baseURL}/api/adventures/public`;

      // Warm up
      await axios.get(endpoint);

      // Measure initial memory if available
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;

      // Make repeated requests
      for (let i = 0; i < iterations; i++) {
        await axios.get(endpoint);
        
        // Occasionally force garbage collection if available
        if (i % 20 === 0 && global.gc) {
          global.gc();
        }
      }

      // Measure final memory
      if (global.gc) global.gc();
      const finalMemory = process.memoryUsage?.()?.heapUsed || 0;

      // Memory increase should be reasonable (less than 50MB)
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });

  describe('Database Performance', () => {
    it('should handle database queries efficiently', async () => {
      if (authTokens.length === 0) {
        console.warn('No auth tokens available for database performance test');
        return;
      }

      const token = authTokens[0];
      const queries = [
        () => axios.get(`${baseURL}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        () => axios.get(`${baseURL}/api/adventures/public?limit=20`),
        () => axios.get(`${baseURL}/api/adventures/search?q=dragon`),
      ];

      const results = await Promise.all(
        queries.map(async (query) => {
          const start = performance.now();
          await query();
          return performance.now() - start;
        })
      );

      // All database queries should complete within reasonable time
      results.forEach(duration => {
        expect(duration).toBeLessThan(1000); // 1 second max
      });

      const avgDuration = results.reduce((sum, duration) => sum + duration, 0) / results.length;
      expect(avgDuration).toBeLessThan(500); // 500ms average
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on API endpoints', async () => {
      const rapidRequests = 50;
      const endpoint = `${baseURL}/api/adventures/public`;

      const requests = Array.from({ length: rapidRequests }, () =>
        axios.get(endpoint).catch(error => error.response)
      );

      const responses = await Promise.all(requests);

      // Some requests should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(
        response => response?.status === 429
      );

      // Should have some rate limiting after many rapid requests
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should enforce stricter rate limits on generation endpoints', async () => {
      if (authTokens.length === 0) {
        console.warn('No auth tokens available for generation rate limit test');
        return;
      }

      const token = authTokens[0];
      const generationData = {
        title: 'Rate Limit Test',
        theme: 'fantasy',
        level: 5,
        partySize: 4,
        setting: 'dungeon'
      };

      const rapidGenerations = 5;
      const requests = Array.from({ length: rapidGenerations }, () =>
        axios.post(`${baseURL}/api/adventures/generate`, generationData, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(error => error.response)
      );

      const responses = await Promise.all(requests);

      // Should have rate limiting on generation endpoint
      const rateLimitedResponses = responses.filter(
        response => response?.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Stress Testing', () => {
    it('should maintain stability under high load', async () => {
      const highLoadRequests = 100;
      const endpoints = [
        `${baseURL}/api/health`,
        `${baseURL}/api/adventures/public`,
        `${baseURL}/api/adventures/public?limit=10`,
      ];

      const requests = Array.from({ length: highLoadRequests }, (_, i) => {
        const endpoint = endpoints[i % endpoints.length];
        return axios.get(endpoint).catch(error => ({ error: true, status: error.response?.status }));
      });

      const start = performance.now();
      const responses = await Promise.all(requests);
      const duration = performance.now() - start;

      // Calculate success rate
      const successfulResponses = responses.filter(
        response => !response.error && response.status === 200
      );

      const successRate = successfulResponses.length / highLoadRequests;

      // Should maintain at least 80% success rate under high load
      expect(successRate).toBeGreaterThan(0.8);

      // Should complete within reasonable time
      expect(duration).toBeLessThan(30000); // 30 seconds max

      console.log(`Stress test results: ${successRate * 100}% success rate, ${duration.toFixed(0)}ms total duration`);
    });
  });

  describe('Adventure Generation Performance', () => {
    it('should generate adventures within acceptable time limits', async () => {
      if (authTokens.length === 0) {
        console.warn('No auth tokens available for generation performance test');
        return;
      }

      const token = authTokens[0];
      const generationData = {
        title: 'Performance Test Adventure',
        theme: 'fantasy',
        level: 5,
        partySize: 4,
        setting: 'dungeon'
      };

      const start = performance.now();
      
      try {
        const response = await axios.post(
          `${baseURL}/api/adventures/generate`,
          generationData,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 30000 // 30 second timeout
          }
        );

        const duration = performance.now() - start;

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('content');
        
        // Adventure generation should complete within 30 seconds
        expect(duration).toBeLessThan(30000);

        console.log(`Adventure generation completed in ${duration.toFixed(0)}ms`);
        
      } catch (error: any) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Adventure generation timed out');
        }
        throw error;
      }
    }, 35000); // 35 second test timeout
  });

  describe('Search Performance', () => {
    it('should perform searches efficiently', async () => {
      const searchQueries = [
        'dragon',
        'dungeon',
        'fantasy',
        'adventure',
        'quest'
      ];

      const searchPromises = searchQueries.map(async (query) => {
        const start = performance.now();
        const response = await axios.get(`${baseURL}/api/adventures/search?q=${query}`);
        const duration = performance.now() - start;

        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(2000); // 2 seconds max per search

        return { query, duration, resultCount: response.data.length };
      });

      const results = await Promise.all(searchPromises);

      const avgDuration = results.reduce((sum, result) => sum + result.duration, 0) / results.length;
      expect(avgDuration).toBeLessThan(1000); // 1 second average

      console.log('Search performance results:', results);
    });
  });
});