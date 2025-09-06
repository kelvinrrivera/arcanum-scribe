#!/usr/bin/env tsx

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function debugAdminEndpoints() {
  console.log('🔍 Debugging admin endpoints...');
  
  try {
    // Check prompt_logs table
    console.log('\n📋 Checking prompt_logs table...');
    try {
      const promptLogsInfo = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'prompt_logs'
        ORDER BY ordinal_position;
      `);
      
      if (promptLogsInfo.rows.length > 0) {
        console.log('✅ prompt_logs table exists:');
        console.table(promptLogsInfo.rows);
      } else {
        console.log('❌ prompt_logs table does not exist');
      }
    } catch (error) {
      console.log('❌ Error checking prompt_logs:', error.message);
    }
    
    // Check fal_models table for image-models endpoint
    console.log('\n📋 Checking fal_models table...');
    try {
      const falModelsInfo = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'fal_models'
        ORDER BY ordinal_position;
      `);
      
      if (falModelsInfo.rows.length > 0) {
        console.log('✅ fal_models table exists:');
        console.table(falModelsInfo.rows);
        
        // Test query
        const testQuery = await pool.query('SELECT COUNT(*) FROM fal_models');
        console.log(`📊 fal_models has ${testQuery.rows[0].count} records`);
      } else {
        console.log('❌ fal_models table does not exist');
      }
    } catch (error) {
      console.log('❌ Error checking fal_models:', error.message);
    }
    
    // Check what tables exist
    console.log('\n📋 All existing tables:');
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Available tables:');
    allTables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

debugAdminEndpoints();