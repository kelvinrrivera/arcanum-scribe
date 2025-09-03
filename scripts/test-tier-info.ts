import { config } from 'dotenv';

config();

async function testTierInfo() {
  // SECURITY: Use environment variable for token
  const token = process.env.TEST_AUTH_TOKEN || "your-test-token-here";
  
  try {
    console.log('🧪 Testing tier-info endpoint...');
    
    const response = await fetch('http://localhost:3000/api/user/tier-info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Tier-info works!');
      console.log('📋 Tier data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log(`❌ Tier-info failed: ${response.status}`);
      console.log(`   Error: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
}

testTierInfo();