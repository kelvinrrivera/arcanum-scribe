/**
 * Dynamic Narrative Systems
 * 
 * This module creates branching narrative generation with multiple paths,
 * player choice consequences, consequence tracking system, plot hook generation,
 * and follow-up adventure hook generation for ongoing campaign support.
 */

export interface DynamicNarrative {
  id: string;
  title: string;
  structure: BranchingStructure;
  playerChoices: PlayerChoiceSystem;
  consequences: ConsequenceTrackingSystem;
  plotHooks: PlotHookSystem;
  adaptiveElements: AdaptiveElement[];
  narrativeState: NarrativeState;
  futureIntegration: FutureIntegration;
}

export interface BranchingStructure {
  mainPath: NarrativePath;
  alternatePaths: NarrativePath[];
  convergencePoints: ConvergencePoint[];
  branchingPoints: BranchingPoint[];
  pathDependencies: PathDependency[];
  narrativeFlexibility: FlexibilityLevel;
}

export interface NarrativePath {
  id: string;
  name: string;
  description: string;
  scenes: NarrativeScene[];
  requirements: PathRequirement[];
  outcomes: PathOutcome[];
  difficulty: PathDifficulty;
  themes: NarrativeTheme[];
  characterFocus: CharacterFocus[];
}

export interface PlayerChoiceSystem {
  choices: PlayerChoice[];
  choiceTypes: ChoiceType[];
  impactLevels: ImpactLevel[];
  choiceHistory: ChoiceHistory[];
  decisionPoints: DecisionPoint[];
  choiceConsequences: ChoiceConsequence[];
}

export interface ConsequenceTrackingSystem {
  immediateConsequences: ImmediateConsequence[];
  delayedConsequences: DelayedConsequence[];
  cascadingConsequences: CascadingConsequence[];
  permanentConsequences: PermanentConsequence[];
  consequenceChains: ConsequenceChain[];
  trackingMechanics: TrackingMechanic[];
}

export interface PlotHookSystem {
  activeHooks: PlotHook[];
  potentialHooks: PotentialHook[];
  hookCategories: HookCategory[];
  hookIntegration: HookIntegration[];
  followUpHooks: FollowUpHook[];
  campaignConnections: CampaignConnection[];
}

export interface AdaptiveElement {
  id: string;
  type: AdaptiveType;
  trigger: AdaptiveTrigger;
  adaptation: NarrativeAdaptation;
  conditions: AdaptiveCondition[];
  effects: AdaptiveEffect[];
  priority: AdaptivePriority;
}

export interface NarrativeState {
  currentPath: string;
  activeChoices: string[];
  completedScenes: string[];
  triggeredConsequences: string[];
  characterStates: CharacterState[];
  worldState: WorldState;
  momentum: NarrativeMomentum;
}

export interface FutureIntegration {
  campaignHooks: CampaignHook[];
  sequelPotential: SequelPotential[];
  characterArcs: OngoingCharacterArc[];
  worldChanges: WorldChange[];
  unresolved: UnresolvedElement[];
  futureOpportunities: FutureOpportunity[];
}

// Supporting interfaces

export interface NarrativeScene {
  id: string;
  name: string;
  description: string;
  type: SceneType;
  requirements: SceneRequirement[];
  choices: SceneChoice[];
  outcomes: SceneOutcome[];
  consequences: SceneConsequence[];
  adaptations: SceneAdaptation[];
}

export interface ConvergencePoint {
  id: string;
  name: string;
  description: string;
  convergingPaths: string[];
  unificationMethod: UnificationMethod;
  stateReconciliation: StateReconciliation;
  narrativeSmoothing: NarrativeSmoothing;
}

export interface BranchingPoint {
  id: string;
  name: string;
  description: string;
  trigger: BranchingTrigger;
  availablePaths: string[];
  selectionCriteria: SelectionCriteria;
  defaultPath: string;
  consequences: BranchingConsequence[];
}

export interface PathDependency {
  dependentPath: string;
  requiredPath: string;
  dependencyType: DependencyType;
  requirements: DependencyRequirement[];
  alternatives: AlternativePath[];
}

export interface PlayerChoice {
  id: string;
  description: string;
  type: ChoiceType;
  context: ChoiceContext;
  options: ChoiceOption[];
  timeLimit?: number;
  difficulty: ChoiceDifficulty;
  impact: ChoiceImpact;
  reversibility: ChoiceReversibility;
}

export interface ChoiceOption {
  id: string;
  text: string;
  description: string;
  requirements: OptionRequirement[];
  consequences: OptionConsequence[];
  probability: SuccessProbability;
  characterAlignment: AlignmentImpact[];
}

export interface DecisionPoint {
  id: string;
  name: string;
  description: string;
  choices: string[];
  context: DecisionContext;
  stakes: DecisionStakes;
  timeframe: DecisionTimeframe;
  influences: DecisionInfluence[];
}

export interface ChoiceConsequence {
  choiceId: string;
  optionId: string;
  consequence: ConsequenceDefinition;
  timing: ConsequenceTiming;
  scope: ConsequenceScope;
  reversibility: ConsequenceReversibility;
}

export interface ImmediateConsequence {
  id: string;
  description: string;
  trigger: string;
  effect: ConsequenceEffect;
  visibility: ConsequenceVisibility;
  duration: ConsequenceDuration;
  mitigation: ConsequenceMitigation[];
}

export interface DelayedConsequence {
  id: string;
  description: string;
  trigger: string;
  delay: ConsequenceDelay;
  effect: ConsequenceEffect;
  conditions: DelayCondition[];
  escalation: ConsequenceEscalation;
}

export interface CascadingConsequence {
  id: string;
  description: string;
  initialTrigger: string;
  cascadeSteps: CascadeStep[];
  amplification: CascadeAmplification;
  terminationConditions: TerminationCondition[];
}

export interface PermanentConsequence {
  id: string;
  description: string;
  trigger: string;
  permanentChange: PermanentChange;
  worldImpact: WorldImpact;
  characterImpact: CharacterImpact[];
  futureImplications: FutureImplication[];
}

export interface ConsequenceChain {
  id: string;
  name: string;
  description: string;
  links: ConsequenceLink[];
  chainType: ChainType;
  breakConditions: BreakCondition[];
  amplifiers: ChainAmplifier[];
}

export interface TrackingMechanic {
  id: string;
  name: string;
  description: string;
  trackingMethod: TrackingMethod;
  visibility: TrackingVisibility;
  updateTriggers: UpdateTrigger[];
  displayFormat: DisplayFormat;
}

export interface PlotHook {
  id: string;
  title: string;
  description: string;
  category: HookCategory;
  urgency: HookUrgency;
  complexity: HookComplexity;
  requirements: HookRequirement[];
  rewards: HookReward[];
  connections: HookConnection[];
  escalation: HookEscalation;
}

export interface PotentialHook {
  id: string;
  title: string;
  description: string;
  activationConditions: ActivationCondition[];
  probability: HookProbability;
  dependencies: HookDependency[];
  alternatives: AlternativeHook[];
}

export interface FollowUpHook {
  id: string;
  parentHook: string;
  title: string;
  description: string;
  timing: FollowUpTiming;
  requirements: FollowUpRequirement[];
  integration: FollowUpIntegration;
}

export interface CampaignConnection {
  id: string;
  connectionType: ConnectionType;
  description: string;
  strength: ConnectionStrength;
  implications: ConnectionImplication[];
  development: ConnectionDevelopment;
}

export interface CharacterState {
  characterId: string;
  currentState: StateDefinition;
  stateHistory: StateChange[];
  relationships: RelationshipState[];
  goals: GoalState[];
  conflicts: ConflictState[];
}

export interface WorldState {
  locations: LocationState[];
  factions: FactionState[];
  events: EventState[];
  resources: ResourceState[];
  threats: ThreatState[];
  opportunities: OpportunityState[];
}

export interface NarrativeMomentum {
  direction: MomentumDirection;
  intensity: MomentumIntensity;
  factors: MomentumFactor[];
  trajectory: MomentumTrajectory;
  influences: MomentumInfluence[];
}

// Enums and types
export type FlexibilityLevel = 'rigid' | 'structured' | 'flexible' | 'highly-adaptive';
export type PathDifficulty = 'easy' | 'moderate' | 'challenging' | 'difficult' | 'extreme';
export type ChoiceType = 'moral' | 'tactical' | 'social' | 'resource' | 'strategic' | 'personal';
export type ImpactLevel = 'minimal' | 'minor' | 'moderate' | 'major' | 'critical' | 'world-changing';
export type ChoiceDifficulty = 'obvious' | 'clear' | 'complex' | 'difficult' | 'impossible';
export type ChoiceImpact = 'immediate' | 'short-term' | 'long-term' | 'permanent' | 'cascading';
export type ChoiceReversibility = 'reversible' | 'partially-reversible' | 'difficult-to-reverse' | 'irreversible';
export type AdaptiveType = 'narrative' | 'character' | 'world' | 'mechanical' | 'thematic';
export type AdaptivePriority = 'low' | 'medium' | 'high' | 'critical';
export type SceneType = 'action' | 'dialogue' | 'exploration' | 'revelation' | 'conflict' | 'resolution';
export type UnificationMethod = 'narrative-bridge' | 'time-skip' | 'convergent-event' | 'character-reunion';
export type BranchingTrigger = 'player-choice' | 'story-event' | 'character-action' | 'world-state' | 'random-event';
export type DependencyType = 'prerequisite' | 'exclusive' | 'conditional' | 'sequential';
export type ChoiceContext = 'combat' | 'social' | 'exploration' | 'moral-dilemma' | 'resource-management';
export type SuccessProbability = 'guaranteed' | 'very-likely' | 'likely' | 'uncertain' | 'unlikely' | 'very-unlikely';
export type ConsequenceTiming = 'immediate' | 'next-scene' | 'next-session' | 'delayed' | 'end-of-arc';
export type ConsequenceScope = 'personal' | 'party' | 'local' | 'regional' | 'global';
export type ConsequenceReversibility = 'easily-reversed' | 'reversible' | 'difficult-to-reverse' | 'permanent';
export type ConsequenceVisibility = 'obvious' | 'noticeable' | 'subtle' | 'hidden' | 'delayed-revelation';
export type ConsequenceDuration = 'momentary' | 'scene' | 'session' | 'arc' | 'campaign' | 'permanent';
export type ChainType = 'linear' | 'branching' | 'cyclical' | 'exponential';
export type TrackingMethod = 'visible-counter' | 'hidden-tracker' | 'narrative-flags' | 'relationship-meters';
export type TrackingVisibility = 'public' | 'gm-only' | 'partial' | 'contextual';
export type HookCategory = 'personal' | 'political' | 'mystery' | 'adventure' | 'social' | 'supernatural';
export type HookUrgency = 'immediate' | 'urgent' | 'moderate' | 'low' | 'background';
export type HookComplexity = 'simple' | 'moderate' | 'complex' | 'multi-layered';
export type HookProbability = 'certain' | 'very-likely' | 'likely' | 'possible' | 'unlikely';
export type FollowUpTiming = 'immediate' | 'next-session' | 'few-sessions' | 'next-arc' | 'future-campaign';
export type ConnectionType = 'direct' | 'thematic' | 'character-based' | 'world-based' | 'mechanical';
export type ConnectionStrength = 'weak' | 'moderate' | 'strong' | 'integral';
export type MomentumDirection = 'rising' | 'falling' | 'stable' | 'chaotic' | 'building' | 'climactic';
export type MomentumIntensity = 'low' | 'moderate' | 'high' | 'extreme';
export type MomentumTrajectory = 'ascending' | 'descending' | 'oscillating' | 'stable' | 'unpredictable';

/**
 * Dynamic Narrative Systems Class
 */
export class DynamicNarrativeSystems {
  private readonly NARRATIVE_TEMPLATES = {
    'heroic-journey': {
      name: 'Heroic Journey',
      structure: 'three-act',
      branchingPoints: 3,
      convergencePoints: 2,
      themes: ['heroism', 'sacrifice', 'growth'],
      flexibility: 'structured'
    },
    'political-intrigue': {
      name: 'Political Intrigue',
      structure: 'multi-threaded',
      branchingPoints: 5,
      convergencePoints: 1,
      themes: ['power', 'betrayal', 'loyalty'],
      flexibility: 'highly-adaptive'
    },
    'mystery-investigation': {
      name: 'Mystery Investigation',
      structure: 'investigative',
      branchingPoints: 4,
      convergencePoints: 3,
      themes: ['truth', 'deception', 'revelation'],
      flexibility: 'flexible'
    },
    'survival-horror': {
      name: 'Survival Horror',
      structure: 'escalating-tension',
      branchingPoints: 2,
      convergencePoints: 1,
      themes: ['fear', 'survival', 'desperation'],
      flexibility: 'rigid'
    }
  };

  private readonly CHOICE_TEMPLATES = {
    'moral-dilemma': {
      description: 'A choice between competing moral values',
      options: 2,
      impact: 'major',
      reversibility: 'irreversible',
      consequences: ['character-development', 'relationship-change', 'world-impact']
    },
    'tactical-decision': {
      description: 'A strategic choice affecting immediate outcomes',
      options: 3,
      impact: 'moderate',
      reversibility: 'partially-reversible',
      consequences: ['immediate-effect', 'resource-change', 'position-change']
    },
    'resource-allocation': {
      description: 'How to distribute limited resources',
      options: 4,
      impact: 'minor',
      reversibility: 'reversible',
      consequences: ['resource-change', 'efficiency-change', 'opportunity-cost']
    }
  };

  /**
   * Generate dynamic narrative with branching paths
   */
  generateDynamicNarrative(
    template: string,
    context: NarrativeContext,
    options: NarrativeOptions
  ): DynamicNarrative {
    console.log(`📖 [NARRATIVE] Generating dynamic narrative - Template: ${template}`);
    
    const narrativeTemplate = this.selectNarrativeTemplate(template);
    const structure = this.generateBranchingStructure(narrativeTemplate, context, options);
    const playerChoices = this.generatePlayerChoiceSystem(structure, context);
    const consequences = this.generateConsequenceTrackingSystem(playerChoices, context);
    const plotHooks = this.generatePlotHookSystem(structure, context, options);
    const adaptiveElements = this.generateAdaptiveElements(structure, context);
    const narrativeState = this.initializeNarrativeState(structure);
    const futureIntegration = this.generateFutureIntegration(structure, consequences, plotHooks);
    
    const narrative: DynamicNarrative = {
      id: `narrative-${Date.now()}`,
      title: context.title || narrativeTemplate.name,
      structure,
      playerChoices,
      consequences,
      plotHooks,
      adaptiveElements,
      narrativeState,
      futureIntegration
    };

    console.log(`✅ [NARRATIVE] Generated "${narrative.title}"`);
    console.log(`   Paths: ${structure.alternatePaths.length + 1}, Choices: ${playerChoices.choices.length}`);
    console.log(`   Plot Hooks: ${plotHooks.activeHooks.length}, Adaptive Elements: ${adaptiveElements.length}`);
    
    return narrative;
  }