#!/usr/bin/env tsx

/**
 * Setup OpenRouter Configuration for PostgreSQL
 * 
 * This script configures OpenRouter as the primary LLM provider
 */

import dotenv from 'dotenv';
import { query } from '../src/integrations/postgres/client';

// Load environment variables
dotenv.config();

interface SetupResult {
  step: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
}

class OpenRouterSetup {
  private results: SetupResult[] = [];

  addResult(step: string, status: 'SUCCESS' | 'FAILED', message: string) {
    this.results.push({ step, status, message });
    console.log(`${status === 'SUCCESS' ? '✅' : '❌'} ${step}: ${message}`);
  }

  async run() {
    console.log('🚀 Setting up OpenRouter for PostgreSQL...\n');

    // Step 1: Verify environment variables
    await this.verifyEnvironment();

    // Step 2: Configure OpenRouter as primary provider
    await this.configureOpenRouter();

    // Step 3: Add popular models
    await this.addPopularModels();

    // Step 4: Configure image providers
    await this.configureImageProviders();

    // Step 5: Update system configuration
    await this.updateSystemConfig();

    // Step 6: Verify configuration
    await this.verifyConfiguration();

    this.printSummary();
  }

  private async verifyEnvironment() {
    const step = 'Environment Verification';
    
    try {
      // Test database connection
      const { rows } = await query('SELECT COUNT(*) as count FROM llm_providers');
      
      if (rows[0].count > 0) {
        this.addResult(step, 'SUCCESS', 'Database connection and tables verified');
      } else {
        this.addResult(step, 'FAILED', 'No LLM providers found in database');
        return;
      }
    } catch (error) {
      this.addResult(step, 'FAILED', `Database connection failed: ${error}`);
      return;
    }
  }

  private async configureOpenRouter() {
    const step = 'OpenRouter Configuration';
    
    try {
      // Update OpenRouter priority to 1 (highest)
      await query(`
        UPDATE llm_providers 
        SET priority = 1, is_active = true 
        WHERE name = 'OpenRouter'
      `);

      // Set other providers to lower priority
      await query(`
        UPDATE llm_providers 
        SET priority = 2, is_active = true 
        WHERE name = 'OpenAI'
      `);

      await query(`
        UPDATE llm_providers 
        SET priority = 3, is_active = true 
        WHERE name = 'Anthropic'
      `);

      this.addResult(step, 'SUCCESS', 'OpenRouter configured as primary provider');
    } catch (error) {
      this.addResult(step, 'FAILED', `OpenRouter configuration failed: ${error}`);
    }
  }

  private async addPopularModels() {
    const step = 'Popular Models Setup';
    
    try {
      // Get OpenRouter provider ID
      const { rows: providers } = await query(`
        SELECT id FROM llm_providers WHERE name = 'OpenRouter'
      `);
      
      if (providers.length === 0) {
        this.addResult(step, 'FAILED', 'OpenRouter provider not found');
        return;
      }

      const openRouterId = providers[0].id;

      // Add popular OpenRouter models
      const models = [
        {
          model_name: 'google/gemini-2.5-flash',
          display_name: 'Gemini 2.5 Flash',
          model_type: 'chat',
          max_tokens: 8192,
          temperature: 0.8,
          cost_per_1k_tokens: 0.00005
        },
        {
          model_name: 'openai/gpt-4o-mini',
          display_name: 'GPT-4o Mini',
          model_type: 'chat',
          max_tokens: 16384,
          temperature: 0.8,
          cost_per_1k_tokens: 0.00015
        },
        {
          model_name: 'anthropic/claude-3.5-sonnet',
          display_name: 'Claude 3.5 Sonnet',
          model_type: 'chat',
          max_tokens: 200000,
          temperature: 0.8,
          cost_per_1k_tokens: 0.003
        },
        {
          model_name: 'meta-llama/llama-3.1-8b-instruct',
          display_name: 'Llama 3.1 8B',
          model_type: 'chat',
          max_tokens: 8192,
          temperature: 0.8,
          cost_per_1k_tokens: 0.0002
        }
      ];

      for (const model of models) {
        await query(`
          INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, cost_per_1k_tokens, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
          ON CONFLICT (provider_id, model_name) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            max_tokens = EXCLUDED.max_tokens,
            temperature = EXCLUDED.temperature,
            cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
            is_active = true
        `, [openRouterId, model.model_name, model.display_name, model.model_type, model.max_tokens, model.temperature, model.cost_per_1k_tokens]);
      }

      this.addResult(step, 'SUCCESS', `Added ${models.length} popular models to OpenRouter`);
    } catch (error) {
      this.addResult(step, 'FAILED', `Model setup failed: ${error}`);
    }
  }

  private async configureImageProviders() {
    const step = 'Image Providers Configuration';
    
    try {
      // Set Fal.ai as primary image provider
      await query(`
        UPDATE image_providers 
        SET priority = 1, is_active = true 
        WHERE name = 'Fal.ai'
      `);

      // Add popular image models
      const { rows: providers } = await query(`
        SELECT id FROM image_providers WHERE name = 'Fal.ai'
      `);
      
      if (providers.length === 0) {
        this.addResult(step, 'FAILED', 'Fal.ai provider not found');
        return;
      }

      const falId = providers[0].id;

      const imageModels = [
        {
          model_name: 'fal-ai/flux-dev',
          display_name: 'Flux Dev',
          image_size: '1024x1024',
          quality: 'high',
          cost_per_image: 0.01
        },
        {
          model_name: 'fal-ai/sdxl',
          display_name: 'SDXL',
          image_size: '1024x1024',
          quality: 'high',
          cost_per_image: 0.005
        }
      ];

      for (const model of imageModels) {
        await query(`
          INSERT INTO image_models (provider_id, model_name, display_name, image_size, quality, cost_per_image, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
          ON CONFLICT (provider_id, model_name) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            image_size = EXCLUDED.image_size,
            quality = EXCLUDED.quality,
            cost_per_image = EXCLUDED.cost_per_image,
            is_active = true
        `, [falId, model.model_name, model.display_name, model.image_size, model.quality, model.cost_per_image]);
      }

      this.addResult(step, 'SUCCESS', 'Image providers configured with popular models');
    } catch (error) {
      this.addResult(step, 'FAILED', `Image provider setup failed: ${error}`);
    }
  }

  private async updateSystemConfig() {
    const step = 'System Configuration Update';
    
    try {
      // Update default configurations
      const configs = [
        { key: 'default_llm_provider', value: '"OpenRouter"' },
        { key: 'default_llm_model', value: '"google/gemini-2.5-flash"' },
        { key: 'default_image_provider', value: '"Fal.ai"' },
        { key: 'default_image_model', value: '"fal-ai/flux-dev"' },
        { key: 'fallback_llm_provider', value: '"OpenAI"' },
        { key: 'fallback_image_provider', value: '"OpenAI DALL-E"' }
      ];

      for (const config of configs) {
        await query(`
          UPDATE system_config 
          SET value = $1 
          WHERE key = $2
        `, [config.value, config.key]);
      }

      this.addResult(step, 'SUCCESS', 'System configuration updated');
    } catch (error) {
      this.addResult(step, 'FAILED', `System config update failed: ${error}`);
    }
  }

  private async verifyConfiguration() {
    const step = 'Configuration Verification';
    
    try {
      // Check OpenRouter is primary
      const { rows: providers } = await query(`
        SELECT name, priority FROM llm_providers WHERE is_active = true ORDER BY priority
      `);

      if (providers[0]?.name === 'OpenRouter' && providers[0]?.priority === 1) {
        this.addResult(step, 'SUCCESS', 'OpenRouter is configured as primary provider');
      } else {
        this.addResult(step, 'FAILED', 'OpenRouter is not primary provider');
      }

      // Check models are available
      const { rows: models } = await query(`
        SELECT COUNT(*) as count FROM llm_models WHERE is_active = true
      `);

      if (models[0].count > 0) {
        this.addResult(step, 'SUCCESS', `${models[0].count} active models available`);
      } else {
        this.addResult(step, 'FAILED', 'No active models found');
      }
    } catch (error) {
      this.addResult(step, 'FAILED', `Verification failed: ${error}`);
    }
  }

  private printSummary() {
    console.log('\n📊 Setup Summary:');
    console.log('================');
    
    const successCount = this.results.filter(r => r.status === 'SUCCESS').length;
    const totalCount = this.results.length;
    
    this.results.forEach(result => {
      const icon = result.status === 'SUCCESS' ? '✅' : '❌';
      console.log(`${icon} ${result.step}: ${result.message}`);
    });

    console.log(`\n🎯 Result: ${successCount}/${totalCount} steps completed successfully`);
    
    if (successCount === totalCount) {
      console.log('🎉 OpenRouter setup completed successfully!');
      console.log('🚀 Your PostgreSQL database is ready for Arcanum Scribe!');
    } else {
      console.log('⚠️  Some steps failed. Please check the errors above.');
    }
  }
}

// Run setup
if (import.meta.main) {
  const setup = new OpenRouterSetup();
  setup.run().catch(console.error);
} 