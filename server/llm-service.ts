import { query } from '../src/integrations/postgres/client';
import { PromptManagementService } from './prompt-management-service';

interface LLMProvider {
  id: string;
  name: string;
  provider_type: string;
  base_url: string;
  api_key_env: string;
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

interface ImageProvider {
  id: string;
  name: string;
  provider_type: string;
  base_url: string;
  api_key_env: string;
  is_active: boolean;
  priority: number;
}

interface ImageModel {
  id: string;
  provider_id: string;
  model_name: string;
  display_name: string;
  image_size: string;
  quality: string;
  is_active: boolean;
  cost_per_image: number;
}

interface SystemConfig {
  key: string;
  value: any;
  description: string;
}

export class LLMService {
  private config: Map<string, any> = new Map();
  private promptService: PromptManagementService;

  constructor() {
    this.promptService = new PromptManagementService();
  }

  async initialize() {
    await this.loadSystemConfig();
  }

  private async loadSystemConfig() {
    try {
      const { rows } = await query(`
        SELECT key, value 
        FROM system_config
      `);

      rows.forEach((item: SystemConfig) => {
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
      this.config.set('default_image_provider', 'Fal.ai');
      this.config.set('default_image_model', 'fal-ai/flux-dev');
      this.config.set('fallback_llm_provider', 'OpenAI');
      this.config.set('fallback_image_provider', 'OpenAI DALL-E');
      this.config.set('max_retries', 3);
      this.config.set('timeout_seconds', 30);
    }
  }

  async generateText(prompt: string, systemPrompt: string, options: any = {}): Promise<any> {
    const maxRetries = this.config.get('max_retries') || 3;
    const timeout = this.config.get('timeout_seconds') || 30;

    // Get active LLM providers ordered by priority
    const { rows: providers } = await query(`
      SELECT * FROM llm_providers 
      WHERE is_active = true 
      ORDER BY priority ASC
    `);

    // Get active models for each provider
    // For complex tasks like adventure generation, prioritize more capable models
    const { rows: models } = await query(`
      SELECT lm.*, lp.name as provider_name, lp.provider_type, lp.base_url, lp.api_key_env
      FROM llm_models lm
      JOIN llm_providers lp ON lm.provider_id = lp.id
      WHERE lm.is_active = true AND lm.model_type = 'chat'
      ORDER BY lp.priority ASC, lm.cost_per_1m_tokens DESC
    `);

    // Try each provider in order
    for (const provider of providers) {
      const providerModels = models.filter((m: LLMModel) => m.provider_id === provider.id);
      
      for (const model of providerModels) {
        try {
          return await this.callLLMProvider(provider, model, prompt, systemPrompt, options, timeout);
        } catch (error) {
          console.log(`Failed with ${provider.name}/${model.model_name}:`, error);
          continue;
        }
      }
    }

    throw new Error('All LLM providers failed');
  }

  async generateImage(prompt: string, options: any = {}): Promise<string | null> {
    const maxRetries = this.config.get('max_retries') || 3;
    const timeout = this.config.get('timeout_seconds') || 30;
    const { provider, model } = options;

    // If specific provider and model are requested, try that first
    if (provider && model) {
      try {
        const { rows: providers } = await query(`
          SELECT * FROM image_providers 
          WHERE name = $1 AND is_active = true
        `, [provider]);

        if (providers.length > 0) {
          const { rows: models } = await query(`
            SELECT im.*, ip.name as provider_name, ip.provider_type, ip.base_url, ip.api_key_env
            FROM image_models im
            JOIN image_providers ip ON im.provider_id = ip.id
            WHERE im.model_name = $1 AND im.is_active = true AND ip.id = $2
          `, [model, providers[0].id]);

          if (models.length > 0) {
            try {
              return await this.callImageProvider(providers[0], models[0], prompt, options, timeout);
            } catch (error) {
              console.log(`Failed with specific provider ${provider}/${model}:`, error);
            }
          }
        }
      } catch (error) {
        console.log(`Error with specific provider ${provider}/${model}:`, error);
      }
    }

    // Fallback to default behavior - try all providers in order
    const { rows: providers } = await query(`
      SELECT * FROM image_providers 
      WHERE is_active = true 
      ORDER BY priority ASC
    `);

    const { rows: models } = await query(`
      SELECT im.*, ip.name as provider_name, ip.provider_type, ip.base_url, ip.api_key_env
      FROM image_models im
      JOIN image_providers ip ON im.provider_id = ip.id
      WHERE im.is_active = true
      ORDER BY ip.priority ASC, im.cost_per_image ASC
    `);

    // Try each provider in order
    for (const provider of providers) {
      const providerModels = models.filter((m: ImageModel) => m.provider_id === provider.id);
      
      for (const model of providerModels) {
        try {
          return await this.callImageProvider(provider, model, prompt, options, timeout);
        } catch (error) {
          console.log(`Failed with ${provider.name}/${model.model_name}:`, error);
          continue;
        }
      }
    }

    return null;
  }

  private async callLLMProvider(
    provider: LLMProvider, 
    model: LLMModel, 
    prompt: string, 
    systemPrompt: string, 
    options: any, 
    timeout: number
  ): Promise<any> {
    const startTime = Date.now();
    const apiKey = process.env[provider.api_key_env];
    if (!apiKey) {
      throw new Error(`${provider.name} API key not found`);
    }

    const requestBody = this.buildLLMRequest(provider.provider_type, model.model_name, prompt, systemPrompt, options);
    const headers = this.buildLLMHeaders(provider.provider_type, apiKey);
    
    // Build the correct endpoint URL based on provider type
    const endpoint = this.buildEndpointURL(provider.provider_type, provider.base_url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        // Log failed request
        await this.logPromptRequest({
          provider_id: provider.id,
          model_id: model.id,
          prompt_type: options.prompt_type || 'unknown',
          prompt_text: `${systemPrompt}\n\n${prompt}`,
          response_text: null,
          tokens_used: 0,
          cost: 0,
          response_time_ms: responseTime,
          success: false,
          error_message: `HTTP ${response.status}: ${response.statusText}`,
          metadata: { provider: provider.name, model: model.model_name }
        });
        throw new Error(`LLM API error: ${response.statusText}`);
      }

      const data = await response.json();
      const parsedResponse = this.parseLLMResponse(provider.provider_type, data);
      
      // Log successful request
      await this.logPromptRequest({
        provider_id: provider.id,
        model_id: model.id,
        prompt_type: options.prompt_type || 'unknown',
        prompt_text: `${systemPrompt}\n\n${prompt}`,
        response_text: JSON.stringify(parsedResponse),
        tokens_used: data.usage?.total_tokens || 0,
        cost: this.calculateCost(model.cost_per_1m_tokens, data.usage?.total_tokens || 0),
        response_time_ms: responseTime,
        success: true,
        error_message: null,
        metadata: { provider: provider.name, model: model.model_name }
      });

      return parsedResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // Log failed request
      await this.logPromptRequest({
        provider_id: provider.id,
        model_id: model.id,
        prompt_type: options.prompt_type || 'unknown',
        prompt_text: `${systemPrompt}\n\n${prompt}`,
        response_text: null,
        tokens_used: 0,
        cost: 0,
        response_time_ms: responseTime,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        metadata: { provider: provider.name, model: model.model_name }
      });
      
      throw error;
    }
  }

  private async logPromptRequest(logData: any): Promise<void> {
    try {
      await query(`
        INSERT INTO prompt_logs (
          provider_id, model_id, prompt_type, prompt_text, response_text,
          tokens_used, cost, response_time_ms, success, error_message, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        logData.provider_id, logData.model_id, logData.prompt_type,
        logData.prompt_text, logData.response_text, logData.tokens_used,
        logData.cost, logData.response_time_ms, logData.success,
        logData.error_message, JSON.stringify(logData.metadata)
      ]);
    } catch (error) {
      console.error('Failed to log prompt request:', error);
    }
  }

  private calculateCost(costPer1m: number, tokens: number): number {
    return (costPer1m * tokens) / 1000000;
  }

  private async callImageProvider(
    provider: ImageProvider, 
    model: ImageModel, 
    prompt: string, 
    options: any, 
    timeout: number
  ): Promise<string | null> {
    const apiKey = process.env[provider.api_key_env];
    if (!apiKey) {
      throw new Error(`${provider.name} API key not found`);
    }

    const requestBody = this.buildImageRequest(provider.provider_type, model, prompt, options);
    const headers = this.buildImageHeaders(provider.provider_type, apiKey);
    
    // Use specific endpoint for Fal.ai models
    let endpoint: string;
    if (provider.provider_type === 'fal_ai') {
      endpoint = this.getFalAiModelEndpoint(model.model_name);
    } else {
      endpoint = this.getImageEndpoint(provider.provider_type, provider.base_url);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Image API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseImageResponse(provider.provider_type, data);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private buildLLMRequest(providerType: string, modelName: string, prompt: string, systemPrompt: string, options: any) {
    const baseRequest: any = {
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || 0.8,
      max_tokens: options.max_tokens || 4096
    };

    // Only add JSON format if explicitly requested
    if (options.responseFormat !== 'text') {
      baseRequest.response_format = { type: "json_object" };
    }

    switch (providerType) {
      case 'openai':
        return baseRequest;
      
      case 'openrouter':
        const openrouterRequest: any = {
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: options.temperature || 0.8,
          max_tokens: options.max_tokens || 4096
        };
        
        // Only add JSON format for models that explicitly support it
        // OpenRouter supports JSON mode for specific OpenAI models, but not for all models
        const supportsJsonFormat = modelName.includes('openai/gpt-4') || 
                                   modelName.includes('openai/gpt-3.5') || 
                                   modelName.includes('openai/gpt-5');
        
        if (options.responseFormat !== 'text' && supportsJsonFormat) {
          openrouterRequest.response_format = { type: "json_object" };
        }
        
        return openrouterRequest;
      
      case 'anthropic':
        return {
          model: modelName,
          max_tokens: options.max_tokens || 4096,
          temperature: options.temperature || 0.8,
          system: systemPrompt,
          messages: [
            { role: 'user', content: prompt }
          ]
        };
      
      case 'google':
        const isGemini25 = modelName.includes('gemini-2.5');
        const generationConfig: any = {
          temperature: options.temperature || 0.8,
          maxOutputTokens: isGemini25 ? (options.max_tokens || 8192) : (options.max_tokens || 4096)
        };
        
        // Only add JSON format when explicitly requested and not for text responses
        if (options.responseFormat !== 'text') {
          generationConfig.responseMimeType = "application/json";
        }

        const config = {
          contents: [{
            parts: [
              { text: systemPrompt },
              { text: prompt }
            ]
          }],
          generationConfig
        };
        
        return config;
      
      default:
        return baseRequest;
    }
  }

  private buildLLMHeaders(providerType: string, apiKey: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    switch (providerType) {
      case 'openai':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      
      case 'openrouter':
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['HTTP-Referer'] = 'https://arcanum-scribe.com';
        headers['X-Title'] = 'Arcanum Scribe';
        break;
      
      case 'anthropic':
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      
      case 'google':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
    }

    return headers;
  }

  private buildImageRequest(providerType: string, model: ImageModel, prompt: string, options: any) {
    switch (providerType) {
      case 'fal_ai':
        const isFluxDev = model.model_name.includes('flux-dev');
        const isFlux = model.model_name.includes('flux');
        
        if (isFluxDev) {
          return {
            prompt: prompt,
            image_size: model.image_size,
            num_inference_steps: 30,
            guidance_scale: 6.5,
            sync_mode: true,
            style_preset: "fantasy",
            enhance_prompt: true
          };
        } else if (isFlux) {
          return {
            prompt: prompt,
            image_size: model.image_size,
            num_inference_steps: 30,
            guidance_scale: 6.5,
            sync_mode: true
          };
        } else {
          // SDXL
          return {
            prompt: prompt,
            image_size: model.image_size,
            num_inference_steps: 50,
            guidance_scale: 7.5,
            sync_mode: true
          };
        }
      
      case 'openai':
        return {
          model: model.model_name,
          prompt: prompt,
          n: 1,
          size: model.image_size,
          quality: model.quality
        };
      
      case 'stability':
        return {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: parseInt(model.image_size.split('x')[1]),
          width: parseInt(model.image_size.split('x')[0]),
          samples: 1,
          steps: 30
        };
      
      default:
        return { prompt };
    }
  }

  private buildEndpointURL(providerType: string, baseUrl: string): string {
    switch (providerType) {
      case 'anthropic':
        return `${baseUrl}/v1/messages`;
      
      case 'google':
        return `${baseUrl}/v1/models/gemini-pro:generateContent`;
      
      case 'openai':
      case 'openrouter':
      default:
        return `${baseUrl}/chat/completions`;
    }
  }

  private buildImageHeaders(providerType: string, apiKey: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    switch (providerType) {
      case 'fal_ai':
        headers['Authorization'] = `Key ${apiKey}`;
        break;
      
      case 'openai':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      
      case 'stability':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
    }

    return headers;
  }

  private getImageEndpoint(providerType: string, baseUrl: string): string {
    switch (providerType) {
      case 'fal_ai':
        return 'https://fal.run/fast-sdxl';
      case 'openai':
        return `${baseUrl}/images/generations`;
      case 'stability':
        return `${baseUrl}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`;
      default:
        return `${baseUrl}/images/generations`;
    }
  }

  private getFalAiModelEndpoint(modelName: string): string {
    if (modelName.includes('flux-dev')) {
      return 'https://fal.run/flux/dev';
    } else if (modelName.includes('flux')) {
      return 'https://fal.run/flux';
    } else {
      return 'https://fal.run/fast-sdxl';
    }
  }

  private parseLLMResponse(providerType: string, data: any): any {
    const extractJSON = (text: string, providerName: string): any => {
      try {
        return JSON.parse(text);
      } catch (error) {
        console.log(`[LLM] Direct JSON parse failed for ${providerName}, attempting extraction...`);
        
        // Try to find and extract a complete JSON object
        const jsonPatterns = [
          /\{[\s\S]*?\}(?=\s*$|\s*```|\s*\n\n)/,  // JSON object until end, code block, or double newline
          /\{[\s\S]*?\}\s*(?=\n[A-Z])/,           // JSON object followed by sentence start
          /\{[\s\S]*?\}\s*$/,                     // JSON object at the end
          /\{[\s\S]*?\}/                          // Fallback: any JSON-like content
        ];
        
        let bestMatch = null;
        let bestScore = 0;
        
        for (const pattern of jsonPatterns) {
          const match = text.match(pattern);
          if (match) {
            const jsonText = match[0].trim();
            try {
              // Test if this JSON is valid and score it
              const parsed = JSON.parse(jsonText);
              const score = this.scoreJSON(parsed, jsonText);
              
              if (score > bestScore) {
                bestMatch = parsed;
                bestScore = score;
              }
            } catch (parseError) {
              console.log(`[LLM] Pattern match failed for ${providerName}:`, parseError.message);
              continue;
            }
          }
        }
        
        if (bestMatch) {
          console.log(`[LLM] Successfully extracted JSON from ${providerName} with score: ${bestScore}`);
          return bestMatch;
        }
        
        // Last resort: try to fix common JSON issues
        console.log(`[LLM] Attempting to fix malformed JSON from ${providerName}...`);
        const fixedJSON = this.attemptJSONFix(text);
        if (fixedJSON) {
          try {
            const parsed = JSON.parse(fixedJSON);
            console.log(`[LLM] Successfully fixed and parsed JSON from ${providerName}`);
            return parsed;
          } catch (fixError) {
            console.log(`[LLM] JSON fix failed for ${providerName}:`, fixError.message);
          }
        }
        
        // If no JSON found, check if this is a text response that should be returned as-is
        if (text && typeof text === 'string' && text.length > 0) {
          console.log(`[LLM] No JSON found in ${providerName} response, returning as text:`, text.substring(0, 100) + '...');
          return text; // Return the text directly for text-format requests
        }
        
        console.log(`[LLM] No valid content in ${providerName} response`);
        throw new Error(`Invalid JSON response from ${providerName}`);
      }
    };

    switch (providerType) {
      case 'openai':
      case 'openrouter':
        const openaiContent = data.choices[0].message.content;
        return extractJSON(openaiContent, providerType);
      
      case 'anthropic':
        const anthropicContent = data.content[0].text;
        return extractJSON(anthropicContent, 'anthropic');
      
      case 'google':
        const responseText = data.candidates[0].content.parts[0].text;
        return extractJSON(responseText, 'google');
      
      default:
        const defaultContent = data.choices[0].message.content;
        return extractJSON(defaultContent, 'unknown');
    }
  }

  private parseImageResponse(providerType: string, data: any): string | null {
    switch (providerType) {
      case 'fal_ai':
        return data.images[0].url;
      
      case 'openai':
        return data.data[0].url;
      
      case 'stability':
        return `data:image/png;base64,${data.artifacts[0].base64}`;
      
      default:
        return data.data[0].url;
    }
  }

  private scoreJSON(parsed: any, jsonText: string): number {
    let score = 0;
    
    // Basic structure score
    if (typeof parsed === 'object' && parsed !== null) {
      score += 10;
    }
    
    // Adventure-specific fields (higher score for complete adventures)
    const expectedFields = ['title', 'gameSystem', 'summary', 'acts', 'encounters', 'npcs'];
    let fieldCount = 0;
    
    for (const field of expectedFields) {
      if (field in parsed) {
        fieldCount++;
        score += 5;
      }
    }
    
    // Bonus for having most expected fields
    if (fieldCount >= 4) {
      score += 20;
    }
    
    // Length bonus (longer JSON usually means more complete)
    score += Math.min(jsonText.length / 100, 10);
    
    return score;
  }

  private attemptJSONFix(text: string): string | null {
    try {
      // Remove common prefixes/suffixes
      let cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      cleaned = cleaned.replace(/^Here's.*?:\s*/i, '').replace(/^Response:\s*/i, '');
      
      // Find JSON boundaries more carefully
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        return null;
      }
      
      let jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);
      
      // Try to fix common issues
      
      // 1. Fix trailing commas
      jsonCandidate = jsonCandidate.replace(/,(\s*[}\]])/g, '$1');
      
      // 2. Fix unescaped quotes in strings
      jsonCandidate = jsonCandidate.replace(/"([^"]*)"([^"]*)"([^"]*)":/g, '"$1\\"$2\\"$3":');
      
      // 3. Fix missing quotes around keys
      jsonCandidate = jsonCandidate.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
      
      // 4. Try to complete truncated JSON by adding missing closing braces
      const openBraces = (jsonCandidate.match(/\{/g) || []).length;
      const closeBraces = (jsonCandidate.match(/\}/g) || []).length;
      const openBrackets = (jsonCandidate.match(/\[/g) || []).length;
      const closeBrackets = (jsonCandidate.match(/\]/g) || []).length;
      
      // Add missing closing braces/brackets
      for (let i = closeBraces; i < openBraces; i++) {
        jsonCandidate += '}';
      }
      for (let i = closeBrackets; i < openBrackets; i++) {
        jsonCandidate += ']';
      }
      
      return jsonCandidate;
    } catch (error) {
      return null;
    }
  }

  async getActiveProviders() {
    const [llmProviders, imageProviders] = await Promise.all([
      query('SELECT * FROM llm_providers WHERE is_active = true'),
      query('SELECT * FROM image_providers WHERE is_active = true')
    ]);

    return {
      llm: llmProviders.rows || [],
      image: imageProviders.rows || []
    };
  }

  async getActiveModels() {
    const [llmModels, imageModels] = await Promise.all([
      query(`
        SELECT lm.*, lp.name as provider_name, lp.provider_type
        FROM llm_models lm
        JOIN llm_providers lp ON lm.provider_id = lp.id
        WHERE lm.is_active = true
      `),
      query(`
        SELECT im.*, ip.name as provider_name, ip.provider_type
        FROM image_models im
        JOIN image_providers ip ON im.provider_id = ip.id
        WHERE im.is_active = true
      `)
    ]);

    return {
      llm: llmModels.rows || [],
      image: imageModels.rows || []
    };
  }
} 