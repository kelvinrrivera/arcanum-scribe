import { query } from '../src/integrations/postgres/client';

async function checkTableStructure() {
  console.log('🔍 Checking table structures...');
  
  try {
    // Check invite_codes table
    console.log('\n📋 invite_codes table:');
    const { rows: inviteColumns } = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'invite_codes'
      ORDER BY ordinal_position;
    `);
    
    if (inviteColumns.length === 0) {
      console.log('❌ invite_codes table does not exist');
    } else {
      console.table(inviteColumns);
    }
    
    // Check prompt_logs table
    console.log('\n📋 prompt_logs table:');
    const { rows: promptColumns } = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'prompt_logs'
      ORDER BY ordinal_position;
    `);
    
    if (promptColumns.length === 0) {
      console.log('❌ prompt_logs table does not exist');
    } else {
      console.table(promptColumns);
    }
    
    // List all tables
    console.log('\n📋 All tables in database:');
    const { rows: tables } = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.table(tables);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkTableStructure();