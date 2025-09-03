/**
 * Session Metadata Generation System
 * 
 * This module implements automatic session metadata block generation including
 * system, party level, party size, estimated duration, safety notes, and
 * difficulty rating calculations.
 */

import { SessionSpecifications, ParsedRequirements } from './enhanced-prompt-parser.js';

export interface SessionMetadataBlock {
  system: GameSystemInfo;
  party: PartyInfo;
  session: SessionInfo;
  safety: SafetyInfo;
  difficulty: DifficultyInfo;
  preparation: PreparationInfo;
}

export interface GameSystemInfo {
  name: string;
  version: string;
  abbreviation: string;
  compatibilityNotes: string[];
}

export interface PartyInfo {
  level: number;
  size: number;
  recommendedSize: { min: number; max: number };
  levelRange: { min: number; max: number };
  scalingNotes: string[];
}

export interface SessionInfo {
  estimatedDuration: string;
  durationMinutes: { min: number; max: number };
  pacing: 'fast' | 'moderate' | 'slow';
  breakSuggestions: string[];
  timingNotes: string[];
}

export interface SafetyInfo {
  contentWarnings: ContentWarning[];
  safetyTools: SafetyTool[];
  toneGuidance: string[];
  playerConsent: string[];
}

export interface ContentWarning {
  category: string;
  description: string;
  severity: 'mild' | 'moderate' | 'intense';
  alternatives: string[];
}

export interface SafetyTool {
  name: string;
  description: string;
  usage: string;
  recommended: boolean;
}

export interface DifficultyInfo {
  overall: DifficultyRating;
  combat: DifficultyRating;
  roleplay: DifficultyRating;
  puzzles: DifficultyRating;
  exploration: DifficultyRating;
  adjustmentTips: string[];
}

export interface DifficultyRating {
  level: 'easy' | 'moderate' | 'hard' | 'deadly';
  score: number; // 1-10
  description: string;
  indicators: string[];
}

export interface PreparationInfo {
  prepTime: string;
  requiredMaterials: string[];
  optionalMaterials: string[];
  gmExperience: 'beginner' | 'intermediate' | 'experienced' | 'expert';
  preparationNotes: string[];
}

/**
 * Session Metadata Generator Class
 */
export class SessionMetadataGenerator {
  private readonly DURATION_MAPPING = {
    'short': { min: 60, max: 120, description: '1-2 hours' },
    'medium': { min: 180, max: 240, description: '3-4 hours' },
    'long': { min: 300, max: 360, description: '5-6 hours' },
    'extended': { min: 420, max: 480, description: '7-8 hours' }
  };

  private readonly SAFETY_TOOLS = [
    {
      name: 'X-Card',
      description: 'Players can tap or hold up a card to pause or skip content',
      usage: 'Use when content becomes uncomfortable',
      recommended: true
    },
    {
      name: 'Lines and Veils',
      description: 'Establish content that is off-limits (lines) or handled off-screen (veils)',
      usage: 'Discuss before the session begins',
      recommended: true
    },
    {
      name: 'Open Door Policy',
      description: 'Players can leave the session at any time without explanation',
      usage: 'Establish at session start',
      recommended: true
    },
    {
      name: 'Check-ins',
      description: 'Regular pauses to ensure everyone is comfortable',
      usage: 'Use during intense scenes',
      recommended: false
    }
  ];

  /**
   * Generate complete session metadata block
   */
  generateSessionMetadata(requirements: ParsedRequirements): SessionMetadataBlock {
    console.log(`📋 [METADATA] Generating session metadata block`);
    
    const system = this.generateGameSystemInfo(requirements.sessionSpecs.system);
    const party = this.generatePartyInfo(requirements.sessionSpecs);
    const session = this.generateSessionInfo(requirements.sessionSpecs, requirements.contentRequirements);
    const safety = this.generateSafetyInfo(requirements.sessionSpecs, requirements.contentRequirements);
    const difficulty = this.calculateDifficultyInfo(requirements);
    const preparation = this.generatePreparationInfo(requirements);

    const metadata: SessionMetadataBlock = {
      system,
      party,
      session,
      safety,
      difficulty,
      preparation
    };

    console.log(`✅ [METADATA] Session metadata generated`);
    console.log(`   Duration: ${session.estimatedDuration}, Difficulty: ${difficulty.overall.level}`);
    
    return metadata;
  }

  /**
   * Generate game system information
   */
  private generateGameSystemInfo(systemName: string): GameSystemInfo {
    const systemData = {
      'dnd5e': {
        name: 'Dungeons & Dragons',
        version: '5th Edition',
        abbreviation: 'D&D 5e',
        compatibilityNotes: [
          'Compatible with all official D&D 5e sourcebooks',
          'Can be adapted for homebrew campaigns',
          'Works with digital tools like D&D Beyond'
        ]
      },
      'pathfinder2e': {
        name: 'Pathfinder',
        version: '2nd Edition',
        abbreviation: 'PF2e',
        compatibilityNotes: [
          'Requires Pathfinder 2e Core Rulebook',
          'Compatible with Paizo adventure paths',
          'Works with Foundry VTT and Roll20'
        ]
      },
      'generic': {
        name: 'Generic Fantasy',
        version: 'System Agnostic',
        abbreviation: 'Generic',
        compatibilityNotes: [
          'Adaptable to most fantasy RPG systems',
          'May require mechanical adjustments',
          'Focus on narrative elements'
        ]
      }
    };

    return systemData[systemName] || systemData['dnd5e'];
  }

  /**
   * Generate party information with scaling notes
   */
  private generatePartyInfo(specs: SessionSpecifications): PartyInfo {
    const scalingNotes = this.generateScalingNotes(specs.partyLevel, specs.partySize);
    
    return {
      level: specs.partyLevel,
      size: specs.partySize,
      recommendedSize: { min: 3, max: 6 },
      levelRange: { min: Math.max(1, specs.partyLevel - 2), max: Math.min(20, specs.partyLevel + 2) },
      scalingNotes
    };
  }

  /**
   * Generate session timing information
   */
  private generateSessionInfo(specs: SessionSpecifications, contentReqs: any): SessionInfo {
    const durationData = this.DURATION_MAPPING[specs.estimatedDuration] || this.DURATION_MAPPING['medium'];
    
    const pacing = this.calculatePacing(contentReqs);
    const breakSuggestions = this.generateBreakSuggestions(durationData);
    const timingNotes = this.generateTimingNotes(contentReqs, durationData);

    return {
      estimatedDuration: durationData.description,
      durationMinutes: { min: durationData.min, max: durationData.max },
      pacing,
      breakSuggestions,
      timingNotes
    };
  }

  /**
   * Generate comprehensive safety information
   */
  private generateSafetyInfo(specs: SessionSpecifications, contentReqs: any): SafetyInfo {
    const contentWarnings = this.generateContentWarnings(specs.contentWarnings, contentReqs);
    const safetyTools = this.selectRecommendedSafetyTools(contentWarnings);
    const toneGuidance = this.generateToneGuidance(contentReqs);
    const playerConsent = this.generatePlayerConsentGuidance(contentWarnings);

    return {
      contentWarnings,
      safetyTools,
      toneGuidance,
      playerConsent
    };
  }

  /**
   * Calculate comprehensive difficulty information
   */
  private calculateDifficultyInfo(requirements: ParsedRequirements): DifficultyInfo {
    const combat = this.calculateCombatDifficulty(requirements);
    const roleplay = this.calculateRoleplayDifficulty(requirements);
    const puzzles = this.calculatePuzzleDifficulty(requirements);
    const exploration = this.calculateExplorationDifficulty(requirements);
    
    const overall = this.calculateOverallDifficulty(combat, roleplay, puzzles, exploration);
    const adjustmentTips = this.generateDifficultyAdjustmentTips(overall, requirements);

    return {
      overall,
      combat,
      roleplay,
      puzzles,
      exploration,
      adjustmentTips
    };
  }

  /**
   * Generate preparation information for GMs
   */
  private generatePreparationInfo(requirements: ParsedRequirements): PreparationInfo {
    const complexity = requirements.mechanicalComplexity;
    const prepTimeMapping = {
      'basic': '15-30 minutes',
      'intermediate': '30-60 minutes',
      'advanced': '60-90 minutes',
      'expert': '90-120 minutes'
    };

    const requiredMaterials = [
      'Player character sheets',
      'Dice (d20, d4, d6, d8, d10, d12)',
      'Pencils and paper',
      'This adventure PDF'
    ];

    const optionalMaterials = [
      'Miniatures or tokens',
      'Battle mat or grid',
      'Music playlist',
      'Props for immersion',
      'Digital tools (VTT, apps)'
    ];

    const gmExperienceMapping = {
      'basic': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'experienced',
      'expert': 'expert'
    };

    const preparationNotes = this.generatePreparationNotes(requirements);

    return {
      prepTime: prepTimeMapping[complexity],
      requiredMaterials,
      optionalMaterials,
      gmExperience: gmExperienceMapping[complexity] as any,
      preparationNotes
    };
  }

  // Helper methods for detailed calculations

  private generateScalingNotes(level: number, size: number): string[] {
    const notes: string[] = [];
    
    if (size < 3) {
      notes.push('Small party: Consider reducing encounter difficulty or adding NPC ally');
    } else if (size > 6) {
      notes.push('Large party: Increase encounter difficulty and consider splitting complex scenes');
    }
    
    if (level < 3) {
      notes.push('Low level: Characters are fragile, be generous with healing opportunities');
    } else if (level > 10) {
      notes.push('High level: Characters have many options, prepare for creative solutions');
    }
    
    return notes;
  }

  private calculatePacing(contentReqs: any): 'fast' | 'moderate' | 'slow' {
    const sceneCount = contentReqs.structure.acts * contentReqs.structure.scenesPerAct.max;
    const puzzleCount = contentReqs.mechanics.puzzles.count;
    const encounterCount = contentReqs.mechanics.encounters.minorCount;
    
    const contentDensity = sceneCount + puzzleCount + encounterCount;
    
    if (contentDensity > 12) return 'fast';
    if (contentDensity > 8) return 'moderate';
    return 'slow';
  }

  private generateBreakSuggestions(durationData: any): string[] {
    const suggestions: string[] = [];
    
    if (durationData.min >= 180) {
      suggestions.push('Take a 10-15 minute break after Act 1');
    }
    
    if (durationData.min >= 300) {
      suggestions.push('Consider a longer meal break between Acts 2 and 3');
    }
    
    suggestions.push('Pause for breaks during natural story transitions');
    suggestions.push('Watch for player fatigue and adjust accordingly');
    
    return suggestions;
  }

  private generateTimingNotes(contentReqs: any, durationData: any): string[] {
    const notes: string[] = [];
    
    notes.push(`Each act should run approximately ${Math.floor(durationData.min / contentReqs.structure.acts)} minutes`);
    notes.push('Adjust pacing based on player engagement and energy levels');
    
    if (contentReqs.mechanics.puzzles.count > 0) {
      notes.push('Puzzles may take longer than expected - have hints ready');
    }
    
    if (contentReqs.mechanics.skillChallenges.structured) {
      notes.push('Structured challenges can be time-consuming - set expectations');
    }
    
    return notes;
  }

  private generateContentWarnings(warnings: string[], contentReqs: any): ContentWarning[] {
    const contentWarnings: ContentWarning[] = [];
    
    warnings.forEach(warning => {
      const warningData = this.getContentWarningData(warning);
      if (warningData) {
        contentWarnings.push(warningData);
      }
    });
    
    // Add warnings based on content requirements
    if (contentReqs.background.tone.includes('dark')) {
      contentWarnings.push({
        category: 'Dark Themes',
        description: 'Adventure contains dark fantasy elements and mature themes',
        severity: 'moderate',
        alternatives: ['Lighten tone', 'Focus on hope and redemption']
      });
    }
    
    return contentWarnings;
  }

  private getContentWarningData(warning: string): ContentWarning | null {
    const warningMap: { [key: string]: ContentWarning } = {
      'Winter/cold themes': {
        category: 'Environmental',
        description: 'Themes of cold, winter, and isolation may affect some players',
        severity: 'mild',
        alternatives: ['Change season to autumn', 'Emphasize warmth and shelter']
      },
      'Memory manipulation': {
        category: 'Mental Effects',
        description: 'Characters may experience memory loss or manipulation',
        severity: 'moderate',
        alternatives: ['Make effects temporary', 'Allow saving throws to resist']
      },
      'Cosmic horror elements': {
        category: 'Horror',
        description: 'Eldritch and unknowable entities that may cause existential dread',
        severity: 'intense',
        alternatives: ['Reduce cosmic scope', 'Focus on more familiar threats']
      }
    };
    
    return warningMap[warning] || null;
  }

  private selectRecommendedSafetyTools(warnings: ContentWarning[]): SafetyTool[] {
    const recommended = this.SAFETY_TOOLS.filter(tool => tool.recommended);
    
    // Add specific tools based on content warnings
    const hasIntenseContent = warnings.some(w => w.severity === 'intense');
    if (hasIntenseContent) {
      recommended.push(this.SAFETY_TOOLS.find(t => t.name === 'Check-ins')!);
    }
    
    return recommended;
  }

  private generateToneGuidance(contentReqs: any): string[] {
    const guidance: string[] = [];
    
    guidance.push(`Maintain a ${contentReqs.background.tone} atmosphere throughout`);
    guidance.push('Allow moments of levity to balance darker themes');
    guidance.push('Emphasize player agency in determining the story\'s direction');
    
    if (contentReqs.background.tone.includes('hope')) {
      guidance.push('Highlight opportunities for redemption and positive outcomes');
    }
    
    return guidance;
  }

  private generatePlayerConsentGuidance(warnings: ContentWarning[]): string[] {
    const guidance: string[] = [];
    
    guidance.push('Discuss content warnings with players before the session');
    guidance.push('Establish boundaries and comfort levels');
    guidance.push('Remind players they can speak up if uncomfortable');
    
    if (warnings.length > 0) {
      guidance.push('Consider individual player triggers and adjust accordingly');
    }
    
    return guidance;
  }

  private calculateCombatDifficulty(requirements: ParsedRequirements): DifficultyRating {
    const level = requirements.sessionSpecs.partyLevel;
    const encounterCount = requirements.contentRequirements.mechanics.encounters.minorCount;
    const hasBoss = requirements.contentRequirements.characters.monsters.bossCount > 0;
    
    let score = 5; // Base moderate
    
    if (level < 3) score += 1; // Harder for low levels
    if (level > 10) score -= 1; // Easier for high levels
    if (encounterCount > 3) score += 1;
    if (hasBoss) score += 1;
    
    return this.scoreToRating(score, 'Combat encounters balanced for party level and size');
  }

  private calculateRoleplayDifficulty(requirements: ParsedRequirements): DifficultyRating {
    const npcCount = requirements.contentRequirements.characters.npcs.count.max;
    const hasComplexMotivations = requirements.contentRequirements.characters.npcs.relationshipMaps;
    
    let score = 4; // Base easy-moderate
    
    if (npcCount > 4) score += 1;
    if (hasComplexMotivations) score += 1;
    
    return this.scoreToRating(score, 'Roleplay opportunities with memorable NPCs');
  }

  private calculatePuzzleDifficulty(requirements: ParsedRequirements): DifficultyRating {
    const puzzleCount = requirements.contentRequirements.mechanics.puzzles.count;
    const multiSolution = requirements.contentRequirements.mechanics.puzzles.multiSolution;
    
    let score = 3; // Base easy
    
    if (puzzleCount > 1) score += 2;
    if (multiSolution) score += 1;
    
    return this.scoreToRating(score, 'Puzzles designed with multiple solution paths');
  }

  private calculateExplorationDifficulty(requirements: ParsedRequirements): DifficultyRating {
    const sceneCount = requirements.contentRequirements.structure.acts * 
                      requirements.contentRequirements.structure.scenesPerAct.max;
    const hasEnvironmentalFeatures = requirements.contentRequirements.scenes.environmentalFeatures;
    
    let score = 4; // Base easy-moderate
    
    if (sceneCount > 9) score += 1;
    if (hasEnvironmentalFeatures) score += 1;
    
    return this.scoreToRating(score, 'Exploration with environmental interaction opportunities');
  }

  private calculateOverallDifficulty(combat: DifficultyRating, roleplay: DifficultyRating, 
                                   puzzles: DifficultyRating, exploration: DifficultyRating): DifficultyRating {
    const averageScore = (combat.score + roleplay.score + puzzles.score + exploration.score) / 4;
    return this.scoreToRating(Math.round(averageScore), 'Balanced challenge across all pillars of play');
  }

  private scoreToRating(score: number, description: string): DifficultyRating {
    if (score <= 3) {
      return { level: 'easy', score, description, indicators: ['Forgiving', 'Accessible', 'Beginner-friendly'] };
    } else if (score <= 5) {
      return { level: 'moderate', score, description, indicators: ['Balanced', 'Standard', 'Engaging'] };
    } else if (score <= 7) {
      return { level: 'hard', score, description, indicators: ['Challenging', 'Demanding', 'Tactical'] };
    } else {
      return { level: 'deadly', score, description, indicators: ['Punishing', 'Unforgiving', 'Expert-level'] };
    }
  }

  private generateDifficultyAdjustmentTips(overall: DifficultyRating, requirements: ParsedRequirements): string[] {
    const tips: string[] = [];
    
    if (overall.level === 'easy') {
      tips.push('Add complications or increase DC values for more challenge');
      tips.push('Include additional enemies in encounters');
    } else if (overall.level === 'hard' || overall.level === 'deadly') {
      tips.push('Reduce enemy HP or damage for easier encounters');
      tips.push('Provide additional healing opportunities');
      tips.push('Lower DC values by 2-3 points');
    }
    
    tips.push('Adjust on the fly based on player performance');
    tips.push('Remember that fun is more important than strict balance');
    
    return tips;
  }

  private generatePreparationNotes(requirements: ParsedRequirements): string[] {
    const notes: string[] = [];
    
    notes.push('Read through the entire adventure before running');
    notes.push('Familiarize yourself with NPC motivations and voices');
    
    if (requirements.contentRequirements.mechanics.puzzles.count > 0) {
      notes.push('Prepare hints for puzzles in case players get stuck');
    }
    
    if (requirements.qualityStandards.professional.quickReference) {
      notes.push('Keep the quick reference page handy during play');
    }
    
    notes.push('Consider the pacing and be ready to adjust timing');
    notes.push('Have backup plans for unexpected player actions');
    
    return notes;
  }
}

// Export singleton instance
export const sessionMetadataGenerator = new SessionMetadataGenerator();