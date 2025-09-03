// Script para verificar que el token funciona correctamente
console.log('🔍 Verifying token fix...');

// Check current token
const token = localStorage.getItem('auth_token');
console.log('Current auth_token exists:', !!token);

if (token) {
  console.log('Token length:', token.length);
  
  // Test both endpoints that were failing
  Promise.all([
    fetch('/api/user/tier-info', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }),
    fetch('/api/user/magic-credits-info', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  ]).then(async ([tierResponse, creditsResponse]) => {
    console.log('Tier-info status:', tierResponse.status);
    console.log('Magic-credits-info status:', creditsResponse.status);
    
    if (tierResponse.ok && creditsResponse.ok) {
      console.log('✅ Both endpoints working!');
      const tierData = await tierResponse.json();
      const creditsData = await creditsResponse.json();
      console.log('Tier data:', tierData);
      console.log('Credits remaining:', creditsData.credits.creditsRemaining);
    } else {
      console.log('❌ Some endpoints still failing');
    }
  }).catch(error => {
    console.log('❌ Network error:', error.message);
  });
} else {
  console.log('❌ No token found. Please set it first:');
  console.log('localStorage.setItem("auth_token", "YOUR_TOKEN_HERE")');
}