BEGIN;

-- Deactivate OpenRouter as it's not handled by LLMServiceV2
UPDATE llm_providers SET is_active = false WHERE provider_type = 'openrouter';

-- Activate native Vercel AI SDK providers
UPDATE llm_providers SET is_active = true, priority = 1 WHERE provider_type = 'openai';
UPDATE llm_providers SET is_active = true, priority = 2 WHERE provider_type = 'google';

-- Update model names to be native (without prefixes)
UPDATE llm_models SET model_name = 'gpt-5-mini' WHERE model_name = 'openai/gpt-5-mini';
UPDATE llm_models SET model_name = 'gemini-2.5-flash' WHERE model_name = 'google/gemini-2.5-flash';

-- Models are now configured with native names

COMMIT;
