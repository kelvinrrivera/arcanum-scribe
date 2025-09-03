#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { query } from '../src/integrations/postgres/client';

dotenv.config();

async function addImageColumns() {
  console.log('🔧 Adding image-related columns to adventures table...\n');

  try {
    // Add image_urls column
    console.log('1️⃣ Adding image_urls column...');
    await query(`
      ALTER TABLE adventures 
      ADD COLUMN IF NOT EXISTS image_urls TEXT[]
    `);
    console.log('✅ image_urls column added');

    // Add image_generation_cost column
    console.log('2️⃣ Adding image_generation_cost column...');
    await query(`
      ALTER TABLE adventures 
      ADD COLUMN IF NOT EXISTS image_generation_cost DECIMAL(10,4) DEFAULT 0
    `);
    console.log('✅ image_generation_cost column added');

    // Add regenerations_used column
    console.log('3️⃣ Adding regenerations_used column...');
    await query(`
      ALTER TABLE adventures 
      ADD COLUMN IF NOT EXISTS regenerations_used INTEGER DEFAULT 0
    `);
    console.log('✅ regenerations_used column added');

    // Add image_regenerations_used to profiles table
    console.log('4️⃣ Adding image_regenerations_used to profiles table...');
    await query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS image_regenerations_used INTEGER DEFAULT 0
    `);
    console.log('✅ image_regenerations_used column added to profiles');

    // Add constraints
    console.log('5️⃣ Adding constraints...');
    await query(`
      ALTER TABLE adventures 
      ADD CONSTRAINT IF NOT EXISTS check_regenerations_used CHECK (regenerations_used >= 0)
    `);
    await query(`
      ALTER TABLE profiles 
      ADD CONSTRAINT IF NOT EXISTS check_image_regenerations_used CHECK (image_regenerations_used >= 0)
    `);
    console.log('✅ Constraints added');

    // Create index for better performance
    console.log('6️⃣ Creating index for image_urls...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_adventures_image_urls ON adventures USING GIN (image_urls)
    `);
    console.log('✅ Index created');

    console.log('\n🎉 All image-related columns added successfully!');
    
    // Verify the changes
    console.log('\n📋 Verifying table structure...');
    const { rows: columns } = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'adventures'
      ORDER BY ordinal_position
    `);

    console.log('Adventures table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error adding columns:', error);
  }
}

addImageColumns().catch(console.error); 