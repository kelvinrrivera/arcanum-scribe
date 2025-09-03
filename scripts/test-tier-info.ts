import { config } from 'dotenv';

config();

async function testTierInfo() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIxY2Y2NWYzLWU0MTMtNGFhMC1iZjk0LTA3MDVlMzE5MWY1ZSIsImVtYWlsIjoiYWRtaW5AYXJjYW51bS1zY3JpYmUuY29tIiwicm9sZSI6ImFkbWluIiwidGllciI6ImFkbWluIiwic3Vic2NyaXB0aW9uX3RpZXIiOiJhZG1pbiIsImlhdCI6MTc1NjkyNzc4MiwiZXhwIjoxNzU3MDE0MTgyfQ.9CWyKuQwfv-DGkvAgnMd4hw1Zmd8a83qAdnUDMGMktY";
  
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