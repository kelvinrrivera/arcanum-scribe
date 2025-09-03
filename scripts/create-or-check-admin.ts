#!/usr/bin/env tsx

import { query } from '../src/integrations/postgres/client';

async function createOrCheckAdmin() {
  console.log('🔍 Checking for admin users...\n');

  try {
    // Check if there are any admin users
    const { rows: adminUsers } = await query(
      'SELECT id, email, display_name, subscription_tier FROM profiles WHERE subscription_tier = $1',
      ['admin']
    );

    console.log(`📊 Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.display_name || 'No display name'})`);
    });

    if (adminUsers.length === 0) {
      console.log('\n❌ No admin users found!');
      console.log('🛠️  Creating a test admin user...\n');

      // Create a test admin user
      const testEmail = 'admin@arcanumscribe.com';
      const testDisplayName = 'Admin Test User';
      
      const { rows: newUser } = await query(`
        INSERT INTO profiles (
          id, 
          email, 
          display_name, 
          subscription_tier, 
          credits_remaining, 
          monthly_generations,
          created_at
        )
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          'admin',
          1000,
          0,
          NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          subscription_tier = 'admin',
          credits_remaining = GREATEST(profiles.credits_remaining, 1000)
        RETURNING *
      `, [testEmail, testDisplayName]);

      console.log('✅ Admin user created/updated:');
      console.log(`   Email: ${newUser[0].email}`);
      console.log(`   Display Name: ${newUser[0].display_name}`);
      console.log(`   Subscription Tier: ${newUser[0].subscription_tier}`);
      console.log(`   Credits: ${newUser[0].credits_remaining}`);
      console.log('');
      console.log('🔑 You can now sign in with this email using any password (admin bypass is enabled)');
      
    } else {
      console.log('\n✅ Admin users exist. You can sign in with any of the above emails.');
    }

    console.log('\n🔐 Admin signin process:');
    console.log('1. Go to /auth page');
    console.log('2. Enter admin email address');
    console.log('3. Enter any password (admin bypass is enabled)');
    console.log('4. You will be signed in as admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('relation "profiles" does not exist')) {
      console.log('\n🔧 Database tables not found. Run migrations first:');
      console.log('   npm run setup:db');
    }
  }
}

createOrCheckAdmin();