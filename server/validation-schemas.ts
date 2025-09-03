import { z } from 'zod';

// Base schemas
export const GameSystemSchema = z.enum(['dnd5e', 'pathfinder2e', 'dnd35', 'generic']);

export const PromptSchema = z.string()
  .min(10, 'Prompt must be at least 10 characters')
  .max(2000, 'Prompt must be less than 2000 characters')
  .trim();

// Monster generation schema
export const MonsterGenerationSchema = z.object({
  prompt: PromptSchema,
  gameSystem: GameSystemSchema.default('dnd5e'),
  challengeRating: z.string().optional()
});

// NPC generation schema
export const NPCGenerationSchema = z.object({
  prompt: PromptSchema,
  gameSystem: GameSystemSchema.default('dnd5e'),
  npcRole: z.string().optional()
});

// Magic Item generation schema
export const MagicItemGenerationSchema = z.object({
  prompt: PromptSchema,
  gameSystem: GameSystemSchema.default('dnd5e'),
  rarity: z.enum(['common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact']).optional()
});

// Puzzle generation schema
export const PuzzleGenerationSchema = z.object({
  prompt: PromptSchema,
  gameSystem: GameSystemSchema.default('dnd5e'),
  difficulty: z.enum(['trivial', 'easy', 'medium', 'hard', 'very_hard', 'nearly_impossible']).optional()
});

// Adventure generation schema (existing)
export const AdventureGenerationSchema = z.object({
  prompt: PromptSchema,
  gameSystem: GameSystemSchema.default('dnd5e'),
  privacy: z.enum(['public', 'private']).default('public'),
  playerLevel: z.number().min(1).max(20).optional(),
  partySize: z.number().min(1).max(8).optional(),
  duration: z.string().optional(),
  tone: z.string().optional(),
  setting: z.string().optional(),
  themes: z.array(z.string()).optional(),
  professionalMode: z.object({
    enabled: z.boolean().default(true),
    features: z.object({
      enhancedNPCs: z.boolean().default(true),
      multiSolutionPuzzles: z.boolean().default(true),
      tacticalCombat: z.boolean().default(true),
      professionalLayout: z.boolean().default(true),
      editorialExcellence: z.boolean().default(true),
      accessibilityFeatures: z.boolean().default(true)
    }).optional()
  }).optional()
});

// Auth schemas
export const SignInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const SignUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(2, 'Username must be at least 2 characters').max(50, 'Username too long')
});

// Admin schemas
export const CreateLLMProviderSchema = z.object({
  name: z.string().min(1).max(100),
  provider_type: z.enum(['openrouter', 'openai', 'anthropic', 'custom']),
  base_url: z.string().url(),
  api_key_env: z.string().min(1),
  is_active: z.boolean().default(true),
  priority: z.number().min(0).max(100).default(50),
  config: z.record(z.any()).default({})
});

export const CreateLLMModelSchema = z.object({
  provider_id: z.string().uuid(),
  model_name: z.string().min(1),
  display_name: z.string().min(1),
  model_type: z.enum(['chat', 'completion', 'instruct']).default('chat'),
  max_tokens: z.number().min(1).max(200000).default(4096),
  temperature: z.number().min(0).max(2).default(0.7),
  top_p: z.number().min(0).max(1).default(1),
  frequency_penalty: z.number().min(-2).max(2).default(0),
  presence_penalty: z.number().min(-2).max(2).default(0),
  is_active: z.boolean().default(true),
  cost_per_1m_tokens: z.number().min(0).default(0),
  context_window: z.number().min(1).default(4096),
  supports_functions: z.boolean().default(false),
  supports_vision: z.boolean().default(false)
});

// Validation middleware
export function validateRequest(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

// Rate limiting configs
export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  generation: { windowMs: 60 * 1000, max: 10 }, // 10 generations per minute
  admin: { windowMs: 60 * 1000, max: 100 }, // 100 admin actions per minute
  default: { windowMs: 15 * 60 * 1000, max: 100 } // 100 requests per 15 minutes
};