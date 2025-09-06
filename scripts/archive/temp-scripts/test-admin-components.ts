#!/usr/bin/env npx tsx

import { query } from '../src/integrations/postgres/client.js';

async function testAdminComponents() {
  try {
    console.log('🧪 Testing Admin Components Data');
    console.log('================================');

    // Test 1: LLM Providers (simulating the API call)
    console.log('\n📊 Testing LLM Providers...');
    const { rows: providers } = await query(`
      SELECT id, name, provider_type, is_active, priority
      FROM llm_providers 
      ORDER BY priority ASC, name ASC
    `);
    
    console.log(`✅ Found ${providers.length} providers:`);
    providers.forEach(p => {
      console.log(`   - ${p.name} (${p.provider_type}) - ${p.is_active ? 'Active' : 'Inactive'}`);
    });

    // Test 2: LLM Models (simulating the API call)
    console.log('\n🤖 Testing LLM Models...');
    const { rows: models } = await query(`
      SELECT 
        lm.id,
        lm.provider_id,
        lm.model_name,
        lm.display_name,
        lm.model_type,
        lm.max_tokens,
        lm.temperature,
        lm.is_active,
        lm.cost_per_1m_tokens,
        lp.name as provider_name,
        lp.provider_type
      FROM llm_models lm
      JOIN llm_providers lp ON lm.provider_id = lp.id
      ORDER BY lp.priority ASC, lm.display_name ASC
    `);
    
    console.log(`✅ Found ${models.length} models:`);
    
    // Group by provider
    const modelsByProvider = models.reduce((acc, model) => {
      if (!acc[model.provider_type]) acc[model.provider_type] = [];
      acc[model.provider_type].push(model);
      return acc;
    }, {} as Record<string, any[]>);
    
    Object.entries(modelsByProvider).forEach(([provider, providerModels]) => {
      console.log(`\n   🏢 ${provider.toUpperCase()}:`);
      providerModels.forEach(m => {
        console.log(`      - ${m.display_name} (${m.model_name})`);
        console.log(`        Cost: $${m.cost_per_1m_tokens}/1M tokens`);
        console.log(`        Max tokens: ${m.max_tokens}, Temp: ${m.temperature}`);
        console.log(`        Status: ${m.is_active ? '✅ Active' : '❌ Inactive'}`);
      });
    });

    // Test 3: Fal.ai Models (simulating the API call)
    console.log('\n🎨 Testing Fal.ai Models...');
    const { rows: falModels } = await query(`
      SELECT 
        id,
        model_id,
        display_name,
        description,
        pricing_per_megapixel,
        max_resolution,
        supports_img2img,
        supports_inpainting,
        supports_outpainting,
        is_active
      FROM fal_models
      ORDER BY display_name ASC
    `);
    
    console.log(`✅ Found ${falModels.length} Fal.ai models:`);
    falModels.forEach(m => {
      console.log(`   - ${m.display_name} (${m.model_id})`);
      console.log(`     Price: $${m.pricing_per_megapixel}/MP, Max: ${m.max_resolution}`);
      console.log(`     Features: ${[
        m.supports_img2img ? 'img2img' : null,
        m.supports_inpainting ? 'inpainting' : null,
        m.supports_outpainting ? 'outpainting' : null
      ].filter(Boolean).join(', ') || 'basic'}`);
      console.log(`     Status: ${m.is_active ? '✅ Active' : '❌ Inactive'}`);
    });

    // Test 4: Image Config
    console.log('\n⚙️ Testing Image Configuration...');
    const { rows: imageConfig } = await query(`
      SELECT * FROM admin_image_config 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (imageConfig.length > 0) {
      const config = imageConfig[0];
      console.log('✅ Image configuration found:');
      console.log(`   - Default model: ${config.default_model_id}`);
      console.log(`   - Default resolution: ${config.default_resolution}`);
      console.log(`   - Max images per adventure: ${config.max_images_per_adventure}`);
      console.log(`   - Features: img2img=${config.enable_img2img}, inpainting=${config.enable_inpainting}, outpainting=${config.enable_outpainting}`);
    } else {
      console.log('⚠️  No image configuration found');
    }

    console.log('\n🎉 All admin component data is ready!');
    console.log('\n📋 Summary:');
    console.log(`   - ${providers.length} LLM providers`);
    console.log(`   - ${models.length} LLM models`);
    console.log(`   - ${falModels.length} Fal.ai models`);
    console.log(`   - Image config: ${imageConfig.length > 0 ? 'Ready' : 'Missing'}`);
    
    console.log('\n🚀 Ready to test in admin interface at /admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testAdminComponents();