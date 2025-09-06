#!/usr/bin/env npx tsx

/**
 * Interactive script to help setup API keys for Vercel AI SDK
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAPIKeys() {
  console.log('🔑 API Keys Setup for Vercel AI SDK');
  console.log('===================================\n');

  console.log('This script will help you configure API keys for the new multi-LLM system.');
  console.log('You can skip any provider by pressing Enter without typing a key.\n');

  // Read current .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('⚠️  .env file not found, will create a new one');
  }

  const envLines = envContent.split('\n');
  const envMap = new Map<string, string>();

  // Parse existing env vars
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envMap.set(key.trim(), valueParts.join('=').trim());
    }
  });

  console.log('📋 Current API Key Status:');
  console.log(`   Anthropic: ${envMap.get('ANTHROPIC_API_KEY') ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   OpenAI: ${envMap.get('OPENAI_API_KEY') ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Google: ${envMap.get('GOOGLE_GENERATIVE_AI_API_KEY') ? '✅ Configured' : '❌ Missing'}\n`);

  // Anthropic API Key
  console.log('🤖 Anthropic (Claude models)');
  console.log('   Get your key at: https://console.anthropic.com/');
  console.log('   Format: sk-ant-api03-...');
  const anthropicKey = await question('   Enter Anthropic API key (or press Enter to skip): ');
  
  if (anthropicKey.trim()) {
    if (anthropicKey.startsWith('sk-ant-')) {
      envMap.set('ANTHROPIC_API_KEY', anthropicKey.trim());
      console.log('   ✅ Anthropic key saved');
    } else {
      console.log('   ⚠️  Warning: Anthropic keys usually start with "sk-ant-"');
      envMap.set('ANTHROPIC_API_KEY', anthropicKey.trim());
    }
  }

  console.log();

  // OpenAI API Key
  console.log('🧠 OpenAI (GPT models)');
  console.log('   Get your key at: https://platform.openai.com/api-keys');
  console.log('   Format: sk-...');
  const openaiKey = await question('   Enter OpenAI API key (or press Enter to skip): ');
  
  if (openaiKey.trim()) {
    if (openaiKey.startsWith('sk-')) {
      envMap.set('OPENAI_API_KEY', openaiKey.trim());
      console.log('   ✅ OpenAI key saved');
    } else {
      console.log('   ⚠️  Warning: OpenAI keys usually start with "sk-"');
      envMap.set('OPENAI_API_KEY', openaiKey.trim());
    }
  }

  console.log();

  // Google API Key
  console.log('🔍 Google (Gemini models)');
  console.log('   Get your key at: https://aistudio.google.com/app/apikey');
  console.log('   Format: AIza...');
  const googleKey = await question('   Enter Google API key (or press Enter to skip): ');
  
  if (googleKey.trim()) {
    if (googleKey.startsWith('AIza')) {
      envMap.set('GOOGLE_GENERATIVE_AI_API_KEY', googleKey.trim());
      console.log('   ✅ Google key saved');
    } else {
      console.log('   ⚠️  Warning: Google API keys usually start with "AIza"');
      envMap.set('GOOGLE_GENERATIVE_AI_API_KEY', googleKey.trim());
    }
  }

  console.log();

  // Write updated .env file
  const newEnvContent = Array.from(envMap.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(envPath, newEnvContent);
  console.log('💾 .env file updated successfully!');

  // Show final status
  console.log('\n📊 Final Configuration:');
  console.log(`   Anthropic: ${envMap.get('ANTHROPIC_API_KEY') ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   OpenAI: ${envMap.get('OPENAI_API_KEY') ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Google: ${envMap.get('GOOGLE_GENERATIVE_AI_API_KEY') ? '✅ Configured' : '❌ Not configured'}`);

  const configuredCount = [
    envMap.get('ANTHROPIC_API_KEY'),
    envMap.get('OPENAI_API_KEY'),
    envMap.get('GOOGLE_GENERATIVE_AI_API_KEY')
  ].filter(Boolean).length;

  if (configuredCount === 0) {
    console.log('\n⚠️  No API keys configured. The system will not work until you add at least one key.');
  } else if (configuredCount < 3) {
    console.log(`\n✅ ${configuredCount}/3 providers configured. The system will work with failover to configured providers.`);
  } else {
    console.log('\n🎉 All providers configured! The system is ready for full multi-LLM operation.');
  }

  console.log('\n🚀 Next steps:');
  console.log('   1. Run: npm run test:vercel-ai-sdk');
  console.log('   2. Check the admin panel for model status');
  console.log('   3. Test adventure generation');

  rl.close();
}

// Run setup
setupAPIKeys().catch(console.error);