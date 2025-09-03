#!/usr/bin/env tsx
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkLLMTableStructure() {
  try {
    console.log('🔍 Checking LLM providers table structure...');
    
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'llm_providers' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 LLM providers table columns:');
    console.table(columns.rows);
    
    // Also check llm_models table
    const modelsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'llm_models'
      );
    `);
    
    if (modelsCheck.rows[0].exists) {
      const modelColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'llm_models' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 LLM models table columns:');
      console.table(modelColumns.rows);
    }

  } catch (error) {
    console.error('❌ Error checking LLM table structure:', error);
  } finally {
    await pool.end();
  }
}

checkLLMTableStructure();