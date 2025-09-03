import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Pool } from 'pg';
import TierService from '../server/tier-service';
import GalleryService from '../server/gallery-service';

describe('Privacy Workflows', () => {
  let pool: Pool;
  let tierService: TierService;
  let galleryService: GalleryService;
  let creatorUserId: string;
  let masterUserId: string;
  let explorerUserId: string;

  beforeEach(async () => {
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    });

    tierService = new TierService(pool);
    galleryService = new GalleryService(pool);

    // Create test users for different tiers
    const creatorResult = await pool.query(`
      INSERT INTO users (email, username, tier, private_slots_used)
      VALUES ('creator@example.com', 'creator', 'creator', 1)
      RETURNING id
    `);
    creatorUserId = creatorResult.rows[0].id;

    const masterResult = await pool.query(`
      INSERT INTO users (email, username, tier, private_slots_used)
      VALUES ('master@example.com', 'master', 'master', 5)
      RETURNING id
    `);
    masterUserId = masterResult.rows[0].id;

    const explorerResult = await pool.query(`
      INSERT INTO users (email, username, tier)
      VALUES ('explorer@example.com', 'explorer', 'explorer')
      RETURNING id
    `);
    explorerUserId = explorerResult.rows[0].id;
  });

  afterEach(async () => {
    // Cleanup test data
    await pool.query(`
      DELETE FROM adventures 
      WHERE user_id IN ($1, $2, $3)
    `, [creatorUserId, masterUserId, explorerUserId]);
    
    await pool.query(`
      DELETE FROM users 
      WHERE id IN ($1, $2, $3)
    `, [creatorUserId, masterUserId, explorerUserId]);
    
    await pool.end();
  });

  describe('Creator Tier Privacy Limits', () => {
    it('should allow creating private adventures within limit', async () => {
      const canCreate = await tierService.canUserCreatePrivateAdventure(creatorUserId);
      expect(canCreate).toBe(true);

      // Create private adventure
      const adventureResult = await pool.query(`
        INSERT INTO adventures (
          user_id, title, description, content, 
          game_system, level_range, privacy
        )
        VALUES ($1, 'Private Adventure', 'Secret content', '{"content": "private"}', 
                'D&D 5e', '{1,5}', 'private')
        RETURNING id
      `, [creatorUserId]);

      // Increment private slot usage
      await tierService.incrementPrivateSlotUsage(creatorUserId);

      const limits = await tierService.getTierLimits(creatorUserId);
      expect(limits.privateSlots).toBe(2);
    });

    it('should prevent creating private adventures when limit exceeded', async () => {
      // Set user to limit
      await pool.query(`
        UPDATE users 
        SET private_slots_used = 3 
        WHERE id = $1
      `, [creatorUserId]);

      const canCreate = await tierService.canUserCreatePrivateAdventure(creatorUserId);
      expect(canCreate).toBe(false);
    });

    it('should allow converting public to private within limits', async () => {
      // Create public adventure
      const adventureResult = await pool.query(`
        INSERT INTO adventures (
          user_id, title, description, content, 
          game_system, level_range, privacy
        )
        VALUES ($1, 'Public Adventure', 'Public content', '{"content": "public"}', 
                'D&D 5e', '{1,5}', 'public')
        RETURNING id
      `, [creatorUserId]);

      const adventureId = adventureResult.rows[0].id;

      // Should be able to convert to private
      const canConvert = await tierService.canUserCreatePrivateAdventure(creatorUserId);
      expect(canConvert).toBe(true);

      await galleryService.updateAdventurePrivacy(adventureId, creatorUserId, 'private');
      await tierService.incrementPrivateSlotUsage(creatorUserId);

      const adventure = await pool.query(`
        SELECT privacy FROM adventures WHERE id = $1
      `, [adventureId]);

      expect(adventure.rows[0].privacy).toBe('private');
    });

    it('should prevent converting to private when limit exceeded', async () => {
      // Set user to limit
      await pool.query(`
        UPDATE users 
        SET private_slots_used = 3 
        WHERE id = $1
      `, [creatorUserId]);

      // Create public adventure
      const adventureResult = await pool.query(`
        INSERT INTO adventures (
          user_id, title, description, content, 
          game_system, level_range, privacy
        )
        VALUES ($1, 'Public Adventure', 'Public content', '{"content": "public"}', 
                'D&D 5e', '{1,5}', 'public')
        RETURNING id
      `, [creatorUserId]);

      const adventureId = adventureResult.rows[0].id;

      const canConvert = await tierService.canUserCreatePrivateAdventure(creatorUserId);
      expect(canConvert).toBe(false);

      // Should throw error when trying to convert
      await expect(
        galleryService.updateAdventurePrivacy(adventureId, creatorUserId, 'private')
      ).rejects.toThrow('Private adventure limit exceeded');
    });
  });

  describe('Master Tier Privacy Features', () => {
    it('should allow unlimited private adventures', async () => {
      const canCreate = await tierService.canUserCreatePrivateAdventure(masterUserId);
      expect(canCreate).toBe(true);

      // Even with high usage, should still allow
      await pool.query(`
        UPDATE users 
        SET private_slots_used = 100 
        WHERE id = $1
      `, [masterUserId]);

      const canCreateAfterHighUsage = await tierService.canUserCreatePrivateAdventure(masterUserId);
      expect(canCreateAfterHighUsage).toBe(true);
    });

    it('should default to private for new adventures', async () => {
      // This would be handled in the frontend/generation logic
      // but we can test the tier service behavior
      const limits = await tierService.getTierLimits(masterUserId);
      expect(limits.tier).toBe('master');
      
      // Master tier users should have unlimited private adventures
      expect(limits.privateAdventureLimit).toBe(-1); // -1 indicates unlimited
    });

    it('should allow converting between privacy settings freely', async () => {
      // Create private adventure
      const adventureResult = await pool.query(`
        INSERT INTO adventures (
          user_id, title, description, content, 
          game_system, level_range, privacy
        )
        VALUES ($1, 'Master Adventure', 'Master content', '{"content": "master"}', 
                'D&D 5e', '{1,5}', 'private')
        RETURNING id
      `, [masterUserId]);

      const adventureId = adventureResult.rows[0].id;

      // Convert to public
      await galleryService.updateAdventurePrivacy(adventureId, masterUserId, 'public');

      let adventure = await pool.query(`
        SELECT privacy FROM adventures WHERE id = $1
      `, [adventureId]);

      expect(adventure.rows[0].privacy).toBe('public');

      // Convert back to private
      await galleryService.updateAdventurePrivacy(adventureId, masterUserId, 'private');

      adventure = await pool.query(`
        SELECT privacy FROM adventures WHERE id = $1
      `, [adventureId]);

      expect(adventure.rows[0].privacy).toBe('private');
    });
  });

  describe('Explorer Tier Privacy Restrictions', () => {
    it('should not allow creating private adventures', async () => {
      const canCreate = await tierService.canUserCreatePrivateAdventure(explorerUserId);
      expect(canCreate).toBe(false);
    });

    it('should not allow generation at all', async () => {
      const canGenerate = await tierService.canUserGenerate(explorerUserId);
      expect(canGenerate).toBe(false);
    });

    it('should redirect to gallery for generation attempts', async () => {
      // This would be handled in the frontend, but we can test the service response
      const limits = await tierService.getTierLimits(explorerUserId);
      expect(limits.tier).toBe('explorer');
      expect(limits.generationLimit).toBe(0);
    });
  });

  describe('Privacy Setting Persistence', () => {
    it('should maintain privacy settings across tier changes', async () => {
      // Create private adventure as creator
      const adventureResult = await pool.query(`
        INSERT INTO adventures (
          user_id, title, description, content, 
          game_system, level_range, privacy
        )
        VALUES ($1, 'Creator Adventure', 'Creator content', '{"content": "creator"}', 
                'D&D 5e', '{1,5}', 'private')
        RETURNING id
      `, [creatorUserId]);

      const adventureId = adventureResult.rows[0].id;

      // Upgrade to master
      await tierService.upgradeTier(creatorUserId, 'master');

      // Privacy should remain the same
      const adventure = await pool.query(`
        SELECT privacy FROM adventures WHERE id = $1
      `, [adventureId]);

      expect(adventure.rows[0].privacy).toBe('private');
    });

    it('should handle privacy when downgrading tiers', async () => {
      // Create multiple private adventures as master
      const adventure1Result = await pool.query(`
        INSERT INTO adventures (
          user_id, title, description, content, 
          game_system, level_range, privacy
        )
        VALUES ($1, 'Master Adventure 1', 'Content 1', '{"content": "1"}', 
                'D&D 5e', '{1,5}', 'private')
        RETURNING id
      `, [masterUserId]);

      const adventure2Result = await pool.query(`
        INSERT INTO adventures (
          user_id, title, description, content, 
          game_system, level_range, privacy
        )
        VALUES ($1, 'Master Adventure 2', 'Content 2', '{"content": "2"}', 
                'D&D 5e', '{1,5}', 'private')
        RETURNING id
      `, [masterUserId]);

      // Downgrade to creator (this would typically be handled by billing service)
      await pool.query(`
        UPDATE users 
        SET tier = 'creator', private_slots_used = 0
        WHERE id = $1
      `, [masterUserId]);

      // User should now be limited to 3 private adventures
      const limits = await tierService.getTierLimits(masterUserId);
      expect(limits.tier).toBe('creator');
      expect(limits.privateAdventureLimit).toBe(3);

      // Existing private adventures should remain private
      const adventures = await pool.query(`
        SELECT privacy FROM adventures 
        WHERE user_id = $1 AND id IN ($2, $3)
      `, [masterUserId, adventure1Result.rows[0].id, adventure2Result.rows[0].id]);

      adventures.rows.forEach(adventure => {
        expect(adventure.privacy).toBe('private');
      });
    });
  });

  describe('Bulk Privacy Management', () => {
    it('should allow bulk privacy updates within limits', async () => {
      // Create multiple public adventures
      const adventures = [];
      for (let i = 0; i < 3; i++) {
        const result = await pool.query(`
          INSERT INTO adventures (
            user_id, title, description, content, 
            game_system, level_range, privacy
          )
          VALUES ($1, $2, $3, '{"content": "bulk"}', 
                  'D&D 5e', '{1,5}', 'public')
          RETURNING id
        `, [creatorUserId, `Bulk Adventure ${i + 1}`, `Description ${i + 1}`]);
        
        adventures.push(result.rows[0].id);
      }

      // Should be able to convert 2 to private (user has 1 private slot used, limit is 3)
      const canConvert = await tierService.canUserCreatePrivateAdventure(creatorUserId);
      expect(canConvert).toBe(true);

      // Convert first two to private
      for (let i = 0; i < 2; i++) {
        await galleryService.updateAdventurePrivacy(adventures[i], creatorUserId, 'private');
        await tierService.incrementPrivateSlotUsage(creatorUserId);
      }

      // Should now be at limit
      const limits = await tierService.getTierLimits(creatorUserId);
      expect(limits.privateSlots).toBe(3);

      const canConvertMore = await tierService.canUserCreatePrivateAdventure(creatorUserId);
      expect(canConvertMore).toBe(false);
    });
  });
});