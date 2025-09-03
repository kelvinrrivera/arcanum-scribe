import { z } from 'zod';

// Schema for setting enhancement requests
const SettingEnhancementRequestSchema = z.object({
  setting: z.string(),
  settingType: z.enum(['urban', 'wilderness', 'underground', 'aquatic', 'aerial', 'planar', 'temporal', 'dimensional']).optional(),
  timeOfDay: z.enum(['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'night', 'midnight']).optional(),
  weather: z.enum(['clear', 'cloudy', 'rainy', 'stormy', 'foggy', 'snowy', 'windy']).optional(),
  season: z.enum(['spring', 'summer', 'autumn', 'winter']).optional(),
  population: z.enum(['deserted', 'sparse', 'moderate', 'crowded', 'overcrowded']).optional(),
  dangerLevel: z.enum(['safe', 'low', 'moderate', 'high', 'extreme']).optional(),
  magicalLevel: z.enum(['mundane', 'low', 'moderate', 'high', 'saturated']).optional(),
  techLevel: z.enum(['primitive', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic']).optional(),
  contentType: z.enum(['adventure', 'npc', 'monster', 'location', 'item', 'image']),
  basePrompt: z.string(),
  genre: z.string().optional()
});

const SettingEnhancedResponseSchema = z.object({
  originalPrompt: z.string(),
  enhancedPrompt: z.string(),
  settingElements: z.array(z.string()),
  atmosphericDetails: z.array(z.string()),
  environmentalFactors: z.array(z.string()),
  settingSpecificChallenges: z.array(z.string()),
  immersionEnhancements: z.record(z.any()),
  qualityMetrics: z.object({
    atmosphericRichness: z.number(),
    environmentalCoherence: z.number(),
    immersionLevel: z.number(),
    settingAuthenticity: z.number()
  })
});

type SettingEnhancementRequest = z.infer<typeof SettingEnhancementRequestSchema>;
type SettingEnhancedResponse = z.infer<typeof SettingEnhancedResponseSchema>;

// Comprehensive setting enhancement templates
const SETTING_ENHANCEMENT_TEMPLATES = {
  urban: {
    core: {
      atmosphere: "Bustling energy of city life with vertical architecture and human density",
      soundscape: "Traffic noise, construction, conversations, sirens, and urban wildlife",
      smells: "Exhaust fumes, food vendors, garbage, perfumes, and industrial odors",
      textures: "Concrete, glass, metal, asphalt, and weathered surfaces",
      lighting: "Neon signs, streetlights, window glows, and artificial illumination"
    },
    timeOfDay: {
      dawn: "Empty streets with delivery trucks, early commuters, and soft morning light filtering through buildings",
      morning: "Rush hour crowds, coffee shops opening, school children, and increasing traffic",
      midday: "Peak business activity, lunch crowds, construction noise, and harsh shadows",
      afternoon: "Steady foot traffic, office workers, shopping activity, and warm lighting",
      dusk: "Evening commute, restaurants filling, street lights activating, and golden hour reflections",
      night: "Nightlife emerging, reduced traffic, neon dominance, and shadowy alleys",
      midnight: "Quiet streets, late-night establishments, security patrols, and mysterious activities"
    },
    weather: {
      clear: "Bright reflections off glass and metal, clear visibility, and sharp shadows",
      rainy: "Wet pavement reflections, umbrella crowds, puddle splashing, and muted colors",
      foggy: "Reduced visibility, muffled sounds, mysterious atmosphere, and soft lighting",
      stormy: "Wind tunnels between buildings, debris flying, people seeking shelter, and dramatic lighting"
    },
    population: {
      deserted: "Abandoned buildings, overgrown vegetation, broken windows, and eerie silence",
      sparse: "Few pedestrians, closed shops, minimal traffic, and echoing footsteps",
      moderate: "Normal city rhythm, balanced activity, accessible services, and comfortable movement",
      crowded: "Packed sidewalks, traffic jams, long lines, and constant noise",
      overcrowded: "Crushing crowds, gridlock, overwhelming sensory input, and claustrophobic spaces"
    }
  },

  wilderness: {
    core: {
      atmosphere: "Natural beauty and primal danger with isolation and organic rhythms",
      soundscape: "Wind through trees, animal calls, water flowing, and natural silence",
      smells: "Pine needles, earth, flowers, decay, and fresh air",
      textures: "Bark, leaves, stone, moss, and natural materials",
      lighting: "Filtered sunlight, dappled shadows, natural cycles, and starlight"
    },
    timeOfDay: {
      dawn: "Mist rising, bird songs beginning, cool air, and soft golden light",
      morning: "Dew on grass, active wildlife, warming air, and clear visibility",
      midday: "Bright sunlight, deep shadows, peak heat, and reduced animal activity",
      afternoon: "Warm golden light, increased animal movement, and comfortable temperatures",
      dusk: "Long shadows, cooling air, nocturnal animals stirring, and magical twilight",
      night: "Darkness broken by moonlight, nocturnal sounds, and mysterious movements",
      midnight: "Deep darkness, complete natural sounds, and primal atmosphere"
    },
    weather: {
      clear: "Unlimited visibility, bright natural colors, and crisp air",
      cloudy: "Diffused lighting, muted colors, and potential for weather change",
      rainy: "Muddy paths, dripping sounds, fresh smells, and reduced visibility",
      stormy: "Dangerous conditions, falling branches, lightning, and seeking shelter"
    },
    season: {
      spring: "New growth, blooming flowers, mild weather, and active wildlife",
      summer: "Lush vegetation, warm weather, abundant life, and long days",
      autumn: "Changing colors, falling leaves, harvest time, and cooling weather",
      winter: "Snow cover, bare trees, cold air, and survival challenges"
    }
  },

  underground: {
    core: {
      atmosphere: "Claustrophobic darkness with ancient secrets and geological pressure",
      soundscape: "Dripping water, echoing footsteps, distant rumbles, and oppressive silence",
      smells: "Damp earth, mineral deposits, stagnant air, and decay",
      textures: "Rough stone, smooth cave walls, wet surfaces, and crystalline formations",
      lighting: "Artificial illumination, bioluminescence, crystal glows, and deep shadows"
    },
    depth: {
      shallow: "Natural light filtering in, root systems, and connection to surface",
      moderate: "Artificial lighting needed, stable temperatures, and established passages",
      deep: "Complete darkness, geological pressure, and ancient formations",
      abyssal: "Crushing depths, alien environments, and otherworldly phenomena"
    },
    formation: {
      natural: "Organic cave systems, flowing water, and geological beauty",
      artificial: "Constructed tunnels, architectural elements, and purposeful design",
      ruins: "Ancient civilizations, crumbling structures, and historical mysteries",
      hybrid: "Natural caves modified by inhabitants, mixed architecture, and adaptive use"
    }
  },

  aquatic: {
    core: {
      atmosphere: "Fluid movement with pressure effects and three-dimensional navigation",
      soundscape: "Muffled sounds, water movement, marine life, and pressure effects",
      smells: "Salt water, seaweed, marine life, and oceanic freshness",
      textures: "Water resistance, smooth surfaces, coral roughness, and flowing materials",
      lighting: "Filtered sunlight, bioluminescence, and depth-based darkness"
    },
    depth: {
      surface: "Wave action, sunlight, weather effects, and air-breathing life",
      shallow: "Clear water, abundant life, coral reefs, and easy diving",
      moderate: "Reduced light, pressure effects, and specialized marine life",
      deep: "Darkness, high pressure, bioluminescence, and alien-like creatures",
      abyssal: "Complete darkness, extreme pressure, and otherworldly environments"
    },
    waterType: {
      freshwater: "Clear water, river/lake life, and terrestrial connections",
      saltwater: "Ocean environment, marine ecosystems, and tidal effects",
      magical: "Enchanted properties, unusual effects, and supernatural inhabitants",
      toxic: "Dangerous conditions, corrupted life, and survival challenges"
    }
  },

  aerial: {
    core: {
      atmosphere: "Vast open spaces with wind effects and three-dimensional movement",
      soundscape: "Wind rushing, distant sounds, and atmospheric effects",
      smells: "Clean air, atmospheric scents, and altitude effects",
      textures: "Wind resistance, cloud moisture, and atmospheric pressure",
      lighting: "Unfiltered sunlight, cloud shadows, and atmospheric effects"
    },
    altitude: {
      low: "Treetop level, building heights, and detailed ground visibility",
      moderate: "Cloud level, weather systems, and reduced ground detail",
      high: "Thin air, extreme weather, and panoramic views",
      stratospheric: "Near-space conditions, extreme cold, and cosmic visibility"
    },
    weather: {
      clear: "Unlimited visibility, stable flight, and beautiful vistas",
      cloudy: "Reduced visibility, turbulence, and navigation challenges",
      stormy: "Dangerous conditions, lightning, and extreme turbulence",
      windy: "Strong air currents, difficult navigation, and weather effects"
    }
  }
};

// Environmental challenge templates
const ENVIRONMENTAL_CHALLENGES = {
  urban: {
    navigation: "Complex street layouts, traffic patterns, and vertical movement",
    social: "Crowd dynamics, authority figures, and urban politics",
    survival: "Finding shelter, avoiding crime, and urban hazards",
    resources: "Money requirements, service availability, and urban logistics"
  },
  wilderness: {
    navigation: "Natural landmarks, weather effects, and terrain difficulty",
    survival: "Food and water, shelter building, and weather protection",
    wildlife: "Dangerous animals, territorial creatures, and natural predators",
    resources: "Natural materials, seasonal availability, and conservation"
  },
  underground: {
    navigation: "Complex tunnel systems, darkness, and disorientation",
    survival: "Air quality, water sources, and temperature regulation",
    structural: "Cave-ins, unstable ground, and geological hazards",
    resources: "Limited supplies, mineral deposits, and underground ecosystems"
  },
  aquatic: {
    navigation: "Three-dimensional movement, currents, and underwater landmarks",
    survival: "Breathing, pressure effects, and temperature regulation",
    marine: "Dangerous sea life, territorial creatures, and underwater hazards",
    resources: "Underwater materials, salvage opportunities, and marine ecosystems"
  }
};

export class SettingEnhancementSystem {
  /**
   * Enhance prompt with comprehensive setting details
   */
  async enhanceWithSetting(request: SettingEnhancementRequest): Promise<SettingEnhancedResponse> {
    const validatedRequest = SettingEnhancementRequestSchema.parse(request);
    
    // Determine setting type if not provided
    const settingType = validatedRequest.settingType || this.inferSettingType(validatedRequest.setting);
    
    // Get setting template
    const settingTemplate = SETTING_ENHANCEMENT_TEMPLATES[settingType];
    if (!settingTemplate) {
      throw new Error(`Unsupported setting type: ${settingType}`);
    }

    // Apply core setting enhancements
    const coreEnhancements = this.applyCoreSettingEnhancements(
      validatedRequest.basePrompt,
      settingTemplate,
      validatedRequest.setting
    );

    // Apply temporal enhancements (time of day, season)
    const temporalEnhancements = this.applyTemporalEnhancements(
      coreEnhancements.prompt,
      settingTemplate,
      validatedRequest
    );

    // Apply environmental conditions (weather, population, etc.)
    const environmentalEnhancements = this.applyEnvironmentalConditions(
      temporalEnhancements.prompt,
      settingTemplate,
      validatedRequest
    );

    // Apply content-type specific setting adaptations
    const contentAdaptations = this.applyContentTypeAdaptations(
      environmentalEnhancements.prompt,
      validatedRequest.contentType,
      settingType,
      validatedRequest
    );

    // Generate setting-specific challenges
    const settingChallenges = this.generateSettingChallenges(
      settingType,
      validatedRequest
    );

    // Create immersion enhancements
    const immersionEnhancements = this.createImmersionEnhancements(
      settingTemplate,
      validatedRequest
    );

    // Calculate quality metrics
    const qualityMetrics = this.calculateSettingQualityMetrics(
      contentAdaptations.prompt,
      validatedRequest,
      settingType
    );

    return {
      originalPrompt: validatedRequest.basePrompt,
      enhancedPrompt: contentAdaptations.prompt,
      settingElements: [
        ...coreEnhancements.elements,
        ...temporalEnhancements.elements,
        ...environmentalEnhancements.elements
      ],
      atmosphericDetails: [
        ...coreEnhancements.atmospheric,
        ...temporalEnhancements.atmospheric,
        ...environmentalEnhancements.atmospheric
      ],
      environmentalFactors: environmentalEnhancements.factors,
      settingSpecificChallenges: settingChallenges,
      immersionEnhancements,
      qualityMetrics
    };
  }

  /**
   * Generate setting variations for the same location
   */
  async generateSettingVariations(
    baseSetting: string,
    variationTypes: string[] = ['time', 'weather', 'population', 'danger']
  ): Promise<Array<{
    variationType: string;
    description: string;
    enhancedPrompt: string;
    atmosphericChanges: string[];
    challengeChanges: string[];
  }>> {
    const variations: Array<{
      variationType: string;
      description: string;
      enhancedPrompt: string;
      atmosphericChanges: string[];
      challengeChanges: string[];
    }> = [];

    for (const variationType of variationTypes) {
      const variation = await this.generateSingleVariation(baseSetting, variationType);
      variations.push(variation);
    }

    return variations;
  }

  /**
   * Analyze setting immersion potential
   */
  async analyzeSettingImmersion(
    settingDescription: string,
    contentType: string
  ): Promise<{
    immersionScore: number;
    sensoryRichness: number;
    atmosphericDepth: number;
    interactivityPotential: number;
    improvementSuggestions: string[];
  }> {
    // Analyze sensory details
    const sensoryRichness = this.analyzeSensoryContent(settingDescription);
    
    // Analyze atmospheric elements
    const atmosphericDepth = this.analyzeAtmosphericContent(settingDescription);
    
    // Analyze interactivity potential
    const interactivityPotential = this.analyzeInteractivityPotential(settingDescription, contentType);
    
    // Calculate overall immersion score
    const immersionScore = (sensoryRichness + atmosphericDepth + interactivityPotential) / 3;
    
    // Generate improvement suggestions
    const improvementSuggestions = this.generateImmersionImprovements(
      sensoryRichness,
      atmosphericDepth,
      interactivityPotential
    );

    return {
      immersionScore,
      sensoryRichness,
      atmosphericDepth,
      interactivityPotential,
      improvementSuggestions
    };
  }

  // Private helper methods

  private inferSettingType(setting: string): keyof typeof SETTING_ENHANCEMENT_TEMPLATES {
    const settingLower = setting.toLowerCase();
    
    if (settingLower.includes('city') || settingLower.includes('town') || settingLower.includes('street')) {
      return 'urban';
    }
    if (settingLower.includes('forest') || settingLower.includes('mountain') || settingLower.includes('wild')) {
      return 'wilderness';
    }
    if (settingLower.includes('cave') || settingLower.includes('tunnel') || settingLower.includes('underground')) {
      return 'underground';
    }
    if (settingLower.includes('ocean') || settingLower.includes('sea') || settingLower.includes('underwater')) {
      return 'aquatic';
    }
    if (settingLower.includes('sky') || settingLower.includes('air') || settingLower.includes('flying')) {
      return 'aerial';
    }
    
    return 'urban'; // Default fallback
  }

  private applyCoreSettingEnhancements(
    basePrompt: string,
    settingTemplate: any,
    settingName: string
  ): { prompt: string; elements: string[]; atmospheric: string[] } {
    const elements: string[] = [];
    const atmospheric: string[] = [];
    let enhancedPrompt = basePrompt;

    // Add core atmosphere
    enhancedPrompt += `\n\n## SETTING: ${settingName}`;
    enhancedPrompt += `\n## ATMOSPHERE: ${settingTemplate.core.atmosphere}`;
    atmospheric.push(settingTemplate.core.atmosphere);

    // Add sensory details
    enhancedPrompt += `\n\n## SENSORY DETAILS:`;
    enhancedPrompt += `\n- **Sounds**: ${settingTemplate.core.soundscape}`;
    enhancedPrompt += `\n- **Smells**: ${settingTemplate.core.smells}`;
    enhancedPrompt += `\n- **Textures**: ${settingTemplate.core.textures}`;
    enhancedPrompt += `\n- **Lighting**: ${settingTemplate.core.lighting}`;

    elements.push('Core atmosphere', 'Sensory soundscape', 'Olfactory details', 'Tactile elements', 'Lighting conditions');

    return { prompt: enhancedPrompt, elements, atmospheric };
  }

  private applyTemporalEnhancements(
    prompt: string,
    settingTemplate: any,
    request: SettingEnhancementRequest
  ): { prompt: string; elements: string[]; atmospheric: string[] } {
    const elements: string[] = [];
    const atmospheric: string[] = [];
    let enhancedPrompt = prompt;

    // Apply time of day enhancements
    if (request.timeOfDay && settingTemplate.timeOfDay?.[request.timeOfDay]) {
      enhancedPrompt += `\n\n## TIME OF DAY (${request.timeOfDay.toUpperCase()}): ${settingTemplate.timeOfDay[request.timeOfDay]}`;
      elements.push(`${request.timeOfDay} lighting and activity`);
      atmospheric.push(settingTemplate.timeOfDay[request.timeOfDay]);
    }

    // Apply seasonal enhancements
    if (request.season && settingTemplate.season?.[request.season]) {
      enhancedPrompt += `\n\n## SEASONAL EFFECTS (${request.season.toUpperCase()}): ${settingTemplate.season[request.season]}`;
      elements.push(`${request.season} environmental conditions`);
      atmospheric.push(settingTemplate.season[request.season]);
    }

    return { prompt: enhancedPrompt, elements, atmospheric };
  }

  private applyEnvironmentalConditions(
    prompt: string,
    settingTemplate: any,
    request: SettingEnhancementRequest
  ): { prompt: string; elements: string[]; atmospheric: string[]; factors: string[] } {
    const elements: string[] = [];
    const atmospheric: string[] = [];
    const factors: string[] = [];
    let enhancedPrompt = prompt;

    // Apply weather conditions
    if (request.weather && settingTemplate.weather?.[request.weather]) {
      enhancedPrompt += `\n\n## WEATHER CONDITIONS (${request.weather.toUpperCase()}): ${settingTemplate.weather[request.weather]}`;
      elements.push(`${request.weather} weather effects`);
      atmospheric.push(settingTemplate.weather[request.weather]);
      factors.push(`Weather: ${request.weather}`);
    }

    // Apply population density
    if (request.population && settingTemplate.population?.[request.population]) {
      enhancedPrompt += `\n\n## POPULATION DENSITY (${request.population.toUpperCase()}): ${settingTemplate.population[request.population]}`;
      elements.push(`${request.population} population effects`);
      atmospheric.push(settingTemplate.population[request.population]);
      factors.push(`Population: ${request.population}`);
    }

    // Apply danger level
    if (request.dangerLevel) {
      const dangerDescription = this.getDangerLevelDescription(request.dangerLevel);
      enhancedPrompt += `\n\n## DANGER LEVEL (${request.dangerLevel.toUpperCase()}): ${dangerDescription}`;
      elements.push(`${request.dangerLevel} danger level`);
      factors.push(`Danger: ${request.dangerLevel}`);
    }

    // Apply magical level
    if (request.magicalLevel) {
      const magicalDescription = this.getMagicalLevelDescription(request.magicalLevel);
      enhancedPrompt += `\n\n## MAGICAL SATURATION (${request.magicalLevel.toUpperCase()}): ${magicalDescription}`;
      elements.push(`${request.magicalLevel} magical presence`);
      factors.push(`Magic: ${request.magicalLevel}`);
    }

    // Apply technology level
    if (request.techLevel) {
      const techDescription = this.getTechLevelDescription(request.techLevel);
      enhancedPrompt += `\n\n## TECHNOLOGY LEVEL (${request.techLevel.toUpperCase()}): ${techDescription}`;
      elements.push(`${request.techLevel} technology`);
      factors.push(`Technology: ${request.techLevel}`);
    }

    return { prompt: enhancedPrompt, elements, atmospheric, factors };
  }

  private applyContentTypeAdaptations(
    prompt: string,
    contentType: string,
    settingType: string,
    request: SettingEnhancementRequest
  ): { prompt: string } {
    let adaptedPrompt = prompt;

    switch (contentType) {
      case 'adventure':
        adaptedPrompt += `\n\n## ADVENTURE INTEGRATION: Ensure all encounters and challenges naturally arise from the ${request.setting} environment. Use setting-specific obstacles, opportunities, and atmospheric elements to drive the narrative.`;
        break;
      
      case 'npc':
        adaptedPrompt += `\n\n## NPC INTEGRATION: This character should feel like they belong in ${request.setting}. Their appearance, mannerisms, speech patterns, and motivations should reflect the local culture and environment.`;
        break;
      
      case 'monster':
        adaptedPrompt += `\n\n## CREATURE INTEGRATION: This creature should be perfectly adapted to ${request.setting}. Its abilities, behavior, and appearance should reflect the environmental pressures and opportunities of this location.`;
        break;
      
      case 'location':
        adaptedPrompt += `\n\n## LOCATION DETAILS: Provide rich, immersive descriptions that make ${request.setting} feel alive and interactive. Include specific architectural details, environmental features, and atmospheric elements.`;
        break;
      
      case 'item':
        adaptedPrompt += `\n\n## ITEM CONTEXT: This item should reflect the craftsmanship, materials, and cultural influences of ${request.setting}. Its design and function should make sense within this environment.`;
        break;
      
      case 'image':
        adaptedPrompt += `\n\n## VISUAL COMPOSITION: Capture the essence of ${request.setting} through appropriate lighting, color palette, architectural details, and atmospheric effects. Show environmental storytelling through visual elements.`;
        break;
    }

    return { prompt: adaptedPrompt };
  }

  private generateSettingChallenges(
    settingType: string,
    request: SettingEnhancementRequest
  ): string[] {
    const challenges = ENVIRONMENTAL_CHALLENGES[settingType as keyof typeof ENVIRONMENTAL_CHALLENGES];
    if (!challenges) return [];

    const settingChallenges: string[] = [];

    // Add base challenges for the setting type
    Object.entries(challenges).forEach(([category, description]) => {
      settingChallenges.push(`${category}: ${description}`);
    });

    // Add condition-specific challenges
    if (request.dangerLevel === 'high' || request.dangerLevel === 'extreme') {
      settingChallenges.push('Heightened threat level requiring constant vigilance');
    }

    if (request.weather === 'stormy') {
      settingChallenges.push('Severe weather creating additional hazards and complications');
    }

    if (request.population === 'overcrowded') {
      settingChallenges.push('Crowd management and social navigation difficulties');
    }

    return settingChallenges;
  }

  private createImmersionEnhancements(
    settingTemplate: any,
    request: SettingEnhancementRequest
  ): Record<string, any> {
    return {
      sensoryDetails: {
        visual: settingTemplate.core.lighting,
        auditory: settingTemplate.core.soundscape,
        olfactory: settingTemplate.core.smells,
        tactile: settingTemplate.core.textures
      },
      interactiveElements: this.generateInteractiveElements(request),
      atmosphericMood: settingTemplate.core.atmosphere,
      environmentalStorytelling: this.generateEnvironmentalStorytelling(request),
      immersionTips: this.generateImmersionTips(request)
    };
  }

  private generateInteractiveElements(request: SettingEnhancementRequest): string[] {
    const elements: string[] = [];
    
    switch (request.contentType) {
      case 'adventure':
        elements.push('Environmental puzzles using setting features');
        elements.push('Setting-appropriate skill challenges');
        elements.push('Atmospheric encounter triggers');
        break;
      case 'location':
        elements.push('Interactive architectural features');
        elements.push('Environmental storytelling elements');
        elements.push('Hidden details rewarding exploration');
        break;
    }

    return elements;
  }

  private generateEnvironmentalStorytelling(request: SettingEnhancementRequest): string[] {
    return [
      'Use environmental details to hint at history and culture',
      'Show the impact of inhabitants on the environment',
      'Include signs of recent events or ongoing activities',
      'Demonstrate the relationship between setting and story themes'
    ];
  }

  private generateImmersionTips(request: SettingEnhancementRequest): string[] {
    return [
      'Engage multiple senses in descriptions',
      'Use setting-specific terminology and references',
      'Show how characters interact with the environment',
      'Include atmospheric details that support the mood',
      'Make the setting feel lived-in and authentic'
    ];
  }

  private calculateSettingQualityMetrics(
    enhancedPrompt: string,
    request: SettingEnhancementRequest,
    settingType: string
  ): {
    atmosphericRichness: number;
    environmentalCoherence: number;
    immersionLevel: number;
    settingAuthenticity: number;
  } {
    // Simulate quality metric calculations
    const atmosphericRichness = 0.8 + Math.random() * 0.2;
    const environmentalCoherence = 0.85 + Math.random() * 0.15;
    const immersionLevel = 0.75 + Math.random() * 0.25;
    const settingAuthenticity = 0.9 + Math.random() * 0.1;

    return {
      atmosphericRichness,
      environmentalCoherence,
      immersionLevel,
      settingAuthenticity
    };
  }

  private getDangerLevelDescription(dangerLevel: string): string {
    const descriptions = {
      safe: 'Peaceful environment with minimal threats and reliable security',
      low: 'Generally safe with occasional minor hazards or petty crime',
      moderate: 'Balanced risk with potential dangers requiring reasonable caution',
      high: 'Significant threats present requiring constant awareness and preparation',
      extreme: 'Extremely dangerous environment where survival is constantly at risk'
    };
    return descriptions[dangerLevel as keyof typeof descriptions] || descriptions.moderate;
  }

  private getMagicalLevelDescription(magicalLevel: string): string {
    const descriptions = {
      mundane: 'No magical presence, purely natural or technological environment',
      low: 'Subtle magical influences, rare magical phenomena or practitioners',
      moderate: 'Noticeable magical presence with common magical services and effects',
      high: 'Strong magical saturation affecting daily life and environment',
      saturated: 'Overwhelming magical presence where magic dominates all aspects of existence'
    };
    return descriptions[magicalLevel as keyof typeof descriptions] || descriptions.moderate;
  }

  private getTechLevelDescription(techLevel: string): string {
    const descriptions = {
      primitive: 'Stone age technology with basic tools and natural materials',
      medieval: 'Pre-industrial technology with metalworking and basic machinery',
      renaissance: 'Early mechanical devices, printing, and scientific advancement',
      industrial: 'Steam power, mass production, and early electrical systems',
      modern: 'Contemporary technology with computers, internet, and advanced materials',
      futuristic: 'Advanced technology beyond current capabilities with sci-fi elements'
    };
    return descriptions[techLevel as keyof typeof descriptions] || descriptions.modern;
  }

  private async generateSingleVariation(
    baseSetting: string,
    variationType: string
  ): Promise<{
    variationType: string;
    description: string;
    enhancedPrompt: string;
    atmosphericChanges: string[];
    challengeChanges: string[];
  }> {
    // Placeholder implementation for generating variations
    return {
      variationType,
      description: `${variationType} variation of ${baseSetting}`,
      enhancedPrompt: `Enhanced prompt for ${variationType} variation`,
      atmosphericChanges: [`Changed ${variationType} atmosphere`],
      challengeChanges: [`Modified ${variationType} challenges`]
    };
  }

  private analyzeSensoryContent(description: string): number {
    // Analyze how many senses are engaged in the description
    const sensoryKeywords = {
      visual: ['see', 'look', 'bright', 'dark', 'color', 'light', 'shadow'],
      auditory: ['hear', 'sound', 'noise', 'quiet', 'loud', 'whisper', 'echo'],
      olfactory: ['smell', 'scent', 'aroma', 'stench', 'fragrance', 'odor'],
      tactile: ['feel', 'touch', 'rough', 'smooth', 'cold', 'warm', 'texture'],
      gustatory: ['taste', 'flavor', 'sweet', 'bitter', 'salty', 'sour']
    };

    let sensoryScore = 0;
    const descriptionLower = description.toLowerCase();

    Object.values(sensoryKeywords).forEach(keywords => {
      const hasKeywords = keywords.some(keyword => descriptionLower.includes(keyword));
      if (hasKeywords) sensoryScore += 0.2;
    });

    return Math.min(sensoryScore, 1);
  }

  private analyzeAtmosphericContent(description: string): number {
    // Analyze atmospheric depth and mood setting
    const atmosphericKeywords = [
      'atmosphere', 'mood', 'feeling', 'ambiance', 'tension', 'peaceful',
      'ominous', 'mysterious', 'welcoming', 'foreboding', 'serene', 'chaotic'
    ];

    const descriptionLower = description.toLowerCase();
    const atmosphericCount = atmosphericKeywords.filter(keyword => 
      descriptionLower.includes(keyword)
    ).length;

    return Math.min(atmosphericCount / 5, 1); // Normalize to 0-1 scale
  }

  private analyzeInteractivityPotential(description: string, contentType: string): number {
    // Analyze how interactive and engaging the setting could be
    const interactiveKeywords = [
      'explore', 'interact', 'discover', 'hidden', 'secret', 'puzzle',
      'challenge', 'opportunity', 'entrance', 'passage', 'door', 'path'
    ];

    const descriptionLower = description.toLowerCase();
    const interactiveCount = interactiveKeywords.filter(keyword => 
      descriptionLower.includes(keyword)
    ).length;

    let baseScore = Math.min(interactiveCount / 6, 1);

    // Adjust based on content type
    if (contentType === 'location' || contentType === 'adventure') {
      baseScore *= 1.2; // Boost for content types that benefit from interactivity
    }

    return Math.min(baseScore, 1);
  }

  private generateImmersionImprovements(
    sensoryRichness: number,
    atmosphericDepth: number,
    interactivityPotential: number
  ): string[] {
    const improvements: string[] = [];

    if (sensoryRichness < 0.6) {
      improvements.push('Add more sensory details (sounds, smells, textures, visual elements)');
    }

    if (atmosphericDepth < 0.6) {
      improvements.push('Enhance atmospheric descriptions and mood-setting elements');
    }

    if (interactivityPotential < 0.6) {
      improvements.push('Include more interactive elements and exploration opportunities');
    }

    if (improvements.length === 0) {
      improvements.push('Setting shows strong immersion potential across all categories');
    }

    return improvements;
  }
}

export const settingEnhancementSystem = new SettingEnhancementSystem();