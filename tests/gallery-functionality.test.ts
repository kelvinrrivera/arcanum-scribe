import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Pool } from 'pg';
import GalleryService from '../server/gallery-service';

describe('Gallery Functionality', () => {
  let pool: Pool;
  let galleryService: GalleryService;
  let testUserId: string;
  let testAdventureId: string;

  beforeEach(async () => {
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    });

    galleryService = new GalleryService(pool);

    // Create test user
    const userResult = await pool.query(`
      INSERT INTO users (email, username, tier)
      VALUES ('gallery-test@example.com', 'galleryuser', 'creator')
      RETURNING id
    `);
    testUserId = userResult.rows[0].id;

    // Create test adventure
    const adventureResult = await pool.query(`
      INSERT INTO adventures (
        user_id, title, description, content, 
        game_system, level_range, privacy, thumbnail_url
      )
      VALUES ($1, 'Test Adventure', 'A test adventure', '{"content": "test"}', 
              'D&D 5e', '{1,5}', 'public', 'https://example.com/thumb.jpg')
      RETURNING id
    `, [testUserId]);
    testAdventureId = adventureResult.rows[0].id;

    // Create adventure stats
    await pool.query(`
      INSERT INTO adventure_stats (adventure_id, views, downloads, rating, rating_count)
      VALUES ($1, 10, 5, 4.5, 2)
    `, [testAdventureId]);
  });

  afterEach(async () => {
    // Cleanup test data
    await pool.query('DELETE FROM adventure_stats WHERE adventure_id = $1', [testAdventureId]);
    await pool.query('DELETE FROM adventures WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM users WHERE email = $1', ['gallery-test@example.com']);
    await pool.end();
  });

  describe('Gallery Browsing', () => {
    it('should fetch public adventures', async () => {
      const result = await galleryService.getPublicAdventures({
        page: 1,
        limit: 10,
      });

      expect(result.adventures).toHaveLength(1);
      expect(result.adventures[0]).toMatchObject({
        id: testAdventureId,
        title: 'Test Adventure',
        privacy: 'public',
        views: 10,
        downloads: 5,
        rating: 4.5,
      });
    });

    it('should not include private adventures in public gallery', async () => {
      // Make adventure private
      await pool.query(`
        UPDATE adventures 
        SET privacy = 'private' 
        WHERE id = $1
      `, [testAdventureId]);

      const result = await galleryService.getPublicAdventures({
        page: 1,
        limit: 10,
      });

      expect(result.adventures).toHaveLength(0);
    });

    it('should filter by game system', async () => {
      const result = await galleryService.getPublicAdventures({
        page: 1,
        limit: 10,
        gameSystem: 'D&D 5e',
      });

      expect(result.adventures).toHaveLength(1);
      expect(result.adventures[0].game_system).toBe('D&D 5e');
    });

    it('should filter by level range', async () => {
      const result = await galleryService.getPublicAdventures({
        page: 1,
        limit: 10,
        levelRange: [1, 5],
      });

      expect(result.adventures).toHaveLength(1);
    });

    it('should sort by different criteria', async () => {
      // Create another adventure with different stats
      const adventure2Result = await pool.query(`
        INSERT INTO adventures (
          user_id, title, description, content, 
          game_system, level_range, privacy, created_at
        )
        VALUES ($1, 'Newer Adventure', 'A newer adventure', '{"content": "test2"}', 
                'D&D 5e', '{6,10}', 'public', NOW() + INTERVAL '1 hour')
        RETURNING id
      `, [testUserId]);

      await pool.query(`
        INSERT INTO adventure_stats (adventure_id, views, downloads, rating, rating_count)
        VALUES ($1, 20, 10, 3.5, 4)
      `, [adventure2Result.rows[0].id]);

      // Test sorting by newest
      const newestResult = await galleryService.getPublicAdventures({
        page: 1,
        limit: 10,
        sortBy: 'newest',
      });

      expect(newestResult.adventures[0].title).toBe('Newer Adventure');

      // Test sorting by popular (views)
      const popularResult = await galleryService.getPublicAdventures({
        page: 1,
        limit: 10,
        sortBy: 'popular',
      });

      expect(popularResult.adventures[0].title).toBe('Newer Adventure');
      expect(popularResult.adventures[0].views).toBe(20);

      // Cleanup
      await pool.query('DELETE FROM adventure_stats WHERE adventure_id = $1', [adventure2Result.rows[0].id]);
      await pool.query('DELETE FROM adventures WHERE id = $1', [adventure2Result.rows[0].id]);
    });
  });

  describe('Adventure Statistics', () => {
    it('should track adventure views', async () => {
      await galleryService.incrementViews(testAdventureId);

      const stats = await pool.query(`
        SELECT views FROM adventure_stats WHERE adventure_id = $1
      `, [testAdventureId]);

      expect(stats.rows[0].views).toBe(11);
    });

    it('should track adventure downloads', async () => {
      await galleryService.incrementDownloads(testAdventureId);

      const stats = await pool.query(`
        SELECT downloads FROM adventure_stats WHERE adventure_id = $1
      `, [testAdventureId]);

      expect(stats.rows[0].downloads).toBe(6);
    });

    it('should handle rating updates', async () => {
      await galleryService.updateRating(testAdventureId, testUserId, 5);

      const stats = await pool.query(`
        SELECT rating, rating_count FROM adventure_stats WHERE adventure_id = $1
      `, [testAdventureId]);

      // Should recalculate average rating
      expect(stats.rows[0].rating_count).toBe(3);
      expect(parseFloat(stats.rows[0].rating)).toBeCloseTo(4.67, 1);
    });
  });

  describe('Search Functionality', () => {
    it('should search adventures by title', async () => {
      const result = await galleryService.searchAdventures('Test Adventure', {
        page: 1,
        limit: 10,
      });

      expect(result.adventures).toHaveLength(1);
      expect(result.adventures[0].title).toBe('Test Adventure');
    });

    it('should search adventures by description', async () => {
      const result = await galleryService.searchAdventures('test adventure', {
        page: 1,
        limit: 10,
      });

      expect(result.adventures).toHaveLength(1);
    });

    it('should return empty results for non-matching search', async () => {
      const result = await galleryService.searchAdventures('nonexistent', {
        page: 1,
        limit: 10,
      });

      expect(result.adventures).toHaveLength(0);
    });
  });

  describe('Featured Content', () => {
    it('should get trending adventures', async () => {
      const trending = await galleryService.getTrendingAdventures(5);

      expect(trending).toHaveLength(1);
      expect(trending[0].id).toBe(testAdventureId);
    });

    it('should calculate trending score correctly', async () => {
      // Create adventure with higher stats
      const highStatsResult = await pool.query(`
        INSERT INTO adventures (
          user_id, title, description, content, 
          game_system, level_range, privacy
        )
        VALUES ($1, 'Popular Adventure', 'Very popular', '{"content": "popular"}', 
                'D&D 5e', '{1,5}', 'public')
        RETURNING id
      `, [testUserId]);

      await pool.query(`
        INSERT INTO adventure_stats (adventure_id, views, downloads, rating, rating_count)
        VALUES ($1, 100, 50, 5.0, 10)
      `, [highStatsResult.rows[0].id]);

      const trending = await galleryService.getTrendingAdventures(5);

      expect(trending[0].title).toBe('Popular Adventure');

      // Cleanup
      await pool.query('DELETE FROM adventure_stats WHERE adventure_id = $1', [highStatsResult.rows[0].id]);
      await pool.query('DELETE FROM adventures WHERE id = $1', [highStatsResult.rows[0].id]);
    });
  });

  describe('Creator Features', () => {
    it('should get adventures by creator', async () => {
      const creatorAdventures = await galleryService.getAdventuresByCreator(testUserId, {
        page: 1,
        limit: 10,
      });

      expect(creatorAdventures.adventures).toHaveLength(1);
      expect(creatorAdventures.adventures[0].id).toBe(testAdventureId);
    });

    it('should get creator statistics', async () => {
      const stats = await galleryService.getCreatorStats(testUserId);

      expect(stats).toMatchObject({
        totalAdventures: 1,
        totalViews: 10,
        totalDownloads: 5,
        averageRating: 4.5,
      });
    });
  });

  describe('Privacy Controls', () => {
    it('should update adventure privacy', async () => {
      await galleryService.updateAdventurePrivacy(testAdventureId, testUserId, 'private');

      const adventure = await pool.query(`
        SELECT privacy FROM adventures WHERE id = $1
      `, [testAdventureId]);

      expect(adventure.rows[0].privacy).toBe('private');
    });

    it('should not allow non-owners to change privacy', async () => {
      // Create another user
      const otherUserResult = await pool.query(`
        INSERT INTO users (email, username, tier)
        VALUES ('other@example.com', 'otheruser', 'creator')
        RETURNING id
      `);

      await expect(
        galleryService.updateAdventurePrivacy(testAdventureId, otherUserResult.rows[0].id, 'private')
      ).rejects.toThrow('Not authorized');

      // Cleanup
      await pool.query('DELETE FROM users WHERE id = $1', [otherUserResult.rows[0].id]);
    });
  });
});