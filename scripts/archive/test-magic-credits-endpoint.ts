#!/usr/bin/env tsx
import 'dotenv/config';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000';

async function testMagicCreditsEndpoint() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Login first
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
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Login successful!');

    // Test magic-credits-info endpoint
    console.log('🔍 Testing /api/user/magic-credits-info endpoint...');
    
    const magicCreditsResponse = await fetch(`${API_BASE}/api/user/magic-credits-info`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!magicCreditsResponse.ok) {
      throw new Error(`Magic credits endpoint failed: ${magicCreditsResponse.status}`);
    }

    const magicCreditsData = await magicCreditsResponse.json();
    
    console.log('✅ Magic credits endpoint working!');
    console.log('📊 Magic Credits Data:');
    console.table(magicCreditsData.tier);
    console.log('📊 Credits data:');
    console.table(magicCreditsData.credits);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMagicCreditsEndpoint();