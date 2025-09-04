#!/usr/bin/env tsx

console.log('🧪 Testing admin endpoints...');

const BASE_URL = 'http://localhost:3000';

// Test endpoints
const endpoints = [
  '/api/admin/users',
  '/api/admin/prompt-logs?limit=50',
  '/api/admin/stats/usage?days=7',
  '/api/admin/invite-codes',
  '/api/admin/image-providers',
  '/api/admin/image-models'
];

async function testEndpoint(endpoint: string) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but should return 401, not 404
      }
    });
    
    console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log(`❌ Endpoint not found: ${endpoint}`);
    } else if (response.status === 401) {
      console.log(`✅ Endpoint exists (auth required): ${endpoint}`);
    } else {
      console.log(`✅ Endpoint accessible: ${endpoint}`);
    }
    
  } catch (error) {
    console.log(`❌ Error testing ${endpoint}:`, error);
  }
}

async function main() {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
}

main().catch(console.error);