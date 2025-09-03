#!/usr/bin/env tsx
import 'dotenv/config';
import { spawn } from 'child_process';

async function testCompleteSystem() {
  console.log('🚀 Testing complete system...');
  
  // First verify database
  console.log('1. Verifying database connection...');
  try {
    const { execSync } = require('child_process');
    execSync('npm run verify:database', { stdio: 'inherit' });
    console.log('✅ Database verification completed\n');
  } catch (error) {
    console.log('❌ Database verification failed');
    return;
  }
  
  console.log('💡 Next steps:');
  console.log('1. Start the server: npm run server');
  console.log('2. In another terminal, test auth: npm run test:auth-endpoints');
  console.log('3. Start frontend: npm run dev');
  console.log('4. Login with: admin@arcanum-scribe.com / admin123');
}

testCompleteSystem();