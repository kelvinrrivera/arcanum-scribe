#!/usr/bin/env node
/**
 * Kiro Hook: Generate Adventure from Spec
 * 
 * Reads a Kiro spec and generates an adventure using the actual API endpoints.
 * This demonstrates the Spec → Code → Artifact workflow.
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const SPEC_DIR = './.kiro/specs';
const ARTIFACTS_DIR = './.kiro/artifacts';
const SERVER_URL = 'http://localhost:3000';

async function loginAsAdmin() {
  const response = await fetch(`${SERVER_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@arcanum-scribe.com',
      password: 'admin123'
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to login as admin');
  }
  
  const data = await response.json();
  return data.token;
}

async function generateAdventureFromSpec(specName) {
  console.log(`🎯 Kiro Hook: Generating adventure from spec '${specName}'`);
  
  // Read the spec
  const specPath = path.join(SPEC_DIR, specName, 'requirements.md');
  if (!fs.existsSync(specPath)) {
    throw new Error(`Spec file not found: ${specPath}`);
  }
  
  const specContent = fs.readFileSync(specPath, 'utf-8');
  
  // Extract adventure parameters from spec
  let prompt = "Create a mysterious adventure with professional quality.";
  let playerLevel = "3-5";
  let partySize = "4";
  let duration = "medium";
  let tone = "mystery";
  let themes = ["Mystery", "Adventure"];
  let professionalMode = true;
  
  // Parse spec for specific requirements
  if (specContent.includes('advanced-prompt-system')) {
    prompt = "Create an adventure that showcases advanced prompt engineering with complex NPCs, branching storylines, and multiple puzzle solutions.";
    professionalMode = true;
  } else if (specContent.includes('visual-tiers-system')) {
    prompt = "Create a visually rich adventure with detailed descriptions for image generation, focusing on atmospheric scenes and character portraits.";
    themes = ["Visual", "Atmospheric"];
  } else if (specContent.includes('professional-mode')) {
    prompt = "Create a publication-ready adventure with professional layout, complete stat blocks, and GM guidance.";
    professionalMode = true;
  }
  
  console.log(`📝 Derived prompt: ${prompt.substring(0, 100)}...`);
  console.log(`⚙️  Professional mode: ${professionalMode}`);
  
  // Login and generate
  const token = await loginAsAdmin();
  
  const response = await fetch(`${SERVER_URL}/api/generate-adventure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      prompt,
      gameSystem: 'dnd5e',
      privacy: 'public',
      playerLevel,
      partySize,
      duration,
      tone,
      setting: 'fantasy',
      themes,
      professionalMode: { enabled: professionalMode }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Adventure generation failed: ${error}`);
  }
  
  const adventure = await response.json();
  
  // Save artifact
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const artifactName = `adventure_${specName}_${timestamp}.json`;
  const artifactPath = path.join(ARTIFACTS_DIR, artifactName);
  
  fs.writeFileSync(artifactPath, JSON.stringify(adventure, null, 2));
  
  console.log(`✅ Adventure generated successfully!`);
  console.log(`🏰 Title: ${adventure.title}`);
  console.log(`📊 Acts: ${adventure.acts?.length || 0}, NPCs: ${adventure.npcs?.length || 0}, Encounters: ${adventure.encounters?.length || 0}`);
  console.log(`🖼️  Images: ${adventure.imageUrls?.length || 0} (Cost: $${adventure.imageCost || 0})`);
  console.log(`📁 Artifact saved: ${artifactPath}`);
  
  return {
    adventureId: adventure.id,
    artifactPath,
    title: adventure.title,
    stats: {
      acts: adventure.acts?.length || 0,
      npcs: adventure.npcs?.length || 0,
      encounters: adventure.encounters?.length || 0,
      images: adventure.imageUrls?.length || 0,
      imageCost: adventure.imageCost || 0
    }
  };
}

// CLI execution
if (process.argv.length < 3) {
  console.log('Usage: node gen_adventure_from_spec.js <spec-name>');
  console.log('Available specs:');
  if (fs.existsSync(SPEC_DIR)) {
    const specs = fs.readdirSync(SPEC_DIR).filter(f => 
      fs.statSync(path.join(SPEC_DIR, f)).isDirectory()
    );
    specs.forEach(spec => console.log(`  - ${spec}`));
  }
  process.exit(1);
}

const specName = process.argv[2];
generateAdventureFromSpec(specName).catch(console.error);