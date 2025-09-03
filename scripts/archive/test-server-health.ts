#!/usr/bin/env tsx
import 'dotenv/config';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000';

async function testServerHealth() {
  console.log('🔍 Testing server health...');
  
  try {
    // Test basic server response
    console.log('1. Testing basic server connection...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is responding');
    } else {
      console.log('❌ Server health check failed');
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('💡 Start the server with: npm run server');
    return;
  }

  try {
    // Test admin login
    console.log('2. Testing admin login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@arcanum-scribe.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Admin login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Admin login successful');

    // Test admin endpoints
    console.log('3. Testing admin endpoints...');
    
    const endpoints = [
      '/api/admin/users',
      '/api/user/tier-info',
      '/api/user/magic-credits-info',
      '/api/admin/llm-providers',
      '/api/admin/llm-models'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log(`✅ ${endpoint} - OK`);
        } else {
          console.log(`❌ ${endpoint} - ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Network error`);
      }
    }

    console.log('\n🎉 Server health check completed!');
    console.log('💡 If all endpoints are OK, the admin panel should work correctly.');

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

testServerHealth();