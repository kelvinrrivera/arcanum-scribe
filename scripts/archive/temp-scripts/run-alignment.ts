import { config } from 'dotenv';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

async function runAlignment() {
  console.log('🔧 Running database alignment script...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check current database state
    const dbInfo = await client.query('SELECT current_database(), current_user;');
    console.log('Database:', dbInfo.rows[0]);
    
    // Read and execute alignment script
    const sqlPath = path.join(__dirname, 'align_llm_providers.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log('📝 Executing alignment script...');
    
    await client.query(sql);
    console.log('✅ Database alignment completed successfully');
    
    // Verify changes
    const providers = await client.query('SELECT name, is_active FROM llm_providers ORDER BY name;');
    console.log('📊 Provider status after alignment:', providers.rows);
    
  } catch (error) {
    console.error('❌ Alignment failed:', error);
  } finally {
    await client.end();
  }
}

runAlignment();