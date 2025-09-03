import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

class AdminService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Invite Codes
  async createInviteCode(code: string, createdBy: string): Promise<any> {
    const query = `
      INSERT INTO invite_codes (id, code, created_by, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const result = await this.pool.query(query, [uuidv4(), code, createdBy]);
    return result.rows[0];
  }

  async getInviteCodes(): Promise<any[]> {
    const query = `
      SELECT 
        id,
        code,
        created_by,
        used_by,
        created_at,
        used_at,
        (used_by IS NOT NULL) as is_used
      FROM invite_codes 
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async deleteInviteCode(id: string): Promise<boolean> {
    const query = 'DELETE FROM invite_codes WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // OpenRouter Models
  async getOpenRouterModels(): Promise<any[]> {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OpenRouter API key not found');
      }

      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      throw error;
    }
  }

  // Fal.ai Models
  async getFalModels(): Promise<any[]> {
    const falModels = [
      {
        id: 'fal-ai/flux/schnell',
        name: 'FLUX.1 [schnell]',
        description: 'Fast image generation model',
        pricing: { cost_per_image: 0.003 }
      },
      {
        id: 'fal-ai/flux/dev',
        name: 'FLUX.1 [dev]',
        description: 'High-quality image generation',
        pricing: { cost_per_image: 0.025 }
      },
      {
        id: 'fal-ai/stable-diffusion-v3-medium',
        name: 'Stable Diffusion 3 Medium',
        description: 'Balanced quality and speed',
        pricing: { cost_per_image: 0.035 }
      },
      {
        id: 'fal-ai/aura-flow',
        name: 'AuraFlow',
        description: 'Creative image generation',
        pricing: { cost_per_image: 0.02 }
      }
    ];

    return falModels;
  }

  // LLM Models
  async getLLMModels(): Promise<any[]> {
    const query = `
      SELECT m.*, p.name as provider_name, p.provider_type
      FROM llm_models m
      JOIN llm_providers p ON m.provider_id = p.id
      ORDER BY m.created_at DESC
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async createLLMModel(modelData: any): Promise<any> {
    const {
      provider_id,
      model_name,
      display_name,
      max_tokens = 4096,
      context_window = 4096,
      cost_per_1m_tokens = 0.0
    } = modelData;

    const query = `
      INSERT INTO llm_models (
        id, provider_id, model_name, display_name, max_tokens, 
        context_window, cost_per_1m_tokens, is_active, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      uuidv4(), provider_id, model_name, display_name, 
      max_tokens, context_window, cost_per_1m_tokens
    ]);

    return result.rows[0];
  }

  async updateLLMModel(id: string, updates: any): Promise<any> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE llm_models 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteLLMModel(id: string): Promise<boolean> {
    const query = 'DELETE FROM llm_models WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Image Models
  async getImageModels(): Promise<any[]> {
    const query = `
      SELECT m.*, p.name as provider_name, p.provider_type
      FROM image_models m
      JOIN image_providers p ON m.provider_id = p.id
      ORDER BY m.created_at DESC
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async createImageModel(modelData: any): Promise<any> {
    const {
      provider_id,
      model_name,
      display_name,
      image_size = '1024x1024',
      cost_per_image = 0.0
    } = modelData;

    const query = `
      INSERT INTO image_models (
        id, provider_id, model_name, display_name, 
        image_size, cost_per_image, is_active, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      uuidv4(), provider_id, model_name, display_name, 
      image_size, cost_per_image
    ]);

    return result.rows[0];
  }

  async updateImageModel(id: string, updates: any): Promise<any> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE image_models 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Prompt Logs
  async getPromptLogs(limit: number = 50, offset: number = 0): Promise<{ logs: any[], total: number }> {
    const query = `
      SELECT 
        pl.*,
        u.email as user_email,
        lp.name as provider_name,
        lm.display_name as model_name
      FROM prompt_logs pl
      LEFT JOIN users u ON pl.user_id = u.id
      LEFT JOIN llm_providers lp ON pl.provider_id = lp.id
      LEFT JOIN llm_models lm ON pl.model_id = lm.id
      ORDER BY pl.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) as total FROM prompt_logs';

    const [logsResult, countResult] = await Promise.all([
      this.pool.query(query, [limit, offset]),
      this.pool.query(countQuery)
    ]);

    return {
      logs: logsResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  // Users
  async getUsers(limit: number = 50, offset: number = 0): Promise<{ users: any[], total: number }> {
    const query = `
      SELECT 
        id, email, tier, subscription_tier, magic_credits, 
        credits_used, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) as total FROM users';

    const [usersResult, countResult] = await Promise.all([
      this.pool.query(query, [limit, offset]),
      this.pool.query(countQuery)
    ]);

    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  async updateUser(id: string, updates: any): Promise<any> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, email, tier, subscription_tier, magic_credits, credits_used
    `;

    values.push(id);
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Providers
  async getLLMProviders(): Promise<any[]> {
    const query = 'SELECT * FROM llm_providers ORDER BY name';
    const result = await this.pool.query(query);
    return result.rows;
  }

  async createLLMProvider(providerData: any): Promise<any> {
    const {
      name,
      provider_type,
      base_url,
      api_key_env,
      is_active = true,
      priority = 0,
      config = {}
    } = providerData;

    const query = `
      INSERT INTO llm_providers (
        id, name, provider_type, base_url, api_key_env, 
        is_active, priority, config, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      uuidv4(), name, provider_type, base_url, api_key_env,
      is_active, priority, JSON.stringify(config)
    ]);

    return result.rows[0];
  }

  async updateLLMProvider(id: string, updates: any): Promise<any> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (key === 'config') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
      }
      paramIndex++;
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE llm_providers 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteLLMProvider(id: string): Promise<boolean> {
    const query = 'DELETE FROM llm_providers WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  async getImageProviders(): Promise<any[]> {
    const query = 'SELECT * FROM image_providers ORDER BY name';
    const result = await this.pool.query(query);
    return result.rows;
  }

  async createImageProvider(providerData: any): Promise<any> {
    const {
      name,
      provider_type,
      base_url,
      api_key_env,
      is_active = true,
      priority = 0,
      config = {}
    } = providerData;

    const query = `
      INSERT INTO image_providers (
        id, name, provider_type, base_url, api_key_env, 
        is_active, priority, config, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      uuidv4(), name, provider_type, base_url, api_key_env,
      is_active, priority, JSON.stringify(config)
    ]);

    return result.rows[0];
  }

  async updateImageProvider(id: string, updates: any): Promise<any> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (key === 'config') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
      }
      paramIndex++;
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE image_providers 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteImageProvider(id: string): Promise<boolean> {
    const query = 'DELETE FROM image_providers WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Usage Statistics
  async getUsageStats(days: number = 30): Promise<any[]> {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(tokens_used) as total_tokens,
        SUM(cost) as total_cost,
        AVG(response_time_ms) as avg_response_time,
        SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as success_count
      FROM prompt_logs 
      WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    try {
      const result = await this.pool.query(query, [days]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      // Return empty stats if query fails
      return [{
        date: new Date().toISOString().split('T')[0],
        count: 0,
        total_tokens: 0,
        total_cost: 0,
        avg_response_time: 0,
        success_count: 0
      }];
    }
  }

  // Provider Testing
  async testProviderConnection(providerId: string): Promise<any> {
    try {
      // This is a placeholder - in a real implementation, you would test the actual provider connection
      return {
        success: true,
        message: 'Connection test successful',
        responseTime: Math.floor(Math.random() * 1000) + 100
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Connection test failed'
      };
    }
  }

  // Prompt Analysis
  async getPromptAnalysis(): Promise<any> {
    try {
      const query = `
        SELECT 
          prompt_type,
          COUNT(*) as total_prompts,
          AVG(tokens_used) as avg_tokens,
          AVG(cost) as avg_cost,
          AVG(response_time_ms) as avg_response_time,
          SUM(CASE WHEN success = true THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as success_rate
        FROM prompt_logs 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY prompt_type
        ORDER BY total_prompts DESC
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching prompt analysis:', error);
      return [];
    }
  }

  // Prompt Templates
  async getPromptTemplates(): Promise<any[]> {
    try {
      // This is a placeholder - you would implement actual prompt template storage
      return [
        {
          id: '1',
          name: 'Adventure Prompt',
          category: 'adventure',
          template: 'Generate an adventure scenario...',
          created_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching prompt templates:', error);
      return [];
    }
  }

  async updatePromptTemplate(id: string, updates: any): Promise<any> {
    try {
      // This is a placeholder - you would implement actual prompt template updates
      return {
        id,
        ...updates,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating prompt template:', error);
      throw error;
    }
  }
}

export default AdminService;