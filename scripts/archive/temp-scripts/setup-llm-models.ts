#!/usr/bin/env tsx
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupLLMModels() {
  try {
    console.log('🔧 Setting up LLM models...');
    
    // Get provider IDs
    const providers = await pool.query('SELECT id, name, provider_type FROM llm_providers ORDER BY priority');
    console.log('📊 Available providers:');
    console.table(providers.rows);
    
    const openrouterProvider = providers.rows.find(p => p.provider_type === 'openrouter');
    const openaiProvider = providers.rows.find(p => p.provider_type === 'openai');
    
    if (!openrouterProvider) {
      console.log('❌ OpenRouter provider not found');
      return;
    }
    
    // Clear existing models
    await pool.query('DELETE FROM llm_models');
    console.log('🗑️ Cleared existing models');
    
    // Add OpenRouter models (ordered by preference - OpenAI first, Gemini second, Claude third)
    const openrouterModels = [
      {
        model_name: 'openai/gpt-5-mini',
        display_name: 'GPT-5 Mini',
        max_tokens: 8192,
        context_window: 200000,
        cost_per_1k_tokens: 0.0002
      },
      {
        model_name: 'google/gemini-2.5-flash',
        display_name: 'Gemini 2.5 Flash',
        max_tokens: 8192,
        context_window: 1000000,
        cost_per_1k_tokens: 0.0008
      },
      {
        model_name: 'anthropic/claude-4-sonnet',
        display_name: 'Claude 4 Sonnet',
        max_tokens: 8192,
        context_window: 200000,
        cost_per_1k_tokens: 0.004
      }
    ];
    
    for (const model of openrouterModels) {
      await pool.query(`
        INSERT INTO llm_models (
          provider_id,
          model_name,
          display_name,
          model_type,
          max_tokens,
          context_window,
          cost_per_1k_tokens,
          is_active
        ) VALUES ($1, $2, $3, 'chat', $4, $5, $6, true)
      `, [
        openrouterProvider.id,
        model.model_name,
        model.display_name,
        model.max_tokens,
        model.context_window,
        model.cost_per_1k_tokens
      ]);
    }
    
    console.log(`✅ Added ${openrouterModels.length} OpenRouter models`);
    
    // We only use OpenRouter - it provides access to all models with one API key
    console.log('🎯 Using OpenRouter as the unified LLM provider');
    
    // Disable direct providers to use only OpenRouter
    await pool.query(`
      UPDATE llm_providers 
      SET is_active = false 
      WHERE provider_type != 'openrouter'
    `);
    
    console.log('🔒 Disabled direct providers - using OpenRouter only');
    
    // Verify setup
    const models = await pool.query(`
      SELECT 
        m.model_name,
        m.display_name,
        p.name as provider_name,
        m.is_active
      FROM llm_models m
      JOIN llm_providers p ON m.provider_id = p.id
      ORDER BY p.priority, m.display_name
    `);
    
    console.log('\n📊 Configured models:');
    console.table(models.rows);

  } catch (error) {
    console.error('❌ Error setting up LLM models:', error);
  } finally {
    await pool.end();
  }
}

setupLLMModels();