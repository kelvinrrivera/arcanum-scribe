import { Pool } from 'pg';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  game_system: string;
  level_range: number[];
  creator_name: string;
  views: number;
  downloads: number;
  rating: number;
  relevance_score: number;
}

class SearchIndexer {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Initialize full-text search indexes
  async initializeSearchIndexes(): Promise<void> {
    const queries = [
      // Create full-text search index
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_adventures_fulltext 
       ON adventures USING gin(to_tsvector('english', title || ' ' || description || ' ' || game_system))
       WHERE privacy = 'public'`,
      
      // Create trigram index for fuzzy search
      `CREATE EXTENSION IF NOT EXISTS pg_trgm`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_adventures_trigram 
       ON adventures USING gin(title gin_trgm_ops, description gin_trgm_ops)
       WHERE privacy = 'public'`,
      
      // Create composite index for filtered searches
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_adventures_search_composite 
       ON adventures (game_system, level_range, created_at)
       WHERE privacy = 'public'`
    ];

    for (const query of queries) {
      try {
        await this.pool.query(query);
        console.log('Search index created successfully');
      } catch (error) {
        console.error('Error creating search index:', error);
      }
    }
  }

  // Advanced search with relevance scoring
  async searchAdventures(
    searchQuery: string,
    filters: {
      gameSystem?: string;
      levelRange?: number[];
      minRating?: number;
      sortBy?: 'relevance' | 'newest' | 'popular' | 'rating';
    } = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ results: SearchResult[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    let whereConditions = ['a.privacy = $1'];
    let params: any[] = ['public'];
    let paramIndex = 2;

    // Add search query
    let searchCondition = '';
    if (searchQuery && searchQuery.trim()) {
      // Use both full-text search and trigram similarity
      searchCondition = `
        AND (
          to_tsvector('english', a.title || ' ' || a.description || ' ' || a.game_system) 
          @@ plainto_tsquery('english', $${paramIndex})
          OR similarity(a.title, $${paramIndex}) > 0.3
          OR similarity(a.description, $${paramIndex}) > 0.2
        )
      `;
      params.push(searchQuery.trim());
      paramIndex++;
    }

    // Add filters
    if (filters.gameSystem) {
      whereConditions.push(`a.game_system = $${paramIndex}`);
      params.push(filters.gameSystem);
      paramIndex++;
    }

    if (filters.levelRange && filters.levelRange.length === 2) {
      whereConditions.push(`a.level_range && $${paramIndex}`);
      params.push(filters.levelRange);
      paramIndex++;
    }

    if (filters.minRating) {
      whereConditions.push(`COALESCE(ast.rating, 0) >= $${paramIndex}`);
      params.push(filters.minRating);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Build relevance score calculation
    let relevanceScore = '1.0';
    if (searchQuery && searchQuery.trim()) {
      relevanceScore = `
        (
          -- Title match boost
          CASE WHEN a.title ILIKE '%' || $2 || '%' THEN 2.0 ELSE 1.0 END *
          -- Full-text search rank
          COALESCE(ts_rank(to_tsvector('english', a.title || ' ' || a.description), plainto_tsquery('english', $2)), 0) * 10 +
          -- Trigram similarity
          GREATEST(similarity(a.title, $2), similarity(a.description, $2)) * 5 +
          -- Stats boost
          (COALESCE(ast.views, 0) * 0.001) +
          (COALESCE(ast.downloads, 0) * 0.002) +
          (COALESCE(ast.rating, 0) * COALESCE(ast.rating_count, 0) * 0.1)
        )
      `;
    }

    // Build ORDER BY clause
    let orderBy = '';
    switch (filters.sortBy) {
      case 'relevance':
        orderBy = `ORDER BY relevance_score DESC, a.created_at DESC`;
        break;
      case 'newest':
        orderBy = `ORDER BY a.created_at DESC`;
        break;
      case 'popular':
        orderBy = `ORDER BY COALESCE(ast.views, 0) DESC, a.created_at DESC`;
        break;
      case 'rating':
        orderBy = `ORDER BY COALESCE(ast.rating, 0) DESC, COALESCE(ast.rating_count, 0) DESC, a.created_at DESC`;
        break;
      default:
        orderBy = searchQuery ? `ORDER BY relevance_score DESC, a.created_at DESC` : `ORDER BY a.created_at DESC`;
    }

    const searchQuerySql = `
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
        COALESCE(ast.rating_count, 0) as rating_count,
        ${relevanceScore} as relevance_score
      FROM adventures a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN adventure_stats ast ON a.id = ast.adventure_id
      WHERE ${whereClause} ${searchCondition}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await this.pool.query(searchQuerySql, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM adventures a
      LEFT JOIN adventure_stats ast ON a.id = ast.adventure_id
      WHERE ${whereClause} ${searchCondition}
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await this.pool.query(countQuery, countParams);

    return {
      results: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
    };
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const suggestionQuery = `
      SELECT DISTINCT
        CASE 
          WHEN title ILIKE $1 THEN title
          WHEN game_system ILIKE $1 THEN game_system
          ELSE NULL
        END as suggestion
      FROM adventures
      WHERE privacy = 'public'
        AND (title ILIKE $1 OR game_system ILIKE $1)
        AND CASE 
          WHEN title ILIKE $1 THEN title
          WHEN game_system ILIKE $1 THEN game_system
          ELSE NULL
        END IS NOT NULL
      ORDER BY suggestion
      LIMIT $2
    `;

    const result = await this.pool.query(suggestionQuery, [`%${query}%`, limit]);
    return result.rows.map(row => row.suggestion);
  }

  // Update search statistics
  async updateSearchStats(query: string, resultCount: number): Promise<void> {
    const updateQuery = `
      INSERT INTO search_stats (query, result_count, search_date)
      VALUES ($1, $2, NOW())
      ON CONFLICT (query, DATE(search_date))
      DO UPDATE SET 
        search_count = search_stats.search_count + 1,
        result_count = $2
    `;

    try {
      await this.pool.query(updateQuery, [query.toLowerCase().trim(), resultCount]);
    } catch (error) {
      // Table might not exist, create it
      await this.createSearchStatsTable();
      await this.pool.query(updateQuery, [query.toLowerCase().trim(), resultCount]);
    }
  }

  // Create search stats table
  private async createSearchStatsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS search_stats (
        id SERIAL PRIMARY KEY,
        query VARCHAR(255) NOT NULL,
        result_count INTEGER DEFAULT 0,
        search_count INTEGER DEFAULT 1,
        search_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(query, search_date)
      )
    `;

    await this.pool.query(createTableQuery);
    
    // Create index for search stats
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_search_stats_query_date 
      ON search_stats (query, search_date)
    `);
  }

  // Get popular search terms
  async getPopularSearchTerms(limit: number = 10): Promise<any[]> {
    const query = `
      SELECT 
        query,
        SUM(search_count) as total_searches,
        AVG(result_count) as avg_results
      FROM search_stats
      WHERE search_date > NOW() - INTERVAL '30 days'
      GROUP BY query
      HAVING SUM(search_count) > 1
      ORDER BY total_searches DESC
      LIMIT $1
    `;

    try {
      const result = await this.pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      return [];
    }
  }
}

export default SearchIndexer;