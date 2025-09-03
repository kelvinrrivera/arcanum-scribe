-- Add image-related columns to adventures table
ALTER TABLE adventures 
ADD COLUMN IF NOT EXISTS image_urls TEXT[],
ADD COLUMN IF NOT EXISTS image_generation_cost DECIMAL(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS regenerations_used INTEGER DEFAULT 0;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_adventures_image_urls ON adventures USING GIN (image_urls);

-- Update profiles table to add image regeneration tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS image_regenerations_used INTEGER DEFAULT 0;

-- Add constraint to ensure regenerations_used is non-negative
ALTER TABLE adventures 
ADD CONSTRAINT check_regenerations_used CHECK (regenerations_used >= 0);

ALTER TABLE profiles 
ADD CONSTRAINT check_image_regenerations_used CHECK (image_regenerations_used >= 0); 