import { query } from '../src/integrations/postgres/client';

async function setupAdminTables() {
  console.log('🔧 Setting up admin tables...');
  
  try {
    // Create invite_codes table
    await query(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        max_uses INTEGER DEFAULT 1,
        uses_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        tier_override VARCHAR(50),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created invite_codes table');

    // Create api_logs table
    await query(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        timestamp TIMESTAMP DEFAULT NOW(),
        user_id UUID REFERENCES users(id),
        method VARCHAR(10),
        path VARCHAR(500),
        query JSONB,
        body JSONB,
        response_status INTEGER,
        response_data TEXT,
        response_time_ms INTEGER,
        success BOOLEAN,
        ip_address INET,
        user_agent TEXT
      );
    `);
    console.log('✅ Created api_logs table');

    // Create system_configs table
    await query(`
      CREATE TABLE IF NOT EXISTS system_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        category VARCHAR(50),
        description TEXT,
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created system_configs table');

    // Create prompt_templates table
    await query(`
      CREATE TABLE IF NOT EXISTS prompt_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created prompt_templates table');

    // Create prompt_logs table
    await query(`
      CREATE TABLE IF NOT EXISTS prompt_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        provider_id UUID REFERENCES llm_providers(id),
        model_id UUID REFERENCES llm_models(id),
        prompt_type VARCHAR(100),
        prompt_text TEXT,
        response_text TEXT,
        tokens_used INTEGER,
        cost DECIMAL(10,6),
        response_time_ms INTEGER,
        success BOOLEAN,
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created prompt_logs table');

    // Add indexes for performance
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp);`);
      await query(`CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);`);
      await query(`CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);`);
      
      // Check if prompt_logs table exists before creating indexes
      const { rows } = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'prompt_logs'
        );
      `);
      
      if (rows[0].exists) {
        await query(`CREATE INDEX IF NOT EXISTS idx_prompt_logs_created_at ON prompt_logs(created_at);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_prompt_logs_user_id ON prompt_logs(user_id);`);
      }
    } catch (indexError) {
      console.log('⚠️ Some indexes could not be created:', indexError.message);
    }
    console.log('✅ Created indexes');

    // Insert default system configs
    await query(`
      INSERT INTO system_configs (key, value, category, description) VALUES
      ('max_tokens_per_request', '8192', 'llm', 'Maximum tokens per LLM request'),
      ('default_temperature', '0.8', 'llm', 'Default temperature for LLM requests'),
      ('max_images_per_adventure', '10', 'image', 'Maximum images per adventure generation'),
      ('enable_professional_mode', 'true', 'features', 'Enable professional mode features')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✅ Inserted default system configs');

    // Insert default prompt templates
    try {
      await query(`
        INSERT INTO prompt_templates (name, content, category) VALUES
        ('Adventure Generation', 'Generate a detailed D&D 5e adventure with the following specifications: {specifications}', 'adventure'),
        ('NPC Generation', 'Create a detailed NPC for a D&D 5e campaign: {npc_details}', 'npc'),
        ('Location Description', 'Describe a {location_type} for a D&D campaign: {location_details}', 'location');
      `);
    } catch (templateError) {
      console.log('⚠️ Could not insert default templates:', templateError.message);
    }
    console.log('✅ Inserted default prompt templates');

    console.log('🎉 Admin tables setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up admin tables:', error);
  }
  
  process.exit(0);
}

setupAdminTables();