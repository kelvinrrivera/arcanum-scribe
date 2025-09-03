/**
 * Tactical Combat Enhancement Integration
 * 
 * Enhances combat encounters with tactical depth, positioning,
 * environmental factors, and strategic options.
 */

export interface CombatEncounter {
  id: string;
  name: string;
  description: string;
  enemies: CombatEnemy[];
  environment: CombatEnvironment;
  tacticalElements: TacticalElement[];
  objectives: CombatObjective[];
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  estimatedDuration: string;
}

export interface CombatEnemy {
  id: string;
  name: string;
  type: string;
  level: number;
  hitPoints: number;
  armorClass: number;
  abilities: { [ability: string]: number };
  tactics: string[];
  specialAbilities: string[];
  positioning: string;
  motivation: string;
}

export interface CombatEnvironment {
  terrain: string;
  size: string;
  lighting: string;
  weather?: string;
  hazards: EnvironmentalHazard[];
  cover: CoverElement[];
  interactableObjects: InteractableObject[];
}

export interface EnvironmentalHazard {
  name: string;
  description: string;
  effect: string;
  triggerCondition: string;
  damage?: string;
  area?: string;
}

export interface CoverElement {
  type: 'light' | 'heavy' | 'total';
  description: string;
  location: string;
  durability?: number;
}

export interface InteractableObject {
  name: string;
  description: string;
  actions: string[];
  effect: string;
  usageLimit?: number;
}

export interface TacticalElement {
  name: string;
  description: string;
  type: 'positioning' | 'environmental' | 'social' | 'magical';
  complexity: 'simple' | 'moderate' | 'complex';
  benefit: string;
  risk?: string;
}

export interface CombatObjective {
  type: 'defeat' | 'protect' | 'escape' | 'retrieve' | 'survive' | 'custom';
  description: string;
  successCondition: string;
  failureConsequence: string;
  timeLimit?: string;
}

export interface TacticalCombatResult {
  encounters: CombatEncounter[];
  totalEncounters: number;
  averageDifficulty: number;
  tacticalComplexity: number;
  environmentalVariety: number;
  strategicDepth: number;
}

export class TacticalCombatEnhancer {
  private readonly ENEMY_TYPES = [
    'humanoid', 'beast', 'undead', 'fiend', 'celestial', 'dragon',
    'elemental', 'fey', 'giant', 'monstrosity', 'ooze', 'plant'
  ];

  private readonly TERRAIN_TYPES = [
    'forest', 'dungeon', 'urban', 'mountain', 'swamp', 'desert',
    'cave', 'ruins', 'ship', 'tower', 'bridge', 'courtyard'
  ];

  /**
   * Enhance combat encounters with tactical depth
   */
  async enhanceCombat(
    adventureContext: any,
    encounterCount: number = 2,
    difficultyRange: { min: string; max: string } = { min: 'medium', max: 'hard' }
  ): Promise<TacticalCombatResult> {
    console.log('⚔️ [COMBAT-ENHANCER] Enhancing combat encounters...');
    console.log(`🎯 [COMBAT-ENHANCER] Target: ${encounterCount} encounters, difficulty: ${difficultyRange.min}-${difficultyRange.max}`);

    try {
      const encounters: CombatEncounter[] = [];
      
      for (let i = 0; i < encounterCount; i++) {
        const encounter = await this.createTacticalEncounter(adventureContext, difficultyRange, i);
        encounters.push(encounter);
      }

      const result = this.analyzeCombatSet(encounters);
      
      console.log(`✅ [COMBAT-ENHANCER] Enhanced ${encounters.length} combat encounters`);
      console.log(`🏆 [COMBAT-ENHANCER] Tactical complexity: ${Math.round(result.tacticalComplexity)}/100`);

      return result;

    } catch (error) {
      console.error('❌ [COMBAT-ENHANCER] Combat enhancement failed:', error);
      throw error;
    }
  }

  /**
   * Create a single tactical combat encounter
   */
  private async createTacticalEncounter(
    context: any,
    difficultyRange: any,
    index: number
  ): Promise<CombatEncounter> {
    const difficulty = this.selectDifficulty(difficultyRange);
    const environment = this.generateEnvironment(context);
    const enemies = this.generateEnemies(difficulty, environment, context);
    const tacticalElements = this.generateTacticalElements(environment, enemies);
    const objectives = this.generateObjectives(context, enemies);
    
    return {
      id: `combat_${Date.now()}_${index}`,
      name: this.generateEncounterName(environment, enemies),
      description: this.generateEncounterDescription(environment, enemies, tacticalElements),
      enemies,
      environment,
      tacticalElements,
      objectives,
      difficulty,
      estimatedDuration: this.estimateDuration(difficulty, enemies.length, tacticalElements.length)
    };
  }

  private selectDifficulty(difficultyRange: any): CombatEncounter['difficulty'] {
    const difficulties = ['easy', 'medium', 'hard', 'deadly'];
    const minIndex = difficulties.indexOf(difficultyRange.min);
    const maxIndex = difficulties.indexOf(difficultyRange.max);
    const selectedIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
    return difficulties[selectedIndex] as CombatEncounter['difficulty'];
  }

  private generateEnvironment(context: any): CombatEnvironment {
    const contextText = JSON.stringify(context).toLowerCase();
    
    // Select terrain based on context
    let terrain = 'dungeon'; // default
    if (contextText.includes('forest')) terrain = 'forest';
    else if (contextText.includes('city')) terrain = 'urban';
    else if (contextText.includes('mountain')) terrain = 'mountain';
    else if (contextText.includes('cave')) terrain = 'cave';
    else if (contextText.includes('ruins')) terrain = 'ruins';
    
    const size = this.selectRandom(['small', 'medium', 'large']);
    const lighting = this.selectRandom(['bright', 'dim', 'dark']);
    
    const hazards = this.generateEnvironmentalHazards(terrain);
    const cover = this.generateCoverElements(terrain);
    const interactableObjects = this.generateInteractableObjects(terrain);
    
    return {
      terrain,
      size,
      lighting,
      hazards,
      cover,
      interactableObjects
    };
  }

  private generateEnvironmentalHazards(terrain: string): EnvironmentalHazard[] {
    const hazardsByTerrain = {
      forest: [
        {
          name: 'Thick Undergrowth',
          description: 'Dense vegetation that impedes movement',
          effect: 'Difficult terrain, provides light cover',
          triggerCondition: 'When moving through',
          area: '10-foot squares'
        },
        {
          name: 'Unstable Tree',
          description: 'A damaged tree that could fall',
          effect: '2d6 bludgeoning damage',
          triggerCondition: 'When attacked or pushed',
          damage: '2d6',
          area: '15-foot line'
        }
      ],
      dungeon: [
        {
          name: 'Pit Trap',
          description: 'Hidden pit covered by false floor',
          effect: '1d6 falling damage, prone condition',
          triggerCondition: 'When stepped on (DC 15 Perception to notice)',
          damage: '1d6',
          area: '5-foot square'
        },
        {
          name: 'Poison Gas Vent',
          description: 'Vents that release toxic gas when triggered',
          effect: 'DC 13 Constitution save or poisoned for 1 minute',
          triggerCondition: 'When combat starts or every 3 rounds',
          area: '10-foot radius'
        }
      ],
      urban: [
        {
          name: 'Slippery Cobblestones',
          description: 'Wet stones that are treacherous to navigate',
          effect: 'DC 12 Dexterity save or fall prone when dashing',
          triggerCondition: 'When moving more than half speed',
          area: 'Various 5-foot squares'
        }
      ]
    };

    const terrainHazards = hazardsByTerrain[terrain as keyof typeof hazardsByTerrain] || [];
    return terrainHazards.slice(0, Math.floor(Math.random() * 2) + 1); // 1-2 hazards
  }

  private generateCoverElements(terrain: string): CoverElement[] {
    const coverByTerrain = {
      forest: [
        { type: 'light' as const, description: 'Large tree trunk', location: 'Center of battlefield' },
        { type: 'light' as const, description: 'Thick bushes', location: 'Scattered around edges' }
      ],
      dungeon: [
        { type: 'heavy' as const, description: 'Stone pillar', location: 'Supporting the ceiling', durability: 25 },
        { type: 'light' as const, description: 'Rubble pile', location: 'Corner of room' }
      ],
      urban: [
        { type: 'heavy' as const, description: 'Building corner', location: 'Street intersection' },
        { type: 'light' as const, description: 'Market stall', location: 'Center of square', durability: 10 }
      ]
    };

    const terrainCover = coverByTerrain[terrain as keyof typeof coverByTerrain] || [
      { type: 'light' as const, description: 'Natural formation', location: 'Battlefield edge' }
    ];

    return terrainCover;
  }

  private generateInteractableObjects(terrain: string): InteractableObject[] {
    const objectsByTerrain = {
      forest: [
        {
          name: 'Rope Bridge',
          description: 'Wooden bridge spanning a ravine',
          actions: ['Cross', 'Cut rope', 'Swing across'],
          effect: 'Provides movement option or can be destroyed to block passage'
        }
      ],
      dungeon: [
        {
          name: 'Ancient Lever',
          description: 'Stone lever built into the wall',
          actions: ['Pull', 'Push', 'Examine'],
          effect: 'Opens secret door or activates trap',
          usageLimit: 1
        },
        {
          name: 'Brazier',
          description: 'Iron brazier with burning coals',
          actions: ['Tip over', 'Add fuel', 'Extinguish'],
          effect: 'Creates fire hazard or removes light source'
        }
      ],
      urban: [
        {
          name: 'Merchant Cart',
          description: 'Wooden cart loaded with goods',
          actions: ['Push', 'Tip over', 'Hide behind'],
          effect: 'Can be moved to create cover or obstacles'
        }
      ]
    };

    const terrainObjects = objectsByTerrain[terrain as keyof typeof objectsByTerrain] || [];
    return terrainObjects.slice(0, Math.floor(Math.random() * 2) + 1); // 1-2 objects
  }

  private generateEnemies(
    difficulty: string,
    environment: CombatEnvironment,
    context: any
  ): CombatEnemy[] {
    const enemyCount = this.getEnemyCount(difficulty);
    const enemies: CombatEnemy[] = [];
    
    for (let i = 0; i < enemyCount; i++) {
      const enemy = this.createEnemy(difficulty, environment, i);
      enemies.push(enemy);
    }
    
    return enemies;
  }

  private getEnemyCount(difficulty: string): number {
    const counts = { easy: 1, medium: 2, hard: 3, deadly: 4 };
    return counts[difficulty as keyof typeof counts] || 2;
  }

  private createEnemy(difficulty: string, environment: CombatEnvironment, index: number): CombatEnemy {
    const type = this.selectEnemyType(environment);
    const level = this.getEnemyLevel(difficulty);
    const name = this.generateEnemyName(type, index);
    
    return {
      id: `enemy_${index}`,
      name,
      type,
      level,
      hitPoints: this.calculateHitPoints(level),
      armorClass: this.calculateArmorClass(level),
      abilities: this.generateAbilities(type),
      tactics: this.generateTactics(type, environment),
      specialAbilities: this.generateSpecialAbilities(type, level),
      positioning: this.generatePositioning(environment, index),
      motivation: this.generateMotivation(type)
    };
  }

  private selectEnemyType(environment: CombatEnvironment): string {
    const typesByTerrain = {
      forest: ['beast', 'fey', 'plant', 'humanoid'],
      dungeon: ['undead', 'fiend', 'monstrosity', 'humanoid'],
      urban: ['humanoid', 'beast', 'fiend'],
      cave: ['beast', 'undead', 'elemental', 'monstrosity']
    };

    const terrainTypes = typesByTerrain[environment.terrain as keyof typeof typesByTerrain] || this.ENEMY_TYPES;
    return this.selectRandom(terrainTypes);
  }

  private getEnemyLevel(difficulty: string): number {
    const levels = { easy: 1, medium: 3, hard: 5, deadly: 7 };
    const baseLevel = levels[difficulty as keyof typeof levels] || 3;
    return baseLevel + Math.floor(Math.random() * 3) - 1; // ±1 variation
  }

  private generateEnemyName(type: string, index: number): string {
    const namesByType = {
      humanoid: ['Bandit Leader', 'Cultist', 'Guard Captain', 'Mercenary'],
      beast: ['Dire Wolf', 'Brown Bear', 'Giant Spider', 'Owlbear'],
      undead: ['Skeleton Warrior', 'Zombie', 'Wight', 'Specter'],
      fiend: ['Imp', 'Quasit', 'Demon', 'Devil']
    };

    const typeNames = namesByType[type as keyof typeof namesByType] || ['Unknown Creature'];
    const baseName = this.selectRandom(typeNames);
    
    return index === 0 ? baseName : `${baseName} ${index + 1}`;
  }

  private calculateHitPoints(level: number): number {
    return Math.floor(level * 8.5) + Math.floor(Math.random() * 10) + 5;
  }

  private calculateArmorClass(level: number): number {
    return Math.min(18, 10 + Math.floor(level / 2) + Math.floor(Math.random() * 3));
  }

  private generateAbilities(type: string): { [ability: string]: number } {
    const baseAbilities = {
      Strength: 12, Dexterity: 12, Constitution: 12,
      Intelligence: 10, Wisdom: 12, Charisma: 10
    };

    // Modify based on type
    const typeModifiers = {
      beast: { Strength: +2, Constitution: +2, Intelligence: -4 },
      humanoid: { Intelligence: +1, Charisma: +1 },
      undead: { Constitution: +3, Charisma: -2 },
      fiend: { Intelligence: +2, Charisma: +3 }
    };

    const modifiers = typeModifiers[type as keyof typeof typeModifiers] || {};
    
    const abilities = { ...baseAbilities };
    Object.entries(modifiers).forEach(([ability, modifier]) => {
      abilities[ability] += modifier;
    });

    return abilities;
  }

  private generateTactics(type: string, environment: CombatEnvironment): string[] {
    const baseTactics = [
      'Focus fire on weakest target',
      'Use cover when possible',
      'Protect allies with lower AC'
    ];

    const typeTactics = {
      beast: ['Charge when possible', 'Use pack tactics'],
      humanoid: ['Coordinate attacks', 'Use ranged weapons from cover'],
      undead: ['Ignore fear effects', 'Swarm living creatures'],
      fiend: ['Use magical abilities first', 'Target spellcasters']
    };

    const environmentTactics = {
      forest: ['Use trees for cover', 'Set ambushes'],
      dungeon: ['Control chokepoints', 'Use traps'],
      urban: ['Use buildings for cover', 'Call for reinforcements']
    };

    const tactics = [...baseTactics];
    
    const specificTactics = typeTactics[type as keyof typeof typeTactics];
    if (specificTactics) tactics.push(...specificTactics);
    
    const envTactics = environmentTactics[environment.terrain as keyof typeof environmentTactics];
    if (envTactics) tactics.push(...envTactics);

    return tactics.slice(0, 3); // Limit to 3 tactics
  }

  private generateSpecialAbilities(type: string, level: number): string[] {
    const abilities: string[] = [];
    
    if (level >= 3) {
      const typeAbilities = {
        beast: ['Pack Tactics', 'Keen Senses'],
        humanoid: ['Action Surge', 'Second Wind'],
        undead: ['Undead Fortitude', 'Life Drain'],
        fiend: ['Fire Resistance', 'Telepathy']
      };

      const specificAbilities = typeAbilities[type as keyof typeof typeAbilities];
      if (specificAbilities) {
        abilities.push(this.selectRandom(specificAbilities));
      }
    }

    if (level >= 5) {
      abilities.push('Multiattack');
    }

    return abilities;
  }

  private generatePositioning(environment: CombatEnvironment, index: number): string {
    const positions = [
      'Front line, ready to charge',
      'Behind cover, ranged position',
      'Flanking position on the side',
      'High ground advantage',
      'Hidden, waiting to ambush'
    ];

    return positions[index % positions.length];
  }

  private generateMotivation(type: string): string {
    const motivations = {
      humanoid: ['Protecting territory', 'Following orders', 'Seeking treasure'],
      beast: ['Defending young', 'Hunting for food', 'Territorial instinct'],
      undead: ['Compelled by necromancy', 'Seeking revenge', 'Guarding location'],
      fiend: ['Spreading chaos', 'Fulfilling contract', 'Seeking souls']
    };

    const typeMotivations = motivations[type as keyof typeof motivations] || ['Unknown motivation'];
    return this.selectRandom(typeMotivations);
  }

  private generateTacticalElements(environment: CombatEnvironment, enemies: CombatEnemy[]): TacticalElement[] {
    const elements: TacticalElement[] = [];

    // Environmental tactical elements
    elements.push({
      name: 'High Ground Control',
      description: 'Gain advantage by controlling elevated positions',
      type: 'positioning',
      complexity: 'simple',
      benefit: 'Attack advantage and better visibility'
    });

    if (environment.cover.length > 0) {
      elements.push({
        name: 'Cover Utilization',
        description: 'Use available cover to protect from ranged attacks',
        type: 'positioning',
        complexity: 'simple',
        benefit: 'Increased AC against ranged attacks'
      });
    }

    if (environment.hazards.length > 0) {
      elements.push({
        name: 'Environmental Manipulation',
        description: 'Use environmental hazards against enemies',
        type: 'environmental',
        complexity: 'moderate',
        benefit: 'Force enemies into dangerous areas',
        risk: 'May affect allies as well'
      });
    }

    // Enemy-based tactical elements
    if (enemies.some(enemy => enemy.type === 'humanoid')) {
      elements.push({
        name: 'Social Manipulation',
        description: 'Attempt to negotiate or intimidate intelligent foes',
        type: 'social',
        complexity: 'complex',
        benefit: 'Potentially avoid or reduce combat',
        risk: 'May fail and anger enemies'
      });
    }

    return elements;
  }

  private generateObjectives(context: any, enemies: CombatEnemy[]): CombatObjective[] {
    const objectives: CombatObjective[] = [];

    // Primary objective (always defeat or custom)
    objectives.push({
      type: 'defeat',
      description: 'Defeat all enemies',
      successCondition: 'All enemies reduced to 0 hit points',
      failureConsequence: 'Party members may be knocked unconscious or killed'
    });

    // Secondary objectives based on context
    const contextText = JSON.stringify(context).toLowerCase();
    
    if (contextText.includes('rescue') || contextText.includes('save')) {
      objectives.push({
        type: 'protect',
        description: 'Protect the innocent bystander',
        successCondition: 'Bystander survives the encounter',
        failureConsequence: 'Bystander is harmed or killed',
        timeLimit: '5 rounds'
      });
    }

    if (contextText.includes('escape') || contextText.includes('flee')) {
      objectives.push({
        type: 'escape',
        description: 'Escape from the encounter',
        successCondition: 'At least half the party reaches the exit',
        failureConsequence: 'Trapped and must fight to the end'
      });
    }

    return objectives;
  }

  private generateEncounterName(environment: CombatEnvironment, enemies: CombatEnemy[]): string {
    const primaryEnemy = enemies[0];
    const terrainName = environment.terrain.charAt(0).toUpperCase() + environment.terrain.slice(1);
    
    return `${terrainName} ${primaryEnemy.name} Encounter`;
  }

  private generateEncounterDescription(
    environment: CombatEnvironment,
    enemies: CombatEnemy[],
    tacticalElements: TacticalElement[]
  ): string {
    const enemyList = enemies.map(e => e.name).join(', ');
    const tacticalOptions = tacticalElements.map(t => t.name.toLowerCase()).join(', ');
    
    return `A tactical combat encounter in a ${environment.size} ${environment.terrain} area with ${environment.lighting} lighting. ` +
           `Enemies include: ${enemyList}. ` +
           `Tactical considerations: ${tacticalOptions}.`;
  }

  private estimateDuration(difficulty: string, enemyCount: number, tacticalComplexity: number): string {
    const baseDuration = { easy: 15, medium: 25, hard: 35, deadly: 45 };
    const base = baseDuration[difficulty as keyof typeof baseDuration] || 25;
    const adjusted = base + (enemyCount * 5) + (tacticalComplexity * 3);
    
    return `${adjusted}-${adjusted + 15} minutes`;
  }

  private analyzeCombatSet(encounters: CombatEncounter[]): TacticalCombatResult {
    const totalEncounters = encounters.length;
    
    const difficultyValues = { easy: 1, medium: 2, hard: 3, deadly: 4 };
    const averageDifficulty = encounters.reduce((sum, enc) => 
      sum + (difficultyValues[enc.difficulty] || 2), 0) / totalEncounters;
    
    const tacticalComplexity = encounters.reduce((sum, enc) => {
      const complexityScore = enc.tacticalElements.reduce((tSum, element) => {
        const complexityValues = { simple: 1, moderate: 2, complex: 3 };
        return tSum + (complexityValues[element.complexity] || 1);
      }, 0);
      return sum + complexityScore;
    }, 0) / totalEncounters * 10; // Scale to 0-100
    
    const environmentalVariety = new Set(encounters.map(enc => enc.environment.terrain)).size * 20;
    
    const strategicDepth = encounters.reduce((sum, enc) => {
      return sum + enc.objectives.length + enc.environment.hazards.length + enc.environment.interactableObjects.length;
    }, 0) / totalEncounters * 15; // Scale to approximate 0-100
    
    return {
      encounters,
      totalEncounters,
      averageDifficulty,
      tacticalComplexity: Math.min(100, tacticalComplexity),
      environmentalVariety: Math.min(100, environmentalVariety),
      strategicDepth: Math.min(100, strategicDepth)
    };
  }

  private selectRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }
}

export const tacticalCombatEnhancer = new TacticalCombatEnhancer();