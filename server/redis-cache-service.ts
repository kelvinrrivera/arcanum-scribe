import Redis from 'ioredis';

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

class RedisCacheService {
  private redis: Redis;
  private defaultTTL = 3600; // 1 hour

  constructor(config: CacheConfig) {
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  // Gallery content caching
  async cacheGalleryPage(page: number, filters: any, data: any, ttl = 300): Promise<void> {
    const key = this.generateGalleryKey(page, filters);
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  async getGalleryPage(page: number, filters: any): Promise<any | null> {
    const key = this.generateGalleryKey(page, filters);
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Adventure details caching
  async cacheAdventure(adventureId: string, data: any, ttl = 1800): Promise<void> {
    const key = `adventure:${adventureId}`;
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  async getAdventure(adventureId: string): Promise<any | null> {
    const key = `adventure:${adventureId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // User tier limits caching
  async cacheTierLimits(userId: string, limits: any, ttl = 900): Promise<void> {
    const key = `tier_limits:${userId}`;
    await this.redis.setex(key, ttl, JSON.stringify(limits));
  }

  async getTierLimits(userId: string): Promise<any | null> {
    const key = `tier_limits:${userId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Search results caching
  async cacheSearchResults(query: string, filters: any, results: any, ttl = 600): Promise<void> {
    const key = this.generateSearchKey(query, filters);
    await this.redis.setex(key, ttl, JSON.stringify(results));
  }

  async getSearchResults(query: string, filters: any): Promise<any | null> {
    const key = this.generateSearchKey(query, filters);
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Trending content caching
  async cacheTrendingContent(data: any, ttl = 1800): Promise<void> {
    await this.redis.setex('trending_content', ttl, JSON.stringify(data));
  }

  async getTrendingContent(): Promise<any | null> {
    const cached = await this.redis.get('trending_content');
    return cached ? JSON.parse(cached) : null;
  }

  // Cache invalidation
  async invalidateGalleryCache(): Promise<void> {
    const keys = await this.redis.keys('gallery:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async invalidateAdventureCache(adventureId: string): Promise<void> {
    await this.redis.del(`adventure:${adventureId}`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const keys = await this.redis.keys(`*:${userId}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Utility methods
  private generateGalleryKey(page: number, filters: any): string {
    const filterStr = JSON.stringify(filters);
    const hash = this.simpleHash(filterStr);
    return `gallery:page:${page}:${hash}`;
  }

  private generateSearchKey(query: string, filters: any): string {
    const filterStr = JSON.stringify(filters);
    const hash = this.simpleHash(query + filterStr);
    return `search:${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }
}

export default RedisCacheService;