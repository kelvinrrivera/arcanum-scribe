#!/usr/bin/env tsx

/**
 * Test Image Generation
 * Tests if image generation is working correctly
 */

import { ImageService } from '../server/image-service.js';

async function testImageGeneration() {
  console.log('🖼️  Testing Image Generation');
  console.log('============================\n');

  try {
    // Initialize image service
    console.log('🔧 Initializing ImageService...');
    const imageService = new ImageService();
    await imageService.initialize();
    console.log('✅ ImageService initialized successfully\n');

    // Check if Fal.ai is configured
    console.log('🧪 Checking Fal.ai configuration...');
    const hasFalAi = process.env.FAL_AI_KEY || process.env.FAL_API_KEY || process.env.FAL_KEY;
    
    if (hasFalAi) {
      console.log('✅ Fal.ai API key found');
    } else {
      console.log('❌ No Fal.ai API key found');
      console.log('💡 Set FAL_AI_KEY, FAL_API_KEY, or FAL_KEY in your .env file');
    }
    console.log('');

    // Test adventure image generation
    console.log('🧪 Testing adventure image generation...');
    const testAdventure = {
      title: 'The Haunted Tavern',
      scenes: [
        {
          title: 'The Mysterious Inn',
          description: 'A dimly lit tavern where strange things happen at night',
          location: 'The Crooked Crown Tavern'
        },
        {
          title: 'The Cellar Discovery',
          description: 'Ancient tunnels beneath the tavern hide dark secrets',
          location: 'Underground Tunnels'
        }
      ]
    };

    // Generate a valid UUID for testing
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    const adventureStartTime = Date.now();
    
    const result = await imageService.generateAdventureImages(testAdventure, testUserId);
    const adventureDuration = Date.now() - adventureStartTime;
    
    console.log(`✅ Adventure image generation completed`);
    console.log(`🖼️  Images generated: ${result.imageUrls.length}`);
    console.log(`💰 Total cost: $${result.totalCost.toFixed(4)}`);
    console.log(`❌ Errors: ${result.errors.length}`);
    console.log(`⏱️  Total time: ${adventureDuration}ms`);
    
    if (result.errors.length > 0) {
      console.log('\n🔍 Error details:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (result.imageUrls.length > 0) {
      console.log('\n🖼️  Generated image URLs:');
      result.imageUrls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    }

  } catch (error) {
    console.log('❌ Test failed with error:');
    console.error(error);
    
    if (error instanceof Error) {
      console.log(`\n🔍 Error details:`);
      console.log(`Message: ${error.message}`);
      console.log(`Stack: ${error.stack}`);
    }
  }
}

// Run test
testImageGeneration().catch(console.error);