#!/usr/bin/env tsx
import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log(`Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')}`);
    
    // Test basic connection
    const testQuery = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');
    console.log(`📅 Current time: ${testQuery.rows[0].current_time}`);
    
    // Check if users table exists
    const tablesQuery = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'profiles')
      ORDER BY table_name
    `);
    
    console.log('\n📊 Available tables:');
    console.table(tablesQuery.rows);
    
    // Check admin user
    console.log('\n🔍 Checking admin user...');
    const adminQuery = await pool.query(`
      SELECT 
        id, 
        email, 
        username, 
        tier, 
        subscription_tier, 
        magic_credits,
        password_hash,
        created_at
      FROM users 
      WHERE email = $1
    `, ['admin@arcanum-scribe.com']);
    
    if (adminQuery.rows.length === 0) {
      console.log('❌ Admin user not found!');
      console.log('🔧 Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const createResult = await pool.query(`
        INSERT INTO users (
          email, 
          username, 
          password_hash, 
          tier, 
          subscription_tier, 
          magic_credits,
          credits_used,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, email, username, tier, magic_credits
      `, [
        'admin@arcanum-scribe.com',
        'admin',
        hashedPassword,
        'admin',
        'admin',
        1000,
        0
      ]);
      
      console.log('✅ Admin user created:');
      console.table(createResult.rows[0]);
      
      // Also create profile
      await pool.query(`
        INSERT INTO profiles (
          id,
          email,
          display_name,
          tier_name,
          generations_used,
          private_adventures_used,
          usage_period_start,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        createResult.rows[0].id,
        'admin@arcanum-scribe.com',
        'admin',
        'admin',
        0,
        0
      ]);
      
      console.log('✅ Admin profile created');
      
    } else {
      console.log('✅ Admin user found:');
      console.table({
        id: adminQuery.rows[0].id,
        email: adminQuery.rows[0].email,
        username: adminQuery.rows[0].username,
        tier: adminQuery.rows[0].tier,
        subscription_tier: adminQuery.rows[0].subscription_tier,
        magic_credits: adminQuery.rows[0].magic_credits,
        created_at: adminQuery.rows[0].created_at
      });
      
      // Test password
      console.log('\n🔐 Testing password...');
      const passwordMatch = await bcrypt.compare('admin123', adminQuery.rows[0].password_hash);
      console.log(`Password verification: ${passwordMatch ? '✅ Valid' : '❌ Invalid'}`);
      
      if (!passwordMatch) {
        console.log('🔧 Resetting password...');
        const newHashedPassword = await bcrypt.hash('admin123', 12);
        await pool.query(`
          UPDATE users 
          SET password_hash = $1, updated_at = NOW()
          WHERE email = $2
        `, [newHashedPassword, 'admin@arcanum-scribe.com']);
        console.log('✅ Password reset to: admin123');
      }
    }
    
    // Check profile
    console.log('\n🔍 Checking admin profile...');
    const profileQuery = await pool.query(`
      SELECT * FROM profiles WHERE email = $1
    `, ['admin@arcanum-scribe.com']);
    
    if (profileQuery.rows.length > 0) {
      console.log('✅ Admin profile found');
    } else {
      console.log('❌ Admin profile not found - this might cause issues');
    }

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 DNS resolution failed - check if the database host is accessible');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Connection refused - check if the database is running and port is correct');
    } else if (error.code === '28P01') {
      console.log('💡 Authentication failed - check username and password');
    } else if (error.code === '3D000') {
      console.log('💡 Database does not exist - check database name');
    }
    
  } finally {
    await pool.end();
  }
}

verifyDatabaseConnection();