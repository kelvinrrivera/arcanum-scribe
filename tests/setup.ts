import { beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

let testPool: Pool;

beforeAll(async () => {
  // Setup test database
  testPool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
  });

  // Create test tables if they don't exist
  await createTestTables();
});

afterAll(async () => {
  // Cleanup and close connections
  if (testPool) {
    await testPool.end();
  }
});

async function createTestTables() {
  const createTablesSQL = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255),
      tier VARCHAR(20) DEFAULT 'explorer',
      generations_used INTEGER DEFAULT 0,
      private_slots_used INTEGER DEFAULT 0,
      period_start TIMESTAMP DEFAULT NOW(),
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      subscription_status VARCHAR(50) DEFAULT 'inactive',
      migrated_at TIMESTAMP,
      migration_notes TEXT,
      migration_notification_sent TIMESTAMP,
      payment_failed_at TIMESTAMP,
      tier_change_effective_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Tier configuration table
    CREATE TABLE IF NOT EXISTS tier_config (
      id SERIAL PRIMARY KEY,
      tier_name VARCHAR(20) UNIQUE NOT NULL,
      generation_limit INTEGER NOT NULL,
      private_adventure_limit INTEGER NOT NULL, -- -1 for unlimited
      features JSONB DEFAULT '{}',
      price_monthly INTEGER DEFAULT 0, -- in cents
      stripe_price_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Adventures table
    CREATE TABLE IF NOT EXISTS adventures (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      content JSONB NOT NULL,
      game_system VARCHAR(100),
      level_range INTEGER[],
      privacy VARCHAR(20) DEFAULT 'public',
      thumbnail_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Adventure stats table
    CREATE TABLE IF NOT EXISTS adventure_stats (
      id SERIAL PRIMARY KEY,
      adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
      views INTEGER DEFAULT 0,
      downloads INTEGER DEFAULT 0,
      rating DECIMAL(3,2) DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(adventure_id)
    );

    -- Adventure ratings table
    CREATE TABLE IF NOT EXISTS adventure_ratings (
      id SERIAL PRIMARY KEY,
      adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      review TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(adventure_id, user_id)
    );

    -- Migration log table
    CREATE TABLE IF NOT EXISTS migration_log (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES users(id),
      old_tier VARCHAR(50),
      new_tier VARCHAR(50),
      migration_date TIMESTAMP DEFAULT NOW(),
      migration_reason TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Search stats table
    CREATE TABLE IF NOT EXISTS search_stats (
      id SERIAL PRIMARY KEY,
      query VARCHAR(255) NOT NULL,
      result_count INTEGER DEFAULT 0,
      search_count INTEGER DEFAULT 1,
      search_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(query, search_date)
    );

    -- Insert default tier configurations
    INSERT INTO tier_config (tier_name, generation_limit, private_adventure_limit, features, price_monthly)
    VALUES 
      ('explorer', 0, 0, '{"gallery_access": true, "rating": true, "bookmarks": true}', 0),
      ('creator', 15, 3, '{"generation": true, "analytics": true, "creator_badge": true}', 999),
      ('master', 50, -1, '{"priority_queue": true, "advanced_export": true, "private_default": true}', 2999)
    ON CONFLICT (tier_name) DO NOTHING;

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
    CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
    CREATE INDEX IF NOT EXISTS idx_adventures_user_privacy ON adventures(user_id, privacy);
    CREATE INDEX IF NOT EXISTS idx_adventures_public ON adventures(privacy, created_at) WHERE privacy = 'public';
    CREATE INDEX IF NOT EXISTS idx_adventure_stats_adventure ON adventure_stats(adventure_id);
  `;

  try {
    await testPool.query(createTablesSQL);
    console.log('✅ Test tables created successfully');
  } catch (error) {
    console.error('❌ Error creating test tables:', error);
    throw error;
  }
}

export { testPool };