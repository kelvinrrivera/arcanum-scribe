import { query } from '../src/integrations/postgres/client';

async function updateModelPriorities() {
  console.log('🔧 Updating model priorities...');
  
  try {
    // Update priorities: OpenAI first, Gemini second, Claude third
    await query(`
      UPDATE llm_models SET priority = CASE 
        WHEN model_name = 'openai/gpt-5-mini' THEN 1
        WHEN model_name = 'google/gemini-2.5-flash' THEN 2  
        WHEN model_name = 'anthropic/claude-4-sonnet' THEN 3
        ELSE priority 
      END 
      WHERE provider_id = (SELECT id FROM llm_providers WHERE name = 'OpenRouter');
    `);
    
    // Verify the order
    const { rows } = await query(`
      SELECT m.model_name, m.display_name, m.priority, p.name as provider_name
      FROM llm_models m
      JOIN llm_providers p ON m.provider_id = p.id
      WHERE p.name = 'OpenRouter' AND m.is_active = true
      ORDER BY m.priority ASC;
    `);
    
    console.log('📊 Updated model priorities:');
    console.table(rows);
    
    console.log('✅ Model priorities updated successfully!');
  } catch (error) {
    console.error('❌ Error updating priorities:', error);
  }
  
  process.exit(0);
}

updateModelPriorities();