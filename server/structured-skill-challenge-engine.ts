/**
 * Structured Skill Challenge Engine
 * 
 * This module implements a sophisticated skill challenge system following
 * the "X successes before Y failures" format with dynamic consequences
 * and intelligent skill selection algorithms.
 */

export interface StructuredSkillChallenge {
  id: string;
  name: string;
  description: string;
  theme: string;
  structure: ChallengeStructure;
  skillOptions: SkillOption[];
  consequences: ChallengeConsequences;
  progression: ProgressionTracker;
  dynamicElements: DynamicElement[];
  narrativeFramework: NarrativeFramework;
  scalingRules: ScalingRules;
}

export interface ChallengeStructure {
  successesRequired: number;
  failuresAllowed: number;
  format: string; // "X successes before Y failures"
  timeLimit?: number;
  rounds?: number;
  participationRules: ParticipationRules;
  complexityModifiers: ComplexityModifier[];
}

export interface SkillOption {
  skill: string;
  category: SkillCategory;
  dc: number;
  description: string;
  successOutcome: string;
  failureOutcome: string;
  usageLimit?: number;
  prerequisites: string[];
  synergies: SkillSynergy[];
  alternatives: string[];
}

export interface ChallengeConsequences {
  success: ConsequenceSet;
  failure: ConsequenceSet;
  partial: ConsequenceSet;
  criticalSuccess: ConsequenceSet;
  criticalFailure: ConsequenceSet;
}

export interface ConsequenceSet {
  immediate: Consequence[];
  delayed: Consequence[];
  ongoing: Consequence[];
  narrative: string;
  mechanical: MechanicalConsequence[];
}

export interface Consequence {
  type: ConsequenceType;
  description: string;
  severity: ConsequenceSeverity;
  duration: ConsequenceDuration;
  affectedParties: string[];
  mitigation?: string[];
}

export interface MechanicalConsequence {
  type: MechanicalType;
  effect: string;
  value?: number;
  duration: string;
  conditions: string[];
}

export interface ProgressionTracker {
  currentSuccesses: number;
  currentFailures: number;
  attemptHistory: ChallengeAttempt[];
  usedSkills: string[];
  participatingCharacters: string[];
  timeElapsed: number;
  momentum: MomentumState;
}

export interface ChallengeAttempt {
  character: string;
  skill: string;
  roll: number;
  dc: number;
  result: AttemptResult;
  consequences: string[];
  timestamp: number;
  modifiers: AttemptModifier[];
}

export interface DynamicElement {
  trigger: DynamicTrigger;
  effect: DynamicEffect;
  condition: string;
  duration: string;
  description: string;
}

export interface NarrativeFramework {
  openingDescription: string;
  progressDescriptions: ProgressDescription[];
  conclusionVariants: ConclusionVariant[];
  characterMoments: CharacterMoment[];
  environmentalChanges: EnvironmentalChange[];
}

export interface ScalingRules {
  partySize: PartySizeScaling;
  level: LevelScaling;
  difficulty: DifficultyScaling;
  timeConstraints: TimeScaling;
}

export interface ParticipationRules {
  minParticipants: number;
  maxParticipants?: number;
  rotationRequired: boolean;
  leadershipRoles: string[];
  collaborationBonuses: CollaborationBonus[];
}

export interface ComplexityModifier {
  condition: string;
  effect: string;
  impact: ModifierImpact;
  description: string;
}

export interface SkillSynergy {
  withSkill: string;
  bonus: number;
  description: string;
  requirements: string[];
}

export interface MomentumState {
  current: MomentumLevel;
  effects: MomentumEffect[];
  triggers: MomentumTrigger[];
}

export interface AttemptModifier {
  source: string;
  value: number;
  type: ModifierType;
  description: string;
}

export interface DynamicTrigger {
  type: TriggerType;
  condition: string;
  threshold?: number;
}

export interface DynamicEffect {
  type: EffectType;
  description: string;
  mechanicalChange: string;
  narrativeImpact: string;
}

export interface ProgressDescription {
  successCount: number;
  failureCount: number;
  description: string;
  tone: DescriptionTone;
}

export interface ConclusionVariant {
  outcome: ChallengeOutcome;
  description: string;
  requirements: string[];
  followUp: string[];
}

export interface CharacterMoment {
  trigger: string;
  character: string;
  description: string;
  mechanicalBenefit?: string;
}

export interface EnvironmentalChange {
  trigger: string;
  description: string;
  mechanicalEffect: string;
  duration: string;
}

export interface PartySizeScaling {
  baseSize: number;
  adjustments: SizeAdjustment[];
}

export interface SizeAdjustment {
  size: number;
  successModifier: number;
  failureModifier: number;
  dcAdjustment: number;
  notes: string[];
}

export interface LevelScaling {
  baseLevel: number;
  adjustments: LevelAdjustment[];
}

export interface LevelAdjustment {
  levelRange: string;
  dcModifier: number;
  complexityChange: string;
  additionalOptions: string[];
}

export interface DifficultyScaling {
  baseDifficulty: ChallengeDifficulty;
  adjustments: DifficultyAdjustment[];
}

export interface DifficultyAdjustment {
  targetDifficulty: ChallengeDifficulty;
  structureChange: StructureChange;
  dcModification: number;
  consequenceIntensity: ConsequenceIntensity;
}

export interface TimeScaling {
  baseTime?: number;
  pressureModifiers: PressureModifier[];
}

export interface CollaborationBonus {
  condition: string;
  bonus: number;
  description: string;
  requirements: string[];
}

export interface MomentumEffect {
  level: MomentumLevel;
  description: string;
  mechanicalBonus: string;
  narrativeImpact: string;
}

export interface MomentumTrigger {
  condition: string;
  change: MomentumChange;
  description: string;
}

export interface StructureChange {
  successesRequired?: number;
  failuresAllowed?: number;
  timeLimit?: number;
  additionalRules?: string[];
}

export interface PressureModifier {
  timeRemaining: number;
  dcModifier: number;
  description: string;
  narrativeEffect: string;
}

// Enums and types
export type SkillCategory = 'primary' | 'secondary' | 'creative' | 'social' | 'physical' | 'mental';
export type ConsequenceType = 'story' | 'mechanical' | 'social' | 'environmental' | 'personal';
export type ConsequenceSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type ConsequenceDuration = 'immediate' | 'scene' | 'session' | 'ongoing' | 'permanent';
export type MechanicalType = 'bonus' | 'penalty' | 'condition' | 'resource' | 'access';
export type AttemptResult = 'critical-success' | 'success' | 'failure' | 'critical-failure';
export type MomentumLevel = 'negative' | 'neutral' | 'positive' | 'high';
export type ModifierImpact = 'minor' | 'moderate' | 'major';
export type ModifierType = 'circumstance' | 'equipment' | 'magic' | 'teamwork' | 'environmental';
export type TriggerType = 'success-count' | 'failure-count' | 'time' | 'character-action' | 'environmental';
export type EffectType = 'dc-change' | 'skill-unlock' | 'narrative-shift' | 'mechanical-bonus' | 'environmental-change';
export type DescriptionTone = 'hopeful' | 'tense' | 'desperate' | 'triumphant' | 'ominous';
export type ChallengeOutcome = 'complete-success' | 'success' | 'partial-success' | 'failure' | 'critical-failure';
export type ChallengeDifficulty = 'easy' | 'moderate' | 'hard' | 'extreme';
export type ConsequenceIntensity = 'light' | 'standard' | 'severe' | 'devastating';
export type MomentumChange = 'increase' | 'decrease' | 'reset' | 'reverse';

/**
 * Structured Skill Challenge Engine Class
 */
export class StructuredSkillChallengeEngine {
  private readonly CHALLENGE_TEMPLATES = {
    'resist-influence': {
      name: 'Resist Mental Influence',
      baseStructure: { successes: 4, failures: 3 },
      primarySkills: ['Wisdom (Insight)', 'Charisma (Persuasion)', 'Intelligence (Investigation)'],
      theme: 'mental-resistance'
    },
    'social-negotiation': {
      name: 'Complex Negotiation',
      baseStructure: { successes: 5, failures: 3 },
      primarySkills: ['Charisma (Persuasion)', 'Charisma (Deception)', 'Wisdom (Insight)', 'Intelligence (History)'],
      theme: 'social-interaction'
    },
    'environmental-traversal': {
      name: 'Dangerous Environment',
      baseStructure: { successes: 3, failures: 2 },
      primarySkills: ['Dexterity (Acrobatics)', 'Strength (Athletics)', 'Wisdom (Survival)', 'Intelligence (Nature)'],
      theme: 'physical-challenge'
    },
    'magical-ritual': {
      name: 'Complex Magical Ritual',
      baseStructure: { successes: 6, failures: 2 },
      primarySkills: ['Intelligence (Arcana)', 'Wisdom (Religion)', 'Charisma (Performance)', 'Constitution (Concentration)'],
      theme: 'magical-complexity'
    },
    'investigation-mystery': {
      name: 'Unravel the Mystery',
      baseStructure: { successes: 4, failures: 4 },
      primarySkills: ['Intelligence (Investigation)', 'Wisdom (Perception)', 'Charisma (Persuasion)', 'Intelligence (History)'],
      theme: 'intellectual-challenge'
    }
  };

  private readonly BASE_DCS = {
    'easy': 12,
    'moderate': 15,
    'hard': 17,
    'extreme': 20
  };

  /**
   * Generate a structured skill challenge
   */
  generateStructuredChallenge(
    theme: string, 
    difficulty: ChallengeDifficulty, 
    context: ChallengeContext
  ): StructuredSkillChallenge {
    console.log(`⚔️ [CHALLENGE] Generating structured skill challenge - Theme: ${theme}, Difficulty: ${difficulty}`);
    
    const template = this.selectChallengeTemplate(theme);
    const structure = this.createChallengeStructure(template, difficulty, context);
    const skillOptions = this.generateSkillOptions(template, difficulty, context);
    const consequences = this.createConsequences(template, difficulty, context);
    const dynamicElements = this.generateDynamicElements(template, context);
    const narrativeFramework = this.createNarrativeFramework(template, context);
    const scalingRules = this.generateScalingRules(template, difficulty);
    
    const challenge: StructuredSkillChallenge = {
      id: `challenge-${Date.now()}`,
      name: template.name,
      description: this.generateChallengeDescription(template, context),
      theme: template.theme,
      structure,
      skillOptions,
      consequences,
      progression: this.initializeProgressionTracker(),
      dynamicElements,
      narrativeFramework,
      scalingRules
    };

    console.log(`✅ [CHALLENGE] Generated "${challenge.name}" (${structure.format})`);
    console.log(`   Skills: ${skillOptions.length}, Dynamic Elements: ${dynamicElements.length}`);
    
    return challenge;
  }
  /
**
   * Process a skill attempt within the challenge
   */
  processSkillAttempt(
    challenge: StructuredSkillChallenge,
    attempt: SkillAttemptInput
  ): SkillAttemptResult {
    console.log(`🎲 [CHALLENGE] Processing ${attempt.skill} attempt by ${attempt.character}`);
    
    // Find the skill option
    const skillOption = challenge.skillOptions.find(option => 
      option.skill === attempt.skill
    );
    
    if (!skillOption) {
      return {
        success: false,
        result: 'failure',
        message: 'Invalid skill choice',
        consequences: [],
        progressUpdate: null
      };
    }

    // Check prerequisites and usage limits
    const validationResult = this.validateSkillAttempt(challenge, skillOption, attempt);
    if (!validationResult.valid) {
      return {
        success: false,
        result: 'failure',
        message: validationResult.reason,
        consequences: [],
        progressUpdate: null
      };
    }

    // Calculate final DC with modifiers
    const finalDC = this.calculateFinalDC(challenge, skillOption, attempt);
    
    // Determine result
    const result = this.determineAttemptResult(attempt.roll, finalDC);
    
    // Update progression
    const progressUpdate = this.updateProgression(challenge, result, attempt);
    
    // Generate consequences
    const consequences = this.generateAttemptConsequences(challenge, skillOption, result);
    
    // Check for dynamic elements
    this.processDynamicElements(challenge, result, attempt);
    
    // Update momentum
    this.updateMomentum(challenge, result);
    
    console.log(`   Result: ${result}, Progress: ${progressUpdate.successes}/${challenge.structure.successesRequired} successes`);
    
    return {
      success: result === 'success' || result === 'critical-success',
      result,
      message: this.generateResultMessage(skillOption, result),
      consequences,
      progressUpdate,
      narrativeDescription: this.generateNarrativeDescription(challenge, result, attempt)
    };
  }

  /**
   * Check if challenge is complete
   */
  checkChallengeCompletion(challenge: StructuredSkillChallenge): ChallengeCompletionResult {
    const progress = challenge.progression;
    const structure = challenge.structure;
    
    if (progress.currentSuccesses >= structure.successesRequired) {
      return {
        isComplete: true,
        outcome: 'success',
        finalConsequences: challenge.consequences.success,
        narrativeConclusion: this.generateSuccessConclusion(challenge)
      };
    }
    
    if (progress.currentFailures >= structure.failuresAllowed) {
      return {
        isComplete: true,
        outcome: 'failure',
        finalConsequences: challenge.consequences.failure,
        narrativeConclusion: this.generateFailureConclusion(challenge)
      };
    }
    
    // Check for time limit
    if (structure.timeLimit && progress.timeElapsed >= structure.timeLimit) {
      return {
        isComplete: true,
        outcome: 'failure',
        finalConsequences: challenge.consequences.failure,
        narrativeConclusion: this.generateTimeoutConclusion(challenge)
      };
    }
    
    return {
      isComplete: false,
      outcome: 'ongoing',
      progressDescription: this.generateProgressDescription(challenge)
    };
  }

  /**
   * Generate adaptive skill suggestions
   */
  generateSkillSuggestions(
    challenge: StructuredSkillChallenge,
    context: SuggestionContext
  ): SkillSuggestion[] {
    const suggestions: SkillSuggestion[] = [];
    
    // Analyze current situation
    const progress = challenge.progression;
    const momentum = progress.momentum.current;
    const usedSkills = progress.usedSkills;
    
    // Generate suggestions based on context
    challenge.skillOptions.forEach(option => {
      if (this.shouldSuggestSkill(option, challenge, context)) {
        suggestions.push({
          skill: option.skill,
          reason: this.generateSuggestionReason(option, challenge, context),
          priority: this.calculateSuggestionPriority(option, challenge, context),
          synergies: option.synergies.filter(syn => 
            context.availableCharacters.some(char => char.skills.includes(syn.withSkill))
          )
        });
      }
    });
    
    // Sort by priority
    suggestions.sort((a, b) => b.priority - a.priority);
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  // Private helper methods

  private selectChallengeTemplate(theme: string): any {
    const themeMapping = {
      'mental-resistance': 'resist-influence',
      'social': 'social-negotiation',
      'environmental': 'environmental-traversal',
      'magical': 'magical-ritual',
      'investigation': 'investigation-mystery'
    };
    
    const templateKey = themeMapping[theme] || 'resist-influence';
    return this.CHALLENGE_TEMPLATES[templateKey];
  }

  private createChallengeStructure(
    template: any, 
    difficulty: ChallengeDifficulty, 
    context: ChallengeContext
  ): ChallengeStructure {
    const baseStructure = template.baseStructure;
    
    // Adjust for difficulty
    const difficultyAdjustments = {
      'easy': { successMod: -1, failureMod: 1 },
      'moderate': { successMod: 0, failureMod: 0 },
      'hard': { successMod: 1, failureMod: -1 },
      'extreme': { successMod: 2, failureMod: -1 }
    };
    
    const adjustment = difficultyAdjustments[difficulty];
    const successesRequired = Math.max(2, baseStructure.successes + adjustment.successMod);
    const failuresAllowed = Math.max(1, baseStructure.failures + adjustment.failureMod);
    
    return {
      successesRequired,
      failuresAllowed,
      format: `${successesRequired} successes before ${failuresAllowed} failures`,
      timeLimit: context.hasTimeLimit ? this.calculateTimeLimit(difficulty) : undefined,
      participationRules: this.createParticipationRules(context),
      complexityModifiers: this.generateComplexityModifiers(template, difficulty)
    };
  }

  private generateSkillOptions(
    template: any, 
    difficulty: ChallengeDifficulty, 
    context: ChallengeContext
  ): SkillOption[] {
    const options: SkillOption[] = [];
    const baseDC = this.BASE_DCS[difficulty];
    
    // Primary skills (always available)
    template.primarySkills.forEach((skill: string, index: number) => {
      options.push({
        skill,
        category: 'primary',
        dc: baseDC + (index === 0 ? 0 : Math.floor(Math.random() * 3) - 1),
        description: this.generateSkillDescription(skill, template.theme),
        successOutcome: this.generateSuccessOutcome(skill, template.theme),
        failureOutcome: this.generateFailureOutcome(skill, template.theme),
        prerequisites: [],
        synergies: this.generateSkillSynergies(skill, template.primarySkills),
        alternatives: this.generateAlternatives(skill)
      });
    });
    
    // Secondary skills (situational)
    const secondarySkills = this.generateSecondarySkills(template.theme, context);
    secondarySkills.forEach(skill => {
      options.push({
        skill,
        category: 'secondary',
        dc: baseDC + 1,
        description: this.generateSkillDescription(skill, template.theme),
        successOutcome: this.generateSuccessOutcome(skill, template.theme),
        failureOutcome: this.generateFailureOutcome(skill, template.theme),
        prerequisites: this.generatePrerequisites(skill, context),
        synergies: [],
        alternatives: []
      });
    });
    
    // Creative options (always available)
    options.push({
      skill: 'Creative Approach',
      category: 'creative',
      dc: baseDC - 1, // Slightly easier to encourage creativity
      description: 'Use creative thinking and available resources to contribute to the challenge',
      successOutcome: 'Your innovative approach provides unexpected benefits',
      failureOutcome: 'The creative attempt doesn\'t work as planned but provides insight',
      prerequisites: [],
      synergies: [],
      alternatives: ['Any skill with creative justification']
    });
    
    return options;
  }

  private createConsequences(
    template: any, 
    difficulty: ChallengeDifficulty, 
    context: ChallengeContext
  ): ChallengeConsequences {
    return {
      success: this.generateSuccessConsequences(template, difficulty, context),
      failure: this.generateFailureConsequences(template, difficulty, context),
      partial: this.generatePartialConsequences(template, difficulty, context),
      criticalSuccess: this.generateCriticalSuccessConsequences(template, difficulty, context),
      criticalFailure: this.generateCriticalFailureConsequences(template, difficulty, context)
    };
  }

  private generateDynamicElements(template: any, context: ChallengeContext): DynamicElement[] {
    const elements: DynamicElement[] = [];
    
    // Momentum shifts
    elements.push({
      trigger: { type: 'success-count', condition: 'consecutive-successes', threshold: 2 },
      effect: { type: 'dc-change', description: 'Momentum builds', mechanicalChange: 'DC -1 for next attempt', narrativeImpact: 'The party works in perfect harmony' },
      condition: 'Two consecutive successes',
      duration: 'Next attempt',
      description: 'Success breeds success as the party finds their rhythm'
    });
    
    // Escalating difficulty
    elements.push({
      trigger: { type: 'failure-count', condition: 'multiple-failures', threshold: 2 },
      effect: { type: 'narrative-shift', description: 'Situation deteriorates', mechanicalChange: 'Additional complications', narrativeImpact: 'The challenge becomes more desperate' },
      condition: 'Two failures accumulated',
      duration: 'Remainder of challenge',
      description: 'Repeated failures make the situation more dire'
    });
    
    return elements;
  }

  private createNarrativeFramework(template: any, context: ChallengeContext): NarrativeFramework {
    return {
      openingDescription: this.generateOpeningDescription(template, context),
      progressDescriptions: this.generateProgressDescriptions(template),
      conclusionVariants: this.generateConclusionVariants(template),
      characterMoments: this.generateCharacterMoments(template),
      environmentalChanges: this.generateEnvironmentalChanges(template)
    };
  }

  private generateScalingRules(template: any, difficulty: ChallengeDifficulty): ScalingRules {
    return {
      partySize: this.createPartySizeScaling(),
      level: this.createLevelScaling(difficulty),
      difficulty: this.createDifficultyScaling(),
      timeConstraints: this.createTimeScaling()
    };
  }

  private initializeProgressionTracker(): ProgressionTracker {
    return {
      currentSuccesses: 0,
      currentFailures: 0,
      attemptHistory: [],
      usedSkills: [],
      participatingCharacters: [],
      timeElapsed: 0,
      momentum: {
        current: 'neutral',
        effects: [],
        triggers: []
      }
    };
  }

  private validateSkillAttempt(
    challenge: StructuredSkillChallenge,
    skillOption: SkillOption,
    attempt: SkillAttemptInput
  ): ValidationResult {
    // Check usage limits
    if (skillOption.usageLimit) {
      const usageCount = challenge.progression.attemptHistory
        .filter(a => a.skill === skillOption.skill).length;
      if (usageCount >= skillOption.usageLimit) {
        return { valid: false, reason: 'Skill usage limit exceeded' };
      }
    }
    
    // Check prerequisites
    for (const prereq of skillOption.prerequisites) {
      if (!this.checkPrerequisite(challenge, prereq)) {
        return { valid: false, reason: `Prerequisite not met: ${prereq}` };
      }
    }
    
    return { valid: true };
  }

  private calculateFinalDC(
    challenge: StructuredSkillChallenge,
    skillOption: SkillOption,
    attempt: SkillAttemptInput
  ): number {
    let finalDC = skillOption.dc;
    
    // Apply momentum effects
    const momentum = challenge.progression.momentum;
    if (momentum.current === 'positive') finalDC -= 1;
    if (momentum.current === 'negative') finalDC += 1;
    if (momentum.current === 'high') finalDC -= 2;
    
    // Apply synergy bonuses
    const lastAttempt = challenge.progression.attemptHistory.slice(-1)[0];
    if (lastAttempt) {
      const synergy = skillOption.synergies.find(s => s.withSkill === lastAttempt.skill);
      if (synergy) {
        finalDC -= synergy.bonus;
      }
    }
    
    // Apply modifiers from attempt
    attempt.modifiers?.forEach(mod => {
      finalDC += mod.value;
    });
    
    return Math.max(5, Math.min(25, finalDC)); // Clamp between 5 and 25
  }

  private determineAttemptResult(roll: number, dc: number): AttemptResult {
    if (roll === 20) return 'critical-success';
    if (roll === 1) return 'critical-failure';
    if (roll >= dc + 10) return 'critical-success';
    if (roll >= dc) return 'success';
    if (roll <= dc - 10) return 'critical-failure';
    return 'failure';
  }

  private updateProgression(
    challenge: StructuredSkillChallenge,
    result: AttemptResult,
    attempt: SkillAttemptInput
  ): ProgressUpdate {
    const progress = challenge.progression;
    
    // Update counters
    if (result === 'success' || result === 'critical-success') {
      progress.currentSuccesses++;
      if (result === 'critical-success') {
        progress.currentSuccesses++; // Critical success counts as 2
      }
    } else {
      progress.currentFailures++;
      if (result === 'critical-failure') {
        progress.currentFailures++; // Critical failure counts as 2
      }
    }
    
    // Add to history
    progress.attemptHistory.push({
      character: attempt.character,
      skill: attempt.skill,
      roll: attempt.roll,
      dc: this.calculateFinalDC(challenge, 
        challenge.skillOptions.find(o => o.skill === attempt.skill)!, 
        attempt
      ),
      result,
      consequences: [],
      timestamp: Date.now(),
      modifiers: attempt.modifiers || []
    });
    
    // Track used skills and characters
    if (!progress.usedSkills.includes(attempt.skill)) {
      progress.usedSkills.push(attempt.skill);
    }
    if (!progress.participatingCharacters.includes(attempt.character)) {
      progress.participatingCharacters.push(attempt.character);
    }
    
    return {
      successes: progress.currentSuccesses,
      failures: progress.currentFailures,
      isComplete: progress.currentSuccesses >= challenge.structure.successesRequired ||
                  progress.currentFailures >= challenge.structure.failuresAllowed
    };
  }

  // Implementation helper methods

  private generateChallengeDescription(template: any, context: ChallengeContext): string {
    const themeDescriptions = {
      'mental-resistance': 'A test of mental fortitude against overwhelming psychic influence',
      'social-interaction': 'A complex social situation requiring careful navigation and diplomacy',
      'physical-challenge': 'A dangerous environment that tests physical prowess and survival instincts',
      'magical-complexity': 'An intricate magical working requiring precise coordination and arcane knowledge',
      'intellectual-challenge': 'A mystery that demands careful investigation and logical deduction'
    };
    
    return themeDescriptions[template.theme] || 'A complex challenge requiring diverse skills and teamwork';
  }

  private calculateTimeLimit(difficulty: ChallengeDifficulty): number {
    const timeLimits = {
      'easy': 45,      // 45 minutes
      'moderate': 30,  // 30 minutes
      'hard': 20,      // 20 minutes
      'extreme': 15    // 15 minutes
    };
    
    return timeLimits[difficulty];
  }

  private createParticipationRules(context: ChallengeContext): ParticipationRules {
    return {
      minParticipants: Math.max(1, Math.floor(context.partySize / 2)),
      maxParticipants: context.partySize,
      rotationRequired: context.partySize > 4,
      leadershipRoles: ['coordinator', 'specialist', 'support'],
      collaborationBonuses: [
        {
          condition: 'All party members participate',
          bonus: 1,
          description: 'Unity bonus for full participation',
          requirements: ['Each character attempts at least one skill']
        }
      ]
    };
  }

  private generateComplexityModifiers(template: any, difficulty: ChallengeDifficulty): ComplexityModifier[] {
    const modifiers: ComplexityModifier[] = [];
    
    if (difficulty === 'hard' || difficulty === 'extreme') {
      modifiers.push({
        condition: 'High difficulty challenge',
        effect: 'Additional complications may arise',
        impact: 'moderate',
        description: 'The challenge becomes more complex as it progresses'
      });
    }
    
    return modifiers;
  }

  private generateSkillDescription(skill: string, theme: string): string {
    const descriptions = {
      'Wisdom (Insight)': 'Read the situation and understand underlying motivations',
      'Charisma (Persuasion)': 'Convince others through reasoned argument and appeal',
      'Intelligence (Investigation)': 'Analyze clues and piece together information',
      'Intelligence (Arcana)': 'Apply magical knowledge and understanding',
      'Dexterity (Acrobatics)': 'Navigate physical obstacles with grace and precision',
      'Strength (Athletics)': 'Overcome physical challenges through raw power',
      'Wisdom (Survival)': 'Apply knowledge of natural environments and dangers',
      'Intelligence (Nature)': 'Understand natural phenomena and environmental factors'
    };
    
    return descriptions[skill] || `Apply ${skill} to contribute to the challenge`;
  }

  private generateSuccessOutcome(skill: string, theme: string): string {
    return `Your ${skill} attempt succeeds, advancing the challenge toward resolution`;
  }

  private generateFailureOutcome(skill: string, theme: string): string {
    return `Your ${skill} attempt doesn't achieve the desired result, but provides valuable insight`;
  }

  private generateSkillSynergies(skill: string, allSkills: string[]): SkillSynergy[] {
    const synergies: SkillSynergy[] = [];
    
    // Create logical synergies between related skills
    const synergyMap = {
      'Wisdom (Insight)': ['Charisma (Persuasion)', 'Intelligence (Investigation)'],
      'Charisma (Persuasion)': ['Wisdom (Insight)', 'Charisma (Deception)'],
      'Intelligence (Investigation)': ['Wisdom (Perception)', 'Intelligence (History)'],
      'Intelligence (Arcana)': ['Wisdom (Religion)', 'Intelligence (Investigation)']
    };
    
    const relatedSkills = synergyMap[skill] || [];
    relatedSkills.forEach(relatedSkill => {
      if (allSkills.includes(relatedSkill)) {
        synergies.push({
          withSkill: relatedSkill,
          bonus: 1,
          description: `Works well in combination with ${relatedSkill}`,
          requirements: ['Previous attempt used the synergistic skill']
        });
      }
    });
    
    return synergies;
  }

  private generateAlternatives(skill: string): string[] {
    const alternatives = {
      'Wisdom (Insight)': ['Wisdom (Perception)', 'Intelligence (Investigation)'],
      'Charisma (Persuasion)': ['Charisma (Deception)', 'Charisma (Intimidation)'],
      'Intelligence (Investigation)': ['Wisdom (Perception)', 'Intelligence (History)'],
      'Intelligence (Arcana)': ['Wisdom (Religion)', 'Intelligence (History)']
    };
    
    return alternatives[skill] || [];
  }

  private generateSecondarySkills(theme: string, context: ChallengeContext): string[] {
    const secondarySkillMap = {
      'mental-resistance': ['Wisdom (Medicine)', 'Constitution (Concentration)'],
      'social-interaction': ['Charisma (Intimidation)', 'Wisdom (Perception)'],
      'physical-challenge': ['Constitution (Concentration)', 'Wisdom (Medicine)'],
      'magical-complexity': ['Intelligence (History)', 'Wisdom (Perception)'],
      'intellectual-challenge': ['Intelligence (Religion)', 'Wisdom (Medicine)']
    };
    
    return secondarySkillMap[theme] || [];
  }

  private generatePrerequisites(skill: string, context: ChallengeContext): string[] {
    // Most skills don't have prerequisites in basic challenges
    return [];
  }

  // Consequence generation methods

  private generateSuccessConsequences(template: any, difficulty: ChallengeDifficulty, context: ChallengeContext): ConsequenceSet {
    return {
      immediate: [
        {
          type: 'story',
          description: 'The challenge is overcome successfully',
          severity: 'moderate',
          duration: 'permanent',
          affectedParties: ['party']
        }
      ],
      delayed: [],
      ongoing: [],
      narrative: 'Through skill and teamwork, you have triumphed over the challenge',
      mechanical: [
        {
          type: 'access',
          effect: 'Progress to next story beat',
          duration: 'permanent',
          conditions: []
        }
      ]
    };
  }

  private generateFailureConsequences(template: any, difficulty: ChallengeDifficulty, context: ChallengeContext): ConsequenceSet {
    return {
      immediate: [
        {
          type: 'story',
          description: 'The challenge is not overcome, but alternative paths emerge',
          severity: 'moderate',
          duration: 'scene',
          affectedParties: ['party']
        }
      ],
      delayed: [],
      ongoing: [],
      narrative: 'Despite your efforts, the challenge proves too difficult, but new opportunities arise',
      mechanical: [
        {
          type: 'access',
          effect: 'Alternative story path becomes available',
          duration: 'permanent',
          conditions: []
        }
      ]
    };
  }

  private generatePartialConsequences(template: any, difficulty: ChallengeDifficulty, context: ChallengeContext): ConsequenceSet {
    return {
      immediate: [
        {
          type: 'story',
          description: 'Partial success provides some benefits but with complications',
          severity: 'minor',
          duration: 'scene',
          affectedParties: ['party']
        }
      ],
      delayed: [],
      ongoing: [],
      narrative: 'Your efforts achieve partial success, creating a mixed outcome',
      mechanical: [
        {
          type: 'bonus',
          effect: 'Advantage on related future attempts',
          duration: 'session',
          conditions: []
        }
      ]
    };
  }

  private generateCriticalSuccessConsequences(template: any, difficulty: ChallengeDifficulty, context: ChallengeContext): ConsequenceSet {
    return {
      immediate: [
        {
          type: 'story',
          description: 'Exceptional success provides additional benefits',
          severity: 'major',
          duration: 'permanent',
          affectedParties: ['party']
        }
      ],
      delayed: [],
      ongoing: [],
      narrative: 'Your exceptional performance not only succeeds but provides unexpected advantages',
      mechanical: [
        {
          type: 'bonus',
          effect: 'Additional reward or benefit',
          duration: 'permanent',
          conditions: []
        }
      ]
    };
  }

  private generateCriticalFailureConsequences(template: any, difficulty: ChallengeDifficulty, context: ChallengeContext): ConsequenceSet {
    return {
      immediate: [
        {
          type: 'story',
          description: 'Significant failure creates additional complications',
          severity: 'major',
          duration: 'scene',
          affectedParties: ['party']
        }
      ],
      delayed: [],
      ongoing: [],
      narrative: 'The failure creates significant complications that must be addressed',
      mechanical: [
        {
          type: 'penalty',
          effect: 'Additional challenge or complication',
          duration: 'scene',
          conditions: []
        }
      ]
    };
  }

  // Narrative generation methods

  private generateOpeningDescription(template: any, context: ChallengeContext): string {
    const openings = {
      'mental-resistance': 'A powerful psychic presence presses against your minds, testing your mental fortitude...',
      'social-interaction': 'The situation is delicate, requiring careful words and diplomatic finesse...',
      'physical-challenge': 'The environment ahead is treacherous, demanding physical skill and endurance...',
      'magical-complexity': 'The magical energies swirl chaotically, requiring precise control and understanding...',
      'intellectual-challenge': 'Clues and mysteries surround you, waiting to be unraveled through careful investigation...'
    };
    
    return openings[template.theme] || 'A complex challenge lies before you, requiring diverse skills and teamwork...';
  }

  private generateProgressDescriptions(template: any): ProgressDescription[] {
    return [
      {
        successCount: 1,
        failureCount: 0,
        description: 'You make initial progress, building momentum',
        tone: 'hopeful'
      },
      {
        successCount: 2,
        failureCount: 1,
        description: 'Despite setbacks, you continue to advance',
        tone: 'tense'
      },
      {
        successCount: 1,
        failureCount: 2,
        description: 'The situation becomes increasingly difficult',
        tone: 'desperate'
      }
    ];
  }

  private generateConclusionVariants(template: any): ConclusionVariant[] {
    return [
      {
        outcome: 'complete-success',
        description: 'You overcome the challenge with exceptional skill',
        requirements: ['All successes achieved', 'No critical failures'],
        followUp: ['Additional rewards', 'Reputation boost']
      },
      {
        outcome: 'success',
        description: 'You successfully navigate the challenge',
        requirements: ['Required successes achieved'],
        followUp: ['Story progression', 'Standard rewards']
      },
      {
        outcome: 'failure',
        description: 'The challenge proves too difficult',
        requirements: ['Maximum failures reached'],
        followUp: ['Alternative path', 'Complication']
      }
    ];
  }

  private generateCharacterMoments(template: any): CharacterMoment[] {
    return [
      {
        trigger: 'First success',
        character: 'any',
        description: 'Your expertise shines through in this moment',
        mechanicalBenefit: 'Inspiration for next attempt'
      },
      {
        trigger: 'Critical success',
        character: 'any',
        description: 'Your exceptional performance inspires the entire party',
        mechanicalBenefit: 'Party gains advantage on next attempt'
      }
    ];
  }

  private generateEnvironmentalChanges(template: any): EnvironmentalChange[] {
    return [
      {
        trigger: 'Multiple failures',
        description: 'The situation becomes more volatile and unpredictable',
        mechanicalEffect: 'DC increases by 1 for remaining attempts',
        duration: 'Remainder of challenge'
      },
      {
        trigger: 'Multiple successes',
        description: 'Your progress creates favorable conditions',
        mechanicalEffect: 'DC decreases by 1 for next attempt',
        duration: 'Next attempt only'
      }
    ];
  }

  // Scaling methods

  private createPartySizeScaling(): PartySizeScaling {
    return {
      baseSize: 4,
      adjustments: [
        {
          size: 3,
          successModifier: -1,
          failureModifier: 0,
          dcAdjustment: -1,
          notes: ['Reduced success requirement', 'Slightly easier DCs']
        },
        {
          size: 5,
          successModifier: 1,
          failureModifier: 1,
          dcAdjustment: 0,
          notes: ['Increased success requirement', 'Additional failure tolerance']
        },
        {
          size: 6,
          successModifier: 2,
          failureModifier: 1,
          dcAdjustment: 0,
          notes: ['Significantly increased requirements', 'More failure tolerance']
        }
      ]
    };
  }

  private createLevelScaling(difficulty: ChallengeDifficulty): LevelScaling {
    return {
      baseLevel: 5,
      adjustments: [
        {
          levelRange: '1-2',
          dcModifier: -3,
          complexityChange: 'Simplified structure',
          additionalOptions: ['Basic skill alternatives']
        },
        {
          levelRange: '3-4',
          dcModifier: -1,
          complexityChange: 'Standard structure',
          additionalOptions: []
        },
        {
          levelRange: '6-8',
          dcModifier: 1,
          complexityChange: 'Enhanced complexity',
          additionalOptions: ['Advanced skill options']
        },
        {
          levelRange: '9+',
          dcModifier: 2,
          complexityChange: 'Maximum complexity',
          additionalOptions: ['Expert skill options', 'Additional dynamic elements']
        }
      ]
    };
  }

  private createDifficultyScaling(): DifficultyScaling {
    return {
      baseDifficulty: 'moderate',
      adjustments: [
        {
          targetDifficulty: 'easy',
          structureChange: { successesRequired: -1, failuresAllowed: 1 },
          dcModification: -2,
          consequenceIntensity: 'light'
        },
        {
          targetDifficulty: 'hard',
          structureChange: { successesRequired: 1, failuresAllowed: -1 },
          dcModification: 2,
          consequenceIntensity: 'severe'
        },
        {
          targetDifficulty: 'extreme',
          structureChange: { successesRequired: 2, failuresAllowed: -1, timeLimit: 15 },
          dcModification: 3,
          consequenceIntensity: 'devastating'
        }
      ]
    };
  }

  private createTimeScaling(): TimeScaling {
    return {
      baseTime: 30,
      pressureModifiers: [
        {
          timeRemaining: 10,
          dcModifier: 1,
          description: 'Time pressure increases difficulty',
          narrativeEffect: 'The urgency of the situation weighs heavily'
        },
        {
          timeRemaining: 5,
          dcModifier: 2,
          description: 'Extreme time pressure',
          narrativeEffect: 'Desperation sets in as time runs out'
        }
      ]
    };
  }

  // Utility and helper methods

  private checkPrerequisite(challenge: StructuredSkillChallenge, prerequisite: string): boolean {
    // Implementation depends on specific prerequisite types
    // For now, assume all prerequisites are met
    return true;
  }

  private generateAttemptConsequences(
    challenge: StructuredSkillChallenge,
    skillOption: SkillOption,
    result: AttemptResult
  ): string[] {
    const consequences: string[] = [];
    
    if (result === 'success' || result === 'critical-success') {
      consequences.push(skillOption.successOutcome);
    } else {
      consequences.push(skillOption.failureOutcome);
    }
    
    return consequences;
  }

  private processDynamicElements(
    challenge: StructuredSkillChallenge,
    result: AttemptResult,
    attempt: SkillAttemptInput
  ): void {
    challenge.dynamicElements.forEach(element => {
      if (this.checkDynamicTrigger(element.trigger, challenge, result)) {
        this.applyDynamicEffect(element.effect, challenge);
      }
    });
  }

  private checkDynamicTrigger(
    trigger: DynamicTrigger,
    challenge: StructuredSkillChallenge,
    result: AttemptResult
  ): boolean {
    const progress = challenge.progression;
    
    switch (trigger.type) {
      case 'success-count':
        if (trigger.condition === 'consecutive-successes') {
          const recentAttempts = progress.attemptHistory.slice(-2);
          return recentAttempts.length === 2 && 
                 recentAttempts.every(a => a.result === 'success' || a.result === 'critical-success');
        }
        break;
      case 'failure-count':
        if (trigger.condition === 'multiple-failures') {
          return progress.currentFailures >= (trigger.threshold || 2);
        }
        break;
    }
    
    return false;
  }

  private applyDynamicEffect(effect: DynamicEffect, challenge: StructuredSkillChallenge): void {
    // Apply the dynamic effect to the challenge
    console.log(`🔄 [CHALLENGE] Applying dynamic effect: ${effect.description}`);
    
    // Effects would modify the challenge state based on their type
    // This is a simplified implementation
  }

  private updateMomentum(challenge: StructuredSkillChallenge, result: AttemptResult): void {
    const momentum = challenge.progression.momentum;
    
    // Simple momentum system
    if (result === 'critical-success') {
      momentum.current = momentum.current === 'positive' ? 'high' : 'positive';
    } else if (result === 'success') {
      if (momentum.current === 'negative') momentum.current = 'neutral';
      else if (momentum.current === 'neutral') momentum.current = 'positive';
    } else if (result === 'failure') {
      if (momentum.current === 'positive') momentum.current = 'neutral';
      else if (momentum.current === 'neutral') momentum.current = 'negative';
    } else if (result === 'critical-failure') {
      momentum.current = 'negative';
    }
  }

  private generateResultMessage(skillOption: SkillOption, result: AttemptResult): string {
    const messages = {
      'critical-success': `Exceptional ${skillOption.skill} attempt! ${skillOption.successOutcome}`,
      'success': `Successful ${skillOption.skill} attempt. ${skillOption.successOutcome}`,
      'failure': `${skillOption.skill} attempt fails. ${skillOption.failureOutcome}`,
      'critical-failure': `Critical failure on ${skillOption.skill} attempt! ${skillOption.failureOutcome}`
    };
    
    return messages[result];
  }

  private generateNarrativeDescription(
    challenge: StructuredSkillChallenge,
    result: AttemptResult,
    attempt: SkillAttemptInput
  ): string {
    const progress = challenge.progression;
    const successRatio = progress.currentSuccesses / challenge.structure.successesRequired;
    
    if (successRatio > 0.75) {
      return 'Victory seems within reach as your efforts bear fruit';
    } else if (successRatio > 0.5) {
      return 'You make steady progress despite the challenges';
    } else if (progress.currentFailures > progress.currentSuccesses) {
      return 'The situation grows more difficult with each setback';
    } else {
      return 'The challenge continues, requiring careful strategy';
    }
  }

  private generateSuccessConclusion(challenge: StructuredSkillChallenge): string {
    return `Through skill, determination, and teamwork, you have successfully overcome the ${challenge.name}. ${challenge.consequences.success.narrative}`;
  }

  private generateFailureConclusion(challenge: StructuredSkillChallenge): string {
    return `Despite your best efforts, the ${challenge.name} proves too difficult to overcome completely. ${challenge.consequences.failure.narrative}`;
  }

  private generateTimeoutConclusion(challenge: StructuredSkillChallenge): string {
    return `Time runs out before you can complete the ${challenge.name}. The pressure of the deadline forces you to seek alternative solutions.`;
  }

  private generateProgressDescription(challenge: StructuredSkillChallenge): string {
    const progress = challenge.progression;
    const structure = challenge.structure;
    
    return `Progress: ${progress.currentSuccesses}/${structure.successesRequired} successes, ${progress.currentFailures}/${structure.failuresAllowed} failures. ${this.generateNarrativeDescription(challenge, 'success', {} as SkillAttemptInput)}`;
  }

  private shouldSuggestSkill(
    option: SkillOption,
    challenge: StructuredSkillChallenge,
    context: SuggestionContext
  ): boolean {
    // Don't suggest skills that have reached usage limits
    if (option.usageLimit) {
      const usageCount = challenge.progression.attemptHistory
        .filter(a => a.skill === option.skill).length;
      if (usageCount >= option.usageLimit) return false;
    }
    
    // Check if any character can use this skill
    return context.availableCharacters.some(char => 
      char.skills.includes(option.skill) || option.category === 'creative'
    );
  }

  private generateSuggestionReason(
    option: SkillOption,
    challenge: StructuredSkillChallenge,
    context: SuggestionContext
  ): string {
    const momentum = challenge.progression.momentum.current;
    
    if (option.category === 'primary') {
      return 'Core skill for this challenge type';
    } else if (option.category === 'creative') {
      return 'Creative approaches often provide unexpected solutions';
    } else if (momentum === 'negative') {
      return 'Alternative approach might break the negative momentum';
    } else {
      return 'Situational skill that could provide unique benefits';
    }
  }

  private calculateSuggestionPriority(
    option: SkillOption,
    challenge: StructuredSkillChallenge,
    context: SuggestionContext
  ): number {
    let priority = 50; // Base priority
    
    // Primary skills get higher priority
    if (option.category === 'primary') priority += 20;
    
    // Unused skills get bonus
    if (!challenge.progression.usedSkills.includes(option.skill)) priority += 15;
    
    // Skills with synergies get bonus if synergy conditions are met
    const lastAttempt = challenge.progression.attemptHistory.slice(-1)[0];
    if (lastAttempt && option.synergies.some(s => s.withSkill === lastAttempt.skill)) {
      priority += 10;
    }
    
    // Creative approaches get bonus when momentum is negative
    if (option.category === 'creative' && challenge.progression.momentum.current === 'negative') {
      priority += 15;
    }
    
    return priority;
  }
}

// Supporting interfaces for external use

export interface ChallengeContext {
  partySize: number;
  partyLevel: number;
  hasTimeLimit: boolean;
  environmentalFactors: string[];
  storyContext: string;
}

export interface SkillAttemptInput {
  character: string;
  skill: string;
  roll: number;
  modifiers?: AttemptModifier[];
}

export interface SkillAttemptResult {
  success: boolean;
  result: AttemptResult;
  message: string;
  consequences: string[];
  progressUpdate: ProgressUpdate | null;
  narrativeDescription?: string;
}

export interface ProgressUpdate {
  successes: number;
  failures: number;
  isComplete: boolean;
}

export interface ChallengeCompletionResult {
  isComplete: boolean;
  outcome: ChallengeOutcome;
  finalConsequences?: ConsequenceSet;
  narrativeConclusion?: string;
  progressDescription?: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface SuggestionContext {
  availableCharacters: CharacterInfo[];
  currentSituation: string;
  urgencyLevel: 'low' | 'moderate' | 'high';
}

export interface CharacterInfo {
  name: string;
  skills: string[];
  specialties: string[];
}

export interface SkillSuggestion {
  skill: string;
  reason: string;
  priority: number;
  synergies: SkillSynergy[];
}

// Export singleton instance
export const structuredSkillChallengeEngine = new StructuredSkillChallengeEngine();