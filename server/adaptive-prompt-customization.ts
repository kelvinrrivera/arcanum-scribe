import { userPreferenceLearning } from './user-preference-learning';
import { z } from 'zod';

// Schema for prompt customization requests
const PromptCustomizationRequestSchema = z.object({
  userId: z.string(),
  basePrompt: z.string(),
  contentType: z.enum(['adventure', 'npc', 'monster', 'location', 'item', 'image']),
  context: z.object({
    gameSystem: z.string().optional(),
    theme: z.string().optional(),
    tone: z.string().optional(),
    difficulty: z.string().optional(),
    tier: z.string().optional()
  }).optional(),
  adaptationLevel: z.enum(['none', 'light', 'moderate', 'aggressive']).optional()
});

const CustomizedPromptResponseSchema = z.object({
  originalPrompt: z.string(),
  customizedPrompt: z.string(),
  adaptations: z.array(z.string()),
  confidence: z.number(),
  personalizedElements: z.array(z.string()),
  recommendedParameters: z.record(z.any()),
  adaptationReason: z.string()
});

type PromptCustomizationRequest = z.infer<typeof PromptCustomizationRequestSchema>;
type CustomizedPromptResponse = z.infer<typeof CustomizedPromptResponseSchema>;

// Prompt enhancement templates
const ENHANCEMENT_TEMPLATES = {
  narrative: {
    tone: {
      dark: "Emphasize darker themes, moral ambiguity, and serious consequences. Use atmospheric descriptions that create tension and foreboding.",
      light: "Focus on hope, heroism, and positive outcomes. Use uplifting language and emphasize the triumph of good over evil.",
      humorous: "Incorporate wit, clever dialogue, and amusing situations. Balance humor with adventure without undermining dramatic moments.",
      mysterious: "Create intrigue through hidden information, cryptic clues, and unexplained phenomena. Build suspense gradually.",
      gritty: "Emphasize realism, harsh consequences, and moral complexity. Show the true cost of adventure and conflict."
    },
    complexity: {
      simple: "Create straightforward plots with clear objectives and minimal subplots. Focus on direct cause-and-effect relationships.",
      moderate: "Include 2-3 interconnected plot threads with some character development and meaningful choices.",
      complex: "Weave multiple storylines with intricate character relationships, political intrigue, and layered mysteries.",
      intricate: "Create deeply interconnected narratives with multiple factions, hidden agendas, and consequences that span multiple sessions."
    },
    pacing: {
      fast: "Maintain high energy with frequent action, quick scene transitions, and immediate consequences.",
      moderate: "Balance action with character development, allowing for both intense moments and quieter scenes.",
      slow: "Focus on atmosphere, detailed descriptions, and gradual revelation of information.",
      varied: "Alternate between intense action sequences and slower character-focused moments for dynamic pacing."
    }
  },
  visual: {
    artStyle: {
      realistic: "Create photorealistic imagery with accurate proportions, natural lighting, and detailed textures.",
      stylized: "Use artistic interpretation with enhanced colors, dramatic proportions, and creative visual elements.",
      painterly: "Emulate traditional painting techniques with visible brushstrokes and artistic composition.",
      sketch: "Use line art style with crosshatching, shading, and hand-drawn aesthetic.",
      digital: "Employ clean digital art techniques with sharp lines, gradient shading, and modern visual effects."
    },
    colorPalette: {
      vibrant: "Use bold, saturated colors that create visual impact and energy.",
      muted: "Employ subdued, earthy tones that create atmosphere and sophistication.",
      monochromatic: "Focus on variations of a single color family for cohesive visual unity.",
      warm: "Emphasize reds, oranges, and yellows to create inviting, energetic feelings.",
      cool: "Use blues, greens, and purples to create calm, mysterious, or magical atmospheres."
    },
    lighting: {
      dramatic: "Use strong contrasts between light and shadow to create mood and focus attention.",
      soft: "Employ gentle, diffused lighting that creates warmth and comfort.",
      atmospheric: "Use lighting to enhance mood and create environmental storytelling.",
      natural: "Simulate realistic lighting conditions appropriate to the scene's time and location."
    }
  },
  content: {
    focus: {
      combat: "Emphasize tactical encounters, strategic positioning, and dynamic action sequences.",
      roleplay: "Focus on character interactions, dialogue, and social challenges that develop personality.",
      exploration: "Highlight discovery, environmental puzzles, and the joy of uncovering secrets.",
      puzzle: "Include intellectual challenges, riddles, and problems that require creative thinking.",
      social: "Emphasize political intrigue, relationship dynamics, and community interactions."
    },
    difficulty: {
      easy: "Create approachable challenges that build confidence and allow for heroic success.",
      moderate: "Balance challenge with achievability, requiring strategy but not perfection.",
      hard: "Design demanding encounters that require careful planning and resource management.",
      deadly: "Create high-stakes situations where failure has serious consequences and success feels earned."
    }
  },
  generation: {
    creativity: {
      conservative: "Use proven tropes and familiar elements that players will recognize and appreciate.",
      moderate: "Blend familiar elements with fresh twists to create comfortable innovation.",
      creative: "Introduce novel concepts and unexpected combinations while maintaining coherence.",
      experimental: "Push boundaries with unique mechanics, unusual narratives, and innovative approaches."
    },
    detail: {
      concise: "Provide essential information in clear, direct language without unnecessary elaboration.",
      detailed: "Include rich descriptions and comprehensive information for full understanding.",
      comprehensive: "Cover all aspects thoroughly with extensive background and context.",
      exhaustive: "Provide complete information including optional details, alternatives, and variations."
    }
  }
};

export class AdaptivePromptCustomization {
  /**
   * Customize a prompt based on user preferences
   */
  async customizePrompt(request: PromptCustomizationRequest): Promise<CustomizedPromptResponse> {
    const validatedRequest = PromptCustomizationRequestSchema.parse(request);
    
    // Get user's adaptive prompt customization
    const adaptiveCustomization = await userPreferenceLearning.getAdaptivePromptCustomization(
      validatedRequest.userId,
      validatedRequest.basePrompt,
      validatedRequest.contentType
    );

    // Apply additional context-based customizations
    const contextCustomizations = this.applyContextCustomizations(
      adaptiveCustomization.customizedPrompt,
      validatedRequest.context || {},
      validatedRequest.contentType
    );

    // Apply adaptation level adjustments
    const finalCustomization = this.applyAdaptationLevel(
      contextCustomizations.prompt,
      validatedRequest.adaptationLevel || 'moderate',
      adaptiveCustomization.confidence
    );

    // Generate personalized elements
    const personalizedElements = await this.generatePersonalizedElements(
      validatedRequest.userId,
      validatedRequest.contentType
    );

    // Get recommended parameters
    const recommendedParameters = await this.getRecommendedParameters(
      validatedRequest.userId,
      validatedRequest.contentType,
      validatedRequest.context
    );

    // Generate adaptation reason
    const adaptationReason = this.generateAdaptationReason(
      adaptiveCustomization.adaptations,
      contextCustomizations.adaptations,
      adaptiveCustomization.confidence
    );

    return {
      originalPrompt: validatedRequest.basePrompt,
      customizedPrompt: finalCustomization.prompt,
      adaptations: [
        ...adaptiveCustomization.adaptations,
        ...contextCustomizations.adaptations,
        ...finalCustomization.adaptations
      ],
      confidence: adaptiveCustomization.confidence,
      personalizedElements,
      recommendedParameters,
      adaptationReason
    };
  }

  /**
   * Get style-specific prompt enhancements
   */
  async getStyleEnhancements(
    userId: string,
    contentType: string,
    styleCategory: 'narrative' | 'visual' | 'content' | 'generation'
  ): Promise<{
    availableStyles: string[];
    recommendedStyles: string[];
    styleDescriptions: Record<string, string>;
    userPreferenceScores: Record<string, number>;
  }> {
    // Get user's preference profile
    const profile = await userPreferenceLearning.analyzeUserPreferences(userId);
    
    const categoryPreferences = profile[`${styleCategory}Preferences`] || {};
    
    // Get available styles for this category
    const availableStyles = this.getAvailableStyles(styleCategory);
    
    // Calculate user preference scores
    const userPreferenceScores: Record<string, number> = {};
    availableStyles.forEach(style => {
      const preferenceKey = Object.keys(categoryPreferences).find(key => key.includes(style));
      userPreferenceScores[style] = preferenceKey ? categoryPreferences[preferenceKey] : 0;
    });

    // Get recommended styles (top 3 with positive scores)
    const recommendedStyles = Object.entries(userPreferenceScores)
      .filter(([, score]) => score > 0.2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([style]) => style);

    // Generate style descriptions
    const styleDescriptions = this.getStyleDescriptions(styleCategory, availableStyles);

    return {
      availableStyles,
      recommendedStyles,
      styleDescriptions,
      userPreferenceScores
    };
  }

  /**
   * Generate personalized prompt templates
   */
  async generatePersonalizedTemplates(
    userId: string,
    contentType: string
  ): Promise<{
    templates: Array<{
      name: string;
      description: string;
      template: string;
      confidence: number;
      preferenceMatch: string[];
    }>;
    customizationTips: string[];
  }> {
    const profile = await userPreferenceLearning.analyzeUserPreferences(userId);
    const recommendations = await userPreferenceLearning.generatePersonalizedRecommendations(userId);

    const templates: Array<{
      name: string;
      description: string;
      template: string;
      confidence: number;
      preferenceMatch: string[];
    }> = [];

    // Generate templates based on user's strongest preferences
    const strongPreferences = this.extractStrongPreferences(profile);

    strongPreferences.forEach((pref, index) => {
      const template = this.createTemplateFromPreference(pref, contentType);
      if (template) {
        templates.push({
          name: `Personalized Template ${index + 1}`,
          description: `Optimized for your ${pref.category} preferences`,
          template: template.content,
          confidence: pref.strength,
          preferenceMatch: [pref.preference]
        });
      }
    });

    // Generate customization tips
    const customizationTips = this.generateCustomizationTips(profile, recommendations);

    return {
      templates,
      customizationTips
    };
  }

  /**
   * Analyze prompt effectiveness for a user
   */
  async analyzePromptEffectiveness(
    userId: string,
    promptId: string,
    userFeedback: {
      rating?: number;
      liked?: boolean;
      feedback?: string;
      regenerated?: boolean;
    }
  ): Promise<{
    effectivenessScore: number;
    strengthAreas: string[];
    improvementAreas: string[];
    adaptationRecommendations: string[];
  }> {
    // Record the feedback for learning
    await userPreferenceLearning.updatePreferencesFromFeedback(
      userId,
      promptId,
      userFeedback
    );

    // Analyze effectiveness
    const effectivenessScore = this.calculateEffectivenessScore(userFeedback);
    
    // Identify strength and improvement areas
    const strengthAreas = this.identifyStrengthAreas(userFeedback);
    const improvementAreas = this.identifyImprovementAreas(userFeedback);
    
    // Generate adaptation recommendations
    const adaptationRecommendations = await this.generateAdaptationRecommendations(
      userId,
      userFeedback
    );

    return {
      effectivenessScore,
      strengthAreas,
      improvementAreas,
      adaptationRecommendations
    };
  }

  // Private helper methods

  private applyContextCustomizations(
    prompt: string,
    context: Record<string, any>,
    contentType: string
  ): { prompt: string; adaptations: string[] } {
    let customizedPrompt = prompt;
    const adaptations: string[] = [];

    // Apply game system specific customizations
    if (context.gameSystem) {
      const systemCustomization = this.getGameSystemCustomization(context.gameSystem);
      if (systemCustomization) {
        customizedPrompt += `\n\n${systemCustomization}`;
        adaptations.push(`Applied ${context.gameSystem} system customization`);
      }
    }

    // Apply theme customizations
    if (context.theme) {
      const themeCustomization = this.getThemeCustomization(context.theme, contentType);
      if (themeCustomization) {
        customizedPrompt += `\n\n${themeCustomization}`;
        adaptations.push(`Applied ${context.theme} theme customization`);
      }
    }

    // Apply tone customizations
    if (context.tone && ENHANCEMENT_TEMPLATES.narrative.tone[context.tone as keyof typeof ENHANCEMENT_TEMPLATES.narrative.tone]) {
      const toneEnhancement = ENHANCEMENT_TEMPLATES.narrative.tone[context.tone as keyof typeof ENHANCEMENT_TEMPLATES.narrative.tone];
      customizedPrompt += `\n\nTONE GUIDANCE: ${toneEnhancement}`;
      adaptations.push(`Applied ${context.tone} tone enhancement`);
    }

    // Apply difficulty customizations
    if (context.difficulty && ENHANCEMENT_TEMPLATES.content.difficulty[context.difficulty as keyof typeof ENHANCEMENT_TEMPLATES.content.difficulty]) {
      const difficultyEnhancement = ENHANCEMENT_TEMPLATES.content.difficulty[context.difficulty as keyof typeof ENHANCEMENT_TEMPLATES.content.difficulty];
      customizedPrompt += `\n\nDIFFICULTY GUIDANCE: ${difficultyEnhancement}`;
      adaptations.push(`Applied ${context.difficulty} difficulty enhancement`);
    }

    return { prompt: customizedPrompt, adaptations };
  }

  private applyAdaptationLevel(
    prompt: string,
    adaptationLevel: string,
    confidence: number
  ): { prompt: string; adaptations: string[] } {
    const adaptations: string[] = [];
    let adaptedPrompt = prompt;

    switch (adaptationLevel) {
      case 'none':
        // No additional adaptations
        break;
      
      case 'light':
        if (confidence > 0.3) {
          adaptedPrompt += '\n\nAPPLY LIGHT PERSONALIZATION: Subtly incorporate user preferences while maintaining standard quality.';
          adaptations.push('Applied light personalization');
        }
        break;
      
      case 'moderate':
        if (confidence > 0.5) {
          adaptedPrompt += '\n\nAPPLY MODERATE PERSONALIZATION: Balance user preferences with proven content patterns.';
          adaptations.push('Applied moderate personalization');
        }
        break;
      
      case 'aggressive':
        if (confidence > 0.7) {
          adaptedPrompt += '\n\nAPPLY STRONG PERSONALIZATION: Prioritize user preferences and create highly customized content.';
          adaptations.push('Applied aggressive personalization');
        } else {
          adaptedPrompt += '\n\nAPPLY CAUTIOUS PERSONALIZATION: Use available preference data while maintaining quality standards.';
          adaptations.push('Applied cautious personalization due to lower confidence');
        }
        break;
    }

    return { prompt: adaptedPrompt, adaptations };
  }

  private async generatePersonalizedElements(
    userId: string,
    contentType: string
  ): Promise<string[]> {
    const recommendations = await userPreferenceLearning.generatePersonalizedRecommendations(userId);
    
    const elements: string[] = [];
    
    // Extract personalized elements from recommendations
    recommendations.recommendedStyles.forEach(style => {
      const [category, preference] = style.split('-');
      elements.push(`${category}: ${preference}`);
    });

    // Add suggested parameters as elements
    Object.entries(recommendations.suggestedParameters).forEach(([param, value]) => {
      elements.push(`${param}: ${value}`);
    });

    return elements.slice(0, 5); // Limit to top 5 elements
  }

  private async getRecommendedParameters(
    userId: string,
    contentType: string,
    context?: Record<string, any>
  ): Promise<Record<string, any>> {
    const recommendations = await userPreferenceLearning.generatePersonalizedRecommendations(userId);
    
    const parameters = { ...recommendations.suggestedParameters };

    // Add context-based parameters
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        if (value && !parameters[key]) {
          parameters[key] = value;
        }
      });
    }

    // Add content-type specific parameters
    parameters.contentType = contentType;
    parameters.personalizationLevel = recommendations.confidenceScore;

    return parameters;
  }

  private generateAdaptationReason(
    userAdaptations: string[],
    contextAdaptations: string[],
    confidence: number
  ): string {
    const totalAdaptations = userAdaptations.length + contextAdaptations.length;
    
    if (totalAdaptations === 0) {
      return 'No personalization applied - using standard prompt template.';
    }

    let reason = `Applied ${totalAdaptations} customization${totalAdaptations > 1 ? 's' : ''} `;
    
    if (userAdaptations.length > 0) {
      reason += `based on your preferences (${userAdaptations.length}) `;
    }
    
    if (contextAdaptations.length > 0) {
      reason += `and context requirements (${contextAdaptations.length}) `;
    }

    reason += `with ${Math.round(confidence * 100)}% confidence.`;

    return reason;
  }

  private getAvailableStyles(category: string): string[] {
    const templates = ENHANCEMENT_TEMPLATES[category as keyof typeof ENHANCEMENT_TEMPLATES];
    if (!templates) return [];

    return Object.keys(templates).reduce((styles: string[], subcategory) => {
      const subcategoryStyles = Object.keys(templates[subcategory as keyof typeof templates]);
      return [...styles, ...subcategoryStyles];
    }, []);
  }

  private getStyleDescriptions(category: string, styles: string[]): Record<string, string> {
    const descriptions: Record<string, string> = {};
    const templates = ENHANCEMENT_TEMPLATES[category as keyof typeof ENHANCEMENT_TEMPLATES];
    
    if (!templates) return descriptions;

    Object.entries(templates).forEach(([subcategory, subcategoryTemplates]) => {
      Object.entries(subcategoryTemplates).forEach(([style, description]) => {
        if (styles.includes(style)) {
          descriptions[style] = description;
        }
      });
    });

    return descriptions;
  }

  private extractStrongPreferences(profile: any): Array<{
    category: string;
    preference: string;
    strength: number;
  }> {
    const strongPreferences: Array<{
      category: string;
      preference: string;
      strength: number;
    }> = [];

    // Extract from all preference categories
    ['narrativePreferences', 'visualPreferences', 'contentPreferences', 'generationPreferences'].forEach(category => {
      const preferences = profile[category] || {};
      Object.entries(preferences).forEach(([key, strength]) => {
        if (typeof strength === 'number' && strength > 0.5) {
          const [prefCategory, preference] = key.split('-');
          strongPreferences.push({
            category: prefCategory,
            preference,
            strength
          });
        }
      });
    });

    return strongPreferences.sort((a, b) => b.strength - a.strength).slice(0, 3);
  }

  private createTemplateFromPreference(
    preference: { category: string; preference: string; strength: number },
    contentType: string
  ): { content: string } | null {
    const templates = ENHANCEMENT_TEMPLATES;
    
    // Find the appropriate template
    for (const [templateCategory, subcategories] of Object.entries(templates)) {
      for (const [subcategory, styles] of Object.entries(subcategories)) {
        if (subcategory === preference.category && styles[preference.preference as keyof typeof styles]) {
          const enhancement = styles[preference.preference as keyof typeof styles];
          return {
            content: `Create ${contentType} content with the following guidance: ${enhancement}`
          };
        }
      }
    }

    return null;
  }

  private generateCustomizationTips(profile: any, recommendations: any): string[] {
    const tips: string[] = [];

    if (profile.totalInteractions < 10) {
      tips.push('Continue using the system to improve personalization accuracy');
    }

    if (profile.preferenceStability < 0.5) {
      tips.push('Try different styles to help the system learn your preferences');
    }

    if (recommendations.confidenceScore < 0.3) {
      tips.push('Provide feedback on generated content to improve recommendations');
    }

    tips.push('Use the regeneration feature when content doesn\'t match your preferences');
    tips.push('Rate content to help the system understand your quality expectations');

    return tips;
  }

  private calculateEffectivenessScore(feedback: any): number {
    let score = 0.5; // Base score

    if (feedback.rating) {
      score = feedback.rating / 10; // Convert 1-10 rating to 0-1 score
    }

    if (feedback.liked === true) {
      score = Math.max(score, 0.8);
    } else if (feedback.liked === false) {
      score = Math.min(score, 0.3);
    }

    if (feedback.regenerated) {
      score = Math.min(score, 0.4); // Regeneration indicates dissatisfaction
    }

    return Math.max(0, Math.min(1, score));
  }

  private identifyStrengthAreas(feedback: any): string[] {
    const strengths: string[] = [];

    if (feedback.rating && feedback.rating >= 8) {
      strengths.push('High user satisfaction');
    }

    if (feedback.liked === true) {
      strengths.push('Content matched user preferences');
    }

    if (!feedback.regenerated) {
      strengths.push('Content accepted on first generation');
    }

    if (feedback.feedback && feedback.feedback.includes('perfect')) {
      strengths.push('Exceeded user expectations');
    }

    return strengths;
  }

  private identifyImprovementAreas(feedback: any): string[] {
    const improvements: string[] = [];

    if (feedback.rating && feedback.rating < 6) {
      improvements.push('Overall quality needs improvement');
    }

    if (feedback.liked === false) {
      improvements.push('Content did not match user preferences');
    }

    if (feedback.regenerated) {
      improvements.push('Initial generation was unsatisfactory');
    }

    if (feedback.feedback) {
      if (feedback.feedback.includes('generic')) {
        improvements.push('Content lacks uniqueness');
      }
      if (feedback.feedback.includes('boring')) {
        improvements.push('Content needs more engagement');
      }
    }

    return improvements;
  }

  private async generateAdaptationRecommendations(
    userId: string,
    feedback: any
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (feedback.rating && feedback.rating < 6) {
      recommendations.push('Increase adaptation level for more personalization');
    }

    if (feedback.regenerated) {
      recommendations.push('Analyze regeneration patterns to improve initial generation');
    }

    if (feedback.liked === false) {
      recommendations.push('Review and update user preference profile');
    }

    // Get learning insights for additional recommendations
    const insights = await userPreferenceLearning.getLearningInsights(userId);
    recommendations.push(...insights.adaptationRecommendations);

    return recommendations;
  }

  private getGameSystemCustomization(gameSystem: string): string | null {
    const customizations: Record<string, string> = {
      'dnd5e': 'Follow D&D 5th Edition rules, terminology, and conventions. Use appropriate challenge ratings and mechanics.',
      'pathfinder': 'Use Pathfinder system mechanics, terminology, and complexity levels appropriate to the edition.',
      'generic': 'Create system-agnostic content that can be adapted to any RPG system.',
      'custom': 'Adapt content to work with custom or homebrew rule systems.'
    };

    return customizations[gameSystem] || null;
  }

  private getThemeCustomization(theme: string, contentType: string): string | null {
    const themeCustomizations: Record<string, Record<string, string>> = {
      'horror': {
        'adventure': 'Emphasize psychological tension, supernatural threats, and atmosphere of dread.',
        'npc': 'Create characters with dark secrets, tragic backgrounds, or unsettling mannerisms.',
        'monster': 'Focus on creatures that inspire fear through appearance, abilities, or behavior.',
        'location': 'Design environments that feel oppressive, haunted, or unnaturally threatening.'
      },
      'mystery': {
        'adventure': 'Structure around investigation, clues, and gradual revelation of truth.',
        'npc': 'Create characters with hidden motives, secrets, or crucial information.',
        'monster': 'Design creatures whose nature or origin is puzzling or unknown.',
        'location': 'Include environmental clues and hidden secrets to discover.'
      },
      'political': {
        'adventure': 'Focus on intrigue, alliances, betrayal, and power struggles.',
        'npc': 'Create characters with political motivations, factional loyalties, or social influence.',
        'monster': 'Consider creatures that represent political threats or factional conflicts.',
        'location': 'Design places of power, negotiation, or political significance.'
      }
    };

    return themeCustomizations[theme]?.[contentType] || null;
  }
}

export const adaptivePromptCustomization = new AdaptivePromptCustomization();