#!/usr/bin/env npx tsx

// Simulate exactly what the React component does
async function simulateAdminComponent() {
  try {
    console.log('🧪 Simulating LLMModelsManager Component Behavior');
    console.log('================================================');
    
    // Step 1: Check for auth token (like the component does)
    console.log('\n🔑 Step 1: Checking authentication...');
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtYWRtaW4tdXNlciIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJ0aWVyIjoiYWRtaW4iLCJpYXQiOjE3NTY5MjEyMzUsImV4cCI6MTc1NzAwNzYzNX0.-WPB01EKbCJ3yuDGH6jVDfAc47JhIknEE2pMuBjfg7w';
    
    if (!token) {
      console.log('❌ No auth token found');
      return;
    }
    console.log('✅ Auth token found');
    
    // Step 2: Prepare headers (like the component does)
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    console.log('✅ Headers prepared');
    
    // Step 3: Test server connectivity
    console.log('\n🌐 Step 2: Testing server connectivity...');
    try {
      const testResponse = await fetch('http://localhost:3001/api/health');
      console.log(`Server response: ${testResponse.status}`);
    } catch (error) {
      console.log('❌ Server not reachable. Is it running on port 3001?');
      console.log('   Run: npm run dev');
      return;
    }
    
    // Step 4: Fetch providers (exactly like component)
    console.log('\n📊 Step 3: Fetching LLM providers...');
    try {
      const providersResponse = await fetch('http://localhost:3001/api/admin/llm-providers', { headers });
      
      if (providersResponse.ok) {
        const providersData = await providersResponse.json();
        console.log(`✅ Providers API successful: ${providersData.providers?.length || 0} providers`);
        
        if (providersData.providers?.length > 0) {
          console.log('   Providers found:');
          providersData.providers.forEach(p => {
            console.log(`   - ${p.name} (${p.provider_type}) - ${p.is_active ? 'Active' : 'Inactive'}`);
          });
        }
      } else {
        const errorText = await providersResponse.text();
        console.log(`❌ Providers API failed: ${providersResponse.status}`);
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Providers API error: ${error.message}`);
    }
    
    // Step 5: Fetch models (exactly like component)
    console.log('\n🤖 Step 4: Fetching LLM models...');
    try {
      const modelsResponse = await fetch('http://localhost:3001/api/admin/llm-models', { headers });
      
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        console.log(`✅ Models API successful: ${modelsData.models?.length || 0} models`);
        
        if (modelsData.models?.length > 0) {
          console.log('   Models found:');
          modelsData.models.forEach(m => {
            console.log(`   - ${m.display_name} (${m.provider_type}) - $${m.cost_per_1m_tokens}/1M`);
          });
        } else {
          console.log('⚠️  No models in API response');
        }
      } else {
        const errorText = await modelsResponse.text();
        console.log(`❌ Models API failed: ${modelsResponse.status}`);
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Models API error: ${error.message}`);
    }
    
    console.log('\n🎯 Summary:');
    console.log('If APIs are working, the issue is likely:');
    console.log('1. Browser localStorage missing auth_token');
    console.log('2. Component not re-rendering after token set');
    console.log('3. CORS issues in browser');
    console.log('4. Network tab in browser shows the actual errors');
    
  } catch (error) {
    console.error('❌ Simulation failed:', error.message);
  }
}

simulateAdminComponent();