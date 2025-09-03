import { config } from 'dotenv';

config();

async function testNewToken() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIxY2Y2NWYzLWU0MTMtNGFhMC1iZjk0LTA3MDVlMzE5MWY1ZSIsImVtYWlsIjoiYWRtaW5AYXJjYW51bS1zY3JpYmUuY29tIiwicm9sZSI6ImFkbWluIiwidGllciI6ImFkbWluIiwic3Vic2NyaXB0aW9uX3RpZXIiOiJhZG1pbiIsImlhdCI6MTc1NjkyODQ2MywiZXhwIjoxNzU3MDE0ODYzfQ.NFDEAG3vFdkWWkDOXNZYL4xToXPH0YoVus_gCv4Vgk8";
  
  try {
    console.log('🧪 Testing both endpoints with new token...');
    
    // Test tier-info
    console.log('\n1. Testing /api/user/tier-info...');
    const tierResponse = await fetch('http://localhost:3000/api/user/tier-info', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${tierResponse.status}`);
    if (tierResponse.ok) {
      const tierData = await tierResponse.json();
      console.log('   ✅ Success:', JSON.stringify(tierData, null, 2));
    } else {
      const errorText = await tierResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
    // Test magic-credits-info
    console.log('\n2. Testing /api/user/magic-credits-info...');
    const creditsResponse = await fetch('http://localhost:3000/api/user/magic-credits-info', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${creditsResponse.status}`);
    if (creditsResponse.ok) {
      const creditsData = await creditsResponse.json();
      console.log('   ✅ Success:', JSON.stringify(creditsData, null, 2));
    } else {
      const errorText = await creditsResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
    console.log('\n🔗 NEW TOKEN TO USE:');
    console.log(token);
    console.log('\n📝 Run in browser console:');
    console.log(`localStorage.setItem("auth_token", "${token}")`);
    console.log('window.location.reload()');
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
}

testNewToken();