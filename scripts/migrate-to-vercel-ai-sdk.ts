#!/usr/bin/env tsx

/**
 * Migrate from OpenRouter to Vercel AI SDK
 * Clean up old OpenRouter data and setup new providers
 */

import { query } from '../src/integrations/postgres/client.js';

async function migrateToVercelAI() {
  console.log('🔄 Migrating from OpenRouter to Vercel AI SDK');
  console.log('==============================================\n');

  try {
    // Step 1: Remove all OpenRouter data
    console.log('🗑️  Removing OpenRouter data...');
    
    // Delete OpenRouter models first (foreign key constraint)
    const { rowCount: modelsDeleted } = await query(`
      DELETE FROM llm_models 
      WHERE provider_id IN (
        SELECT id FROM llm_providers WHERE provider_type = 'openrouter'
      )
    `);
    console.log(`   Deleted ${modelsDeleted} OpenRouter models`);

    // Delete OpenRouter providers
    const { rowCount: providersDeleted } = await query(`
      DELETE FROM llm_providers WHERE provider_type = 'openrouter'
    `);
    console.log(`   Deleted ${providersDeleted} OpenRouter providers`);

    // Step 2: Add new Vercel AI SDK providers
    console.log('\n🆕 Adding Vercel AI SDK providers...');

    // Add Anthropic provider
    const anthropicResult = await query(`
      INSERT INTO llm_providers (name, provider_type, base_url, api_key_env, is_active, priority)
      VALUES ('Anthropic', 'anthropic', 'https://api.anthropic.com', 'ANTHROPIC_API_KEY', true, 1)
      RETURNING id
    `);
    const anthropicId = anthropicResult.rows[0].id;
    console.log('   ✅ Anthropic provider added');

    // Add OpenAI provider
    const openaiResult = await query(`
      INSERT INTO llm_providers (name, provider_type, base_url, api_key_env, is_active, priority)
      VALUES ('OpenAI', 'openai', 'https://api.openai.com/v1', 'OPENAI_API_KEY', true, 2)
      RETURNING id
    `);
    const openaiId = openaiResult.rows[0].id;
    console.log('   ✅ OpenAI provider added');

    // Add Google provider
    const googleResult = await query(`
      INSERT INTO llm_providers (name, provider_type, base_url, api_key_env, is_active, priority)
      VALUES ('Google', 'google', 'https://generativelanguage.googleapis.com', 'GOOGLE_GENERATIVE_AI_API_KEY', true, 3)
      RETURNING id
    `);
    const googleId = googleResult.rows[0].id;
    console.log('   ✅ Google provider added');

    // Step 3: Add default models for each provider
    console.log('\n🤖 Adding default models...');

    // Anthropic models
    await query(`
      INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
      VALUES 
        ($1, 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'chat', 8192, 0.7, true, 3.00),
        ($1, 'claude-3-haiku-20240307', 'Claude 3 Haiku', 'chat', 4096, 0.7, true, 0.25)
      ON CONFLICT (provider_id, model_name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        max_tokens = EXCLUDED.max_tokens,
        temperature = EXCLUDED.temperature,
        is_active = EXCLUDED.is_active,
        cost_per_1m_tokens = EXCLUDED.cost_per_1m_tokens
    `, [anthropicId]);
    console.log('   ✅ Anthropic models added');

    // OpenAI models
    await query(`
      INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
      VALUES 
        ($1, 'gpt-4o', 'GPT-4o', 'chat', 4096, 0.7, true, 5.00),
        ($1, 'gpt-4o-mini', 'GPT-4o Mini', 'chat', 4096, 0.7, true, 0.15)
      ON CONFLICT (provider_id, model_name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        max_tokens = EXCLUDED.max_tokens,
        temperature = EXCLUDED.temperature,
        is_active = EXCLUDED.is_active,
        cost_per_1m_tokens = EXCLUDED.cost_per_1m_tokens
    `, [openaiId]);
    console.log('   ✅ OpenAI models added');

    // Google models
    await query(`
      INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
      VALUES 
        ($1, 'gemini-1.5-pro', 'Gemini 1.5 Pro', 'chat', 8192, 0.7, true, 1.25),
        ($1, 'gemini-1.5-flash', 'Gemini 1.5 Flash', 'chat', 8192, 0.7, true, 0.075)
      ON CONFLICT (provider_id, model_name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        max_tokens = EXCLUDED.max_tokens,
        temperature = EXCLUDED.temperature,
        is_active = EXCLUDED.is_active,
        cost_per_1m_tokens = EXCLUDED.cost_per_1m_tokens
    `, [googleId]);
    console.log('   ✅ Google models added');

    // Step 4: Show current configuration
    console.log('\n📊 Current LLM Configuration:');
    const { rows: providers } = await query(`
      SELECT p.name, p.provider_type, p.priority, COUNT(m.id) as model_count
      FROM llm_providers p
      LEFT JOIN llm_models m ON p.id = m.provider_id AND m.is_active = true
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.provider_type, p.priority
      ORDER BY p.priority ASC
    `);

    providers.forEach((provider: any, index: number) => {
      console.log(`   ${index + 1}. ${provider.name} (${provider.provider_type}) - ${provider.model_count} models`);
    });

    // Step 5: Check API keys
    console.log('\n🔑 API Key Status:');
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    console.log(`   Anthropic: ${anthropicKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   OpenAI: ${openaiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   Google: ${googleKey ? '✅ Configured' : '❌ Missing'}`);

    if (!anthropicKey && !openaiKey && !googleKey) {
      console.log('\n⚠️  WARNING: No API keys configured!');
      console.log('   Please add API keys to your .env file:');
      console.log('   - ANTHROPIC_API_KEY=your-key-here');
      console.log('   - OPENAI_API_KEY=your-key-here');
      console.log('   - GOOGLE_GENERATIVE_AI_API_KEY=your-key-here');
    }

    console.log('\n🎉 Migration to Vercel AI SDK completed successfully!');
    console.log('💡 The system now uses direct provider APIs for better reliability.');

  } catch (error) {
    console.log('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateToVercelAI().catch(console.error);