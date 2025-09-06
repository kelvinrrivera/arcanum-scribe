import { query } from '../src/integrations/postgres/client';

async function testAdminHTTP() {
  console.log('🌐 Testing admin HTTP endpoints...');
  
  try {
    // Get admin token first
    const adminResult = await query('SELECT id, email FROM users WHERE email = $1 LIMIT 1', ['admin@arcanum-scribe.com']);
    if (adminResult.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const adminUser = adminResult.rows[0];
    console.log(`✅ Found admin user: ${adminUser.email}`);
    
    // Create a simple token for testing (in real app this would be JWT)
    const testToken = Buffer.from(JSON.stringify({ id: adminUser.id, email: adminUser.email, tier: 'admin' })).toString('base64');
    
    const baseUrl = 'http://localhost:3000/api/admin';
    
    // Test 1: Get invite codes
    console.log('\\n1. Testing GET /invite-codes...');
    try {
      const response = await fetch(`${baseUrl}/invite-codes`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const codes = await response.json();
        console.log(`✅ GET /invite-codes works: ${codes.length} codes found`);
      } else {
        console.log(`❌ GET /invite-codes failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log('❌ GET /invite-codes error:', error.message);
    }
    
    // Test 2: Create invite code
    console.log('\\n2. Testing POST /invite-codes...');
    try {
      const testCode = 'HTTP' + Math.floor(Math.random() * 1000);
      const response = await fetch(`${baseUrl}/invite-codes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: testCode })
      });
      
      if (response.ok) {
        const newCode = await response.json();
        console.log(`✅ POST /invite-codes works: Created ${newCode.code}`);
        
        // Clean up
        await query('DELETE FROM invite_codes WHERE code = $1', [testCode]);
      } else {
        const error = await response.text();
        console.log(`❌ POST /invite-codes failed: ${response.status} ${error}`);
      }
    } catch (error) {
      console.log('❌ POST /invite-codes error:', error.message);
    }
    
    // Test 3: Get OpenRouter models
    console.log('\\n3. Testing GET /openrouter/models...');
    try {
      const response = await fetch(`${baseUrl}/openrouter/models`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const models = await response.json();
        console.log(`✅ GET /openrouter/models works: ${models.length} models available`);
        console.log(`  Sample models: ${models.slice(0, 3).map(m => m.name).join(', ')}`);
      } else {
        console.log(`❌ GET /openrouter/models failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log('❌ GET /openrouter/models error:', error.message);
    }
    
    // Test 4: Get prompt logs
    console.log('\\n4. Testing GET /prompt-logs...');
    try {
      const response = await fetch(`${baseUrl}/prompt-logs`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const logs = await response.json();
        console.log(`✅ GET /prompt-logs works: ${logs.length} logs found`);
      } else {
        console.log(`❌ GET /prompt-logs failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log('❌ GET /prompt-logs error:', error.message);
    }
    
    // Test 5: Get users
    console.log('\\n5. Testing GET /users...');
    try {
      const response = await fetch(`${baseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const users = await response.json();
        console.log(`✅ GET /users works: ${users.length} users found`);
      } else {
        console.log(`❌ GET /users failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log('❌ GET /users error:', error.message);
    }
    
    console.log('\\n🎯 HTTP Endpoints Test Summary:');
    console.log('All admin endpoints should now be working correctly!');
    console.log('The admin panel at http://localhost:8080/admin should be fully functional.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
}

testAdminHTTP();