#!/usr/bin/env tsx
import { query } from '../src/integrations/postgres/client';

async function setCheapModelsForTesting() {
  console.log('🔧 Setting cheap models for testing (September 2025 models)...');
  
  try {
    // Desactivar todos los modelos Claude (muy caros)
    await query(`
      UPDATE llm_models 
      SET is_active = false 
      WHERE model_name LIKE '%claude%'
    `);
    console.log('❌ Disabled all Claude models (too expensive for testing)');

    // Desactivar modelos caros (GPT-5, GPT-4.1, Gemini Pro)
    await query(`
      UPDATE llm_models 
      SET is_active = false 
      WHERE model_name IN ('gpt-5', 'gpt-4.1', 'gemini-2.5-pro')
    `);
    console.log('❌ Disabled expensive models (GPT-5, GPT-4.1, Gemini Pro)');

    // Activar solo modelos baratos de septiembre 2025
    await query(`
      UPDATE llm_models SET is_active = true
      WHERE model_name IN ('gpt-5-mini', 'gemini-2.5-flash')
    `);
    console.log('✅ Activated September 2025 cheap models: GPT-5-mini, Gemini 2.5 Flash');

    // Verificar configuración actual
    const activeModels = await query(`
      SELECT model_name, display_name, is_active, cost_per_1m_tokens
      FROM llm_models 
      WHERE is_active = true 
      ORDER BY model_name ASC
    `);

    console.log('\n📊 Active models for testing:');
    activeModels.rows.forEach((model: any, index: number) => {
      console.log(`  ${index + 1}. ${model.display_name} (${model.model_name}) - $${model.cost_per_1m_tokens}/1M tokens`);
    });

    const inactiveModels = await query(`
      SELECT model_name, display_name 
      FROM llm_models 
      WHERE is_active = false 
      ORDER BY model_name ASC
    `);

    console.log('\n🔒 Disabled models (to save costs):');
    inactiveModels.rows.forEach((model: any) => {
      console.log(`  - ${model.display_name} (${model.model_name})`);
    });

    console.log('\n💰 Cost optimization: Only using cheapest September 2025 models');
    
  } catch (error) {
    console.error('❌ Error setting cheap models:', error);
    process.exit(1);
  }
}

setCheapModelsForTesting();