/**
 * Optional Complications System
 * 
 * This module implements a modular complication generation system with
 * triggers, effects, resolution mechanics, and intelligent pacing-based
 * suggestions for GMs to enhance their adventures.
 */

export interface OptionalComplication {
  id: string;
  name: string;
  description: string;
  category: ComplicationCategory;
  severity: ComplicationSeverity;
  trigger: ComplicationTrigger;
  effects: ComplicationEffect[];
  resolution: ResolutionMethod[];
  integration: IntegrationGuidance;
  pacing: PacingConsideration;
  scalingRules: ComplicationScalingRules;
}

export interface ComplicationTrigger {
  type: TriggerType;
  condition: string;
  timing: TriggerTiming;
  probability: TriggerProbability;
  prerequisites: string[];
  contextualFactors: ContextualFactor[];
}

export interface ComplicationEffect {
  type: EffectType;
  description: string;
  mechanicalImpact: MechanicalImpact;
  narrativeConsequence: string;
  duration: EffectDuration;
  scope: EffectScope;
  mitigation: MitigationOption[];
}

export interface ResolutionMethod {
  approach: ResolutionApproach;
  description: string;
  requirements: ResolutionRequirement[];
  difficulty: ResolutionDifficulty;
  timeRequired: string;
  consequences: ResolutionConsequence[];
  alternatives: AlternativeResolution[];
}

export interface IntegrationGuidance {
  bestTiming: IntegrationTiming[];
  sceneTypes: SceneType[];
  narrativeHooks: NarrativeHook[];
  characterOpportunities: CharacterOpportunity[];
  avoidanceConditions: AvoidanceCondition[];
}

export interface PacingConsideration {
  idealMoment: PacingMoment;
  tensionLevel: TensionLevel;
  energyImpact: EnergyImpact;
  sessionPhase: SessionPhase;
  cooldownPeriod: CooldownPeriod;
}

export interface ComplicationScalingRules {
  partyLevel: LevelScaling;
  partySize: SizeScaling;
  campaignTone: ToneScaling;
  difficulty: DifficultyScaling;
}

export interface MechanicalImpact {
  type: MechanicalType;
  value?: number;
  description: string;
  affectedSystems: string[];
  duration: string;
}

export interface MitigationOption {
  method: string;
  description: string;
  requirements: string[];
  effectiveness: MitigationEffectiveness;
  cost: string;
}

export interface ResolutionRequirement {
  type: RequirementType;
  description: string;
  alternatives: string[];
  optional: boolean;
}

export interface ResolutionConsequence {
  type: ConsequenceType;
  description: string;
  impact: ConsequenceImpact;
  permanence: ConsequencePermanence;
}

export interface AlternativeResolution {
  name: string;
  description: string;
  requirements: string[];
  outcome: string;
}

export interface NarrativeHook {
  description: string;
  characterTypes: string[];
  plotConnections: string[];
  emotionalResonance: string;
}

export interface CharacterOpportunity {
  characterType: string;
  opportunityType: OpportunityType;
  description: string;
  mechanicalBenefit?: string;
}

export interface AvoidanceCondition {
  condition: string;
  reason: string;
  alternatives: string[];
}

export interface ContextualFactor {
  factor: string;
  influence: FactorInfluence;
  description: string;
}

export interface CooldownPeriod {
  duration: string;
  reason: string;
  exceptions: string[];
}

// Scaling interfaces
export interface LevelScaling {
  baseLevel: number;
  adjustments: LevelAdjustment[];
}

export interface LevelAdjustment {
  levelRange: string;
  severityModifier: SeverityModifier;
  complexityChange: ComplexityChange;
  additionalOptions: string[];
}

export interface SizeScaling {
  baseSize: number;
  adjustments: SizeAdjustment[];
}

export interface SizeAdjustment {
  size: number;
  scopeModifier: ScopeModifier;
  resolutionComplexity: ResolutionComplexity;
  notes: string[];
}

export interface ToneScaling {
  baseTone: CampaignTone;
  adjustments: ToneAdjustment[];
}

export interface ToneAdjustment {
  targetTone: CampaignTone;
  categoryEmphasis: CategoryEmphasis;
  severityAdjustment: SeverityAdjustment;
  thematicAlignment: ThematicAlignment;
}

export interface DifficultyScaling {
  baseDifficulty: ComplicationDifficulty;
  adjustments: DifficultyAdjustment[];
}

export interface DifficultyAdjustment {
  targetDifficulty: ComplicationDifficulty;
  effectIntensity: EffectIntensity;
  resolutionComplexity: ResolutionComplexity;
  consequenceSeverity: ConsequenceSeverity;
}

// Enums and types
export type ComplicationCategory = 'social' | 'environmental' | 'mechanical' | 'magical' | 'political' | 'personal' | 'temporal' | 'moral';
export type ComplicationSeverity = 'minor' | 'moderate' | 'major' | 'critical' | 'campaign-altering';
export type TriggerType = 'automatic' | 'conditional' | 'random' | 'player-action' | 'time-based' | 'story-driven';
export type TriggerTiming = 'immediate' | 'delayed' | 'next-scene' | 'next-session' | 'when-appropriate';
export type TriggerProbability = 'certain' | 'very-likely' | 'likely' | 'possible' | 'unlikely' | 'rare';
export type EffectType = 'obstacle' | 'opportunity' | 'revelation' | 'relationship' | 'resource' | 'time-pressure' | 'moral-dilemma';
export type EffectDuration = 'instant' | 'scene' | 'session' | 'arc' | 'campaign' | 'permanent';
export type EffectScope = 'individual' | 'party' | 'location' | 'organization' | 'region' | 'world';
export type ResolutionApproach = 'combat' | 'social' | 'investigation' | 'stealth' | 'magic' | 'negotiation' | 'sacrifice' | 'creative';
export type ResolutionDifficulty = 'trivial' | 'easy' | 'moderate' | 'hard' | 'extreme' | 'legendary';
export type IntegrationTiming = 'scene-opening' | 'mid-scene' | 'scene-climax' | 'scene-resolution' | 'between-scenes';
export type SceneType = 'combat' | 'social' | 'exploration' | 'investigation' | 'travel' | 'downtime' | 'climax';
export type PacingMoment = 'tension-building' | 'peak-action' | 'calm-before-storm' | 'resolution' | 'transition';
export type TensionLevel = 'low' | 'building' | 'high' | 'peak' | 'release';
export type EnergyImpact = 'energizing' | 'neutral' | 'draining' | 'exhausting';
export type SessionPhase = 'opening' | 'early' | 'middle' | 'late' | 'climax' | 'resolution';
export type MechanicalType = 'bonus' | 'penalty' | 'condition' | 'resource-change' | 'rule-modification' | 'new-mechanic';
export type MitigationEffectiveness = 'complete' | 'significant' | 'partial' | 'minimal' | 'none';
export type RequirementType = 'skill' | 'resource' | 'knowledge' | 'relationship' | 'time' | 'sacrifice';
export type ConsequenceType = 'immediate' | 'delayed' | 'cascading' | 'permanent';
export type ConsequenceImpact = 'beneficial' | 'neutral' | 'detrimental' | 'mixed';
export type ConsequencePermanence = 'temporary' | 'session' | 'arc' | 'campaign' | 'permanent';
export type OpportunityType = 'character-growth' | 'skill-showcase' | 'backstory-connection' | 'moral-choice' | 'leadership';
export type FactorInfluence = 'increases-likelihood' | 'decreases-likelihood' | 'modifies-severity' | 'changes-type';
export type SeverityModifier = 'reduced' | 'standard' | 'increased' | 'extreme';
export type ComplexityChange = 'simplified' | 'standard' | 'enhanced' | 'multi-layered';
export type ScopeModifier = 'narrowed' | 'standard' | 'broadened' | 'comprehensive';
export type ResolutionComplexity = 'simple' | 'standard' | 'complex' | 'multi-stage';
export type CampaignTone = 'heroic' | 'gritty' | 'horror' | 'comedy' | 'political' | 'exploration' | 'mystery';
export type CategoryEmphasis = 'social' | 'combat' | 'exploration' | 'mystery' | 'moral' | 'political';
export type SeverityAdjustment = 'lighter' | 'standard' | 'heavier' | 'extreme';
export type ThematicAlignment = 'perfect' | 'good' | 'acceptable' | 'poor';
export type ComplicationDifficulty = 'easy' | 'moderate' | 'hard' | 'extreme';
export type EffectIntensity = 'mild' | 'moderate' | 'severe' | 'overwhelming';

/**
 * Optional Complications System Engine Class
 */
export class OptionalComplicationsSystem {
  private readonly COMPLICATION_TEMPLATES = {
    'betrayal-revelation': {
      name: 'Unexpected Betrayal',
      category: 'social',
      baseSeverity: 'major',
      description: 'A trusted ally reveals their true allegiance',
      triggers: ['story-driven', 'conditional'],
      effects: ['relationship', 'revelation', 'moral-dilemma']
    },
    'resource-shortage': {
      name: 'Critical Resource Shortage',
      category: 'mechanical',
      baseSeverity: 'moderate',
      description: 'Essential supplies run dangerously low',
      triggers: ['time-based', 'player-action'],
      effects: ['resource', 'time-pressure', 'obstacle']
    },
    'magical-interference': {
      name: 'Arcane Disruption',
      category: 'magical',
      baseSeverity: 'moderate',
      description: 'Magical energies interfere with spellcasting',
      triggers: ['automatic', 'conditional'],
      effects: ['obstacle', 'mechanical']
    },
    'political-entanglement': {
      name: 'Political Complications',
      category: 'political',
      baseSeverity: 'major',
      description: 'Actions draw unwanted political attention',
      triggers: ['player-action', 'delayed'],
      effects: ['relationship', 'obstacle', 'opportunity']
    },
    'environmental-hazard': {
      name: 'Environmental Crisis',
      category: 'environmental',
      baseSeverity: 'moderate',
      description: 'Natural disaster or environmental change',
      triggers: ['time-based', 'random'],
      effects: ['obstacle', 'time-pressure']
    },
    'moral-crossroads': {
      name: 'Ethical Dilemma',
      category: 'moral',
      baseSeverity: 'major',
      description: 'Situation forces difficult moral choices',
      triggers: ['story-driven', 'player-action'],
      effects: ['moral-dilemma', 'relationship', 'revelation']
    },
    'time-constraint': {
      name: 'Urgent Deadline',
      category: 'temporal',
      baseSeverity: 'moderate',
      description: 'New time pressure emerges',
      triggers: ['story-driven', 'conditional'],
      effects: ['time-pressure', 'obstacle']
    },
    'personal-crisis': {
      name: 'Character Personal Crisis',
      category: 'personal',
      baseSeverity: 'moderate',
      description: 'Character faces personal challenge',
      triggers: ['story-driven', 'random'],
      effects: ['opportunity', 'moral-dilemma', 'relationship']
    }
  };

  private readonly PACING_GUIDELINES = {
    'tension-building': {
      idealComplications: ['resource-shortage', 'time-constraint', 'environmental-hazard'],
      avoidComplications: ['betrayal-revelation', 'moral-crossroads'],
      maxSeverity: 'moderate',
      frequency: 'moderate'
    },
    'peak-action': {
      idealComplications: ['magical-interference', 'environmental-hazard'],
      avoidComplications: ['political-entanglement', 'personal-crisis'],
      maxSeverity: 'major',
      frequency: 'low'
    },
    'calm-before-storm': {
      idealComplications: ['personal-crisis', 'moral-crossroads', 'political-entanglement'],
      avoidComplications: ['environmental-hazard', 'magical-interference'],
      maxSeverity: 'major',
      frequency: 'high'
    },
    'resolution': {
      idealComplications: ['betrayal-revelation', 'moral-crossroads'],
      avoidComplications: ['resource-shortage', 'time-constraint'],
      maxSeverity: 'campaign-altering',
      frequency: 'low'
    }
  };

  /**
   * Generate a contextually appropriate complication
   */
  generateComplication(
    context: ComplicationContext,
    preferences: ComplicationPreferences
  ): OptionalComplication {
    console.log(`🎭 [COMPLICATIONS] Generating complication for ${context.currentPacing} phase`);
    
    const template = this.selectComplicationTemplate(context, preferences);
    const trigger = this.generateComplicationTrigger(template, context);
    const effects = this.generateComplicationEffects(template, context, preferences);
    const resolution = this.generateResolutionMethods(template, context, preferences);
    const integration = this.generateIntegrationGuidance(template, context);
    const pacing = this.generatePacingConsideration(template, context);
    const scaling = this.generateScalingRules(template, preferences);
    
    const complication: OptionalComplication = {
      id: `complication-${Date.now()}`,
      name: template.name,
      description: this.generateDetailedDescription(template, context),
      category: template.category,
      severity: this.calculateSeverity(template.baseSeverity, context, preferences),
      trigger,
      effects,
      resolution,
      integration,
      pacing,
      scalingRules: scaling
    };

    console.log(`✅ [COMPLICATIONS] Generated "${complication.name}" (${complication.severity} ${complication.category})`);
    
    return complication;
  }

  /**
   * Suggest complications based on current session pacing
   */
  suggestComplicationsForPacing(
    context: ComplicationContext,
    preferences: ComplicationPreferences
  ): ComplicationSuggestion[] {
    console.log(`💡 [COMPLICATIONS] Suggesting complications for ${context.currentPacing} pacing`);
    
    const suggestions: ComplicationSuggestion[] = [];
    const pacingGuideline = this.PACING_GUIDELINES[context.currentPacing];
    
    if (!pacingGuideline) {
      console.warn(`Unknown pacing: ${context.currentPacing}`);
      return suggestions;
    }
    
    // Generate suggestions based on pacing guidelines
    pacingGuideline.idealComplications.forEach(templateKey => {
      const template = this.COMPLICATION_TEMPLATES[templateKey];
      if (template && this.isComplicationAppropriate(template, context, preferences)) {
        suggestions.push({
          complication: this.generateComplication(context, preferences),
          reasoning: this.generateSuggestionReasoning(template, context),
          timing: this.suggestOptimalTiming(template, context),
          priority: this.calculateSuggestionPriority(template, context, preferences)
        });
      }
    });
    
    // Sort by priority
    suggestions.sort((a, b) => b.priority - a.priority);
    
    console.log(`   Generated ${suggestions.length} suggestions`);
    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Integrate complication naturally into existing scene
   */
  integrateComplication(
    complication: OptionalComplication,
    scene: SceneContext,
    integrationMethod: IntegrationMethod
  ): IntegrationResult {
    console.log(`🔗 [COMPLICATIONS] Integrating "${complication.name}" into ${scene.type} scene`);
    
    const integration = this.planComplicationIntegration(complication, scene, integrationMethod);
    const narrativeTransition = this.generateNarrativeTransition(complication, scene, integration);
    const mechanicalChanges = this.calculateMechanicalChanges(complication, scene);
    const playerGuidance = this.generatePlayerGuidance(complication, integration);
    
    const result: IntegrationResult = {
      success: true,
      integration,
      narrativeTransition,
      mechanicalChanges,
      playerGuidance,
      followUpActions: this.generateFollowUpActions(complication, scene)
    };

    console.log(`✅ [COMPLICATIONS] Successfully integrated complication`);
    
    return result;
  }

  /**
   * Scale complication based on party and campaign parameters
   */
  scaleComplication(
    baseComplication: OptionalComplication,
    scalingContext: ScalingContext
  ): OptionalComplication {
    console.log(`📏 [COMPLICATIONS] Scaling "${baseComplication.name}" for context`);
    
    const scaledComplication = { ...baseComplication };
    
    // Apply level scaling
    this.applyLevelScaling(scaledComplication, scalingContext.partyLevel);
    
    // Apply size scaling
    this.applySizeScaling(scaledComplication, scalingContext.partySize);
    
    // Apply tone scaling
    this.applyToneScaling(scaledComplication, scalingContext.campaignTone);
    
    // Apply difficulty scaling
    this.applyDifficultyScaling(scaledComplication, scalingContext.targetDifficulty);
    
    console.log(`✅ [COMPLICATIONS] Scaled to ${scaledComplication.severity} severity`);
    
    return scaledComplication;
  }

  // Private helper methods

  private selectComplicationTemplate(
    context: ComplicationContext,
    preferences: ComplicationPreferences
  ): any {
    const pacingGuideline = this.PACING_GUIDELINES[context.currentPacing];
    let availableTemplates = Object.keys(this.COMPLICATION_TEMPLATES);
    
    // Filter by pacing preferences
    if (pacingGuideline) {
      availableTemplates = availableTemplates.filter(key => 
        pacingGuideline.idealComplications.includes(key) ||
        !pacingGuideline.avoidComplications.includes(key)
      );
    }
    
    // Filter by category preferences
    if (preferences.preferredCategories.length > 0) {
      availableTemplates = availableTemplates.filter(key => {
        const template = this.COMPLICATION_TEMPLATES[key];
        return preferences.preferredCategories.includes(template.category);
      });
    }
    
    // Avoid excluded categories
    if (preferences.excludedCategories.length > 0) {
      availableTemplates = availableTemplates.filter(key => {
        const template = this.COMPLICATION_TEMPLATES[key];
        return !preferences.excludedCategories.includes(template.category);
      });
    }
    
    // Select random template from filtered list
    const selectedKey = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    return this.COMPLICATION_TEMPLATES[selectedKey] || this.COMPLICATION_TEMPLATES['resource-shortage'];
  }

  private generateComplicationTrigger(template: any, context: ComplicationContext): ComplicationTrigger {
    const triggerType = template.triggers[Math.floor(Math.random() * template.triggers.length)];
    
    return {
      type: triggerType,
      condition: this.generateTriggerCondition(triggerType, template, context),
      timing: this.determineTriggerTiming(triggerType, context),
      probability: this.calculateTriggerProbability(triggerType, template, context),
      prerequisites: this.generateTriggerPrerequisites(template, context),
      contextualFactors: this.generateContextualFactors(template, context)
    };
  }

  private generateComplicationEffects(
    template: any,
    context: ComplicationContext,
    preferences: ComplicationPreferences
  ): ComplicationEffect[] {
    const effects: ComplicationEffect[] = [];
    
    template.effects.forEach((effectType: string) => {
      effects.push({
        type: effectType as EffectType,
        description: this.generateEffectDescription(effectType, template, context),
        mechanicalImpact: this.generateMechanicalImpact(effectType, template, context),
        narrativeConsequence: this.generateNarrativeConsequence(effectType, template, context),
        duration: this.calculateEffectDuration(effectType, template, context),
        scope: this.determineEffectScope(effectType, template, context),
        mitigation: this.generateMitigationOptions(effectType, template, context)
      });
    });
    
    return effects;
  }

  private generateResolutionMethods(
    template: any,
    context: ComplicationContext,
    preferences: ComplicationPreferences
  ): ResolutionMethod[] {
    const methods: ResolutionMethod[] = [];
    const approachCount = Math.min(4, Math.max(2, Math.floor(Math.random() * 3) + 2));
    
    const availableApproaches: ResolutionApproach[] = [
      'combat', 'social', 'investigation', 'stealth', 'magic', 'negotiation', 'sacrifice', 'creative'
    ];
    
    // Select diverse approaches
    const selectedApproaches = this.selectDiverseApproaches(availableApproaches, approachCount, template);
    
    selectedApproaches.forEach(approach => {
      methods.push({
        approach,
        description: this.generateResolutionDescription(approach, template, context),
        requirements: this.generateResolutionRequirements(approach, template, context),
        difficulty: this.calculateResolutionDifficulty(approach, template, context),
        timeRequired: this.estimateResolutionTime(approach, template, context),
        consequences: this.generateResolutionConsequences(approach, template, context),
        alternatives: this.generateAlternativeResolutions(approach, template, context)
      });
    });
    
    return methods;
  }

  private generateIntegrationGuidance(template: any, context: ComplicationContext): IntegrationGuidance {
    return {
      bestTiming: this.determineBestIntegrationTiming(template, context),
      sceneTypes: this.identifyCompatibleSceneTypes(template, context),
      narrativeHooks: this.generateNarrativeHooks(template, context),
      characterOpportunities: this.identifyCharacterOpportunities(template, context),
      avoidanceConditions: this.generateAvoidanceConditions(template, context)
    };
  }

  private generatePacingConsideration(template: any, context: ComplicationContext): PacingConsideration {
    return {
      idealMoment: this.determineIdealPacingMoment(template, context),
      tensionLevel: this.calculateTensionImpact(template, context),
      energyImpact: this.assessEnergyImpact(template, context),
      sessionPhase: this.recommendSessionPhase(template, context),
      cooldownPeriod: this.calculateCooldownPeriod(template, context)
    };
  }

  private generateScalingRules(template: any, preferences: ComplicationPreferences): ComplicationScalingRules {
    return {
      partyLevel: this.generateLevelScaling(template),
      partySize: this.generateSizeScaling(template),
      campaignTone: this.generateToneScaling(template),
      difficulty: this.generateDifficultyScaling(template)
    };
  }

  // Detailed implementation methods

  private calculateSeverity(
    baseSeverity: ComplicationSeverity,
    context: ComplicationContext,
    preferences: ComplicationPreferences
  ): ComplicationSeverity {
    let severity = baseSeverity;
    
    // Adjust based on context
    if (context.currentTension === 'high' && baseSeverity === 'minor') {
      severity = 'moderate';
    } else if (context.currentTension === 'low' && baseSeverity === 'major') {
      severity = 'moderate';
    }
    
    // Respect preferences
    if (preferences.maxSeverity && this.getSeverityLevel(severity) > this.getSeverityLevel(preferences.maxSeverity)) {
      severity = preferences.maxSeverity;
    }
    
    return severity;
  }

  private getSeverityLevel(severity: ComplicationSeverity): number {
    const levels = {
      'minor': 1,
      'moderate': 2,
      'major': 3,
      'critical': 4,
      'campaign-altering': 5
    };
    
    return levels[severity] || 2;
  }

  private generateDetailedDescription(template: any, context: ComplicationContext): string {
    const baseDescription = template.description;
    const contextualDetails = this.generateContextualDetails(template, context);
    
    return `${baseDescription}. ${contextualDetails}`;
  }

  private generateContextualDetails(template: any, context: ComplicationContext): string {
    const details = {
      'social': 'This affects relationships and social dynamics within the party and with NPCs',
      'environmental': 'The natural world presents new challenges that must be overcome',
      'mechanical': 'Game mechanics and resources are directly impacted',
      'magical': 'Arcane forces create unpredictable complications',
      'political': 'Political ramifications extend beyond the immediate situation',
      'personal': 'Individual character growth and development opportunities arise',
      'temporal': 'Time becomes a critical factor in decision-making',
      'moral': 'Ethical considerations force difficult choices with lasting consequences'
    };
    
    return details[template.category] || 'This complication adds depth and complexity to the current situation';
  }

  // Additional helper methods for completeness

  private isComplicationAppropriate(
    template: any,
    context: ComplicationContext,
    preferences: ComplicationPreferences
  ): boolean {
    // Check if complication fits current context
    if (preferences.excludedCategories.includes(template.category)) {
      return false;
    }
    
    // Check pacing appropriateness
    const pacingGuideline = this.PACING_GUIDELINES[context.currentPacing];
    if (pacingGuideline && pacingGuideline.avoidComplications.includes(template.name)) {
      return false;
    }
    
    // Check severity limits
    if (preferences.maxSeverity && 
        this.getSeverityLevel(template.baseSeverity) > this.getSeverityLevel(preferences.maxSeverity)) {
      return false;
    }
    
    return true;
  }

  private generateSuggestionReasoning(template: any, context: ComplicationContext): string {
    const reasonings = {
      'tension-building': `This ${template.category} complication will gradually increase tension`,
      'peak-action': `This complication adds intensity without overwhelming the current action`,
      'calm-before-storm': `This provides character development opportunity during the lull`,
      'resolution': `This complication adds final dramatic weight to the resolution`
    };
    
    return reasonings[context.currentPacing] || `This complication fits the current narrative flow`;
  }

  private suggestOptimalTiming(template: any, context: ComplicationContext): IntegrationTiming {
    const timingMap = {
      'social': 'mid-scene',
      'environmental': 'scene-opening',
      'mechanical': 'mid-scene',
      'magical': 'scene-climax',
      'political': 'between-scenes',
      'personal': 'scene-resolution',
      'temporal': 'scene-opening',
      'moral': 'scene-climax'
    };
    
    return timingMap[template.category] as IntegrationTiming || 'mid-scene';
  }

  private calculateSuggestionPriority(
    template: any,
    context: ComplicationContext,
    preferences: ComplicationPreferences
  ): number {
    let priority = 50; // Base priority
    
    // Increase priority for preferred categories
    if (preferences.preferredCategories.includes(template.category)) {
      priority += 20;
    }
    
    // Increase priority for pacing-appropriate complications
    const pacingGuideline = this.PACING_GUIDELINES[context.currentPacing];
    if (pacingGuideline && pacingGuideline.idealComplications.includes(template.name)) {
      priority += 15;
    }
    
    // Adjust for current tension
    if (context.currentTension === 'high' && template.baseSeverity === 'minor') {
      priority -= 10;
    } else if (context.currentTension === 'low' && template.baseSeverity === 'major') {
      priority -= 10;
    }
    
    return Math.max(0, Math.min(100, priority));
  }

  // More implementation methods would continue here...
  // For brevity, including key remaining methods

  private generateTriggerCondition(triggerType: TriggerType, template: any, context: ComplicationContext): string {
    const conditions = {
      'automatic': 'Occurs immediately when introduced',
      'conditional': 'Triggers when specific story conditions are met',
      'random': 'Has a chance to occur during appropriate moments',
      'player-action': 'Triggered by specific player decisions or actions',
      'time-based': 'Occurs after a certain amount of time has passed',
      'story-driven': 'Emerges naturally from current story developments'
    };
    
    return conditions[triggerType] || 'Occurs when narratively appropriate';
  }

  private determineTriggerTiming(triggerType: TriggerType, context: ComplicationContext): TriggerTiming {
    const timingMap = {
      'automatic': 'immediate',
      'conditional': 'when-appropriate',
      'random': 'next-scene',
      'player-action': 'immediate',
      'time-based': 'delayed',
      'story-driven': 'when-appropriate'
    };
    
    return timingMap[triggerType] as TriggerTiming || 'when-appropriate';
  }

  private calculateTriggerProbability(
    triggerType: TriggerType,
    template: any,
    context: ComplicationContext
  ): TriggerProbability {
    if (triggerType === 'automatic' || triggerType === 'story-driven') {
      return 'certain';
    } else if (triggerType === 'player-action') {
      return 'likely';
    } else if (triggerType === 'conditional') {
      return 'possible';
    } else {
      return 'possible';
    }
  }

  // Placeholder methods for complex generation
  private generateTriggerPrerequisites(template: any, context: ComplicationContext): string[] {
    return []; // Would generate based on template and context
  }

  private generateContextualFactors(template: any, context: ComplicationContext): ContextualFactor[] {
    return []; // Would generate based on template and context
  }

  private generateEffectDescription(effectType: string, template: any, context: ComplicationContext): string {
    return `${effectType} effect for ${template.name}`;
  }

  private generateMechanicalImpact(effectType: string, template: any, context: ComplicationContext): MechanicalImpact {
    return {
      type: 'rule-modification',
      description: `Modifies game mechanics related to ${effectType}`,
      affectedSystems: [effectType],
      duration: 'scene'
    };
  }

  private generateNarrativeConsequence(effectType: string, template: any, context: ComplicationContext): string {
    return `Narrative impact of ${effectType} in the context of ${template.name}`;
  }

  private calculateEffectDuration(effectType: string, template: any, context: ComplicationContext): EffectDuration {
    const durationMap = {
      'obstacle': 'scene',
      'opportunity': 'session',
      'revelation': 'permanent',
      'relationship': 'arc',
      'resource': 'session',
      'time-pressure': 'scene',
      'moral-dilemma': 'permanent'
    };
    
    return durationMap[effectType] as EffectDuration || 'scene';
  }

  private determineEffectScope(effectType: string, template: any, context: ComplicationContext): EffectScope {
    const scopeMap = {
      'obstacle': 'party',
      'opportunity': 'individual',
      'revelation': 'party',
      'relationship': 'organization',
      'resource': 'party',
      'time-pressure': 'party',
      'moral-dilemma': 'individual'
    };
    
    return scopeMap[effectType] as EffectScope || 'party';
  }

  private generateMitigationOptions(effectType: string, template: any, context: ComplicationContext): MitigationOption[] {
    return [
      {
        method: 'Direct resolution',
        description: 'Address the complication head-on',
        requirements: ['Appropriate skills', 'Resources'],
        effectiveness: 'significant',
        cost: 'Time and effort'
      }
    ];
  }

  private selectDiverseApproaches(
    available: ResolutionApproach[],
    count: number,
    template: any
  ): ResolutionApproach[] {
    const selected: ResolutionApproach[] = [];
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      selected.push(shuffled[i]);
    }
    
    return selected;
  }

  // Additional placeholder methods for completeness
  private generateResolutionDescription(approach: ResolutionApproach, template: any, context: ComplicationContext): string {
    return `Resolve through ${approach} approach`;
  }

  private generateResolutionRequirements(approach: ResolutionApproach, template: any, context: ComplicationContext): ResolutionRequirement[] {
    return [];
  }

  private calculateResolutionDifficulty(approach: ResolutionApproach, template: any, context: ComplicationContext): ResolutionDifficulty {
    return 'moderate';
  }

  private estimateResolutionTime(approach: ResolutionApproach, template: any, context: ComplicationContext): string {
    return '1 scene';
  }

  private generateResolutionConsequences(approach: ResolutionApproach, template: any, context: ComplicationContext): ResolutionConsequence[] {
    return [];
  }

  private generateAlternativeResolutions(approach: ResolutionApproach, template: any, context: ComplicationContext): AlternativeResolution[] {
    return [];
  }

  // Integration and scaling methods (simplified for brevity)
  private planComplicationIntegration(complication: OptionalComplication, scene: SceneContext, method: IntegrationMethod): any {
    return { method: 'seamless', timing: 'mid-scene' };
  }

  private generateNarrativeTransition(complication: OptionalComplication, scene: SceneContext, integration: any): string {
    return `The complication "${complication.name}" emerges naturally from the current situation.`;
  }

  private calculateMechanicalChanges(complication: OptionalComplication, scene: SceneContext): any[] {
    return [];
  }

  private generatePlayerGuidance(complication: OptionalComplication, integration: any): string {
    return `Guide players through the "${complication.name}" complication with clear options and consequences.`;
  }

  private generateFollowUpActions(complication: OptionalComplication, scene: SceneContext): string[] {
    return ['Monitor player responses', 'Adjust difficulty as needed', 'Prepare resolution options'];
  }

  // Scaling methods (simplified)
  private applyLevelScaling(complication: OptionalComplication, level: number): void {
    // Adjust complication based on party level
  }

  private applySizeScaling(complication: OptionalComplication, size: number): void {
    // Adjust complication based on party size
  }

  private applyToneScaling(complication: OptionalComplication, tone: CampaignTone): void {
    // Adjust complication based on campaign tone
  }

  private applyDifficultyScaling(complication: OptionalComplication, difficulty: ComplicationDifficulty): void {
    // Adjust complication based on target difficulty
  }

  // Placeholder scaling generation methods
  private generateLevelScaling(template: any): LevelScaling {
    return { baseLevel: 5, adjustments: [] };
  }

  private generateSizeScaling(template: any): SizeScaling {
    return { baseSize: 4, adjustments: [] };
  }

  private generateToneScaling(template: any): ToneScaling {
    return { baseTone: 'heroic', adjustments: [] };
  }

  private generateDifficultyScaling(template: any): DifficultyScaling {
    return { baseDifficulty: 'moderate', adjustments: [] };
  }

  // Additional placeholder methods for integration guidance
  private determineBestIntegrationTiming(template: any, context: ComplicationContext): IntegrationTiming[] {
    return ['mid-scene', 'scene-climax'];
  }

  private identifyCompatibleSceneTypes(template: any, context: ComplicationContext): SceneType[] {
    return ['social', 'exploration', 'investigation'];
  }

  private generateNarrativeHooks(template: any, context: ComplicationContext): NarrativeHook[] {
    return [];
  }

  private identifyCharacterOpportunities(template: any, context: ComplicationContext): CharacterOpportunity[] {
    return [];
  }

  private generateAvoidanceConditions(template: any, context: ComplicationContext): AvoidanceCondition[] {
    return [];
  }

  private determineIdealPacingMoment(template: any, context: ComplicationContext): PacingMoment {
    return 'tension-building';
  }

  private calculateTensionImpact(template: any, context: ComplicationContext): TensionLevel {
    return 'building';
  }

  private assessEnergyImpact(template: any, context: ComplicationContext): EnergyImpact {
    return 'energizing';
  }

  private recommendSessionPhase(template: any, context: ComplicationContext): SessionPhase {
    return 'middle';
  }

  private calculateCooldownPeriod(template: any, context: ComplicationContext): CooldownPeriod {
    return {
      duration: '1 scene',
      reason: 'Allow players to process the complication',
      exceptions: ['Story-critical moments']
    };
  }
}

// Supporting interfaces for external use

export interface ComplicationContext {
  currentPacing: PacingMoment;
  currentTension: TensionLevel;
  sessionPhase: SessionPhase;
  sceneType: SceneType;
  partyLevel: number;
  partySize: number;
  campaignTone: CampaignTone;
  recentComplications: string[];
}

export interface ComplicationPreferences {
  preferredCategories: ComplicationCategory[];
  excludedCategories: ComplicationCategory[];
  maxSeverity: ComplicationSeverity;
  frequencyPreference: 'low' | 'moderate' | 'high';
  integrationStyle: 'subtle' | 'obvious' | 'dramatic';
}

export interface ComplicationSuggestion {
  complication: OptionalComplication;
  reasoning: string;
  timing: IntegrationTiming;
  priority: number;
}

export interface SceneContext {
  type: SceneType;
  currentTension: TensionLevel;
  activeElements: string[];
  playerEngagement: 'low' | 'moderate' | 'high';
  timeRemaining: number;
}

export interface IntegrationMethod {
  approach: 'seamless' | 'dramatic' | 'gradual' | 'sudden';
  timing: IntegrationTiming;
  narrativeStyle: 'subtle' | 'obvious' | 'foreshadowed';
}

export interface IntegrationResult {
  success: boolean;
  integration: any;
  narrativeTransition: string;
  mechanicalChanges: any[];
  playerGuidance: string;
  followUpActions: string[];
}

export interface ScalingContext {
  partyLevel: number;
  partySize: number;
  campaignTone: CampaignTone;
  targetDifficulty: ComplicationDifficulty;
}

// Export singleton instance
export const optionalComplicationsSystem = new OptionalComplicationsSystem();