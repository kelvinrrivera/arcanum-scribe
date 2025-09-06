#!/usr/bin/env tsx

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrateCostTo1MTokens() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: cost_per_1k_tokens -> cost_per_1m_tokens');
    
    // Check if the old column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'llm_models' AND column_name = 'cost_per_1k_tokens'
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('Column cost_per_1k_tokens does not exist, checking for cost_per_1m_tokens...');
      
      const checkNewColumn = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'llm_models' AND column_name = 'cost_per_1m_tokens'
      `);
      
      if (checkNewColumn.rows.length > 0) {
        console.log('Migration already completed - cost_per_1m_tokens column exists');
        return;
      } else {
        console.log('Neither column exists, adding cost_per_1m_tokens...');
        await client.query(`
          ALTER TABLE llm_models 
          ADD COLUMN cost_per_1m_tokens DECIMAL(10,6) DEFAULT 0.0
        `);
        console.log('Added cost_per_1m_tokens column');
        return;
      }
    }
    
    console.log('Found cost_per_1k_tokens column, starting migration...');
    
    // Add the new column
    await client.query(`
      ALTER TABLE llm_models 
      ADD COLUMN cost_per_1m_tokens DECIMAL(10,6) DEFAULT 0.0
    `);
    console.log('Added cost_per_1m_tokens column');
    
    // Update values: multiply by 1000 to convert from per-1k to per-1m
    await client.query(`
      UPDATE llm_models 
      SET cost_per_1m_tokens = cost_per_1k_tokens * 1000
    `);
    console.log('Updated cost values (multiplied by 1000)');
    
    // Drop the old column
    await client.query(`
      ALTER TABLE llm_models 
      DROP COLUMN cost_per_1k_tokens
    `);
    console.log('Dropped old cost_per_1k_tokens column');
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await migrateCostTo1MTokens();
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
main();