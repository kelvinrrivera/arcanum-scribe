#!/usr/bin/env tsx
import 'dotenv/config';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000';

async function testAuthEndpoints() {
  console.log('🔍 Testing authentication endpoints...');
  console.log(`API Base URL: ${API_BASE}`);
  
  try {
    // Test health endpoint first
    console.log('\n1. Testing health endpoint...');
    try {
      const healthResponse = await fetch(`${API_BASE}/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Server is running');
        console.log(`📊 Health data:`, healthData);
      } else {
        console.log(`❌ Health endpoint failed: ${healthResponse.status}`);
      }
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('💡 Start the server with: npm run server');
      console.log(`💡 Make sure server is running on port ${API_BASE.split(':').pop()}`);
      return;
    }

    // Test login endpoint
    console.log('\n2. Testing login endpoint...');
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

    console.log(`Login response status: ${loginResponse.status}`);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed');
      console.log(`Error response: ${errorText}`);
      
      // Check if it's a 404 (endpoint not found)
      if (loginResponse.status === 404) {
        console.log('💡 Login endpoint not found - check server routes');
      }
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('📊 Login response:');
    console.table({
      token_exists: !!loginData.token,
      user_id: loginData.user?.id,
      user_email: loginData.user?.email,
      user_tier: loginData.user?.subscription_tier,
      credits: loginData.user?.credits_remaining
    });

    // Test protected endpoint
    console.log('\n3. Testing protected endpoint...');
    const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ Protected endpoint working');
      console.log('📊 User data:');
      console.table({
        id: meData.id,
        email: meData.email,
        tier: meData.subscription_tier,
        credits: meData.credits_remaining
      });
    } else {
      console.log(`❌ Protected endpoint failed: ${meResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthEndpoints();