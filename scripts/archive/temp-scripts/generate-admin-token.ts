import jwt from 'jsonwebtoken';
import { query } from '../src/integrations/postgres/client';

async function generateAdminToken() {
  console.log('🔑 Generating admin JWT token...');
  
  try {
    // Get admin user
    const adminResult = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', ['admin@arcanum-scribe.com']);
    if (adminResult.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const adminUser = adminResult.rows[0];
    console.log(`✅ Found admin user: ${adminUser.email}`);
    
    // Create JWT payload
    const payload = {
      id: adminUser.id,
      email: adminUser.email,
      tier: adminUser.tier || adminUser.subscription_tier,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };
    
    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(payload, secret);
    
    console.log('\\n🎯 Admin JWT Token:');
    console.log(token);
    
    console.log('\\n📋 Use this token in your requests:');
    console.log(`Authorization: Bearer ${token}`);
    
    console.log('\\n🧪 Test with curl:');
    console.log(`curl -H \"Authorization: Bearer ${token}\" http://localhost:3000/api/admin/invite-codes`);
    
    // Test the token
    console.log('\\n🔍 Testing token...');
    try {
      const decoded = jwt.verify(token, secret);
      console.log('✅ Token is valid:', decoded);
    } catch (error) {
      console.log('❌ Token validation failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to generate token:', error);
  }
  
  process.exit(0);
}

generateAdminToken();