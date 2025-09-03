/**
 * Tactical Combat Features
 * 
 * This module implements sophisticated tactical combat generation including
 * battlefield layouts, environmental hazards, tactical features, and
 * encounter objectives beyond simple "defeat all enemies" scenarios.
 */

export interface TacticalCombatEncounter {
  id: string;
  name: string;
  description: string;
  battlefield: BattlefieldLayout;
  objectives: EncounterObjective[];
  enemies: TacticalEnemy[];
  environmentalHazards: EnvironmentalHazard[];
  tacticalFeatures: TacticalFeature[];
  dynamicElements: CombatDynamicElement[];
  scalingRules: CombatScalingRules;
  victoryConditions: VictoryCondition[];
  defeatConsequences: DefeatConsequence[];
}

export interface BattlefieldLayout {
  dimensions: BattlefieldDimensions;
  terrain: TerrainFeature[];
  cover: CoverElement[];
  elevation: ElevationFeature[];
  lighting: LightingCondition[];
  movement: MovementZone[];
  specialAreas: SpecialArea[];
  tacticalMap: TacticalMap;
}

export interface BattlefieldDimensions {
  width: number;
  height: number;
  scale: string; // "5-foot squares", "10-foot squares", etc.
  totalArea: number;
  shape: BattlefieldShape;
}

export interface TerrainFeature {
  id: string;
  type: TerrainType;
  location: GridLocation;
  size: AreaSize;
  description: string;
  mechanicalEffects: TerrainEffect[];
  interactionOptions: TerrainInteraction[];
  visibility: VisibilityImpact;
}

export interface CoverElement {
  id: string;
  type: CoverType;
  location: GridLocation;
  size: AreaSize;
  description: string;
  coverValue: CoverValue;
  durability: CoverDurability;
  destructible: boolean;
  moveable: boolean;
}

export interface ElevationFeature {
  id: string;
  type: ElevationType;
  location: GridLocation;
  height: number;
  accessMethods: AccessMethod[];
  advantages: ElevationAdvantage[];
  disadvantages: ElevationDisadvantage[];
  fallDamage: FallDamageRule;
}

export interface LightingCondition {
  area: GridArea;
  type: LightingType;
  intensity: LightingIntensity;
  source?: string;
  mechanicalEffects: LightingEffect[];
  dynamicChanges: LightingChange[];
}

export interface MovementZone {
  area: GridArea;
  type: MovementType;
  speedModifier: number;
  restrictions: MovementRestriction[];
  specialRules: MovementRule[];
}

export interface SpecialArea {
  id: string;
  name: string;
  location: GridArea;
  type: SpecialAreaType;
  description: string;
  mechanicalEffects: SpecialAreaEffect[];
  activationTrigger?: AreaTrigger;
  duration?: AreaDuration;
}

export interface TacticalMap {
  gridSystem: GridSystem;
  keyLocations: KeyLocation[];
  movementPaths: MovementPath[];
  sightLines: SightLine[];
  chokePoints: ChokePoint[];
  flanking: FlankingOpportunity[];
}

export interface EncounterObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  priority: ObjectivePriority;
  timeLimit?: number;
  successConditions: SuccessCondition[];
  failureConsequences: FailureConsequence[];
  rewards: ObjectiveReward[];
  complications: ObjectiveComplication[];
}

export interface TacticalEnemy {
  id: string;
  name: string;
  statBlock: EnemyStatBlock;
  role: TacticalRole;
  positioning: InitialPositioning;
  tactics: TacticalBehavior;
  objectives: EnemyObjective[];
  equipment: TacticalEquipment[];
  specialAbilities: TacticalAbility[];
}

export interface EnvironmentalHazard {
  id: string;
  name: string;
  type: HazardType;
  location: GridLocation | GridArea;
  description: string;
  activationTrigger: HazardTrigger;
  effects: HazardEffect[];
  duration: HazardDuration;
  counterplay: HazardCounterplay[];
  escalation?: HazardEscalation;
}

export interface TacticalFeature {
  id: string;
  name: string;
  type: FeatureType;
  location: GridLocation;
  description: string;
  mechanicalBenefit: FeatureBenefit;
  activationMethod: FeatureActivation;
  usageLimit?: FeatureUsage;
  strategicValue: StrategicValue;
}

export interface CombatDynamicElement {
  trigger: CombatTrigger;
  effect: CombatEffect;
  timing: CombatTiming;
  description: string;
  mechanicalChange: string;
  narrativeImpact: string;
  duration: CombatDuration;
}

export interface CombatScalingRules {
  partySize: CombatPartySizeScaling;
  level: CombatLevelScaling;
  difficulty: CombatDifficultyScaling;
  terrain: TerrainScaling;
}

export interface VictoryCondition {
  type: VictoryType;
  description: string;
  requirements: VictoryRequirement[];
  timeLimit?: number;
  bonusConditions: BonusCondition[];
}

export interface DefeatConsequence {
  type: ConsequenceType;
  description: string;
  severity: ConsequenceSeverity;
  mitigation: ConsequenceMitigation[];
  narrativeImpact: string;
}

// Supporting interfaces

export interface GridLocation {
  x: number;
  y: number;
  z?: number; // For elevation
}

export interface GridArea {
  topLeft: GridLocation;
  bottomRight: GridLocation;
  shape?: AreaShape;
}

export interface AreaSize {
  width: number;
  height: number;
  depth?: number;
}

export interface TerrainEffect {
  type: EffectType;
  description: string;
  mechanicalRule: string;
  conditions: string[];
}

export interface TerrainInteraction {
  action: string;
  description: string;
  requirements: string[];
  outcome: string;
}

export interface VisibilityImpact {
  blocksLineOfSight: boolean;
  providesConcealment: boolean;
  concealmentLevel?: ConcealmentLevel;
}

export interface CoverDurability {
  hitPoints?: number;
  armorClass?: number;
  damageThreshold?: number;
  immunities: string[];
  resistances: string[];
}

export interface AccessMethod {
  type: AccessType;
  description: string;
  requirements: string[];
  difficulty: AccessDifficulty;
}

export interface ElevationAdvantage {
  type: AdvantageType;
  description: string;
  mechanicalBenefit: string;
  conditions: string[];
}

export interface ElevationDisadvantage {
  type: DisadvantageType;
  description: string;
  mechanicalPenalty: string;
  conditions: string[];
}

export interface FallDamageRule {
  damagePerFoot: string;
  maximumDamage?: string;
  savingThrow?: string;
  specialConditions: string[];
}

export interface LightingEffect {
  type: EffectType;
  description: string;
  mechanicalRule: string;
  affectedCreatures: string[];
}

export interface LightingChange {
  trigger: string;
  newCondition: LightingType;
  duration: string;
  description: string;
}

export interface MovementRestriction {
  type: RestrictionType;
  description: string;
  affectedCreatures: string[];
  exceptions: string[];
}

export interface MovementRule {
  rule: string;
  description: string;
  mechanicalEffect: string;
}

export interface SpecialAreaEffect {
  type: EffectType;
  description: string;
  trigger: string;
  mechanicalRule: string;
  duration: string;
}

export interface AreaTrigger {
  type: TriggerType;
  condition: string;
  activationDelay?: number;
}

export interface AreaDuration {
  type: DurationType;
  value?: number;
  condition?: string;
}

export interface GridSystem {
  type: GridType;
  size: number;
  coordinates: CoordinateSystem;
}

export interface KeyLocation {
  name: string;
  location: GridLocation;
  importance: LocationImportance;
  description: string;
  tacticalValue: string;
}

export interface MovementPath {
  start: GridLocation;
  end: GridLocation;
  difficulty: PathDifficulty;
  cover: PathCover;
  description: string;
}

export interface SightLine {
  from: GridLocation;
  to: GridLocation;
  clear: boolean;
  obstructions: string[];
  partialCover: boolean;
}

export interface ChokePoint {
  location: GridLocation;
  width: number;
  tacticalValue: string;
  controlMethods: string[];
}

export interface FlankingOpportunity {
  targetArea: GridArea;
  flankingPositions: GridLocation[];
  difficulty: FlankingDifficulty;
  benefits: string[];
}

export interface SuccessCondition {
  type: ConditionType;
  description: string;
  requirements: string[];
  timeLimit?: number;
}

export interface FailureConsequence {
  type: ConsequenceType;
  description: string;
  mechanicalEffect: string;
  narrativeImpact: string;
}

export interface ObjectiveReward {
  type: RewardType;
  description: string;
  value?: string;
  conditions: string[];
}

export interface ObjectiveComplication {
  trigger: string;
  description: string;
  mechanicalEffect: string;
  resolution: string[];
}

export interface EnemyStatBlock {
  name: string;
  size: CreatureSize;
  type: CreatureType;
  alignment: string;
  armorClass: number;
  hitPoints: number;
  speed: CreatureSpeed;
  abilities: AbilityScores;
  savingThrows: SavingThrows;
  skills: CreatureSkills;
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  senses: CreatureSenses;
  languages: string[];
  challengeRating: string;
  proficiencyBonus: number;
  actions: CreatureAction[];
  reactions: CreatureReaction[];
  legendaryActions?: LegendaryAction[];
}

export interface InitialPositioning {
  preferredLocation: GridLocation;
  alternativeLocations: GridLocation[];
  formationRole: FormationRole;
  spacing: SpacingRequirement;
}

export interface TacticalBehavior {
  primaryStrategy: TacticalStrategy;
  fallbackStrategies: TacticalStrategy[];
  targetPriority: TargetPriority[];
  positioningPreference: PositioningPreference;
  retreatConditions: RetreatCondition[];
}

export interface EnemyObjective {
  type: EnemyObjectiveType;
  description: string;
  priority: ObjectivePriority;
  conditions: string[];
}

export interface TacticalEquipment {
  name: string;
  type: EquipmentType;
  description: string;
  tacticalUse: string;
  limitations: string[];
}

export interface TacticalAbility {
  name: string;
  type: AbilityType;
  description: string;
  tacticalApplication: string;
  cooldown?: number;
  usageLimit?: number;
}

export interface HazardTrigger {
  type: TriggerType;
  condition: string;
  delay?: number;
  probability?: number;
}

export interface HazardEffect {
  type: EffectType;
  description: string;
  mechanicalRule: string;
  area: GridArea;
  duration: string;
}

export interface HazardDuration {
  type: DurationType;
  value?: number;
  condition?: string;
}

export interface HazardCounterplay {
  method: string;
  description: string;
  requirements: string[];
  effectiveness: CounterplayEffectiveness;
}

export interface HazardEscalation {
  trigger: string;
  description: string;
  newEffects: HazardEffect[];
  mechanicalChange: string;
}

export interface FeatureBenefit {
  type: BenefitType;
  description: string;
  mechanicalRule: string;
  conditions: string[];
}

export interface FeatureActivation {
  type: ActivationType;
  requirements: string[];
  actionCost: string;
  description: string;
}

export interface FeatureUsage {
  type: UsageType;
  limit: number;
  resetCondition: string;
}

export interface StrategicValue {
  importance: ValueImportance;
  description: string;
  tacticalApplications: string[];
}

export interface CombatTrigger {
  type: TriggerType;
  condition: string;
  timing: TriggerTiming;
}

export interface CombatEffect {
  type: EffectType;
  description: string;
  mechanicalChange: string;
  affectedArea?: GridArea;
}

export interface CombatTiming {
  phase: CombatPhase;
  initiative?: number;
  duration: string;
}

export interface CombatDuration {
  type: DurationType;
  value?: number;
  condition?: string;
}

// Scaling interfaces

export interface CombatPartySizeScaling {
  baseSize: number;
  adjustments: CombatSizeAdjustment[];
}

export interface CombatSizeAdjustment {
  size: number;
  enemyCountModifier: number;
  hazardIntensity: HazardIntensityModifier;
  objectiveComplexity: ObjectiveComplexityModifier;
  notes: string[];
}

export interface CombatLevelScaling {
  baseLevel: number;
  adjustments: CombatLevelAdjustment[];
}

export interface CombatLevelAdjustment {
  levelRange: string;
  enemyUpgrade: EnemyUpgrade;
  tacticalComplexity: TacticalComplexityModifier;
  hazardSeverity: HazardSeverityModifier;
  additionalFeatures: string[];
}

export interface CombatDifficultyScaling {
  baseDifficulty: EncounterDifficulty;
  adjustments: CombatDifficultyAdjustment[];
}

export interface CombatDifficultyAdjustment {
  targetDifficulty: EncounterDifficulty;
  enemyModification: EnemyModification;
  environmentalIntensity: EnvironmentalIntensity;
  objectiveComplexity: ObjectiveComplexityLevel;
  timeConstraints: TimeConstraintLevel;
}

export interface TerrainScaling {
  baseComplexity: TerrainComplexity;
  adjustments: TerrainAdjustment[];
}

export interface TerrainAdjustment {
  targetComplexity: TerrainComplexity;
  featureCount: FeatureCountModifier;
  hazardDensity: HazardDensityModifier;
  tacticalOptions: TacticalOptionModifier;
}

// Enums and types
export type BattlefieldShape = 'rectangular' | 'circular' | 'irregular' | 'linear' | 'multi-level';
export type TerrainType = 'difficult' | 'hazardous' | 'impassable' | 'special' | 'interactive';
export type CoverType = 'half' | 'three-quarters' | 'total' | 'partial' | 'mobile';
export type CoverValue = 'light' | 'heavy' | 'total' | 'partial';
export type ElevationType = 'platform' | 'stairs' | 'ramp' | 'cliff' | 'pit' | 'tower';
export type LightingType = 'bright' | 'dim' | 'darkness' | 'magical' | 'flickering' | 'colored';
export type LightingIntensity = 'blinding' | 'bright' | 'normal' | 'dim' | 'dark' | 'pitch-black';
export type MovementType = 'normal' | 'difficult' | 'hazardous' | 'impossible' | 'special';
export type SpecialAreaType = 'magical' | 'trap' | 'interactive' | 'objective' | 'environmental';
export type ObjectiveType = 'eliminate' | 'protect' | 'retrieve' | 'activate' | 'survive' | 'escape' | 'control';
export type ObjectivePriority = 'primary' | 'secondary' | 'bonus' | 'hidden';
export type TacticalRole = 'frontline' | 'ranged' | 'support' | 'controller' | 'skirmisher' | 'leader';
export type HazardType = 'environmental' | 'magical' | 'mechanical' | 'creature' | 'temporal';
export type FeatureType = 'defensive' | 'offensive' | 'utility' | 'movement' | 'information';
export type VictoryType = 'elimination' | 'objective' | 'survival' | 'escape' | 'control' | 'time';
export type ConsequenceType = 'immediate' | 'delayed' | 'ongoing' | 'permanent';
export type ConsequenceSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type ConcealmentLevel = 'light' | 'heavy' | 'total';
export type AccessType = 'climb' | 'jump' | 'fly' | 'teleport' | 'special';
export type AccessDifficulty = 'trivial' | 'easy' | 'moderate' | 'hard' | 'extreme';
export type AdvantageType = 'combat' | 'movement' | 'visibility' | 'tactical';
export type DisadvantageType = 'vulnerability' | 'exposure' | 'isolation' | 'tactical';
export type RestrictionType = 'speed' | 'direction' | 'method' | 'creature-type';
export type TriggerType = 'entry' | 'exit' | 'action' | 'time' | 'condition' | 'damage';
export type DurationType = 'instant' | 'rounds' | 'minutes' | 'permanent' | 'conditional';
export type GridType = 'square' | 'hexagonal' | 'abstract';
export type CoordinateSystem = 'cartesian' | 'polar' | 'relative';
export type LocationImportance = 'critical' | 'important' | 'useful' | 'minor';
export type PathDifficulty = 'easy' | 'moderate' | 'difficult' | 'extreme';
export type PathCover = 'none' | 'partial' | 'good' | 'excellent';
export type FlankingDifficulty = 'easy' | 'moderate' | 'difficult' | 'impossible';
export type ConditionType = 'elimination' | 'protection' | 'activation' | 'time' | 'position';
export type RewardType = 'experience' | 'treasure' | 'information' | 'access' | 'reputation';
export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type CreatureType = 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon' | 'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid' | 'monstrosity' | 'ooze' | 'plant' | 'undead';
export type FormationRole = 'vanguard' | 'center' | 'flank' | 'rear' | 'mobile';
export type SpacingRequirement = 'tight' | 'normal' | 'loose' | 'scattered';
export type TacticalStrategy = 'aggressive' | 'defensive' | 'mobile' | 'control' | 'support';
export type PositioningPreference = 'melee' | 'ranged' | 'elevated' | 'covered' | 'mobile';
export type EnemyObjectiveType = 'eliminate-target' | 'protect-ally' | 'control-area' | 'activate-device' | 'escape';
export type EquipmentType = 'weapon' | 'armor' | 'tool' | 'consumable' | 'magical';
export type AbilityType = 'offensive' | 'defensive' | 'utility' | 'movement' | 'control';
export type CounterplayEffectiveness = 'complete' | 'partial' | 'minimal' | 'situational';
export type BenefitType = 'combat' | 'movement' | 'defense' | 'utility' | 'information';
export type ActivationType = 'automatic' | 'action' | 'bonus-action' | 'reaction' | 'free';
export type UsageType = 'per-encounter' | 'per-round' | 'per-day' | 'unlimited';
export type ValueImportance = 'critical' | 'high' | 'moderate' | 'low';
export type TriggerTiming = 'start-of-combat' | 'end-of-round' | 'specific-initiative' | 'condition-met';
export type CombatPhase = 'initiative' | 'action' | 'movement' | 'end-of-turn' | 'end-of-round';
export type EncounterDifficulty = 'easy' | 'medium' | 'hard' | 'deadly' | 'legendary';
export type TerrainComplexity = 'simple' | 'moderate' | 'complex' | 'extreme';
export type EffectType = 'damage' | 'condition' | 'movement' | 'visibility' | 'mechanical';
export type AreaShape = 'square' | 'circle' | 'line' | 'cone' | 'irregular';

// Modifier types for scaling
export type HazardIntensityModifier = 'reduced' | 'normal' | 'increased' | 'extreme';
export type ObjectiveComplexityModifier = 'simplified' | 'standard' | 'complex' | 'multi-layered';
export type TacticalComplexityModifier = 'basic' | 'standard' | 'advanced' | 'expert';
export type HazardSeverityModifier = 'mild' | 'moderate' | 'severe' | 'deadly';
export type EnvironmentalIntensity = 'minimal' | 'moderate' | 'high' | 'extreme';
export type ObjectiveComplexityLevel = 'single' | 'dual' | 'multiple' | 'layered';
export type TimeConstraintLevel = 'relaxed' | 'moderate' | 'tight' | 'extreme';
export type FeatureCountModifier = 'few' | 'normal' | 'many' | 'abundant';
export type HazardDensityModifier = 'sparse' | 'normal' | 'dense' | 'overwhelming';
export type TacticalOptionModifier = 'limited' | 'standard' | 'varied' | 'extensive';

// Complex modifier interfaces
export interface EnemyUpgrade {
  statIncrease: number;
  newAbilities: string[];
  equipmentUpgrade: string[];
  tacticalImprovement: string[];
}

export interface EnemyModification {
  numberAdjustment: number;
  strengthModifier: number;
  newCapabilities: string[];
  tacticalEnhancements: string[];
}

export interface CreatureSpeed {
  walk: number;
  fly?: number;
  swim?: number;
  climb?: number;
  burrow?: number;
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SavingThrows {
  [key: string]: number;
}

export interface CreatureSkills {
  [key: string]: number;
}

export interface CreatureSenses {
  passivePerception: number;
  darkvision?: number;
  blindsight?: number;
  tremorsense?: number;
  truesight?: number;
}

export interface CreatureAction {
  name: string;
  description: string;
  attackBonus?: number;
  damage?: string;
  saveDC?: number;
  recharge?: string;
}

export interface CreatureReaction {
  name: string;
  description: string;
  trigger: string;
}

export interface LegendaryAction {
  name: string;
  description: string;
  cost: number;
}

export interface TargetPriority {
  targetType: string;
  priority: number;
  conditions: string[];
}

export interface RetreatCondition {
  trigger: string;
  threshold: string;
  method: string;
}

export interface ConsequenceMitigation {
  method: string;
  description: string;
  requirements: string[];
  effectiveness: string;
}

export interface VictoryRequirement {
  type: string;
  description: string;
  conditions: string[];
}

export interface BonusCondition {
  description: string;
  requirements: string[];
  reward: string;
}

/**
 * Tactical Combat Features Engine Class
 */
export class TacticalCombatFeaturesEngine {
  private readonly BATTLEFIELD_TEMPLATES = {
    'forest-clearing': {
      name: 'Forest Clearing',
      baseSize: { width: 30, height: 25 },
      terrainTypes: ['difficult', 'impassable', 'special'],
      coverDensity: 'moderate',
      elevationVariation: 'low',
      theme: 'natural'
    },
    'ancient-ruins': {
      name: 'Ancient Ruins',
      baseSize: { width: 35, height: 30 },
      terrainTypes: ['difficult', 'hazardous', 'interactive'],
      coverDensity: 'high',
      elevationVariation: 'high',
      theme: 'architectural'
    },
    'cavern-chamber': {
      name: 'Underground Cavern',
      baseSize: { width: 40, height: 35 },
      terrainTypes: ['difficult', 'hazardous', 'impassable'],
      coverDensity: 'low',
      elevationVariation: 'extreme',
      theme: 'underground'
    },
    'throne-room': {
      name: 'Grand Throne Room',
      baseSize: { width: 45, height: 40 },
      terrainTypes: ['special', 'interactive'],
      coverDensity: 'low',
      elevationVariation: 'moderate',
      theme: 'ceremonial'
    },
    'bridge-crossing': {
      name: 'Narrow Bridge',
      baseSize: { width: 50, height: 15 },
      terrainTypes: ['hazardous', 'impassable'],
      coverDensity: 'minimal',
      elevationVariation: 'extreme',
      theme: 'linear'
    }
  };

  private readonly OBJECTIVE_TEMPLATES = {
    'protect-vip': {
      type: 'protect',
      description: 'Keep the VIP alive and safe',
      complexity: 'moderate',
      timeConstraints: true
    },
    'retrieve-artifact': {
      type: 'retrieve',
      description: 'Secure the magical artifact',
      complexity: 'high',
      timeConstraints: false
    },
    'control-points': {
      type: 'control',
      description: 'Maintain control of strategic locations',
      complexity: 'high',
      timeConstraints: true
    },
    'escape-pursuit': {
      type: 'escape',
      description: 'Reach the exit while being pursued',
      complexity: 'moderate',
      timeConstraints: true
    },
    'ritual-disruption': {
      type: 'activate',
      description: 'Disrupt the enemy ritual before completion',
      complexity: 'high',
      timeConstraints: true
    }
  };

  /**
   * Generate a complete tactical combat encounter
   */
  generateTacticalEncounter(
    theme: string,
    difficulty: EncounterDifficulty,
    context: TacticalCombatContext
  ): TacticalCombatEncounter {
    console.log(`⚔️ [TACTICAL] Generating tactical combat encounter - Theme: ${theme}, Difficulty: ${difficulty}`);
    
    const battlefieldTemplate = this.selectBattlefieldTemplate(theme);
    const battlefield = this.generateBattlefield(battlefieldTemplate, difficulty, context);
    const objectives = this.generateObjectives(theme, difficulty, context);
    const enemies = this.generateTacticalEnemies(theme, difficulty, context, battlefield);
    const hazards = this.generateEnvironmentalHazards(battlefield, difficulty, context);
    const features = this.generateTacticalFeatures(battlefield, difficulty, context);
    const dynamicElements = this.generateCombatDynamicElements(theme, difficulty);
    const scalingRules = this.generateCombatScalingRules(difficulty);
    const victoryConditions = this.generateVictoryConditions(objectives, difficulty);
    const defeatConsequences = this.generateDefeatConsequences(objectives, difficulty);
    
    const encounter: TacticalCombatEncounter = {
      id: `tactical-encounter-${Date.now()}`,
      name: this.generateEncounterName(theme, objectives[0]),
      description: this.generateEncounterDescription(theme, objectives, battlefield),
      battlefield,
      objectives,
      enemies,
      environmentalHazards: hazards,
      tacticalFeatures: features,
      dynamicElements,
      scalingRules,
      victoryConditions,
      defeatConsequences
    };

    console.log(`✅ [TACTICAL] Generated "${encounter.name}"`);
    console.log(`   Battlefield: ${battlefield.dimensions.width}x${battlefield.dimensions.height}`);
    console.log(`   Objectives: ${objectives.length}, Enemies: ${enemies.length}, Hazards: ${hazards.length}`);
    
    return encounter;
  }  /**

   * Generate battlefield layout with terrain, cover, and elevation
   */
  generateBattlefield(
    template: any,
    difficulty: EncounterDifficulty,
    context: TacticalCombatContext
  ): BattlefieldLayout {
    const dimensions = this.calculateBattlefieldDimensions(template, context);
    const terrain = this.generateTerrainFeatures(template, dimensions, difficulty);
    const cover = this.generateCoverElements(template, dimensions, difficulty);
    const elevation = this.generateElevationFeatures(template, dimensions, difficulty);
    const lighting = this.generateLightingConditions(template, dimensions);
    const movement = this.generateMovementZones(template, dimensions, terrain);
    const specialAreas = this.generateSpecialAreas(template, dimensions, difficulty);
    const tacticalMap = this.generateTacticalMap(dimensions, terrain, cover, elevation);
    
    return {
      dimensions,
      terrain,
      cover,
      elevation,
      lighting,
      movement,
      specialAreas,
      tacticalMap
    };
  }

  /**
   * Generate encounter objectives beyond simple elimination
   */
  generateObjectives(
    theme: string,
    difficulty: EncounterDifficulty,
    context: TacticalCombatContext
  ): EncounterObjective[] {
    const objectives: EncounterObjective[] = [];
    const objectiveCount = this.calculateObjectiveCount(difficulty, context);
    
    // Primary objective (always present)
    const primaryTemplate = this.selectObjectiveTemplate(theme, 'primary');
    objectives.push(this.createObjective(primaryTemplate, 'primary', difficulty, context));
    
    // Secondary objectives for higher difficulties
    if (objectiveCount > 1) {
      const secondaryTemplate = this.selectObjectiveTemplate(theme, 'secondary');
      objectives.push(this.createObjective(secondaryTemplate, 'secondary', difficulty, context));
    }
    
    // Bonus objectives for complex encounters
    if (difficulty === 'hard' || difficulty === 'deadly') {
      const bonusTemplate = this.selectObjectiveTemplate(theme, 'bonus');
      objectives.push(this.createObjective(bonusTemplate, 'bonus', difficulty, context));
    }
    
    return objectives;
  }

  /**
   * Generate tactical enemies with roles and behaviors
   */
  generateTacticalEnemies(
    theme: string,
    difficulty: EncounterDifficulty,
    context: TacticalCombatContext,
    battlefield: BattlefieldLayout
  ): TacticalEnemy[] {
    const enemies: TacticalEnemy[] = [];
    const enemyBudget = this.calculateEnemyBudget(difficulty, context);
    const roles = this.determineTacticalRoles(enemyBudget, theme);
    
    roles.forEach((role, index) => {
      const enemy = this.createTacticalEnemy(role, theme, difficulty, battlefield, index);
      enemies.push(enemy);
    });
    
    return enemies;
  }

  /**
   * Generate environmental hazards with counterplay options
   */
  generateEnvironmentalHazards(
    battlefield: BattlefieldLayout,
    difficulty: EncounterDifficulty,
    context: TacticalCombatContext
  ): EnvironmentalHazard[] {
    const hazards: EnvironmentalHazard[] = [];
    const hazardCount = this.calculateHazardCount(difficulty, battlefield);
    
    for (let i = 0; i < hazardCount; i++) {
      const hazardType = this.selectHazardType(battlefield, difficulty);
      const hazard = this.createEnvironmentalHazard(hazardType, battlefield, difficulty, i);
      hazards.push(hazard);
    }
    
    return hazards;
  }

  /**
   * Generate tactical features that affect positioning and strategy
   */
  generateTacticalFeatures(
    battlefield: BattlefieldLayout,
    difficulty: EncounterDifficulty,
    context: TacticalCombatContext
  ): TacticalFeature[] {
    const features: TacticalFeature[] = [];
    const featureCount = this.calculateFeatureCount(difficulty, battlefield);
    
    for (let i = 0; i < featureCount; i++) {
      const featureType = this.selectFeatureType(battlefield, difficulty);
      const feature = this.createTacticalFeature(featureType, battlefield, difficulty, i);
      features.push(feature);
    }
    
    return features;
  }

  // Private helper methods

  private selectBattlefieldTemplate(theme: string): any {
    const themeMapping = {
      'forest': 'forest-clearing',
      'ruins': 'ancient-ruins',
      'underground': 'cavern-chamber',
      'indoor': 'throne-room',
      'bridge': 'bridge-crossing'
    };
    
    const templateKey = themeMapping[theme] || 'forest-clearing';
    return this.BATTLEFIELD_TEMPLATES[templateKey];
  }

  private calculateBattlefieldDimensions(template: any, context: TacticalCombatContext): BattlefieldDimensions {
    const baseSize = template.baseSize;
    const sizeModifier = Math.max(0.8, Math.min(1.5, context.partySize / 4));
    
    return {
      width: Math.round(baseSize.width * sizeModifier),
      height: Math.round(baseSize.height * sizeModifier),
      scale: '5-foot squares',
      totalArea: Math.round(baseSize.width * baseSize.height * sizeModifier * sizeModifier),
      shape: this.determineBattlefieldShape(template)
    };
  }

  private generateTerrainFeatures(
    template: any,
    dimensions: BattlefieldDimensions,
    difficulty: EncounterDifficulty
  ): TerrainFeature[] {
    const features: TerrainFeature[] = [];
    const featureCount = this.calculateTerrainFeatureCount(template, difficulty);
    
    for (let i = 0; i < featureCount; i++) {
      const terrainType = this.selectTerrainType(template.terrainTypes);
      const location = this.generateRandomLocation(dimensions);
      const size = this.calculateFeatureSize(terrainType, dimensions);
      
      features.push({
        id: `terrain-${i}`,
        type: terrainType,
        location,
        size,
        description: this.generateTerrainDescription(terrainType, template.theme),
        mechanicalEffects: this.generateTerrainEffects(terrainType),
        interactionOptions: this.generateTerrainInteractions(terrainType),
        visibility: this.calculateVisibilityImpact(terrainType, size)
      });
    }
    
    return features;
  }  p
rivate generateCoverElements(
    template: any,
    dimensions: BattlefieldDimensions,
    difficulty: EncounterDifficulty
  ): CoverElement[] {
    const elements: CoverElement[] = [];
    const coverCount = this.calculateCoverCount(template.coverDensity, dimensions);
    
    for (let i = 0; i < coverCount; i++) {
      const coverType = this.selectCoverType(template.theme);
      const location = this.generateRandomLocation(dimensions);
      const size = this.calculateCoverSize(coverType);
      
      elements.push({
        id: `cover-${i}`,
        type: coverType,
        location,
        size,
        description: this.generateCoverDescription(coverType, template.theme),
        coverValue: this.determineCoverValue(coverType),
        durability: this.calculateCoverDurability(coverType, template.theme),
        destructible: this.isCoverDestructible(coverType),
        moveable: this.isCoverMoveable(coverType)
      });
    }
    
    return elements;
  }

  private generateElevationFeatures(
    template: any,
    dimensions: BattlefieldDimensions,
    difficulty: EncounterDifficulty
  ): ElevationFeature[] {
    const features: ElevationFeature[] = [];
    
    if (template.elevationVariation === 'none') return features;
    
    const elevationCount = this.calculateElevationCount(template.elevationVariation, dimensions);
    
    for (let i = 0; i < elevationCount; i++) {
      const elevationType = this.selectElevationType(template.elevationVariation);
      const location = this.generateRandomLocation(dimensions);
      const height = this.calculateElevationHeight(elevationType, template.elevationVariation);
      
      features.push({
        id: `elevation-${i}`,
        type: elevationType,
        location,
        height,
        accessMethods: this.generateAccessMethods(elevationType, height),
        advantages: this.generateElevationAdvantages(elevationType, height),
        disadvantages: this.generateElevationDisadvantages(elevationType, height),
        fallDamage: this.calculateFallDamage(height)
      });
    }
    
    return features;
  }

  private selectObjectiveTemplate(theme: string, priority: string): any {
    const themeObjectives = {
      'forest': ['protect-vip', 'retrieve-artifact'],
      'ruins': ['retrieve-artifact', 'ritual-disruption'],
      'underground': ['escape-pursuit', 'control-points'],
      'indoor': ['protect-vip', 'ritual-disruption'],
      'bridge': ['escape-pursuit', 'control-points']
    };
    
    const availableObjectives = themeObjectives[theme] || ['protect-vip', 'retrieve-artifact'];
    const objectiveKey = availableObjectives[Math.floor(Math.random() * availableObjectives.length)];
    
    return this.OBJECTIVE_TEMPLATES[objectiveKey];
  }

  private createObjective(
    template: any,
    priority: ObjectivePriority,
    difficulty: EncounterDifficulty,
    context: TacticalCombatContext
  ): EncounterObjective {
    return {
      id: `objective-${priority}-${Date.now()}`,
      type: template.type,
      description: template.description,
      priority,
      timeLimit: template.timeConstraints ? this.calculateObjectiveTimeLimit(difficulty) : undefined,
      successConditions: this.generateSuccessConditions(template, difficulty),
      failureConsequences: this.generateObjectiveFailureConsequences(template, difficulty),
      rewards: this.generateObjectiveRewards(template, priority, difficulty),
      complications: this.generateObjectiveComplications(template, difficulty)
    };
  }