import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminUser() {
  console.log('🔍 Checking admin user data...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
  });

  try {
    // Check users table
    console.log('\n📊 Users table:');
    const users = await pool.query(`
      SELECT id, email, username, tier, subscription_tier, magic_credits, credits_used 
      FROM users 
      WHERE email = 'admin@arcanum-scribe.com'
    `);
    
    if (users.rows.length > 0) {
      console.log('✅ Admin user found in users table:');
      console.table(users.rows[0]);
    } else {
      console.log('❌ Admin user NOT found in users table');
    }

    // Check profiles table
    console.log('\n📊 Profiles table:');
    const profiles = await pool.query(`
      SELECT p.*, u.email as user_email
      FROM profiles p 
      LEFT JOIN users u ON p.id = u.id
      WHERE u.email = 'admin@arcanum-scribe.com' OR p.email = 'admin@arcanum-scribe.com'
    `);
    
    if (profiles.rows.length > 0) {
      console.log('✅ Admin profile found:');
      console.table(profiles.rows[0]);
    } else {
      console.log('❌ Admin profile NOT found');
    }

    // Check what the login query would return
    console.log('\n🔍 Testing login query:');
    const loginQuery = await pool.query(`
      SELECT u.*, p.display_name 
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.id 
      WHERE u.email = $1
    `, ['admin@arcanum-scribe.com']);

    if (loginQuery.rows.length > 0) {
      console.log('✅ Login query result:');
      console.table(loginQuery.rows[0]);
      
      const user = loginQuery.rows[0];
      console.log('\n🎯 Calculated values:');
      console.log(`- Role: ${(user.subscription_tier === 'admin' || user.tier === 'admin') ? 'admin' : 'user'}`);
      console.log(`- Credits remaining: ${user.magic_credits - user.credits_used}`);
      console.log(`- Display name: ${user.display_name || user.username}`);
    } else {
      console.log('❌ Login query returned no results');
    }

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    await pool.end();
  }
}

// Run check
checkAdminUser();