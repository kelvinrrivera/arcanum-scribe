#!/usr/bin/env npx tsx

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables exactly like the server does
dotenv.config();

async function debugAuth() {
  try {
    console.log('🔍 Debugging JWT Authentication');
    console.log('==============================');
    
    // Get the exact same JWT_SECRET the server uses
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    console.log('JWT_SECRET found:', !!process.env.JWT_SECRET);
    console.log('Secret length:', secret.length);
    
    // Create token exactly like we would for a real user
    const payload = {
      id: 'admin-user',
      email: 'admin@test.com',
      role: 'admin',
      tier: 'admin'
    };
    
    console.log('\n🔑 Creating token...');
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });
    console.log('Token created successfully');
    
    // Verify token locally (simulate server verification)
    console.log('\n🔍 Verifying token locally...');
    try {
      const decoded = jwt.verify(token, secret);
      console.log('✅ Local verification successful');
      console.log('Decoded payload:', decoded);
    } catch (verifyError) {
      console.log('❌ Local verification failed:', verifyError.message);
      return;
    }
    
    // Test the authentication middleware logic
    console.log('\n🧪 Simulating server auth middleware...');
    const authHeader = `Bearer ${token}`;
    const extractedToken = authHeader && authHeader.split(' ')[1];
    
    if (!extractedToken) {
      console.log('❌ Token extraction failed');
      return;
    }
    
    try {
      const middlewareDecoded = jwt.verify(extractedToken, secret);
      console.log('✅ Middleware simulation successful');
      console.log('Middleware decoded:', middlewareDecoded);
    } catch (middlewareError) {
      console.log('❌ Middleware simulation failed:', middlewareError.message);
      return;
    }
    
    console.log('\n🎯 WORKING TOKEN:');
    console.log(token);
    console.log('\n📝 Use this in browser console:');
    console.log(`localStorage.setItem("auth_token", "${token}")`);
    
    // Now test with the actual server
    console.log('\n🌐 Testing with actual server...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/llm-providers', { headers });
      console.log(`Server response: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SERVER SUCCESS!');
        console.log(`Found ${data.providers?.length || 0} providers`);
      } else {
        const errorText = await response.text();
        console.log('❌ Server error:', errorText);
        
        // Additional debugging
        console.log('\n🔍 Additional debugging info:');
        console.log('- Check if server is running: pnpm run dev:full');
        console.log('- Check server logs for JWT errors');
        console.log('- Verify no middleware conflicts');
      }
    } catch (fetchError) {
      console.log('❌ Fetch error:', fetchError.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAuth();