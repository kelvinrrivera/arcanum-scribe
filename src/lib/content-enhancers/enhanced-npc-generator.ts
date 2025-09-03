/**
 * Enhanced NPC Generation Integration
 * 
 * Creates rich, detailed NPCs with personality profiles, dialogue examples,
 * and behavioral patterns for immersive adventure experiences.
 */

export interface NPCPersonality {
  traits: string[];
  motivations: string[];
  fears: string[];
  quirks: string[];
  speechPatterns: string[];
  relationships: { [npcId: string]: string };
}

export interface NPCDialogue {
  greeting: string[];
  casual: string[];
  important: string[];
  farewell: string[];
  combat: string[];
  emotional: string[];
}

export interface EnhancedNPC {
  id: string;
  name: string;
  role: string;
  description: string;
  personality: NPCPersonality;
  dialogue: NPCDialogue;
  stats: {
    level: number;
    primaryAbility: string;
    secondaryAbilities: string[];
    skills: { [skill: string]: number };
  };
  background: {
    history: string;
    goals: string[];
    secrets: string[];
    connections: string[];
  };
  behaviorPatterns: {
    defaultBehavior: string;
    stressedBehavior: string;
    friendlyBehavior: string;
    hostileBehavior: string;
  };
  interactionHooks: string[];
  questPotential: string[];
}

export interface NPCGenerationResult {
  npcs: EnhancedNPC[];
  totalNPCs: number;
  diversityScore: number;
  interactionComplexity: number;
  questPotential: number;
  roleDistribution: { [role: string]: number };
}

export class EnhancedNPCGenerator {
  private readonly NPC_ROLES = [
    'merchant', 'guard', 'noble', 'commoner', 'scholar', 'priest', 'artisan',
    'innkeeper', 'bard', 'thief', 'soldier', 'farmer', 'healer', 'wizard',
    'ranger', 'blacksmith', 'tavern keeper', 'city official', 'hermit', 'spy'
  ];

  private readonly PERSONALITY_TRAITS = [
    'ambitious', 'cautious', 'cheerful', 'cynical', 'determined', 'eccentric',
    'friendly', 'gruff', 'honest', 'impulsive', 'kind', 'lazy', 'mysterious',
    'nervous', 'optimistic', 'paranoid', 'quiet', 'reckless', 'stubborn', 'wise'
  ];

  private readonly MOTIVATIONS = [
    'wealth', 'power', 'knowledge', 'family', 'revenge', 'justice', 'survival',
    'fame', 'love', 'duty', 'freedom', 'peace', 'adventure', 'redemption',
    'discovery', 'protection', 'tradition', 'change', 'acceptance', 'legacy'
  ];

  /**
   * Generate enhanced NPCs for adventure content
   */
  async generateNPCs(
    adventureContext: any,
    npcCount: number = 3,
    roleRequirements: string[] = []
  ): Promise<NPCGenerationResult> {
    console.log('👥 [NPC-GEN] Generating enhanced NPCs...');
    console.log(`🎯 [NPC-GEN] Target: ${npcCount} NPCs with roles: ${roleRequirements.join(', ') || 'auto-selected'}`);

    try {
      const npcs: EnhancedNPC[] = [];
      const usedRoles = new Set<string>();
      
      for (let i = 0; i < npcCount; i++) {
        const role = this.selectNPCRole(adventureContext, roleRequirements, usedRoles, i);
        const npc = await this.generateSingleNPC(role, adventureContext, i);
        npcs.push(npc);
        usedRoles.add(role);
      }

      // Create relationships between NPCs
      this.establishNPCRelationships(npcs);

      const result = this.analyzeNPCSet(npcs);
      
      console.log(`✅ [NPC-GEN] Generated ${npcs.length} NPCs with diversity score: ${Math.round(result.diversityScore)}/100`);
      console.log(`🎭 [NPC-GEN] Quest potential: ${Math.round(result.questPotential)}/100`);

      return result;

    } catch (error) {
      console.error('❌ [NPC-GEN] NPC generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate a single enhanced NPC
   */
  private async generateSingleNPC(
    role: string,
    context: any,
    index: number
  ): Promise<EnhancedNPC> {
    const name = this.generateNPCName(role);
    const personality = this.generatePersonality();
    const dialogue = this.generateDialogue(personality, role);
    const stats = this.generateStats(role);
    const background = this.generateBackground(role, personality);
    const behaviorPatterns = this.generateBehaviorPatterns(personality);
    const interactionHooks = this.generateInteractionHooks(role, personality, background);
    const questPotential = this.generateQuestPotential(role, background);

    return {
      id: `npc_${Date.now()}_${index}`,
      name,
      role,
      description: this.generateDescription(name, role, personality),
      personality,
      dialogue,
      stats,
      background,
      behaviorPatterns,
      interactionHooks,
      questPotential
    };
  }

  private selectNPCRole(
    context: any,
    requirements: string[],
    usedRoles: Set<string>,
    index: number
  ): string {
    // Use required roles first
    if (index < requirements.length) {
      return requirements[index];
    }

    // Analyze context for appropriate roles
    const contextText = JSON.stringify(context).toLowerCase();
    const contextualRoles: string[] = [];

    if (contextText.includes('tavern') || contextText.includes('inn')) {
      contextualRoles.push('innkeeper', 'bard', 'merchant');
    }
    if (contextText.includes('city') || contextText.includes('town')) {
      contextualRoles.push('guard', 'noble', 'merchant', 'city official');
    }
    if (contextText.includes('dungeon') || contextText.includes('adventure')) {
      contextualRoles.push('hermit', 'wizard', 'thief', 'ranger');
    }
    if (contextText.includes('shop') || contextText.includes('market')) {
      contextualRoles.push('merchant', 'blacksmith', 'artisan');
    }

    // Select from contextual roles or fall back to general roles
    const availableRoles = contextualRoles.length > 0 ? contextualRoles : this.NPC_ROLES;
    const unusedRoles = availableRoles.filter(role => !usedRoles.has(role));
    
    if (unusedRoles.length > 0) {
      return unusedRoles[Math.floor(Math.random() * unusedRoles.length)];
    }

    // If all contextual roles are used, pick any unused role
    const allUnusedRoles = this.NPC_ROLES.filter(role => !usedRoles.has(role));
    if (allUnusedRoles.length > 0) {
      return allUnusedRoles[Math.floor(Math.random() * allUnusedRoles.length)];
    }

    // If all roles are used, pick randomly
    return this.NPC_ROLES[Math.floor(Math.random() * this.NPC_ROLES.length)];
  }

  private generateNPCName(role: string): string {
    const namesByRole = {
      merchant: ['Gareth Goldweaver', 'Mira Coinsworth', 'Tobias Tradeheart'],
      guard: ['Captain Marcus', 'Sergeant Elena', 'Watchman Brom'],
      noble: ['Lord Aldric', 'Lady Vivienne', 'Duke Reginald'],
      scholar: ['Professor Elara', 'Sage Thaddeus', 'Librarian Cordelia'],
      priest: ['Father Benedict', 'Sister Agatha', 'High Cleric Matthias'],
      innkeeper: ['Goodwife Martha', 'Barkeep Willem', 'Hostess Rosalind'],
      blacksmith: ['Master Gorin', 'Smithy Helga', 'Ironworker Dain']
    };

    const roleNames = namesByRole[role as keyof typeof namesByRole];
    if (roleNames) {
      return roleNames[Math.floor(Math.random() * roleNames.length)];
    }

    // Generate generic fantasy name
    const firstNames = ['Aiden', 'Brenna', 'Cael', 'Dara', 'Ewan', 'Fiona', 'Gareth', 'Hilda'];
    const lastNames = ['Brightblade', 'Stormwind', 'Ironforge', 'Goldleaf', 'Shadowmere', 'Thornfield'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  private generatePersonality(): NPCPersonality {
    const traits = this.selectRandomItems(this.PERSONALITY_TRAITS, 2, 4);
    const motivations = this.selectRandomItems(this.MOTIVATIONS, 1, 3);
    
    const fears = [
      'losing family', 'poverty', 'death', 'failure', 'betrayal', 'isolation',
      'powerlessness', 'change', 'discovery of secrets', 'losing status'
    ];
    
    const quirks = [
      'always fidgets with jewelry', 'speaks in rhymes when nervous', 'collects unusual objects',
      'has a pet that follows everywhere', 'never removes gloves', 'counts everything twice',
      'hums while working', 'always carries a lucky charm', 'speaks to animals', 'never sits down'
    ];
    
    const speechPatterns = [
      'speaks formally', 'uses local dialect', 'peppers speech with foreign words',
      'speaks very quietly', 'tends to ramble', 'asks lots of questions',
      'uses elaborate metaphors', 'speaks in short sentences', 'has a distinctive accent'
    ];

    return {
      traits,
      motivations,
      fears: this.selectRandomItems(fears, 1, 2),
      quirks: this.selectRandomItems(quirks, 1, 2),
      speechPatterns: this.selectRandomItems(speechPatterns, 1, 2),
      relationships: {} // Will be filled in later
    };
  }

  private generateDialogue(personality: NPCPersonality, role: string): NPCDialogue {
    const baseDialogue = {
      greeting: ['Hello there!', 'Good day to you.', 'Welcome!'],
      casual: ['How can I help you?', 'What brings you here?', 'Anything interesting happening?'],
      important: ['This is quite serious.', 'You should know...', 'Listen carefully.'],
      farewell: ['Safe travels!', 'Until we meet again.', 'Farewell.'],
      combat: ['Stand back!', 'I won\'t go down easily!', 'You\'ll regret this!'],
      emotional: ['I... I don\'t know what to say.', 'This means everything to me.', 'Please understand.']
    };

    // Customize dialogue based on personality traits
    const customDialogue = { ...baseDialogue };
    
    if (personality.traits.includes('gruff')) {
      customDialogue.greeting = ['What do you want?', 'Make it quick.', 'Hmph.'];
      customDialogue.casual = ['Speak up.', 'I haven\'t got all day.', 'Well?'];
    }
    
    if (personality.traits.includes('cheerful')) {
      customDialogue.greeting = ['What a wonderful day!', 'How delightful to see you!', 'Greetings, friend!'];
      customDialogue.casual = ['Isn\'t this exciting?', 'Oh, how marvelous!', 'What fun!'];
    }
    
    if (personality.traits.includes('mysterious')) {
      customDialogue.greeting = ['We meet again...', 'Interesting.', 'As expected.'];
      customDialogue.casual = ['Some things are better left unknown.', 'The truth is rarely simple.', 'Curious...'];
    }

    // Customize based on role
    if (role === 'merchant') {
      customDialogue.greeting.push('Looking to buy or sell?', 'Best prices in town!');
      customDialogue.casual.push('I have just what you need.', 'Quality goods here!');
    }
    
    if (role === 'guard') {
      customDialogue.greeting.push('State your business.', 'Keep moving.');
      customDialogue.casual.push('Everything\'s secure here.', 'No trouble on my watch.');
    }

    return customDialogue;
  }

  private generateStats(role: string): EnhancedNPC['stats'] {
    const roleStats = {
      merchant: { level: 3, primary: 'Charisma', secondary: ['Wisdom', 'Intelligence'] },
      guard: { level: 4, primary: 'Strength', secondary: ['Constitution', 'Dexterity'] },
      noble: { level: 5, primary: 'Charisma', secondary: ['Intelligence', 'Wisdom'] },
      scholar: { level: 6, primary: 'Intelligence', secondary: ['Wisdom', 'Charisma'] },
      priest: { level: 5, primary: 'Wisdom', secondary: ['Charisma', 'Constitution'] },
      wizard: { level: 7, primary: 'Intelligence', secondary: ['Wisdom', 'Dexterity'] }
    };

    const defaultStats = { level: 3, primary: 'Charisma', secondary: ['Wisdom'] };
    const stats = roleStats[role as keyof typeof roleStats] || defaultStats;

    const skills: { [skill: string]: number } = {};
    
    // Generate role-appropriate skills
    const roleSkills = {
      merchant: ['Persuasion', 'Insight', 'Deception'],
      guard: ['Athletics', 'Intimidation', 'Perception'],
      scholar: ['Investigation', 'History', 'Arcana'],
      priest: ['Religion', 'Medicine', 'Insight']
    };

    const relevantSkills = roleSkills[role as keyof typeof roleSkills] || ['Persuasion', 'Insight'];
    relevantSkills.forEach(skill => {
      skills[skill] = Math.floor(Math.random() * 5) + stats.level;
    });

    return {
      level: stats.level,
      primaryAbility: stats.primary,
      secondaryAbilities: stats.secondary,
      skills
    };
  }

  private generateBackground(role: string, personality: NPCPersonality): EnhancedNPC['background'] {
    const histories = {
      merchant: [
        'Started as a street vendor and built a trading empire',
        'Inherited the family business from their parents',
        'Former adventurer who settled down to trade'
      ],
      guard: [
        'Veteran of the border wars, now serves the city',
        'Local recruit who worked their way up the ranks',
        'Former criminal who turned their life around'
      ],
      scholar: [
        'Spent decades studying in the great libraries',
        'Self-taught researcher with unconventional methods',
        'Former student who became obsessed with forbidden knowledge'
      ]
    };

    const roleHistories = histories[role as keyof typeof histories] || [
      'Has lived in this area their entire life',
      'Came here seeking a new beginning',
      'Following a personal quest that brought them here'
    ];

    const history = roleHistories[Math.floor(Math.random() * roleHistories.length)];

    const goals = this.generateGoals(role, personality);
    const secrets = this.generateSecrets(role, personality);
    const connections = this.generateConnections(role);

    return {
      history,
      goals,
      secrets,
      connections
    };
  }

  private generateGoals(role: string, personality: NPCPersonality): string[] {
    const goals: string[] = [];
    
    // Add motivation-based goals
    personality.motivations.forEach(motivation => {
      switch (motivation) {
        case 'wealth':
          goals.push('Accumulate enough gold to retire comfortably');
          break;
        case 'knowledge':
          goals.push('Discover the truth about an ancient mystery');
          break;
        case 'family':
          goals.push('Protect and provide for their loved ones');
          break;
        case 'justice':
          goals.push('Right a wrong from their past');
          break;
      }
    });

    // Add role-specific goals
    const roleGoals = {
      merchant: ['Expand trade routes', 'Corner the market on rare goods'],
      guard: ['Keep the peace', 'Earn a promotion'],
      scholar: ['Publish groundbreaking research', 'Find a lost tome']
    };

    const specificGoals = roleGoals[role as keyof typeof roleGoals];
    if (specificGoals) {
      goals.push(...specificGoals.slice(0, 1));
    }

    return goals.slice(0, 3); // Limit to 3 goals
  }

  private generateSecrets(role: string, personality: NPCPersonality): string[] {
    const secrets = [
      'Has a hidden talent for magic',
      'Is secretly in debt to dangerous people',
      'Knows the location of a hidden treasure',
      'Is related to someone important',
      'Has a criminal past they\'re hiding',
      'Is working as a spy for another faction',
      'Has a forbidden romance',
      'Knows a dangerous secret about the town'
    ];

    return this.selectRandomItems(secrets, 0, 2);
  }

  private generateConnections(role: string): string[] {
    const connections = [
      'Member of the local merchants\' guild',
      'Has contacts in the city guard',
      'Knows several traveling adventurers',
      'Connected to the noble families',
      'Has friends among the common folk',
      'Maintains correspondence with scholars',
      'Has allies in other cities',
      'Connected to religious organizations'
    ];

    return this.selectRandomItems(connections, 1, 3);
  }

  private generateBehaviorPatterns(personality: NPCPersonality): EnhancedNPC['behaviorPatterns'] {
    const patterns = {
      defaultBehavior: 'Friendly and helpful to most people',
      stressedBehavior: 'Becomes withdrawn and suspicious',
      friendlyBehavior: 'Opens up and shares personal stories',
      hostileBehavior: 'Becomes cold and refuses to cooperate'
    };

    // Customize based on personality traits
    if (personality.traits.includes('gruff')) {
      patterns.defaultBehavior = 'Brusque but fair in dealings';
      patterns.friendlyBehavior = 'Shows rare moments of warmth';
    }

    if (personality.traits.includes('nervous')) {
      patterns.stressedBehavior = 'Becomes extremely agitated and talkative';
      patterns.defaultBehavior = 'Fidgety but tries to be helpful';
    }

    if (personality.traits.includes('mysterious')) {
      patterns.defaultBehavior = 'Speaks in riddles and half-truths';
      patterns.hostileBehavior = 'Disappears or becomes completely silent';
    }

    return patterns;
  }

  private generateInteractionHooks(
    role: string,
    personality: NPCPersonality,
    background: EnhancedNPC['background']
  ): string[] {
    const hooks: string[] = [];

    // Add personality-based hooks
    if (personality.traits.includes('curious')) {
      hooks.push('Always asks about the characters\' adventures');
    }
    if (personality.traits.includes('helpful')) {
      hooks.push('Offers assistance even when not asked');
    }

    // Add role-based hooks
    const roleHooks = {
      merchant: ['Offers rare items for trade', 'Seeks protection for a caravan'],
      guard: ['Asks for help with local crime', 'Warns about dangerous areas'],
      scholar: ['Requests help finding research materials', 'Offers knowledge in exchange for favors']
    };

    const specificHooks = roleHooks[role as keyof typeof roleHooks];
    if (specificHooks) {
      hooks.push(...specificHooks);
    }

    // Add background-based hooks
    if (background.secrets.length > 0) {
      hooks.push('Hints at knowing important secrets');
    }

    return hooks;
  }

  private generateQuestPotential(role: string, background: EnhancedNPC['background']): string[] {
    const quests: string[] = [];

    // Role-based quest potential
    const roleQuests = {
      merchant: [
        'Escort a valuable shipment',
        'Investigate missing trade goods',
        'Negotiate with hostile traders'
      ],
      guard: [
        'Help solve a local crime',
        'Investigate corruption in the ranks',
        'Defend against an incoming threat'
      ],
      scholar: [
        'Retrieve a lost artifact',
        'Investigate ancient ruins',
        'Decode mysterious writings'
      ]
    };

    const specificQuests = roleQuests[role as keyof typeof roleQuests];
    if (specificQuests) {
      quests.push(...specificQuests);
    }

    // Background-based quests
    background.goals.forEach(goal => {
      quests.push(`Help achieve: ${goal}`);
    });

    if (background.secrets.length > 0) {
      quests.push('Uncover the truth about their secrets');
    }

    return quests.slice(0, 4); // Limit quest potential
  }

  private establishNPCRelationships(npcs: EnhancedNPC[]): void {
    // Create relationships between NPCs
    for (let i = 0; i < npcs.length; i++) {
      for (let j = i + 1; j < npcs.length; j++) {
        const npc1 = npcs[i];
        const npc2 = npcs[j];
        
        // Determine relationship based on roles and personalities
        const relationship = this.determineRelationship(npc1, npc2);
        
        if (relationship) {
          npc1.personality.relationships[npc2.id] = relationship;
          npc2.personality.relationships[npc1.id] = this.getReciprocalRelationship(relationship);
        }
      }
    }
  }

  private determineRelationship(npc1: EnhancedNPC, npc2: EnhancedNPC): string | null {
    // Business relationships
    if ((npc1.role === 'merchant' && npc2.role === 'guard') ||
        (npc1.role === 'guard' && npc2.role === 'merchant')) {
      return 'business partner';
    }

    // Authority relationships
    if (npc1.role === 'noble' && ['guard', 'commoner'].includes(npc2.role)) {
      return 'employer';
    }

    // Personality-based relationships
    const sharedTraits = npc1.personality.traits.filter(trait => 
      npc2.personality.traits.includes(trait)
    );

    if (sharedTraits.length >= 2) {
      return 'friend';
    }

    // Conflicting personalities
    const conflicts = [
      ['honest', 'deceptive'],
      ['cheerful', 'cynical'],
      ['generous', 'greedy']
    ];

    for (const [trait1, trait2] of conflicts) {
      if ((npc1.personality.traits.includes(trait1) && npc2.personality.traits.includes(trait2)) ||
          (npc1.personality.traits.includes(trait2) && npc2.personality.traits.includes(trait1))) {
        return 'rival';
      }
    }

    // Random chance for acquaintance
    return Math.random() < 0.3 ? 'acquaintance' : null;
  }

  private getReciprocalRelationship(relationship: string): string {
    const reciprocals = {
      'employer': 'employee',
      'employee': 'employer',
      'friend': 'friend',
      'rival': 'rival',
      'acquaintance': 'acquaintance',
      'business partner': 'business partner'
    };

    return reciprocals[relationship as keyof typeof reciprocals] || relationship;
  }

  private analyzeNPCSet(npcs: EnhancedNPC[]): NPCGenerationResult {
    const totalNPCs = npcs.length;
    
    // Calculate diversity score
    const uniqueRoles = new Set(npcs.map(npc => npc.role)).size;
    const uniqueTraits = new Set(npcs.flatMap(npc => npc.personality.traits)).size;
    const diversityScore = Math.min(100, (uniqueRoles * 20) + (uniqueTraits * 2));
    
    // Calculate interaction complexity
    const totalRelationships = npcs.reduce((sum, npc) => 
      sum + Object.keys(npc.personality.relationships).length, 0);
    const interactionComplexity = Math.min(100, totalRelationships * 10);
    
    // Calculate quest potential
    const totalQuests = npcs.reduce((sum, npc) => sum + npc.questPotential.length, 0);
    const questPotential = Math.min(100, totalQuests * 5);
    
    // Calculate role distribution
    const roleDistribution: { [role: string]: number } = {};
    npcs.forEach(npc => {
      roleDistribution[npc.role] = (roleDistribution[npc.role] || 0) + 1;
    });

    return {
      npcs,
      totalNPCs,
      diversityScore,
      interactionComplexity,
      questPotential,
      roleDistribution
    };
  }

  private selectRandomItems<T>(items: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}

export const enhancedNPCGenerator = new EnhancedNPCGenerator();