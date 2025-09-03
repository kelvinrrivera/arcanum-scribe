import { z } from 'zod';

export const AdventureSceneSchema = z.object({
  title: z.string().min(1, 'Scene title is required'),
  description: z.string().min(10, 'Scene description must be at least 10 characters'),
  objectives: z.array(z.string()).min(1, 'At least one objective is required'),
  challenges: z.array(z.string()).optional(),
  rewards: z.array(z.string()).optional(),
  location: z.string().optional(),
  npcs: z.array(z.string()).optional(),
  monsters: z.array(z.string()).optional()
});

export const AdventureMonsterSchema = z.object({
  name: z.string().min(1, 'Monster name is required'),
  type: z.string().min(1, 'Monster type is required'),
  challengeRating: z.string().min(1, 'Challenge rating is required'),
  description: z.string().min(10, 'Monster description must be at least 10 characters'),
  abilities: z.array(z.string()).optional(),
  tactics: z.string().optional()
});

export const AdventureMagicItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  type: z.string().min(1, 'Item type is required'),
  rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact']),
  description: z.string().min(10, 'Item description must be at least 10 characters'),
  properties: z.array(z.string()).optional(),
  attunement: z.boolean().optional()
});

export const AdventureNPCSchema = z.object({
  name: z.string().min(1, 'NPC name is required'),
  role: z.string().min(1, 'NPC role is required'),
  description: z.string().min(10, 'NPC description must be at least 10 characters'),
  personality: z.string().optional(),
  motivation: z.string().optional(),
  secrets: z.array(z.string()).optional()
});

export const AdventureSchema = z.object({
  title: z.string().min(1, 'Adventure title is required'),
  gameSystem: z.string().min(1, 'Game system is required'),
  recommendedLevel: z.string().min(1, 'Recommended level is required'),
  partySize: z.string().min(1, 'Party size is required'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required'),
  summary: z.string().min(20, 'Adventure summary must be at least 20 characters'),
  theme: z.string().optional(),
  tone: z.string().optional(),
  scenes: z.array(AdventureSceneSchema).min(1, 'At least one scene is required'),
  monsters: z.array(AdventureMonsterSchema).optional(),
  magicItems: z.array(AdventureMagicItemSchema).optional(),
  npcs: z.array(AdventureNPCSchema).optional(),
  hooks: z.array(z.string()).optional(),
  rewards: z.array(z.string()).optional(),
  notes: z.string().optional()
});

export const CharacterSchema = z.object({
  name: z.string().min(1, 'Character name is required'),
  class: z.string().min(1, 'Character class is required'),
  race: z.string().min(1, 'Character race is required'),
  level: z.number().int().min(1).max(20),
  background: z.string().optional(),
  alignment: z.string().optional(),
  stats: z.object({
    strength: z.number().int().min(3).max(20).optional(),
    dexterity: z.number().int().min(3).max(20).optional(),
    constitution: z.number().int().min(3).max(20).optional(),
    intelligence: z.number().int().min(3).max(20).optional(),
    wisdom: z.number().int().min(3).max(20).optional(),
    charisma: z.number().int().min(3).max(20).optional()
  }).optional(),
  equipment: z.array(z.string()).optional(),
  spells: z.array(z.string()).optional(),
  personality: z.string().optional()
});

export type Adventure = z.infer<typeof AdventureSchema>;
export type AdventureScene = z.infer<typeof AdventureSceneSchema>;
export type AdventureMonster = z.infer<typeof AdventureMonsterSchema>;
export type AdventureMagicItem = z.infer<typeof AdventureMagicItemSchema>;
export type AdventureNPC = z.infer<typeof AdventureNPCSchema>;
export type Character = z.infer<typeof CharacterSchema>;