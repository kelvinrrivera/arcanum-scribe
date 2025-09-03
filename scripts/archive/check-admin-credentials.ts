#!/usr/bin/env tsx
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkAdminCredentials() {
  try {
    console.log('🔍 Checking admin users in database...');
    
    // Check all users with admin tier
    const adminUsers = await pool.query(`
      SELECT 
        id, 
        email, 
        username, 
        tier, 
        subscription_tier,
        magic_credits,
        created_at
      FROM users 
      WHERE tier = 'admin' OR subscription_tier = 'admin'
      ORDER BY created_at DESC
    `);

    console.log(`📊 Found ${adminUsers.rows.length} admin users:`);
    if (adminUsers.rows.length > 0) {
      console.table(adminUsers.rows);
    } else {
      console.log('❌ No admin users found!');
    }

    // Check all users to see what exists
    const allUsers = await pool.query(`
      SELECT 
        id, 
        email, 
        username, 
        tier, 
        subscription_tier,
        created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`\n📊 Recent users (last 10):`);
    console.table(allUsers.rows);

  } catch (error) {
    console.error('❌ Error checking admin credentials:', error);
  } finally {
    await pool.end();
  }
}

checkAdminCredentials();