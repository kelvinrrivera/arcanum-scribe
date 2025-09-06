#!/usr/bin/env tsx

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixInviteCodesTable() {
  console.log('🔧 Fixing invite_codes table structure...');
  
  try {
    // Add missing columns
    console.log('📝 Adding missing columns...');
    
    await pool.query(`
      ALTER TABLE invite_codes 
      ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS current_uses INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    `);
    
    console.log('✅ Added missing columns');
    
    // Verify the updated structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'invite_codes'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Updated table structure:');
    console.table(tableInfo.rows);
    
    // Test insert with new structure
    console.log('\n🧪 Testing insert with new structure...');
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

fixInviteCodesTable();