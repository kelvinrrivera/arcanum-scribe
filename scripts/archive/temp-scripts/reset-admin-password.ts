#!/usr/bin/env tsx
import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...');
    
    const email = 'admin@arcanum-scribe.com';
    const newPassword = 'admin123';
    
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the password in the database
    const result = await pool.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = NOW()
      WHERE email = $2
      RETURNING id, email, username, tier
    `, [hashedPassword, email]);

    if (result.rows.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin password reset successfully!');
    console.log('📊 Updated user:');
    console.table(result.rows[0]);
    
    console.log('\n🎯 New credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    
    // Test the password immediately
    console.log('\n🔍 Verifying password hash...');
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`Password verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();