import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Pool } from 'pg';
import TierService from '../server/tier-service';

describe('Tier Management Service', () => {
  let pool: Pool;
  let tierService: TierService;
  let testUserId: string;

  beforeEach(async () => {
    // Setup test database connection
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    });

    tierService = new TierService(pool);

    // Create test user
    const userResult = await pool.query(`
      INSERT INTO users (email, username, tier, generations_used, private_slots_used, period_start)
      VALUES ('test@example.com', 'testuser', 'creator', 5, 1, NOW())
      RETURNING id
    `);
    testUserId = userResult.rows[0].id;
  });

  afterEach(async () => {
    // Cleanup test data
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.end();
  });

  describe('Tier Validation', () => {
    it('should validate tier limits correctly', async () => {
      const limits = await tierService.getTierLimits(testUserId);
      
      expect(limits).toMatchObject({
        tier: 'creator',
        generationLimit: 15,
        privateAdventureLimit: 3,
        generationsUsed: 5,
        privateSlots: 1,
      });
    });

    it('should check if user can generate adventure', async () => {
      const canGenerate = await tierService.canUserGenerate(testUserId);
      expect(canGenerate).toBe(true);
    });

    it('should prevent generation when limit exceeded', async () => {
      // Set user to limit
      await pool.query(`
        UPDATE users 
        SET generations_used = 15 
        WHERE id = $1
      `, [testUserId]);

      const canGenerate = await tierService.canUserGenerate(testUserId);
      expect(canGenerate).toBe(false);
    });

    it('should check private adventure limits', async () => {
      const canCreatePrivate = await tierService.canUserCreatePrivateAdventure(testUserId);
      expect(canCreatePrivate).toBe(true);

      // Set to limit
      await pool.query(`
        UPDATE users 
        SET private_slots_used = 3 
        WHERE id = $1
      `, [testUserId]);

      const canCreatePrivateAtLimit = await tierService.canUserCreatePrivateAdventure(testUserId);
      expect(canCreatePrivateAtLimit).toBe(false);
    });
  });

  describe('Usage Tracking', () => {
    it('should increment generation count', async () => {
      await tierService.incrementGenerationCount(testUserId);
      
      const limits = await tierService.getTierLimits(testUserId);
      expect(limits.generationsUsed).toBe(6);
    });

    it('should increment private slot usage', async () => {
      await tierService.incrementPrivateSlotUsage(testUserId);
      
      const limits = await tierService.getTierLimits(testUserId);
      expect(limits.privateSlots).toBe(2);
    });

    it('should reset usage on billing cycle', async () => {
      // Set period start to over a month ago
      await pool.query(`
        UPDATE users 
        SET period_start = NOW() - INTERVAL '35 days'
        WHERE id = $1
      `, [testUserId]);

      await tierService.resetUsageIfNeeded(testUserId);
      
      const limits = await tierService.getTierLimits(testUserId);
      expect(limits.generationsUsed).toBe(0);
      expect(limits.privateSlots).toBe(0);
    });
  });

  describe('Tier Upgrades', () => {
    it('should upgrade user tier', async () => {
      await tierService.upgradeTier(testUserId, 'master');
      
      const limits = await tierService.getTierLimits(testUserId);
      expect(limits.tier).toBe('master');
      expect(limits.generationLimit).toBe(50);
    });

    it('should reset usage on tier upgrade', async () => {
      await tierService.upgradeTier(testUserId, 'master');
      
      const limits = await tierService.getTierLimits(testUserId);
      expect(limits.generationsUsed).toBe(0);
      expect(limits.privateSlots).toBe(0);
    });
  });

  describe('Explorer Tier Restrictions', () => {
    beforeEach(async () => {
      await pool.query(`
        UPDATE users 
        SET tier = 'explorer' 
        WHERE id = $1
      `, [testUserId]);
    });

    it('should prevent generation for explorer tier', async () => {
      const canGenerate = await tierService.canUserGenerate(testUserId);
      expect(canGenerate).toBe(false);
    });

    it('should prevent private adventure creation for explorer tier', async () => {
      const canCreatePrivate = await tierService.canUserCreatePrivateAdventure(testUserId);
      expect(canCreatePrivate).toBe(false);
    });
  });

  describe('Master Tier Features', () => {
    beforeEach(async () => {
      await pool.query(`
        UPDATE users 
        SET tier = 'master' 
        WHERE id = $1
      `, [testUserId]);
    });

    it('should allow unlimited private adventures for master tier', async () => {
      // Set high private slot usage
      await pool.query(`
        UPDATE users 
        SET private_slots_used = 100 
        WHERE id = $1
      `, [testUserId]);

      const canCreatePrivate = await tierService.canUserCreatePrivateAdventure(testUserId);
      expect(canCreatePrivate).toBe(true);
    });

    it('should have higher generation limits for master tier', async () => {
      const limits = await tierService.getTierLimits(testUserId);
      expect(limits.generationLimit).toBe(50);
    });
  });
});