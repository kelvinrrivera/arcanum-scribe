#!/usr/bin/env tsx
import { query } from '../src/integrations/postgres/client';

async function createMissingTables() {
  console.log('🔧 Creating missing admin tables...');
  
  try {
    // Create invite_codes table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(255) UNIQUE NOT NULL,
        max_uses INTEGER DEFAULT 1,
        current_uses INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('✅ Created/verified invite_codes table');

    // Create prompt_logs table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS prompt_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        prompt_type VARCHAR(50),
        prompt_text TEXT,
        response_text TEXT,
        tokens_used INTEGER DEFAULT 0,
        cost DECIMAL(10,6) DEFAULT 0,
        response_time_ms INTEGER,
        success BOOLEAN DEFAULT true,
        error_message TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata JSONB
      )
    `);
    console.log('✅ Created/verified prompt_logs table');

    // Verify existing tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'llm_providers', 'llm_models', 'fal_models')
      ORDER BY table_name
    `);

    console.log('\n📊 Available tables:');
    tables.rows.forEach((table: any) => {
      console.log(`  ✅ ${table.table_name}`);
    });

    console.log('\n🎉 All admin tables ready!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createMissingTables();