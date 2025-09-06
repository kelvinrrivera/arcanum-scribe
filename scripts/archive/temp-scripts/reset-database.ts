import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  console.log('🗑️  Resetting database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
  });

  try {
    // Drop all tables in correct order (respecting foreign keys)
    const tables = [
      'prompt_logs',
      'download_logs',
      'credit_transactions',
      'tier_changes',
      'invitation_codes',
      'image_models',
      'image_providers',
      'llm_models',
      'llm_providers',
      'adventures',
      'profiles',
      'users'
    ];

    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not drop table ${table}:`, error.message);
      }
    }

    console.log('🎉 Database reset completed!');
    console.log('💡 Now run: npm run db:init');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run reset
resetDatabase().catch(console.error);