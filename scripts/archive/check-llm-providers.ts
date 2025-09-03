#!/usr/bin/env tsx
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkLLMProviders() {
  try {
    console.log('🔍 Checking LLM providers...');
    
    // Check if llm_providers table exists
    const providersCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'llm_providers'
      );
    `);
    
    console.log(`📊 LLM providers table exists: ${providersCheck.rows[0].exists}`);
    
    if (providersCheck.rows[0].exists) {
      const providers = await pool.query('SELECT * FROM llm_providers ORDER BY priority');
      console.log(`📊 LLM providers count: ${providers.rows.length}`);
      
      if (providers.rows.length > 0) {
        console.log('📊 LLM providers:');
        console.table(providers.rows);
      } else {
        console.log('❌ No LLM providers configured!');
      }
    } else {
      console.log('❌ LLM providers table does not exist!');
    }
    
    // Check environment variables
    console.log('\n🔍 Checking environment variables...');
    console.log(`OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set'}`);

  } catch (error) {
    console.error('❌ Error checking LLM providers:', error);
  } finally {
    await pool.end();
  }
}

checkLLMProviders();