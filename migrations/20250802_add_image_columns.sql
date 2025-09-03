-- Migration: Add image-related columns to adventures and profiles tables
-- Date: 2025-08-02

-- Add image_urls column to adventures table
ALTER TABLE adventures 
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Add image_generation_cost column to adventures table
ALTER TABLE adventures 
ADD COLUMN IF NOT EXISTS image_generation_cost DECIMAL(10,4) DEFAULT 0;

-- Add regenerations_used column to adventures table
ALTER TABLE adventures 
ADD COLUMN IF NOT EXISTS regenerations_used INTEGER DEFAULT 0;

-- Add image_regenerations_used to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS image_regenerations_used INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE adventures 
ADD CONSTRAINT IF NOT EXISTS check_regenerations_used CHECK (regenerations_used >= 0);

ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_image_regenerations_used CHECK (image_regenerations_used >= 0);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_adventures_image_urls ON adventures USING GIN (image_urls); 