import { Pool } from 'pg';

class DatabaseOptimizer {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Create optimized indexes for tier limit checks
  async createTierOptimizationIndexes(): Promise<void> {
    const indexes = [
      // User tier and usage tracking indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_tier_usage 
       ON users (tier, generations_used, private_slots_used, period_start)`,
      
      // Adventure gallery indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_adventures_gallery 
       ON adventures (privacy, created_at, game_system, level_range) 
       WHERE privacy = 'public'`,
      
      // Adventure stats for trending
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_adventure_stats_trending 
       ON adventure_stats (views, downloads, rating, created_at)`,
      
      // Search optimization
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_adventures_search 
       ON adventures USING gin(to_tsvector('english', title || ' ' || description))
       WHERE privacy = 'public'`,
      
      // User adventures for library
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_adventures_user_library 
       ON adventures (user_id, created_at, privacy)`,
      
      // Billing and subscription indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_billing 
       ON users (stripe_customer_id, subscription_status, tier)`
    ];

    for (const indexQuery of indexes) {
      try {
        await this.pool.query(indexQuery);
        console.log('Created index:', indexQuery.split('idx_')[1]?.split(' ')[0]);
      } catch (error) {
        console.error('Error creating index:', error);
      }
    }
  }

  // Optimized query for tier limit checking
  async checkTierLimitsOptimized(userId: string): Promise<any> {
    const query = `
      SELECT 
        u.tier,
        u.generations_used,
        u.private_slots_used,
        u.period_start,
        tc.generation_limit,
        tc.private_adventure_limit,
        CASE 
          WHEN u.period_start < NOW() - INTERVAL '1 month' THEN true
          ELSE false
        END as needs_reset
      FROM users u
      JOIN tier_config tc ON u.tier = tc.tier_name
      WHERE u.id = $1
    `;
    
    const result = await this.pool.query(query, [userId]);
    return result.rows[0];
  }

  // Optimized gallery query with pagination
  async getGalleryContentOptimized(
    page: number = 1, 
    limit: number = 20, 
    filters: any = {}
  ): Promise<any> {
    const offset = (page - 1) * limit;
    let whereConditions = ['a.privacy = $1'];
    let params: any[] = ['public'];
    let paramIndex = 2;

    // Add filters
    if (filters.gameSystem) {
      whereConditions.push(`a.game_system = $${paramIndex}`);
      params.push(filters.gameSystem);
      paramIndex++;
    }

    if (filters.levelRange) {
      whereConditions.push(`a.level_range && $${paramIndex}`);
      params.push(filters.levelRange);
      paramIndex++;
    }

    if (filters.search) {
      whereConditions.push(`to_tsvector('english', a.title || ' ' || a.description) @@ plainto_tsquery('english', $${paramIndex})`);
      params.push(filters.search);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    
    const query = `
      SELECT 
        a.id,
        a.title,
        a.description,
        a.game_system,
        a.level_range,
        a.created_at,
        a.thumbnail_url,
        u.username as creator_name,
        u.tier as creator_tier,
        COALESCE(ast.views, 0) as views,
        COALESCE(ast.downloads, 0) as downloads,
        COALESCE(ast.rating, 0) as rating,
        COALESCE(ast.rating_count, 0) as rating_count
      FROM adventures a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN adventure_stats ast ON a.id = ast.adventure_id
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN $${paramIndex} = 'newest' THEN a.created_at END DESC,
        CASE WHEN $${paramIndex} = 'popular' THEN ast.views END DESC,
        CASE WHEN $${paramIndex} = 'rating' THEN ast.rating END DESC,
        a.created_at DESC
      LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
    `;

    params.push(filters.sortBy || 'newest', limit, offset);

    const result = await this.pool.query(query, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM adventures a
      WHERE ${whereClause}
    `;
    
    const countResult = await this.pool.query(countQuery, params.slice(0, -3));
    
    return {
      adventures: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
    };
  }

  // Optimized trending content query
  async getTrendingContentOptimized(limit: number = 10): Promise<any> {
    const query = `
      SELECT 
        a.id,
        a.title,
        a.description,
        a.thumbnail_url,
        u.username as creator_name,
        ast.views,
        ast.downloads,
        ast.rating,
        ast.rating_count,
        -- Trending score calculation
        (
          (ast.views * 0.3) + 
          (ast.downloads * 0.4) + 
          (ast.rating * ast.rating_count * 0.3) +
          -- Recency boost
          (EXTRACT(EPOCH FROM (NOW() - a.created_at)) / 86400 * -0.1)
        ) as trending_score
      FROM adventures a
      JOIN users u ON a.user_id = u.id
      JOIN adventure_stats ast ON a.id = ast.adventure_id
      WHERE a.privacy = 'public'
        AND a.created_at > NOW() - INTERVAL '30 days'
        AND ast.views > 0
      ORDER BY trending_score DESC
      LIMIT $1
    `;

    const result = await this.pool.query(query, [limit]);
    return result.rows;
  }

  // Database maintenance and optimization
  async runMaintenanceTasks(): Promise<void> {
    const tasks = [
      'VACUUM ANALYZE adventures;',
      'VACUUM ANALYZE users;',
      'VACUUM ANALYZE adventure_stats;',
      'REINDEX INDEX CONCURRENTLY idx_adventures_gallery;',
      'REINDEX INDEX CONCURRENTLY idx_adventure_stats_trending;'
    ];

    for (const task of tasks) {
      try {
        await this.pool.query(task);
        console.log('Completed maintenance task:', task);
      } catch (error) {
        console.error('Error in maintenance task:', error);
      }
    }
  }

  // Query performance monitoring
  async getSlowQueries(): Promise<any> {
    const query = `
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      WHERE mean_time > 100
      ORDER BY mean_time DESC
      LIMIT 10
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.log('pg_stat_statements extension not available');
      return [];
    }
  }
}

export default DatabaseOptimizer;