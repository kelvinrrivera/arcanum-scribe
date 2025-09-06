// Script para debuggear el token en el navegador
// Ejecuta esto en la consola del navegador

console.log('🔍 Debugging browser token...');

// Check if token exists
const token = localStorage.getItem('auth_token');
console.log('Token exists:', !!token);

if (token) {
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Try to decode the JWT payload (without verification)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < now;
      console.log('Token expired:', isExpired);
      
      if (isExpired) {
        console.log('❌ Token is expired!');
      } else {
        console.log('✅ Token is valid');
      }
    }
  } catch (error) {
    console.log('❌ Error decoding token:', error.message);
  }
} else {
  console.log('❌ No token found in localStorage');
}

// Test making a request
console.log('\n🧪 Testing API request...');
fetch('/api/user/tier-info', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('API Response status:', response.status);
  return response.text();
})
.then(data => {
  console.log('API Response data:', data);
})
.catch(error => {
  console.log('API Error:', error.message);
});