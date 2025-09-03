#!/usr/bin/env tsx
import 'dotenv/config';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000';

async function testAdminLogin() {
  const credentials = [
    { email: 'admin@arcanum-scribe.com', password: 'admin123' },
    { email: 'admin@arcanumscribe.com', password: 'admin123' },
    { email: 'admin@arcanum-scribe.com', password: 'admin' },
    { email: 'admin@arcanum-scribe.com', password: 'password' },
  ];

  for (const cred of credentials) {
    try {
      console.log(`🔐 Testing login with: ${cred.email} / ${cred.password}`);
      
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cred)
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log('📊 User data:');
        console.table({
          id: loginData.user.id,
          email: loginData.user.email,
          display_name: loginData.user.display_name,
          tier: loginData.user.subscription_tier,
          credits: loginData.user.credits_remaining,
          role: loginData.user.role
        });
        return; // Exit on first successful login
      } else {
        const errorData = await loginResponse.json().catch(() => ({}));
        console.log(`❌ Failed: ${loginResponse.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('❌ All login attempts failed. Need to reset admin password.');
}

testAdminLogin();