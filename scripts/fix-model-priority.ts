#!/usr/bin/env tsx

/**
 * Fix Model Priority
 * Set Claude 4 Sonnet as the primary model since it works correctly
 */

import { query } from '../src/integrations/postgres/client.js';

async function fixModelPriority() {
  console.log('🔧 Fixing LLM Model Priority');
  console.log('=============================\n');

  try {
    // Show current priorities
    console.log('📊 Current model priorities:');
    const { rows: currentModels } = await query(`
      SELECT model_name, display_name, priority 
      FROM llm_models 
      WHERE model_type = 'chat' AND is_active = true
      ORDER BY priority ASC
    `);

    currentModels.forEach((model: any, index: number) => {
      console.log(`  ${index + 1}. ${model.display_name} (Priority: ${model.priority || 'NULL'})`);
    });
    console.log('');

    // Update priorities to put Claude first
    console.log('🔄 Updating priorities...');
    
    await query(`
      UPDATE llm_models 
      SET priority = CASE 
        WHEN model_name = 'anthropic/claude-4-sonnet' THEN 1
        WHEN model_name = 'google/gemini-2.5-flash' THEN 2  
        WHEN model_name = 'openai/gpt-5-mini' THEN 3
        ELSE priority 
      END 
      WHERE model_type = 'chat' AND is_active = true
    `);

    console.log('✅ Priorities updated successfully');

    // Show new priorities
    console.log('\n📊 New model priorities:');
    const { rows: newModels } = await query(`
      SELECT model_name, display_name, priority 
      FROM llm_models 
      WHERE model_type = 'chat' AND is_active = true
      ORDER BY priority ASC
    `);

    newModels.forEach((model: any, index: number) => {
      console.log(`  ${index + 1}. ${model.display_name} (Priority: ${model.priority})`);
    });

    console.log('\n🎉 Claude 4 Sonnet is now the primary model!');
    console.log('💡 This should resolve the JSON parsing issues.');

  } catch (error) {
    console.log('❌ Failed to update priorities:', error);
  }
}

// Run the fix
fixModelPriority().catch(console.error);