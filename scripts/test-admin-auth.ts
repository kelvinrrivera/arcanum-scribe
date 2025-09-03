#!/usr/bin/env npx tsx

import jwt from 'jsonwebtoken';

async function createTestToken() {
  try {
    console.log('🔑 Creating test authentication token...');
    
    // Create a test user payload
    const testUser = {
      id: 'test-admin-user',
      email: 'admin@test.com',
      role: 'admin',
      tier: 'admin'
    };
    
    // Create JWT token
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(testUser, secret, { expiresIn: '24h' });
    
    console.log('✅ Test token created successfully!');
    console.log('📋 Token payload:', testUser);
    console.log('🔗 Token (copy this to localStorage as "auth_token"):');
    console.log('');
    console.log(token);
    console.log('');
    console.log('📝 To use this token:');
    console.log('1. Open browser dev tools (F12)');
    console.log('2. Go to Console tab');
    console.log('3. Run: localStorage.setItem("auth_token", "' + token + '")');
    console.log('4. Refresh the /admin page');
    console.log('');
    console.log('🧪 Or test API directly:');
    console.log('curl -H "Authorization: Bearer ' + token + '" http://localhost:3001/api/admin/llm-providers');
    
  } catch (error) {
    console.error('❌ Error creating token:', error.message);
  }
}

createTestToken();