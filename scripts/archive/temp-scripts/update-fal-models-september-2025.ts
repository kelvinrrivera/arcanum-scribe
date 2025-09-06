#!/usr/bin/env npx tsx

/**
 * Update Fal.ai image models to latest versions (September 2025)
 * With correct pricing per megapixel
 */

import { query } from '../src/integrations/postgres/client.js';

async function updateFalModels() {
  console.log('🎨 Updating Fal.ai Image Models to September 2025 versions');
  console.log('========================================================\n');

  try {
    // Check if fal_models table exists, if not create it
    console.log('🔍 Checking fal_models table...');
    
    try {
      await query('SELECT COUNT(*) FROM fal_models LIMIT 1');
      console.log('   ✅ fal_models table exists');
    } catch (error) {
      console.log('   📋 Creating fal_models table...');
      
      await query(`
        CREATE TABLE IF NOT EXISTS fal_models (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          model_id VARCHAR(255) UNIQUE NOT NULL,
          display_name VARCHAR(255) NOT NULL,
          model_type VARCHAR(100) NOT NULL DEFAULT 'image-generation',
          pricing_per_megapixel DECIMAL(10, 6) NOT NULL,
          pricing_unit VARCHAR(50) NOT NULL DEFAULT 'megapixel',
          max_resolution VARCHAR(50) DEFAULT '1024x1024',
          supports_img2img BOOLEAN DEFAULT false,
          supports_inpainting BOOLEAN DEFAULT false,
          supports_outpainting BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          priority INTEGER DEFAULT 1,
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('   ✅ fal_models table created');
    }

    // Clear existing fal models
    console.log('\n🗑️  Removing old Fal.ai models...');
    await query('DELETE FROM fal_models');
    console.log('   ✅ Old Fal.ai models removed');

    // Add updated Fal.ai models (September 2025)
    console.log('\n🎨 Adding updated Fal.ai models (September 2025)...');
    
    const falModels = [
      {
        model_id: 'fal-ai/flux-1/schnell',
        display_name: 'FLUX.1 Schnell (Fast)',
        pricing_per_megapixel: 0.025,
        max_resolution: '1024x1024',
        supports_img2img: false,
        supports_inpainting: false,
        supports_outpainting: false,
        priority: 1,
        description: 'Fast text-to-image generation with FLUX.1 Schnell model'
      },
      {
        model_id: 'fal-ai/flux-pro/v1.1',
        display_name: 'FLUX Pro v1.1 (High Quality)',
        pricing_per_megapixel: 0.040,
        max_resolution: '2048x2048',
        supports_img2img: true,
        supports_inpainting: false,
        supports_outpainting: false,
        priority: 2,
        description: 'High-quality text-to-image with advanced prompt understanding'
      },
      {
        model_id: 'fal-ai/flux-pro/kontext',
        display_name: 'FLUX Pro Kontext (Context-Aware)',
        pricing_per_megapixel: 0.040,
        max_resolution: '1536x1536',
        supports_img2img: true,
        supports_inpainting: true,
        supports_outpainting: false,
        priority: 3,
        description: 'Context-aware image generation with reference image support'
      },
      {
        model_id: 'fal-ai/flux-kontext/dev',
        display_name: 'FLUX Kontext Dev (Development)',
        pricing_per_megapixel: 0.025,
        max_resolution: '1024x1024',
        supports_img2img: true,
        supports_inpainting: true,
        supports_outpainting: true,
        priority: 4,
        description: 'Development version for testing with inpainting/outpainting support'
      },
      {
        model_id: 'fal-ai/flux-kontext',
        display_name: 'FLUX Kontext (Generative Editor)',
        pricing_per_megapixel: 0.035,
        max_resolution: '1536x1536',
        supports_img2img: true,
        supports_inpainting: true,
        supports_outpainting: true,
        priority: 5,
        description: 'Full generative editor with inpainting and outpainting capabilities'
      }
    ];

    for (const model of falModels) {
      await query(`
        INSERT INTO fal_models (
          model_id, display_name, pricing_per_megapixel, pricing_unit, 
          max_resolution, supports_img2img, supports_inpainting, supports_outpainting,
          is_active, priority, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        model.model_id,
        model.display_name,
        model.pricing_per_megapixel,
        'megapixel',
        model.max_resolution,
        model.supports_img2img,
        model.supports_inpainting,
        model.supports_outpainting,
        true,
        model.priority,
        model.description
      ]);

      console.log(`   ✅ ${model.display_name}`);
      console.log(`      Model ID: ${model.model_id}`);
      console.log(`      Price: $${model.pricing_per_megapixel}/MP`);
      console.log(`      Max Resolution: ${model.max_resolution}`);
      console.log(`      Features: ${[
        model.supports_img2img ? 'img2img' : null,
        model.supports_inpainting ? 'inpainting' : null,
        model.supports_outpainting ? 'outpainting' : null
      ].filter(Boolean).join(', ') || 'text2img only'}`);
      console.log('');
    }

    // Show final configuration
    console.log('📊 Updated Fal.ai Model Configuration:');
    const { rows: finalModels } = await query(`
      SELECT model_id, display_name, pricing_per_megapixel, max_resolution,
             supports_img2img, supports_inpainting, supports_outpainting
      FROM fal_models
      WHERE is_active = true
      ORDER BY priority ASC
    `);

    finalModels.forEach((model: any, index: number) => {
      console.log(`   ${index + 1}. ${model.display_name}`);
      console.log(`      ID: ${model.model_id}`);
      console.log(`      Price: $${model.pricing_per_megapixel}/MP`);
      console.log(`      Resolution: ${model.max_resolution}`);
      console.log('');
    });

    console.log('🎉 Fal.ai model update completed successfully!');
    console.log(`📈 Total image models: ${finalModels.length}`);
    
    // Pricing summary
    const cheapest = finalModels.reduce((min: any, model: any) => 
      model.pricing_per_megapixel < min.pricing_per_megapixel ? model : min
    );
    const mostExpensive = finalModels.reduce((max: any, model: any) => 
      model.pricing_per_megapixel > max.pricing_per_megapixel ? model : max
    );
    
    console.log(`💰 Cheapest: ${cheapest.display_name} ($${cheapest.pricing_per_megapixel}/MP)`);
    console.log(`💎 Most Expensive: ${mostExpensive.display_name} ($${mostExpensive.pricing_per_megapixel}/MP)`);

    // Create admin configuration table for image models
    console.log('\n🔧 Setting up admin configuration...');
    
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS admin_image_config (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          default_model_id VARCHAR(255) REFERENCES fal_models(model_id),
          default_resolution VARCHAR(50) DEFAULT '1024x1024',
          max_images_per_adventure INTEGER DEFAULT 10,
          enable_img2img BOOLEAN DEFAULT true,
          enable_inpainting BOOLEAN DEFAULT true,
          enable_outpainting BOOLEAN DEFAULT false,
          pricing_multiplier DECIMAL(3, 2) DEFAULT 1.00,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Insert default configuration
      await query(`
        INSERT INTO admin_image_config (default_model_id, default_resolution, max_images_per_adventure)
        VALUES ('fal-ai/flux-1/schnell', '1024x1024', 10)
        ON CONFLICT DO NOTHING
      `);

      console.log('   ✅ Admin image configuration table created');
    } catch (error) {
      console.log('   ⚠️  Admin config table already exists or error:', error.message);
    }

  } catch (error) {
    console.log('❌ Fal.ai model update failed:', error);
    throw error;
  }
}

// Run update
updateFalModels().catch(console.error);