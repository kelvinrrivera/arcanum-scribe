#!/usr/bin/env tsx
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupLLMProviders() {
  try {
    console.log('🔧 Setting up LLM providers...');
    
    // Clear existing providers
    await pool.query('DELETE FROM llm_providers');
    console.log('🗑️ Cleared existing providers');
    
    // Insert OpenRouter provider
    await pool.query(`
      INSERT INTO llm_providers (
        name, 
        provider_type,
        base_url, 
        api_key_env,
        priority, 
        is_active
      ) VALUES (
        'OpenRouter', 
        'openrouter',
        'https://openrouter.ai/api/v1', 
        'OPENROUTER_API_KEY',
        1, 
        true
      )
    `);
    
    console.log('✅ OpenRouter provider configured');
    
    // Insert OpenAI provider (backup)
    if (process.env.OPENAI_API_KEY) {
      await pool.query(`
        INSERT INTO llm_providers (
          name, 
          provider_type,
          base_url, 
          api_key_env,
          priority, 
          is_active
        ) VALUES (
          'OpenAI', 
          'openai',
          'https://api.openai.com/v1', 
          'OPENAI_API_KEY',
          2, 
          true
        )
      `);
      
      console.log('✅ OpenAI provider configured');
    }
    
    // Insert Anthropic provider (backup)
    if (process.env.ANTHROPIC_API_KEY) {
      await pool.query(`
        INSERT INTO llm_providers (
          name, 
          provider_type,
          base_url, 
          api_key_env,
          priority, 
          is_active
        ) VALUES (
          'Anthropic', 
          'anthropic',
          'https://api.anthropic.com', 
          'ANTHROPIC_API_KEY',
          3, 
          true
        )
      `);
      
      console.log('✅ Anthropic provider configured');
    }
    
    // Verify setup
    const providers = await pool.query('SELECT name, provider_type, priority, is_active FROM llm_providers ORDER BY priority');
    console.log('\n📊 Configured providers:');
    console.table(providers.rows);

  } catch (error) {
    console.error('❌ Error setting up LLM providers:', error);
  } finally {
    await pool.end();
  }
}

setupLLMProviders();