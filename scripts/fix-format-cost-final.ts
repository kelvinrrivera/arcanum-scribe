#!/usr/bin/env tsx

import fs from 'fs';

console.log('🔧 Fixing formatCost function final...');

const filePath = 'src/components/admin/LLMModelsManager.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic lines
content = content.replace(
  /if \(numCost < 1\) return `\$\{numCost\.toFixed\(3\)\}`;/,
  'if (numCost < 1) return `$${numCost.toFixed(3)}`;'
);

content = content.replace(
  /return `\$\{numCost\.toFixed\(2\)\}`;/,
  'return `$${numCost.toFixed(2)}`;'
);

fs.writeFileSync(filePath, content);

console.log('✅ Fixed formatCost function');

// Verify the fix
const updatedContent = fs.readFileSync(filePath, 'utf8');
const formatCostMatch = updatedContent.match(/const formatCost = [\s\S]*?};/);

if (formatCostMatch) {
  console.log('\n📋 Updated formatCost function:');
  console.log(formatCostMatch[0]);
} else {
  console.log('❌ Could not find formatCost function');
}