#!/usr/bin/env tsx
import { query } from '../src/integrations/postgres/client';

async function checkLLMModelsStructure() {
  console.log('🔍 Checking LLM models table structure...');
  
  try {
    // Ver estructura de la tabla
    const structure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'llm_models'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 LLM Models table structure:');
    structure.rows.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Ver modelos actuales
    const models = await query(`
      SELECT * FROM llm_models 
      ORDER BY model_name
    `);

    console.log('\n📊 Current models:');
    models.rows.forEach((model: any) => {
      console.log(`  - ${model.model_name}: active=${model.is_active}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking structure:', error);
    process.exit(1);
  }
}

checkLLMModelsStructure();