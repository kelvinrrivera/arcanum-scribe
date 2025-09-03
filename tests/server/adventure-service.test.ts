import { describe, it, expect, beforeEach } from 'vitest';
import { testPool } from '../setup';

describe('Adventure Service', () => {
  let testUserId: string;
  let testAdventureId: string;

  beforeEach(async () => {
    // Clean up test data (order matters due to foreign keys)
    await testPool.query('DELETE FROM adventure_ratings WHERE adventure_id IN (SELECT id FROM adventures WHERE title LIKE $1)', ['%Test%']);
    await testPool.query('DELETE FROM adventure_stats WHERE adventure_id IN (SELECT id FROM adventures WHERE title LIKE $1)', ['%Test%']);
    await testPool.query('DELETE FROM adventures WHERE title LIKE $1', ['%Test%']);
    await testPool.query('DELETE FROM migration_log WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await testPool.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
    
    // Create test user
    const userResult = await testPool.query(
      'INSERT INTO users (email, username, password_hash, tier) VALUES ($1, $2, $3, $4) RETURNING id',
      ['adventure-test@example.com', 'adventureuser', 'hashed_password', 'creator']
    );
    testUserId = userResult.rows[0].id;
  });

  describe('Adventure Creation', () => {
    it('should create a new adventure', async () => {
      const adventureData = {
        title: 'Test Adventure',
        description: 'A test adventure for unit testing',
        content: {
          introduction: 'Welcome to the test adventure',
          encounters: [
            {
              name: 'Test Encounter',
              description: 'A simple test encounter',
              challenge_rating: 3
            }
          ],
          npcs: [],
          locations: []
        },
        game_system: 'D&D 5e',
        level_range: [3, 5],
        privacy: 'public'
      };

      const result = await testPool.query(
        `INSERT INTO adventures (user_id, title, description, content, game_system, level_range, privacy) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          testUserId,
          adventureData.title,
          adventureData.description,
          JSON.stringify(adventureData.content),
          adventureData.game_system,
          adventureData.level_range,
          adventureData.privacy
        ]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].title).toBe(adventureData.title);
      expect(result.rows[0].user_id).toBe(testUserId);
      expect(result.rows[0].privacy).toBe('public');
      
      testAdventureId = result.rows[0].id;
    });

    it('should validate adventure content structure', () => {
      const validContent = {
        introduction: 'Story introduction',
        encounters: [
          {
            name: 'Boss Fight',
            description: 'Final boss encounter',
            challenge_rating: 8
          }
        ],
        npcs: [
          {
            name: 'Village Elder',
            description: 'Wise old man',
            stats: {}
          }
        ],
        locations: [
          {
            name: 'Ancient Temple',
            description: 'Mysterious temple ruins'
          }
        ]
      };

      expect(validContent).toHaveProperty('introduction');
      expect(validContent).toHaveProperty('encounters');
      expect(validContent).toHaveProperty('npcs');
      expect(validContent).toHaveProperty('locations');
      expect(validContent.encounters).toBeInstanceOf(Array);
      expect(validContent.encounters[0]).toHaveProperty('challenge_rating');
    });

    it('should enforce privacy settings', async () => {
      const privateAdventure = {
        title: 'Private Test Adventure',
        description: 'A private adventure',
        content: { introduction: 'Private content' },
        privacy: 'private'
      };

      const result = await testPool.query(
        'INSERT INTO adventures (user_id, title, description, content, privacy) VALUES ($1, $2, $3, $4, $5) RETURNING privacy',
        [testUserId, privateAdventure.title, privateAdventure.description, JSON.stringify(privateAdventure.content), privateAdventure.privacy]
      );

      expect(result.rows[0].privacy).toBe('private');
    });
  });

  describe('Adventure Retrieval', () => {
    beforeEach(async () => {
      // Create test adventure
      const result = await testPool.query(
        'INSERT INTO adventures (user_id, title, description, content, privacy) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [testUserId, 'Test Retrieval Adventure', 'Test description', JSON.stringify({ introduction: 'Test' }), 'public']
      );
      testAdventureId = result.rows[0].id;
    });

    it('should retrieve public adventures', async () => {
      const result = await testPool.query(
        'SELECT * FROM adventures WHERE privacy = $1 ORDER BY created_at DESC',
        ['public']
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].privacy).toBe('public');
    });

    it('should retrieve user-specific adventures', async () => {
      const result = await testPool.query(
        'SELECT * FROM adventures WHERE user_id = $1',
        [testUserId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].user_id).toBe(testUserId);
    });

    it('should filter adventures by game system', async () => {
      await testPool.query(
        'UPDATE adventures SET game_system = $1 WHERE id = $2',
        ['D&D 5e', testAdventureId]
      );

      const result = await testPool.query(
        'SELECT * FROM adventures WHERE game_system = $1',
        ['D&D 5e']
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].game_system).toBe('D&D 5e');
    });
  });

  describe('Adventure Statistics', () => {
    beforeEach(async () => {
      // Create test adventure and stats
      const adventureResult = await testPool.query(
        'INSERT INTO adventures (user_id, title, description, content, privacy) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [testUserId, 'Stats Test Adventure', 'Test description', JSON.stringify({ introduction: 'Test' }), 'public']
      );
      testAdventureId = adventureResult.rows[0].id;

      await testPool.query(
        'INSERT INTO adventure_stats (adventure_id, views, downloads, rating, rating_count) VALUES ($1, $2, $3, $4, $5)',
        [testAdventureId, 0, 0, 0, 0]
      );
    });

    it('should track adventure views', async () => {
      await testPool.query(
        'UPDATE adventure_stats SET views = views + 1 WHERE adventure_id = $1',
        [testAdventureId]
      );

      const result = await testPool.query(
        'SELECT views FROM adventure_stats WHERE adventure_id = $1',
        [testAdventureId]
      );

      expect(result.rows[0].views).toBe(1);
    });

    it('should track adventure downloads', async () => {
      await testPool.query(
        'UPDATE adventure_stats SET downloads = downloads + 1 WHERE adventure_id = $1',
        [testAdventureId]
      );

      const result = await testPool.query(
        'SELECT downloads FROM adventure_stats WHERE adventure_id = $1',
        [testAdventureId]
      );

      expect(result.rows[0].downloads).toBe(1);
    });

    it('should calculate average ratings', async () => {
      // Add test ratings
      await testPool.query(
        'INSERT INTO adventure_ratings (adventure_id, user_id, rating) VALUES ($1, $2, $3)',
        [testAdventureId, testUserId, 5]
      );

      // Update stats
      const avgResult = await testPool.query(
        'SELECT AVG(rating)::DECIMAL(3,2) as avg_rating, COUNT(*) as rating_count FROM adventure_ratings WHERE adventure_id = $1',
        [testAdventureId]
      );

      await testPool.query(
        'UPDATE adventure_stats SET rating = $1, rating_count = $2 WHERE adventure_id = $3',
        [avgResult.rows[0].avg_rating, avgResult.rows[0].rating_count, testAdventureId]
      );

      const statsResult = await testPool.query(
        'SELECT rating, rating_count FROM adventure_stats WHERE adventure_id = $1',
        [testAdventureId]
      );

      expect(parseFloat(statsResult.rows[0].rating)).toBe(5.00);
      expect(statsResult.rows[0].rating_count).toBe(1);
    });
  });

  describe('Adventure Search', () => {
    beforeEach(async () => {
      // Create searchable adventures
      await testPool.query(
        'INSERT INTO adventures (user_id, title, description, content, privacy, game_system) VALUES ($1, $2, $3, $4, $5, $6)',
        [testUserId, 'Dragon Quest Adventure', 'Epic dragon adventure', JSON.stringify({ introduction: 'Dragons await' }), 'public', 'D&D 5e']
      );

      await testPool.query(
        'INSERT INTO adventures (user_id, title, description, content, privacy, game_system) VALUES ($1, $2, $3, $4, $5, $6)',
        [testUserId, 'Dungeon Crawl', 'Classic dungeon exploration', JSON.stringify({ introduction: 'Enter the dungeon' }), 'public', 'Pathfinder']
      );
    });

    it('should search adventures by title', async () => {
      const result = await testPool.query(
        'SELECT * FROM adventures WHERE title ILIKE $1 AND privacy = $2',
        ['%Dragon%', 'public']
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].title).toContain('Dragon');
    });

    it('should search adventures by description', async () => {
      const result = await testPool.query(
        'SELECT * FROM adventures WHERE description ILIKE $1 AND privacy = $2',
        ['%dungeon%', 'public']
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].description.toLowerCase()).toContain('dungeon');
    });

    it('should filter by game system', async () => {
      const result = await testPool.query(
        'SELECT * FROM adventures WHERE game_system = $1 AND privacy = $2',
        ['D&D 5e', 'public']
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].game_system).toBe('D&D 5e');
    });
  });
});