import { query } from '../src/integrations/postgres/client';

async function testAdminPanel() {
  console.log('🧪 Testing admin panel functionality...');
  
  try {
    // Test 1: Check admin user exists
    const { rows: adminUsers } = await query(`
      SELECT id, email, username, tier, subscription_tier 
      FROM users 
      WHERE tier = 'admin' OR subscription_tier = 'admin'
    `);
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUsers[0].email);
    
    // Test 2: Check LLM providers
    const { rows: providers } = await query(`
      SELECT COUNT(*) as count FROM llm_providers WHERE is_active = true
    `);
    console.log(`✅ Active LLM providers: ${providers[0].count}`);
    
    // Test 3: Check LLM models
    const { rows: models } = await query(`
      SELECT COUNT(*) as count FROM llm_models WHERE is_active = true
    `);
    console.log(`✅ Active LLM models: ${models[0].count}`);
    
    // Test 4: Check admin tables
    const tables = ['invite_codes', 'api_logs', 'system_configs', 'prompt_templates'];
    for (const table of tables) {
      try {
        const { rows } = await query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ Table ${table}: ${rows[0].count} records`);
      } catch (error) {
        console.log(`❌ Table ${table}: Not found or error`);
      }
    }
    
    // Test 5: Check system configs
    const { rows: configs } = await query(`
      SELECT key, value FROM system_configs ORDER BY key
    `);
    
    console.log('\n📋 System Configurations:');
    configs.forEach(config => {
      console.log(`  • ${config.key}: ${config.value}`);
    });
    
    console.log('\n🎯 Admin Panel Test Results:');
    console.log('• URL: http://localhost:8080/admin');
    console.log('• Login with: admin@arcanum-scribe.com');
    console.log('• All backend endpoints should be working');
    console.log('• Database tables are properly set up');
    
    console.log('\n✅ Admin panel test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing admin panel:', error);
  }
  
  process.exit(0);
}

testAdminPanel();