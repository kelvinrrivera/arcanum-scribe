/**
 * Multi-Solution Puzzle Generation Integration
 * 
 * Creates puzzles with multiple valid solutions to enhance player agency
 * and replayability in adventure content.
 */

export interface PuzzleElement {
  id: string;
  type: 'riddle' | 'mechanical' | 'social' | 'magical' | 'logical';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  description: string;
  solutions: PuzzleSolution[];
  hints: string[];
  failureConsequences: string[];
  successRewards: string[];
}

export interface PuzzleSolution {
  id: string;
  approach: string;
  description: string;
  requiredSkills: string[];
  difficulty: number;
  timeRequired: string;
  consequences: string[];
  uniqueReward?: string;
}

export interface MultiSolutionPuzzleResult {
  puzzles: PuzzleElement[];
  totalSolutions: number;
  averageDifficulty: number;
  skillsRequired: string[];
  estimatedPlayTime: string;
  replayabilityScore: number;
}

export class MultiSolutionPuzzleGenerator {
  private readonly PUZZLE_TEMPLATES = {
    riddle: [
      'Ancient inscription puzzle',
      'Cryptic verse challenge',
      'Symbol interpretation',
      'Word play enigma'
    ],
    mechanical: [
      'Lock mechanism',
      'Pressure plate sequence',
      'Gear alignment puzzle',
      'Lever combination'
    ],
    social: [
      'Negotiation challenge',
      'Persuasion puzzle',
      'Information gathering',
      'Trust building exercise'
    ],
    magical: [
      'Spell component puzzle',
      'Magical ward bypass',
      'Enchantment riddle',
      'Arcane symbol matching'
    ],
    logical: [
      'Pattern recognition',
      'Sequence completion',
      'Logic gate puzzle',
      'Mathematical challenge'
    ]
  };

  /**
   * Generate multi-solution puzzles for adventure content
   */
  async generatePuzzles(
    adventureContext: any,
    puzzleCount: number = 2,
    difficultyRange: { min: string; max: string } = { min: 'easy', max: 'hard' }
  ): Promise<MultiSolutionPuzzleResult> {
    console.log('🧩 [PUZZLE-GEN] Generating multi-solution puzzles...');
    console.log(`🎯 [PUZZLE-GEN] Target: ${puzzleCount} puzzles, difficulty: ${difficultyRange.min}-${difficultyRange.max}`);

    try {
      const puzzles: PuzzleElement[] = [];
      
      for (let i = 0; i < puzzleCount; i++) {
        const puzzle = await this.generateSinglePuzzle(adventureContext, difficultyRange);
        puzzles.push(puzzle);
      }

      const result = this.analyzePuzzleSet(puzzles);
      
      console.log(`✅ [PUZZLE-GEN] Generated ${puzzles.length} puzzles with ${result.totalSolutions} total solutions`);
      console.log(`🏆 [PUZZLE-GEN] Replayability score: ${Math.round(result.replayabilityScore)}/100`);

      return result;

    } catch (error) {
      console.error('❌ [PUZZLE-GEN] Puzzle generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate a single multi-solution puzzle
   */
  private async generateSinglePuzzle(
    context: any,
    difficultyRange: { min: string; max: string }
  ): Promise<PuzzleElement> {
    // Select puzzle type based on context
    const puzzleType = this.selectPuzzleType(context);
    
    // Generate base puzzle
    const basePuzzle = this.generateBasePuzzle(puzzleType, difficultyRange);
    
    // Generate multiple solutions
    const solutions = this.generateMultipleSolutions(basePuzzle, puzzleType);
    
    // Generate hints and consequences
    const hints = this.generateHints(basePuzzle, solutions);
    const failureConsequences = this.generateFailureConsequences(basePuzzle);
    const successRewards = this.generateSuccessRewards(basePuzzle, solutions);

    return {
      id: `puzzle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: puzzleType,
      difficulty: basePuzzle.difficulty,
      description: basePuzzle.description,
      solutions,
      hints,
      failureConsequences,
      successRewards
    };
  }

  private selectPuzzleType(context: any): PuzzleElement['type'] {
    // Analyze context to determine appropriate puzzle type
    const contextText = JSON.stringify(context).toLowerCase();
    
    if (contextText.includes('magic') || contextText.includes('spell')) {
      return 'magical';
    } else if (contextText.includes('social') || contextText.includes('npc')) {
      return 'social';
    } else if (contextText.includes('mechanism') || contextText.includes('trap')) {
      return 'mechanical';
    } else if (contextText.includes('riddle') || contextText.includes('ancient')) {
      return 'riddle';
    } else {
      return 'logical';
    }
  }

  private generateBasePuzzle(type: PuzzleElement['type'], difficultyRange: any) {
    const templates = this.PUZZLE_TEMPLATES[type];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const difficulties = ['easy', 'medium', 'hard', 'expert'];
    const minIndex = difficulties.indexOf(difficultyRange.min);
    const maxIndex = difficulties.indexOf(difficultyRange.max);
    const difficultyIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
    const difficulty = difficulties[difficultyIndex] as PuzzleElement['difficulty'];

    return {
      template,
      difficulty,
      description: this.generatePuzzleDescription(template, difficulty, type)
    };
  }

  private generatePuzzleDescription(template: string, difficulty: string, type: string): string {
    const descriptions = {
      'Ancient inscription puzzle': {
        easy: 'A simple stone tablet with clear symbols that need to be arranged in the correct order.',
        medium: 'An weathered inscription with partially obscured symbols requiring careful interpretation.',
        hard: 'A complex ancient text with multiple layers of meaning and cryptic references.',
        expert: 'An intricate inscription system with interconnected symbols and hidden meanings.'
      },
      'Lock mechanism': {
        easy: 'A basic combination lock with visible wear patterns on the most-used numbers.',
        medium: 'A mechanical lock with multiple tumblers that must be aligned correctly.',
        hard: 'A complex lock mechanism with interdependent components and timing requirements.',
        expert: 'An masterwork lock with multiple security layers and anti-tampering measures.'
      }
    };

    const templateDescriptions = descriptions[template as keyof typeof descriptions];
    if (templateDescriptions) {
      return templateDescriptions[difficulty as keyof typeof templateDescriptions];
    }

    return `A ${difficulty} ${type} puzzle involving ${template.toLowerCase()}.`;
  }

  private generateMultipleSolutions(basePuzzle: any, type: PuzzleElement['type']): PuzzleSolution[] {
    const solutions: PuzzleSolution[] = [];
    
    // Generate 2-4 different solutions based on puzzle type
    const solutionCount = Math.floor(Math.random() * 3) + 2; // 2-4 solutions
    
    const solutionApproaches = this.getSolutionApproaches(type);
    
    for (let i = 0; i < Math.min(solutionCount, solutionApproaches.length); i++) {
      const approach = solutionApproaches[i];
      
      solutions.push({
        id: `solution_${i + 1}`,
        approach: approach.name,
        description: approach.description,
        requiredSkills: approach.skills,
        difficulty: this.calculateSolutionDifficulty(basePuzzle.difficulty, approach.complexity),
        timeRequired: approach.timeRequired,
        consequences: approach.consequences,
        uniqueReward: approach.uniqueReward
      });
    }

    return solutions;
  }

  private getSolutionApproaches(type: PuzzleElement['type']) {
    const approaches = {
      riddle: [
        {
          name: 'Scholarly Analysis',
          description: 'Use knowledge and research to decode the riddle systematically.',
          skills: ['Investigation', 'History', 'Arcana'],
          complexity: 'standard',
          timeRequired: '10-15 minutes',
          consequences: ['Gain additional lore'],
          uniqueReward: 'Historical insight'
        },
        {
          name: 'Intuitive Leap',
          description: 'Trust instincts and emotional understanding to grasp the meaning.',
          skills: ['Insight', 'Wisdom'],
          complexity: 'simple',
          timeRequired: '5 minutes',
          consequences: ['Quick resolution'],
          uniqueReward: 'Confidence boost'
        },
        {
          name: 'Trial and Error',
          description: 'Systematically test different interpretations until finding the right one.',
          skills: ['Patience', 'Logic'],
          complexity: 'complex',
          timeRequired: '20-30 minutes',
          consequences: ['May trigger false attempts'],
          uniqueReward: 'Complete understanding'
        }
      ],
      mechanical: [
        {
          name: 'Technical Expertise',
          description: 'Use mechanical knowledge to understand and manipulate the device.',
          skills: ['Sleight of Hand', 'Investigation'],
          complexity: 'standard',
          timeRequired: '10 minutes',
          consequences: ['Clean solution'],
          uniqueReward: 'Device remains intact'
        },
        {
          name: 'Brute Force',
          description: 'Apply physical strength to overcome the mechanism.',
          skills: ['Athletics', 'Strength'],
          complexity: 'simple',
          timeRequired: '5 minutes',
          consequences: ['Mechanism may be damaged', 'Noise created'],
          uniqueReward: 'Quick access'
        },
        {
          name: 'Creative Bypass',
          description: 'Find an alternative way around the mechanism entirely.',
          skills: ['Perception', 'Creativity'],
          complexity: 'complex',
          timeRequired: '15-20 minutes',
          consequences: ['Mechanism remains active'],
          uniqueReward: 'Hidden passage discovered'
        }
      ],
      social: [
        {
          name: 'Direct Persuasion',
          description: 'Use charisma and logical arguments to convince others.',
          skills: ['Persuasion', 'Charisma'],
          complexity: 'standard',
          timeRequired: '10-15 minutes',
          consequences: ['Relationship improved'],
          uniqueReward: 'Future ally'
        },
        {
          name: 'Deception',
          description: 'Use misdirection and false information to achieve goals.',
          skills: ['Deception', 'Performance'],
          complexity: 'complex',
          timeRequired: '15 minutes',
          consequences: ['Risk of discovery', 'Trust damaged if caught'],
          uniqueReward: 'Additional information gained'
        },
        {
          name: 'Intimidation',
          description: 'Use fear and authority to compel cooperation.',
          skills: ['Intimidation', 'Strength'],
          complexity: 'simple',
          timeRequired: '5 minutes',
          consequences: ['Relationship damaged', 'Future hostility'],
          uniqueReward: 'Immediate compliance'
        }
      ],
      magical: [
        {
          name: 'Arcane Knowledge',
          description: 'Use magical theory and spell knowledge to solve the puzzle.',
          skills: ['Arcana', 'Spellcasting'],
          complexity: 'standard',
          timeRequired: '10 minutes',
          consequences: ['Magical energy expended'],
          uniqueReward: 'Magical insight gained'
        },
        {
          name: 'Ritual Approach',
          description: 'Perform a careful magical ritual to interact with the puzzle.',
          skills: ['Religion', 'Arcana', 'Patience'],
          complexity: 'complex',
          timeRequired: '20-30 minutes',
          consequences: ['Significant time investment'],
          uniqueReward: 'Permanent magical benefit'
        },
        {
          name: 'Dispel Magic',
          description: 'Simply dispel or suppress the magical elements.',
          skills: ['Dispel Magic', 'Counterspell'],
          complexity: 'simple',
          timeRequired: '1 action',
          consequences: ['Magical effects removed'],
          uniqueReward: 'Quick resolution'
        }
      ],
      logical: [
        {
          name: 'Systematic Analysis',
          description: 'Break down the problem into components and solve methodically.',
          skills: ['Investigation', 'Logic'],
          complexity: 'standard',
          timeRequired: '15 minutes',
          consequences: ['Thorough understanding'],
          uniqueReward: 'Pattern recognition bonus'
        },
        {
          name: 'Pattern Recognition',
          description: 'Identify underlying patterns to find the solution quickly.',
          skills: ['Perception', 'Intelligence'],
          complexity: 'complex',
          timeRequired: '10 minutes',
          consequences: ['Risk of missing details'],
          uniqueReward: 'Elegant solution'
        },
        {
          name: 'Collaborative Solving',
          description: 'Work with others to combine different perspectives.',
          skills: ['Teamwork', 'Communication'],
          complexity: 'standard',
          timeRequired: '12 minutes',
          consequences: ['Requires multiple participants'],
          uniqueReward: 'Team bonding'
        }
      ]
    };

    return approaches[type] || approaches.logical;
  }

  private calculateSolutionDifficulty(baseDifficulty: string, complexity: string): number {
    const baseDifficultyValues = { easy: 10, medium: 15, hard: 20, expert: 25 };
    const complexityModifiers = { simple: -3, standard: 0, complex: +5 };
    
    const base = baseDifficultyValues[baseDifficulty as keyof typeof baseDifficultyValues] || 15;
    const modifier = complexityModifiers[complexity as keyof typeof complexityModifiers] || 0;
    
    return Math.max(5, Math.min(30, base + modifier));
  }

  private generateHints(basePuzzle: any, solutions: PuzzleSolution[]): string[] {
    const hints: string[] = [];
    
    // Generate general hints
    hints.push(`This ${basePuzzle.difficulty} puzzle may have multiple approaches.`);
    hints.push('Consider what skills and resources you have available.');
    
    // Generate solution-specific hints
    solutions.forEach((solution, index) => {
      if (index < 2) { // Only hint at first two solutions
        hints.push(`One approach might involve ${solution.requiredSkills[0]?.toLowerCase() || 'careful thinking'}.`);
      }
    });
    
    return hints;
  }

  private generateFailureConsequences(basePuzzle: any): string[] {
    const consequences = [
      'The puzzle resets, requiring you to start over.',
      'A minor trap is triggered, causing minimal damage.',
      'The difficulty increases as the puzzle adapts to your attempts.'
    ];
    
    if (basePuzzle.difficulty === 'expert') {
      consequences.push('A significant trap activates, creating a dangerous situation.');
      consequences.push('The puzzle locks down temporarily, preventing further attempts.');
    }
    
    return consequences;
  }

  private generateSuccessRewards(basePuzzle: any, solutions: PuzzleSolution[]): string[] {
    const rewards = [
      'Access to the next area or information.',
      'Experience points for clever problem-solving.',
      'Satisfaction of overcoming the challenge.'
    ];
    
    // Add unique rewards from solutions
    solutions.forEach(solution => {
      if (solution.uniqueReward) {
        rewards.push(solution.uniqueReward);
      }
    });
    
    return [...new Set(rewards)]; // Remove duplicates
  }

  private analyzePuzzleSet(puzzles: PuzzleElement[]): MultiSolutionPuzzleResult {
    const totalSolutions = puzzles.reduce((sum, puzzle) => sum + puzzle.solutions.length, 0);
    
    const difficultyValues = { easy: 1, medium: 2, hard: 3, expert: 4 };
    const averageDifficulty = puzzles.reduce((sum, puzzle) => 
      sum + (difficultyValues[puzzle.difficulty] || 2), 0) / puzzles.length;
    
    const allSkills = new Set<string>();
    puzzles.forEach(puzzle => {
      puzzle.solutions.forEach(solution => {
        solution.requiredSkills.forEach(skill => allSkills.add(skill));
      });
    });
    
    const skillsRequired = Array.from(allSkills);
    
    // Estimate play time (rough calculation)
    const totalMinutes = puzzles.reduce((sum, puzzle) => {
      const avgSolutionTime = puzzle.solutions.reduce((sSum, solution) => {
        const timeMatch = solution.timeRequired.match(/(\d+)/);
        return sSum + (timeMatch ? parseInt(timeMatch[1]) : 10);
      }, 0) / puzzle.solutions.length;
      return sum + avgSolutionTime;
    }, 0);
    
    const estimatedPlayTime = `${Math.round(totalMinutes)} minutes`;
    
    // Calculate replayability score
    const replayabilityScore = Math.min(100, 
      (totalSolutions * 15) + // More solutions = more replayability
      (skillsRequired.length * 5) + // More skill variety = more replayability
      (puzzles.length * 10) + // More puzzles = more content
      20 // Base score
    );
    
    return {
      puzzles,
      totalSolutions,
      averageDifficulty,
      skillsRequired,
      estimatedPlayTime,
      replayabilityScore
    };
  }
}

export const multiSolutionPuzzleGenerator = new MultiSolutionPuzzleGenerator();