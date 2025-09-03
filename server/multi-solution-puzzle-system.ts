/**
 * Multi-Solution Puzzle System
 * 
 * This module implements advanced puzzle generation that creates puzzles with
 * at least 3 different solution approaches, fail states that advance the story,
 * and creative solution validation.
 */

export interface MultiSolutionPuzzle {
  id: string;
  name: string;
  description: string;
  theme: string;
  difficulty: PuzzleDifficulty;
  solutions: PuzzleSolution[];
  failState: FailState;
  hints: PuzzleHint[];
  timeLimit?: TimeLimit;
  prerequisites: string[];
  rewards: PuzzleReward[];
  narrativeIntegration: NarrativeIntegration;
}

export interface PuzzleSolution {
  id: string;
  approach: SolutionApproach;
  requiredAbility: string;
  dc: number;
  description: string;
  implementation: string;
  consequences: string;
  creativityBonus: boolean;
  alternativeTools: string[];
  skillSynergies: SkillSynergy[];
}

export interface SolutionApproach {
  type: 'ability-based' | 'tool-based' | 'creative' | 'collaborative' | 'magical' | 'environmental';
  primarySkill: string;
  secondarySkills: string[];
  requiredResources: string[];
  timeRequired: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SkillSynergy {
  combinedSkills: string[];
  dcModifier: number;
  bonusEffect: string;
  description: string;
}

export interface FailState {
  type: 'progression' | 'alternative' | 'consequence' | 'retry';
  description: string;
  narrativeOutcome: string;
  mechanicalEffect: string;
  alternativePath: string;
  playerAgency: boolean;
  recoveryOptions: RecoveryOption[];
}

export interface RecoveryOption {
  method: string;
  requirements: string[];
  cost: string;
  timeDelay: string;
  narrativeImpact: string;
}

export interface PuzzleHint {
  level: 'subtle' | 'moderate' | 'obvious';
  trigger: string;
  content: string;
  delivery: 'environmental' | 'npc' | 'mechanical' | 'player-discovery';
  cost?: string;
  prerequisites: string[];
}

export interface TimeLimit {
  duration: string;
  consequences: string;
  warnings: string[];
  extensions: TimeLimitExtension[];
}

export interface TimeLimitExtension {
  trigger: string;
  additionalTime: string;
  cost: string;
  description: string;
}

export interface PuzzleReward {
  type: 'information' | 'item' | 'access' | 'advantage' | 'story';
  description: string;
  mechanicalBenefit: string;
  narrativeSignificance: string;
  permanence: 'temporary' | 'session' | 'permanent';
}

export interface NarrativeIntegration {
  storyRelevance: string;
  characterConnections: string[];
  worldBuildingElements: string[];
  futureImplications: string[];
  playerChoiceImpact: string;
}

export type PuzzleDifficulty = 'trivial' | 'easy' | 'moderate' | 'hard' | 'legendary';

export interface PuzzleGenerationRequirements {
  theme: string;
  difficulty: PuzzleDifficulty;
  minimumSolutions: number;
  allowedApproaches: SolutionApproach['type'][];
  narrativeContext: string;
  availableSkills: string[];
  partyLevel: number;
  timeConstraints?: string;
  specialRequirements: string[];
}

export interface PuzzleTemplate {
  name: string;
  category: 'mechanical' | 'riddle' | 'spatial' | 'social' | 'magical' | 'environmental';
  baseDescription: string;
  solutionFrameworks: SolutionFramework[];
  adaptationRules: AdaptationRule[];
  themeVariations: ThemeVariation[];
}

export interface SolutionFramework {
  approach: SolutionApproach['type'];
  skillRequirements: string[];
  dcRange: { min: number; max: number };
  implementationTemplate: string;
  commonVariations: string[];
}

export interface AdaptationRule {
  condition: string;
  modification: string;
  impact: string;
  examples: string[];
}

export interface ThemeVariation {
  theme: string;
  descriptionModifier: string;
  mechanicalChanges: string[];
  narrativeElements: string[];
}

/**
 * Multi-Solution Puzzle System Class
 */
export class MultiSolutionPuzzleSystem {
  private puzzleTemplates: PuzzleTemplate[];
  private difficultyScaling: DifficultyScaling;
  private creativitySolver: CreativitySolver;

  constructor() {
    this.puzzleTemplates = this.initializePuzzleTemplates();
    this.difficultyScaling = new DifficultyScaling();
    this.creativitySolver = new CreativitySolver();
  }

  /**
   * Generate a multi-solution puzzle based on requirements
   */
  generatePuzzle(requirements: PuzzleGenerationRequirements): MultiSolutionPuzzle {
    console.log(`🧩 [PUZZLE] Generating multi-solution puzzle`);
    console.log(`   Theme: ${requirements.theme}, Difficulty: ${requirements.difficulty}`);
    console.log(`   Required solutions: ${requirements.minimumSolutions}`);

    // Select appropriate template
    const template = this.selectPuzzleTemplate(requirements);
    
    // Generate core puzzle structure
    const puzzle = this.createPuzzleFromTemplate(template, requirements);
    
    // Generate multiple solutions
    puzzle.solutions = this.generateMultipleSolutions(template, requirements);
    
    // Create fail state that advances story
    puzzle.failState = this.createProgressiveFailState(requirements);
    
    // Generate contextual hints
    puzzle.hints = this.generateContextualHints(puzzle, requirements);
    
    // Add narrative integration
    puzzle.narrativeIntegration = this.createNarrativeIntegration(requirements);
    
    // Validate puzzle completeness
    this.validatePuzzleDesign(puzzle, requirements);

    console.log(`✅ [PUZZLE] Multi-solution puzzle generated: "${puzzle.name}"`);
    console.log(`   Solutions: ${puzzle.solutions.length}, Approaches: ${new Set(puzzle.solutions.map(s => s.approach.type)).size}`);
    
    return puzzle;
  }

  /**
   * Select the most appropriate puzzle template
   */
  private selectPuzzleTemplate(requirements: PuzzleGenerationRequirements): PuzzleTemplate {
    const suitableTemplates = this.puzzleTemplates.filter(template => {
      // Check if template supports required approaches
      const templateApproaches = template.solutionFrameworks.map(sf => sf.approach);
      const hasRequiredApproaches = requirements.allowedApproaches.some(approach => 
        templateApproaches.includes(approach)
      );
      
      // Check theme compatibility
      const hasThemeVariation = template.themeVariations.some(tv => 
        tv.theme.toLowerCase().includes(requirements.theme.toLowerCase())
      );
      
      return hasRequiredApproaches && (hasThemeVariation || template.category === 'mechanical');
    });

    if (suitableTemplates.length === 0) {
      // Fallback to most flexible template
      return this.puzzleTemplates.find(t => t.category === 'mechanical') || this.puzzleTemplates[0];
    }

    // Select template with most solution frameworks
    return suitableTemplates.reduce((best, current) => 
      current.solutionFrameworks.length > best.solutionFrameworks.length ? current : best
    );
  }

  /**
   * Create puzzle from selected template
   */
  private createPuzzleFromTemplate(template: PuzzleTemplate, requirements: PuzzleGenerationRequirements): MultiSolutionPuzzle {
    const themeVariation = template.themeVariations.find(tv => 
      tv.theme.toLowerCase().includes(requirements.theme.toLowerCase())
    ) || template.themeVariations[0];

    const puzzleName = this.generatePuzzleName(template, themeVariation, requirements);
    const description = this.adaptDescription(template.baseDescription, themeVariation, requirements);

    return {
      id: `puzzle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: puzzleName,
      description,
      theme: requirements.theme,
      difficulty: requirements.difficulty,
      solutions: [], // Will be populated
      failState: {} as FailState, // Will be populated
      hints: [], // Will be populated
      prerequisites: requirements.specialRequirements,
      rewards: this.generatePuzzleRewards(requirements),
      narrativeIntegration: {} as NarrativeIntegration // Will be populated
    };
  }

  /**
   * Generate multiple solution approaches
   */
  private generateMultipleSolutions(template: PuzzleTemplate, requirements: PuzzleGenerationRequirements): PuzzleSolution[] {
    const solutions: PuzzleSolution[] = [];
    const targetSolutions = Math.max(requirements.minimumSolutions, 3);
    
    // Ensure we have diverse solution types
    const approachTypes = [...new Set(requirements.allowedApproaches)];
    const availableFrameworks = template.solutionFrameworks.filter(sf => 
      approachTypes.includes(sf.approach)
    );

    // Generate primary solutions (one per approach type)
    for (let i = 0; i < Math.min(targetSolutions, availableFrameworks.length); i++) {
      const framework = availableFrameworks[i];
      const solution = this.createSolutionFromFramework(framework, requirements, i);
      solutions.push(solution);
    }

    // Generate additional creative solutions if needed
    while (solutions.length < targetSolutions) {
      const creativeSolution = this.generateCreativeSolution(requirements, solutions.length);
      solutions.push(creativeSolution);
    }

    // Add skill synergies between solutions
    this.addSkillSynergies(solutions);

    return solutions;
  }

  /**
   * Create solution from framework
   */
  private createSolutionFromFramework(framework: SolutionFramework, requirements: PuzzleGenerationRequirements, index: number): PuzzleSolution {
    const baseDC = this.difficultyScaling.calculateBaseDC(requirements.difficulty, requirements.partyLevel);
    const adjustedDC = baseDC + (index * 2); // Vary DCs slightly

    const approach: SolutionApproach = {
      type: framework.approach,
      primarySkill: framework.skillRequirements[0] || 'Intelligence',
      secondarySkills: framework.skillRequirements.slice(1),
      requiredResources: this.determineRequiredResources(framework, requirements),
      timeRequired: this.calculateTimeRequired(framework, requirements.difficulty),
      riskLevel: this.assessRiskLevel(framework, requirements.difficulty)
    };

    return {
      id: `solution-${index + 1}`,
      approach,
      requiredAbility: approach.primarySkill,
      dc: Math.min(Math.max(adjustedDC, framework.dcRange.min), framework.dcRange.max),
      description: this.generateSolutionDescription(framework, requirements, index),
      implementation: this.generateImplementationSteps(framework, requirements),
      consequences: this.generateSolutionConsequences(framework, requirements),
      creativityBonus: framework.approach === 'creative',
      alternativeTools: this.generateAlternativeTools(framework),
      skillSynergies: [] // Will be populated later
    };
  }

  /**
   * Generate creative solution
   */
  private generateCreativeSolution(requirements: PuzzleGenerationRequirements, index: number): PuzzleSolution {
    const creativeSolutions = [
      {
        type: 'environmental' as const,
        skill: 'Intelligence (Nature)',
        description: 'Use environmental features creatively',
        implementation: 'Observe and manipulate the surrounding environment'
      },
      {
        type: 'collaborative' as const,
        skill: 'Charisma (Persuasion)',
        description: 'Coordinate party members for combined approach',
        implementation: 'Each party member contributes their unique skills'
      },
      {
        type: 'magical' as const,
        skill: 'Intelligence (Arcana)',
        description: 'Apply magical theory in unexpected ways',
        implementation: 'Use spells or magical items creatively'
      }
    ];

    const creative = creativeSolutions[index % creativeSolutions.length];
    const baseDC = this.difficultyScaling.calculateBaseDC(requirements.difficulty, requirements.partyLevel);

    const approach: SolutionApproach = {
      type: creative.type,
      primarySkill: creative.skill,
      secondarySkills: ['Intelligence (Investigation)'],
      requiredResources: ['Player creativity'],
      timeRequired: '5-10 minutes',
      riskLevel: 'medium'
    };

    return {
      id: `creative-solution-${index + 1}`,
      approach,
      requiredAbility: creative.skill,
      dc: baseDC + 1, // Slightly higher for creative solutions
      description: creative.description,
      implementation: creative.implementation,
      consequences: 'Unique narrative outcome based on creative approach',
      creativityBonus: true,
      alternativeTools: ['Any relevant tools or spells'],
      skillSynergies: []
    };
  }

  /**
   * Create progressive fail state
   */
  private createProgressiveFailState(requirements: PuzzleGenerationRequirements): FailState {
    const failStateTypes = {
      'progression': {
        description: 'The puzzle mechanism activates differently, opening an alternative path',
        narrativeOutcome: 'The story continues through an unexpected route',
        mechanicalEffect: 'Alternative scene or encounter is triggered',
        alternativePath: 'Secondary story branch becomes available'
      },
      'consequence': {
        description: 'The puzzle failure creates a complication that must be addressed',
        narrativeOutcome: 'New challenges emerge that require different solutions',
        mechanicalEffect: 'Additional encounter or skill challenge is introduced',
        alternativePath: 'Story continues with added complexity'
      },
      'alternative': {
        description: 'Failure reveals a different approach to the same goal',
        narrativeOutcome: 'Characters discover an alternative method',
        mechanicalEffect: 'New puzzle or challenge replaces the current one',
        alternativePath: 'Different puzzle with same narrative outcome'
      }
    };

    const selectedType = 'progression'; // Default to progression for story advancement
    const failData = failStateTypes[selectedType];

    return {
      type: selectedType,
      description: failData.description,
      narrativeOutcome: failData.narrativeOutcome,
      mechanicalEffect: failData.mechanicalEffect,
      alternativePath: failData.alternativePath,
      playerAgency: true,
      recoveryOptions: [
        {
          method: 'Try different approach',
          requirements: ['Different skill or tool'],
          cost: 'Additional time',
          timeDelay: '10 minutes',
          narrativeImpact: 'Characters learn from failure'
        },
        {
          method: 'Seek help or hints',
          requirements: ['NPC interaction or investigation'],
          cost: 'Story resource or favor',
          timeDelay: '5 minutes',
          narrativeImpact: 'Builds relationships or reveals lore'
        }
      ]
    };
  }

  /**
   * Generate contextual hints
   */
  private generateContextualHints(puzzle: MultiSolutionPuzzle, requirements: PuzzleGenerationRequirements): PuzzleHint[] {
    const hints: PuzzleHint[] = [];

    // Subtle environmental hint
    hints.push({
      level: 'subtle',
      trigger: 'Initial observation',
      content: `The ${requirements.theme} elements suggest multiple approaches might be possible`,
      delivery: 'environmental',
      prerequisites: []
    });

    // Moderate hint for each solution type
    puzzle.solutions.forEach((solution, index) => {
      hints.push({
        level: 'moderate',
        trigger: `After ${index + 1} failed attempts`,
        content: `A ${solution.approach.primarySkill} check might reveal another approach`,
        delivery: 'player-discovery',
        prerequisites: [`${index + 1} previous attempts`]
      });
    });

    // Obvious hint as last resort
    hints.push({
      level: 'obvious',
      trigger: 'After multiple failures or time pressure',
      content: 'An NPC or environmental clue directly suggests a specific solution approach',
      delivery: 'npc',
      cost: 'Story favor or resource',
      prerequisites: ['Multiple failed attempts or time pressure']
    });

    return hints;
  }

  /**
   * Create narrative integration
   */
  private createNarrativeIntegration(requirements: PuzzleGenerationRequirements): NarrativeIntegration {
    return {
      storyRelevance: `This puzzle directly relates to ${requirements.theme} and advances the main narrative`,
      characterConnections: ['Puzzle solution may reveal character backstory connections'],
      worldBuildingElements: [`Puzzle mechanics reflect the world's ${requirements.theme} magic system`],
      futureImplications: ['Solution method may influence later story developments'],
      playerChoiceImpact: 'Different solution approaches lead to different narrative outcomes'
    };
  }

  // Helper methods

  private generatePuzzleName(template: PuzzleTemplate, themeVariation: ThemeVariation, requirements: PuzzleGenerationRequirements): string {
    const themeNames = {
      'winter': ['The Frozen Lock', 'Ice Crystal Mechanism', 'Frost Pattern Cipher'],
      'music': ['The Harmonic Resonator', 'Melody Chamber', 'Song of Opening'],
      'ancient': ['The Elder Seal', 'Primordial Gateway', 'Ancient Ward'],
      'magical': ['The Arcane Puzzle', 'Mystical Barrier', 'Enchanted Mechanism']
    };

    const theme = requirements.theme.toLowerCase();
    const names = themeNames[theme] || themeNames['magical'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private adaptDescription(baseDescription: string, themeVariation: ThemeVariation, requirements: PuzzleGenerationRequirements): string {
    let description = baseDescription;
    
    // Apply theme modifications
    description = description.replace(/\[THEME\]/g, requirements.theme);
    description = description.replace(/\[CONTEXT\]/g, requirements.narrativeContext);
    
    // Add theme-specific elements
    if (themeVariation.descriptionModifier) {
      description += ` ${themeVariation.descriptionModifier}`;
    }

    return description;
  }

  private generatePuzzleRewards(requirements: PuzzleGenerationRequirements): PuzzleReward[] {
    return [
      {
        type: 'information',
        description: 'Reveals crucial story information',
        mechanicalBenefit: 'Advantage on related checks',
        narrativeSignificance: 'Advances main plot',
        permanence: 'permanent'
      },
      {
        type: 'access',
        description: 'Opens path to next area',
        mechanicalBenefit: 'Story progression',
        narrativeSignificance: 'Enables continued adventure',
        permanence: 'permanent'
      }
    ];
  }

  private determineRequiredResources(framework: SolutionFramework, requirements: PuzzleGenerationRequirements): string[] {
    const resources = [];
    
    if (framework.approach === 'tool-based') {
      resources.push('Appropriate tools');
    }
    if (framework.approach === 'magical') {
      resources.push('Spell slots or magical items');
    }
    if (framework.approach === 'collaborative') {
      resources.push('Multiple party members');
    }
    
    return resources.length > 0 ? resources : ['None'];
  }

  private calculateTimeRequired(framework: SolutionFramework, difficulty: PuzzleDifficulty): string {
    const baseTime = {
      'trivial': 2,
      'easy': 5,
      'moderate': 10,
      'hard': 15,
      'legendary': 20
    };

    const time = baseTime[difficulty];
    return `${time}-${time + 5} minutes`;
  }

  private assessRiskLevel(framework: SolutionFramework, difficulty: PuzzleDifficulty): 'low' | 'medium' | 'high' {
    if (difficulty === 'trivial' || difficulty === 'easy') return 'low';
    if (difficulty === 'moderate') return 'medium';
    return 'high';
  }

  private generateSolutionDescription(framework: SolutionFramework, requirements: PuzzleGenerationRequirements, index: number): string {
    const descriptions = {
      'ability-based': `Use ${framework.skillRequirements[0]} to analyze and solve the puzzle through skill and knowledge`,
      'tool-based': `Employ specific tools or equipment to manipulate the puzzle mechanism`,
      'creative': `Think outside the box and use unconventional methods to bypass or solve the puzzle`,
      'collaborative': `Coordinate multiple party members to solve different aspects simultaneously`,
      'magical': `Apply magical theory or use spells to interact with the puzzle's mystical components`,
      'environmental': `Utilize environmental features or conditions to influence the puzzle's behavior`
    };

    return descriptions[framework.approach] || 'Find a unique approach to solve this challenge';
  }

  private generateImplementationSteps(framework: SolutionFramework, requirements: PuzzleGenerationRequirements): string {
    const steps = {
      'ability-based': '1. Make the required ability check\n2. Interpret the results\n3. Apply the solution',
      'tool-based': '1. Identify required tools\n2. Apply tools correctly\n3. Verify the mechanism responds',
      'creative': '1. Observe all available options\n2. Propose creative solution to GM\n3. Make appropriate checks as determined by GM',
      'collaborative': '1. Assign roles to party members\n2. Coordinate simultaneous actions\n3. Execute combined solution',
      'magical': '1. Identify magical components\n2. Cast appropriate spells or use items\n3. Channel magical energy correctly',
      'environmental': '1. Assess environmental factors\n2. Manipulate conditions as needed\n3. Use environment to trigger solution'
    };

    return steps[framework.approach] || '1. Assess the situation\n2. Apply chosen method\n3. Evaluate results';
  }

  private generateSolutionConsequences(framework: SolutionFramework, requirements: PuzzleGenerationRequirements): string {
    const consequences = {
      'ability-based': 'Success through knowledge and skill, gaining confidence and insight',
      'tool-based': 'Mechanical solution that may affect future tool availability',
      'creative': 'Unique outcome that may set precedent for future creative solutions',
      'collaborative': 'Strengthens party bonds and establishes teamwork patterns',
      'magical': 'May have magical side effects or attract attention from magical entities',
      'environmental': 'Changes environmental conditions that may affect subsequent scenes'
    };

    return consequences[framework.approach] || 'Standard success with story progression';
  }

  private generateAlternativeTools(framework: SolutionFramework): string[] {
    const alternatives = {
      'ability-based': ['Different skill approaches', 'Advantage from preparation'],
      'tool-based': ['Improvised tools', 'Magical substitutes'],
      'creative': ['Any relevant equipment', 'Environmental features'],
      'collaborative': ['Different role assignments', 'Backup party members'],
      'magical': ['Alternative spells', 'Magical items'],
      'environmental': ['Weather changes', 'Time of day effects']
    };

    return alternatives[framework.approach] || ['Standard alternatives'];
  }

  private addSkillSynergies(solutions: PuzzleSolution[]): void {
    // Add synergies between different solution approaches
    solutions.forEach((solution, index) => {
      const otherSolutions = solutions.filter((_, i) => i !== index);
      
      otherSolutions.forEach(other => {
        if (this.skillsHaveSynergy(solution.approach.primarySkill, other.approach.primarySkill)) {
          solution.skillSynergies.push({
            combinedSkills: [solution.approach.primarySkill, other.approach.primarySkill],
            dcModifier: -2,
            bonusEffect: 'Enhanced understanding from multiple perspectives',
            description: `Combining ${solution.approach.primarySkill} with ${other.approach.primarySkill} provides deeper insight`
          });
        }
      });
    });
  }

  private skillsHaveSynergy(skill1: string, skill2: string): boolean {
    const synergies = [
      ['Intelligence (Investigation)', 'Wisdom (Perception)'],
      ['Intelligence (Arcana)', 'Intelligence (History)'],
      ['Dexterity (Sleight of Hand)', 'Intelligence (Investigation)'],
      ['Charisma (Persuasion)', 'Wisdom (Insight)']
    ];

    return synergies.some(synergy => 
      (synergy.includes(skill1) && synergy.includes(skill2))
    );
  }

  private validatePuzzleDesign(puzzle: MultiSolutionPuzzle, requirements: PuzzleGenerationRequirements): void {
    // Ensure minimum solution count
    if (puzzle.solutions.length < requirements.minimumSolutions) {
      throw new Error(`Puzzle has ${puzzle.solutions.length} solutions, but ${requirements.minimumSolutions} required`);
    }

    // Ensure solution diversity
    const approachTypes = new Set(puzzle.solutions.map(s => s.approach.type));
    if (approachTypes.size < 2) {
      console.warn('Puzzle solutions lack diversity in approach types');
    }

    // Ensure fail state advances story
    if (!puzzle.failState.playerAgency) {
      console.warn('Puzzle fail state does not maintain player agency');
    }

    console.log(`✅ [PUZZLE] Validation passed: ${puzzle.solutions.length} solutions, ${approachTypes.size} approach types`);
  }

  private initializePuzzleTemplates(): PuzzleTemplate[] {
    return [
      {
        name: 'Harmonic Resonance Lock',
        category: 'magical',
        baseDescription: 'A [THEME] mechanism that responds to specific frequencies or patterns. [CONTEXT]',
        solutionFrameworks: [
          {
            approach: 'ability-based',
            skillRequirements: ['Charisma (Performance)', 'Intelligence (Arcana)'],
            dcRange: { min: 12, max: 18 },
            implementationTemplate: 'Musical or magical knowledge approach',
            commonVariations: ['Singing', 'Instrument playing', 'Magical resonance']
          },
          {
            approach: 'tool-based',
            skillRequirements: ['Dexterity (Sleight of Hand)', 'Intelligence (Investigation)'],
            dcRange: { min: 13, max: 17 },
            implementationTemplate: 'Physical manipulation approach',
            commonVariations: ['Tuning fork', 'Musical instrument', 'Resonance crystal']
          },
          {
            approach: 'creative',
            skillRequirements: ['Intelligence', 'Wisdom (Perception)'],
            dcRange: { min: 14, max: 16 },
            implementationTemplate: 'Unconventional sound or vibration approach',
            commonVariations: ['Environmental sounds', 'Party coordination', 'Magical items']
          }
        ],
        adaptationRules: [
          {
            condition: 'Winter theme',
            modification: 'Add ice crystal resonance elements',
            impact: 'Cold damage risk on failure',
            examples: ['Frozen harmonics', 'Ice crystal chimes']
          }
        ],
        themeVariations: [
          {
            theme: 'winter',
            descriptionModifier: 'Frost patterns dance across its surface in response to sound.',
            mechanicalChanges: ['Cold damage on failure', 'Ice-based visual effects'],
            narrativeElements: ['Ancient winter magic', 'Frozen melodies']
          },
          {
            theme: 'music',
            descriptionModifier: 'Musical notes seem to float in the air around it.',
            mechanicalChanges: ['Performance bonus', 'Instrument synergy'],
            narrativeElements: ['Bardic magic', 'Song-based lore']
          }
        ]
      }
    ];
  }
}

// Supporting classes
class DifficultyScaling {
  calculateBaseDC(difficulty: PuzzleDifficulty, partyLevel: number): number {
    const baseDCs = {
      'trivial': 8,
      'easy': 10,
      'moderate': 13,
      'hard': 16,
      'legendary': 20
    };

    const levelAdjustment = Math.floor((partyLevel - 5) / 2);
    return baseDCs[difficulty] + levelAdjustment;
  }
}

class CreativitySolver {
  evaluateCreativeSolution(solution: string, puzzle: MultiSolutionPuzzle): boolean {
    // Placeholder for creative solution evaluation logic
    return solution.length > 10 && !solution.toLowerCase().includes('obvious');
  }
}

// Export singleton instance
export const multiSolutionPuzzleSystem = new MultiSolutionPuzzleSystem();