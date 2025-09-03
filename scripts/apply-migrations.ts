#!/usr/bin/env tsx

/**
 * Apply Migrations Script
 * 
 * This script applies the LLM providers migration manually
 */

import { createClient } from '@supabase/supabase-js';
import { SEEDER_ENV } from './seed-env';

const supabase = createClient(SEEDER_ENV.SUPABASE_URL, SEEDER_ENV.SUPABASE_SERVICE_ROLE_KEY);

async function applyMigrations() {
  console.log('🚀 Applying LLM Providers Migration...\n');

  try {
    // Apply the LLM providers migration
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Migration: LLM Providers Configuration System
        -- This adds tables for configurable LLM providers and settings

        -- LLM Providers table
        CREATE TABLE IF NOT EXISTS llm_providers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            provider_type VARCHAR(50) NOT NULL,
            base_url VARCHAR(255),
            api_key_env VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            priority INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- LLM Models configuration
        CREATE TABLE IF NOT EXISTS llm_models (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider_id UUID REFERENCES llm_providers(id) ON DELETE CASCADE,
            model_name VARCHAR(100) NOT NULL,
            display_name VARCHAR(100) NOT NULL,
            model_type VARCHAR(50) NOT NULL,
            max_tokens INTEGER,
            temperature DECIMAL(3,2) DEFAULT 0.8,
            is_active BOOLEAN DEFAULT true,
            cost_per_1k_tokens DECIMAL(10,6),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(provider_id, model_name)
        );

        -- Image Generation Providers
        CREATE TABLE IF NOT EXISTS image_providers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            provider_type VARCHAR(50) NOT NULL,
            base_url VARCHAR(255),
            api_key_env VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            priority INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Image Models configuration
        CREATE TABLE IF NOT EXISTS image_models (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider_id UUID REFERENCES image_providers(id) ON DELETE CASCADE,
            model_name VARCHAR(100) NOT NULL,
            display_name VARCHAR(100) NOT NULL,
            image_size VARCHAR(20) DEFAULT '1024x1024',
            quality VARCHAR(20) DEFAULT 'high',
            is_active BOOLEAN DEFAULT true,
            cost_per_image DECIMAL(10,6),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(provider_id, model_name)
        );

        -- System Configuration
        CREATE TABLE IF NOT EXISTS system_config (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            key VARCHAR(100) NOT NULL UNIQUE,
            value JSONB NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_llm_providers_active ON llm_providers(is_active);
        CREATE INDEX IF NOT EXISTS idx_llm_models_active ON llm_models(is_active);
        CREATE INDEX IF NOT EXISTS idx_image_providers_active ON image_providers(is_active);
        CREATE INDEX IF NOT EXISTS idx_image_models_active ON image_models(is_active);
        CREATE INDEX IF NOT EXISTS idx_llm_models_provider ON llm_models(provider_id);
        CREATE INDEX IF NOT EXISTS idx_image_models_provider ON image_models(provider_id);
      `
    });

    if (error) {
      console.error('❌ Error applying migrations:', error);
      return;
    }

    console.log('✅ Migrations applied successfully!');

    // Insert default data
    console.log('📝 Inserting default data...');

    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Insert default LLM providers
        INSERT INTO llm_providers (name, provider_type, base_url, api_key_env, priority) VALUES
        ('OpenRouter', 'openrouter', 'https://openrouter.ai/api/v1', 'OPENROUTER_API_KEY', 1),
        ('OpenAI', 'openai', 'https://api.openai.com/v1', 'OPENAI_API_KEY', 2),
        ('Anthropic', 'anthropic', 'https://api.anthropic.com', 'ANTHROPIC_API_KEY', 3),
        ('Google Gemini', 'google', 'https://generativelanguage.googleapis.com', 'GOOGLE_API_KEY', 4)
        ON CONFLICT (name) DO NOTHING;

        -- Insert default image providers
        INSERT INTO image_providers (name, provider_type, base_url, api_key_env, priority) VALUES
        ('Fal.ai', 'fal_ai', 'https://fal.run', 'FAL_API_KEY', 1),
        ('OpenAI DALL-E', 'openai', 'https://api.openai.com/v1', 'OPENAI_API_KEY', 2),
        ('Stability AI', 'stability', 'https://api.stability.ai', 'STABILITY_API_KEY', 3)
        ON CONFLICT (name) DO NOTHING;
      `
    });

    if (insertError) {
      console.error('❌ Error inserting default data:', insertError);
      return;
    }

    console.log('✅ Default data inserted successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run migrations
if (import.meta.main) {
  applyMigrations().catch(console.error);
} 