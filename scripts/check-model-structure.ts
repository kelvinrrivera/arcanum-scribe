import { query } from '../src/integrations/postgres/client';

async function checkModelStructure() {
  console.log('🔍 Checking model table structure...');
  
  try {
    // Check table structure
    const { rows: columns } = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'llm_models'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 llm_models table structure:');
    console.table(columns);
    
    // Check current models and their order
    const { rows: models } = await query(`
      SELECT m.id, m.model_name, m.display_name, p.name as provider_name, p.priority as provider_priority
      FROM llm_models m
      JOIN llm_providers p ON m.provider_id = p.id
      WHERE m.is_active = true
      ORDER BY p.priority ASC, m.created_at ASC;
    `);
    
    console.log('📊 Current models (ordered by provider priority):');
    console.table(models);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkModelStructure();