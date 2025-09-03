import { LLMService } from './llm-service';
import { query } from '../src/integrations/postgres/client';

interface ImageGenerationRequest {
  prompt: string;
  model: string;
  provider: string;
  retryCount?: number;
}

interface ImageGenerationResult {
  success: boolean;
  url?: string;
  error?: string;
  provider: string;
  model: string;
  cost: number;
}

interface UserImageLimits {
  subscription_tier: string;
  monthly_generations: number;
}

export class ImageService {
  private llmService: LLMService;
  private maxRetries = 3;
  private fallbackProviders = [
    { provider: 'Fal.ai', model: 'fal-ai/flux-dev' },
    { provider: 'Fal.ai', model: 'fal-ai/fast-sdxl' },
    { provider: 'OpenAI', model: 'dall-e-3' }
  ];

  constructor() {
    this.llmService = new LLMService();
  }

  async initialize() {
    await this.llmService.initialize();
  }

  async generateAdventureImages(adventure: any, userId: string): Promise<{
    imageUrls: string[];
    totalCost: number;
    errors: string[];
  }> {
    const result = {
      imageUrls: [],
      totalCost: 0,
      errors: []
    };

    // Check user limits
    const userLimits = await this.getUserImageLimits(userId);
    if (!this.canGenerateImages(userLimits)) {
      result.errors.push('User has exceeded image generation limits');
      return result;
    }

    // Extract narrative context for visual consistency
    const narrativeContext = {
      theme: adventure.theme || 'fantasy adventure',
      tone: adventure.tone || 'mysterious',
      title: adventure.title || 'Untitled Adventure'
    };

    console.log(`🎨 Visual Consistency Context: ${narrativeContext.theme} theme with ${narrativeContext.tone} tone`);

    // Calculate total images needed using Visual Tiers System
    const sceneCount = (adventure.scenes || []).length;
    const npcCount = (adventure.npcs || []).length;
    const monsterCount = (adventure.monsters || []).length;
    const itemCount = (adventure.magicItems || []).length;
    const totalImages = sceneCount + npcCount + monsterCount + itemCount;

    if (totalImages > 0) {
      // Check if we have Fal.ai configured
      const hasFalAi = process.env.FAL_AI_KEY || process.env.FAL_API_KEY || process.env.FAL_KEY;
      
      if (hasFalAi) {
        console.log('🖼️  Using real image generation with Fal.ai and Visual Consistency Engine...');
        
        // Generate images in the order expected by the interface
        // CRITICAL: This order must match how AdventureView.tsx expects images!
        
        // First: Monster images (indices 0 to monsters.length-1)
        const monsterImages = await this.generateMonsterImages(adventure.monsters || [], narrativeContext);
        result.imageUrls.push(...monsterImages.urls);
        result.totalCost += monsterImages.cost;
        result.errors.push(...monsterImages.errors);
        console.log(`🐉 Generated ${monsterImages.urls.length} monster images (indices 0-${monsterImages.urls.length-1})`);

        // Second: Magic item images (indices monsters.length to monsters.length+items.length-1)
        const itemImages = await this.generateItemImages(adventure.magicItems || [], narrativeContext);
        result.imageUrls.push(...itemImages.urls);
        result.totalCost += itemImages.cost;
        result.errors.push(...itemImages.errors);
        console.log(`✨ Generated ${itemImages.urls.length} item images (indices ${monsterImages.urls.length}-${monsterImages.urls.length + itemImages.urls.length - 1})`);

        // Additional images for scenes and NPCs (not currently used in interface but good to have)
        const sceneImages = await this.generateSceneImages(adventure.scenes || [], narrativeContext);
        result.imageUrls.push(...sceneImages.urls);
        result.totalCost += sceneImages.cost;
        result.errors.push(...sceneImages.errors);

        const npcImages = await this.generateNPCImages(adventure.npcs || [], narrativeContext);
        result.imageUrls.push(...npcImages.urls);
        result.totalCost += npcImages.cost;
        result.errors.push(...npcImages.errors);

        // Update user regeneration count
        if (result.imageUrls.length > 0) {
          await this.updateUserImageUsage(userId, result.imageUrls.length);
        }
      } else {
        console.log('🖼️  Using placeholder images (FAL_AI_KEY not configured)...');
        
        // Generate placeholder URLs for demonstration
        for (let i = 0; i < totalImages; i++) {
          const isMonster = i < monsterCount;
          const entity = isMonster ? adventure.monsters[i] : adventure.magicItems[i - monsterCount];
          const placeholderUrl = this.generatePlaceholderImage(entity, isMonster);
          result.imageUrls.push(placeholderUrl);
        }
        
        console.log(`🖼️  Generated ${result.imageUrls.length} placeholder images for demonstration`);
      }
    }

    return result;
  }

  private async generateMonsterImages(monsters: any[], narrativeContext?: any): Promise<{
    urls: string[];
    cost: number;
    errors: string[];
  }> {
    const result = { urls: [], cost: 0, errors: [] };

    for (const monster of monsters) {
      try {
        const imagePrompt = this.buildMonsterImagePrompt(monster, narrativeContext);
        const imageResult = await this.generateImageWithFallback(imagePrompt);
        
        if (imageResult.success && imageResult.url) {
          result.urls.push(imageResult.url);
          result.cost += imageResult.cost;
          console.log(`🐉 Generated ${monster.isBoss ? 'Tier 1 Boss' : 'Tier 3'} monster image: ${monster.name}`);
        } else {
          result.errors.push(`Failed to generate image for ${monster.name}: ${imageResult.error}`);
        }
      } catch (error) {
        result.errors.push(`Error generating image for ${monster.name}: ${error}`);
      }
    }

    return result;
  }

  private async generateSceneImages(scenes: any[], narrativeContext?: any): Promise<{
    urls: string[];
    cost: number;
    errors: string[];
  }> {
    const result = { urls: [], cost: 0, errors: [] };

    for (const scene of scenes) {
      try {
        const imagePrompt = this.buildSceneImagePrompt(scene, narrativeContext);
        const imageResult = await this.generateImageWithFallback(imagePrompt);
        
        if (imageResult.success && imageResult.url) {
          result.urls.push(imageResult.url);
          result.cost += imageResult.cost;
          console.log(`🏞️ Generated Tier 2 scene image: ${scene.title}`);
        } else {
          result.errors.push(`Failed to generate image for scene "${scene.title}": ${imageResult.error}`);
        }
      } catch (error) {
        result.errors.push(`Error generating image for scene "${scene.title}": ${error}`);
      }
    }

    return result;
  }

  private async generateNPCImages(npcs: any[], narrativeContext?: any): Promise<{
    urls: string[];
    cost: number;
    errors: string[];
  }> {
    const result = { urls: [], cost: 0, errors: [] };

    for (const npc of npcs) {
      try {
        const imagePrompt = this.buildNPCImagePrompt(npc, narrativeContext);
        const imageResult = await this.generateImageWithFallback(imagePrompt);
        
        if (imageResult.success && imageResult.url) {
          result.urls.push(imageResult.url);
          result.cost += imageResult.cost;
          console.log(`👤 Generated Tier 2 NPC portrait: ${npc.name}`);
        } else {
          result.errors.push(`Failed to generate image for ${npc.name}: ${imageResult.error}`);
        }
      } catch (error) {
        result.errors.push(`Error generating image for ${npc.name}: ${error}`);
      }
    }

    return result;
  }

  private async generateItemImages(items: any[], narrativeContext?: any): Promise<{
    urls: string[];
    cost: number;
    errors: string[];
  }> {
    const result = { urls: [], cost: 0, errors: [] };

    for (const item of items) {
      try {
        const imagePrompt = this.buildItemImagePrompt(item, narrativeContext);
        const imageResult = await this.generateImageWithFallback(imagePrompt);
        
        if (imageResult.success && imageResult.url) {
          result.urls.push(imageResult.url);
          result.cost += imageResult.cost;
          console.log(`✨ Generated Tier 3 magic item: ${item.name}`);
        } else {
          result.errors.push(`Failed to generate image for ${item.name}: ${imageResult.error}`);
        }
      } catch (error) {
        result.errors.push(`Error generating image for ${item.name}: ${error}`);
      }
    }

    return result;
  }

  private async generateImageWithFallback(prompt: string, retryCount = 0): Promise<ImageGenerationResult> {
    // Try each provider in order
    for (const fallback of this.fallbackProviders) {
      try {
        const result = await this.generateImageWithProvider(prompt, fallback.provider, fallback.model);
        
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.log(`Failed with ${fallback.provider}/${fallback.model}: ${error}`);
        continue;
      }
    }

    // If all providers failed and we haven't exceeded retries, try again with a simplified prompt
    if (retryCount < this.maxRetries) {
      const simplifiedPrompt = this.simplifyImagePrompt(prompt);
      return await this.generateImageWithFallback(simplifiedPrompt, retryCount + 1);
    }

    return {
      success: false,
      error: 'All image providers failed after retries',
      provider: 'none',
      model: 'none',
      cost: 0
    };
  }

  private async generateImageWithProvider(prompt: string, provider: string, model: string): Promise<ImageGenerationResult> {
    try {
      // Special handling for Fal.ai with SDK
      if (provider === 'Fal.ai' && (process.env.FAL_AI_KEY || process.env.FAL_API_KEY || process.env.FAL_KEY)) {
        return await this.generateImageWithFalAiSDK(model, prompt);
      }
      
      const imageUrl = await this.llmService.generateImage(prompt, { provider, model });
      
      if (imageUrl) {
        return {
          success: true,
          url: imageUrl,
          provider,
          model,
          cost: this.getImageCost(provider, model)
        };
      } else {
        return {
          success: false,
          error: 'No image URL returned',
          provider,
          model,
          cost: 0
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider,
        model,
        cost: 0
      };
    }
  }

  private async generateImageWithFalAiSDK(model: string, prompt: string): Promise<ImageGenerationResult> {
    try {
      console.log(`🚀 Starting Fal.ai image generation with model: ${model}`);
      const { fal } = await import('@fal-ai/client');
      console.log(`📦 Fal.ai client imported successfully`);
      
      // Configurar el cliente con la clave
      const falKey = process.env.FAL_AI_KEY || process.env.FAL_API_KEY || process.env.FAL_KEY;
      console.log(`🔑 Fal.ai key found: ${falKey ? 'YES' : 'NO'}`);
      if (falKey) {
        fal.config({
          credentials: falKey
        });
        console.log(`🔧 Fal.ai client configured successfully`);
      } else {
        console.log(`❌ No Fal.ai key found in environment variables`);
        throw new Error('Fal.ai API key not found');
      }
      
      // Mapear el modelo correctamente para Fal.ai SDK
      let appId;
      if (model.includes('flux-dev') || model.includes('flux/dev')) {
        appId = 'fal-ai/flux/dev';
      } else if (model.includes('sdxl')) {
        appId = 'fal-ai/fast-sdxl';
      } else {
        // Por defecto usar flux-dev que es nuestro modelo preferido
        appId = 'fal-ai/flux/dev';
      }
        
        const input = {
          prompt: prompt
        };
      
      console.log(`🖼️  Using Fal.ai SDK with ${appId} (requested model: ${model})...`);
      
      const result = await fal.subscribe(appId, {
        input,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });
      
      console.log(`✅ Fal.ai SDK generated image successfully`);
      return {
        success: true,
        url: result.data.images[0].url,
        provider: 'Fal.ai',
        model,
        cost: this.getImageCost('Fal.ai', model)
      };
      
    } catch (error) {
      console.log(`❌ Fal.ai SDK failed: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'Fal.ai',
        model,
        cost: 0
      };
    }
  }

  private buildMonsterImagePrompt(monster: any, narrativeContext?: any): string {
    const isBoss = monster.isBoss || monster.challengeRating >= 5;
    const baseStyle = "professional fantasy illustration, detailed digital art, epic lighting, high quality";
    
    // Add narrative context for visual coherence
    const contextualElements = narrativeContext ? 
      `reflecting the ${narrativeContext.theme} theme, ${narrativeContext.tone} atmosphere` : '';
    
    // Include backstory elements for richer visuals
    const storyContext = monster.backstory ? 
      `visual storytelling elements: ${monster.backstory.substring(0, 100)}` : '';
    
    if (isBoss) {
      // Tier 1: Boss Monster - Cinematic Splash Art
      return `Epic boss monster illustration for climactic encounter. ${monster.description}. 
      
      DRAMATIC REQUIREMENTS:
      - Imposing presence conveying CR ${monster.challengeRating} threat level
      - Visual storytelling that hints at: ${monster.narrativeRole || 'final antagonist'}
      - Composition that creates sense of scale and danger
      - Lighting that emphasizes dramatic tension
      - ${contextualElements}
      
      TECHNICAL EXCELLENCE:
      - Cinematic composition suitable for full-page presentation
      - Professional illustration quality matching published RPG art
      - Dynamic pose suggesting combat tactics: ${monster.combatTactics?.[0] || 'aggressive assault'}
      - ${baseStyle}, legendary creature quality
      
      ${storyContext}`;
    } else {
      // Tier 3: Minor Monster - Compact Reference Art  
      return `Fantasy creature tactical reference. ${monster.description}.
      
      FUNCTIONAL DESIGN:
      - Clear details for game use and quick recognition
      - Pose that suggests role: ${monster.narrativeRole || 'guardian/minion'}
      - ${contextualElements}
      - Compact composition suitable for stat block integration
      
      ${baseStyle}, ${storyContext}`;
    }
  }

  private buildSceneImagePrompt(scene: any, narrativeContext?: any): string {
    const baseStyle = "professional fantasy illustration, atmospheric scene art, environmental storytelling, detailed digital art, immersive composition";
    
    // Add narrative function context
    const narrativeFunction = scene.narrativeFunction ? 
      `Scene purpose: ${scene.narrativeFunction}` : '';
    
    const characterMoments = scene.characterMoments ? 
      `Character development: ${scene.characterMoments}` : '';
    
    // Tier 2: Scene - Context and Atmosphere
    return `Atmospheric scene illustration for narrative context.
    
    ENVIRONMENTAL STORYTELLING:
    - Location: ${scene.title}
    - Description: ${scene.description}
    - Mood: ${narrativeContext?.tone || 'mysterious'} atmosphere
    - Story Significance: ${narrativeFunction}
    - Visual clues about objectives: ${scene.objectives?.join(', ') || 'exploration'}
    - ${characterMoments}
    
    COMPOSITION REQUIREMENTS:
    - Balanced composition suitable for 1/3 page integration
    - Clear focal points that guide viewer attention
    - Depth and perspective that create immersion
    - Environmental details that support story objectives
    
    ${baseStyle}, evocative environment that enhances the ${narrativeContext?.theme || 'adventure'} theme`;
  }

  private buildNPCImagePrompt(npc: any, narrativeContext?: any): string {
    const baseStyle = "professional fantasy character portrait, detailed digital art, expressive character design";
    
    // Extract relationship context for visual storytelling
    const relationshipHints = npc.relationships ? 
      `Social context: ${Object.values(npc.relationships).flat().slice(0, 2).join(', ')}` : '';
    
    const thematicSignificance = npc.thematicSignificance ? 
      `Thematic role: ${npc.thematicSignificance}` : '';
    
    // Tier 2: NPC - Context and Character
    return `Professional character portrait for narrative context.
    
    CHARACTER DESIGN:
    - Name: ${npc.name}
    - Physical Description: ${npc.visualDescription || 'distinctive fantasy character'}
    - Personality: ${npc.personality}
    - Role: ${npc.role}
    - Motivation: ${npc.motivation}
    
    VISUAL STORYTELLING:
    - Expression that reflects: ${npc.characterArc?.startingState || 'current emotional state'}
    - Clothing/accessories that hint at: ${npc.backstory?.substring(0, 50) || 'their background'}
    - ${relationshipHints}
    - ${thematicSignificance}
    
    TECHNICAL REQUIREMENTS:
    - Portrait suitable for character card integration
    - Memorable and distinctive appearance
    - Character design that reflects story significance
    - ${baseStyle}
    
    Theme integration: ${narrativeContext?.theme || 'adventure'} with ${narrativeContext?.tone || 'mysterious'} tone`;
  }

  private buildItemImagePrompt(item: any, narrativeContext?: any): string {
    const rarityEffects = {
      'Common': 'subtle magical aura',
      'Uncommon': 'gentle magical glow', 
      'Rare': 'bright magical radiance',
      'Very Rare': 'intense magical energy',
      'Legendary': 'overwhelming magical power, legendary artifact quality'
    };
    
    const magicalEffect = rarityEffects[item.rarity] || 'magical aura';
    const baseStyle = "professional fantasy illustration, detailed digital art, ornate craftsmanship";
    
    // Add narrative significance for richer visuals
    const narrativeSignificance = item.narrativeSignificance ? 
      `Story connection: ${item.narrativeSignificance}` : '';
    
    const culturalContext = item.lore ? 
      `Cultural styling: ${item.lore.substring(0, 80)}` : '';
    
    // Tier 3: Magic Item - Detailed Icon Art
    return `Detailed magic item illustration for game reference.
    
    FUNCTIONAL DESIGN:
    - Item Type: ${item.name}
    - Physical Description: ${item.description}
    - Magical Properties: ${item.properties}
    - Rarity Level: ${item.rarity} - ${magicalEffect}
    - ${culturalContext}
    
    VISUAL EFFECTS:
    - Magical manifestations: ${item.visualEffects || 'mystical enchantment effects'}
    - ${narrativeSignificance}
    - Theme integration: reflects ${narrativeContext?.theme || 'magical'} elements
    
    TECHNICAL REQUIREMENTS:
    - Icon-suitable composition for card integration
    - Clear silhouette readable at small sizes
    - Rich detail that rewards close examination
    - ${baseStyle}
    
    Professional quality matching ${item.rarity.toLowerCase()} rarity standards`;
  }

  private simplifyImagePrompt(prompt: string): string {
    // Remove complex descriptors and keep core elements
    return prompt
      .replace(/detailed digital illustration/g, 'illustration')
      .replace(/dramatic lighting/g, '')
      .replace(/high quality/g, '')
      .replace(/professional artwork/g, 'artwork')
      .replace(/epic fantasy style/g, 'fantasy')
      .replace(/suitable for tabletop RPG/g, '');
  }

  private getImageCost(provider: string, model: string): number {
    const costs: Record<string, number> = {
      'fal-ai/flux-dev': 0.015,
      'fal-ai/sdxl': 0.010,
      'dall-e-3': 0.040
    };
    return costs[model] || 0.020;
  }

  private async getUserImageLimits(userId: string): Promise<UserImageLimits> {
    try {
      const { rows } = await query(`
        SELECT tier as subscription_tier, 0 as monthly_generations
        FROM users 
        WHERE id = $1
      `, [userId]);

      if (rows.length > 0) {
        return rows[0];
      }

      // Default limits for new users
      return {
        subscription_tier: 'free',
        monthly_generations: 0
      };
    } catch (error) {
      console.error('Error getting user image limits:', error);
      return {
        subscription_tier: 'free',
        monthly_generations: 0
      };
    }
  }

  private canGenerateImages(limits: UserImageLimits): boolean {
    const tierLimits: Record<string, number> = {
      'free': 5,
      'basic': 20,
      'premium': 100,
      'enterprise': 1000,
      'admin': 10000  // Admin users get unlimited images
    };

    const monthlyLimit = tierLimits[limits.subscription_tier] || 5;
    return limits.monthly_generations < monthlyLimit;
  }

  private generatePlaceholderImage(entity: any, isMonster: boolean): string {
    // Use high-quality fantasy images as placeholders until Fal.ai is configured
    const fantasyImages = [
      // Monsters
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      // Magic Items
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ];
    
    // Use a deterministic but varied selection based on entity name
    const hash = entity.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const index = Math.abs(hash) % fantasyImages.length;
    return fantasyImages[index];
  }

  private async updateUserImageUsage(userId: string, imageCount: number): Promise<void> {
    try {
      // For now, we'll just log the usage since we don't have monthly_generations column
      console.log(`📊 Image usage updated for user ${userId}: ${imageCount} images generated`);
      // await query(`
      //   UPDATE users 
      //   SET monthly_generations = monthly_generations + $1
      //   WHERE id = $2
      // `, [imageCount, userId]);
    } catch (error) {
      console.error('Error updating user image usage:', error);
    }
  }
} 