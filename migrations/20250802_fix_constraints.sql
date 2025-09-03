-- Migration: Add constraints for image columns
-- Date: 2025-08-02

-- Add constraints (PostgreSQL doesn't support IF NOT EXISTS for constraints)
DO $$
BEGIN
    -- Add constraint for adventures.regenerations_used if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_regenerations_used' 
        AND table_name = 'adventures'
    ) THEN
        ALTER TABLE adventures ADD CONSTRAINT check_regenerations_used CHECK (regenerations_used >= 0);
    END IF;

    -- Add constraint for profiles.image_regenerations_used if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_image_regenerations_used' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT check_image_regenerations_used CHECK (image_regenerations_used >= 0);
    END IF;
END $$; 