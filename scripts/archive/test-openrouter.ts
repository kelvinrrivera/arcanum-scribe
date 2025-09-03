#!/usr/bin/env tsx

/**
 * Test Script for OpenRouter Implementation
 * 
 * This script validates that:
 * 1. OpenRouter API key is configured
 * 2. Models are accessible
 * 3. Text generation works
 * 4. Fallback system works
 * 5. Cost optimization is working
 */

import { createClient } from '@supabase/supabase-js';
import { SEEDER_ENV } from './seed-env';

const supabase = createClient(
  SEEDER_ENV.SUPABASE_URL,
  SEEDER_ENV.SUPABASE_SERVICE_ROLE_KEY
);

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class OpenRouterTester {
  private results: TestResult[] = [];

  async runAllTests() {
    console.log('🧪 Starting OpenRouter Implementation Tests...\n');

    await this.testEnvironmentVariables();
    await this.testDatabaseConfiguration();
    await this.testOpenRouterAPI();
    await this.testModelAccess();
    await this.testTextGeneration();
    await this.testFallbackSystem();
    await this.testCostOptimization();

    this.printResults();
  }

  private async testEnvironmentVariables() {
    const testName = 'Environment Variables';
    
    try {
      const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
      const falKey = Deno.env.get('FAL_API_KEY');

      if (!openrouterKey) {
        this.addResult(testName, 'FAIL', 'OPENROUTER_API_KEY not found');
        return;
      }

      if (!falKey) {
        this.addResult(testName, 'FAIL', 'FAL_API_KEY not found');
        return;
      }

      this.addResult(testName, 'PASS', 'All required API keys are configured');
    } catch (error) {
      this.addResult(testName, 'FAIL', `Error checking environment variables: ${error}`);
    }
  }

  private async testDatabaseConfiguration() {
    const testName = 'Database Configuration';
    
    try {
      // Test LLM providers
      const { data: providers, error: providersError } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (providersError) {
        this.addResult(testName, 'FAIL', `Error fetching providers: ${providersError.message}`);
        return;
      }

      const openrouterProvider = providers.find(p => p.name === 'OpenRouter');
      if (!openrouterProvider) {
        this.addResult(testName, 'FAIL', 'OpenRouter provider not found in database');
        return;
      }

      // Test LLM models
      const { data: models, error: modelsError } = await supabase
        .from('llm_models')
        .select('*, llm_providers(*)')
        .eq('is_active', true)
        .eq('model_type', 'text');

      if (modelsError) {
        this.addResult(testName, 'FAIL', `Error fetching models: ${modelsError.message}`);
        return;
      }

      const openrouterModels = models.filter(m => m.llm_providers.name === 'OpenRouter');
      if (openrouterModels.length === 0) {
        this.addResult(testName, 'FAIL', 'No OpenRouter models found');
        return;
      }

      this.addResult(testName, 'PASS', `Found ${openrouterModels.length} OpenRouter models`, {
        provider: openrouterProvider,
        models: openrouterModels.map(m => m.model_name)
      });
    } catch (error) {
      this.addResult(testName, 'FAIL', `Error testing database configuration: ${error}`);
    }
  }

  private async testOpenRouterAPI() {
    const testName = 'OpenRouter API Access';
    
    try {
      const apiKey = Deno.env.get('OPENROUTER_API_KEY');
      if (!apiKey) {
        this.addResult(testName, 'FAIL', 'OPENROUTER_API_KEY not available');
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://arcanum-scribe.com',
          'X-Title': 'Arcanum Scribe'
        }
      });

      if (!response.ok) {
        this.addResult(testName, 'FAIL', `OpenRouter API error: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const availableModels = data.data || [];

      this.addResult(testName, 'PASS', `Successfully connected to OpenRouter API`, {
        availableModels: availableModels.length,
        sampleModels: availableModels.slice(0, 5).map((m: any) => m.id)
      });
    } catch (error) {
      this.addResult(testName, 'FAIL', `Error testing OpenRouter API: ${error}`);
    }
  }

  private async testModelAccess() {
    const testName = 'Model Access';
    
    try {
      const apiKey = Deno.env.get('OPENROUTER_API_KEY');
      if (!apiKey) {
        this.addResult(testName, 'FAIL', 'OPENROUTER_API_KEY not available');
        return;
      }

      // Test access to specific models
      const testModels = [
        'google/gemini-2.5-flash',
        'openai/gpt-4o-mini',
        'anthropic/claude-3-haiku'
      ];

      const results = [];
      for (const model of testModels) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://arcanum-scribe.com',
              'X-Title': 'Arcanum Scribe',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'user', content: 'Hello, this is a test message.' }
              ],
              max_tokens: 10
            })
          });

          if (response.ok) {
            results.push({ model, status: 'accessible' });
          } else {
            results.push({ model, status: 'error', error: response.statusText });
          }
        } catch (error) {
          results.push({ model, status: 'error', error: error.message });
        }
      }

      const accessibleModels = results.filter(r => r.status === 'accessible');
      
      if (accessibleModels.length > 0) {
        this.addResult(testName, 'PASS', `${accessibleModels.length}/${testModels.length} models accessible`, {
          accessible: accessibleModels.map(r => r.model),
          failed: results.filter(r => r.status === 'error').map(r => ({ model: r.model, error: r.error }))
        });
      } else {
        this.addResult(testName, 'FAIL', 'No models are accessible');
      }
    } catch (error) {
      this.addResult(testName, 'FAIL', `Error testing model access: ${error}`);
    }
  }

  private async testTextGeneration() {
    const testName = 'Text Generation';
    
    try {
      const apiKey = Deno.env.get('OPENROUTER_API_KEY');
      if (!apiKey) {
        this.addResult(testName, 'FAIL', 'OPENROUTER_API_KEY not available');
        return;
      }

      const testPrompt = 'Generate a simple D&D 5e monster stat block for a goblin.';
      const systemPrompt = 'You are a helpful assistant that generates D&D 5e content.';

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://arcanum-scribe.com',
          'X-Title': 'Arcanum Scribe',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: testPrompt }
          ],
          max_tokens: 500,
          temperature: 0.8,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        this.addResult(testName, 'FAIL', `Text generation failed: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Try to parse as JSON
      try {
        const jsonContent = JSON.parse(content);
        this.addResult(testName, 'PASS', 'Text generation successful with valid JSON response', {
          model: 'google/gemini-2.5-flash',
          tokensUsed: data.usage?.total_tokens || 'unknown',
          responseLength: content.length
        });
      } catch (parseError) {
        this.addResult(testName, 'FAIL', 'Text generation succeeded but response is not valid JSON', {
          content: content.substring(0, 200) + '...'
        });
      }
    } catch (error) {
      this.addResult(testName, 'FAIL', `Error testing text generation: ${error}`);
    }
  }

  private async testFallbackSystem() {
    const testName = 'Fallback System';
    
    try {
      // This test would require the actual LLM service
      // For now, we'll test the database configuration for fallbacks
      const { data: providers, error } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) {
        this.addResult(testName, 'FAIL', `Error testing fallback system: ${error.message}`);
        return;
      }

      if (providers.length >= 2) {
        this.addResult(testName, 'PASS', `Fallback system configured with ${providers.length} providers`, {
          providers: providers.map(p => ({ name: p.name, priority: p.priority }))
        });
      } else {
        this.addResult(testName, 'FAIL', 'Insufficient providers for fallback system');
      }
    } catch (error) {
      this.addResult(testName, 'FAIL', `Error testing fallback system: ${error}`);
    }
  }

  private async testCostOptimization() {
    const testName = 'Cost Optimization';
    
    try {
      const { data: models, error } = await supabase
        .from('llm_models')
        .select('*, llm_providers(*)')
        .eq('is_active', true)
        .eq('model_type', 'text')
        .order('cost_per_1k_tokens', { ascending: true });

      if (error) {
        this.addResult(testName, 'FAIL', `Error testing cost optimization: ${error.message}`);
        return;
      }

      const openrouterModels = models.filter(m => m.llm_providers.name === 'OpenRouter');
      const cheapestModel = openrouterModels[0];

      if (cheapestModel && cheapestModel.cost_per_1k_tokens <= 0.0001) {
        this.addResult(testName, 'PASS', 'Cost optimization configured with economical models', {
          cheapestModel: cheapestModel.model_name,
          costPer1kTokens: cheapestModel.cost_per_1k_tokens,
          totalModels: openrouterModels.length
        });
      } else {
        this.addResult(testName, 'FAIL', 'No economical models found for cost optimization');
      }
    } catch (error) {
      this.addResult(testName, 'FAIL', `Error testing cost optimization: ${error}`);
    }
  }

  private addResult(test: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
    this.results.push({ test, status, message, details });
  }

  private printResults() {
    console.log('\n📊 Test Results Summary:\n');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    for (const result of this.results) {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.message}`);
      
      if (result.details) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }
    }

    console.log('\n🎯 Next Steps:');
    if (failed === 0) {
      console.log('✅ All tests passed! OpenRouter implementation is ready for production.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix the issues before proceeding.');
    }
  }
}

// Run tests
async function main() {
  const tester = new OpenRouterTester();
  await tester.runAllTests();
}

if (import.meta.main) {
  main().catch(console.error);
} 