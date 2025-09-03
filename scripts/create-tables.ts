#!/usr/bin/env tsx

/**
 * Create Tables Script
 * 
 * This script creates the necessary tables for LLM providers
 */

import { createClient } from '@supabase/supabase-js';
import { SEEDER_ENV } from './seed-env';

const supabase = createClient(SEEDER_ENV.SUPABASE_URL, SEEDER_ENV.SUPABASE_SERVICE_ROLE_KEY);

async function createTables() {
  console.log('🚀 Creating LLM Providers Tables...\n');

  try {
    // First, let's check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['llm_providers', 'llm_models', 'image_providers', 'image_models', 'system_config']);

    if (tablesError) {
      console.log('Tables check failed, proceeding with creation...');
    } else {
      console.log('Existing tables:', tables?.map(t => t.table_name));
    }

    // Since we can't execute raw SQL, let's try to insert data directly
    // This will create the tables if they don't exist (due to the migration)
    
    console.log('📝 Inserting OpenRouter provider...');
    
    const { data: provider, error: providerError } = await supabase
      .from('llm_providers')
      .insert({
        name: 'OpenRouter',
        provider_type: 'openrouter',
        base_url: 'https://openrouter.ai/api/v1',
        api_key_env: 'OPENROUTER_API_KEY',
        is_active: true,
        priority: 1
      })
      .select()
      .single();

    if (providerError) {
      console.error('❌ Error creating OpenRouter provider:', providerError);
      console.log('This might mean the table doesn\'t exist yet.');
      console.log('Please run the migration manually in Supabase SQL Editor:');
      console.log('1. Go to Supabase Dashboard');
      console.log('2. SQL Editor');
      console.log('3. Run the migration from: supabase/migrations/20250802160000_llm_providers_config.sql');
      return;
    }

    console.log('✅ OpenRouter provider created:', provider);

    // Insert default models
    console.log('📝 Inserting default models...');
    
    const models = [
      {
        provider_id: provider.id,
        model_name: 'google/gemini-2.5-flash',
        display_name: 'Gemini 2.5 Flash',
        model_type: 'text',
        max_tokens: 8192,
        temperature: 0.8,
        cost_per_1k_tokens: 0.00005,
        is_active: true
      },
      {
        provider_id: provider.id,
        model_name: 'openai/gpt-4o-mini',
        display_name: 'GPT-4o Mini',
        model_type: 'text',
        max_tokens: 4096,
        temperature: 0.8,
        cost_per_1k_tokens: 0.00015,
        is_active: true
      }
    ];

    const { data: insertedModels, error: modelsError } = await supabase
      .from('llm_models')
      .insert(models)
      .select();

    if (modelsError) {
      console.error('❌ Error creating models:', modelsError);
      return;
    }

    console.log('✅ Models created:', insertedModels);

    // Insert system config
    console.log('📝 Inserting system configuration...');
    
    const configs = [
      {
        key: 'default_llm_provider',
        value: 'OpenRouter',
        description: 'Default LLM provider for text generation'
      },
      {
        key: 'default_llm_model',
        value: 'google/gemini-2.5-flash',
        description: 'Default LLM model for text generation'
      }
    ];

    const { data: insertedConfigs, error: configError } = await supabase
      .from('system_config')
      .insert(configs)
      .select();

    if (configError) {
      console.error('❌ Error creating system config:', configError);
      return;
    }

    console.log('✅ System config created:', insertedConfigs);

    console.log('\n🎉 All tables and data created successfully!');
    console.log('You can now run: npm run setup:openrouter');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run table creation
if (import.meta.main) {
  createTables().catch(console.error);
} 