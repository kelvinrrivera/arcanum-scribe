#!/usr/bin/env tsx

/**
 * Debug LLM Models
 * Check which models are active and test them individually
 */

import { query } from '../src/integrations/postgres/client.js';
import { LLMService } from '../server/llm-service.js';

async function debugLLMModels() {
  console.log('🔍 Debugging LLM Models');
  console.log('========================\n');

  try {
    // Check active providers
    console.log('📡 Checking active LLM providers...');
    const { rows: providers } = await query(`
      SELECT * FROM llm_providers 
      WHERE is_active = true 
      ORDER BY priority ASC
    `);

    console.log(`✅ Found ${providers.length} active providers:`);
    providers.forEach((provider: any) => {
      console.log(`  - ${provider.name} (${provider.provider_type}) - Priority: ${provider.priority}`);
    });
    console.log('');

    // Check active models
    console.log('🤖 Checking active LLM models...');
    const { rows: models } = await query(`
      SELECT lm.*, lp.name as provider_name, lp.provider_type
      FROM llm_models lm
      JOIN llm_providers lp ON lm.provider_id = lp.id
      WHERE lm.is_active = true AND lm.model_type = 'chat'
      ORDER BY lp.priority ASC, lm.id ASC
    `);

    console.log(`✅ Found ${models.length} active chat models:`);
    models.forEach((model: any, index: number) => {
      console.log(`  ${index + 1}. ${model.display_name} (${model.model_name})`);
      console.log(`     Provider: ${model.provider_name}`);
      console.log(`     Max Tokens: ${model.max_tokens}`);
      console.log(`     Cost per 1M tokens: $${model.cost_per_1m_tokens}`);
      console.log('');
    });

    // Test each model individually
    console.log('🧪 Testing each model individually...\n');
    const llmService = new LLMService();
    await llmService.initialize();

    const testPrompt = 'Generate a simple JSON object with a "test" field containing "success".';
    const systemPrompt = 'You are a JSON generator. Return only valid JSON.';

    for (let i = 0; i < Math.min(models.length, 3); i++) {
      const model = models[i];
      console.log(`🔬 Testing: ${model.display_name}`);
      
      try {
        const startTime = Date.now();
        const result = await llmService.generateText(testPrompt, systemPrompt, {
          temperature: 0.7,
          max_tokens: 100,
          responseFormat: 'json'
        });
        const duration = Date.now() - startTime;

        console.log(`  ✅ Success (${duration}ms)`);
        console.log(`  📝 Response: ${JSON.stringify(result).substring(0, 100)}...`);
        
        // Try to parse if it's a string
        if (typeof result === 'string') {
          try {
            JSON.parse(result);
            console.log(`  ✅ Valid JSON`);
          } catch {
            console.log(`  ⚠️  Invalid JSON format`);
          }
        } else {
          console.log(`  ✅ Object returned (no parsing needed)`);
        }
        
      } catch (error) {
        console.log(`  ❌ Failed: ${error instanceof Error ? error.message : error}`);
      }
      console.log('');
    }

    // Check OpenRouter API key
    console.log('🔑 Checking API keys...');
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
      console.log(`✅ OpenRouter API key found (${openrouterKey.substring(0, 10)}...)`);
    } else {
      console.log(`❌ OpenRouter API key missing`);
    }

    const falKey = process.env.FAL_AI_KEY || process.env.FAL_API_KEY || process.env.FAL_KEY;
    if (falKey) {
      console.log(`✅ Fal.ai API key found (${falKey.substring(0, 10)}...)`);
    } else {
      console.log(`❌ Fal.ai API key missing`);
    }

  } catch (error) {
    console.log('❌ Debug failed:', error);
  }
}

// Run debug
debugLLMModels().catch(console.error);