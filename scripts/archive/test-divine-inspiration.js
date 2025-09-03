#!/usr/bin/env node

/**
 * Test script for the new Divine Inspiration LLM-powered prompt generation
 */

const fetch = require('node-fetch');

async function testDivineInspiration() {
  console.log('🌟 Testing Divine Inspiration LLM-powered prompt generation...\n');

  try {
    // You'll need to replace this with a valid JWT token from your app
    const testToken = process.env.TEST_JWT_TOKEN;
    
    if (!testToken) {
      console.log('❌ No TEST_JWT_TOKEN environment variable found.');
      console.log('To test this properly, you need to:');
      console.log('1. Log into your app');
      console.log('2. Get your JWT token from browser dev tools');
      console.log('3. Set it as TEST_JWT_TOKEN environment variable');
      console.log('4. Run: TEST_JWT_TOKEN="your_token_here" node scripts/test-divine-inspiration.js');
      return;
    }

    const response = await fetch('http://localhost:3001/api/generate-prompt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    console.log('✅ Divine Inspiration test successful!\n');
    console.log('📝 Generated Prompt:');
    console.log('─'.repeat(80));
    console.log(data.prompt);
    console.log('─'.repeat(80));
    console.log(`\n📊 Metadata:`);
    console.log(`   Source: ${data.source || 'unknown'}`);
    console.log(`   Timestamp: ${data.timestamp}`);
    console.log(`   Length: ${data.prompt.length} characters`);
    
    if (data.source === 'llm-generated') {
      console.log('\n🎉 SUCCESS: LLM is generating unique prompts!');
    } else if (data.source === 'fallback') {
      console.log('\n⚠️  WARNING: Fell back to static prompts due to LLM error');
      if (data.error) {
        console.log(`   Error: ${data.error}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 This looks like an authentication error.');
      console.log('Make sure your TEST_JWT_TOKEN is valid and not expired.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure your server is running on port 3001');
      console.log('Run: npm run dev:server');
    }
  }
}

// Run the test
testDivineInspiration();