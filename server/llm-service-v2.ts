import { generateText, generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { query } from '../src/integrations/postgres/client';

// Esquema compacto para aventuras (reducir tamaño de respuesta)
const AdventureSchema = z.object({
  title: z.string(),
  gameSystem: z.string(),
  recommendedLevel: z.string(),
  partySize: z.string(),
  estimatedDuration: z.string(),
  summary: z.string(),
  adventureHooks: z.array(z.object({
    hookType: z.string(),
    description: z.string(),
    implementation: z.string()
  })).max(3), // Limitar a 3 hooks
  scenes: z.array(z.object({
    title: z.string(),
    objectives: z.array(z.string()).max(3), // Máximo 3 objetivos
    readAloudText: z.string(),
    keyElements: z.array(z.string()).max(4), // Máximo 4 elementos
    encounters: z.array(z.object({
      name: z.string(),
      type: z.string(),
      difficulty: z.string(),
      mechanics: z.string(),
      creatures: z.string()
    })).max(2), // Máximo 2 encuentros por escena
    skillChallenges: z.array(z.object({
      description: z.string(),
      dc: z.number(),
      skills: z.string(),
      success: z.string(),
      failure: z.string()
    })).max(2), // Máximo 2 desafíos por escena
    transitions: z.string(),
    troubleshooting: z.string()
  })).max(4), // Máximo 4 escenas
  monsters: z.array(z.object({
    name: z.string(),
    role: z.string(),
    whenEncountered: z.string(),
    tacticalNotes: z.string(),
    size: z.string(),
    type: z.string(),
    alignment: z.string(),
    armorClass: z.number(),
    hitPoints: z.number(),
    speed: z.string(),
    challengeRating: z.union([z.string(), z.number()]),
    abilities: z.object({
      STR: z.number(),
      DEX: z.number(),
      CON: z.number(),
      INT: z.number(),
      WIS: z.number(),
      CHA: z.number()
    }),
    savingThrows: z.string().optional(),
    skills: z.string().optional(),
    damageResistances: z.string().optional(),
    damageImmunities: z.string().optional(),
    conditionImmunities: z.string().optional(),
    senses: z.string().optional(),
    languages: z.string().optional(),
    traits: z.array(z.object({
      name: z.string(),
      description: z.string()
    })).max(3), // Máximo 3 traits
    actions: z.array(z.object({
      name: z.string(),
      description: z.string()
    })).max(3), // Máximo 3 acciones
    legendaryActions: z.string().optional()
  })).max(3) // Máximo 3 monstruos
});

interface LLMProvider {
  id: string;
  name: string;
  provider_type: 'anthropic' | 'openai' | 'google';
  is_active: boolean;
  priority: number;
}

interface LLMModel {
  id: string;
  provider_id: string;
  model_name: string;
  display_name: string;
  model_type: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  cost_per_1m_tokens: number;
}

interface GenerationOptions {
  temperature?: number;
  max_tokens?: number;
  responseFormat?: 'text' | 'json';
}

export class LLMServiceV2 {
  private providers: Map<string, any> = new Map();
  private config: Map<string, any> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', anthropic);
      console.log('✅ Anthropic provider initialized');
    }

    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', openai);
      console.log('✅ OpenAI provider initialized');
    }

    // Initialize Google
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      this.providers.set('google', google);
      console.log('✅ Google provider initialized');
    }

    if (this.providers.size === 0) {
      console.warn('⚠️  No AI providers configured. Please set API keys in .env file');
    }
  }

  async initialize() {
    await this.loadSystemConfig();
    console.log(`🤖 LLM Service V2 initialized with ${this.providers.size} providers`);
  }

  private async loadSystemConfig() {
    try {
      const { rows } = await query(`
        SELECT key, value 
        FROM system_config
      `);

      rows.forEach((item: any) => {
        try {
          this.config.set(item.key, JSON.parse(item.value));
        } catch (error) {
          // If JSON parsing fails, use the raw value
          this.config.set(item.key, item.value);
        }
      });
    } catch (error) {
      console.error('Error loading system config:', error);
      // Set defaults
      this.config.set('default_llm_provider', 'OpenRouter');
      this.config.set('default_llm_model', 'google/gemini-2.5-flash');
    }
  }

  private _getModelInstance(model: LLMModel & { provider_type: string }) {
    const provider = this.providers.get(model.provider_type);
    if (!provider) {
      console.warn(`[LLM-ORCHESTRATION] Provider '${model.provider_type}' found in DB but not initialized in LLMServiceV2. Skipping model ${model.display_name}.`);
      return null;
    }

    // Vercel AI SDK expects the native model name without the provider prefix.
    const nativeModelName = model.model_name.split('/').pop() || model.model_name;
    return provider(nativeModelName);
  }

  // removed duplicate generateTextOriginal (kept single implementation below)

  async generateJSON<T>(
    prompt: string, 
    systemPrompt: string, 
    schema: z.ZodSchema<T>, 
    options: GenerationOptions = {}
  ): Promise<T> {
    const maxRetries = this.config.get('max_retries') || 3;
    let lastError: Error | null = null;

    // Get active models in priority order
    const models = await this.getActiveModels();
    
    for (const model of models.slice(0, maxRetries)) {
      try {
        console.log(`🤖 Trying JSON generation with ${model.display_name} (${model.provider_type})`);
        
        const modelInstance = this._getModelInstance(model);
        if (!modelInstance) continue;
        
        const result = await generateObject({
          model: modelInstance,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          schema: schema,
          temperature: options.temperature || Number(model.temperature) || 0.7,
          maxTokens: options.max_tokens || Number(model.max_tokens) || 4096,
        });

        console.log(`✅ JSON generation success with ${model.display_name}`);
        
        // Log the request for analytics
        await this.logPromptRequest({
          model_name: model.model_name,
          provider: model.provider_type,
          prompt_length: prompt.length,
          response_length: JSON.stringify(result.object).length,
          success: true
        });

        return result.object;

      } catch (error) {
        lastError = error as Error;
        console.log(`❌ JSON generation failed with ${model.display_name}: ${lastError.message}`);
        
        // Log the failed request
        await this.logPromptRequest({
          model_name: model.model_name,
          provider: model.provider_type,
          prompt_length: prompt.length,
          response_length: 0,
          success: false,
          error: lastError.message
        });
      }
    }

    throw new Error(`All LLM providers failed for JSON generation. Last error: ${lastError?.message}`);
  }

  private async getActiveModels(): Promise<(LLMModel & { provider_type: string })[]> {
    const { rows } = await query(`
      SELECT lm.*, lp.provider_type
      FROM llm_models lm
      JOIN llm_providers lp ON lm.provider_id = lp.id
      WHERE lm.is_active = true AND lp.is_active = true AND lm.model_type = 'chat'
      ORDER BY lp.priority ASC, lm.id ASC
    `);

    return rows;
  }

  private async logPromptRequest(logData: any): Promise<void> {
    try {
      // TODO: Create prompt_logs table
      // For now, just log to console
      console.log(`📊 LLM Request: ${logData.provider}/${logData.model_name} - ${logData.success ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.log('⚠️  Failed to log prompt request:', error);
    }
  }

  async getActiveProviders() {
    const { rows: providers } = await query('SELECT * FROM llm_providers WHERE is_active = true ORDER BY priority ASC');
    return { llmProviders: providers };
  }

  async getAvailableModels() {
    const { rows: models } = await query(`
      SELECT lm.*, lp.name as provider_name, lp.provider_type
      FROM llm_models lm
      JOIN llm_providers lp ON lm.provider_id = lp.id
      WHERE lm.is_active = true AND lp.is_active = true
      ORDER BY lp.priority ASC, lm.id ASC
    `);
    return models;
  }

  /**
   * Generate text with simple interface for testing
   */
  async generateSimpleText(prompt: string, options: any = {}) {
    const systemPrompt = options.systemPrompt || "You are a helpful assistant.";
    return this.generateText(prompt, systemPrompt, options);
  }

  /**
   * Legacy interface compatibility - matches old LLMService signature
   */
  
  private cleanJSONResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/^```jsons*/i, '').replace(/```s*$/, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If it still doesn't start with {, try to find the JSON part
    if (!cleaned.startsWith('{')) {
      const jsonMatch = cleaned.match(/{[sS]*}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
    }
    
    return cleaned;
  }

  async generateText(prompt: string, systemPrompt: string, options: GenerationOptions = {}): Promise<string>;
  async generateText(systemPrompt: string, prompt: string, options?: GenerationOptions): Promise<string>;
  async generateText(arg1: string, arg2: string, options: GenerationOptions = {}): Promise<string> {
    // Handle both signatures for backward compatibility
    let prompt: string;
    let systemPrompt: string;
    
    if (options && typeof options === 'object' && 'responseFormat' in options) {
      // New signature: generateText(prompt, systemPrompt, options)
      prompt = arg1;
      systemPrompt = arg2;
    } else {
      // Legacy signature: generateText(systemPrompt, prompt, options)
      systemPrompt = arg1;
      prompt = arg2;
      options = options || {};
    }

    return this.generateTextInternal(prompt, systemPrompt, options);
  }

  /**
   * Internal text generation method
   */
  private async generateTextInternal(prompt: string, systemPrompt: string, options: GenerationOptions = {}): Promise<string> {
    const maxRetries = this.config.get('max_retries') || 3;
    let lastError: Error | null = null;

    // Get active models in priority order
    const models = await this.getActiveModels();
    
    for (const model of models.slice(0, maxRetries)) {
      try {
        console.log(`🤖 Trying ${model.display_name} (${model.provider_type})`);
        
        const modelInstance = this._getModelInstance(model);
        if (!modelInstance) continue;
        
        const result = await generateText({
          model: modelInstance,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: options.temperature || Number(model.temperature) || 0.7,
          maxTokens: options.max_tokens || Number(model.max_tokens) || 4096,
        });

        console.log(`✅ Success with ${model.display_name}`);
        
        // Log the request for analytics
        await this.logPromptRequest({
          model_name: model.model_name,
          provider: model.provider_type,
          prompt_length: prompt.length,
          response_length: result.text.length,
          success: true
        });

        return result.text;

      } catch (error) {
        lastError = error as Error;
        console.log(`❌ Failed with ${model.display_name}: ${lastError.message}`);
        
        // Log the failed request
        await this.logPromptRequest({
          model_name: model.model_name,
          provider: model.provider_type,
          prompt_length: prompt.length,
          response_length: 0,
          success: false,
          error: lastError.message
        });
      }
    }

    throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Generate adventure using Vercel AI SDK generateObject for guaranteed valid JSON
   */
  async generateAdventure(prompt: string, systemPrompt: string = "You are a professional adventure designer.") {
    console.log(`[ADVENTURE-GEN] Using Vercel AI SDK generateObject for guaranteed valid JSON`);
    
    // Get active models in priority order
    const models = await this.getActiveModels();
    let lastError: Error | null = null;
    
    for (const model of models.slice(0, 3)) {
      try {
        console.log(`🤖 Trying ${model.display_name} (${model.provider_type}) with generateObject`);
        
        const modelInstance = this._getModelInstance(model);
        if (!modelInstance) continue;
        
        // Use generateObject with the Zod schema
        const result = await generateObject({
          model: modelInstance,
          schema: AdventureSchema,
          prompt: `${systemPrompt}\n\nUser request: ${prompt}\n\nGenerate a complete, high-quality TTRPG adventure following the schema exactly. Keep descriptions concise but engaging. Limit to 4 scenes, 3 monsters, and essential content only.`,
          temperature: Number(model.temperature) || 0.7,
          maxTokens: 6000, // Reducir tokens para respuestas más compactas
        });

        console.log(`✅ Success with ${model.display_name} using generateObject`);
        console.log(`📊 LLM Request: ${model.provider_type}/${model.model_name} - SUCCESS`);
        
        // Log the request for analytics
        await this.logPromptRequest({
          model_name: model.model_name,
          provider: model.provider_type,
          prompt_length: prompt.length,
          response_length: JSON.stringify(result.object).length,
          success: true
        });

        return result.object;
        
      } catch (error) {
        lastError = error as Error;
        console.log(`❌ Failed with ${model.display_name}: ${lastError.message}`);
        
        // Log the failed request
        await this.logPromptRequest({
          model_name: model.model_name,
          provider: model.provider_type,
          prompt_length: prompt.length,
          response_length: 0,
          success: false,
          error: lastError.message
        });
      }
    }

    throw new Error(`All LLM providers failed with generateObject. Last error: ${lastError?.message}`);
  }
}