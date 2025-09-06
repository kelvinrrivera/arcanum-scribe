import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function fixAdminCredits() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔧 Fixing admin credits...');

    // Find admin users
    const adminUsers = await pool.query(`
      SELECT id, email, username, tier, subscription_tier, magic_credits, credits_used 
      FROM users 
      WHERE tier = 'admin' OR subscription_tier = 'admin'
    `);

    if (adminUsers.rows.length === 0) {
      console.log('❌ No admin users found');
      return;
    }

    for (const admin of adminUsers.rows) {
      console.log(`👑 Found admin: ${admin.email} (${admin.username})`);
      console.log(`   Current credits: ${admin.magic_credits}, Used: ${admin.credits_used}`);

      // Set admin to have 1000 magic credits and reset usage
      await pool.query(`
        UPDATE users 
        SET 
          magic_credits = 1000,
          credits_used = 0,
          tier = 'admin',
          period_start = NOW()
        WHERE id = $1
      `, [admin.id]);

      // Log the credit grant
      await pool.query(`
        INSERT INTO credit_transactions (
          user_id, transaction_type, amount, reason, created_at
        ) VALUES ($1, 'credit_grant', 1000, 'Admin testing credits', NOW())
      `, [admin.id]);

      console.log(`✅ Admin ${admin.email} now has 1000 Magic Credits ✨`);
    }

    console.log('🎉 Admin credits fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing admin credits:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixAdminCredits();