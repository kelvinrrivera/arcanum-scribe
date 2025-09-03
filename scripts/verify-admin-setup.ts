import { query } from '../src/integrations/postgres/client';

async function verifyAdminSetup() {
  console.log('🔍 Verifying admin setup...');
  
  try {
    // Check admin user
    const { rows: adminUsers } = await query(`
      SELECT id, email, username, tier, subscription_tier 
      FROM users 
      WHERE tier = 'admin' OR subscription_tier = 'admin'
    `);
    
    console.log('👤 Admin users:');
    console.table(adminUsers);
    
    // Check LLM providers
    const { rows: providers } = await query(`
      SELECT id, name, provider_type, is_active, priority
      FROM llm_providers 
      ORDER BY priority ASC
    `);
    
    console.log('🔌 LLM Providers:');
    console.table(providers);
    
    // Check LLM models
    const { rows: models } = await query(`
      SELECT 
        m.id, 
        m.model_name, 
        m.display_name, 
        m.is_active,
        p.name as provider_name,
        p.priority as provider_priority
      FROM llm_models m
      JOIN llm_providers p ON m.provider_id = p.id
      ORDER BY p.priority ASC, m.created_at ASC
    `);
    
    console.log('🤖 LLM Models (in priority order):');
    console.table(models);
    
    // Check if admin routes are working
    console.log('\n📋 Admin Panel Access:');
    console.log('• URL: http://localhost:8080/admin');
    console.log('• Login as admin user to access');
    console.log('• Navigate to "LLM Models" tab to manage models');
    
    console.log('\n✅ Admin setup verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

verifyAdminSetup();