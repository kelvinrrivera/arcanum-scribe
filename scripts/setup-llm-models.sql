-- Setup LLM Models for Divine Inspiration
-- This script inserts the necessary LLM models for the system to work

-- Insert OpenRouter models (primary provider)
INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, cost_per_1k_tokens) 
SELECT 
    lp.id,
    'google/gemini-2.5-flash',
    'Google Gemini 2.5 Flash',
    'chat',
    8192,
    0.8,
    0.0005
FROM llm_providers lp 
WHERE lp.name = 'OpenRouter'
ON CONFLICT (provider_id, model_name) DO NOTHING;

INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, cost_per_1k_tokens) 
SELECT 
    lp.id,
    'anthropic/claude-3.5-sonnet',
    'Claude 3.5 Sonnet',
    'chat',
    8192,
    0.8,
    0.003
FROM llm_providers lp 
WHERE lp.name = 'OpenRouter'
ON CONFLICT (provider_id, model_name) DO NOTHING;

INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, cost_per_1k_tokens) 
SELECT 
    lp.id,
    'openai/gpt-4o-mini',
    'GPT-4o Mini',
    'chat',
    4096,
    0.8,
    0.0002
FROM llm_providers lp 
WHERE lp.name = 'OpenRouter'
ON CONFLICT (provider_id, model_name) DO NOTHING;

-- Insert OpenAI models (fallback provider)
INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, cost_per_1k_tokens) 
SELECT 
    lp.id,
    'gpt-4o-mini',
    'GPT-4o Mini',
    'chat',
    4096,
    0.8,
    0.0002
FROM llm_providers lp 
WHERE lp.name = 'OpenAI'
ON CONFLICT (provider_id, model_name) DO NOTHING;

INSERT INTO llm_models (provider_id, model_name, display_name, model_type, max_tokens, temperature, cost_per_1k_tokens) 
SELECT 
    lp.id,
    'gpt-3.5-turbo',
    'GPT-3.5 Turbo',
    'chat',
    4096,
    0.8,
    0.0001
FROM llm_providers lp 
WHERE lp.name = 'OpenAI'
ON CONFLICT (provider_id, model_name) DO NOTHING;

-- Insert Image Models for Fal.ai
INSERT INTO image_models (provider_id, model_name, display_name, image_size, quality, cost_per_image) 
SELECT 
    ip.id,
    'fal-ai/flux-dev',
    'Flux Dev',
    '1024x1024',
    'high',
    0.025
FROM image_providers ip 
WHERE ip.name = 'Fal.ai'
ON CONFLICT (provider_id, model_name) DO NOTHING;

INSERT INTO image_models (provider_id, model_name, display_name, image_size, quality, cost_per_image) 
SELECT 
    ip.id,
    'fal-ai/flux-schnell',
    'Flux Schnell',
    '1024x1024',
    'standard',
    0.015
FROM image_providers ip 
WHERE ip.name = 'Fal.ai'
ON CONFLICT (provider_id, model_name) DO NOTHING;

-- Insert OpenAI DALL-E models (fallback)
INSERT INTO image_models (provider_id, model_name, display_name, image_size, quality, cost_per_image) 
SELECT 
    ip.id,
    'dall-e-3',
    'DALL-E 3',
    '1024x1024',
    'high',
    0.040
FROM image_providers ip 
WHERE ip.name = 'OpenAI DALL-E'
ON CONFLICT (provider_id, model_name) DO NOTHING;

-- Verify the setup
SELECT 
    lp.name as provider_name,
    lm.model_name,
    lm.display_name,
    lm.is_active
FROM llm_models lm
JOIN llm_providers lp ON lm.provider_id = lp.id
WHERE lp.is_active = true AND lm.is_active = true
ORDER BY lp.priority, lm.cost_per_1k_tokens;