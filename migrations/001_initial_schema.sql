-- Migration: Initial Schema for Arcanum Scribe
-- This creates all necessary tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    credits_remaining INTEGER DEFAULT 10,
    monthly_generations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invite Codes
CREATE TABLE IF NOT EXISTS invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    created_by UUID REFERENCES profiles(id),
    used_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Adventures
CREATE TABLE IF NOT EXISTS adventures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    game_system VARCHAR(50) DEFAULT 'dnd5e',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LLM Providers
CREATE TABLE IF NOT EXISTS llm_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    provider_type VARCHAR(50) NOT NULL,
    base_url VARCHAR(255),
    api_key_env VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LLM Models
CREATE TABLE IF NOT EXISTS llm_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES llm_providers(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    max_tokens INTEGER,
    temperature DECIMAL(3,2) DEFAULT 0.8,
    is_active BOOLEAN DEFAULT true,
    cost_per_1k_tokens DECIMAL(10,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider_id, model_name)
);

-- Image Providers
CREATE TABLE IF NOT EXISTS image_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    provider_type VARCHAR(50) NOT NULL,
    base_url VARCHAR(255),
    api_key_env VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Image Models
CREATE TABLE IF NOT EXISTS image_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES image_providers(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    image_size VARCHAR(20) DEFAULT '1024x1024',
    quality VARCHAR(20) DEFAULT 'high',
    is_active BOOLEAN DEFAULT true,
    cost_per_image DECIMAL(10,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider_id, model_name)
);

-- System Configuration
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_used_by ON invite_codes(used_by);
CREATE INDEX IF NOT EXISTS idx_adventures_user_id ON adventures(user_id);
CREATE INDEX IF NOT EXISTS idx_adventures_created_at ON adventures(created_at);
CREATE INDEX IF NOT EXISTS idx_llm_providers_active ON llm_providers(is_active);
CREATE INDEX IF NOT EXISTS idx_llm_providers_priority ON llm_providers(priority);
CREATE INDEX IF NOT EXISTS idx_llm_models_active ON llm_models(is_active);
CREATE INDEX IF NOT EXISTS idx_llm_models_provider ON llm_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_image_providers_active ON image_providers(is_active);
CREATE INDEX IF NOT EXISTS idx_image_providers_priority ON image_providers(priority);
CREATE INDEX IF NOT EXISTS idx_image_models_active ON image_models(is_active);
CREATE INDEX IF NOT EXISTS idx_image_models_provider ON image_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);

-- Insert default data
INSERT INTO llm_providers (name, provider_type, base_url, api_key_env, priority) VALUES
('OpenRouter', 'openrouter', 'https://openrouter.ai/api/v1', 'OPENROUTER_API_KEY', 1),
('OpenAI', 'openai', 'https://api.openai.com/v1', 'OPENAI_API_KEY', 2),
('Anthropic', 'anthropic', 'https://api.anthropic.com', 'ANTHROPIC_API_KEY', 3),
('Google Gemini', 'google', 'https://generativelanguage.googleapis.com', 'GOOGLE_API_KEY', 4)
ON CONFLICT (name) DO NOTHING;

INSERT INTO image_providers (name, provider_type, base_url, api_key_env, priority) VALUES
('Fal.ai', 'fal_ai', 'https://fal.run', 'FAL_API_KEY', 1),
('OpenAI DALL-E', 'openai', 'https://api.openai.com/v1', 'OPENAI_API_KEY', 2),
('Stability AI', 'stability', 'https://api.stability.ai', 'STABILITY_API_KEY', 3)
ON CONFLICT (name) DO NOTHING;

-- Insert default system configuration
INSERT INTO system_config (key, value, description) VALUES
('default_llm_provider', '"OpenRouter"', 'Default LLM provider for text generation'),
('default_llm_model', '"google/gemini-2.5-flash"', 'Default LLM model for text generation'),
('default_image_provider', '"Fal.ai"', 'Default image generation provider'),
('default_image_model', '"fal-ai/flux-dev"', 'Default image generation model'),
('fallback_llm_provider', '"OpenAI"', 'Fallback LLM provider if primary fails'),
('fallback_image_provider', '"OpenAI DALL-E"', 'Fallback image provider if primary fails'),
('max_retries', '3', 'Maximum retry attempts for API calls'),
('timeout_seconds', '30', 'Timeout for API calls in seconds')
ON CONFLICT (key) DO NOTHING; 