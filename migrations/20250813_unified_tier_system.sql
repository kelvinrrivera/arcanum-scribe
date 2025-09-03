-- Migration: Unified Tier System Implementation
-- This migration implements the three-tier system with gallery and privacy features

-- Tier Configuration Table
CREATE TABLE IF NOT EXISTS tier_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(20) NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    generations_per_month INTEGER NOT NULL DEFAULT 0,
    private_adventures_per_month INTEGER NOT NULL DEFAULT 0,
    priority_queue BOOLEAN DEFAULT false,
    advanced_exports BOOLEAN DEFAULT false,
    analytics_access BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tier configurations
INSERT INTO tier_configs (name, display_name, price_monthly, generations_per_month, private_adventures_per_month, priority_queue, advanced_exports, analytics_access) VALUES
('explorer', 'Explorer', 0.00, 0, 0, false, false, false),
('creator', 'Creator', 12.00, 15, 3, false, false, true),
('master', 'Master', 25.00, 50, 999, true, true, true)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    price_monthly = EXCLUDED.price_monthly,
    generations_per_month = EXCLUDED.generations_per_month,
    private_adventures_per_month = EXCLUDED.private_adventures_per_month,
    priority_queue = EXCLUDED.priority_queue,
    advanced_exports = EXCLUDED.advanced_exports,
    analytics_access = EXCLUDED.analytics_access;

-- Add tier and usage tracking to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tier_name VARCHAR(20) DEFAULT 'explorer' REFERENCES tier_configs(name),
ADD COLUMN IF NOT EXISTS generations_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_adventures_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- Update existing users to explorer tier
UPDATE profiles SET tier_name = 'explorer' WHERE tier_name IS NULL;

-- Add privacy and stats to adventures
ALTER TABLE adventures 
ADD COLUMN IF NOT EXISTS privacy VARCHAR(10) DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_sum INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Adventure ratings table
CREATE TABLE IF NOT EXISTS adventure_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(adventure_id, user_id)
);

-- Adventure favorites table
CREATE TABLE IF NOT EXISTS adventure_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(adventure_id, user_id)
);

-- Adventure views tracking
CREATE TABLE IF NOT EXISTS adventure_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventure downloads tracking
CREATE TABLE IF NOT EXISTS adventure_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    download_format VARCHAR(20) DEFAULT 'pdf',
    ip_address INET,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription history table
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tier_name VARCHAR(20) REFERENCES tier_configs(name),
    action VARCHAR(20) NOT NULL CHECK (action IN ('upgrade', 'downgrade', 'cancel', 'reactivate')),
    previous_tier VARCHAR(20),
    stripe_event_id VARCHAR(255),
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_tier_name ON profiles(tier_name);
CREATE INDEX IF NOT EXISTS idx_profiles_usage_period ON profiles(usage_period_start);
CREATE INDEX IF NOT EXISTS idx_adventures_privacy ON adventures(privacy);
CREATE INDEX IF NOT EXISTS idx_adventures_created_at ON adventures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adventures_rating ON adventures((rating_sum::float / NULLIF(rating_count, 0)) DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_adventures_view_count ON adventures(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_adventures_download_count ON adventures(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_adventures_featured ON adventures(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_adventures_tags ON adventures USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_adventures_user_privacy ON adventures(user_id, privacy);
CREATE INDEX IF NOT EXISTS idx_adventure_ratings_adventure ON adventure_ratings(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_favorites_user ON adventure_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_adventure_views_adventure ON adventure_views(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_downloads_adventure ON adventure_downloads(adventure_id);

-- Function to calculate average rating
CREATE OR REPLACE FUNCTION calculate_adventure_rating(adventure_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
        FROM adventure_ratings 
        WHERE adventure_id = adventure_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update adventure stats
CREATE OR REPLACE FUNCTION update_adventure_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update rating stats
        UPDATE adventures 
        SET 
            rating_sum = rating_sum + NEW.rating,
            rating_count = rating_count + 1
        WHERE id = NEW.adventure_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update rating stats
        UPDATE adventures 
        SET 
            rating_sum = rating_sum - OLD.rating + NEW.rating
        WHERE id = NEW.adventure_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update rating stats
        UPDATE adventures 
        SET 
            rating_sum = rating_sum - OLD.rating,
            rating_count = rating_count - 1
        WHERE id = OLD.adventure_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic stats updates
DROP TRIGGER IF EXISTS trigger_update_adventure_rating_stats ON adventure_ratings;
CREATE TRIGGER trigger_update_adventure_rating_stats
    AFTER INSERT OR UPDATE OR DELETE ON adventure_ratings
    FOR EACH ROW EXECUTE FUNCTION update_adventure_stats();

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET 
        generations_used = 0,
        private_adventures_used = 0,
        usage_period_start = NOW()
    WHERE usage_period_start < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Create a view for public adventures with stats
CREATE OR REPLACE VIEW public_adventures_with_stats AS
SELECT 
    a.*,
    p.display_name as creator_name,
    p.tier_name as creator_tier,
    COALESCE(ROUND((a.rating_sum::float / NULLIF(a.rating_count, 0))::numeric, 2), 0) as average_rating,
    EXISTS(SELECT 1 FROM adventure_favorites af WHERE af.adventure_id = a.id) as is_favorited
FROM adventures a
JOIN profiles p ON a.user_id = p.id
WHERE a.privacy = 'public'
ORDER BY a.created_at DESC;