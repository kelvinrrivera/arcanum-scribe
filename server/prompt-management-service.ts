import { query } from '../src/integrations/postgres/client';

export interface PromptTemplate {
  id: string;
  name: string;
  type: 'adventure' | 'image_monster' | 'image_scene' | 'image_npc' | 'image_item';
  template: string;
  variables: string[];
  is_active: boolean;
  version: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface APILog {
  id: string;
  provider: string;
  model: string;
  request_type: 'llm' | 'image';
  prompt: string;
  system_prompt?: string;
  response: string;
  tokens_used?: number;
  cost: number;
  duration_ms: number;
  success: boolean;
  error_message?: string;
  user_id: string;
  created_at: Date;
}

export class PromptManagementService {
  
  // Prompt Templates Management
  async getPromptTemplates(type?: string): Promise<PromptTemplate[]> {
    let sql = 'SELECT * FROM prompt_templates';
    let params: any[] = [];
    
    if (type) {
      sql += ' WHERE type = $1';
      params.push(type);
    }
    
    sql += ' ORDER BY type, name';
    
    const { rows } = await query(sql, params);
    return rows;
  }

  async getPromptTemplate(id: string): Promise<PromptTemplate | null> {
    const { rows } = await query(
      'SELECT * FROM prompt_templates WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async createPromptTemplate(template: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<PromptTemplate> {
    const { rows } = await query(`
      INSERT INTO prompt_templates (
        id, name, type, template, variables, is_active, version, created_by
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7
      ) RETURNING *
    `, [
      template.name,
      template.type,
      template.template,
      JSON.stringify(template.variables),
      template.is_active,
      template.version,
      template.created_by
    ]);
    return rows[0];
  }

  async updatePromptTemplate(id: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        if (key === 'variables') {
          setClause.push(`${key} = $${paramIndex}`);
          values.push(JSON.stringify(value));
        } else {
          setClause.push(`${key} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    });

    setClause.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await query(`
      UPDATE prompt_templates 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    return rows[0];
  }

  async deletePromptTemplate(id: string): Promise<boolean> {
    const { rowCount } = await query(
      'DELETE FROM prompt_templates WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }

  // API Logs Management
  async logAPICall(log: Omit<APILog, 'id' | 'created_at'>): Promise<void> {
    await query(`
      INSERT INTO api_logs (
        id, provider, model, request_type, prompt, system_prompt, 
        response, tokens_used, cost, duration_ms, success, 
        error_message, user_id
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      )
    `, [
      log.provider,
      log.model,
      log.request_type,
      log.prompt,
      log.system_prompt,
      log.response,
      log.tokens_used,
      log.cost,
      log.duration_ms,
      log.success,
      log.error_message,
      log.user_id
    ]);
  }

  async getAPILogs(filters: {
    provider?: string;
    model?: string;
    request_type?: 'llm' | 'image';
    success?: boolean;
    user_id?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ logs: APILog[], total: number }> {
    let whereClause = [];
    let params: any[] = [];
    let paramIndex = 1;

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && key !== 'limit' && key !== 'offset') {
        if (key === 'start_date') {
          whereClause.push(`created_at >= $${paramIndex}`);
          params.push(value);
          paramIndex++;
        } else if (key === 'end_date') {
          whereClause.push(`created_at <= $${paramIndex}`);
          params.push(value);
          paramIndex++;
        } else {
          whereClause.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }
    });

    const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';
    
    // Get total count
    const { rows: countRows } = await query(`
      SELECT COUNT(*) as total FROM api_logs ${whereSQL}
    `, params);
    const total = parseInt(countRows[0].total);

    // Get logs with pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    
    const { rows } = await query(`
      SELECT * FROM api_logs ${whereSQL}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return { logs: rows, total };
  }

  async getAPIStats(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<any> {
    let dateFormat = '';
    switch (timeframe) {
      case 'hour':
        dateFormat = 'YYYY-MM-DD HH24:00:00';
        break;
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
    }

    const { rows } = await query(`
      SELECT 
        TO_CHAR(created_at, $1) as period,
        provider,
        model,
        request_type,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE success = true) as successful_requests,
        COUNT(*) FILTER (WHERE success = false) as failed_requests,
        AVG(duration_ms) as avg_duration_ms,
        SUM(cost) as total_cost,
        SUM(tokens_used) as total_tokens
      FROM api_logs 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY period, provider, model, request_type
      ORDER BY period DESC, provider, model
    `, [dateFormat]);

    return rows;
  }

  // Prompt Building with Templates
  async buildPromptFromTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = await this.getPromptTemplate(templateId);
    if (!template) {
      throw new Error(`Prompt template ${templateId} not found`);
    }

    let prompt = template.template;
    
    // Replace variables in template
    template.variables.forEach(variable => {
      const value = variables[variable] || '';
      prompt = prompt.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value);
    });

    return prompt;
  }

  // Current Prompts Analysis
  async analyzeCurrentPrompts(): Promise<{
    adventure_prompt_length: number;
    image_prompts_avg_length: number;
    truncation_risk: boolean;
    recommendations: string[];
  }> {
    const templates = await this.getPromptTemplates();
    const adventureTemplate = templates.find(t => t.type === 'adventure');
    const imageTemplates = templates.filter(t => t.type.startsWith('image_'));

    const adventureLength = adventureTemplate?.template.length || 0;
    const avgImageLength = imageTemplates.length > 0 
      ? imageTemplates.reduce((sum, t) => sum + t.template.length, 0) / imageTemplates.length 
      : 0;

    const recommendations = [];
    
    if (adventureLength > 8000) {
      recommendations.push('Adventure prompt is very long, consider breaking into sections');
    }
    
    if (avgImageLength > 500) {
      recommendations.push('Image prompts are long, risk of truncation by image models');
    }

    const truncationRisk = avgImageLength > 400; // Most image models truncate around 77 tokens (~400 chars)

    return {
      adventure_prompt_length: adventureLength,
      image_prompts_avg_length: Math.round(avgImageLength),
      truncation_risk: truncationRisk,
      recommendations
    };
  }
}