#!/usr/bin/env tsx

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixInviteCodesFinal() {
  console.log('🔧 Final fix for invite_codes table...');
  
  try {
    // Increase the length of the code column
    console.log('📝 Increasing code column length...');
    
    await pool.query(`
      ALTER TABLE invite_codes 
      ALTER COLUMN code TYPE VARCHAR(50);
    `);
    
    console.log('✅ Updated code column length');
    
    // Test insert with shorter code
    console.log('\n🧪 Testing insert...');
    const code = Math.random().toString(36).substring(2, 15); // Shorter code
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
    
    console.log('\n🎉 invite_codes table is now ready!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixInviteCodesFinal();