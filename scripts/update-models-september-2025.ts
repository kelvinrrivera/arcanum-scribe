#!/usr/bin/env npx tsx

/**
 * Update LLM models to latest versions (September 2025)
 */

import { query } from '../src/integrations/postgres/client.js';

async function updateModels() {
  console.log('🔄 Updating LLM Models to September 2025 versions');
  console.log('=================================================\n');

  try {
    // Get provider IDs
    const { rows: providers } = await query(`
      SELECT id, name, provider_type FROM llm_providers WHERE is_active = true
    `);

    const anthropicProvider = providers.find((p: any) => p.provider_type === 'anthropic');
    const openaiProvider = providers.find((p: any) => p.provider_type === 'openai');
    const googleProvider = providers.find((p: any) => p.provider_type === 'google');

    console.log('📋 Found providers:');
    providers.forEach((p: any) => {
      console.log(`   - ${p.name} (${p.provider_type}) - ID: ${p.id}`);
    });

    // Clear existing models
    console.log('\n🗑️  Removing old models...');
    await query('DELETE FROM llm_models WHERE provider_id IN (SELECT id FROM llm_providers WHERE is_active = true)');
    console.log('   ✅ Old models removed');

    // Add updated Anthropic models (September 2025)
    if (anthropicProvider) {
      console.log('\n🤖 Adding updated Anthropic models (September 2025)...');
      
      await query(`
        INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
        VALUES 
          ($1, 'claude-opus-4-1-20250805', 'Claude Opus 4.1 (Latest)', 'chat', 16384, 0.7, true, 5.00),
          ($1, 'claude-opus-4-20250514', 'Claude Opus 4', 'chat', 12288, 0.7, true, 4.00),
          ($1, 'claude-sonnet-4-20250514', 'Claude Sonnet 4', 'chat', 8192, 0.7, true, 2.50)
      `, [anthropicProvider.id]);
      
      console.log('   ✅ Claude Opus 4.1 (Latest) - claude-opus-4-1-20250805');
      console.log('   ✅ Claude Opus 4 - claude-opus-4-20250514');
      console.log('   ✅ Claude Sonnet 4 - claude-sonnet-4-20250514');
    }

    // Add updated OpenAI models (September 2025)
    if (openaiProvider) {
      console.log('\n🧠 Adding updated OpenAI models (September 2025)...');
      
      await query(`
        INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
        VALUES 
          ($1, 'gpt-5', 'GPT-5 (Latest)', 'chat', 32768, 0.7, true, 8.00),
          ($1, 'gpt-5-mini', 'GPT-5 Mini', 'chat', 16384, 0.7, true, 1.50),
          ($1, 'gpt-4.1', 'GPT-4.1', 'chat', 16384, 0.7, true, 3.50)
      `, [openaiProvider.id]);
      
      console.log('   ✅ GPT-5 (Latest) - gpt-5');
      console.log('   ✅ GPT-5 Mini - gpt-5-mini');
      console.log('   ✅ GPT-4.1 - gpt-4.1');
    }

    // Add updated Google models (September 2025)
    if (googleProvider) {
      console.log('\n🔍 Adding updated Google models (September 2025)...');
      
      await query(`
        INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
        VALUES 
          ($1, 'gemini-2.5-pro', 'Gemini 2.5 Pro (Latest)', 'chat', 16384, 0.7, true, 2.00),
          ($1, 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'chat', 8192, 0.7, true, 0.50),
          ($1, 'gemini-2.5-flash-lite', 'Gemini 2.5 Flash Lite', 'chat', 4096, 0.7, true, 0.10)
      `, [googleProvider.id]);
      
      console.log('   ✅ Gemini 2.5 Pro (Latest) - gemini-2.5-pro');
      console.log('   ✅ Gemini 2.5 Flash - gemini-2.5-flash');
      console.log('   ✅ Gemini 2.5 Flash Lite - gemini-2.5-flash-lite');
    }

    // Show final configuration
    console.log('\n📊 Updated Model Configuration:');
    const { rows: finalModels } = await query(`
      SELECT lm.display_name, lm.model_name, lp.provider_type, lm.cost_per_1m_tokens, lm.max_tokens
      FROM llm_models lm
      JOIN llm_providers lp ON lm.provider_id = lp.id
      WHERE lm.is_active = true AND lp.is_active = true
      ORDER BY lp.priority ASC, lm.cost_per_1m_tokens ASC
    `);

    finalModels.forEach((model: any) => {
      console.log(`   ${model.provider_type.toUpperCase()}: ${model.display_name}`);
      console.log(`      Model ID: ${model.model_name}`);
      console.log(`      Cost: $${model.cost_per_1m_tokens}/1M tokens`);
      console.log(`      Max Tokens: ${model.max_tokens}`);
      console.log('');
    });

    console.log('🎉 Model update completed successfully!');
    console.log(`📈 Total models: ${finalModels.length}`);
    
    // Pricing summary
    const cheapest = finalModels.reduce((min: any, model: any) => 
      model.cost_per_1m_tokens < min.cost_per_1m_tokens ? model : min
    );
    const mostExpensive = finalModels.reduce((max: any, model: any) => 
      model.cost_per_1m_tokens > max.cost_per_1m_tokens ? model : max
    );
    
    console.log(`💰 Cheapest: ${cheapest.display_name} ($${cheapest.cost_per_1m_tokens}/1M)`);
    console.log(`💎 Most Expensive: ${mostExpensive.display_name} ($${mostExpensive.cost_per_1m_tokens}/1M)`);

  } catch (error) {
    console.log('❌ Update failed:', error);
    throw error;
  }
}

// Run update
updateModels().catch(console.error);