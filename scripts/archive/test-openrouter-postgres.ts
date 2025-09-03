#!/usr/bin/env tsx

/**
 * Test OpenRouter Configuration for PostgreSQL
 * 
 * This script tests the OpenRouter setup and functionality
 */

import dotenv from 'dotenv';
import { query } from '../src/integrations/postgres/client';

// Load environment variables
dotenv.config();

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class OpenRouterTest {
  private results: TestResult[] = [];

  addResult(test: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${test}: ${message}`);
  }

  async run() {
    console.log('🧪 Testing OpenRouter Configuration for PostgreSQL...\n');

    // Test 1: Database Connection
    await this.testDatabaseConnection();

    // Test 2: OpenRouter Provider Configuration
    await this.testOpenRouterProvider();

    // Test 3: Model Configuration
    await this.testModelConfiguration();

    // Test 4: Image Provider Configuration
    await this.testImageProviderConfiguration();

    // Test 5: System Configuration
    await this.testSystemConfiguration();

    // Test 6: Cost Analysis
    await this.testCostAnalysis();

    // Test 7: Environment Variables
    await this.testEnvironmentVariables();

    this.printSummary();
  }

  private async testDatabaseConnection() {
    const test = 'Database Connection';
    
    try {
      const { rows } = await query('SELECT COUNT(*) as count FROM llm_providers');
      
      if (rows[0].count > 0) {
        this.addResult(test, 'PASS', 'Successfully connected to PostgreSQL database');
      } else {
        this.addResult(test, 'FAIL', 'No LLM providers found in database');
      }
    } catch (error) {
      this.addResult(test, 'FAIL', `Database connection failed: ${error}`);
    }
  }

  private async testOpenRouterProvider() {
    const test = 'OpenRouter Provider';
    
    try {
      const { rows } = await query(`
        SELECT name, priority, is_active 
        FROM llm_providers 
        WHERE name = 'OpenRouter'
      `);
      
      if (rows.length > 0) {
        const provider = rows[0];
        if (provider.priority === 1 && provider.is_active) {
          this.addResult(test, 'PASS', 'OpenRouter is configured as primary provider');
        } else {
          this.addResult(test, 'FAIL', `OpenRouter priority: ${provider.priority}, active: ${provider.is_active}`);
        }
      } else {
        this.addResult(test, 'FAIL', 'OpenRouter provider not found');
      }
    } catch (error) {
      this.addResult(test, 'FAIL', `OpenRouter provider test failed: ${error}`);
    }
  }

  private async testModelConfiguration() {
    const test = 'Model Configuration';
    
    try {
      const { rows } = await query(`
        SELECT lm.model_name, lm.display_name, lm.cost_per_1k_tokens, lp.name as provider_name
        FROM llm_models lm
        JOIN llm_providers lp ON lm.provider_id = lp.id
        WHERE lp.name = 'OpenRouter' AND lm.is_active = true
        ORDER BY lm.cost_per_1k_tokens
      `);
      
      if (rows.length > 0) {
        const cheapestModel = rows[0];
        this.addResult(test, 'PASS', `${rows.length} OpenRouter models configured`);
        this.addResult(test, 'PASS', `Cheapest model: ${cheapestModel.display_name} ($${cheapestModel.cost_per_1k_tokens}/1K tokens)`);
      } else {
        this.addResult(test, 'FAIL', 'No OpenRouter models found');
      }
    } catch (error) {
      this.addResult(test, 'FAIL', `Model configuration test failed: ${error}`);
    }
  }

  private async testImageProviderConfiguration() {
    const test = 'Image Provider Configuration';
    
    try {
      const { rows } = await query(`
        SELECT ip.name, ip.priority, ip.is_active,
               COUNT(im.id) as model_count
        FROM image_providers ip
        LEFT JOIN image_models im ON ip.id = im.provider_id AND im.is_active = true
        WHERE ip.name = 'Fal.ai'
        GROUP BY ip.id, ip.name, ip.priority, ip.is_active
      `);
      
      if (rows.length > 0) {
        const provider = rows[0];
        if (provider.priority === 1 && provider.is_active && provider.model_count > 0) {
          this.addResult(test, 'PASS', `Fal.ai configured with ${provider.model_count} models`);
        } else {
          this.addResult(test, 'FAIL', `Fal.ai priority: ${provider.priority}, active: ${provider.is_active}, models: ${provider.model_count}`);
        }
      } else {
        this.addResult(test, 'FAIL', 'Fal.ai provider not found');
      }
    } catch (error) {
      this.addResult(test, 'FAIL', `Image provider test failed: ${error}`);
    }
  }

  private async testSystemConfiguration() {
    const test = 'System Configuration';
    
    try {
      const { rows } = await query(`
        SELECT key, value 
        FROM system_config 
        WHERE key IN ('default_llm_provider', 'default_llm_model', 'default_image_provider', 'default_image_model')
        ORDER BY key
      `);
      
      const config = rows.reduce((acc, row) => {
        acc[row.key] = JSON.parse(row.value);
        return acc;
      }, {} as any);
      
      if (config.default_llm_provider === 'OpenRouter' && 
          config.default_image_provider === 'Fal.ai') {
        this.addResult(test, 'PASS', 'System configuration is correct');
        this.addResult(test, 'PASS', `Default LLM: ${config.default_llm_provider} (${config.default_llm_model})`);
        this.addResult(test, 'PASS', `Default Image: ${config.default_image_provider} (${config.default_image_model})`);
      } else {
        this.addResult(test, 'FAIL', `Unexpected configuration: LLM=${config.default_llm_provider}, Image=${config.default_image_provider}`);
      }
    } catch (error) {
      this.addResult(test, 'FAIL', `System configuration test failed: ${error}`);
    }
  }

  private async testCostAnalysis() {
    const test = 'Cost Analysis';
    
    try {
      const { rows } = await query(`
        SELECT 
          lm.model_name,
          lm.display_name,
          lm.cost_per_1k_tokens,
          ROUND(lm.cost_per_1k_tokens * 0.1, 6) as cost_per_100_tokens
        FROM llm_models lm
        JOIN llm_providers lp ON lm.provider_id = lp.id
        WHERE lp.name = 'OpenRouter' AND lm.is_active = true
        ORDER BY lm.cost_per_1k_tokens
        LIMIT 3
      `);
      
      if (rows.length > 0) {
        const cheapest = rows[0];
        this.addResult(test, 'PASS', `Cheapest model: ${cheapest.display_name} ($${cheapest.cost_per_1k_tokens}/1K tokens)`);
        this.addResult(test, 'PASS', `Cost per 100 tokens: $${cheapest.cost_per_100_tokens}`);
        
        // Calculate cost for a typical adventure (1000 tokens)
        const adventureCost = cheapest.cost_per_1k_tokens;
        this.addResult(test, 'PASS', `Typical adventure cost: $${adventureCost} (very economical!)`);
      } else {
        this.addResult(test, 'FAIL', 'No models found for cost analysis');
      }
    } catch (error) {
      this.addResult(test, 'FAIL', `Cost analysis failed: ${error}`);
    }
  }

  private async testEnvironmentVariables() {
    const test = 'Environment Variables';
    
    const requiredVars = [
      'DATABASE_URL',
      'OPENROUTER_API_KEY',
      'FAL_API_KEY'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length === 0) {
      this.addResult(test, 'PASS', 'All required environment variables are set');
    } else {
      this.addResult(test, 'FAIL', `Missing environment variables: ${missing.join(', ')}`);
    }
  }

  private printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const totalCount = this.results.length;
    
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.message}`);
    });

    console.log(`\n🎯 Result: ${passCount}/${totalCount} tests passed`);
    
    if (passCount === totalCount) {
      console.log('🎉 All tests passed! OpenRouter is ready for production!');
      console.log('🚀 Your PostgreSQL + OpenRouter setup is complete!');
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.');
    }
  }
}

// Run tests
if (import.meta.main) {
  const test = new OpenRouterTest();
  test.run().catch(console.error);
} 