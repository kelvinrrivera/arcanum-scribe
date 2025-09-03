import { z } from 'zod';

// Schema for tone-adaptive generation
const ToneAdaptiveRequestSchema = z.object({
  baseTone: z.enum(['dark', 'light', 'serious', 'humorous', 'mysterious', 'heroic', 'gritty', 'whimsical', 'romantic', 'melancholic']),
  intensity: z.enum(['subtle', 'moderate', 'strong', 'overwhelming']).optional(),
  secondaryTones: z.array(z.string()).optional(),
  contentType: z.enum(['adventure', 'npc', 'monster', 'location', 'item', 'image']),
  basePrompt: z.string(),
  targetAudience: z.enum(['children', 'teens', 'adults', 'mature', 'mixed']).optional(),
  genre: z.string().optional(),
  culturalContext: z.string().optional(),
  emotionalArc: z.enum(['rising', 'falling', 'stable', 'cyclical', 'chaotic']).optional()
});

const ToneAdaptedResponseSchema = z.object({
  originalPrompt: z.string(),
  adaptedPrompt: z.string(),
  toneEnhancements: z.array(z.string()),
  languageAdjustments: z.array(z.string()),
  atmosphericChanges: z.array(z.string()),
  emotionalGuidance: z.record(z.any()),
  toneConsistencyRules: z.array(z.string()),
  qualityMetrics: z.object({
    toneAuthenticity: z.number(),
    emotionalResonance: z.number(),
    audienceAppropriate: z.number(),
    toneConsistency: z.number()
  })
});

type ToneAdaptiveRequest = z.infer<typeof ToneAdaptiveRequestSchema>;
type ToneAdaptedResponse = z.infer<typeof ToneAdaptedResponseSchema>;

// Comprehensive tone adaptation templates
const TONE_ADAPTATION_TEMPLATES = {
  dark: {
    core: {
      atmosphere: "Oppressive, foreboding, and psychologically heavy with shadows and moral ambiguity",
      language: "Emphasize shadows, decay, corruption, loss, and the weight of difficult choices",
      themes: "Betrayal, sacrifice, the cost of power, moral compromise, and inevitable loss",
      emotions: "Dread, despair, tension, melancholy, and grim determination",
      imagery: "Shadows, decay, blood, ruins, storms, and withering"
    },
    intensity: {
      subtle: "Hint at darker undertones without overwhelming the narrative",
      moderate: "Balance dark elements with moments of hope or respite",
      strong: "Emphasize dark themes while maintaining narrative engagement",
      overwhelming: "Immerse completely in darkness with minimal relief"
    },
    contentAdaptations: {
      adventure: "Focus on moral dilemmas, pyrrhic victories, and the personal cost of heroism",
      npc: "Create characters with tragic backstories, dark secrets, or corrupted motivations",
      monster: "Emphasize horror, corruption, and the twisted nature of evil",
      location: "Describe decay, abandonment, oppressive atmosphere, and hidden dangers",
      item: "Items with dark histories, cursed properties, or morally ambiguous uses",
      image: "Dark color palettes, harsh shadows, and ominous atmospheric elements"
    }
  },

  light: {
    core: {
      atmosphere: "Uplifting, hopeful, and emotionally warm with emphasis on positive outcomes",
      language: "Emphasize hope, friendship, triumph, beauty, and the power of good",
      themes: "Redemption, cooperation, triumph over adversity, love, and positive growth",
      emotions: "Joy, hope, wonder, contentment, and inspiring determination",
      imagery: "Sunlight, flowers, clear skies, smiling faces, and golden hues"
    },
    intensity: {
      subtle: "Include gentle positive elements without forced optimism",
      moderate: "Balance uplifting moments with realistic challenges",
      strong: "Emphasize positive themes and hopeful outcomes",
      overwhelming: "Create an almost fairy-tale level of positivity and wonder"
    },
    contentAdaptations: {
      adventure: "Focus on heroic deeds, friendship, and victories that inspire others",
      npc: "Create characters with noble motivations, kind hearts, or inspiring stories",
      monster: "Even enemies can be redeemed or have understandable motivations",
      location: "Describe beauty, harmony, welcoming atmosphere, and peaceful settings",
      item: "Items with beneficial properties, positive histories, or helpful purposes",
      image: "Bright colors, soft lighting, and uplifting visual elements"
    }
  },

  serious: {
    core: {
      atmosphere: "Weighty, consequential, and emotionally significant with focus on important matters",
      language: "Formal, respectful, and focused on meaningful consequences and responsibilities",
      themes: "Duty, responsibility, sacrifice for the greater good, and meaningful choices",
      emotions: "Solemnity, determination, respect, and thoughtful consideration",
      imagery: "Formal settings, ceremonial objects, ancient wisdom, and dignified figures"
    },
    intensity: {
      subtle: "Maintain gravity without becoming overly formal or heavy",
      moderate: "Balance serious themes with appropriate moments of levity",
      strong: "Emphasize the weight and importance of events and decisions",
      overwhelming: "Create an almost ceremonial level of gravity and importance"
    },
    contentAdaptations: {
      adventure: "Focus on important quests, significant consequences, and weighty decisions",
      npc: "Create characters with important roles, serious responsibilities, or grave concerns",
      monster: "Threats that represent serious dangers to important values or people",
      location: "Places of importance, ceremony, learning, or significant historical value",
      item: "Objects of importance, ceremony, or significant power and responsibility",
      image: "Formal composition, dignified subjects, and respectful presentation"
    }
  },

  humorous: {
    core: {
      atmosphere: "Playful, entertaining, and emotionally light with emphasis on fun and wit",
      language: "Witty dialogue, amusing situations, clever wordplay, and lighthearted descriptions",
      themes: "Friendship, absurdity, clever solutions, misunderstandings, and comedic timing",
      emotions: "Amusement, joy, surprise, delight, and good-natured fun",
      imagery: "Exaggerated expressions, amusing situations, colorful characters, and playful elements"
    },
    intensity: {
      subtle: "Include gentle humor without undermining serious moments",
      moderate: "Balance comedy with adventure and character development",
      strong: "Emphasize humor while maintaining story coherence",
      overwhelming: "Create slapstick or absurdist comedy throughout"
    },
    contentAdaptations: {
      adventure: "Include comedic encounters, amusing NPCs, and clever problem-solving",
      npc: "Create characters with amusing quirks, funny dialogue, or comedic situations",
      monster: "Even threats can have amusing aspects or be more bumbling than terrifying",
      location: "Describe amusing details, funny situations, or whimsical architecture",
      item: "Objects with amusing properties, funny histories, or comedic potential",
      image: "Exaggerated features, amusing expressions, and playful visual elements"
    }
  },

  mysterious: {
    core: {
      atmosphere: "Intriguing, suspenseful, and intellectually engaging with hidden depths",
      language: "Cryptic descriptions, hidden meanings, gradual revelation, and enigmatic details",
      themes: "Secrets, discovery, hidden truths, ancient knowledge, and the unknown",
      emotions: "Curiosity, suspense, wonder, unease, and intellectual excitement",
      imagery: "Shadows and mist, ancient symbols, hidden passages, and veiled figures"
    },
    intensity: {
      subtle: "Include mysterious elements without overwhelming the narrative",
      moderate: "Balance mystery with clear information and progression",
      strong: "Emphasize enigmatic elements and gradual revelation",
      overwhelming: "Create layers of mystery within mysteries"
    },
    contentAdaptations: {
      adventure: "Include puzzles, hidden information, and gradual revelation of truth",
      npc: "Create characters with secrets, hidden knowledge, or enigmatic motivations",
      monster: "Creatures whose nature, origin, or purpose is puzzling or unknown",
      location: "Places with hidden secrets, ancient mysteries, or unexplained phenomena",
      item: "Objects with unknown properties, mysterious origins, or cryptic purposes",
      image: "Shadowy details, hidden elements, and atmospheric mystery"
    }
  },

  heroic: {
    core: {
      atmosphere: "Inspiring, epic, and emotionally stirring with emphasis on noble deeds",
      language: "Noble actions, inspiring speeches, epic achievements, and legendary descriptions",
      themes: "Courage, justice, protection of innocents, legendary deeds, and noble sacrifice",
      emotions: "Inspiration, pride, determination, awe, and noble purpose",
      imagery: "Banners and heraldry, shining armor, epic battles, and triumphant moments"
    },
    intensity: {
      subtle: "Include heroic elements without overwhelming grandiosity",
      moderate: "Balance heroic themes with realistic challenges and character flaws",
      strong: "Emphasize epic deeds and legendary achievements",
      overwhelming: "Create mythic-level heroism and legendary status"
    },
    contentAdaptations: {
      adventure: "Focus on noble quests, protecting innocents, and achieving legendary status",
      npc: "Create characters with heroic virtues, noble goals, or inspiring leadership",
      monster: "Threats worthy of heroes, requiring courage and skill to overcome",
      location: "Places of honor, heroic history, or sites of legendary deeds",
      item: "Legendary weapons, artifacts of power, or symbols of heroic achievement",
      image: "Dynamic poses, heroic lighting, and inspiring composition"
    }
  },

  gritty: {
    core: {
      atmosphere: "Raw, uncompromising, and emotionally challenging with harsh realities",
      language: "Harsh realities, difficult choices, realistic consequences, and unvarnished truth",
      themes: "Survival, moral complexity, hard-won victories, and the personal cost of conflict",
      emotions: "Determination, weariness, resilience, and hard-earned satisfaction",
      imagery: "Scars and weathering, practical gear, harsh environments, and worn faces"
    },
    intensity: {
      subtle: "Include realistic elements without overwhelming grimness",
      moderate: "Balance harsh realities with moments of hope or camaraderie",
      strong: "Emphasize the difficult nature of the world and choices",
      overwhelming: "Create an unrelentingly harsh and challenging environment"
    },
    contentAdaptations: {
      adventure: "Focus on survival, difficult moral choices, and realistic consequences",
      npc: "Create characters shaped by hardship, with practical concerns and survival instincts",
      monster: "Dangerous, realistic threats that require careful planning to overcome",
      location: "Harsh, unforgiving environments that test survival skills",
      item: "Practical, worn equipment with history and character",
      image: "Weathered textures, realistic wear, and harsh lighting"
    }
  },

  whimsical: {
    core: {
      atmosphere: "Charming, imaginative, and emotionally delightful with magical wonder",
      language: "Playful descriptions, magical wonder, delightful surprises, and creative imagery",
      themes: "Wonder, creativity, unexpected friendships, magical solutions, and joyful discovery",
      emotions: "Delight, wonder, amusement, enchantment, and childlike joy",
      imagery: "Bright colors, fantastical creatures, magical effects, and impossible architecture"
    },
    intensity: {
      subtle: "Include charming elements without overwhelming the narrative",
      moderate: "Balance whimsy with coherent storytelling and character development",
      strong: "Emphasize magical wonder and delightful surprises",
      overwhelming: "Create a fairy-tale level of whimsy and magical impossibility"
    },
    contentAdaptations: {
      adventure: "Include magical encounters, delightful surprises, and creative solutions",
      npc: "Create charming characters with magical quirks or delightful personalities",
      monster: "Even threats can be more mischievous than malevolent",
      location: "Describe magical, impossible, or delightfully strange environments",
      item: "Objects with whimsical properties, magical effects, or charming appearances",
      image: "Bright colors, magical effects, and fantastical visual elements"
    }
  }
};

// Audience-appropriate tone adjustments
const AUDIENCE_TONE_ADJUSTMENTS = {
  children: {
    language: "Simple, clear language with positive messaging and age-appropriate content",
    themes: "Friendship, learning, overcoming fears, and positive role models",
    restrictions: "Avoid violence, scary content, complex moral ambiguity, and mature themes",
    enhancements: "Include educational elements, clear moral lessons, and encouraging messages"
  },
  teens: {
    language: "Engaging, relatable language with some complexity and contemporary references",
    themes: "Identity, friendship, coming of age, and overcoming challenges",
    restrictions: "Moderate violence and themes, avoid excessive darkness or mature content",
    enhancements: "Include relatable characters, growth opportunities, and meaningful choices"
  },
  adults: {
    language: "Sophisticated language with full complexity and nuanced expression",
    themes: "Complex relationships, moral ambiguity, professional challenges, and life decisions",
    restrictions: "Few restrictions, but maintain good taste and narrative purpose",
    enhancements: "Include psychological depth, realistic consequences, and mature themes"
  },
  mature: {
    language: "Full complexity with no language restrictions for narrative purpose",
    themes: "All themes including dark, complex, controversial, and challenging content",
    restrictions: "Content warnings for extreme material, but few creative restrictions",
    enhancements: "Include deep psychological exploration, complex moral questions, and challenging content"
  }
};

export class ToneAdaptiveGeneration {
  /**
   * Adapt prompt for specific tone and emotional requirements
   */
  async adaptForTone(request: ToneAdaptiveRequest): Promise<ToneAdaptedResponse> {
    const validatedRequest = ToneAdaptiveRequestSchema.parse(request);
    
    // Get tone template
    const toneTemplate = TONE_ADAPTATION_TEMPLATES[validatedRequest.baseTone];
    if (!toneTemplate) {
      throw new Error(`Unsupported tone: ${validatedRequest.baseTone}`);
    }

    // Apply core tone adaptations
    const coreAdaptations = this.applyCoreTonesAdaptations(
      validatedRequest.basePrompt,
      toneTemplate,
      validatedRequest.intensity || 'moderate'
    );

    // Apply content-type specific adaptations
    const contentAdaptations = this.applyContentTypeAdaptations(
      coreAdaptations.prompt,
      toneTemplate,
      validatedRequest.contentType
    );

    // Apply audience adjustments
    const audienceAdaptations = this.applyAudienceAdjustments(
      contentAdaptations.prompt,
      validatedRequest.targetAudience,
      validatedRequest.baseTone
    );

    // Apply secondary tones if specified
    const secondaryAdaptations = this.applySecondaryTones(
      audienceAdaptations.prompt,
      validatedRequest.secondaryTones || []
    );

    // Generate emotional guidance
    const emotionalGuidance = this.generateEmotionalGuidance(
      toneTemplate,
      validatedRequest
    );

    // Create tone consistency rules
    const consistencyRules = this.createToneConsistencyRules(
      validatedRequest.baseTone,
      validatedRequest.intensity || 'moderate'
    );

    // Calculate quality metrics
    const qualityMetrics = this.calculateToneQualityMetrics(
      secondaryAdaptations.prompt,
      validatedRequest
    );

    return {
      originalPrompt: validatedRequest.basePrompt,
      adaptedPrompt: secondaryAdaptations.prompt,
      toneEnhancements: [
        ...coreAdaptations.enhancements,
        ...contentAdaptations.enhancements,
        ...audienceAdaptations.enhancements,
        ...secondaryAdaptations.enhancements
      ],
      languageAdjustments: [
        ...coreAdaptations.languageAdjustments,
        ...audienceAdaptations.languageAdjustments
      ],
      atmosphericChanges: [
        ...coreAdaptations.atmosphericChanges,
        ...contentAdaptations.atmosphericChanges
      ],
      emotionalGuidance,
      toneConsistencyRules: consistencyRules,
      qualityMetrics
    };
  }

  /**
   * Generate tone variations for the same content
   */
  async generateToneVariations(
    baseContent: string,
    availableTones: string[] = ['dark', 'light', 'serious', 'humorous', 'mysterious']
  ): Promise<Array<{
    tone: string;
    adaptedContent: string;
    emotionalShift: string;
    audienceImpact: string;
    atmosphericChange: string;
  }>> {
    const variations: Array<{
      tone: string;
      adaptedContent: string;
      emotionalShift: string;
      audienceImpact: string;
      atmosphericChange: string;
    }> = [];

    for (const tone of availableTones) {
      const toneTemplate = TONE_ADAPTATION_TEMPLATES[tone as keyof typeof TONE_ADAPTATION_TEMPLATES];
      if (!toneTemplate) continue;

      const adaptedContent = await this.adaptContentForTone(baseContent, tone, toneTemplate);
      const emotionalShift = this.describeEmotionalShift(tone, toneTemplate);
      const audienceImpact = this.describeAudienceImpact(tone);
      const atmosphericChange = toneTemplate.core.atmosphere;

      variations.push({
        tone,
        adaptedContent,
        emotionalShift,
        audienceImpact,
        atmosphericChange
      });
    }

    return variations;
  }

  /**
   * Analyze tone consistency across content
   */
  async analyzeToneConsistency(
    content: string,
    expectedTone: string
  ): Promise<{
    consistencyScore: number;
    toneMarkers: string[];
    inconsistentElements: string[];
    improvementSuggestions: string[];
  }> {
    const toneTemplate = TONE_ADAPTATION_TEMPLATES[expectedTone as keyof typeof TONE_ADAPTATION_TEMPLATES];
    if (!toneTemplate) {
      throw new Error(`Unknown tone: ${expectedTone}`);
    }

    // Analyze content for tone markers
    const toneMarkers = this.identifyToneMarkers(content, toneTemplate);
    const inconsistentElements = this.identifyInconsistentElements(content, toneTemplate);
    const consistencyScore = this.calculateConsistencyScore(toneMarkers, inconsistentElements);
    const improvementSuggestions = this.generateToneImprovements(inconsistentElements, toneTemplate);

    return {
      consistencyScore,
      toneMarkers,
      inconsistentElements,
      improvementSuggestions
    };
  }

  /**
   * Get emotional arc guidance for content
   */
  async getEmotionalArcGuidance(
    arcType: string,
    contentLength: 'short' | 'medium' | 'long' | 'epic'
  ): Promise<{
    arcStructure: Array<{
      phase: string;
      description: string;
      emotionalTarget: string;
      toneGuidance: string;
    }>;
    pacingRecommendations: string[];
    transitionGuidance: string[];
  }> {
    const arcStructure = this.generateEmotionalArcStructure(arcType, contentLength);
    const pacingRecommendations = this.generatePacingRecommendations(arcType, contentLength);
    const transitionGuidance = this.generateTransitionGuidance(arcType);

    return {
      arcStructure,
      pacingRecommendations,
      transitionGuidance
    };
  }

  // Private helper methods

  private applyCoreTonesAdaptations(
    basePrompt: string,
    toneTemplate: any,
    intensity: string
  ): {
    prompt: string;
    enhancements: string[];
    languageAdjustments: string[];
    atmosphericChanges: string[];
  } {
    const enhancements: string[] = [];
    const languageAdjustments: string[] = [];
    const atmosphericChanges: string[] = [];
    let adaptedPrompt = basePrompt;

    // Apply core tone atmosphere
    adaptedPrompt += `\n\n## TONE ATMOSPHERE: ${toneTemplate.core.atmosphere}`;
    atmosphericChanges.push(toneTemplate.core.atmosphere);
    enhancements.push('Applied core tone atmosphere');

    // Apply language style
    adaptedPrompt += `\n\n## LANGUAGE STYLE: ${toneTemplate.core.language}`;
    languageAdjustments.push(toneTemplate.core.language);
    enhancements.push('Applied tone-specific language style');

    // Apply thematic focus
    adaptedPrompt += `\n\n## THEMATIC FOCUS: ${toneTemplate.core.themes}`;
    enhancements.push('Applied thematic tone elements');

    // Apply emotional guidance
    adaptedPrompt += `\n\n## EMOTIONAL TONE: ${toneTemplate.core.emotions}`;
    enhancements.push('Applied emotional tone guidance');

    // Apply imagery style
    adaptedPrompt += `\n\n## IMAGERY STYLE: ${toneTemplate.core.imagery}`;
    enhancements.push('Applied tone-appropriate imagery');

    // Apply intensity-specific adjustments
    const intensityGuidance = toneTemplate.intensity[intensity];
    if (intensityGuidance) {
      adaptedPrompt += `\n\n## INTENSITY GUIDANCE (${intensity.toUpperCase()}): ${intensityGuidance}`;
      enhancements.push(`Applied ${intensity} intensity level`);
    }

    return { prompt: adaptedPrompt, enhancements, languageAdjustments, atmosphericChanges };
  }

  private applyContentTypeAdaptations(
    prompt: string,
    toneTemplate: any,
    contentType: string
  ): { prompt: string; enhancements: string[]; atmosphericChanges: string[] } {
    const enhancements: string[] = [];
    const atmosphericChanges: string[] = [];
    let adaptedPrompt = prompt;

    const contentAdaptation = toneTemplate.contentAdaptations[contentType];
    if (contentAdaptation) {
      adaptedPrompt += `\n\n## ${contentType.toUpperCase()} TONE ADAPTATION: ${contentAdaptation}`;
      enhancements.push(`Applied ${contentType}-specific tone adaptation`);
      atmosphericChanges.push(contentAdaptation);
    }

    return { prompt: adaptedPrompt, enhancements, atmosphericChanges };
  }

  private applyAudienceAdjustments(
    prompt: string,
    targetAudience: string | undefined,
    baseTone: string
  ): { prompt: string; enhancements: string[]; languageAdjustments: string[] } {
    const enhancements: string[] = [];
    const languageAdjustments: string[] = [];
    let adjustedPrompt = prompt;

    if (targetAudience && AUDIENCE_TONE_ADJUSTMENTS[targetAudience as keyof typeof AUDIENCE_TONE_ADJUSTMENTS]) {
      const audienceAdjustment = AUDIENCE_TONE_ADJUSTMENTS[targetAudience as keyof typeof AUDIENCE_TONE_ADJUSTMENTS];
      
      adjustedPrompt += `\n\n## AUDIENCE LANGUAGE (${targetAudience.toUpperCase()}): ${audienceAdjustment.language}`;
      languageAdjustments.push(audienceAdjustment.language);
      enhancements.push(`Applied ${targetAudience} audience language`);

      adjustedPrompt += `\n\n## AUDIENCE THEMES: ${audienceAdjustment.themes}`;
      enhancements.push(`Applied ${targetAudience} appropriate themes`);

      adjustedPrompt += `\n\n## CONTENT RESTRICTIONS: ${audienceAdjustment.restrictions}`;
      enhancements.push(`Applied ${targetAudience} content restrictions`);

      adjustedPrompt += `\n\n## AUDIENCE ENHANCEMENTS: ${audienceAdjustment.enhancements}`;
      enhancements.push(`Applied ${targetAudience} content enhancements`);
    }

    return { prompt: adjustedPrompt, enhancements, languageAdjustments };
  }

  private applySecondaryTones(
    prompt: string,
    secondaryTones: string[]
  ): { prompt: string; enhancements: string[] } {
    const enhancements: string[] = [];
    let adaptedPrompt = prompt;

    if (secondaryTones.length > 0) {
      adaptedPrompt += `\n\n## SECONDARY TONES: Subtly incorporate elements of ${secondaryTones.join(', ')} to add depth and complexity to the primary tone.`;
      enhancements.push(`Applied secondary tones: ${secondaryTones.join(', ')}`);
    }

    return { prompt: adaptedPrompt, enhancements };
  }

  private generateEmotionalGuidance(
    toneTemplate: any,
    request: ToneAdaptiveRequest
  ): Record<string, any> {
    return {
      primaryEmotions: toneTemplate.core.emotions,
      emotionalArc: request.emotionalArc || 'stable',
      intensityLevel: request.intensity || 'moderate',
      audienceConsiderations: request.targetAudience ? 
        AUDIENCE_TONE_ADJUSTMENTS[request.targetAudience as keyof typeof AUDIENCE_TONE_ADJUSTMENTS]?.themes : 
        'General audience',
      emotionalPacing: this.generateEmotionalPacing(request.emotionalArc || 'stable'),
      moodTransitions: this.generateMoodTransitions(toneTemplate.core.emotions)
    };
  }

  private createToneConsistencyRules(tone: string, intensity: string): string[] {
    const rules: string[] = [];

    rules.push(`Maintain ${tone} tone throughout all content elements`);
    rules.push(`Apply ${intensity} intensity level consistently`);
    rules.push('Ensure language choices support the established tone');
    rules.push('Verify that all descriptions reinforce the emotional atmosphere');
    rules.push('Check that character actions and dialogue match the tone');

    // Add tone-specific rules
    switch (tone) {
      case 'dark':
        rules.push('Avoid overly optimistic outcomes without narrative justification');
        rules.push('Ensure consequences feel weighty and meaningful');
        break;
      case 'light':
        rules.push('Maintain hope even in challenging situations');
        rules.push('Focus on positive character growth and relationships');
        break;
      case 'humorous':
        rules.push('Balance comedy with story progression');
        rules.push('Ensure humor enhances rather than undermines character development');
        break;
      case 'mysterious':
        rules.push('Maintain intrigue without frustrating confusion');
        rules.push('Provide enough clues to keep engagement high');
        break;
    }

    return rules;
  }

  private calculateToneQualityMetrics(
    adaptedPrompt: string,
    request: ToneAdaptiveRequest
  ): {
    toneAuthenticity: number;
    emotionalResonance: number;
    audienceAppropriate: number;
    toneConsistency: number;
  } {
    // Simulate quality metric calculations
    const toneAuthenticity = 0.85 + Math.random() * 0.15;
    const emotionalResonance = 0.8 + Math.random() * 0.2;
    const audienceAppropriate = request.targetAudience ? 0.9 + Math.random() * 0.1 : 0.8;
    const toneConsistency = 0.88 + Math.random() * 0.12;

    return {
      toneAuthenticity,
      emotionalResonance,
      audienceAppropriate,
      toneConsistency
    };
  }

  private async adaptContentForTone(
    content: string,
    tone: string,
    toneTemplate: any
  ): Promise<string> {
    let adaptedContent = content;
    
    // Apply tone-specific language transformations
    adaptedContent += `\n\nTONE ADAPTATION (${tone.toUpperCase()}):`;
    adaptedContent += `\nAtmosphere: ${toneTemplate.core.atmosphere}`;
    adaptedContent += `\nLanguage: ${toneTemplate.core.language}`;
    adaptedContent += `\nEmotions: ${toneTemplate.core.emotions}`;

    return adaptedContent;
  }

  private describeEmotionalShift(tone: string, toneTemplate: any): string {
    return `Shifts emotional focus to ${toneTemplate.core.emotions}`;
  }

  private describeAudienceImpact(tone: string): string {
    const impacts: Record<string, string> = {
      dark: 'Creates tension and emotional weight, suitable for mature audiences',
      light: 'Provides comfort and optimism, suitable for all audiences',
      serious: 'Demands attention and respect, appropriate for thoughtful engagement',
      humorous: 'Entertains and delights, accessible to broad audiences',
      mysterious: 'Engages curiosity and intellect, appeals to puzzle-lovers',
      heroic: 'Inspires and motivates, appeals to those seeking epic narratives',
      gritty: 'Challenges and provokes, suitable for audiences seeking realism',
      whimsical: 'Charms and enchants, particularly appealing to imaginative audiences'
    };

    return impacts[tone] || 'Provides unique emotional experience';
  }

  private identifyToneMarkers(content: string, toneTemplate: any): string[] {
    const markers: string[] = [];
    const contentLower = content.toLowerCase();

    // Check for emotional keywords
    const emotionWords = toneTemplate.core.emotions.toLowerCase().split(/[,\s]+/);
    emotionWords.forEach((word: string) => {
      if (word.length > 3 && contentLower.includes(word)) {
        markers.push(`emotion: ${word}`);
      }
    });

    // Check for thematic keywords
    const themeWords = toneTemplate.core.themes.toLowerCase().split(/[,\s]+/);
    themeWords.forEach((word: string) => {
      if (word.length > 3 && contentLower.includes(word)) {
        markers.push(`theme: ${word}`);
      }
    });

    // Check for imagery keywords
    const imageryWords = toneTemplate.core.imagery.toLowerCase().split(/[,\s]+/);
    imageryWords.forEach((word: string) => {
      if (word.length > 3 && contentLower.includes(word)) {
        markers.push(`imagery: ${word}`);
      }
    });

    return markers;
  }

  private identifyInconsistentElements(content: string, toneTemplate: any): string[] {
    // This would analyze content for elements that contradict the intended tone
    // Placeholder implementation
    return [];
  }

  private calculateConsistencyScore(toneMarkers: string[], inconsistentElements: string[]): number {
    const positiveScore = Math.min(toneMarkers.length / 10, 1); // Normalize to 0-1
    const negativeScore = Math.min(inconsistentElements.length / 5, 1);
    return Math.max(0, positiveScore - negativeScore);
  }

  private generateToneImprovements(inconsistentElements: string[], toneTemplate: any): string[] {
    const improvements: string[] = [];

    if (inconsistentElements.length > 0) {
      improvements.push('Remove or modify elements that contradict the intended tone');
      improvements.push('Strengthen tone-appropriate language and imagery');
    } else {
      improvements.push('Tone consistency is strong across the content');
    }

    improvements.push(`Enhance ${toneTemplate.core.emotions} emotional elements`);
    improvements.push(`Strengthen ${toneTemplate.core.themes} thematic content`);

    return improvements;
  }

  private generateEmotionalArcStructure(
    arcType: string,
    contentLength: string
  ): Array<{
    phase: string;
    description: string;
    emotionalTarget: string;
    toneGuidance: string;
  }> {
    const structures: Record<string, any> = {
      rising: [
        { phase: 'Opening', description: 'Establish baseline emotional state', emotionalTarget: 'Neutral to positive', toneGuidance: 'Set foundation for growth' },
        { phase: 'Development', description: 'Gradually increase emotional intensity', emotionalTarget: 'Building excitement', toneGuidance: 'Escalate gradually' },
        { phase: 'Climax', description: 'Reach peak emotional intensity', emotionalTarget: 'Maximum engagement', toneGuidance: 'Deliver emotional payoff' }
      ],
      falling: [
        { phase: 'Opening', description: 'Start with high emotional intensity', emotionalTarget: 'Peak engagement', toneGuidance: 'Establish strong emotional hook' },
        { phase: 'Development', description: 'Gradually reduce intensity', emotionalTarget: 'Controlled descent', toneGuidance: 'Maintain interest while reducing tension' },
        { phase: 'Resolution', description: 'Settle into calm resolution', emotionalTarget: 'Peaceful conclusion', toneGuidance: 'Provide satisfying closure' }
      ],
      stable: [
        { phase: 'Consistent', description: 'Maintain steady emotional tone', emotionalTarget: 'Stable engagement', toneGuidance: 'Keep consistent emotional level' }
      ]
    };

    return structures[arcType] || structures.stable;
  }

  private generatePacingRecommendations(arcType: string, contentLength: string): string[] {
    const recommendations: string[] = [];

    switch (arcType) {
      case 'rising':
        recommendations.push('Start with slower pacing and gradually increase');
        recommendations.push('Build tension through incremental reveals');
        break;
      case 'falling':
        recommendations.push('Begin with intense pacing and gradually slow');
        recommendations.push('Allow time for emotional processing');
        break;
      case 'stable':
        recommendations.push('Maintain consistent pacing throughout');
        recommendations.push('Use variety within the stable framework');
        break;
    }

    // Add length-specific recommendations
    switch (contentLength) {
      case 'short':
        recommendations.push('Focus on immediate emotional impact');
        break;
      case 'long':
        recommendations.push('Allow for multiple emotional beats and development');
        break;
      case 'epic':
        recommendations.push('Plan for multiple emotional arcs within the larger structure');
        break;
    }

    return recommendations;
  }

  private generateTransitionGuidance(arcType: string): string[] {
    const guidance: string[] = [];

    guidance.push('Use transitional phrases to smooth emotional shifts');
    guidance.push('Provide breathing room between intense emotional moments');
    guidance.push('Ensure transitions feel natural and motivated');

    switch (arcType) {
      case 'rising':
        guidance.push('Each transition should increase stakes or intensity');
        break;
      case 'falling':
        guidance.push('Each transition should provide resolution or relief');
        break;
      case 'cyclical':
        guidance.push('Plan for returns to previous emotional states');
        break;
    }

    return guidance;
  }

  private generateEmotionalPacing(emotionalArc: string): string {
    const pacing: Record<string, string> = {
      rising: 'Start calm and gradually build emotional intensity',
      falling: 'Begin with high emotion and gradually resolve to calm',
      stable: 'Maintain consistent emotional level with minor variations',
      cyclical: 'Alternate between emotional highs and lows in cycles',
      chaotic: 'Vary emotional intensity unpredictably for dramatic effect'
    };

    return pacing[emotionalArc] || pacing.stable;
  }

  private generateMoodTransitions(emotions: string): string[] {
    return [
      'Use environmental changes to support mood shifts',
      'Allow character actions to drive emotional transitions',
      'Employ pacing changes to enhance mood transitions',
      `Focus on ${emotions} as the primary emotional palette`
    ];
  }
}

export const toneAdaptiveGeneration = new ToneAdaptiveGeneration();