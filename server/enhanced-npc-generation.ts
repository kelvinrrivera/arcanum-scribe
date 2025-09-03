/**
 * Enhanced NPC Generation System
 * 
 * This module implements sophisticated NPC creation with personality profiles,
 * dialogue examples, relationship maps, personality quirks, speech patterns,
 * motivation and secret generation, and NPC relationship mapping.
 */

export interface EnhancedNPC {
  id: string;
  name: string;
  basicInfo: NPCBasicInfo;
  personality: PersonalityProfile;
  appearance: AppearanceProfile;
  background: BackgroundProfile;
  relationships: RelationshipMap;
  dialogue: DialogueSystem;
  motivations: MotivationSystem;
  secrets: SecretSystem;
  roleplayGuidance: RoleplayGuidance;
  mechanicalStats: MechanicalStats;
  storyIntegration: StoryIntegration;
}

export interface NPCBasicInfo {
  race: string;
  gender: string;
  age: number;
  occupation: string;
  socialStatus: SocialStatus;
  location: string;
  role: NPCRole;
  importance: NPCImportance;
}

export interface PersonalityProfile {
  coreTraits: PersonalityTrait[];
  quirks: PersonalityQuirk[];
  speechPatterns: SpeechPattern[];
  mannerisms: Mannerism[];
  emotionalRange: EmotionalRange;
  socialBehavior: SocialBehavior;
  stressResponses: StressResponse[];
  values: CoreValue[];
  fears: Fear[];
  desires: Desire[];
}

export interface AppearanceProfile {
  physicalDescription: PhysicalDescription;
  clothing: ClothingStyle;
  accessories: Accessory[];
  distinctiveFeatures: DistinctiveFeature[];
  bodyLanguage: BodyLanguage;
  voiceDescription: VoiceDescription;
}

export interface BackgroundProfile {
  origin: string;
  education: string;
  pastExperiences: PastExperience[];
  skills: NPCSkill[];
  connections: BackgroundConnection[];
  reputation: Reputation;
  currentSituation: CurrentSituation;
}

export interface RelationshipMap {
  relationships: NPCRelationship[];
  socialCircles: SocialCircle[];
  networkPosition: NetworkPosition;
  influenceLevel: InfluenceLevel;
  trustLevels: TrustLevel[];
  conflicts: RelationshipConflict[];
  alliances: Alliance[];
}

export interface DialogueSystem {
  speechStyle: SpeechStyle;
  vocabulary: VocabularyProfile;
  commonPhrases: CommonPhrase[];
  greetings: DialogueOption[];
  farewells: DialogueOption[];
  reactions: EmotionalReaction[];
  conversationTopics: ConversationTopic[];
  dialogueExamples: DialogueExample[];
}

export interface MotivationSystem {
  primaryMotivation: Motivation;
  secondaryMotivations: Motivation[];
  goals: Goal[];
  obstacles: Obstacle[];
  methods: Method[];
  timeline: MotivationTimeline;
  consequences: MotivationConsequence[];
}

export interface SecretSystem {
  secrets: Secret[];
  secretLevels: SecretLevel[];
  revealConditions: RevealCondition[];
  secretConnections: SecretConnection[];
  protectionMethods: ProtectionMethod[];
  discoveryConsequences: DiscoveryConsequence[];
}

export interface RoleplayGuidance {
  playingTips: PlayingTip[];
  voiceGuidance: VoiceGuidance;
  behaviorGuidance: BehaviorGuidance;
  interactionGuidance: InteractionGuidance[];
  scenarioResponses: ScenarioResponse[];
  improvisationTips: ImprovisationTip[];
}

export interface MechanicalStats {
  abilityScores?: AbilityScores;
  skills?: SkillProficiencies;
  savingThrows?: SavingThrowProficiencies;
  armorClass?: number;
  hitPoints?: number;
  challengeRating?: string;
  combatRole?: CombatRole;
  spellcasting?: NPCSpellcasting;
}

export interface StoryIntegration {
  plotHooks: PlotHook[];
  questGiver: QuestGiverInfo;
  informationSource: InformationSource;
  storyBeats: StoryBeat[];
  characterArcs: CharacterArc[];
  futureAppearances: FutureAppearance[];
}

// Supporting interfaces

export interface PersonalityTrait {
  name: string;
  description: string;
  intensity: TraitIntensity;
  manifestation: string[];
  opposingTrait?: string;
}

export interface PersonalityQuirk {
  name: string;
  description: string;
  frequency: QuirkFrequency;
  triggers: string[];
  visibility: QuirkVisibility;
  impact: QuirkImpact;
}

export interface SpeechPattern {
  pattern: string;
  description: string;
  examples: string[];
  frequency: PatternFrequency;
  context: string[];
}

export interface Mannerism {
  type: MannerismType;
  description: string;
  frequency: MannerismFrequency;
  context: string[];
  noticeability: Noticeability;
}

export interface EmotionalRange {
  primaryEmotions: EmotionType[];
  emotionalStability: EmotionalStability;
  expressiveness: Expressiveness;
  empathy: EmpathyLevel;
  temperament: Temperament;
}

export interface SocialBehavior {
  extroversion: ExtroversionLevel;
  agreeableness: AgreeablenessLevel;
  openness: OpennessLevel;
  conscientiousness: ConscientiousnessLevel;
  socialSkills: SocialSkillLevel;
}

export interface StressResponse {
  stressor: string;
  response: string;
  intensity: ResponseIntensity;
  duration: ResponseDuration;
  recovery: RecoveryMethod;
}

export interface CoreValue {
  value: string;
  importance: ValueImportance;
  origin: string;
  manifestation: string[];
  conflicts: string[];
}

export interface Fear {
  fear: string;
  intensity: FearIntensity;
  origin?: string;
  triggers: string[];
  avoidanceBehavior: string[];
}

export interface Desire {
  desire: string;
  intensity: DesireIntensity;
  timeframe: DesireTimeframe;
  methods: string[];
  obstacles: string[];
}

export interface PhysicalDescription {
  height: string;
  build: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  notableFeatures: string[];
  overallImpression: string;
}

export interface ClothingStyle {
  style: string;
  quality: ClothingQuality;
  colors: string[];
  condition: ClothingCondition;
  appropriateness: string;
  personalExpression: string;
}

export interface Accessory {
  item: string;
  description: string;
  significance: AccessorySignificance;
  condition: string;
  story?: string;
}

export interface DistinctiveFeature {
  feature: string;
  description: string;
  origin?: string;
  impact: FeatureImpact;
  reactions: string[];
}

export interface BodyLanguage {
  posture: string;
  gestures: string[];
  facialExpressions: string[];
  personalSpace: PersonalSpacePreference;
  confidence: ConfidenceLevel;
}

export interface VoiceDescription {
  tone: string;
  pitch: string;
  volume: string;
  pace: string;
  accent?: string;
  distinctiveQualities: string[];
}

export interface PastExperience {
  event: string;
  timeframe: string;
  impact: ExperienceImpact;
  lessons: string[];
  connections: string[];
  secrets?: string[];
}

export interface NPCSkill {
  skill: string;
  level: SkillLevel;
  origin: string;
  applications: string[];
  reputation?: string;
}

export interface BackgroundConnection {
  connection: string;
  relationship: string;
  significance: ConnectionSignificance;
  currentStatus: string;
  potential: string[];
}

export interface Reputation {
  overall: ReputationLevel;
  aspects: ReputationAspect[];
  groups: GroupReputation[];
  rumors: Rumor[];
  reality: string;
}

export interface CurrentSituation {
  circumstances: string;
  challenges: string[];
  opportunities: string[];
  resources: string[];
  timeframe: string;
}

export interface NPCRelationship {
  targetId: string;
  targetName: string;
  relationshipType: RelationshipType;
  closeness: ClosenessLevel;
  history: RelationshipHistory;
  currentStatus: RelationshipStatus;
  dynamics: RelationshipDynamic[];
  secrets: RelationshipSecret[];
  futureTrajectory: FutureTrajectory;
}

export interface SocialCircle {
  name: string;
  description: string;
  members: string[];
  npcRole: CircleRole;
  influence: CircleInfluence;
  activities: string[];
  dynamics: string[];
}

export interface NetworkPosition {
  centrality: NetworkCentrality;
  bridgeConnections: string[];
  influence: NetworkInfluence;
  informationAccess: InformationAccess;
  socialCapital: SocialCapital;
}

export interface TrustLevel {
  targetId: string;
  trustLevel: Trust;
  basis: string[];
  history: TrustHistory[];
  conditions: TrustCondition[];
}

export interface RelationshipConflict {
  targetId: string;
  conflictType: ConflictType;
  origin: string;
  intensity: ConflictIntensity;
  publicKnowledge: boolean;
  resolutionPotential: ResolutionPotential;
}

export interface Alliance {
  targetId: string;
  allianceType: AllianceType;
  basis: string[];
  strength: AllianceStrength;
  duration: AllianceDuration;
  conditions: string[];
}

export interface SpeechStyle {
  formality: FormalityLevel;
  complexity: ComplexityLevel;
  emotiveness: EmotivenessLevel;
  directness: DirectnessLevel;
  humor: HumorLevel;
  cultural: CulturalInfluence[];
}

export interface VocabularyProfile {
  level: VocabularyLevel;
  specializations: string[];
  avoidedWords: string[];
  favoriteWords: string[];
  culturalTerms: string[];
  professionalJargon: string[];
}

export interface CommonPhrase {
  phrase: string;
  context: string[];
  frequency: PhraseFrequency;
  meaning: string;
  alternatives: string[];
}

export interface DialogueOption {
  text: string;
  context: string;
  mood: string;
  formality: string;
  variations: string[];
}

export interface EmotionalReaction {
  trigger: string;
  emotion: string;
  intensity: ReactionIntensity;
  expression: string[];
  duration: ReactionDuration;
  recovery: string;
}

export interface ConversationTopic {
  topic: string;
  interest: InterestLevel;
  knowledge: KnowledgeLevel;
  opinion: string;
  approach: ConversationApproach;
  avoidance?: AvoidanceReason;
}

export interface DialogueExample {
  situation: string;
  dialogue: string;
  tone: string;
  subtext?: string;
  alternatives: string[];
}

export interface Motivation {
  description: string;
  type: MotivationType;
  intensity: MotivationIntensity;
  origin: string;
  timeframe: MotivationTimeframe;
  publicKnowledge: boolean;
}

export interface Goal {
  description: string;
  priority: GoalPriority;
  timeframe: GoalTimeframe;
  progress: GoalProgress;
  methods: string[];
  obstacles: string[];
  success: SuccessCondition[];
}

export interface Obstacle {
  description: string;
  type: ObstacleType;
  severity: ObstacleSeverity;
  solutions: string[];
  workarounds: string[];
  consequences: string[];
}

export interface Method {
  description: string;
  type: MethodType;
  effectiveness: MethodEffectiveness;
  risks: string[];
  requirements: string[];
  alternatives: string[];
}

export interface MotivationTimeline {
  shortTerm: TimelineGoal[];
  mediumTerm: TimelineGoal[];
  longTerm: TimelineGoal[];
  milestones: Milestone[];
}

export interface MotivationConsequence {
  condition: string;
  consequence: string;
  severity: ConsequenceSeverity;
  reversibility: boolean;
  impact: ConsequenceImpact[];
}

export interface Secret {
  id: string;
  description: string;
  type: SecretType;
  severity: SecretSeverity;
  knownBy: string[];
  protectionLevel: ProtectionLevel;
  discoveryDifficulty: DiscoveryDifficulty;
  timeframe?: string;
}

export interface SecretLevel {
  level: number;
  description: string;
  accessRequirement: string[];
  consequences: string[];
  connections: string[];
}

export interface RevealCondition {
  secretId: string;
  condition: string;
  likelihood: RevealLikelihood;
  method: RevealMethod;
  consequences: string[];
}

export interface SecretConnection {
  secretId1: string;
  secretId2: string;
  connectionType: ConnectionType;
  strength: ConnectionStrength;
  implications: string[];
}

export interface ProtectionMethod {
  secretId: string;
  method: string;
  effectiveness: ProtectionEffectiveness;
  cost: string;
  risks: string[];
}

export interface DiscoveryConsequence {
  secretId: string;
  discoverer: string;
  consequence: string;
  severity: ConsequenceSeverity;
  timeline: string;
}

// Enums and types
export type SocialStatus = 'nobility' | 'wealthy' | 'middle-class' | 'working-class' | 'poor' | 'outcast';
export type NPCRole = 'ally' | 'enemy' | 'neutral' | 'quest-giver' | 'merchant' | 'informant' | 'obstacle' | 'comic-relief';
export type NPCImportance = 'major' | 'supporting' | 'minor' | 'background';
export type TraitIntensity = 'subtle' | 'moderate' | 'strong' | 'dominant';
export type QuirkFrequency = 'rare' | 'occasional' | 'frequent' | 'constant';
export type QuirkVisibility = 'hidden' | 'subtle' | 'obvious' | 'prominent';
export type QuirkImpact = 'endearing' | 'neutral' | 'annoying' | 'concerning';
export type PatternFrequency = 'rare' | 'occasional' | 'frequent' | 'habitual';
export type MannerismType = 'gesture' | 'facial' | 'vocal' | 'posture' | 'movement';
export type MannerismFrequency = 'rare' | 'occasional' | 'frequent' | 'constant';
export type Noticeability = 'subtle' | 'noticeable' | 'obvious' | 'prominent';
export type EmotionType = 'joy' | 'anger' | 'fear' | 'sadness' | 'surprise' | 'disgust' | 'contempt' | 'pride';
export type EmotionalStability = 'very-stable' | 'stable' | 'moderate' | 'unstable' | 'very-unstable';
export type Expressiveness = 'reserved' | 'moderate' | 'expressive' | 'very-expressive';
export type EmpathyLevel = 'low' | 'moderate' | 'high' | 'very-high';
export type Temperament = 'calm' | 'even-tempered' | 'quick-tempered' | 'volatile';
export type ExtroversionLevel = 'very-introverted' | 'introverted' | 'moderate' | 'extroverted' | 'very-extroverted';
export type AgreeablenessLevel = 'disagreeable' | 'somewhat-disagreeable' | 'moderate' | 'agreeable' | 'very-agreeable';
export type OpennessLevel = 'closed' | 'somewhat-closed' | 'moderate' | 'open' | 'very-open';
export type ConscientiousnessLevel = 'careless' | 'somewhat-careless' | 'moderate' | 'conscientious' | 'very-conscientious';
export type SocialSkillLevel = 'poor' | 'below-average' | 'average' | 'good' | 'excellent';
export type ResponseIntensity = 'mild' | 'moderate' | 'strong' | 'extreme';
export type ResponseDuration = 'momentary' | 'brief' | 'extended' | 'persistent';
export type RecoveryMethod = 'time' | 'support' | 'activity' | 'avoidance' | 'confrontation';
export type ValueImportance = 'peripheral' | 'moderate' | 'important' | 'core' | 'fundamental';
export type FearIntensity = 'mild' | 'moderate' | 'strong' | 'phobic';
export type DesireIntensity = 'mild' | 'moderate' | 'strong' | 'obsessive';
export type DesireTimeframe = 'immediate' | 'short-term' | 'medium-term' | 'long-term' | 'lifelong';
export type ClothingQuality = 'poor' | 'modest' | 'good' | 'fine' | 'luxurious';
export type ClothingCondition = 'tattered' | 'worn' | 'good' | 'excellent' | 'pristine';
export type AccessorySignificance = 'practical' | 'decorative' | 'sentimental' | 'status' | 'magical';
export type FeatureImpact = 'subtle' | 'noticeable' | 'striking' | 'shocking';
export type PersonalSpacePreference = 'distant' | 'normal' | 'close' | 'intimate';
export type ConfidenceLevel = 'insecure' | 'uncertain' | 'moderate' | 'confident' | 'arrogant';
export type ExperienceImpact = 'minor' | 'moderate' | 'significant' | 'life-changing';
export type SkillLevel = 'novice' | 'apprentice' | 'journeyman' | 'expert' | 'master';
export type ConnectionSignificance = 'minor' | 'moderate' | 'important' | 'crucial';
export type ReputationLevel = 'unknown' | 'poor' | 'mixed' | 'good' | 'excellent';
export type RelationshipType = 'family' | 'friend' | 'romantic' | 'professional' | 'rival' | 'enemy' | 'mentor' | 'student';
export type ClosenessLevel = 'distant' | 'acquaintance' | 'friend' | 'close' | 'intimate';
export type RelationshipStatus = 'stable' | 'improving' | 'declining' | 'volatile' | 'ended';
export type FutureTrajectory = 'strengthening' | 'stable' | 'weakening' | 'uncertain' | 'ending';
export type CircleRole = 'leader' | 'core-member' | 'member' | 'peripheral' | 'outsider';
export type CircleInfluence = 'none' | 'minor' | 'moderate' | 'significant' | 'dominant';
export type NetworkCentrality = 'peripheral' | 'moderate' | 'central' | 'hub';
export type NetworkInfluence = 'none' | 'minor' | 'moderate' | 'significant' | 'major';
export type InformationAccess = 'limited' | 'moderate' | 'good' | 'excellent' | 'privileged';
export type SocialCapital = 'low' | 'moderate' | 'high' | 'very-high';
export type Trust = 'distrust' | 'wary' | 'neutral' | 'trust' | 'complete-trust';
export type ConflictType = 'personal' | 'professional' | 'ideological' | 'resource' | 'romantic';
export type ConflictIntensity = 'mild' | 'moderate' | 'serious' | 'severe' | 'bitter';
export type ResolutionPotential = 'impossible' | 'unlikely' | 'possible' | 'likely' | 'inevitable';
export type AllianceType = 'convenience' | 'mutual-benefit' | 'ideological' | 'personal' | 'strategic';
export type AllianceStrength = 'weak' | 'moderate' | 'strong' | 'unbreakable';
export type AllianceDuration = 'temporary' | 'short-term' | 'medium-term' | 'long-term' | 'permanent';
export type FormalityLevel = 'very-informal' | 'informal' | 'moderate' | 'formal' | 'very-formal';
export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'sophisticated';
export type EmotivenessLevel = 'reserved' | 'moderate' | 'emotional' | 'very-emotional';
export type DirectnessLevel = 'indirect' | 'somewhat-indirect' | 'moderate' | 'direct' | 'blunt';
export type HumorLevel = 'none' | 'dry' | 'moderate' | 'frequent' | 'constant';
export type VocabularyLevel = 'limited' | 'basic' | 'average' | 'extensive' | 'scholarly';
export type PhraseFrequency = 'rare' | 'occasional' | 'frequent' | 'habitual';
export type ReactionIntensity = 'mild' | 'moderate' | 'strong' | 'extreme';
export type ReactionDuration = 'momentary' | 'brief' | 'extended' | 'lasting';
export type InterestLevel = 'none' | 'mild' | 'moderate' | 'high' | 'passionate';
export type KnowledgeLevel = 'ignorant' | 'basic' | 'moderate' | 'knowledgeable' | 'expert';
export type ConversationApproach = 'avoidant' | 'cautious' | 'neutral' | 'eager' | 'passionate';
export type AvoidanceReason = 'painful' | 'boring' | 'dangerous' | 'inappropriate' | 'secret';
export type MotivationType = 'survival' | 'security' | 'belonging' | 'esteem' | 'self-actualization' | 'power' | 'achievement';
export type MotivationIntensity = 'mild' | 'moderate' | 'strong' | 'driving' | 'obsessive';
export type MotivationTimeframe = 'immediate' | 'short-term' | 'medium-term' | 'long-term' | 'lifelong';
export type GoalPriority = 'low' | 'moderate' | 'high' | 'critical';
export type GoalTimeframe = 'immediate' | 'days' | 'weeks' | 'months' | 'years';
export type GoalProgress = 'not-started' | 'beginning' | 'progressing' | 'nearly-complete' | 'stalled' | 'abandoned';
export type ObstacleType = 'internal' | 'external' | 'social' | 'resource' | 'knowledge' | 'skill';
export type ObstacleSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type MethodType = 'direct' | 'indirect' | 'social' | 'deceptive' | 'forceful' | 'patient';
export type MethodEffectiveness = 'poor' | 'moderate' | 'good' | 'excellent';
export type ConsequenceSeverity = 'minor' | 'moderate' | 'major' | 'severe' | 'catastrophic';
export type SecretType = 'personal' | 'professional' | 'criminal' | 'magical' | 'political' | 'romantic';
export type SecretSeverity = 'embarrassing' | 'damaging' | 'dangerous' | 'devastating' | 'world-changing';
export type ProtectionLevel = 'none' | 'minimal' | 'moderate' | 'high' | 'extreme';
export type DiscoveryDifficulty = 'obvious' | 'easy' | 'moderate' | 'hard' | 'nearly-impossible';
export type RevealLikelihood = 'never' | 'unlikely' | 'possible' | 'likely' | 'inevitable';
export type RevealMethod = 'confession' | 'discovery' | 'betrayal' | 'accident' | 'investigation';
export type ConnectionType = 'related' | 'contradictory' | 'supporting' | 'dependent' | 'exclusive';
export type ConnectionStrength = 'weak' | 'moderate' | 'strong' | 'inseparable';
export type ProtectionEffectiveness = 'poor' | 'moderate' | 'good' | 'excellent' | 'perfect';
export type CombatRole = 'tank' | 'damage' | 'support' | 'control' | 'skirmisher';

/**
 * Enhanced NPC Generation System Class
 */
export class EnhancedNPCGenerationSystem {
  private readonly PERSONALITY_TRAIT_LIBRARY = {
    'positive': [
      { name: 'Compassionate', description: 'Shows genuine care for others', manifestation: ['helps strangers', 'listens actively', 'offers comfort'] },
      { name: 'Courageous', description: 'Faces danger or difficulty with bravery', manifestation: ['stands up to bullies', 'takes risks for others', 'speaks truth to power'] },
      { name: 'Wise', description: 'Shows good judgment and deep understanding', manifestation: ['gives thoughtful advice', 'sees long-term consequences', 'learns from mistakes'] },
      { name: 'Loyal', description: 'Faithful and devoted to friends and causes', manifestation: ['keeps promises', 'defends friends', 'maintains commitments'] }
    ],
    'negative': [
      { name: 'Arrogant', description: 'Has an inflated sense of self-importance', manifestation: ['talks down to others', 'refuses to admit mistakes', 'expects special treatment'] },
      { name: 'Greedy', description: 'Excessive desire for wealth or possessions', manifestation: ['hoards resources', 'exploits others', 'prioritizes profit over people'] },
      { name: 'Paranoid', description: 'Unreasonably suspicious of others', manifestation: ['questions motives', 'sees conspiracies', 'trusts no one'] },
      { name: 'Impulsive', description: 'Acts without thinking through consequences', manifestation: ['makes snap decisions', 'interrupts others', 'changes plans suddenly'] }
    ],
    'neutral': [
      { name: 'Methodical', description: 'Approaches tasks in an organized, systematic way', manifestation: ['plans carefully', 'follows procedures', 'keeps detailed records'] },
      { name: 'Reserved', description: 'Tends to keep thoughts and feelings private', manifestation: ['speaks little', 'observes before acting', 'maintains emotional distance'] },
      { name: 'Curious', description: 'Eager to learn and explore new things', manifestation: ['asks many questions', 'investigates mysteries', 'tries new experiences'] }
    ]
  };

  private readonly SPEECH_PATTERN_TEMPLATES = {
    'formal': {
      patterns: ['Uses complete sentences', 'Avoids contractions', 'Employs proper grammar'],
      examples: ['I would be most grateful if you could assist me', 'It would appear that we have encountered a difficulty']
    },
    'casual': {
      patterns: ['Uses contractions frequently', 'Employs slang and colloquialisms', 'Speaks in fragments'],
      examples: ["Can't say I'm surprised", "That's a real mess, isn't it?"]
    },
    'archaic': {
      patterns: ['Uses outdated vocabulary', 'Employs formal sentence structure', 'References old customs'],
      examples: ['Pray tell, what brings thee to these lands?', 'Verily, this is most troublesome']
    },
    'technical': {
      patterns: ['Uses professional jargon', 'Speaks precisely', 'Explains processes step-by-step'],
      examples: ['The optimal solution requires calibrating the parameters', 'We need to implement a systematic approach']
    }
  };

  /**
   * Generate a comprehensive enhanced NPC
   */
  generateEnhancedNPC(
    basicInfo: NPCGenerationRequest,
    options: NPCGenerationOptions
  ): EnhancedNPC {
    console.log(`👤 [NPC] Generating enhanced NPC: ${basicInfo.name || 'Random NPC'}`);
    
    const npcBasicInfo = this.generateBasicInfo(basicInfo);
    const personality = this.generatePersonalityProfile(npcBasicInfo, options);
    const appearance = this.generateAppearanceProfile(npcBasicInfo, personality);
    const background = this.generateBackgroundProfile(npcBasicInfo, personality);
    const relationships = this.generateRelationshipMap(npcBasicInfo, options.existingNPCs || []);
    const dialogue = this.generateDialogueSystem(personality, background);
    const motivations = this.generateMotivationSystem(personality, background, options);
    const secrets = this.generateSecretSystem(background, relationships, options);
    const roleplayGuidance = this.generateRoleplayGuidance(personality, dialogue, motivations);
    const mechanicalStats = this.generateMechanicalStats(npcBasicInfo, options);
    const storyIntegration = this.generateStoryIntegration(npcBasicInfo, motivations, secrets, options);
    
    const enhancedNPC: EnhancedNPC = {
      id: `npc-${Date.now()}`,
      name: npcBasicInfo.name,
      basicInfo: npcBasicInfo,
      personality,
      appearance,
      background,
      relationships,
      dialogue,
      motivations,
      secrets,
      roleplayGuidance,
      mechanicalStats,
      storyIntegration
    };

    console.log(`✅ [NPC] Generated "${enhancedNPC.name}" - ${enhancedNPC.basicInfo.role} (${enhancedNPC.basicInfo.importance})`);
    console.log(`   Personality: ${personality.coreTraits.map(t => t.name).join(', ')}`);
    console.log(`   Secrets: ${secrets.secrets.length}, Relationships: ${relationships.relationships.length}`);
    
    return enhancedNPC;
  }  /**
 
  * Generate relationship map showing connections to other NPCs
   */
  generateRelationshipMap(
    npc: EnhancedNPC,
    existingNPCs: EnhancedNPC[]
  ): RelationshipMap {
    console.log(`🔗 [NPC] Generating relationship map for ${npc.name}`);
    
    const relationships = this.createNPCRelationships(npc, existingNPCs);
    const socialCircles = this.identifySocialCircles(npc, relationships);
    const networkPosition = this.calculateNetworkPosition(npc, relationships);
    
    const relationshipMap: RelationshipMap = {
      relationships,
      socialCircles,
      networkPosition,
      influenceLevel: this.calculateInfluenceLevel(npc, relationships),
      trustLevels: this.generateTrustLevels(relationships),
      conflicts: this.identifyConflicts(relationships),
      alliances: this.identifyAlliances(relationships)
    };

    console.log(`✅ [NPC] Generated relationship map with ${relationships.length} connections`);
    
    return relationshipMap;
  }

  /**
   * Create dialogue examples and speech patterns
   */
  generateDialogueExamples(
    npc: EnhancedNPC,
    scenarios: DialogueScenario[]
  ): DialogueExample[] {
    console.log(`💬 [NPC] Generating dialogue examples for ${npc.name}`);
    
    const examples: DialogueExample[] = [];
    
    scenarios.forEach(scenario => {
      const dialogue = this.createDialogueForScenario(npc, scenario);
      examples.push({
        situation: scenario.situation,
        dialogue: dialogue.text,
        tone: dialogue.tone,
        subtext: dialogue.subtext,
        alternatives: dialogue.alternatives
      });
    });

    console.log(`✅ [NPC] Generated ${examples.length} dialogue examples`);
    
    return examples;
  }

  // Private helper methods

  private generateBasicInfo(request: NPCGenerationRequest): NPCBasicInfo {
    return {
      name: request.name || this.generateRandomName(request.race, request.gender),
      race: request.race || this.selectRandomRace(),
      gender: request.gender || this.selectRandomGender(),
      age: request.age || this.generateAge(request.race),
      occupation: request.occupation || this.generateOccupation(),
      socialStatus: request.socialStatus || this.generateSocialStatus(),
      location: request.location || 'Unknown',
      role: request.role || 'neutral',
      importance: request.importance || 'minor'
    };
  }

  private generatePersonalityProfile(
    basicInfo: NPCBasicInfo,
    options: NPCGenerationOptions
  ): PersonalityProfile {
    const coreTraits = this.selectPersonalityTraits(3, options.personalityBias);
    const quirks = this.generatePersonalityQuirks(coreTraits, 2);
    const speechPatterns = this.generateSpeechPatterns(basicInfo, coreTraits);
    
    return {
      coreTraits,
      quirks,
      speechPatterns,
      mannerisms: this.generateMannerisms(coreTraits, 3),
      emotionalRange: this.generateEmotionalRange(coreTraits),
      socialBehavior: this.generateSocialBehavior(coreTraits),
      stressResponses: this.generateStressResponses(coreTraits),
      values: this.generateCoreValues(basicInfo, coreTraits),
      fears: this.generateFears(coreTraits, basicInfo),
      desires: this.generateDesires(coreTraits, basicInfo)
    };
  }

  private generateAppearanceProfile(
    basicInfo: NPCBasicInfo,
    personality: PersonalityProfile
  ): AppearanceProfile {
    return {
      physicalDescription: this.generatePhysicalDescription(basicInfo),
      clothing: this.generateClothingStyle(basicInfo, personality),
      accessories: this.generateAccessories(basicInfo, personality),
      distinctiveFeatures: this.generateDistinctiveFeatures(basicInfo),
      bodyLanguage: this.generateBodyLanguage(personality),
      voiceDescription: this.generateVoiceDescription(basicInfo, personality)
    };
  }

  private generateBackgroundProfile(
    basicInfo: NPCBasicInfo,
    personality: PersonalityProfile
  ): BackgroundProfile {
    return {
      origin: this.generateOrigin(basicInfo),
      education: this.generateEducation(basicInfo, personality),
      pastExperiences: this.generatePastExperiences(basicInfo, personality),
      skills: this.generateNPCSkills(basicInfo, personality),
      connections: this.generateBackgroundConnections(basicInfo),
      reputation: this.generateReputation(basicInfo, personality),
      currentSituation: this.generateCurrentSituation(basicInfo, personality)
    };
  }

  private generateDialogueSystem(
    personality: PersonalityProfile,
    background: BackgroundProfile
  ): DialogueSystem {
    return {
      speechStyle: this.generateSpeechStyle(personality, background),
      vocabulary: this.generateVocabularyProfile(background, personality),
      commonPhrases: this.generateCommonPhrases(personality),
      greetings: this.generateGreetings(personality),
      farewells: this.generateFarewells(personality),
      reactions: this.generateEmotionalReactions(personality),
      conversationTopics: this.generateConversationTopics(background, personality),
      dialogueExamples: [] // Will be populated separately
    };
  }

  private generateMotivationSystem(
    personality: PersonalityProfile,
    background: BackgroundProfile,
    options: NPCGenerationOptions
  ): MotivationSystem {
    const primaryMotivation = this.generatePrimaryMotivation(personality, background);
    
    return {
      primaryMotivation,
      secondaryMotivations: this.generateSecondaryMotivations(personality, background),
      goals: this.generateGoals(primaryMotivation, personality),
      obstacles: this.generateObstacles(primaryMotivation, background),
      methods: this.generateMethods(primaryMotivation, personality),
      timeline: this.generateMotivationTimeline(primaryMotivation),
      consequences: this.generateMotivationConsequences(primaryMotivation)
    };
  }

  private generateSecretSystem(
    background: BackgroundProfile,
    relationships: RelationshipMap,
    options: NPCGenerationOptions
  ): SecretSystem {
    const secrets = this.generateSecrets(background, relationships, options.secretComplexity || 'moderate');
    
    return {
      secrets,
      secretLevels: this.generateSecretLevels(secrets),
      revealConditions: this.generateRevealConditions(secrets),
      secretConnections: this.generateSecretConnections(secrets),
      protectionMethods: this.generateProtectionMethods(secrets),
      discoveryConsequences: this.generateDiscoveryConsequences(secrets)
    };
  }

  private generateRoleplayGuidance(
    personality: PersonalityProfile,
    dialogue: DialogueSystem,
    motivations: MotivationSystem
  ): RoleplayGuidance {
    return {
      playingTips: this.generatePlayingTips(personality, motivations),
      voiceGuidance: this.generateVoiceGuidance(dialogue),
      behaviorGuidance: this.generateBehaviorGuidance(personality),
      interactionGuidance: this.generateInteractionGuidance(personality, motivations),
      scenarioResponses: this.generateScenarioResponses(personality, motivations),
      improvisationTips: this.generateImprovisationTips(personality, dialogue)
    };
  }

  private generateMechanicalStats(
    basicInfo: NPCBasicInfo,
    options: NPCGenerationOptions
  ): MechanicalStats {
    if (!options.includeMechanicalStats) {
      return {};
    }
    
    return {
      abilityScores: this.generateAbilityScores(basicInfo),
      skills: this.generateSkillProficiencies(basicInfo),
      savingThrows: this.generateSavingThrowProficiencies(basicInfo),
      armorClass: this.calculateArmorClass(basicInfo),
      hitPoints: this.calculateHitPoints(basicInfo),
      challengeRating: this.calculateChallengeRating(basicInfo),
      combatRole: this.determineCombatRole(basicInfo),
      spellcasting: this.generateSpellcasting(basicInfo)
    };
  }

  private generateStoryIntegration(
    basicInfo: NPCBasicInfo,
    motivations: MotivationSystem,
    secrets: SecretSystem,
    options: NPCGenerationOptions
  ): StoryIntegration {
    return {
      plotHooks: this.generatePlotHooks(motivations, secrets),
      questGiver: this.generateQuestGiverInfo(basicInfo, motivations),
      informationSource: this.generateInformationSource(secrets, motivations),
      storyBeats: this.generateStoryBeats(motivations, secrets),
      characterArcs: this.generateCharacterArcs(motivations, secrets),
      futureAppearances: this.generateFutureAppearances(basicInfo, motivations)
    };
  }

  // Detailed generation methods

  private selectPersonalityTraits(count: number, bias?: string): PersonalityTrait[] {
    const traits: PersonalityTrait[] = [];
    const categories = Object.keys(this.PERSONALITY_TRAIT_LIBRARY);
    
    for (let i = 0; i < count; i++) {
      const category = bias || categories[Math.floor(Math.random() * categories.length)];
      const categoryTraits = this.PERSONALITY_TRAIT_LIBRARY[category] || this.PERSONALITY_TRAIT_LIBRARY['neutral'];
      const trait = categoryTraits[Math.floor(Math.random() * categoryTraits.length)];
      
      if (!traits.some(t => t.name === trait.name)) {
        traits.push({
          ...trait,
          intensity: this.randomTraitIntensity(),
          opposingTrait: this.findOpposingTrait(trait.name)
        });
      }
    }
    
    return traits;
  }

  private generatePersonalityQuirks(traits: PersonalityTrait[], count: number): PersonalityQuirk[] {
    const quirks: PersonalityQuirk[] = [];
    
    for (let i = 0; i < count; i++) {
      quirks.push({
        name: this.generateQuirkName(traits),
        description: this.generateQuirkDescription(),
        frequency: this.randomQuirkFrequency(),
        triggers: this.generateQuirkTriggers(traits),
        visibility: this.randomQuirkVisibility(),
        impact: this.randomQuirkImpact()
      });
    }
    
    return quirks;
  }

  private generateSpeechPatterns(basicInfo: NPCBasicInfo, traits: PersonalityTrait[]): SpeechPattern[] {
    const patterns: SpeechPattern[] = [];
    const style = this.determineSpeechStyle(basicInfo, traits);
    const template = this.SPEECH_PATTERN_TEMPLATES[style] || this.SPEECH_PATTERN_TEMPLATES['casual'];
    
    template.patterns.forEach((pattern, index) => {
      patterns.push({
        pattern,
        description: `Speech pattern reflecting ${style} communication style`,
        examples: template.examples.slice(index, index + 2),
        frequency: 'frequent',
        context: ['general conversation', 'formal situations']
      });
    });
    
    return patterns;
  }

  private createNPCRelationships(npc: EnhancedNPC, existingNPCs: EnhancedNPC[]): NPCRelationship[] {
    const relationships: NPCRelationship[] = [];
    
    existingNPCs.forEach(otherNPC => {
      if (this.shouldHaveRelationship(npc, otherNPC)) {
        relationships.push({
          targetId: otherNPC.id,
          targetName: otherNPC.name,
          relationshipType: this.determineRelationshipType(npc, otherNPC),
          closeness: this.determineCloseness(npc, otherNPC),
          history: this.generateRelationshipHistory(npc, otherNPC),
          currentStatus: this.determineCurrentStatus(),
          dynamics: this.generateRelationshipDynamics(npc, otherNPC),
          secrets: this.generateRelationshipSecrets(npc, otherNPC),
          futureTrajectory: this.predictFutureTrajectory(npc, otherNPC)
        });
      }
    });
    
    return relationships;
  }

  // Utility methods (simplified implementations)
  private generateRandomName(race?: string, gender?: string): string {
    const names = {
      'human': {
        'male': ['Aldric', 'Bram', 'Cedric', 'Dorian', 'Edmund'],
        'female': ['Aria', 'Brenna', 'Celia', 'Diana', 'Evelyn']
      },
      'elf': {
        'male': ['Aelar', 'Beiro', 'Carric', 'Drannor', 'Enna'],
        'female': ['Adrie', 'Birel', 'Caelynn', 'Dara', 'Enna']
      }
    };
    
    const raceNames = names[race || 'human'] || names['human'];
    const genderNames = raceNames[gender || 'male'] || raceNames['male'];
    
    return genderNames[Math.floor(Math.random() * genderNames.length)];
  }

  private selectRandomRace(): string {
    const races = ['human', 'elf', 'dwarf', 'halfling', 'dragonborn', 'tiefling'];
    return races[Math.floor(Math.random() * races.length)];
  }

  private selectRandomGender(): string {
    return Math.random() > 0.5 ? 'male' : 'female';
  }

  private generateAge(race?: string): number {
    const ageRanges = {
      'human': { min: 18, max: 80 },
      'elf': { min: 100, max: 750 },
      'dwarf': { min: 50, max: 350 },
      'halfling': { min: 20, max: 150 }
    };
    
    const range = ageRanges[race || 'human'] || ageRanges['human'];
    return Math.floor(Math.random() * (range.max - range.min)) + range.min;
  }

  private generateOccupation(): string {
    const occupations = [
      'merchant', 'blacksmith', 'tavern keeper', 'guard', 'scholar',
      'priest', 'farmer', 'artisan', 'noble', 'soldier'
    ];
    return occupations[Math.floor(Math.random() * occupations.length)];
  }

  private generateSocialStatus(): SocialStatus {
    const statuses: SocialStatus[] = ['poor', 'working-class', 'middle-class', 'wealthy', 'nobility'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private randomTraitIntensity(): TraitIntensity {
    const intensities: TraitIntensity[] = ['subtle', 'moderate', 'strong', 'dominant'];
    return intensities[Math.floor(Math.random() * intensities.length)];
  }

  private findOpposingTrait(traitName: string): string | undefined {
    const opposites = {
      'Compassionate': 'Cruel',
      'Courageous': 'Cowardly',
      'Wise': 'Foolish',
      'Loyal': 'Treacherous',
      'Arrogant': 'Humble',
      'Greedy': 'Generous'
    };
    
    return opposites[traitName];
  }

  private randomQuirkFrequency(): QuirkFrequency {
    const frequencies: QuirkFrequency[] = ['rare', 'occasional', 'frequent', 'constant'];
    return frequencies[Math.floor(Math.random() * frequencies.length)];
  }

  private randomQuirkVisibility(): QuirkVisibility {
    const visibilities: QuirkVisibility[] = ['hidden', 'subtle', 'obvious', 'prominent'];
    return visibilities[Math.floor(Math.random() * visibilities.length)];
  }

  private randomQuirkImpact(): QuirkImpact {
    const impacts: QuirkImpact[] = ['endearing', 'neutral', 'annoying', 'concerning'];
    return impacts[Math.floor(Math.random() * impacts.length)];
  }

  private generateQuirkName(traits: PersonalityTrait[]): string {
    const quirkNames = [
      'Nervous Laugh', 'Fidgets with Objects', 'Quotes Literature',
      'Collects Unusual Items', 'Speaks to Animals', 'Always Hungry'
    ];
    return quirkNames[Math.floor(Math.random() * quirkNames.length)];
  }

  private generateQuirkDescription(): string {
    return 'A distinctive behavioral pattern that makes this NPC memorable';
  }

  private generateQuirkTriggers(traits: PersonalityTrait[]): string[] {
    return ['stress', 'excitement', 'boredom', 'social situations'];
  }

  private determineSpeechStyle(basicInfo: NPCBasicInfo, traits: PersonalityTrait[]): string {
    if (basicInfo.socialStatus === 'nobility') return 'formal';
    if (basicInfo.occupation === 'scholar') return 'technical';
    if (traits.some(t => t.name === 'Reserved')) return 'formal';
    return 'casual';
  }

  // More placeholder methods for complex operations
  private generateMannerisms(traits: PersonalityTrait[], count: number): Mannerism[] {
    return Array(count).fill(null).map((_, i) => ({
      type: 'gesture',
      description: `Mannerism ${i + 1}`,
      frequency: 'occasional',
      context: ['conversation'],
      noticeability: 'noticeable'
    }));
  }

  private generateEmotionalRange(traits: PersonalityTrait[]): EmotionalRange {
    return {
      primaryEmotions: ['joy', 'anger'],
      emotionalStability: 'stable',
      expressiveness: 'moderate',
      empathy: 'moderate',
      temperament: 'even-tempered'
    };
  }

  private generateSocialBehavior(traits: PersonalityTrait[]): SocialBehavior {
    return {
      extroversion: 'moderate',
      agreeableness: 'agreeable',
      openness: 'moderate',
      conscientiousness: 'conscientious',
      socialSkills: 'average'
    };
  }

  private generateStressResponses(traits: PersonalityTrait[]): StressResponse[] {
    return [
      {
        stressor: 'Conflict',
        response: 'Becomes withdrawn',
        intensity: 'moderate',
        duration: 'brief',
        recovery: 'time'
      }
    ];
  }

  private generateCoreValues(basicInfo: NPCBasicInfo, traits: PersonalityTrait[]): CoreValue[] {
    return [
      {
        value: 'Honesty',
        importance: 'important',
        origin: 'upbringing',
        manifestation: ['tells truth', 'keeps promises'],
        conflicts: ['white lies', 'protecting feelings']
      }
    ];
  }

  private generateFears(traits: PersonalityTrait[], basicInfo: NPCBasicInfo): Fear[] {
    return [
      {
        fear: 'Failure',
        intensity: 'moderate',
        triggers: ['important tasks', 'public performance'],
        avoidanceBehavior: ['over-preparation', 'delegation']
      }
    ];
  }

  private generateDesires(traits: PersonalityTrait[], basicInfo: NPCBasicInfo): Desire[] {
    return [
      {
        desire: 'Recognition',
        intensity: 'moderate',
        timeframe: 'medium-term',
        methods: ['hard work', 'networking'],
        obstacles: ['competition', 'lack of opportunity']
      }
    ];
  }

  // Additional placeholder methods (simplified for brevity)
  private generatePhysicalDescription(basicInfo: NPCBasicInfo): PhysicalDescription {
    return {
      height: 'Average',
      build: 'Medium',
      hairColor: 'Brown',
      hairStyle: 'Short',
      eyeColor: 'Brown',
      skinTone: 'Fair',
      notableFeatures: [],
      overallImpression: 'Unremarkable but pleasant'
    };
  }

  private generateClothingStyle(basicInfo: NPCBasicInfo, personality: PersonalityProfile): ClothingStyle {
    return {
      style: 'Practical',
      quality: 'modest',
      colors: ['brown', 'green'],
      condition: 'good',
      appropriateness: 'Suitable for occupation',
      personalExpression: 'Conservative'
    };
  }

  private generateAccessories(basicInfo: NPCBasicInfo, personality: PersonalityProfile): Accessory[] {
    return [];
  }

  private generateDistinctiveFeatures(basicInfo: NPCBasicInfo): DistinctiveFeature[] {
    return [];
  }

  private generateBodyLanguage(personality: PersonalityProfile): BodyLanguage {
    return {
      posture: 'Upright',
      gestures: ['Moderate hand movements'],
      facialExpressions: ['Friendly smile'],
      personalSpace: 'normal',
      confidence: 'moderate'
    };
  }

  private generateVoiceDescription(basicInfo: NPCBasicInfo, personality: PersonalityProfile): VoiceDescription {
    return {
      tone: 'Warm',
      pitch: 'Medium',
      volume: 'Moderate',
      pace: 'Steady',
      distinctiveQualities: []
    };
  }

  // Continue with more placeholder implementations...
  private generateOrigin(basicInfo: NPCBasicInfo): string {
    return 'Local area';
  }

  private generateEducation(basicInfo: NPCBasicInfo, personality: PersonalityProfile): string {
    return 'Basic education';
  }

  private generatePastExperiences(basicInfo: NPCBasicInfo, personality: PersonalityProfile): PastExperience[] {
    return [];
  }

  private generateNPCSkills(basicInfo: NPCBasicInfo, personality: PersonalityProfile): NPCSkill[] {
    return [];
  }

  private generateBackgroundConnections(basicInfo: NPCBasicInfo): BackgroundConnection[] {
    return [];
  }

  private generateReputation(basicInfo: NPCBasicInfo, personality: PersonalityProfile): Reputation {
    return {
      overall: 'good',
      aspects: [],
      groups: [],
      rumors: [],
      reality: 'Generally well-regarded'
    };
  }

  private generateCurrentSituation(basicInfo: NPCBasicInfo, personality: PersonalityProfile): CurrentSituation {
    return {
      circumstances: 'Stable',
      challenges: [],
      opportunities: [],
      resources: [],
      timeframe: 'Ongoing'
    };
  }

  // Continue with remaining placeholder methods...
  private generateSpeechStyle(personality: PersonalityProfile, background: BackgroundProfile): SpeechStyle {
    return {
      formality: 'moderate',
      complexity: 'moderate',
      emotiveness: 'moderate',
      directness: 'moderate',
      humor: 'moderate',
      cultural: []
    };
  }

  private generateVocabularyProfile(background: BackgroundProfile, personality: PersonalityProfile): VocabularyProfile {
    return {
      level: 'average',
      specializations: [],
      avoidedWords: [],
      favoriteWords: [],
      culturalTerms: [],
      professionalJargon: []
    };
  }

  private generateCommonPhrases(personality: PersonalityProfile): CommonPhrase[] {
    return [];
  }

  private generateGreetings(personality: PersonalityProfile): DialogueOption[] {
    return [
      {
        text: 'Hello there!',
        context: 'casual meeting',
        mood: 'friendly',
        formality: 'informal',
        variations: ['Hi!', 'Good day!']
      }
    ];
  }

  private generateFarewells(personality: PersonalityProfile): DialogueOption[] {
    return [
      {
        text: 'Take care!',
        context: 'casual parting',
        mood: 'friendly',
        formality: 'informal',
        variations: ['Goodbye!', 'See you later!']
      }
    ];
  }

  private generateEmotionalReactions(personality: PersonalityProfile): EmotionalReaction[] {
    return [];
  }

  private generateConversationTopics(background: BackgroundProfile, personality: PersonalityProfile): ConversationTopic[] {
    return [];
  }

  private generatePrimaryMotivation(personality: PersonalityProfile, background: BackgroundProfile): Motivation {
    return {
      description: 'Seeking stability and security',
      type: 'security',
      intensity: 'moderate',
      origin: 'past experiences',
      timeframe: 'long-term',
      publicKnowledge: false
    };
  }

  private generateSecondaryMotivations(personality: PersonalityProfile, background: BackgroundProfile): Motivation[] {
    return [];
  }

  private generateGoals(primaryMotivation: Motivation, personality: PersonalityProfile): Goal[] {
    return [];
  }

  private generateObstacles(primaryMotivation: Motivation, background: BackgroundProfile): Obstacle[] {
    return [];
  }

  private generateMethods(primaryMotivation: Motivation, personality: PersonalityProfile): Method[] {
    return [];
  }

  private generateMotivationTimeline(primaryMotivation: Motivation): MotivationTimeline {
    return {
      shortTerm: [],
      mediumTerm: [],
      longTerm: [],
      milestones: []
    };
  }

  private generateMotivationConsequences(primaryMotivation: Motivation): MotivationConsequence[] {
    return [];
  }

  private generateSecrets(background: BackgroundProfile, relationships: RelationshipMap, complexity: string): Secret[] {
    return [];
  }

  private generateSecretLevels(secrets: Secret[]): SecretLevel[] {
    return [];
  }

  private generateRevealConditions(secrets: Secret[]): RevealCondition[] {
    return [];
  }

  private generateSecretConnections(secrets: Secret[]): SecretConnection[] {
    return [];
  }

  private generateProtectionMethods(secrets: Secret[]): ProtectionMethod[] {
    return [];
  }

  private generateDiscoveryConsequences(secrets: Secret[]): DiscoveryConsequence[] {
    return [];
  }

  private generatePlayingTips(personality: PersonalityProfile, motivations: MotivationSystem): PlayingTip[] {
    return [];
  }

  private generateVoiceGuidance(dialogue: DialogueSystem): VoiceGuidance {
    return {
      tone: 'Warm and friendly',
      pace: 'Moderate',
      emphasis: 'Key words',
      examples: []
    };
  }

  private generateBehaviorGuidance(personality: PersonalityProfile): BehaviorGuidance {
    return {
      generalBehavior: 'Friendly and approachable',
      stressBehavior: 'Becomes quiet and withdrawn',
      socialBehavior: 'Engages readily in conversation',
      examples: []
    };
  }

  private generateInteractionGuidance(personality: PersonalityProfile, motivations: MotivationSystem): InteractionGuidance[] {
    return [];
  }

  private generateScenarioResponses(personality: PersonalityProfile, motivations: MotivationSystem): ScenarioResponse[] {
    return [];
  }

  private generateImprovisationTips(personality: PersonalityProfile, dialogue: DialogueSystem): ImprovisationTip[] {
    return [];
  }

  private generateAbilityScores(basicInfo: NPCBasicInfo): AbilityScores {
    return {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    };
  }

  private generateSkillProficiencies(basicInfo: NPCBasicInfo): SkillProficiencies {
    return {};
  }

  private generateSavingThrowProficiencies(basicInfo: NPCBasicInfo): SavingThrowProficiencies {
    return {};
  }

  private calculateArmorClass(basicInfo: NPCBasicInfo): number {
    return 10;
  }

  private calculateHitPoints(basicInfo: NPCBasicInfo): number {
    return 8;
  }

  private calculateChallengeRating(basicInfo: NPCBasicInfo): string {
    return '0';
  }

  private determineCombatRole(basicInfo: NPCBasicInfo): CombatRole {
    return 'support';
  }

  private generateSpellcasting(basicInfo: NPCBasicInfo): NPCSpellcasting | undefined {
    return undefined;
  }

  private generatePlotHooks(motivations: MotivationSystem, secrets: SecretSystem): PlotHook[] {
    return [];
  }

  private generateQuestGiverInfo(basicInfo: NPCBasicInfo, motivations: MotivationSystem): QuestGiverInfo {
    return {
      canGiveQuests: basicInfo.role === 'quest-giver',
      questTypes: [],
      rewards: [],
      requirements: []
    };
  }

  private generateInformationSource(secrets: SecretSystem, motivations: MotivationSystem): InformationSource {
    return {
      hasInformation: secrets.secrets.length > 0,
      informationTypes: [],
      accessRequirements: [],
      reliability: 'moderate'
    };
  }

  private generateStoryBeats(motivations: MotivationSystem, secrets: SecretSystem): StoryBeat[] {
    return [];
  }

  private generateCharacterArcs(motivations: MotivationSystem, secrets: SecretSystem): CharacterArc[] {
    return [];
  }

  private generateFutureAppearances(basicInfo: NPCBasicInfo, motivations: MotivationSystem): FutureAppearance[] {
    return [];
  }

  // Relationship generation methods
  private shouldHaveRelationship(npc1: EnhancedNPC, npc2: EnhancedNPC): boolean {
    return Math.random() > 0.7; // 30% chance of relationship
  }

  private determineRelationshipType(npc1: EnhancedNPC, npc2: EnhancedNPC): RelationshipType {
    const types: RelationshipType[] = ['friend', 'professional', 'acquaintance', 'rival'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private determineCloseness(npc1: EnhancedNPC, npc2: EnhancedNPC): ClosenessLevel {
    const levels: ClosenessLevel[] = ['distant', 'acquaintance', 'friend', 'close'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private generateRelationshipHistory(npc1: EnhancedNPC, npc2: EnhancedNPC): RelationshipHistory {
    return {
      howMet: 'Through work',
      keyEvents: [],
      duration: '2 years',
      evolution: 'Gradually became friends'
    };
  }

  private determineCurrentStatus(): RelationshipStatus {
    const statuses: RelationshipStatus[] = ['stable', 'improving', 'declining'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private generateRelationshipDynamics(npc1: EnhancedNPC, npc2: EnhancedNPC): RelationshipDynamic[] {
    return [];
  }

  private generateRelationshipSecrets(npc1: EnhancedNPC, npc2: EnhancedNPC): RelationshipSecret[] {
    return [];
  }

  private predictFutureTrajectory(npc1: EnhancedNPC, npc2: EnhancedNPC): FutureTrajectory {
    const trajectories: FutureTrajectory[] = ['strengthening', 'stable', 'weakening'];
    return trajectories[Math.floor(Math.random() * trajectories.length)];
  }

  private identifySocialCircles(npc: EnhancedNPC, relationships: NPCRelationship[]): SocialCircle[] {
    return [];
  }

  private calculateNetworkPosition(npc: EnhancedNPC, relationships: NPCRelationship[]): NetworkPosition {
    return {
      centrality: 'moderate',
      bridgeConnections: [],
      influence: 'minor',
      informationAccess: 'moderate',
      socialCapital: 'moderate'
    };
  }

  private calculateInfluenceLevel(npc: EnhancedNPC, relationships: NPCRelationship[]): InfluenceLevel {
    return 'moderate';
  }

  private generateTrustLevels(relationships: NPCRelationship[]): TrustLevel[] {
    return [];
  }

  private identifyConflicts(relationships: NPCRelationship[]): RelationshipConflict[] {
    return [];
  }

  private identifyAlliances(relationships: NPCRelationship[]): Alliance[] {
    return [];
  }

  private createDialogueForScenario(npc: EnhancedNPC, scenario: DialogueScenario): any {
    return {
      text: 'Sample dialogue response',
      tone: 'friendly',
      subtext: 'Wants to be helpful',
      alternatives: ['Alternative response 1', 'Alternative response 2']
    };
  }
}

// Supporting interfaces for external use

export interface NPCGenerationRequest {
  name?: string;
  race?: string;
  gender?: string;
  age?: number;
  occupation?: string;
  socialStatus?: SocialStatus;
  location?: string;
  role?: NPCRole;
  importance?: NPCImportance;
}

export interface NPCGenerationOptions {
  personalityBias?: string;
  includeMechanicalStats?: boolean;
  secretComplexity?: 'simple' | 'moderate' | 'complex';
  existingNPCs?: EnhancedNPC[];
  storyContext?: string;
}

export interface DialogueScenario {
  situation: string;
  context: string;
  expectedTone: string;
  difficulty: string;
}

// Additional supporting interfaces (simplified)
export interface RelationshipHistory {
  howMet: string;
  keyEvents: string[];
  duration: string;
  evolution: string;
}

export interface RelationshipDynamic {
  type: string;
  description: string;
  intensity: string;
}

export interface RelationshipSecret {
  secret: string;
  sharedWith: string[];
  impact: string;
}

export interface TrustHistory {
  event: string;
  impact: string;
  date: string;
}

export interface TrustCondition {
  condition: string;
  effect: string;
}

export interface PlayingTip {
  situation: string;
  tip: string;
  example?: string;
}

export interface VoiceGuidance {
  tone: string;
  pace: string;
  emphasis: string;
  examples: string[];
}

export interface BehaviorGuidance {
  generalBehavior: string;
  stressBehavior: string;
  socialBehavior: string;
  examples: string[];
}

export interface InteractionGuidance {
  situation: string;
  approach: string;
  expectedOutcome: string;
}

export interface ScenarioResponse {
  scenario: string;
  response: string;
  reasoning: string;
}

export interface ImprovisationTip {
  situation: string;
  tip: string;
  fallback: string;
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SkillProficiencies {
  [skill: string]: number;
}

export interface SavingThrowProficiencies {
  [ability: string]: number;
}

export interface NPCSpellcasting {
  type: string;
  level: number;
  spells: string[];
}

export interface PlotHook {
  hook: string;
  complexity: string;
  requirements: string[];
}

export interface QuestGiverInfo {
  canGiveQuests: boolean;
  questTypes: string[];
  rewards: string[];
  requirements: string[];
}

export interface InformationSource {
  hasInformation: boolean;
  informationTypes: string[];
  accessRequirements: string[];
  reliability: string;
}

export interface StoryBeat {
  beat: string;
  timing: string;
  requirements: string[];
}

export interface CharacterArc {
  arc: string;
  stages: string[];
  duration: string;
}

export interface FutureAppearance {
  context: string;
  likelihood: string;
  purpose: string;
}

export interface TimelineGoal {
  goal: string;
  timeframe: string;
  priority: string;
}

export interface Milestone {
  milestone: string;
  significance: string;
  requirements: string[];
}

export interface ReputationAspect {
  aspect: string;
  rating: string;
  source: string;
}

export interface GroupReputation {
  group: string;
  reputation: string;
  reason: string;
}

export interface Rumor {
  rumor: string;
  truth: boolean;
  source: string;
}

export interface CulturalInfluence {
  culture: string;
  influence: string;
  manifestation: string[];
}

export interface SuccessCondition {
  condition: string;
  measurement: string;
}

export interface ConsequenceImpact {
  area: string;
  severity: string;
  duration: string;
}

// Export singleton instance
export const enhancedNPCGenerationSystem = new EnhancedNPCGenerationSystem();