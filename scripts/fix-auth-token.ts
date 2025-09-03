import { query } from '../src/integrations/postgres/client.js';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

async function fixAuthIssue() {
  try {
    console.log('🔍 Checking current users in database...');
    const { rows: users } = await query('SELECT id, email, subscription_tier, magic_credits FROM users LIMIT 5');
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Creating admin user...');
      const adminId = crypto.randomUUID();
      await query(`
        INSERT INTO users (id, email, subscription_tier, magic_credits, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [adminId, 'admin@arcanum-scribe.com', 'admin', 1000]);
      console.log('✅ Admin user created with ID:', adminId);
      
      const realUser = {
        id: adminId,
        email: 'admin@arcanum-scribe.com',
        role: 'admin',
        tier: 'admin',
        subscription_tier: 'admin'
      };
      
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const token = jwt.sign(realUser, secret, { expiresIn: '24h' });
      
      console.log('\n🔗 NEW ADMIN TOKEN:');
      console.log(token);
      console.log('\n📝 Run in browser console:');
      console.log(`localStorage.setItem("auth_token", "${token}")`);
      
    } else {
      console.log('✅ Found existing users:');
      users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id}) - Tier: ${user.subscription_tier} - Credits: ${user.magic_credits}`);
      });
      
      // Use the first user
      const user = users[0];
      const realUser = {
        id: user.id,
        email: user.email,
        role: 'admin',
        tier: user.subscription_tier,
        subscription_tier: user.subscription_tier
      };
      
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const token = jwt.sign(realUser, secret, { expiresIn: '24h' });
      
      console.log('\n🔗 VALID TOKEN FOR EXISTING USER:');
      console.log(token);
      console.log('\n📝 Run in browser console:');
      console.log(`localStorage.setItem("auth_token", "${token}")`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAuthIssue();