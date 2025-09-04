#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Fixing LLMModelsManager formatCost function...');

try {
  const filePath = 'src/components/admin/LLMModelsManager.tsx';
  let content = readFileSync(filePath, 'utf8');
  
  // Replace the formatCost function
  const oldFunction = `const formatCost = (cost: number): string => {
    if (cost < 1) return \`\${cost.toFixed(3)}\`;
    return \`\${cost.toFixed(2)}\`;
  };`;
  
  const newFunction = `const formatCost = (cost: number | string | null | undefined): string => {
    const numCost = typeof cost === 'number' ? cost : parseFloat(String(cost || 0));
    if (isNaN(numCost)) return '$0.00';
    if (numCost < 1) return \`$\${numCost.toFixed(3)}\`;
    return \`$\${numCost.toFixed(2)}\`;
  };`;
  
  if (content.includes('const formatCost = (cost: number): string =>')) {
    content = content.replace(oldFunction, newFunction);
    writeFileSync(filePath, content);
    console.log('✅ Fixed formatCost function in LLMModelsManager');
  } else {
    console.log('⚠️  formatCost function not found or already fixed');
  }
  
} catch (error) {
  console.error('❌ Error fixing LLMModelsManager:', error);
  process.exit(1);
}