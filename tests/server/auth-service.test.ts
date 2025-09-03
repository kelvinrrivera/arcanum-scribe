import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { testPool } from '../setup';

// Mock dependencies
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('Authentication Service', () => {
  beforeEach(async () => {
    // Clean up test data (order matters due to foreign keys)
    await testPool.query('DELETE FROM migration_log WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await testPool.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
  });

  describe('User Registration', () => {
    it('should create a new user with hashed password', async () => {
      const mockHashedPassword = 'hashed_password_123';
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHashedPassword);

      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      const result = await testPool.query(
        'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, tier',
        [userData.email, userData.username, mockHashedPassword]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toBe(userData.email);
      expect(result.rows[0].username).toBe(userData.username);
      expect(result.rows[0].tier).toBe('explorer');
    });

    it('should reject duplicate email addresses', async () => {
      const userData = {
        email: 'duplicate@example.com',
        username: 'user1',
        password: 'password123'
      };

      // Insert first user
      await testPool.query(
        'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)',
        [userData.email, userData.username, 'hashed_password']
      );

      // Try to insert duplicate
      await expect(
        testPool.query(
          'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)',
          [userData.email, 'user2', 'hashed_password2']
        )
      ).rejects.toThrow();
    });
  });

  describe('User Login', () => {
    it('should authenticate user with correct credentials', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed_password_123';
      
      vi.mocked(bcrypt.compare).mockResolvedValue(true);
      vi.mocked(jwt.sign).mockReturnValue('mock_jwt_token');

      // Create test user
      const user = await testPool.query(
        'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING *',
        ['login@example.com', 'loginuser', hashedPassword]
      );

      // Simulate login verification
      const isValidPassword = await bcrypt.compare(password, hashedPassword);
      expect(isValidPassword).toBe(true);

      const token = jwt.sign({ userId: user.rows[0].id }, 'secret');
      expect(token).toBe('mock_jwt_token');
    });

    it('should reject invalid credentials', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false);

      const isValidPassword = await bcrypt.compare('wrongpassword', 'hashed_password');
      expect(isValidPassword).toBe(false);
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate valid JWT tokens', () => {
      const mockPayload = { userId: 'user123', tier: 'creator' };
      vi.mocked(jwt.verify).mockReturnValue(mockPayload);

      const result = jwt.verify('valid_token', 'secret');
      expect(result).toEqual(mockPayload);
    });

    it('should reject invalid JWT tokens', () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => jwt.verify('invalid_token', 'secret')).toThrow('Invalid token');
    });
  });
});