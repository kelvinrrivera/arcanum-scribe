#!/usr/bin/env tsx

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function debugInviteCodes() {
  console.log('🔍 Debugging invite codes...');
  
  try {
    // Check if table exists and its structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'invite_codes'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Table structure:');
    console.table(tableInfo.rows);
    
    // Try to insert a test record
    console.log('\n🧪 Testing insert...');
    const code = 'test-' + Math.random().toString(36).substring(2, 8);
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30);
    
    const result = await pool.query(`
      INSERT INTO invite_codes (code, max_uses, expires_at, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `, [code, 1, expires_at]);
    
    console.log('✅ Insert successful:', result.rows[0]);
    
    // Clean up test record
    await pool.query('DELETE FROM invite_codes WHERE code = $1', [code]);
    console.log('🧹 Test record cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

debugInviteCodes();