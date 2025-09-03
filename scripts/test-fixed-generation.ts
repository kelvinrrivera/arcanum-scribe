import { config } from 'dotenv';

config();

async function testFixedGeneration() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIxY2Y2NWYzLWU0MTMtNGFhMC1iZjk0LTA3MDVlMzE5MWY1ZSIsImVtYWlsIjoiYWRtaW5AYXJjYW51bS1zY3JpYmUuY29tIiwicm9sZSI6ImFkbWluIiwidGllciI6ImFkbWluIiwic3Vic2NyaXB0aW9uX3RpZXIiOiJhZG1pbiIsImlhdCI6MTc1NjkyODQ2MywiZXhwIjoxNzU3MDE0ODYzfQ.NFDEAG3vFdkWWkDOXNZYL4xToXPH0YoVus_gCv4Vgk8";
  
  try {
    console.log('🧪 Testing fixed adventure generation...');
    
    const response = await fetch('http://localhost:3000/api/generate-adventure', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: "A simple test adventure in a haunted mansion",
        gameSystem: 'dnd5e',
        privacy: 'public',
        playerLevel: '3-5',
        partySize: '4',
        duration: 'short',
        tone: 'spooky',
        setting: 'urban',
        themes: ['Mystery', 'Horror'],
        professionalMode: { enabled: true, features: {} }
      })
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Adventure generated successfully!');
      console.log(`📋 Title: ${data.title}`);
      console.log(`📋 Summary: ${data.summary?.substring(0, 100)}...`);
      console.log(`📋 Scenes: ${data.scenes?.length || 0}`);
      console.log(`📋 NPCs: ${data.npcs?.length || 0}`);
      console.log(`📋 Monsters: ${data.monsters?.length || 0}`);
      console.log(`📋 Professional Grade: ${data.professionalEnhancement?.professionalGrade || 'N/A'}`);
      console.log(`📋 Quality Score: ${data.professionalEnhancement?.qualityMetrics?.overallScore || 'N/A'}`);
      
      if (data.professionalEnhancement?.qualityMetrics?.overallScore < 80) {
        console.log('⚠️  Quality score is below 80, but adventure was generated');
      }
      
      if (!data.scenes || data.scenes.length < 3) {
        console.log('⚠️  Adventure has fewer than 3 scenes');
      }
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Generation failed: ${response.status}`);
      console.log(`   Error: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
}

// Wait a bit for server to start
setTimeout(testFixedGeneration, 3000);