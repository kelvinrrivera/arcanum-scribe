#!/usr/bin/env node
/**
 * Kiro Hook: Export PDF for Adventure
 * 
 * Takes an adventure ID and exports it to PDF using the professional PDF service.
 * Demonstrates the Code → Artifact workflow with our Puppeteer PDF engine.
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

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

async function exportAdventureToPDF(adventureId) {
  console.log(`📄 Kiro Hook: Exporting adventure ${adventureId} to PDF`);
  
  const token = await loginAsAdmin();
  
  // First, get the adventure details
  const adventureResponse = await fetch(`${SERVER_URL}/api/gallery/adventure/${adventureId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!adventureResponse.ok) {
    throw new Error(`Adventure not found: ${adventureId}`);
  }
  
  const adventure = await adventureResponse.json();
  console.log(`🏰 Found adventure: ${adventure.title}`);
  
  // Export to PDF
  console.log(`🔄 Calling PDF export service...`);
  const exportResponse = await fetch(`${SERVER_URL}/api/export/pdf/${adventureId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!exportResponse.ok) {
    const error = await exportResponse.text();
    throw new Error(`PDF export failed: ${error}`);
  }
  
  // Save the PDF
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeTitle = adventure.title.replace(/[^a-zA-Z0-9]/g, '_');
  const pdfName = `adventure_${safeTitle}_${timestamp}.pdf`;
  const pdfPath = path.join(ARTIFACTS_DIR, pdfName);
  
  const buffer = await exportResponse.buffer();
  fs.writeFileSync(pdfPath, buffer);
  
  console.log(`✅ PDF exported successfully!`);
  console.log(`📄 Title: ${adventure.title}`);
  console.log(`📊 PDF size: ${(buffer.length / 1024).toFixed(1)} KB`);
  console.log(`📁 Artifact saved: ${pdfPath}`);
  
  return {
    adventureId,
    title: adventure.title,
    pdfPath,
    pdfSize: buffer.length,
    timestamp
  };
}

// CLI execution
if (process.argv.length < 3) {
  console.log('Usage: node export_pdf_for_adventure.js <adventure-id>');
  console.log('');
  console.log('You can get adventure IDs from:');
  console.log('  - Running gen_adventure_from_spec.js first');
  console.log('  - Checking .kiro/artifacts/ for previous adventure JSON files');
  process.exit(1);
}

const adventureId = process.argv[2];
exportAdventureToPDF(adventureId).catch(console.error);