import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function applySecurityFixes() {
  console.log('🔒 Applying critical security fixes...');
  
  // Check JWT_SECRET
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key') {
    console.error('❌ CRITICAL: JWT_SECRET is missing or using default value!');
    console.log('Please set a strong JWT_SECRET in your .env file:');
    console.log('JWT_SECRET=' + generateSecureSecret());
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
  });

  try {
    // Add password_hash column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `);

    // Find admin users without password hash
    const adminUsers = await pool.query(`
      SELECT id, email, username 
      FROM users 
      WHERE (tier = 'admin' OR subscription_tier = 'admin') 
      AND password_hash IS NULL
    `);

    for (const admin of adminUsers.rows) {
      // Generate secure password for admin
      const tempPassword = generateSecurePassword();
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      await pool.query(`
        UPDATE users 
        SET password_hash = $1 
        WHERE id = $2
      `, [passwordHash, admin.id]);

      console.log(`✅ Admin ${admin.email} password hash created`);
      console.log(`🔑 Temporary password: ${tempPassword}`);
      console.log('⚠️  Please change this password immediately after login!');
    }

    console.log('🎉 Security fixes applied successfully!');

  } catch (error) {
    console.error('❌ Error applying security fixes:', error);
  } finally {
    await pool.end();
  }
}

function generateSecureSecret(): string {
  return require('crypto').randomBytes(64).toString('hex');
}

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Run the fixes
applySecurityFixes();