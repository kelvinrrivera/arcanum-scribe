import { Pool } from 'pg';
import AdminService from '../server/admin-service';
import dotenv from 'dotenv';

dotenv.config();

async function initializeAdminTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adminService = new AdminService(pool);

  try {
    console.log('🔧 Initializing admin database tables...');
    
    await adminService.initializeTables();
    
    console.log('✅ Admin tables initialized successfully!');
    
    // Insert default providers if they don't exist
    const existingProviders = await adminService.getLLMProviders();
    
    if (existingProviders.length === 0) {
      console.log('📦 Adding default providers...');
      
      // Add OpenRouter provider
      await adminService.createLLMProvider({
        name: 'OpenRouter',
        provider_type: 'openrouter',
        base_url: 'https://openrouter.ai/api/v1',
        api_key_env: 'OPENROUTER_API_KEY',
        is_active: true,
        priority: 1,
        config: {
          site_url: 'https://arcanumscribe.com',
          app_name: 'Arcanum Scribe'
        }
      });
      
      // Add OpenAI provider
      await adminService.createLLMProvider({
        name: 'OpenAI',
        provider_type: 'openai',
        base_url: 'https://api.openai.com/v1',
        api_key_env: 'OPENAI_API_KEY',
        is_active: false,
        priority: 2,
        config: {}
      });
      
      console.log('✅ Default providers added!');
    }
    
    // Add default models if they don't exist
    const existingModels = await adminService.getLLMModels();
    const providers = await adminService.getLLMProviders();
    const openrouterProvider = providers.find(p => p.provider_type === 'openrouter');
    
    if (existingModels.length === 0 && openrouterProvider) {
      console.log('🤖 Adding default models...');
      
      const defaultModels = [
        {
          provider_id: openrouterProvider.id,
          model_name: 'anthropic/claude-3.5-sonnet',
          display_name: 'Claude 3.5 Sonnet',
          model_type: 'chat' as const,
          max_tokens: 4096,
          temperature: 0.7,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          is_active: true,
          cost_per_1k_tokens: 0.003,
          context_window: 200000,
          supports_functions: true,
          supports_vision: true
        },
        {
          provider_id: openrouterProvider.id,
          model_name: 'openai/gpt-4-turbo-preview',
          display_name: 'GPT-4 Turbo',
          model_type: 'chat' as const,
          max_tokens: 4096,
          temperature: 0.7,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          is_active: true,
          cost_per_1k_tokens: 0.01,
          context_window: 128000,
          supports_functions: true,
          supports_vision: true
        },
        {
          provider_id: openrouterProvider.id,
          model_name: 'meta-llama/llama-3.1-70b-instruct',
          display_name: 'Llama 3.1 70B',
          model_type: 'chat' as const,
          max_tokens: 4096,
          temperature: 0.7,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          is_active: false,
          cost_per_1k_tokens: 0.0004,
          context_window: 131072,
          supports_functions: false,
          supports_vision: false
        }
      ];
      
      for (const model of defaultModels) {
        await adminService.createLLMModel(model);
      }
      
      console.log('✅ Default models added!');
    }
    
    // Add default image providers
    const existingImageProviders = await adminService.getImageProviders();
    
    if (existingImageProviders.length === 0) {
      console.log('🎨 Adding default image providers...');
      
      await adminService.createImageProvider({
        name: 'Fal.ai',
        provider_type: 'fal',
        base_url: 'https://fal.run',
        api_key_env: 'FAL_API_KEY',
        is_active: true,
        priority: 1,
        config: {}
      });
      
      console.log('✅ Default image providers added!');
    }
    
    // Add default image models
    const existingImageModels = await adminService.getImageModels();
    const imageProviders = await adminService.getImageProviders();
    const falProvider = imageProviders.find(p => p.provider_type === 'fal');
    
    if (existingImageModels.length === 0 && falProvider) {
      console.log('🖼️ Adding default image models...');
      
      const defaultImageModels = [
        {
          provider_id: falProvider.id,
          model_name: 'fal-ai/flux-pro',
          display_name: 'Flux Pro',
          image_size: '1024x1024',
          quality: 'hd' as const,
          style: 'photorealistic',
          is_active: true, // Flux como modelo activo por defecto
          cost_per_image: 0.055,
          max_batch_size: 1,
          supports_negative_prompt: true,
          supports_controlnet: false
        },
        {
          provider_id: falProvider.id,
          model_name: 'fal-ai/stable-diffusion-xl',
          display_name: 'Stable Diffusion XL',
          image_size: '1024x1024',
          quality: 'hd' as const,
          style: 'artistic',
          is_active: false, // SDXL como modelo inactivo inicialmente
          cost_per_image: 0.025,
          max_batch_size: 4,
          supports_negative_prompt: true,
          supports_controlnet: true
        },
        {
          provider_id: falProvider.id,
          model_name: 'fal-ai/flux-schnell',
          display_name: 'Flux Schnell',
          image_size: '1024x1024',
          quality: 'standard' as const,
          style: 'fast',
          is_active: false,
          cost_per_image: 0.003,
          max_batch_size: 1,
          supports_negative_prompt: false,
          supports_controlnet: false
        }
      ];
      
      for (const model of defaultImageModels) {
        await adminService.createImageModel(model);
      }
      
      console.log('✅ Default image models added!');
    }
    
    console.log('🎉 Admin system initialization completed!');
    
  } catch (error) {
    console.error('❌ Error initializing admin tables:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
initializeAdminTables();

export default initializeAdminTables;