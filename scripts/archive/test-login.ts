import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testLogin() {
  console.log('🔐 Testing admin login...');
  
  try {
    // Test login
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@arcanum-scribe.com',
        password: 'JwJttGk8fHvzgS4H' // Use the password from the security fix
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('📊 User data received:');
    console.table(loginData.user);

    // Test /api/auth/me endpoint
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });

    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ /api/auth/me working!');
      console.log('📊 Me endpoint data:');
      console.table(meData);
    } else {
      console.log('❌ /api/auth/me failed');
    }

    // Test tier-info endpoint
    const tierResponse = await fetch('http://localhost:3000/api/user/tier-info', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });

    if (tierResponse.ok) {
      const tierData = await tierResponse.json();
      console.log('✅ Tier info endpoint working!');
      console.log('📊 Tier data:');
      console.table(tierData.tier);
      console.log('📊 Credits data:');
      console.table(tierData.credits);
    } else {
      const error = await tierResponse.json();
      console.log('❌ Tier info endpoint failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the server is running: npm run server');
  }
}

// Run test
testLogin();