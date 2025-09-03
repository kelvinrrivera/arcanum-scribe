import { z } from 'zod';

// Schema for genre-specific optimization
const GenreOptimizationRequestSchema = z.object({
  genre: z.enum(['fantasy', 'scifi', 'horror', 'modern', 'historical', 'cyberpunk', 'steampunk', 'post_apocalyptic', 'superhero', 'mystery']),
  setting: z.string().optional(),
  subgenre: z.string().optional(),
  contentType: z.enum(['adventure', 'npc', 'monster', 'location', 'item', 'image']),
  basePrompt: z.string(),
  tone: z.enum(['dark', 'light', 'serious', 'humorous', 'mysterious', 'heroic', 'gritty', 'whimsical']).optional(),
  complexity: z.enum(['simple', 'moderate', 'complex', 'intricate']).optional(),
  targetAudience: z.enum(['casual', 'experienced', 'expert', 'mixed']).optional()
});

const GenreOptimizedResponseSchema = z.object({
  originalPrompt: z.string(),
  optimizedPrompt: z.string(),
  genreEnhancements: z.array(z.string()),
  settingAdaptations: z.array(z.string()),
  toneAdjustments: z.array(z.string()),
  genreSpecificElements: z.record(z.any()),
  qualityMetrics: z.object({
    genreAuthenticity: z.number(),
    settingCoherence: z.number(),
    toneConsistency: z.number(),
    audienceAppropriate: z.number()
  })
});

type GenreOptimizationRequest = z.infer<typeof GenreOptimizationRequestSchema>;
type GenreOptimizedResponse = z.infer<typeof GenreOptimizedResponseSchema>;

// Genre-specific prompt templates and enhancements
const GENRE_TEMPLATES = {
  fantasy: {
    core: {
      worldBuilding: "Rich magical world with established lore, diverse races, and complex magic systems",
      atmosphere: "Epic scope with wonder, danger, and the clash between good and evil",
      elements: ["magic systems", "mythical creatures", "ancient prophecies", "heroic quests", "magical artifacts"],
      tone: "Epic and wondrous with elements of danger and mystery",
      language: "Elevated, descriptive language with archaic touches where appropriate"
    },
    adventure: {
      structure: "Classic hero's journey with magical challenges and mythical encounters",
      encounters: "Dragons, wizards, magical creatures, and supernatural phenomena",
      rewards: "Magical items, ancient knowledge, and legendary status",
      themes: "Good vs evil, destiny, sacrifice, and the power of friendship"
    },
    npc: {
      archetypes: ["wise mentor", "mysterious wizard", "noble knight", "cunning rogue", "ancient sage"],
      motivations: "Honor, destiny, magical power, protecting the realm, ancient grudges",
      speech: "Formal or archaic patterns, references to lore and legend",
      relationships: "Bound by oaths, prophecies, and ancient alliances"
    },
    visual: {
      palette: "Rich jewel tones, magical glows, earth tones with metallic accents",
      lighting: "Dramatic with magical illumination, torch light, and mystical auras",
      architecture: "Medieval castles, ancient ruins, magical towers, and enchanted forests",
      details: "Intricate magical symbols, ornate armor, flowing robes, and mystical effects"
    }
  },

  scifi: {
    core: {
      worldBuilding: "Advanced technology, space travel, alien civilizations, and scientific concepts",
      atmosphere: "Wonder of discovery balanced with technological dangers and cosmic scale",
      elements: ["advanced technology", "alien species", "space exploration", "scientific concepts", "future societies"],
      tone: "Analytical and forward-thinking with elements of wonder and caution",
      language: "Technical precision with scientific terminology and futuristic concepts"
    },
    adventure: {
      structure: "Exploration and discovery with technological challenges and alien encounters",
      encounters: "Alien species, AI systems, technological hazards, and cosmic phenomena",
      rewards: "Advanced technology, scientific knowledge, and galactic influence",
      themes: "Progress vs tradition, humanity's place in the universe, technology's impact"
    },
    npc: {
      archetypes: ["brilliant scientist", "alien diplomat", "cybernetic enhanced", "space explorer", "AI entity"],
      motivations: "Scientific discovery, technological advancement, survival, exploration",
      speech: "Technical jargon, logical patterns, references to scientific concepts",
      relationships: "Professional collaborations, species alliances, and technological dependencies"
    },
    visual: {
      palette: "Cool blues and silvers, neon accents, stark whites with colored lighting",
      lighting: "Artificial illumination, holographic displays, and energy effects",
      architecture: "Sleek futuristic designs, space stations, alien structures, and high-tech facilities",
      details: "Technological interfaces, energy weapons, cybernetic implants, and alien features"
    }
  },

  horror: {
    core: {
      worldBuilding: "Dark, threatening environments where danger lurks in shadows and normalcy is corrupted",
      atmosphere: "Tension, dread, and psychological unease with supernatural or psychological threats",
      elements: ["supernatural entities", "psychological terror", "body horror", "cosmic horror", "haunted locations"],
      tone: "Dark, foreboding, and psychologically unsettling",
      language: "Atmospheric descriptions emphasizing dread, decay, and the unknown"
    },
    adventure: {
      structure: "Investigation and survival with escalating horror and psychological pressure",
      encounters: "Supernatural entities, psychological horrors, and corrupted humans",
      rewards: "Survival, knowledge of dark truths, and psychological resilience",
      themes: "Fear of the unknown, corruption of innocence, survival against impossible odds"
    },
    npc: {
      archetypes: ["tormented victim", "mysterious stranger", "corrupted authority", "supernatural entity", "paranoid survivor"],
      motivations: "Survival, revenge, madness, supernatural compulsion, desperate protection",
      speech: "Fearful whispers, cryptic warnings, mad ravings, or unnaturally calm delivery",
      relationships: "Mistrust, desperation, supernatural bonds, and corrupted loyalties"
    },
    visual: {
      palette: "Dark colors, blood reds, sickly greens, and stark black and white contrasts",
      lighting: "Harsh shadows, flickering lights, unnatural illumination, and oppressive darkness",
      architecture: "Decaying buildings, twisted landscapes, claustrophobic spaces, and impossible geometries",
      details: "Gore and decay, supernatural manifestations, psychological symbols, and disturbing imagery"
    }
  },

  modern: {
    core: {
      worldBuilding: "Contemporary settings with realistic technology, current social issues, and familiar environments",
      atmosphere: "Grounded realism with contemporary challenges and relatable situations",
      elements: ["current technology", "social media", "urban environments", "contemporary politics", "modern professions"],
      tone: "Realistic and relatable with contemporary sensibilities",
      language: "Modern vernacular with current slang and references"
    },
    adventure: {
      structure: "Realistic challenges with contemporary obstacles and modern solutions",
      encounters: "Corporate espionage, urban crime, social conflicts, and technological challenges",
      rewards: "Money, influence, justice, and personal growth",
      themes: "Social justice, corporate corruption, personal relationships, and modern survival"
    },
    npc: {
      archetypes: ["corporate executive", "street-smart local", "tech specialist", "law enforcement", "social activist"],
      motivations: "Career advancement, social justice, personal survival, family protection, financial gain",
      speech: "Contemporary dialogue with modern references and current slang",
      relationships: "Professional networks, social media connections, and contemporary social dynamics"
    },
    visual: {
      palette: "Realistic colors, urban grays, neon signs, and contemporary fashion colors",
      lighting: "Natural and artificial city lighting, screen glows, and realistic illumination",
      architecture: "Modern buildings, urban landscapes, contemporary interiors, and familiar locations",
      details: "Modern technology, contemporary fashion, urban details, and realistic textures"
    }
  },

  cyberpunk: {
    core: {
      worldBuilding: "High-tech dystopian future with corporate control, cybernetic enhancement, and digital realities",
      atmosphere: "Neon-soaked urban decay with technological wonder and social inequality",
      elements: ["cybernetic implants", "virtual reality", "corporate megastructures", "street culture", "digital consciousness"],
      tone: "Gritty and rebellious with technological awe and social criticism",
      language: "Tech slang mixed with street vernacular and corporate speak"
    },
    adventure: {
      structure: "Corporate heists, digital infiltration, and street-level survival in a high-tech world",
      encounters: "Corporate security, rogue AIs, cybernetic gangs, and virtual entities",
      rewards: "Cutting-edge tech, digital freedom, corporate secrets, and street credibility",
      themes: "Corporate vs individual, human vs machine, reality vs virtual, rebellion vs conformity"
    },
    npc: {
      archetypes: ["corporate suit", "street samurai", "netrunner hacker", "cybernetic punk", "AI construct"],
      motivations: "Corporate advancement, digital freedom, survival, technological transcendence, rebellion",
      speech: "Tech jargon, street slang, corporate doublespeak, and digital metaphors",
      relationships: "Corporate hierarchies, street gangs, hacker collectives, and digital networks"
    },
    visual: {
      palette: "Neon colors against dark backgrounds, electric blues, hot pinks, and chrome reflections",
      lighting: "Neon signs, holographic displays, cybernetic glows, and harsh artificial light",
      architecture: "Towering megastructures, urban decay, high-tech interiors, and virtual environments",
      details: "Cybernetic implants, holographic interfaces, neon advertisements, and digital effects"
    }
  }
};

// Setting-specific enhancements
const SETTING_ENHANCEMENTS = {
  urban: {
    atmosphere: "Bustling city life with crowds, traffic, and vertical architecture",
    encounters: "Street gangs, corporate entities, urban wildlife, and social dynamics",
    elements: ["skyscrapers", "public transport", "diverse neighborhoods", "street culture", "urban decay"]
  },
  wilderness: {
    atmosphere: "Natural beauty and danger with isolation and primal challenges",
    encounters: "Wild animals, natural hazards, indigenous peoples, and environmental challenges",
    elements: ["dense forests", "mountain ranges", "rivers and lakes", "weather patterns", "natural resources"]
  },
  underground: {
    atmosphere: "Claustrophobic darkness with hidden secrets and ancient mysteries",
    encounters: "Subterranean creatures, cave-ins, underground societies, and lost civilizations",
    elements: ["tunnel networks", "underground rivers", "crystal formations", "ancient ruins", "bioluminescence"]
  },
  space: {
    atmosphere: "Vast emptiness with cosmic wonder and technological marvels",
    encounters: "Alien species, space phenomena, technological failures, and cosmic entities",
    elements: ["space stations", "alien worlds", "asteroid fields", "nebulae", "zero gravity"]
  },
  aquatic: {
    atmosphere: "Fluid movement with pressure and the mystery of the depths",
    encounters: "Sea creatures, underwater civilizations, pressure effects, and maritime hazards",
    elements: ["coral reefs", "deep trenches", "underwater cities", "marine life", "water pressure"]
  }
};

// Tone-specific adaptations
const TONE_ADAPTATIONS = {
  dark: {
    language: "Emphasize shadows, decay, corruption, and moral ambiguity",
    themes: "Betrayal, loss, sacrifice, and the cost of power",
    atmosphere: "Oppressive, foreboding, and psychologically heavy"
  },
  light: {
    language: "Emphasize hope, heroism, friendship, and positive outcomes",
    themes: "Redemption, triumph, cooperation, and the power of good",
    atmosphere: "Uplifting, optimistic, and emotionally warm"
  },
  serious: {
    language: "Formal, respectful, and focused on important consequences",
    themes: "Duty, responsibility, sacrifice, and meaningful choices",
    atmosphere: "Weighty, consequential, and emotionally significant"
  },
  humorous: {
    language: "Witty dialogue, amusing situations, and clever wordplay",
    themes: "Friendship, absurdity, clever solutions, and lighthearted adventure",
    atmosphere: "Playful, entertaining, and emotionally light"
  },
  mysterious: {
    language: "Cryptic descriptions, hidden meanings, and gradual revelation",
    themes: "Secrets, discovery, hidden truths, and the unknown",
    atmosphere: "Intriguing, suspenseful, and intellectually engaging"
  },
  heroic: {
    language: "Noble actions, inspiring speeches, and epic achievements",
    themes: "Courage, justice, protection of innocents, and legendary deeds",
    atmosphere: "Inspiring, epic, and emotionally stirring"
  },
  gritty: {
    language: "Harsh realities, difficult choices, and realistic consequences",
    themes: "Survival, moral complexity, hard-won victories, and personal cost",
    atmosphere: "Raw, uncompromising, and emotionally challenging"
  },
  whimsical: {
    language: "Playful descriptions, magical wonder, and delightful surprises",
    themes: "Wonder, creativity, unexpected friendships, and magical solutions",
    atmosphere: "Charming, imaginative, and emotionally delightful"
  }
};

export class GenreSpecificOptimization {
  /**
   * Optimize prompt for specific genre and setting
   */
  async optimizeForGenre(request: GenreOptimizationRequest): Promise<GenreOptimizedResponse> {
    const validatedRequest = GenreOptimizationRequestSchema.parse(request);
    
    // Get genre-specific template
    const genreTemplate = GENRE_TEMPLATES[validatedRequest.genre];
    if (!genreTemplate) {
      throw new Error(`Unsupported genre: ${validatedRequest.genre}`);
    }

    // Apply genre-specific enhancements
    const genreEnhancements = this.applyGenreEnhancements(
      validatedRequest.basePrompt,
      genreTemplate,
      validatedRequest.contentType
    );

    // Apply setting-specific adaptations
    const settingAdaptations = this.applySettingAdaptations(
      genreEnhancements.prompt,
      validatedRequest.setting,
      validatedRequest.genre
    );

    // Apply tone adjustments
    const toneAdjustments = this.applyToneAdjustments(
      settingAdaptations.prompt,
      validatedRequest.tone,
      validatedRequest.genre
    );

    // Generate genre-specific elements
    const genreSpecificElements = this.generateGenreElements(
      validatedRequest.genre,
      validatedRequest.contentType,
      validatedRequest.subgenre
    );

    // Calculate quality metrics
    const qualityMetrics = this.calculateGenreQualityMetrics(
      toneAdjustments.prompt,
      validatedRequest
    );

    return {
      originalPrompt: validatedRequest.basePrompt,
      optimizedPrompt: toneAdjustments.prompt,
      genreEnhancements: genreEnhancements.enhancements,
      settingAdaptations: settingAdaptations.adaptations,
      toneAdjustments: toneAdjustments.adjustments,
      genreSpecificElements,
      qualityMetrics
    };
  }

  /**
   * Get available genres and their characteristics
   */
  getGenreInformation(): Record<string, {
    description: string;
    commonSettings: string[];
    typicalTones: string[];
    keyElements: string[];
    contentTypes: string[];
  }> {
    const genreInfo: Record<string, any> = {};

    Object.entries(GENRE_TEMPLATES).forEach(([genre, template]) => {
      genreInfo[genre] = {
        description: template.core.atmosphere,
        commonSettings: this.getCommonSettings(genre),
        typicalTones: this.getTypicalTones(genre),
        keyElements: template.core.elements,
        contentTypes: ['adventure', 'npc', 'monster', 'location', 'item', 'image']
      };
    });

    return genreInfo;
  }

  /**
   * Get setting-specific recommendations for a genre
   */
  getSettingRecommendations(genre: string): {
    recommendedSettings: Array<{
      name: string;
      description: string;
      atmosphere: string;
      commonElements: string[];
    }>;
    customSettingGuidelines: string[];
  } {
    const recommendedSettings = Object.entries(SETTING_ENHANCEMENTS).map(([setting, enhancement]) => ({
      name: setting,
      description: enhancement.atmosphere,
      atmosphere: enhancement.atmosphere,
      commonElements: enhancement.elements
    }));

    const customSettingGuidelines = [
      'Consider the genre\'s core themes and atmosphere',
      'Ensure setting elements support the intended tone',
      'Include genre-appropriate challenges and opportunities',
      'Balance familiar and unique elements for engagement'
    ];

    return {
      recommendedSettings,
      customSettingGuidelines
    };
  }

  /**
   * Generate tone-adaptive variations for content
   */
  async generateToneVariations(
    baseContent: string,
    genre: string,
    availableTones: string[] = ['dark', 'light', 'serious', 'humorous']
  ): Promise<Array<{
    tone: string;
    adaptedContent: string;
    toneElements: string[];
    atmosphereChange: string;
  }>> {
    const variations: Array<{
      tone: string;
      adaptedContent: string;
      toneElements: string[];
      atmosphereChange: string;
    }> = [];

    for (const tone of availableTones) {
      const toneAdaptation = TONE_ADAPTATIONS[tone as keyof typeof TONE_ADAPTATIONS];
      if (!toneAdaptation) continue;

      const adaptedContent = this.adaptContentForTone(baseContent, tone, genre);
      const toneElements = this.extractToneElements(toneAdaptation);
      const atmosphereChange = toneAdaptation.atmosphere;

      variations.push({
        tone,
        adaptedContent,
        toneElements,
        atmosphereChange
      });
    }

    return variations;
  }

  /**
   * Analyze genre authenticity of content
   */
  async analyzeGenreAuthenticity(
    content: string,
    expectedGenre: string
  ): Promise<{
    authenticityScore: number;
    genreMarkers: string[];
    missingElements: string[];
    improvementSuggestions: string[];
  }> {
    const genreTemplate = GENRE_TEMPLATES[expectedGenre as keyof typeof GENRE_TEMPLATES];
    if (!genreTemplate) {
      throw new Error(`Unknown genre: ${expectedGenre}`);
    }

    // Analyze content for genre markers
    const genreMarkers = this.identifyGenreMarkers(content, genreTemplate);
    const missingElements = this.identifyMissingElements(content, genreTemplate);
    const authenticityScore = this.calculateAuthenticityScore(genreMarkers, missingElements, genreTemplate);
    const improvementSuggestions = this.generateImprovementSuggestions(missingElements, genreTemplate);

    return {
      authenticityScore,
      genreMarkers,
      missingElements,
      improvementSuggestions
    };
  }

  // Private helper methods

  private applyGenreEnhancements(
    basePrompt: string,
    genreTemplate: any,
    contentType: string
  ): { prompt: string; enhancements: string[] } {
    const enhancements: string[] = [];
    let enhancedPrompt = basePrompt;

    // Add core genre elements
    enhancedPrompt += `\n\n## GENRE: ${genreTemplate.core.worldBuilding}`;
    enhancements.push('Applied core genre world-building');

    enhancedPrompt += `\n\n## ATMOSPHERE: ${genreTemplate.core.atmosphere}`;
    enhancements.push('Applied genre-specific atmosphere');

    enhancedPrompt += `\n\n## LANGUAGE STYLE: ${genreTemplate.core.language}`;
    enhancements.push('Applied genre-appropriate language style');

    // Add content-type specific enhancements
    const contentTemplate = genreTemplate[contentType];
    if (contentTemplate) {
      Object.entries(contentTemplate).forEach(([key, value]) => {
        enhancedPrompt += `\n\n## ${key.toUpperCase()}: ${value}`;
        enhancements.push(`Applied ${contentType}-specific ${key} guidelines`);
      });
    }

    // Add genre elements
    enhancedPrompt += `\n\n## KEY ELEMENTS TO INCLUDE: ${genreTemplate.core.elements.join(', ')}`;
    enhancements.push('Added genre-specific key elements');

    return { prompt: enhancedPrompt, enhancements };
  }

  private applySettingAdaptations(
    prompt: string,
    setting: string | undefined,
    genre: string
  ): { prompt: string; adaptations: string[] } {
    const adaptations: string[] = [];
    let adaptedPrompt = prompt;

    if (setting && SETTING_ENHANCEMENTS[setting as keyof typeof SETTING_ENHANCEMENTS]) {
      const settingEnhancement = SETTING_ENHANCEMENTS[setting as keyof typeof SETTING_ENHANCEMENTS];
      
      adaptedPrompt += `\n\n## SETTING ATMOSPHERE: ${settingEnhancement.atmosphere}`;
      adaptations.push(`Applied ${setting} setting atmosphere`);

      adaptedPrompt += `\n\n## SETTING ELEMENTS: ${settingEnhancement.elements.join(', ')}`;
      adaptations.push(`Added ${setting} setting elements`);

      adaptedPrompt += `\n\n## SETTING ENCOUNTERS: ${settingEnhancement.encounters}`;
      adaptations.push(`Applied ${setting} encounter types`);
    }

    return { prompt: adaptedPrompt, adaptations };
  }

  private applyToneAdjustments(
    prompt: string,
    tone: string | undefined,
    genre: string
  ): { prompt: string; adjustments: string[] } {
    const adjustments: string[] = [];
    let adjustedPrompt = prompt;

    if (tone && TONE_ADAPTATIONS[tone as keyof typeof TONE_ADAPTATIONS]) {
      const toneAdaptation = TONE_ADAPTATIONS[tone as keyof typeof TONE_ADAPTATIONS];
      
      adjustedPrompt += `\n\n## TONE LANGUAGE: ${toneAdaptation.language}`;
      adjustments.push(`Applied ${tone} language style`);

      adjustedPrompt += `\n\n## TONE THEMES: ${toneAdaptation.themes}`;
      adjustments.push(`Applied ${tone} thematic elements`);

      adjustedPrompt += `\n\n## TONE ATMOSPHERE: ${toneAdaptation.atmosphere}`;
      adjustments.push(`Applied ${tone} atmospheric guidance`);
    }

    return { prompt: adjustedPrompt, adjustments };
  }

  private generateGenreElements(
    genre: string,
    contentType: string,
    subgenre?: string
  ): Record<string, any> {
    const genreTemplate = GENRE_TEMPLATES[genre as keyof typeof GENRE_TEMPLATES];
    if (!genreTemplate) return {};

    const elements: Record<string, any> = {
      coreElements: genreTemplate.core.elements,
      worldBuilding: genreTemplate.core.worldBuilding,
      atmosphere: genreTemplate.core.atmosphere,
      language: genreTemplate.core.language
    };

    // Add content-type specific elements
    const contentTemplate = genreTemplate[contentType as keyof typeof genreTemplate];
    if (contentTemplate) {
      elements.contentSpecific = contentTemplate;
    }

    // Add visual elements if available
    if (genreTemplate.visual) {
      elements.visual = genreTemplate.visual;
    }

    // Add subgenre elements if specified
    if (subgenre) {
      elements.subgenre = this.getSubgenreElements(genre, subgenre);
    }

    return elements;
  }

  private calculateGenreQualityMetrics(
    optimizedPrompt: string,
    request: GenreOptimizationRequest
  ): {
    genreAuthenticity: number;
    settingCoherence: number;
    toneConsistency: number;
    audienceAppropriate: number;
  } {
    // Simulate quality metric calculations
    // In a real implementation, these would analyze the prompt content
    
    const genreAuthenticity = 0.85 + Math.random() * 0.15; // High authenticity
    const settingCoherence = request.setting ? 0.8 + Math.random() * 0.2 : 0.7;
    const toneConsistency = request.tone ? 0.85 + Math.random() * 0.15 : 0.75;
    const audienceAppropriate = this.calculateAudienceScore(request.targetAudience);

    return {
      genreAuthenticity,
      settingCoherence,
      toneConsistency,
      audienceAppropriate
    };
  }

  private calculateAudienceScore(targetAudience?: string): number {
    switch (targetAudience) {
      case 'casual': return 0.8 + Math.random() * 0.2;
      case 'experienced': return 0.85 + Math.random() * 0.15;
      case 'expert': return 0.9 + Math.random() * 0.1;
      case 'mixed': return 0.75 + Math.random() * 0.25;
      default: return 0.8;
    }
  }

  private getCommonSettings(genre: string): string[] {
    const settingsByGenre: Record<string, string[]> = {
      fantasy: ['medieval kingdoms', 'magical forests', 'ancient ruins', 'mystical realms'],
      scifi: ['space stations', 'alien worlds', 'futuristic cities', 'research facilities'],
      horror: ['haunted houses', 'abandoned hospitals', 'dark forests', 'cursed towns'],
      modern: ['urban cities', 'suburban neighborhoods', 'corporate offices', 'college campuses'],
      cyberpunk: ['neon cities', 'corporate arcologies', 'virtual reality', 'underground networks']
    };

    return settingsByGenre[genre] || ['various settings'];
  }

  private getTypicalTones(genre: string): string[] {
    const tonesByGenre: Record<string, string[]> = {
      fantasy: ['heroic', 'mysterious', 'whimsical'],
      scifi: ['serious', 'mysterious', 'dark'],
      horror: ['dark', 'gritty', 'mysterious'],
      modern: ['serious', 'light', 'gritty'],
      cyberpunk: ['dark', 'gritty', 'serious']
    };

    return tonesByGenre[genre] || ['serious'];
  }

  private adaptContentForTone(content: string, tone: string, genre: string): string {
    const toneAdaptation = TONE_ADAPTATIONS[tone as keyof typeof TONE_ADAPTATIONS];
    if (!toneAdaptation) return content;

    // Apply tone-specific modifications
    let adaptedContent = content;
    adaptedContent += `\n\nTONE ADAPTATION: ${toneAdaptation.language}`;
    adaptedContent += `\nTHEMATIC FOCUS: ${toneAdaptation.themes}`;
    adaptedContent += `\nATMOSPHERIC GUIDANCE: ${toneAdaptation.atmosphere}`;

    return adaptedContent;
  }

  private extractToneElements(toneAdaptation: any): string[] {
    return [
      `Language: ${toneAdaptation.language}`,
      `Themes: ${toneAdaptation.themes}`,
      `Atmosphere: ${toneAdaptation.atmosphere}`
    ];
  }

  private identifyGenreMarkers(content: string, genreTemplate: any): string[] {
    const markers: string[] = [];
    
    // Check for core elements
    genreTemplate.core.elements.forEach((element: string) => {
      if (content.toLowerCase().includes(element.toLowerCase())) {
        markers.push(element);
      }
    });

    // Check for atmosphere keywords
    const atmosphereWords = genreTemplate.core.atmosphere.toLowerCase().split(' ');
    atmosphereWords.forEach((word: string) => {
      if (word.length > 3 && content.toLowerCase().includes(word)) {
        markers.push(`atmosphere: ${word}`);
      }
    });

    return markers;
  }

  private identifyMissingElements(content: string, genreTemplate: any): string[] {
    const missing: string[] = [];
    
    genreTemplate.core.elements.forEach((element: string) => {
      if (!content.toLowerCase().includes(element.toLowerCase())) {
        missing.push(element);
      }
    });

    return missing;
  }

  private calculateAuthenticityScore(
    genreMarkers: string[],
    missingElements: string[],
    genreTemplate: any
  ): number {
    const totalElements = genreTemplate.core.elements.length;
    const foundElements = genreMarkers.filter(marker => 
      !marker.startsWith('atmosphere:')
    ).length;
    
    const baseScore = foundElements / totalElements;
    const atmosphereBonus = genreMarkers.filter(marker => 
      marker.startsWith('atmosphere:')
    ).length * 0.1;
    
    return Math.min(baseScore + atmosphereBonus, 1);
  }

  private generateImprovementSuggestions(
    missingElements: string[],
    genreTemplate: any
  ): string[] {
    const suggestions: string[] = [];
    
    missingElements.forEach(element => {
      suggestions.push(`Consider incorporating ${element} to enhance genre authenticity`);
    });

    if (suggestions.length === 0) {
      suggestions.push('Content shows strong genre authenticity');
    }

    return suggestions;
  }

  private getSubgenreElements(genre: string, subgenre: string): Record<string, any> {
    // Placeholder for subgenre-specific elements
    // This would be expanded with detailed subgenre definitions
    return {
      name: subgenre,
      description: `${subgenre} variant of ${genre}`,
      specificElements: [`${subgenre}-specific elements`]
    };
  }
}

export const genreSpecificOptimization = new GenreSpecificOptimization();