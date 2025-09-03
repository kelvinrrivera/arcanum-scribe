import { z } from 'zod';

// Schema for user style preferences
const UserStylePreferenceSchema = z.object({
  userId: z.string(),
  preferenceType: z.enum(['narrative', 'visual', 'content', 'generation']),
  category: z.string(),
  preference: z.string(),
  strength: z.number().min(0).max(1), // 0 = weak preference, 1 = strong preference
  confidence: z.number().min(0).max(1), // How confident we are in this preference
  lastUpdated: z.date(),
  sampleSize: z.number(), // Number of interactions this preference is based on
  metadata: z.record(z.any()).optional()
});

const UserPreferenceProfileSchema = z.object({
  userId: z.string(),
  narrativePreferences: z.record(z.number()),
  visualPreferences: z.record(z.number()),
  contentPreferences: z.record(z.number()),
  generationPreferences: z.record(z.number()),
  adaptationLevel: z.enum(['conservative', 'moderate', 'aggressive']),
  lastAnalyzed: z.date(),
  totalInteractions: z.number(),
  preferenceStability: z.number() // How stable the user's preferences are
});

const InteractionDataSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  contentType: z.enum(['adventure', 'npc', 'monster', 'location', 'item', 'image']),
  userAction: z.enum(['generated', 'regenerated', 'rated', 'saved', 'shared', 'deleted']),
  timestamp: z.date(),
  contentAttributes: z.record(z.any()),
  userFeedback: z.object({
    rating: z.number().min(1).max(10).optional(),
    liked: z.boolean().optional(),
    feedback: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional(),
  generationContext: z.object({
    prompt: z.string(),
    parameters: z.record(z.any()),
    model: z.string(),
    tier: z.string()
  }).optional()
});

type UserStylePreference = z.infer<typeof UserStylePreferenceSchema>;
type UserPreferenceProfile = z.infer<typeof UserPreferenceProfileSchema>;
type InteractionData = z.infer<typeof InteractionDataSchema>;

// Preference categories and their possible values
const PREFERENCE_CATEGORIES = {
  narrative: {
    tone: ['dark', 'light', 'serious', 'humorous', 'mysterious', 'heroic', 'gritty'],
    complexity: ['simple', 'moderate', 'complex', 'intricate'],
    pacing: ['fast', 'moderate', 'slow', 'varied'],
    themes: ['redemption', 'betrayal', 'discovery', 'survival', 'politics', 'romance', 'horror'],
    structure: ['linear', 'branching', 'sandbox', 'episodic'],
    characterDepth: ['archetypal', 'nuanced', 'complex', 'psychological']
  },
  visual: {
    artStyle: ['realistic', 'stylized', 'painterly', 'sketch', 'digital', 'traditional'],
    colorPalette: ['vibrant', 'muted', 'monochromatic', 'warm', 'cool', 'high-contrast'],
    composition: ['dynamic', 'balanced', 'dramatic', 'minimalist', 'detailed'],
    lighting: ['dramatic', 'soft', 'harsh', 'atmospheric', 'natural'],
    detailLevel: ['minimal', 'moderate', 'high', 'intricate']
  },
  content: {
    gameSystem: ['dnd5e', 'pathfinder', 'generic', 'custom'],
    difficulty: ['easy', 'moderate', 'hard', 'deadly'],
    length: ['short', 'medium', 'long', 'epic'],
    focus: ['combat', 'roleplay', 'exploration', 'puzzle', 'social'],
    setting: ['fantasy', 'modern', 'scifi', 'horror', 'historical']
  },
  generation: {
    creativity: ['conservative', 'moderate', 'creative', 'experimental'],
    uniqueness: ['familiar', 'fresh', 'unique', 'innovative'],
    detail: ['concise', 'detailed', 'comprehensive', 'exhaustive'],
    practicality: ['theoretical', 'practical', 'actionable', 'ready-to-use']
  }
};

export class UserPreferenceLearning {
  private userProfiles: Map<string, UserPreferenceProfile> = new Map();
  private userInteractions: Map<string, InteractionData[]> = new Map();
  private preferenceWeights: Map<string, Map<string, number>> = new Map();

  /**
   * Record user interaction for preference learning
   */
  async recordInteraction(interaction: Omit<InteractionData, 'timestamp'>): Promise<void> {
    const fullInteraction: InteractionData = {
      ...interaction,
      timestamp: new Date()
    };

    // Store interaction
    const userInteractions = this.userInteractions.get(interaction.userId) || [];
    userInteractions.push(fullInteraction);
    this.userInteractions.set(interaction.userId, userInteractions);

    // Update preferences based on this interaction
    await this.updatePreferencesFromInteraction(fullInteraction);

    // Persist to database
    await this.persistInteraction(fullInteraction);
  }

  /**
   * Analyze user preferences from interaction history
   */
  async analyzeUserPreferences(userId: string): Promise<UserPreferenceProfile> {
    const interactions = this.userInteractions.get(userId) || [];
    
    if (interactions.length === 0) {
      return this.createDefaultProfile(userId);
    }

    const narrativePreferences = this.analyzeNarrativePreferences(interactions);
    const visualPreferences = this.analyzeVisualPreferences(interactions);
    const contentPreferences = this.analyzeContentPreferences(interactions);
    const generationPreferences = this.analyzeGenerationPreferences(interactions);

    const adaptationLevel = this.determineAdaptationLevel(interactions);
    const preferenceStability = this.calculatePreferenceStability(interactions);

    const profile: UserPreferenceProfile = {
      userId,
      narrativePreferences,
      visualPreferences,
      contentPreferences,
      generationPreferences,
      adaptationLevel,
      lastAnalyzed: new Date(),
      totalInteractions: interactions.length,
      preferenceStability
    };

    this.userProfiles.set(userId, profile);
    await this.persistUserProfile(profile);

    return profile;
  }

  /**
   * Get adaptive prompt customization based on user preferences
   */
  async getAdaptivePromptCustomization(
    userId: string,
    basePrompt: string,
    contentType: string
  ): Promise<{
    customizedPrompt: string;
    adaptations: string[];
    confidence: number;
  }> {
    const profile = await this.getUserProfile(userId);
    
    if (!profile || profile.totalInteractions < 5) {
      // Not enough data for meaningful adaptation
      return {
        customizedPrompt: basePrompt,
        adaptations: [],
        confidence: 0
      };
    }

    const adaptations: string[] = [];
    let customizedPrompt = basePrompt;

    // Apply narrative preferences
    const narrativeAdaptations = this.applyNarrativePreferences(
      customizedPrompt, 
      profile.narrativePreferences,
      contentType
    );
    customizedPrompt = narrativeAdaptations.prompt;
    adaptations.push(...narrativeAdaptations.adaptations);

    // Apply visual preferences (for image generation)
    if (contentType.includes('image') || contentType.includes('visual')) {
      const visualAdaptations = this.applyVisualPreferences(
        customizedPrompt,
        profile.visualPreferences
      );
      customizedPrompt = visualAdaptations.prompt;
      adaptations.push(...visualAdaptations.adaptations);
    }

    // Apply content preferences
    const contentAdaptations = this.applyContentPreferences(
      customizedPrompt,
      profile.contentPreferences,
      contentType
    );
    customizedPrompt = contentAdaptations.prompt;
    adaptations.push(...contentAdaptations.adaptations);

    // Apply generation preferences
    const generationAdaptations = this.applyGenerationPreferences(
      customizedPrompt,
      profile.generationPreferences
    );
    customizedPrompt = generationAdaptations.prompt;
    adaptations.push(...generationAdaptations.adaptations);

    // Calculate confidence based on preference stability and sample size
    const confidence = this.calculateAdaptationConfidence(profile, adaptations.length);

    return {
      customizedPrompt,
      adaptations,
      confidence
    };
  }

  /**
   * Generate personalized content recommendations
   */
  async generatePersonalizedRecommendations(userId: string): Promise<{
    recommendedStyles: string[];
    suggestedParameters: Record<string, any>;
    personalizedPrompts: string[];
    confidenceScore: number;
  }> {
    const profile = await this.getUserProfile(userId);
    
    if (!profile) {
      return {
        recommendedStyles: [],
        suggestedParameters: {},
        personalizedPrompts: [],
        confidenceScore: 0
      };
    }

    // Extract top preferences from each category
    const topNarrativePrefs = this.getTopPreferences(profile.narrativePreferences, 3);
    const topVisualPrefs = this.getTopPreferences(profile.visualPreferences, 3);
    const topContentPrefs = this.getTopPreferences(profile.contentPreferences, 3);

    const recommendedStyles = [
      ...topNarrativePrefs.map(p => `narrative-${p}`),
      ...topVisualPrefs.map(p => `visual-${p}`),
      ...topContentPrefs.map(p => `content-${p}`)
    ];

    // Generate suggested parameters based on preferences
    const suggestedParameters = this.generateSuggestedParameters(profile);

    // Create personalized prompt templates
    const personalizedPrompts = this.generatePersonalizedPrompts(profile);

    const confidenceScore = profile.preferenceStability * 
      Math.min(profile.totalInteractions / 50, 1); // Cap at 50 interactions

    return {
      recommendedStyles,
      suggestedParameters,
      personalizedPrompts,
      confidenceScore
    };
  }

  /**
   * Update preferences based on user feedback
   */
  async updatePreferencesFromFeedback(
    userId: string,
    contentId: string,
    feedback: {
      rating?: number;
      liked?: boolean;
      feedback?: string;
      tags?: string[];
    }
  ): Promise<void> {
    const interactions = this.userInteractions.get(userId) || [];
    const contentInteraction = interactions.find(i => i.contentId === contentId);

    if (!contentInteraction) {
      console.warn(`No interaction found for content ${contentId} and user ${userId}`);
      return;
    }

    // Update the interaction with feedback
    contentInteraction.userFeedback = feedback;

    // Re-analyze preferences with updated feedback
    await this.analyzeUserPreferences(userId);
  }

  /**
   * Get learning insights for a user
   */
  async getLearningInsights(userId: string): Promise<{
    totalInteractions: number;
    preferenceStrength: Record<string, number>;
    learningProgress: number;
    adaptationRecommendations: string[];
    preferenceEvolution: Array<{
      category: string;
      trend: 'stable' | 'evolving' | 'exploring';
      confidence: number;
    }>;
  }> {
    const profile = await this.getUserProfile(userId);
    const interactions = this.userInteractions.get(userId) || [];

    if (!profile) {
      return {
        totalInteractions: 0,
        preferenceStrength: {},
        learningProgress: 0,
        adaptationRecommendations: [],
        preferenceEvolution: []
      };
    }

    // Calculate preference strength across categories
    const preferenceStrength = {
      narrative: this.calculateCategoryStrength(profile.narrativePreferences),
      visual: this.calculateCategoryStrength(profile.visualPreferences),
      content: this.calculateCategoryStrength(profile.contentPreferences),
      generation: this.calculateCategoryStrength(profile.generationPreferences)
    };

    // Calculate learning progress (0-1 scale)
    const learningProgress = Math.min(interactions.length / 100, 1) * profile.preferenceStability;

    // Generate adaptation recommendations
    const adaptationRecommendations = this.generateAdaptationRecommendations(profile);

    // Analyze preference evolution
    const preferenceEvolution = this.analyzePreferenceEvolution(interactions);

    return {
      totalInteractions: interactions.length,
      preferenceStrength,
      learningProgress,
      adaptationRecommendations,
      preferenceEvolution
    };
  }

  // Private helper methods

  private async updatePreferencesFromInteraction(interaction: InteractionData): Promise<void> {
    // Extract preferences from interaction based on user actions and feedback
    const preferences: UserStylePreference[] = [];

    // Analyze positive interactions (high ratings, saves, shares)
    const isPositiveInteraction = this.isPositiveInteraction(interaction);
    const weight = isPositiveInteraction ? 1 : -0.5; // Negative feedback reduces preference

    if (interaction.contentAttributes) {
      // Extract narrative preferences
      Object.entries(interaction.contentAttributes).forEach(([key, value]) => {
        if (this.isNarrativeAttribute(key)) {
          preferences.push({
            userId: interaction.userId,
            preferenceType: 'narrative',
            category: key,
            preference: String(value),
            strength: Math.abs(weight) * 0.1, // Small incremental updates
            confidence: this.calculateConfidenceFromInteraction(interaction),
            lastUpdated: new Date(),
            sampleSize: 1
          });
        }
      });
    }

    // Update user preference weights
    await this.updatePreferenceWeights(interaction.userId, preferences, weight);
  }

  private isPositiveInteraction(interaction: InteractionData): boolean {
    if (interaction.userFeedback?.rating && interaction.userFeedback.rating >= 7) return true;
    if (interaction.userFeedback?.liked === true) return true;
    if (interaction.userAction === 'saved' || interaction.userAction === 'shared') return true;
    return false;
  }

  private isNarrativeAttribute(key: string): boolean {
    return Object.keys(PREFERENCE_CATEGORIES.narrative).includes(key);
  }

  private calculateConfidenceFromInteraction(interaction: InteractionData): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence for explicit feedback
    if (interaction.userFeedback?.rating) {
      confidence += 0.3;
    }
    if (interaction.userFeedback?.feedback) {
      confidence += 0.2;
    }

    // Higher confidence for strong actions
    if (interaction.userAction === 'saved' || interaction.userAction === 'shared') {
      confidence += 0.2;
    }

    return Math.min(confidence, 1);
  }

  private async updatePreferenceWeights(
    userId: string,
    preferences: UserStylePreference[],
    weight: number
  ): Promise<void> {
    let userWeights = this.preferenceWeights.get(userId) || new Map();

    preferences.forEach(pref => {
      const key = `${pref.preferenceType}-${pref.category}-${pref.preference}`;
      const currentWeight = userWeights.get(key) || 0;
      const newWeight = currentWeight + (weight * pref.strength);
      userWeights.set(key, Math.max(-1, Math.min(1, newWeight))); // Clamp between -1 and 1
    });

    this.preferenceWeights.set(userId, userWeights);
  }

  private analyzeNarrativePreferences(interactions: InteractionData[]): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    // Analyze patterns in narrative-related interactions
    interactions.forEach(interaction => {
      if (interaction.contentAttributes) {
        Object.entries(PREFERENCE_CATEGORIES.narrative).forEach(([category, values]) => {
          values.forEach(value => {
            const key = `${category}-${value}`;
            if (this.interactionIndicatesPreference(interaction, category, value)) {
              preferences[key] = (preferences[key] || 0) + this.getInteractionWeight(interaction);
            }
          });
        });
      }
    });

    return this.normalizePreferences(preferences);
  }

  private analyzeVisualPreferences(interactions: InteractionData[]): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    // Focus on image-related interactions
    const imageInteractions = interactions.filter(i => 
      i.contentType === 'image' || i.contentAttributes?.hasImages
    );

    imageInteractions.forEach(interaction => {
      if (interaction.contentAttributes) {
        Object.entries(PREFERENCE_CATEGORIES.visual).forEach(([category, values]) => {
          values.forEach(value => {
            const key = `${category}-${value}`;
            if (this.interactionIndicatesPreference(interaction, category, value)) {
              preferences[key] = (preferences[key] || 0) + this.getInteractionWeight(interaction);
            }
          });
        });
      }
    });

    return this.normalizePreferences(preferences);
  }

  private analyzeContentPreferences(interactions: InteractionData[]): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    interactions.forEach(interaction => {
      if (interaction.contentAttributes) {
        Object.entries(PREFERENCE_CATEGORIES.content).forEach(([category, values]) => {
          values.forEach(value => {
            const key = `${category}-${value}`;
            if (this.interactionIndicatesPreference(interaction, category, value)) {
              preferences[key] = (preferences[key] || 0) + this.getInteractionWeight(interaction);
            }
          });
        });
      }
    });

    return this.normalizePreferences(preferences);
  }

  private analyzeGenerationPreferences(interactions: InteractionData[]): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    // Analyze regeneration patterns and feedback
    interactions.forEach(interaction => {
      if (interaction.userAction === 'regenerated') {
        // User regenerated content - indicates dissatisfaction with current approach
        if (interaction.generationContext?.parameters) {
          Object.entries(interaction.generationContext.parameters).forEach(([param, value]) => {
            if (Object.keys(PREFERENCE_CATEGORIES.generation).includes(param)) {
              const key = `${param}-${value}`;
              preferences[key] = (preferences[key] || 0) - 0.2; // Negative weight for regenerated content
            }
          });
        }
      } else if (this.isPositiveInteraction(interaction)) {
        // User liked the content - positive weight for generation parameters
        if (interaction.generationContext?.parameters) {
          Object.entries(interaction.generationContext.parameters).forEach(([param, value]) => {
            if (Object.keys(PREFERENCE_CATEGORIES.generation).includes(param)) {
              const key = `${param}-${value}`;
              preferences[key] = (preferences[key] || 0) + this.getInteractionWeight(interaction);
            }
          });
        }
      }
    });

    return this.normalizePreferences(preferences);
  }

  private interactionIndicatesPreference(
    interaction: InteractionData,
    category: string,
    value: string
  ): boolean {
    // Check if the interaction content or context indicates this preference
    if (interaction.contentAttributes?.[category] === value) {
      return true;
    }
    
    // Check generation context
    if (interaction.generationContext?.parameters?.[category] === value) {
      return true;
    }

    // Check user feedback tags
    if (interaction.userFeedback?.tags?.includes(value)) {
      return true;
    }

    return false;
  }

  private getInteractionWeight(interaction: InteractionData): number {
    let weight = 0.1; // Base weight

    // Increase weight for explicit positive feedback
    if (interaction.userFeedback?.rating) {
      weight += (interaction.userFeedback.rating - 5) * 0.1; // Scale rating to weight
    }

    if (interaction.userFeedback?.liked === true) {
      weight += 0.3;
    }

    // Increase weight for strong positive actions
    if (interaction.userAction === 'saved') weight += 0.2;
    if (interaction.userAction === 'shared') weight += 0.3;

    // Decrease weight for negative actions
    if (interaction.userAction === 'deleted') weight -= 0.5;
    if (interaction.userAction === 'regenerated') weight -= 0.2;

    return weight;
  }

  private normalizePreferences(preferences: Record<string, number>): Record<string, number> {
    const values = Object.values(preferences);
    if (values.length === 0) return preferences;

    const max = Math.max(...values.map(Math.abs));
    if (max === 0) return preferences;

    const normalized: Record<string, number> = {};
    Object.entries(preferences).forEach(([key, value]) => {
      normalized[key] = value / max;
    });

    return normalized;
  }

  private determineAdaptationLevel(interactions: InteractionData[]): 'conservative' | 'moderate' | 'aggressive' {
    const regenerationRate = interactions.filter(i => i.userAction === 'regenerated').length / interactions.length;
    const feedbackRate = interactions.filter(i => i.userFeedback).length / interactions.length;

    if (regenerationRate > 0.3 || feedbackRate > 0.5) {
      return 'aggressive'; // User actively engages with customization
    } else if (regenerationRate > 0.1 || feedbackRate > 0.2) {
      return 'moderate';
    } else {
      return 'conservative'; // User seems satisfied with defaults
    }
  }

  private calculatePreferenceStability(interactions: InteractionData[]): number {
    if (interactions.length < 10) return 0.5; // Not enough data

    // Analyze consistency of preferences over time
    const timeWindows = this.splitIntoTimeWindows(interactions, 3);
    if (timeWindows.length < 2) return 0.5;

    let stabilityScore = 0;
    for (let i = 1; i < timeWindows.length; i++) {
      const prevPrefs = this.analyzeWindowPreferences(timeWindows[i - 1]);
      const currPrefs = this.analyzeWindowPreferences(timeWindows[i]);
      stabilityScore += this.calculatePreferenceSimilarity(prevPrefs, currPrefs);
    }

    return stabilityScore / (timeWindows.length - 1);
  }

  private splitIntoTimeWindows(interactions: InteractionData[], windowCount: number): InteractionData[][] {
    const sorted = interactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const windowSize = Math.floor(sorted.length / windowCount);
    const windows: InteractionData[][] = [];

    for (let i = 0; i < windowCount; i++) {
      const start = i * windowSize;
      const end = i === windowCount - 1 ? sorted.length : (i + 1) * windowSize;
      windows.push(sorted.slice(start, end));
    }

    return windows.filter(w => w.length > 0);
  }

  private analyzeWindowPreferences(interactions: InteractionData[]): Record<string, number> {
    // Simplified preference analysis for a time window
    const preferences: Record<string, number> = {};
    
    interactions.forEach(interaction => {
      if (this.isPositiveInteraction(interaction) && interaction.contentAttributes) {
        Object.entries(interaction.contentAttributes).forEach(([key, value]) => {
          const prefKey = `${key}-${value}`;
          preferences[prefKey] = (preferences[prefKey] || 0) + 1;
        });
      }
    });

    return preferences;
  }

  private calculatePreferenceSimilarity(prefs1: Record<string, number>, prefs2: Record<string, number>): number {
    const allKeys = new Set([...Object.keys(prefs1), ...Object.keys(prefs2)]);
    if (allKeys.size === 0) return 1;

    let similarity = 0;
    allKeys.forEach(key => {
      const val1 = prefs1[key] || 0;
      const val2 = prefs2[key] || 0;
      similarity += 1 - Math.abs(val1 - val2) / Math.max(val1, val2, 1);
    });

    return similarity / allKeys.size;
  }

  private createDefaultProfile(userId: string): UserPreferenceProfile {
    return {
      userId,
      narrativePreferences: {},
      visualPreferences: {},
      contentPreferences: {},
      generationPreferences: {},
      adaptationLevel: 'conservative',
      lastAnalyzed: new Date(),
      totalInteractions: 0,
      preferenceStability: 0.5
    };
  }

  private async getUserProfile(userId: string): Promise<UserPreferenceProfile | null> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      // Try to load from database
      profile = await this.loadUserProfile(userId);
      if (profile) {
        this.userProfiles.set(userId, profile);
      }
    }

    return profile || null;
  }

  private applyNarrativePreferences(
    prompt: string,
    preferences: Record<string, number>,
    contentType: string
  ): { prompt: string; adaptations: string[] } {
    const adaptations: string[] = [];
    let adaptedPrompt = prompt;

    // Get top narrative preferences
    const topPrefs = this.getTopPreferences(preferences, 3);

    topPrefs.forEach(pref => {
      const [category, value] = pref.split('-');
      
      switch (category) {
        case 'tone':
          adaptedPrompt += `\n\nTONE PREFERENCE: Emphasize a ${value} tone throughout the narrative.`;
          adaptations.push(`Applied ${value} tone preference`);
          break;
        case 'complexity':
          adaptedPrompt += `\n\nCOMPLEXITY PREFERENCE: Create ${value} narrative complexity with appropriate depth.`;
          adaptations.push(`Applied ${value} complexity preference`);
          break;
        case 'themes':
          adaptedPrompt += `\n\nTHEMATIC PREFERENCE: Incorporate themes of ${value} where appropriate.`;
          adaptations.push(`Applied ${value} thematic preference`);
          break;
      }
    });

    return { prompt: adaptedPrompt, adaptations };
  }

  private applyVisualPreferences(
    prompt: string,
    preferences: Record<string, number>
  ): { prompt: string; adaptations: string[] } {
    const adaptations: string[] = [];
    let adaptedPrompt = prompt;

    const topPrefs = this.getTopPreferences(preferences, 3);

    topPrefs.forEach(pref => {
      const [category, value] = pref.split('-');
      
      switch (category) {
        case 'artStyle':
          adaptedPrompt += `\n\nART STYLE PREFERENCE: Use ${value} art style.`;
          adaptations.push(`Applied ${value} art style preference`);
          break;
        case 'colorPalette':
          adaptedPrompt += `\n\nCOLOR PREFERENCE: Use ${value} color palette.`;
          adaptations.push(`Applied ${value} color preference`);
          break;
        case 'lighting':
          adaptedPrompt += `\n\nLIGHTING PREFERENCE: Use ${value} lighting.`;
          adaptations.push(`Applied ${value} lighting preference`);
          break;
      }
    });

    return { prompt: adaptedPrompt, adaptations };
  }

  private applyContentPreferences(
    prompt: string,
    preferences: Record<string, number>,
    contentType: string
  ): { prompt: string; adaptations: string[] } {
    const adaptations: string[] = [];
    let adaptedPrompt = prompt;

    const topPrefs = this.getTopPreferences(preferences, 3);

    topPrefs.forEach(pref => {
      const [category, value] = pref.split('-');
      
      switch (category) {
        case 'difficulty':
          adaptedPrompt += `\n\nDIFFICULTY PREFERENCE: Target ${value} difficulty level.`;
          adaptations.push(`Applied ${value} difficulty preference`);
          break;
        case 'focus':
          adaptedPrompt += `\n\nFOCUS PREFERENCE: Emphasize ${value} elements.`;
          adaptations.push(`Applied ${value} focus preference`);
          break;
        case 'length':
          adaptedPrompt += `\n\nLENGTH PREFERENCE: Create ${value} content.`;
          adaptations.push(`Applied ${value} length preference`);
          break;
      }
    });

    return { prompt: adaptedPrompt, adaptations };
  }

  private applyGenerationPreferences(
    prompt: string,
    preferences: Record<string, number>
  ): { prompt: string; adaptations: string[] } {
    const adaptations: string[] = [];
    let adaptedPrompt = prompt;

    const topPrefs = this.getTopPreferences(preferences, 2);

    topPrefs.forEach(pref => {
      const [category, value] = pref.split('-');
      
      switch (category) {
        case 'creativity':
          adaptedPrompt += `\n\nCREATIVITY PREFERENCE: Use ${value} creative approach.`;
          adaptations.push(`Applied ${value} creativity preference`);
          break;
        case 'detail':
          adaptedPrompt += `\n\nDETAIL PREFERENCE: Provide ${value} level of detail.`;
          adaptations.push(`Applied ${value} detail preference`);
          break;
      }
    });

    return { prompt: adaptedPrompt, adaptations };
  }

  private getTopPreferences(preferences: Record<string, number>, count: number): string[] {
    return Object.entries(preferences)
      .filter(([, value]) => value > 0.3) // Only significant preferences
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([key]) => key);
  }

  private calculateAdaptationConfidence(profile: UserPreferenceProfile, adaptationCount: number): number {
    const baseConfidence = profile.preferenceStability;
    const sampleConfidence = Math.min(profile.totalInteractions / 50, 1);
    const adaptationConfidence = Math.min(adaptationCount / 5, 1);

    return (baseConfidence + sampleConfidence + adaptationConfidence) / 3;
  }

  private generateSuggestedParameters(profile: UserPreferenceProfile): Record<string, any> {
    const parameters: Record<string, any> = {};

    // Extract top preferences and convert to parameters
    const topNarrative = this.getTopPreferences(profile.narrativePreferences, 2);
    const topContent = this.getTopPreferences(profile.contentPreferences, 2);
    const topGeneration = this.getTopPreferences(profile.generationPreferences, 2);

    topNarrative.forEach(pref => {
      const [category, value] = pref.split('-');
      parameters[`preferred_${category}`] = value;
    });

    topContent.forEach(pref => {
      const [category, value] = pref.split('-');
      parameters[`preferred_${category}`] = value;
    });

    topGeneration.forEach(pref => {
      const [category, value] = pref.split('-');
      parameters[`generation_${category}`] = value;
    });

    return parameters;
  }

  private generatePersonalizedPrompts(profile: UserPreferenceProfile): string[] {
    const prompts: string[] = [];

    // Create prompts based on user's strongest preferences
    const strongNarrativePrefs = this.getTopPreferences(profile.narrativePreferences, 1);
    const strongVisualPrefs = this.getTopPreferences(profile.visualPreferences, 1);

    if (strongNarrativePrefs.length > 0) {
      const [category, value] = strongNarrativePrefs[0].split('-');
      prompts.push(`Create content with a strong ${value} ${category} that matches your preferred style.`);
    }

    if (strongVisualPrefs.length > 0) {
      const [category, value] = strongVisualPrefs[0].split('-');
      prompts.push(`Generate images with ${value} ${category} based on your visual preferences.`);
    }

    return prompts;
  }

  private calculateCategoryStrength(preferences: Record<string, number>): number {
    const values = Object.values(preferences);
    if (values.length === 0) return 0;

    const maxValue = Math.max(...values);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    return (maxValue + avgValue) / 2;
  }

  private generateAdaptationRecommendations(profile: UserPreferenceProfile): string[] {
    const recommendations: string[] = [];

    if (profile.totalInteractions < 10) {
      recommendations.push('Continue using the system to improve personalization');
    }

    if (profile.preferenceStability < 0.3) {
      recommendations.push('Your preferences are still evolving - try different styles to find what you like');
    }

    if (profile.adaptationLevel === 'conservative') {
      recommendations.push('Consider trying more creative options to discover new preferences');
    }

    return recommendations;
  }

  private analyzePreferenceEvolution(interactions: InteractionData[]): Array<{
    category: string;
    trend: 'stable' | 'evolving' | 'exploring';
    confidence: number;
  }> {
    const categories = ['narrative', 'visual', 'content', 'generation'];
    
    return categories.map(category => {
      const categoryInteractions = interactions.filter(i => 
        i.contentAttributes && Object.keys(i.contentAttributes).some(key => 
          Object.keys(PREFERENCE_CATEGORIES[category as keyof typeof PREFERENCE_CATEGORIES] || {}).includes(key)
        )
      );

      if (categoryInteractions.length < 5) {
        return { category, trend: 'exploring' as const, confidence: 0.3 };
      }

      // Analyze variance in preferences over time
      const variance = this.calculatePreferenceVariance(categoryInteractions, category);
      
      let trend: 'stable' | 'evolving' | 'exploring';
      if (variance < 0.2) {
        trend = 'stable';
      } else if (variance < 0.5) {
        trend = 'evolving';
      } else {
        trend = 'exploring';
      }

      const confidence = Math.min(categoryInteractions.length / 20, 1);

      return { category, trend, confidence };
    });
  }

  private calculatePreferenceVariance(interactions: InteractionData[], category: string): number {
    // Simplified variance calculation for preference consistency
    const preferences: Record<string, number[]> = {};

    interactions.forEach((interaction, index) => {
      if (interaction.contentAttributes) {
        Object.entries(interaction.contentAttributes).forEach(([key, value]) => {
          if (Object.keys(PREFERENCE_CATEGORIES[category as keyof typeof PREFERENCE_CATEGORIES] || {}).includes(key)) {
            const prefKey = `${key}-${value}`;
            if (!preferences[prefKey]) preferences[prefKey] = [];
            preferences[prefKey].push(index);
          }
        });
      }
    });

    // Calculate variance in preference timing
    const variances = Object.values(preferences).map(indices => {
      if (indices.length < 2) return 0;
      const mean = indices.reduce((sum, val) => sum + val, 0) / indices.length;
      const variance = indices.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / indices.length;
      return variance;
    });

    return variances.length > 0 ? variances.reduce((sum, val) => sum + val, 0) / variances.length : 0;
  }

  // Database persistence methods (placeholders)
  private async persistInteraction(interaction: InteractionData): Promise<void> {
    // Implementation would depend on your database setup
    console.log('Persisting interaction:', interaction);
  }

  private async persistUserProfile(profile: UserPreferenceProfile): Promise<void> {
    // Implementation would depend on your database setup
    console.log('Persisting user profile:', profile);
  }

  private async loadUserProfile(userId: string): Promise<UserPreferenceProfile | null> {
    // Implementation would depend on your database setup
    console.log('Loading user profile for:', userId);
    return null;
  }
}

export const userPreferenceLearning = new UserPreferenceLearning();