import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Disable SSL for development
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  query_timeout: 30000, // Query timeout
  statement_timeout: 30000, // Statement timeout
});

// Test the connection
pool.on('connect', (client) => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to get a client from the pool
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Helper function to execute a query
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await getClient();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Helper function to execute a transaction
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Export the pool for direct access if needed
export { pool };

// Database interface for type safety
export interface Database {
  // Users and Authentication
  profiles: {
    id: string;
    email: string;
    display_name: string;
    subscription_tier: string;
    credits_remaining: number;
    monthly_generations: number;
    created_at: string;
    updated_at: string;
  };

  // Invite Codes
  invite_codes: {
    id: string;
    code: string;
    created_by: string;
    used_by?: string;
    created_at: string;
    used_at?: string;
  };

  // Adventures
  adventures: {
    id: string;
    user_id: string;
    title: string;
    content: any;
    game_system: string;
    created_at: string;
    updated_at: string;
  };

  // LLM Providers
  llm_providers: {
    id: string;
    name: string;
    provider_type: string;
    base_url: string;
    api_key_env: string;
    is_active: boolean;
    priority: number;
    created_at: string;
    updated_at: string;
  };

  // LLM Models
  llm_models: {
    id: string;
    provider_id: string;
    model_name: string;
    display_name: string;
    model_type: string;
    max_tokens: number;
    temperature: number;
    is_active: boolean;
    cost_per_1k_tokens: number;
    created_at: string;
    updated_at: string;
  };

  // Image Providers
  image_providers: {
    id: string;
    name: string;
    provider_type: string;
    base_url: string;
    api_key_env: string;
    is_active: boolean;
    priority: number;
    created_at: string;
    updated_at: string;
  };

  // Image Models
  image_models: {
    id: string;
    provider_id: string;
    model_name: string;
    display_name: string;
    image_size: string;
    quality: string;
    is_active: boolean;
    cost_per_image: number;
    created_at: string;
    updated_at: string;
  };

  // System Configuration
  system_config: {
    id: string;
    key: string;
    value: any;
    description: string;
    created_at: string;
    updated_at: string;
  };
} 