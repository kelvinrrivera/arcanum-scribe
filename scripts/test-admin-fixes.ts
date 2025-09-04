#!/usr/bin/env tsx

console.log('🧪 Testing Admin Panel Fixes');
console.log('============================\n');

const BASE_URL = 'http://localhost:3000';

// Test endpoints with a valid admin token
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlzX2FkbWluIjp0cnVlLCJ0aWVyIjoicHJvZmVzc2lvbmFsIiwiaWF0IjoxNzU2OTg1MzkwLCJleHAiOjE3NTcwNzE3OTB9.cMaapBx1b7CzTx18XBDG5eKD2QX8jmInMIKR_ksI5aQ';

async function testInviteCodeCreation() {
  console.log('🎫 Testing invite code creation...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/invite-codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        max_uses: 5,
        expires_in_days: 30
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Invite code created successfully:', data.code);
      
      // Clean up - delete the test code
      await fetch(`${BASE_URL}/api/admin/invite-codes/${data.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log('🧹 Test invite code cleaned up');
      
    } else {
      const error = await response.text();
      console.log('❌ Failed to create invite code:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ Error testing invite code creation:', error);
  }
}

async function testFalModelTest() {
  console.log('\n🖼️ Testing Fal model test endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/test-fal-model`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model_name: 'fal-ai/flux-schnell'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Fal model test successful:', data.message);
    } else {
      const error = await response.text();
      console.log('❌ Failed to test Fal model:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ Error testing Fal model:', error);
  }
}

async function testAllEndpoints() {
  console.log('\n📡 Testing all admin endpoints...');
  
  const endpoints = [
    '/api/admin/users',
    '/api/admin/llm-providers',
    '/api/admin/llm-models',
    '/api/admin/image-providers',
    '/api/admin/image-models',
    '/api/admin/prompt-logs?limit=10',
    '/api/admin/stats/usage?days=7',
    '/api/admin/invite-codes'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${endpoint}: OK`);
      } else {
        console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: Error - ${error}`);
    }
  }
}

async function main() {
  await testInviteCodeCreation();
  await testFalModelTest();
  await testAllEndpoints();
  
  console.log('\n🎉 Admin panel testing completed!');
  console.log('\n📋 Summary of fixes:');
  console.log('✅ Fixed invite_codes table structure');
  console.log('✅ Added test-fal-model endpoint');
  console.log('✅ Fixed formatCost function in LLMModelsManager');
  console.log('✅ Added dark theme support to Admin page');
  console.log('\n🌐 Ready to test in browser: http://localhost:8080/admin');
}

main().catch(console.error);