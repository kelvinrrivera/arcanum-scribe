import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testPool } from '../setup';
import axios from 'axios';

// Integration tests for authentication flow
describe('Authentication Integration', () => {
  const baseURL = process.env.TEST_SERVER_URL || 'http://localhost:3001';
  let testUserId: string;

  beforeEach(async () => {
    // Clean up test data
    await testPool.query('DELETE FROM users WHERE email LIKE $1', ['%integration-test%']);
  });

  afterEach(async () => {
    // Clean up after each test
    if (testUserId) {
      await testPool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
  });

  describe('User Registration Flow', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'integration-test@example.com',
        username: 'integrationuser',
        password: 'password123'
      };

      const response = await axios.post(`${baseURL}/api/auth/register`, userData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.email).toBe(userData.email);
      expect(response.data.user.username).toBe(userData.username);
      expect(response.data.user.tier).toBe('explorer');

      // Verify user was created in database
      const dbUser = await testPool.query(
        'SELECT * FROM users WHERE email = $1',
        [userData.email]
      );

      expect(dbUser.rows).toHaveLength(1);
      expect(dbUser.rows[0].email).toBe(userData.email);
      testUserId = dbUser.rows[0].id;
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'duplicate-test@example.com',
        username: 'user1',
        password: 'password123'
      };

      // Register first user
      await axios.post(`${baseURL}/api/auth/register`, userData);

      // Try to register with same email
      const duplicateData = {
        ...userData,
        username: 'user2'
      };

      await expect(
        axios.post(`${baseURL}/api/auth/register`, duplicateData)
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: {
            error: expect.stringContaining('email')
          }
        }
      });
    });

    it('should validate registration data', async () => {
      const invalidData = {
        email: 'invalid-email',
        username: 'ab', // too short
        password: '123' // too short
      };

      await expect(
        axios.post(`${baseURL}/api/auth/register`, invalidData)
      ).rejects.toMatchObject({
        response: {
          status: 400
        }
      });
    });
  });

  describe('User Login Flow', () => {
    beforeEach(async () => {
      // Create test user for login tests
      const userData = {
        email: 'login-integration-test@example.com',
        username: 'loginuser',
        password: 'password123'
      };

      const response = await axios.post(`${baseURL}/api/auth/register`, userData);
      testUserId = response.data.user.id;
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login-integration-test@example.com',
        password: 'password123'
      };

      const response = await axios.post(`${baseURL}/api/auth/login`, loginData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.email).toBe(loginData.email);
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'login-integration-test@example.com',
        password: 'wrongpassword'
      };

      await expect(
        axios.post(`${baseURL}/api/auth/login`, loginData)
      ).rejects.toMatchObject({
        response: {
          status: 401,
          data: {
            error: expect.stringContaining('Invalid')
          }
        }
      });
    });

    it('should reject login for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await expect(
        axios.post(`${baseURL}/api/auth/login`, loginData)
      ).rejects.toMatchObject({
        response: {
          status: 401
        }
      });
    });
  });

  describe('Protected Routes', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login to get auth token
      const userData = {
        email: 'protected-test@example.com',
        username: 'protecteduser',
        password: 'password123'
      };

      const registerResponse = await axios.post(`${baseURL}/api/auth/register`, userData);
      authToken = registerResponse.data.token;
      testUserId = registerResponse.data.user.id;
    });

    it('should access protected route with valid token', async () => {
      const response = await axios.get(`${baseURL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data.email).toBe('protected-test@example.com');
    });

    it('should reject access without token', async () => {
      await expect(
        axios.get(`${baseURL}/api/user/profile`)
      ).rejects.toMatchObject({
        response: {
          status: 401
        }
      });
    });

    it('should reject access with invalid token', async () => {
      await expect(
        axios.get(`${baseURL}/api/user/profile`, {
          headers: {
            Authorization: 'Bearer invalid_token'
          }
        })
      ).rejects.toMatchObject({
        response: {
          status: 401
        }
      });
    });
  });

  describe('Token Refresh', () => {
    let authToken: string;

    beforeEach(async () => {
      const userData = {
        email: 'refresh-test@example.com',
        username: 'refreshuser',
        password: 'password123'
      };

      const response = await axios.post(`${baseURL}/api/auth/register`, userData);
      authToken = response.data.token;
      testUserId = response.data.user.id;
    });

    it('should refresh valid token', async () => {
      const response = await axios.post(`${baseURL}/api/auth/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data.token).not.toBe(authToken); // Should be a new token
    });
  });

  describe('Logout Flow', () => {
    let authToken: string;

    beforeEach(async () => {
      const userData = {
        email: 'logout-test@example.com',
        username: 'logoutuser',
        password: 'password123'
      };

      const response = await axios.post(`${baseURL}/api/auth/register`, userData);
      authToken = response.data.token;
      testUserId = response.data.user.id;
    });

    it('should logout successfully', async () => {
      const response = await axios.post(`${baseURL}/api/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
    });

    it('should invalidate token after logout', async () => {
      // Logout
      await axios.post(`${baseURL}/api/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      // Try to access protected route with logged out token
      await expect(
        axios.get(`${baseURL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        })
      ).rejects.toMatchObject({
        response: {
          status: 401
        }
      });
    });
  });

  describe('Password Security', () => {
    it('should hash passwords in database', async () => {
      const userData = {
        email: 'security-test@example.com',
        username: 'securityuser',
        password: 'password123'
      };

      await axios.post(`${baseURL}/api/auth/register`, userData);

      const dbUser = await testPool.query(
        'SELECT password_hash FROM users WHERE email = $1',
        [userData.email]
      );

      expect(dbUser.rows[0].password_hash).not.toBe(userData.password);
      expect(dbUser.rows[0].password_hash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const loginData = {
        email: 'ratelimit-test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple failed login attempts
      const attempts = Array.from({ length: 6 }, () =>
        axios.post(`${baseURL}/api/auth/login`, loginData).catch(err => err.response)
      );

      const responses = await Promise.all(attempts);

      // Last attempts should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});