#!/usr/bin/env tsx

/**
 * Simple OpenRouter Test Script
 * 
 * This script tests the OpenRouter configuration using environment variables
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || "https://jsionesaegddqcngccie.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const FAL_API_KEY = process.env.FAL_API_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  console.log('Please set the environment variable:');
  console.log('export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class SimpleOpenRouterTester {
  private results: TestResult[] = [];

  async runAllTests() {
    console.log('🧪 Starting Simple OpenRouter Tests...\n');

    await this.testSupabaseConnection();
    await this.testOpenRouterAPI();
    await this.testDatabaseConfiguration();
    await this.testTextGeneration();

    this.printResults();
  }

  private async testSupabaseConnection() {
    const testName = 'Supabase Connection';
    
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('key')
        .limit(1);

      if (error) {
        this.addResult(testName, 'FAIL', `Supabase connection failed: ${error.message}`);
        return;
      }

      this.addResult(testName, 'PASS', 'Successfully connected to Supabase');
    } catch (error) {
      this.addResult(testName, 'FAIL', `Supabase connection error: ${error}`);
    }
  }

  private async testOpenRouterAPI() {
    const testName = 'OpenRouter API';
    
    if (!OPENROUTER_API_KEY) {
      this.addResult(testName, 'FAIL', 'OPENROUTER_API_KEY not found in environment');
      return;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
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
        sampleModels: availableModels.slice(0, 3).map((m: any) => m.id)
      });
    } catch (error) {
      this.addResult(testName, 'FAIL', `OpenRouter API error: ${error}`);
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

  private async testTextGeneration() {
    const testName = 'Text Generation';
    
    if (!OPENROUTER_API_KEY) {
      this.addResult(testName, 'FAIL', 'OPENROUTER_API_KEY not available');
      return;
    }

    try {
      const testPrompt = 'Generate a simple D&D 5e monster stat block for a goblin.';
      const systemPrompt = 'You are a helpful assistant that generates D&D 5e content.';

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
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
      console.log('✅ All tests passed! OpenRouter is ready for production.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix the issues before proceeding.');
    }
  }
}

// Run tests
async function main() {
  const tester = new SimpleOpenRouterTester();
  await tester.runAllTests();
}

if (import.meta.main) {
  main().catch(console.error);
} 