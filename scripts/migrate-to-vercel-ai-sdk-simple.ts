#!/usr/bin/env tsx

/**
 * Simple migration to Vercel AI SDK - just add models without ON CONFLICT
 */

import { query } from '../src/integrations/postgres/client.js';

async function migrateToVercelAI() {
  console.log('🔄 Simple migration to Vercel AI SDK');
  console.log('=====================================\n');

  try {
    // Step 1: Get provider IDs
    const { rows: providers } = await query(`
      SELECT id, name, provider_type FROM llm_providers WHERE is_active = true
    `);

    console.log('📋 Current providers:');
    providers.forEach((p: any) => {
      console.log(`   - ${p.name} (${p.provider_type}) - ID: ${p.id}`);
    });

    // Step 2: Add models for each provider (simple INSERT without conflict handling)
    console.log('\n🤖 Adding models...');

    const anthropicProvider = providers.find((p: any) => p.provider_type === 'anthropic');
    const openaiProvider = providers.find((p: any) => p.provider_type === 'openai');
    const googleProvider = providers.find((p: any) => p.provider_type === 'google');

    if (anthropicProvider) {
      console.log(`   Adding Anthropic models (Provider ID: ${anthropicProvider.id})`);
      
      // Check if models already exist
      const { rows: existingAnthropic } = await query(`
        SELECT model_name FROM llm_models WHERE provider_id = $1
      `, [anthropicProvider.id]);
      
      if (existingAnthropic.length === 0) {
        await query(`
          INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
          VALUES 
            ($1, 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'chat', 8192, 0.7, true, 3.00),
            ($1, 'claude-3-haiku-20240307', 'Claude 3 Haiku', 'chat', 4096, 0.7, true, 0.25)
        `, [anthropicProvider.id]);
        console.log('     ✅ Claude models added');
      } else {
        console.log('     ⚠️  Anthropic models already exist');
      }
    }

    if (openaiProvider) {
      console.log(`   Adding OpenAI models (Provider ID: ${openaiProvider.id})`);
      
      const { rows: existingOpenAI } = await query(`
        SELECT model_name FROM llm_models WHERE provider_id = $1
      `, [openaiProvider.id]);
      
      if (existingOpenAI.length === 0) {
        await query(`
          INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
          VALUES 
            ($1, 'gpt-4o', 'GPT-4o', 'chat', 4096, 0.7, true, 5.00),
            ($1, 'gpt-4o-mini', 'GPT-4o Mini', 'chat', 4096, 0.7, true, 0.15)
        `, [openaiProvider.id]);
        console.log('     ✅ GPT models added');
      } else {
        console.log('     ⚠️  OpenAI models already exist');
      }
    }

    if (googleProvider) {
      console.log(`   Adding Google models (Provider ID: ${googleProvider.id})`);
      
      const { rows: existingGoogle } = await query(`
        SELECT model_name FROM llm_models WHERE provider_id = $1
      `, [googleProvider.id]);
      
      if (existingGoogle.length === 0) {
        await query(`
          INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
          VALUES 
            ($1, 'gemini-1.5-pro', 'Gemini 1.5 Pro', 'chat', 8192, 0.7, true, 1.25),
            ($1, 'gemini-1.5-flash', 'Gemini 1.5 Flash', 'chat', 8192, 0.7, true, 0.075)
        `, [googleProvider.id]);
        console.log('     ✅ Gemini models added');
      } else {
        console.log('     ⚠️  Google models already exist');
      }
    }

    // Step 3: Show final status
    console.log('\n📊 Final configuration:');
    const { rows: finalConfig } = await query(`
      SELECT p.name, p.provider_type, m.display_name, m.model_name, m.cost_per_1m_tokens
      FROM llm_providers p
      JOIN llm_models m ON p.id = m.provider_id
      WHERE p.is_active = true AND m.is_active = true
      ORDER BY p.priority ASC, m.display_name ASC
    `);

    finalConfig.forEach((config: any) => {
      console.log(`   ${config.name}: ${config.display_name} (${config.model_name}) - $${config.cost_per_1m_tokens}/1M tokens`);
    });

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.log('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateToVercelAI().catch(console.error);