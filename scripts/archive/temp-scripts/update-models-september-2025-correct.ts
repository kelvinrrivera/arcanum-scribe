#!/usr/bin/env npx tsx

/**
 * Update LLM models to latest versions (September 2025)
 * Based on real pricing and model information provided
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

    // Add updated Google models (Gemini 2.5 family)
    if (googleProvider) {
      console.log('\n🔍 Adding updated Google models (Gemini 2.5)...');
      
      await query(`
        INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
        VALUES 
          ($1, 'gemini-2.5-pro', 'Gemini 2.5 Pro', 'chat', 1000000, 0.7, true, 1.25),
          ($1, 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'chat', 1000000, 0.7, true, 0.30),
          ($1, 'gemini-2.5-flash-lite', 'Gemini 2.5 Flash Lite', 'chat', 1000000, 0.7, true, 0.10)
      `, [googleProvider.id]);
      
      console.log('   ✅ Gemini 2.5 Pro - $1.25/1M input, $10.00/1M output, 1M context');
      console.log('   ✅ Gemini 2.5 Flash - $0.30/1M input, $2.50/1M output, 1M context');
      console.log('   ✅ Gemini 2.5 Flash Lite - $0.10/1M input, $0.40/1M output, 1M context');
    }

    // Add updated Anthropic models (Claude 4 family)
    if (anthropicProvider) {
      console.log('\n🤖 Adding updated Anthropic models (Claude 4)...');
      
      await query(`
        INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
        VALUES 
          ($1, 'claude-opus-4-1-20250805', 'Claude Opus 4.1 (Latest)', 'chat', 200000, 0.7, true, 15.00),
          ($1, 'claude-opus-4-20250514', 'Claude Opus 4.0', 'chat', 200000, 0.7, true, 15.00),
          ($1, 'claude-sonnet-4-20250514', 'Claude Sonnet 4.0', 'chat', 1000000, 0.7, true, 3.00)
      `, [anthropicProvider.id]);
      
      console.log('   ✅ Claude Opus 4.1 (Latest) - High-end model, variable pricing');
      console.log('   ✅ Claude Opus 4.0 - Premium model, variable pricing');
      console.log('   ✅ Claude Sonnet 4.0 - $3.00/1M input (≤200K), 1M context');
    }

    // Add updated OpenAI models (GPT-5 family)
    if (openaiProvider) {
      console.log('\n🧠 Adding updated OpenAI models (GPT-5)...');
      
      await query(`
        INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, is_active, cost_per_1m_tokens)
        VALUES 
          ($1, 'gpt-5', 'GPT-5', 'chat', 272000, 0.7, true, 1.25),
          ($1, 'gpt-5-mini', 'GPT-5 Mini', 'chat', 272000, 0.7, true, 0.25),
          ($1, 'gpt-4.1', 'GPT-4.1', 'chat', 200000, 0.7, true, 2.50)
      `, [openaiProvider.id]);
      
      console.log('   ✅ GPT-5 - $1.25/1M input, $10.00/1M output, 272K context');
      console.log('   ✅ GPT-5 Mini - $0.25/1M input, $2.00/1M output, similar to GPT-5');
      console.log('   ✅ GPT-4.1 - Variable pricing, high context');
    }

    // Show final configuration
    console.log('\n📊 Updated Model Configuration (September 2025):');
    const { rows: finalModels } = await query(`
      SELECT lm.display_name, lm.model_name, lp.provider_type, lm.cost_per_1m_tokens, lm.max_tokens
      FROM llm_models lm
      JOIN llm_providers lp ON lm.provider_id = lp.id
      WHERE lm.is_active = true AND lp.is_active = true
      ORDER BY lp.priority ASC, lm.cost_per_1m_tokens ASC
    `);

    console.log('\n🏆 PREMIUM MODELS (Latest Generation):');
    finalModels.forEach((model: any) => {
      const contextSize = model.max_tokens >= 1000000 ? `${(model.max_tokens/1000000).toFixed(1)}M` : 
                         model.max_tokens >= 1000 ? `${(model.max_tokens/1000).toFixed(0)}K` : 
                         model.max_tokens.toString();
      
      console.log(`   ${model.provider_type.toUpperCase()}: ${model.display_name}`);
      console.log(`      Model ID: ${model.model_name}`);
      console.log(`      Cost: $${model.cost_per_1m_tokens}/1M tokens (input)`);
      console.log(`      Context: ${contextSize} tokens`);
      console.log('');
    });

    console.log('🎉 Model update completed successfully!');
    console.log(`📈 Total models: ${finalModels.length}`);
    
    // Performance summary
    console.log('\n🚀 Performance Tiers:');
    console.log('   💎 PREMIUM: Claude Opus 4.1, GPT-5 (Highest quality)');
    console.log('   ⚡ BALANCED: Claude Sonnet 4.0, GPT-5 Mini (Best value)');
    console.log('   🏃 FAST: Gemini 2.5 Flash Lite (Fastest/Cheapest)');
    
    console.log('\n💡 Recommended for adventures:');
    console.log('   🏰 Complex adventures: Claude Sonnet 4.0 or GPT-5');
    console.log('   ⚡ Quick generation: Gemini 2.5 Flash');
    console.log('   💰 Cost-effective: Gemini 2.5 Flash Lite');

  } catch (error) {
    console.log('❌ Update failed:', error);
    throw error;
  }
}

// Run update
updateModels().catch(console.error);