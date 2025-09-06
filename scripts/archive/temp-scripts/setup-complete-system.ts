#!/usr/bin/env tsx
import 'dotenv/config';
import { execSync } from 'child_process';

async function setupCompleteSystem() {
  console.log('🚀 Setting up complete Arcanum Scribe system...\n');
  
  const steps = [
    {
      name: 'Reset admin password',
      command: 'npm run reset:admin-password'
    },
    {
      name: 'Setup LLM providers',
      command: 'npm run setup:llm-providers'
    },
    {
      name: 'Setup LLM models',
      command: 'npm run setup:llm-models'
    },
    {
      name: 'Check admin user',
      command: 'npm run check:admin'
    }
  ];
  
  for (const step of steps) {
    try {
      console.log(`🔧 ${step.name}...`);
      execSync(step.command, { stdio: 'inherit' });
      console.log(`✅ ${step.name} completed\n`);
    } catch (error) {
      console.error(`❌ ${step.name} failed:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('🎉 System setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the server: npm run server');
  console.log('2. Start the frontend: npm run dev');
  console.log('3. Login with: admin@arcanum-scribe.com / admin123');
  console.log('4. Test generation with your 1000 Magic Credits!');
}

setupCompleteSystem();