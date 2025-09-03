import { query, transaction } from '../src/integrations/postgres/client';
import { cacheService, CacheKeys } from './cache-service';

export interface AdventureCard {
  id: string;
  title: string;
  description: string;
  creator: CreatorInfo;
  metadata: AdventureMetadata;
  stats: AdventureStats;
  thumbnail?: string;
  tags: string[];
  privacy: 'public' | 'private';
  gameSystem: string;
  createdAt: Date;
}

export interface CreatorInfo {
  id: string;
  displayName: string;
  tier: 'explorer' | 'creator' | 'master';
  verified: boolean;
}

export interface AdventureMetadata {
  playerLevel: string;
  partySize: string;
  duration: string;
  tone: string;
  setting: string;
  themes: string[];
  difficulty?: number;
  qualityScore?: number;
}

export interface AdventureStats {
  views: number;
  downloads: number;
  rating: number;
  ratingCount: number;
  createdAt: Date;
}

export interface GalleryFilters {
  gameSystem?: string;
  playerLevel?: string;
  duration?: string;
  tone?: string;
  setting?: string;
  themes?: string[];
  search?: string;
  sortBy?: 'newest' | 'popular' | 'rating' | 'downloads';
  page?: number;
  limit?: number;
}

export interface GalleryResponse {
  adventures: AdventureCard[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export class GalleryService {
  
  async getPublicAdventures(filters: GalleryFilters = {}): Promise<GalleryResponse> {
    try {
      // Check cache first (cache for 5 minutes)
      const cacheKey = CacheKeys.PUBLIC_ADVENTURES(filters);
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const {
        gameSystem,
        playerLevel,
        duration,
        tone,
        setting,
        themes = [],
        search,
        sortBy = 'newest',
        page = 1,
        limit = 12
      } = filters;

      const offset = (page - 1) * limit;
      const conditions: string[] = ['a.privacy = $1'];
      const params: any[] = ['public'];
      let paramIndex = 2;

      // Build WHERE conditions
      if (gameSystem) {
        conditions.push(`a.game_system = $${paramIndex}`);
        params.push(gameSystem);
        paramIndex++;
      }

      if (search) {
        conditions.push(`(
          a.title ILIKE $${paramIndex} OR 
          a.content->>'description' ILIKE $${paramIndex} OR
          array_to_string(a.tags, ' ') ILIKE $${paramIndex}
        )`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (themes.length > 0) {
        conditions.push(`a.tags && $${paramIndex}`);
        params.push(themes);
        paramIndex++;
      }

      // Add metadata filters if provided
      const metadataFilters: string[] = [];
      if (playerLevel) metadataFilters.push(`content->'metadata'->>'playerLevel' = '${playerLevel}'`);
      if (duration) metadataFilters.push(`content->'metadata'->>'duration' = '${duration}'`);
      if (tone) metadataFilters.push(`content->'metadata'->>'tone' = '${tone}'`);
      if (setting) metadataFilters.push(`content->'metadata'->>'setting' = '${setting}'`);

      if (metadataFilters.length > 0) {
        conditions.push(`(${metadataFilters.join(' OR ')})`);
      }

      // Build ORDER BY clause
      let orderBy = 'a.created_at DESC';
      switch (sortBy) {
        case 'popular':
          orderBy = 'a.view_count DESC, a.created_at DESC';
          break;
        case 'rating':
          orderBy = '(a.rating_sum::float / NULLIF(a.rating_count, 0)) DESC NULLS LAST, a.created_at DESC';
          break;
        case 'downloads':
          orderBy = 'a.download_count DESC, a.created_at DESC';
          break;
        default:
          orderBy = 'a.created_at DESC';
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM adventures a
        JOIN profiles p ON a.user_id = p.id
        ${whereClause}
      `;

      const { rows: countRows } = await query(countQuery, params);
      const totalCount = parseInt(countRows[0].total);

      // Get adventures
      const adventuresQuery = `
        SELECT 
          a.id,
          a.title,
          a.content->>'description' as description,
          a.game_system,
          a.tags,
          a.view_count,
          a.download_count,
          a.rating_sum,
          a.rating_count,
          a.created_at,
          a.content->'metadata' as metadata,
          a.content->'images'->0->>'url' as thumbnail,
          p.id as creator_id,
          p.display_name as creator_name,
          p.tier_name as creator_tier,
          COALESCE(ROUND((a.rating_sum::float / NULLIF(a.rating_count, 0))::numeric, 2), 0) as average_rating
        FROM adventures a
        JOIN profiles p ON a.user_id = p.id
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(limit, offset);

      const { rows } = await query(adventuresQuery, params);

      const adventures: AdventureCard[] = rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        creator: {
          id: row.creator_id,
          displayName: row.creator_name,
          tier: row.creator_tier,
          verified: false // TODO: Implement verification system
        },
        metadata: {
          playerLevel: row.metadata?.playerLevel || '',
          partySize: row.metadata?.partySize || '',
          duration: row.metadata?.duration || '',
          tone: row.metadata?.tone || '',
          setting: row.metadata?.setting || '',
          themes: row.metadata?.themes || [],
          difficulty: row.metadata?.difficulty,
          qualityScore: row.metadata?.qualityScore
        },
        stats: {
          views: row.view_count,
          downloads: row.download_count,
          rating: parseFloat(row.average_rating),
          ratingCount: row.rating_count,
          createdAt: new Date(row.created_at)
        },
        thumbnail: row.thumbnail,
        tags: row.tags || [],
        privacy: 'public',
        gameSystem: row.game_system,
        createdAt: new Date(row.created_at)
      }));

      const totalPages = Math.ceil(totalCount / limit);

      const result = {
        adventures,
        totalCount,
        page,
        totalPages,
        hasMore: page < totalPages
      };

      // Cache the result for 5 minutes
      cacheService.set(cacheKey, result, 300);

      return result;

    } catch (error) {
      console.error('[GALLERY-SERVICE] Failed to get public adventures:', error);
      throw error;
    }
  }

  async getFeaturedAdventures(limit: number = 6): Promise<AdventureCard[]> {
    try {
      // Check cache first (cache for 10 minutes)
      const cached = cacheService.get(CacheKeys.FEATURED_ADVENTURES);
      if (cached) {
        return cached.slice(0, limit);
      }

      const query_text = `
        SELECT 
          a.id,
          a.title,
          a.content->>'description' as description,
          a.game_system,
          a.tags,
          a.view_count,
          a.download_count,
          a.rating_sum,
          a.rating_count,
          a.created_at,
          a.content->'metadata' as metadata,
          a.content->'images'->0->>'url' as thumbnail,
          p.id as creator_id,
          p.display_name as creator_name,
          p.tier_name as creator_tier,
          COALESCE(ROUND((a.rating_sum::float / NULLIF(a.rating_count, 0))::numeric, 2), 0) as average_rating
        FROM adventures a
        JOIN profiles p ON a.user_id = p.id
        WHERE a.privacy = 'public' AND (a.featured = true OR a.rating_count >= 5)
        ORDER BY a.featured DESC, (a.rating_sum::float / NULLIF(a.rating_count, 0)) DESC, a.view_count DESC
        LIMIT $1
      `;

      const { rows } = await query(query_text, [20]); // Get more for cache

      const result = rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        creator: {
          id: row.creator_id,
          displayName: row.creator_name,
          tier: row.creator_tier,
          verified: false
        },
        metadata: {
          playerLevel: row.metadata?.playerLevel || '',
          partySize: row.metadata?.partySize || '',
          duration: row.metadata?.duration || '',
          tone: row.metadata?.tone || '',
          setting: row.metadata?.setting || '',
          themes: row.metadata?.themes || []
        },
        stats: {
          views: row.view_count,
          downloads: row.download_count,
          rating: parseFloat(row.average_rating),
          ratingCount: row.rating_count,
          createdAt: new Date(row.created_at)
        },
        thumbnail: row.thumbnail,
        tags: row.tags || [],
        privacy: 'public',
        gameSystem: row.game_system,
        createdAt: new Date(row.created_at)
      }));

      // Cache for 10 minutes
      cacheService.set(CacheKeys.FEATURED_ADVENTURES, result, 600);

      return result.slice(0, limit);

    } catch (error) {
      console.error('[GALLERY-SERVICE] Failed to get featured adventures:', error);
      return [];
    }
  }

  async getAdventureById(adventureId: string, userId?: string): Promise<any> {
    try {
      const query_text = `
        SELECT 
          a.*,
          p.display_name as creator_name,
          p.tier_name as creator_tier,
          COALESCE(ROUND((a.rating_sum::float / NULLIF(a.rating_count, 0))::numeric, 2), 0) as average_rating,
          ${userId ? `EXISTS(SELECT 1 FROM adventure_favorites af WHERE af.adventure_id = a.id AND af.user_id = $2) as is_favorited,` : 'false as is_favorited,'}
          ${userId ? `(SELECT rating FROM adventure_ratings ar WHERE ar.adventure_id = a.id AND ar.user_id = $2) as user_rating` : 'null as user_rating'}
        FROM adventures a
        JOIN profiles p ON a.user_id = p.id
        WHERE a.id = $1 AND (a.privacy = 'public' OR a.user_id = $${userId ? '2' : '1'})
      `;

      const params = userId ? [adventureId, userId] : [adventureId];
      const { rows } = await query(query_text, params);

      if (rows.length === 0) {
        return null;
      }

      return rows[0];

    } catch (error) {
      console.error('[GALLERY-SERVICE] Failed to get adventure by ID:', error);
      throw error;
    }
  }

  async recordView(adventureId: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // Check if this user/IP has viewed this adventure recently (within 1 hour)
      const recentViewQuery = userId 
        ? `SELECT id FROM adventure_views WHERE adventure_id = $1 AND user_id = $2 AND viewed_at > NOW() - INTERVAL '1 hour' LIMIT 1`
        : `SELECT id FROM adventure_views WHERE adventure_id = $1 AND ip_address = $2 AND viewed_at > NOW() - INTERVAL '1 hour' LIMIT 1`;

      const recentParams = userId ? [adventureId, userId] : [adventureId, ipAddress];
      const { rows: recentViews } = await query(recentViewQuery, recentParams);

      if (recentViews.length > 0) {
        return; // Don't count duplicate views within 1 hour
      }

      await transaction(async (client) => {
        // Record the view
        await client.query(`
          INSERT INTO adventure_views (adventure_id, user_id, ip_address, user_agent)
          VALUES ($1, $2, $3, $4)
        `, [adventureId, userId, ipAddress, userAgent]);

        // Update view count
        await client.query(`
          UPDATE adventures 
          SET view_count = view_count + 1
          WHERE id = $1
        `, [adventureId]);
      });

    } catch (error) {
      console.error('[GALLERY-SERVICE] Failed to record view:', error);
    }
  }

  async recordDownload(adventureId: string, userId?: string, format: string = 'pdf', ipAddress?: string): Promise<void> {
    try {
      await transaction(async (client) => {
        // Record the download
        await client.query(`
          INSERT INTO adventure_downloads (adventure_id, user_id, download_format, ip_address)
          VALUES ($1, $2, $3, $4)
        `, [adventureId, userId, format, ipAddress]);

        // Update download count
        await client.query(`
          UPDATE adventures 
          SET download_count = download_count + 1
          WHERE id = $1
        `, [adventureId]);
      });

    } catch (error) {
      console.error('[GALLERY-SERVICE] Failed to record download:', error);
    }
  }

  async rateAdventure(adventureId: string, userId: string, rating: number, review?: string): Promise<boolean> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      await query(`
        INSERT INTO adventure_ratings (adventure_id, user_id, rating, review)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (adventure_id, user_id)
        DO UPDATE SET rating = $3, review = $4, created_at = NOW()
      `, [adventureId, userId, rating, review]);

      return true;

    } catch (error) {
      console.error('[GALLERY-SERVICE] Failed to rate adventure:', error);
      return false;
    }
  }

  async toggleFavorite(adventureId: string, userId: string): Promise<boolean> {
    try {
      const { rows } = await query(`
        SELECT id FROM adventure_favorites 
        WHERE adventure_id = $1 AND user_id = $2
      `, [adventureId, userId]);

      if (rows.length > 0) {
        // Remove favorite
        await query(`
          DELETE FROM adventure_favorites 
          WHERE adventure_id = $1 AND user_id = $2
        `, [adventureId, userId]);
        return false;
      } else {
        // Add favorite
        await query(`
          INSERT INTO adventure_favorites (adventure_id, user_id)
          VALUES ($1, $2)
        `, [adventureId, userId]);
        return true;
      }

    } catch (error) {
      console.error('[GALLERY-SERVICE] Failed to toggle favorite:', error);
      return false;
    }
  }

  async getUserFavorites(userId: string, page: number = 1, limit: number = 12): Promise<GalleryResponse> {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const { rows: countRows } = await query(`
        SELECT COUNT(*) as total
        FROM adventure_favorites af
        JOIN adventures a ON af.adventure_id = a.id
        WHERE af.user_id = $1 AND a.privacy = 'public'
      `, [userId]);

      const totalCount = parseInt(countRows[0].total);

      // Get favorites
      const { rows } = await query(`
        SELECT 
          a.id,
          a.title,
          a.content->>'description' as description,
          a.game_system,
          a.tags,
          a.view_count,
          a.download_count,
          a.rating_sum,
          a.rating_count,
          a.created_at,
          a.content->'metadata' as metadata,
          a.content->'images'->0->>'url' as thumbnail,
          p.id as creator_id,
          p.display_name as creator_name,
          p.tier_name as creator_tier,
          COALESCE(ROUND((a.rating_sum::float / NULLIF(a.rating_count, 0))::numeric, 2), 0) as average_rating
        FROM adventure_favorites af
        JOIN adventures a ON af.adventure_id = a.id
        JOIN profiles p ON a.user_id = p.id
        WHERE af.user_id = $1 AND a.privacy = 'public'
        ORDER BY af.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      const adventures: AdventureCard[] = rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        creator: {
          id: row.creator_id,
          displayName: row.creator_name,
          tier: row.creator_tier,
          verified: false
        },
        metadata: {
          playerLevel: row.metadata?.playerLevel || '',
          partySize: row.metadata?.partySize || '',
          duration: row.metadata?.duration || '',
          tone: row.metadata?.tone || '',
          setting: row.metadata?.setting || '',
          themes: row.metadata?.themes || []
        },
        stats: {
          views: row.view_count,
          downloads: row.download_count,
          rating: parseFloat(row.average_rating),
          ratingCount: row.rating_count,
          createdAt: new Date(row.created_at)
        },
        thumbnail: row.thumbnail,
        tags: row.tags || [],
        privacy: 'public',
        gameSystem: row.game_system,
        createdAt: new Date(row.created_at)
      }));

      const totalPages = Math.ceil(totalCount / limit);

      return {
        adventures,
        totalCount,
        page,
        totalPages,
        hasMore: page < totalPages
      };

    } catch (error) {
      console.error('[GALLERY-SERVICE] Failed to get user favorites:', error);
      throw error;
    }
  }

  async getCreatorAdventures(creatorId: string, page: number = 1, limit: number = 12): Promise<GalleryResponse> {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const { rows: countRows } = await query(`
        SELECT COUNT(*) as total
        FROM adventures a
        WHERE a.user_id = $1 AND a.privacy = 'public'
      `, [creatorId]);

      const totalCount = parseInt(countRows[0].total);

      // Get adventures
      const { rows } = await query(`
        SELECT 
          a.id,
          a.title,
          a.content->>'description' as description,
          a.game_system,
          a.tags,
          a.view_count,
          a.download_count,
          a.rating_sum,
          a.rating_count,
          a.created_at,
          a.content->'metadata' as metadata,
          a.content->'images'->0->>'url' as thumbnail,
          p.id as creator_id,
          p.display_name as creator_name,
          p.tier_name as creator_tier,
          COALESCE(ROUND((a.rating_sum::float / NULLIF(a.rating_count, 0))::numeric, 2), 0) as average_rating
        FROM adventures a
        JOIN profiles p ON a.user_id = p.id
        WHERE a.user_id = $1 AND a.privacy = 'public'
        ORDER BY a.created_at DESC
        LIMIT $2 OFFSET $3
      `, [creatorId, limit, offset]);

      const adventures: AdventureCard[] = rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        creator: {
          id: row.creator_id,
          displayName: row.creator_name,
          tier: row.creator_tier,
          verified: false
        },
        metadata: {
          playerLevel: row.metadata?.playerLevel || '',
          partySize: row.metadata?.partySize || '',
          duration: row.metadata?.duration || '',
          tone: row.metadata?.tone || '',
          setting: row.metadata?.setting || '',
          themes: row.metadata?.themes || []
        },
        stats: {
          views: row.view_count,
          downloads: row.download_count,
          rating: parseFloat(row.average_rating),
          ratingCount: row.rating_count,
          createdAt: new Date(row.created_at)
        },
        thumbnail: row.thumbnail,
        tags: row.tags || [],
        privacy: 'public',
        gameSystem: row.game_system,
        createdAt: new Date(row.created_at)
      }));

      const totalPages = Math.ceil(totalCount / limit);

      return {
        adventures,
        totalCount,
        page,
        totalPages,
        hasMore: page < totalPages
      };

    } catch (error) {
      console.error('[GALLERY-SERVICE] Failed to get creator adventures:', error);
      throw error;
    }
  }
}