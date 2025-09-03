import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
  console.log('🏗️  Initializing database schema...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
  });

  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255),
        tier VARCHAR(20) DEFAULT 'reader',
        subscription_tier VARCHAR(20) DEFAULT 'reader',
        magic_credits INTEGER DEFAULT 0,
        credits_used INTEGER DEFAULT 0,
        downloads_used INTEGER DEFAULT 0,
        period_start TIMESTAMP DEFAULT NOW(),
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        subscription_status VARCHAR(50) DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        migrated_to_credits_at TIMESTAMP,
        credits_migration_notification_sent TIMESTAMP,
        migration_notes TEXT
      )
    `);

    // Create profiles table (for compatibility)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255),
        display_name VARCHAR(100),
        avatar_url TEXT,
        bio TEXT,
        website VARCHAR(255),
        twitter VARCHAR(100),
        github VARCHAR(100),
        tier_name VARCHAR(20) DEFAULT 'reader',
        generations_used INTEGER DEFAULT 0,
        private_adventures_used INTEGER DEFAULT 0,
        usage_period_start TIMESTAMP DEFAULT NOW(),
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create adventures table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS adventures (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        content JSONB NOT NULL,
        game_system VARCHAR(50) DEFAULT 'dnd5e',
        privacy VARCHAR(20) DEFAULT 'public',
        tags TEXT[],
        rating_average DECIMAL(3,2) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        download_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create credit transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        transaction_type VARCHAR(50) NOT NULL,
        action_type VARCHAR(50),
        amount INTEGER NOT NULL,
        reason TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create download logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS download_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create tier changes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tier_changes (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        previous_tier VARCHAR(20),
        new_tier VARCHAR(20) NOT NULL,
        change_reason VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create admin tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS llm_providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        provider_type VARCHAR(50) NOT NULL,
        base_url VARCHAR(500) NOT NULL,
        api_key_env VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 50,
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS llm_models (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID REFERENCES llm_providers(id) ON DELETE CASCADE,
        model_name VARCHAR(200) NOT NULL,
        display_name VARCHAR(200) NOT NULL,
        model_type VARCHAR(50) DEFAULT 'chat',
        max_tokens INTEGER DEFAULT 4096,
        temperature DECIMAL(3,2) DEFAULT 0.7,
        top_p DECIMAL(3,2) DEFAULT 1.0,
        frequency_penalty DECIMAL(3,2) DEFAULT 0.0,
        presence_penalty DECIMAL(3,2) DEFAULT 0.0,
        is_active BOOLEAN DEFAULT true,
        cost_per_1k_tokens DECIMAL(10,6) DEFAULT 0,
        context_window INTEGER DEFAULT 4096,
        supports_functions BOOLEAN DEFAULT false,
        supports_vision BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS image_providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        provider_type VARCHAR(50) NOT NULL,
        base_url VARCHAR(500) NOT NULL,
        api_key_env VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 50,
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS image_models (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID REFERENCES image_providers(id) ON DELETE CASCADE,
        model_name VARCHAR(200) NOT NULL,
        display_name VARCHAR(200) NOT NULL,
        image_size VARCHAR(50) DEFAULT '1024x1024',
        quality VARCHAR(20) DEFAULT 'standard',
        style VARCHAR(100) DEFAULT 'natural',
        is_active BOOLEAN DEFAULT true,
        cost_per_image DECIMAL(10,6) DEFAULT 0,
        max_batch_size INTEGER DEFAULT 1,
        supports_negative_prompt BOOLEAN DEFAULT false,
        supports_controlnet BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS prompt_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        provider_id UUID,
        model_id UUID,
        prompt_type VARCHAR(50) NOT NULL,
        prompt_text TEXT NOT NULL,
        response_text TEXT,
        tokens_used INTEGER DEFAULT 0,
        cost DECIMAL(10,6) DEFAULT 0,
        response_time_ms INTEGER DEFAULT 0,
        success BOOLEAN DEFAULT true,
        error_message TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invitation_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        used_by UUID REFERENCES users(id) ON DELETE SET NULL,
        max_uses INTEGER DEFAULT 1,
        current_uses INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        used_at TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_adventures_user_id ON adventures(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_adventures_privacy ON adventures(privacy)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_adventures_created_at ON adventures(created_at)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_prompt_logs_user_id ON prompt_logs(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_prompt_logs_created_at ON prompt_logs(created_at)`);

    console.log('✅ Database schema created successfully!');

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@arcanum-scribe.com';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';

    const existingAdmin = await pool.query(`
      SELECT id FROM users WHERE email = $1
    `, [adminEmail]);

    if (existingAdmin.rows.length === 0) {
      const adminUser = await pool.query(`
        INSERT INTO users (email, username, tier, subscription_tier, magic_credits)
        VALUES ($1, $2, 'admin', 'admin', 1000)
        RETURNING id
      `, [adminEmail, adminUsername]);

      // Create profile for admin
      await pool.query(`
        INSERT INTO profiles (id, email, display_name, tier_name)
        VALUES ($1, $2, $3, 'admin')
      `, [adminUser.rows[0].id, adminEmail, adminUsername]);

      console.log(`✅ Admin user created: ${adminEmail}`);
      console.log('⚠️  Please set a password using the security fix script!');
    } else {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
    }

    console.log('🎉 Database initialization completed!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase().catch(console.error);