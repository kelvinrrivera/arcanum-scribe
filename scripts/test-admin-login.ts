import { query } from '../src/integrations/postgres/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

async function testAdminLogin() {
  console.log('🔐 Testing admin login process...');
  
  try {
    // Get admin user
    const adminResult = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', ['admin@arcanum-scribe.com']);
    if (adminResult.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const adminUser = adminResult.rows[0];
    console.log(`✅ Found admin user: ${adminUser.email}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Tier: ${adminUser.tier || adminUser.subscription_tier}`);
    
    // Test password (assuming default password)
    const testPassword = 'admin123'; // Common default password
    
    if (adminUser.password_hash) {
      try {
        const isValidPassword = await bcrypt.compare(testPassword, adminUser.password_hash);
        console.log(`🔑 Password test (${testPassword}): ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
      } catch (error) {
        console.log('❌ Password comparison failed:', error.message);
      }
    } else {
      console.log('⚠️ No password hash found for admin user');
    }
    
    // Generate a valid JWT token
    const payload = {
      id: adminUser.id,
      email: adminUser.email,
      tier: adminUser.tier || adminUser.subscription_tier,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };
    
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(payload, secret);
    
    console.log('\\n🎯 Valid JWT Token for Admin:');
    console.log(token);
    
    console.log('\\n📋 To test in browser:');
    console.log('1. Open browser console on http://localhost:8080/admin');
    console.log('2. Run: localStorage.setItem("auth_token", "' + token + '")');
    console.log('3. Refresh the page');
    
    // Test the token by making a request
    console.log('\\n🧪 Testing token with API call...');
    try {
      const response = await fetch('http://localhost:3000/api/admin/invite-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API call successful: ${data.length} invite codes found`);
      } else {
        console.log(`❌ API call failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log('Error details:', errorText);
      }
    } catch (error) {
      console.log('❌ API call error:', error.message);
    }
    
    console.log('\\n🎉 Admin login test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
}

testAdminLogin();