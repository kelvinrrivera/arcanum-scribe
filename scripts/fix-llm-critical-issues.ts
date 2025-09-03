import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Fixing critical LLM issues...');

// Read the LLM service file
let content = readFileSync('server/llm-service-v2.ts', 'utf8');

// Fix 1: Temperature parameter conversion
console.log('1. Fixing temperature parameter conversion...');
content = content.replace(
  /temperature: options\.temperature \|\| model\.temperature \|\| 0\.7,/g,
  'temperature: options.temperature || Number(model.temperature) || 0.7,'
);

// Fix 2: Max tokens parameter conversion
console.log('2. Fixing max_tokens parameter conversion...');
content = content.replace(
  /maxTokens: options\.max_tokens \|\| model\.max_tokens \|\| 4096,/g,
  'maxTokens: options.max_tokens || Number(model.max_tokens) || 4096,'
);

// Fix 3: Add JSON cleaning function
console.log('3. Adding JSON cleaning function...');
const jsonCleanFunction = `
  private cleanJSONResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/^\`\`\`json\s*/i, '').replace(/\`\`\`\s*$/, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If it still doesn't start with {, try to find the JSON part
    if (!cleaned.startsWith('{')) {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
    }
    
    return cleaned;
  }
`;

// Insert the function before the generateText method
content = content.replace(
  'async generateText(',
  jsonCleanFunction + '\n  async generateText('
);

// Fix 4: Use the cleaning function in generateJSON
console.log('4. Updating generateJSON to use cleaning function...');
content = content.replace(
  /const parsedResult = JSON\.parse\(result\.text\);/g,
  'const cleanedResponse = this.cleanJSONResponse(result.text);\n        const parsedResult = JSON.parse(cleanedResponse);'
);

// Write the fixed file
writeFileSync('server/llm-service-v2.ts', content);

console.log('✅ LLM service fixes applied successfully!');
console.log('📋 Changes made:');
console.log('  - Fixed temperature parameter type conversion');
console.log('  - Fixed max_tokens parameter type conversion');
console.log('  - Added JSON response cleaning');
console.log('  - Updated generateJSON to use cleaning function');