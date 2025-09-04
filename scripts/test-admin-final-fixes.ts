#!/usr/bin/env tsx

console.log('🧪 Testing Final Admin Panel Fixes');
console.log('==================================\n');

const BASE_URL = 'http://localhost:3000';
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlzX2FkbWluIjp0cnVlLCJ0aWVyIjoicHJvZmVzc2lvbmFsIiwiaWF0IjoxNzU2OTg1MzkwLCJleHAiOjE3NTcwNzE3OTB9.cMaapBx1b7CzTx18XBDG5eKD2QX8jmInMIKR_ksI5aQ';

async function testEndpoint(endpoint: string, description: string) {
  console.log(`🔍 Testing ${description}...`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${description}: OK`);
      
      // Show data structure
      if (Array.isArray(data)) {
        console.log(`   📊 Returned array with ${data.length} items`);
      } else if (data && typeof data === 'object') {
        const keys = Object.keys(data);
        console.log(`   📊 Returned object with keys: ${keys.join(', ')}`);
        
        // Show array lengths for nested arrays
        keys.forEach(key => {
          if (Array.isArray(data[key])) {
            console.log(`   📊 ${key}: array with ${data[key].length} items`);
          }
        });
      }
      
    } else {
      const errorText = await response.text();
      console.log(`❌ ${description}: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorText.substring(0, 100)}...`);
    }
    
  } catch (error) {
    console.log(`❌ ${description}: Network error - ${error}`);
  }
}

async function testAllEndpoints() {
  const endpoints = [
    ['/api/admin/users', 'Users endpoint'],
    ['/api/admin/llm-providers', 'LLM Providers endpoint'],
    ['/api/admin/llm-models', 'LLM Models endpoint'],
    ['/api/admin/image-providers', 'Image Providers endpoint'],
    ['/api/admin/image-models', 'Image Models endpoint'],
    ['/api/admin/prompt-logs?limit=10', 'Prompt Logs endpoint'],
    ['/api/admin/stats/usage?days=7', 'Usage Stats endpoint'],
    ['/api/admin/invite-codes', 'Invite Codes endpoint']
  ];
  
  for (const [endpoint, description] of endpoints) {
    await testEndpoint(endpoint, description);
    console.log(''); // Empty line for readability
  }
}

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
        max_uses: 3,
        expires_in_days: 30
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Invite code created successfully');
      console.log(`   📋 Code: ${data.code}`);
      console.log(`   📋 Max uses: ${data.max_uses}`);
      console.log(`   📋 Expires: ${data.expires_at}`);
      
      // Clean up
      if (data.id) {
        await fetch(`${BASE_URL}/api/admin/invite-codes/${data.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log('🧹 Test invite code cleaned up');
      }
      
    } else {
      const error = await response.text();
      console.log('❌ Failed to create invite code:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ Error testing invite code creation:', error);
  }
}

async function main() {
  await testAllEndpoints();
  await testInviteCodeCreation();
  
  console.log('\n🎉 Admin panel testing completed!');
  console.log('\n📋 Summary of fixes applied:');
  console.log('✅ Fixed inviteCodes.map error - Added array validation');
  console.log('✅ Fixed prompt-logs endpoint - Changed timestamp to created_at');
  console.log('✅ Fixed image-models endpoint - Fixed column names');
  console.log('✅ Fixed stats/usage endpoint - Fixed column references');
  console.log('✅ Fixed systemStats parsing - Added array validation');
  
  console.log('\n🌐 Ready to test in browser: http://localhost:8080/admin');
  console.log('🔑 Use this token in localStorage:');
  console.log(`localStorage.setItem('token', '${adminToken}');`);
}

main().catch(console.error);