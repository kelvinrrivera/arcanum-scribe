#!/usr/bin/env tsx
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDatabaseTables() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Check if profiles table exists
    const profilesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
      );
    `);
    
    console.log(`📊 Profiles table exists: ${profilesCheck.rows[0].exists}`);
    
    if (profilesCheck.rows[0].exists) {
      const profilesCount = await pool.query('SELECT COUNT(*) FROM profiles');
      console.log(`📊 Profiles count: ${profilesCount.rows[0].count}`);
      
      // Show sample profiles
      const sampleProfiles = await pool.query('SELECT * FROM profiles LIMIT 3');
      console.log('📊 Sample profiles:');
      console.table(sampleProfiles.rows);
    }
    
    // Check users table
    const usersCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log(`📊 Users table exists: ${usersCheck.rows[0].exists}`);
    
    if (usersCheck.rows[0].exists) {
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log(`📊 Users count: ${usersCount.rows[0].count}`);
      
      // Show sample users
      const sampleUsers = await pool.query('SELECT id, email, username, tier, subscription_tier, magic_credits FROM users LIMIT 3');
      console.log('📊 Sample users:');
      console.table(sampleUsers.rows);
    }

  } catch (error) {
    console.error('❌ Error checking database tables:', error);
  } finally {
    await pool.end();
  }
}

checkDatabaseTables();