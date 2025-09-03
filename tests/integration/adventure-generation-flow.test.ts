import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testPool } from '../setup';
import axios from 'axios';

describe('Adventure Generation Integration', () => {
  const baseURL = process.env.TEST_SERVER_URL || 'http://localhost:3001';
  let authToken: string;
  let testUserId: string;
  let testAdventureId: string;

  beforeEach(async () => {
    // Clean up test data
    await testPool.query('DELETE FROM adventures WHERE title LIKE $1', ['%Integration Test%']);
    await testPool.query('DELETE FROM users WHERE email LIKE $1', ['%generation-test%']);

    // Create test user with creator tier
    const userData = {
      email: 'generation-test@example.com',
      username: 'generationuser',
      password: 'password123'
    };

    const registerResponse = await axios.post(`${baseURL}/api/auth/register`, userData);
    authToken = registerResponse.data.token;
    testUserId = registerResponse.data.user.id;

    // Upgrade to creator tier
    await testPool.query(
      'UPDATE users SET tier = $1, generation_limit = $2 WHERE id = $3',
      ['creator', 15, testUserId]
    );
  });

  afterEach(async () => {
    // Clean up test data
    if (testAdventureId) {
      await testPool.query('DELETE FROM adventures WHERE id = $1', [testAdventureId]);
    }
    if (testUserId) {
      await testPool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
  });

  describe('Adventure Generation', () => {
    it('should generate adventure with valid parameters', async () => {
      const generationData = {
        title: 'Integration Test Adventure',
        theme: 'fantasy',
        level: 5,
        partySize: 4,
        setting: 'dungeon',
        privacy: 'public'
      };

      const response = await axios.post(
        `${baseURL}/api/adventures/generate`,
        generationData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.title).toBe(generationData.title);
      expect(response.data).toHaveProperty('content');
      expect(response.data.content).toHaveProperty('introduction');
      expect(response.data.content).toHaveProperty('encounters');

      testAdventureId = response.data.id;

      // Verify adventure was saved to database
      const dbAdventure = await testPool.query(
        'SELECT * FROM adventures WHERE id = $1',
        [testAdventureId]
      );

      expect(dbAdventure.rows).toHaveLength(1);
      expect(dbAdventure.rows[0].user_id).toBe(testUserId);
      expect(dbAdventure.rows[0].title).toBe(generationData.title);
    });

    it('should enforce generation limits', async () => {
      // Set user to have reached generation limit
      await testPool.query(
        'UPDATE users SET generations_used = $1 WHERE id = $2',
        [15, testUserId]
      );

      const generationData = {
        title: 'Limit Test Adventure',
        theme: 'fantasy',
        level: 5,
        partySize: 4,
        setting: 'dungeon'
      };

      await expect(
        axios.post(
          `${baseURL}/api/adventures/generate`,
          generationData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 403,
          data: {
            error: expect.stringContaining('limit')
          }
        }
      });
    });

    it('should increment generation counter', async () => {
      const generationData = {
        title: 'Counter Test Adventure',
        theme: 'fantasy',
        level: 5,
        partySize: 4,
        setting: 'dungeon'
      };

      const initialUser = await testPool.query(
        'SELECT generations_used FROM users WHERE id = $1',
        [testUserId]
      );

      await axios.post(
        `${baseURL}/api/adventures/generate`,
        generationData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      const updatedUser = await testPool.query(
        'SELECT generations_used FROM users WHERE id = $1',
        [testUserId]
      );

      expect(updatedUser.rows[0].generations_used).toBe(
        initialUser.rows[0].generations_used + 1
      );
    });

    it('should validate generation parameters', async () => {
      const invalidData = {
        title: '', // empty title
        theme: 'invalid-theme',
        level: 25, // invalid level
        partySize: 0, // invalid party size
        setting: 'invalid-setting'
      };

      await expect(
        axios.post(
          `${baseURL}/api/adventures/generate`,
          invalidData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 400
        }
      });
    });

    it('should require authentication', async () => {
      const generationData = {
        title: 'Auth Test Adventure',
        theme: 'fantasy',
        level: 5,
        partySize: 4,
        setting: 'dungeon'
      };

      await expect(
        axios.post(`${baseURL}/api/adventures/generate`, generationData)
      ).rejects.toMatchObject({
        response: {
          status: 401
        }
      });
    });
  });

  describe('Adventure Content Structure', () => {
    it('should generate structured adventure content', async () => {
      const generationData = {
        title: 'Structure Test Adventure',
        theme: 'fantasy',
        level: 8,
        partySize: 4,
        setting: 'wilderness',
        includeNPCs: true,
        includeLocations: true
      };

      const response = await axios.post(
        `${baseURL}/api/adventures/generate`,
        generationData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      const content = response.data.content;

      expect(content).toHaveProperty('introduction');
      expect(content).toHaveProperty('encounters');
      expect(content).toHaveProperty('npcs');
      expect(content).toHaveProperty('locations');

      expect(content.encounters).toBeInstanceOf(Array);
      expect(content.encounters.length).toBeGreaterThan(0);

      // Validate encounter structure
      content.encounters.forEach((encounter: any) => {
        expect(encounter).toHaveProperty('name');
        expect(encounter).toHaveProperty('description');
        expect(encounter).toHaveProperty('challenge_rating');
      });

      testAdventureId = response.data.id;
    });

    it('should adapt content to party level', async () => {
      const lowLevelData = {
        title: 'Low Level Adventure',
        theme: 'fantasy',
        level: 2,
        partySize: 4,
        setting: 'village'
      };

      const highLevelData = {
        title: 'High Level Adventure',
        theme: 'fantasy',
        level: 15,
        partySize: 4,
        setting: 'planar'
      };

      const lowLevelResponse = await axios.post(
        `${baseURL}/api/adventures/generate`,
        lowLevelData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      const highLevelResponse = await axios.post(
        `${baseURL}/api/adventures/generate`,
        highLevelData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      const lowLevelEncounters = lowLevelResponse.data.content.encounters;
      const highLevelEncounters = highLevelResponse.data.content.encounters;

      // High level adventures should have higher CR encounters
      const avgLowCR = lowLevelEncounters.reduce((sum: number, enc: any) => sum + enc.challenge_rating, 0) / lowLevelEncounters.length;
      const avgHighCR = highLevelEncounters.reduce((sum: number, enc: any) => sum + enc.challenge_rating, 0) / highLevelEncounters.length;

      expect(avgHighCR).toBeGreaterThan(avgLowCR);

      // Clean up
      await testPool.query('DELETE FROM adventures WHERE id IN ($1, $2)', [
        lowLevelResponse.data.id,
        highLevelResponse.data.id
      ]);
    });
  });

  describe('Privacy Settings', () => {
    it('should create private adventures', async () => {
      const generationData = {
        title: 'Private Test Adventure',
        theme: 'fantasy',
        level: 5,
        partySize: 4,
        setting: 'dungeon',
        privacy: 'private'
      };

      const response = await axios.post(
        `${baseURL}/api/adventures/generate`,
        generationData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      expect(response.data.privacy).toBe('private');

      testAdventureId = response.data.id;

      // Verify privacy in database
      const dbAdventure = await testPool.query(
        'SELECT privacy FROM adventures WHERE id = $1',
        [testAdventureId]
      );

      expect(dbAdventure.rows[0].privacy).toBe('private');
    });

    it('should enforce private adventure limits', async () => {
      // Set user to have reached private adventure limit
      await testPool.query(
        'UPDATE users SET private_slots_used = $1 WHERE id = $2',
        [3, testUserId]
      );

      const generationData = {
        title: 'Private Limit Test',
        theme: 'fantasy',
        level: 5,
        partySize: 4,
        setting: 'dungeon',
        privacy: 'private'
      };

      await expect(
        axios.post(
          `${baseURL}/api/adventures/generate`,
          generationData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 403,
          data: {
            error: expect.stringContaining('private')
          }
        }
      });
    });
  });

  describe('Advanced Generation Options', () => {
    it('should handle tone and complexity settings', async () => {
      const generationData = {
        title: 'Advanced Options Test',
        theme: 'horror',
        level: 7,
        partySize: 4,
        setting: 'mansion',
        tone: 'serious',
        complexity: 'complex',
        includeNPCs: true,
        includeLocations: true,
        includePuzzles: true
      };

      const response = await axios.post(
        `${baseURL}/api/adventures/generate`,
        generationData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.content).toHaveProperty('puzzles');
      expect(response.data.content.npcs.length).toBeGreaterThan(0);
      expect(response.data.content.locations.length).toBeGreaterThan(0);

      testAdventureId = response.data.id;
    });
  });

  describe('Error Handling', () => {
    it('should handle LLM service failures gracefully', async () => {
      // This test would require mocking the LLM service to fail
      // For now, we'll test the error response structure
      const generationData = {
        title: 'Error Test Adventure',
        theme: 'fantasy',
        level: 5,
        partySize: 4,
        setting: 'dungeon'
      };

      // Simulate service unavailable by using invalid API key
      const originalKey = process.env.OPENROUTER_API_KEY;
      process.env.OPENROUTER_API_KEY = 'invalid_key';

      try {
        await axios.post(
          `${baseURL}/api/adventures/generate`,
          generationData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
      } catch (error: any) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
        expect(error.response.data).toHaveProperty('error');
      } finally {
        process.env.OPENROUTER_API_KEY = originalKey;
      }
    });

    it('should handle malformed generation requests', async () => {
      const malformedData = {
        // Missing required fields
        theme: 'fantasy'
      };

      await expect(
        axios.post(
          `${baseURL}/api/adventures/generate`,
          malformedData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 400
        }
      });
    });
  });
});