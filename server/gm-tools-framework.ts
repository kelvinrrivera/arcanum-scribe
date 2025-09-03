/**
 * Basic GM Tools Framework
 * 
 * This module creates the foundation for GM tools suite including data structures,
 * interfaces, quick reference compilation, scene flow diagrams, and scaling systems.
 */

import { ProfessionalAdventure, AdventureContent, ActStructure, MechanicalSystems } from './professional-content-generator.js';

export interface GMToolsSuite {
  quickReference: QuickReferenceGuide;
  sceneFlowDiagram: SceneFlowDiagram;
  scalingGuides: ScalingGuideSystem;
  sessionTracker: SessionTracker;
  emergencyTools: EmergencyTools;
}

export interface QuickReferenceGuide {
  overview: ReferenceOverview;
  keyInformation: KeyInformation;
  mechanics: MechanicsReference;
  npcs: NPCReference[];
  encounters: EncounterReference[];
  items: ItemReference[];
  troubleshooting: TroubleshootingGuide;
}

export interface ReferenceOverview {
  title: string;
  duration: string;
  partyLevel: number;
  partySize: number;
  difficulty: string;
  keyThemes: string[];
  criticalReminders: string[];
}

export interface KeyInformation {
  plotSummary: string;
  keyNPCs: string[];
  importantLocations: string[];
  criticalItems: string[];
  winConditions: string[];
  failureConsequences: string[];
}

export interface MechanicsReference {
  skillChecks: SkillCheckReference[];
  savingThrows: SavingThrowReference[];
  combatModifiers: CombatModifier[];
  specialRules: SpecialRule[];
}

export interface SkillCheckReference {
  situation: string;
  skill: string;
  dc: number;
  success: string;
  failure: string;
  alternatives: string[];
}

export interface SavingThrowReference {
  trigger: string;
  save: string;
  dc: number;
  effect: string;
  duration: string;
}

export interface CombatModifier {
  condition: string;
  effect: string;
  duration: string;
  removal: string;
}

export interface SpecialRule {
  name: string;
  description: string;
  trigger: string;
  effect: string;
  notes: string[];
}

export interface NPCReference {
  name: string;
  role: string;
  location: string;
  motivation: string;
  keyInfo: string[];
  voiceNotes: string;
  relationships: string[];
}

export interface EncounterReference {
  name: string;
  location: string;
  trigger: string;
  creatures: CreatureQuickRef[];
  tactics: string[];
  objectives: string[];
  terrain: string[];
}

export interface CreatureQuickRef {
  name: string;
  ac: number;
  hp: number;
  speed: string;
  cr: string;
  keyAbilities: string[];
  weaknesses: string[];
}

export interface ItemReference {
  name: string;
  type: string;
  rarity: string;
  properties: string[];
  location: string;
  significance: string;
}

export interface TroubleshootingGuide {
  commonIssues: TroubleshootingIssue[];
  playerActions: PlayerActionGuide[];
  pacingTips: PacingTip[];
  backupPlans: BackupPlan[];
}

export interface TroubleshootingIssue {
  problem: string;
  symptoms: string[];
  solutions: string[];
  prevention: string[];
}

export interface PlayerActionGuide {
  action: string;
  likelyOutcomes: string[];
  gmResponse: string[];
  consequences: string[];
}

export interface PacingTip {
  situation: string;
  signs: string[];
  adjustments: string[];
  timing: string;
}

export interface BackupPlan {
  scenario: string;
  quickSolution: string;
  detailedApproach: string[];
  resources: string[];
}

export interface SceneFlowDiagram {
  metadata: FlowMetadata;
  nodes: SceneNode[];
  connections: SceneConnection[];
  paths: FlowPath[];
  alternatives: AlternativeRoute[];
}

export interface FlowMetadata {
  title: string;
  totalScenes: number;
  estimatedDuration: number;
  criticalPathLength: number;
  alternativeCount: number;
}

export interface SceneNode {
  id: string;
  title: string;
  type: 'required' | 'optional' | 'alternative';
  act: number;
  estimatedDuration: number;
  objectives: string[];
  keyElements: string[];
  exitConditions: string[];
}

export interface SceneConnection {
  from: string;
  to: string;
  condition: string;
  type: 'automatic' | 'conditional' | 'choice';
  requirements: string[];
  alternatives: string[];
}

export interface FlowPath {
  name: string;
  description: string;
  scenes: string[];
  estimatedDuration: number;
  difficulty: string;
  playerChoices: string[];
}

export interface AlternativeRoute {
  trigger: string;
  description: string;
  alternativeScenes: string[];
  rejoinsAt: string;
  consequences: string[];
}

export interface ScalingGuideSystem {
  levelScaling: LevelScalingGuide;
  partySizeScaling: PartySizeScalingGuide;
  difficultyAdjustments: DifficultyAdjustments;
  quickScalingTable: QuickScalingTable;
}

export interface LevelScalingGuide {
  baseLevel: number;
  scalingRanges: LevelRange[];
  encounterAdjustments: EncounterScaling[];
  skillCheckAdjustments: SkillScaling[];
  rewardAdjustments: RewardScaling[];
}

export interface LevelRange {
  levels: string;
  description: string;
  generalAdjustments: string[];
  specificChanges: ScalingChange[];
}

export interface ScalingChange {
  element: string;
  adjustment: string;
  reason: string;
  impact: string;
}

export interface EncounterScaling {
  originalCR: string;
  levelAdjustments: { [level: string]: EncounterAdjustment };
}

export interface EncounterAdjustment {
  newCR: string;
  hpMultiplier: number;
  damageMultiplier: number;
  additionalCreatures: number;
  tacticalChanges: string[];
}

export interface SkillScaling {
  originalDC: number;
  levelAdjustments: { [level: string]: number };
  reasoning: string[];
}

export interface RewardScaling {
  rewardType: string;
  baseAmount: string;
  levelMultipliers: { [level: string]: number };
  alternatives: string[];
}

export interface PartySizeScalingGuide {
  baseSize: number;
  sizeAdjustments: SizeAdjustment[];
  encounterModifications: SizeEncounterMod[];
  roleplayConsiderations: RoleplayScaling[];
}

export interface SizeAdjustment {
  partySize: number;
  description: string;
  generalChanges: string[];
  specificAdjustments: string[];
  gmTips: string[];
}

export interface SizeEncounterMod {
  partySize: number;
  encounterMultiplier: number;
  additionalEnemies: number;
  tacticalChanges: string[];
  balanceNotes: string[];
}

export interface RoleplayScaling {
  partySize: number;
  screenTimeManagement: string[];
  npcInteractionTips: string[];
  decisionMakingGuidance: string[];
}

export interface DifficultyAdjustments {
  currentDifficulty: string;
  adjustmentOptions: DifficultyOption[];
  onTheFlyChanges: QuickAdjustment[];
  playerFeedbackIntegration: FeedbackAdjustment[];
}

export interface DifficultyOption {
  targetDifficulty: string;
  changes: DifficultyChange[];
  impact: string;
  reversibility: boolean;
}

export interface DifficultyChange {
  aspect: string;
  modification: string;
  effect: string;
  implementation: string;
}

export interface QuickAdjustment {
  situation: string;
  quickFix: string;
  implementation: string;
  duration: string;
}

export interface FeedbackAdjustment {
  playerSignal: string;
  interpretation: string;
  recommendedAction: string;
  timing: string;
}

export interface QuickScalingTable {
  levelTable: LevelScalingRow[];
  sizeTable: SizeScalingRow[];
  difficultyTable: DifficultyScalingRow[];
  combinedAdjustments: CombinedScalingTip[];
}

export interface LevelScalingRow {
  level: string;
  hpMultiplier: string;
  damageMultiplier: string;
  dcAdjustment: string;
  notes: string;
}

export interface SizeScalingRow {
  partySize: number;
  encounterMultiplier: string;
  additionalEnemies: string;
  notes: string;
}

export interface DifficultyScalingRow {
  fromDifficulty: string;
  toDifficulty: string;
  quickChanges: string;
  notes: string;
}

export interface CombinedScalingTip {
  scenario: string;
  adjustments: string[];
  priority: string;
  warnings: string[];
}

export interface SessionTracker {
  timeTracking: TimeTracker;
  progressTracker: ProgressTracker;
  playerNotes: PlayerNotesSystem;
  decisionLog: DecisionLog;
}

export interface TimeTracker {
  sessionStart: Date | null;
  actTimings: ActTiming[];
  sceneTimings: SceneTiming[];
  breakTimes: BreakTime[];
  estimatedCompletion: Date | null;
}

export interface ActTiming {
  act: number;
  startTime: Date | null;
  endTime: Date | null;
  estimatedDuration: number;
  actualDuration: number | null;
}

export interface SceneTiming {
  sceneId: string;
  startTime: Date | null;
  endTime: Date | null;
  estimatedDuration: number;
  actualDuration: number | null;
  notes: string[];
}

export interface BreakTime {
  startTime: Date;
  endTime: Date | null;
  type: 'short' | 'meal' | 'emergency';
  reason: string;
}

export interface ProgressTracker {
  completedScenes: string[];
  currentScene: string | null;
  skippedScenes: string[];
  alternativesTaken: string[];
  playerChoices: PlayerChoice[];
}

export interface PlayerChoice {
  sceneId: string;
  choice: string;
  consequences: string[];
  timestamp: Date;
}

export interface PlayerNotesSystem {
  characterNotes: CharacterNote[];
  storyNotes: StoryNote[];
  mechanicalNotes: MechanicalNote[];
  gmReminders: GMReminder[];
}

export interface CharacterNote {
  characterName: string;
  note: string;
  category: 'personality' | 'backstory' | 'relationships' | 'goals';
  relevantScenes: string[];
  timestamp: Date;
}

export interface StoryNote {
  note: string;
  category: 'plot' | 'worldbuilding' | 'consequences' | 'future';
  importance: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface MechanicalNote {
  note: string;
  category: 'rules' | 'combat' | 'skills' | 'magic';
  reference: string;
  timestamp: Date;
}

export interface GMReminder {
  reminder: string;
  triggerScene: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface DecisionLog {
  rulings: Ruling[];
  houseRules: HouseRule[];
  interpretations: RuleInterpretation[];
}

export interface Ruling {
  situation: string;
  ruling: string;
  reasoning: string;
  precedent: boolean;
  timestamp: Date;
}

export interface HouseRule {
  rule: string;
  reason: string;
  scope: 'session' | 'campaign' | 'permanent';
  playerAgreement: boolean;
}

export interface RuleInterpretation {
  rule: string;
  interpretation: string;
  source: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface EmergencyTools {
  quickNPCs: QuickNPC[];
  randomEncounters: RandomEncounter[];
  improvisationAids: ImprovisationAid[];
  storyRecovery: StoryRecoveryTool[];
}

export interface QuickNPC {
  name: string;
  role: string;
  personality: string;
  motivation: string;
  appearance: string;
  voiceNote: string;
  useCase: string[];
}

export interface RandomEncounter {
  name: string;
  description: string;
  creatures: string[];
  difficulty: string;
  duration: string;
  purpose: string[];
}

export interface ImprovisationAid {
  category: string;
  prompts: string[];
  quickRules: string[];
  examples: string[];
}

export interface StoryRecoveryTool {
  problem: string;
  quickSolution: string;
  narrativeApproach: string[];
  mechanicalFix: string[];
  playerInvolvement: string[];
}

/**
 * GM Tools Framework Class
 */
export class GMToolsFramework {
  /**
   * Create comprehensive GM tools suite
   */
  createGMToolsSuite(adventure: ProfessionalAdventure): GMToolsSuite {
    console.log(`🛠️  [GM-TOOLS] Creating comprehensive GM tools suite`);
    
    const quickReference = this.compileQuickReference(adventure);
    const sceneFlowDiagram = this.generateSceneFlowDiagram(adventure.structure);
    const scalingGuides = this.createScalingGuides(adventure);
    const sessionTracker = this.initializeSessionTracker(adventure);
    const emergencyTools = this.prepareEmergencyTools(adventure);

    const toolsSuite: GMToolsSuite = {
      quickReference,
      sceneFlowDiagram,
      scalingGuides,
      sessionTracker,
      emergencyTools
    };

    console.log(`✅ [GM-TOOLS] GM tools suite created`);
    console.log(`   Quick Reference: ${quickReference.mechanics.skillChecks.length} skill checks`);
    console.log(`   Flow Diagram: ${sceneFlowDiagram.nodes.length} scenes, ${sceneFlowDiagram.connections.length} connections`);
    
    return toolsSuite;
  }

  /**
   * Compile comprehensive quick reference guide
   */
  private compileQuickReference(adventure: ProfessionalAdventure): QuickReferenceGuide {
    const overview = this.createReferenceOverview(adventure);
    const keyInformation = this.extractKeyInformation(adventure);
    const mechanics = this.compileMechanicsReference(adventure);
    const npcs = this.createNPCReferences(adventure.content.npcs);
    const encounters = this.createEncounterReferences(adventure);
    const items = this.createItemReferences(adventure.content.magicItems);
    const troubleshooting = this.createTroubleshootingGuide(adventure);

    return {
      overview,
      keyInformation,
      mechanics,
      npcs,
      encounters,
      items,
      troubleshooting
    };
  }

  /**
   * Generate visual scene flow diagram
   */
  private generateSceneFlowDiagram(structure: ActStructure): SceneFlowDiagram {
    const metadata = this.createFlowMetadata(structure);
    const nodes = this.createSceneNodes(structure);
    const connections = this.createSceneConnections(structure);
    const paths = this.identifyFlowPaths(structure);
    const alternatives = this.findAlternativeRoutes(structure);

    return {
      metadata,
      nodes,
      connections,
      paths,
      alternatives
    };
  }

  /**
   * Create comprehensive scaling guides
   */
  private createScalingGuides(adventure: ProfessionalAdventure): ScalingGuideSystem {
    const levelScaling = this.createLevelScalingGuide(adventure);
    const partySizeScaling = this.createPartySizeScalingGuide(adventure);
    const difficultyAdjustments = this.createDifficultyAdjustments(adventure);
    const quickScalingTable = this.createQuickScalingTable(adventure);

    return {
      levelScaling,
      partySizeScaling,
      difficultyAdjustments,
      quickScalingTable
    };
  }

  // Implementation of helper methods would continue here...
  // For brevity, I'll include key methods and placeholders for others

  private createReferenceOverview(adventure: ProfessionalAdventure): ReferenceOverview {
    return {
      title: adventure.content.title,
      duration: adventure.metadata.estimatedDuration,
      partyLevel: adventure.metadata.partyLevel,
      partySize: adventure.metadata.partySize,
      difficulty: adventure.metadata.difficultyRating,
      keyThemes: [adventure.content.theme],
      criticalReminders: [
        'Maintain consistent DCs throughout',
        'Emphasize player choice consequences',
        'Use environmental features tactically'
      ]
    };
  }

  private extractKeyInformation(adventure: ProfessionalAdventure): KeyInformation {
    return {
      plotSummary: adventure.content.hook,
      keyNPCs: adventure.content.npcs.map(npc => npc.name),
      importantLocations: adventure.structure.acts.flatMap(act => 
        act.scenes.map(scene => scene.title)
      ),
      criticalItems: adventure.content.magicItems.map(item => item.name),
      winConditions: ['Complete all three acts', 'Resolve main conflict'],
      failureConsequences: ['Story continues with consequences', 'Alternative endings possible']
    };
  }

  private compileMechanicsReference(adventure: ProfessionalAdventure): MechanicsReference {
    const skillChecks: SkillCheckReference[] = [];
    const savingThrows: SavingThrowReference[] = [];
    const combatModifiers: CombatModifier[] = [];
    const specialRules: SpecialRule[] = [];

    // Extract skill checks from all scenes
    adventure.structure.acts.forEach(act => {
      act.scenes.forEach(scene => {
        scene.skillChecks.forEach(check => {
          skillChecks.push({
            situation: `${scene.title}: ${check.description}`,
            skill: check.skill,
            dc: check.dc,
            success: check.consequences || 'Success outcome',
            failure: 'Failure consequence',
            alternatives: ['Alternative approach available']
          });
        });
      });
    });

    return {
      skillChecks,
      savingThrows,
      combatModifiers,
      specialRules
    };
  }

  private createNPCReferences(npcs: any[]): NPCReference[] {
    return npcs.map(npc => ({
      name: npc.name,
      role: npc.role,
      location: 'Various scenes',
      motivation: npc.motivation,
      keyInfo: [npc.backstory],
      voiceNotes: npc.personality,
      relationships: npc.relationshipMap || []
    }));
  }

  private createEncounterReferences(adventure: ProfessionalAdventure): EncounterReference[] {
    const encounters: EncounterReference[] = [];
    
    adventure.structure.acts.forEach(act => {
      act.scenes.forEach(scene => {
        scene.encounters.forEach(encounter => {
          encounters.push({
            name: encounter.name,
            location: scene.title,
            trigger: 'Scene progression',
            creatures: encounter.creatures.map(c => ({
              name: c,
              ac: 15,
              hp: 50,
              speed: '30 ft.',
              cr: '3',
              keyAbilities: ['Multiattack'],
              weaknesses: ['Specific damage type']
            })),
            tactics: encounter.objectives || ['Standard combat tactics'],
            objectives: encounter.objectives || ['Defeat enemies'],
            terrain: scene.tacticalFeatures.map(f => f.name)
          });
        });
      });
    });

    return encounters;
  }

  private createItemReferences(items: any[]): ItemReference[] {
    return items.map(item => ({
      name: item.name,
      type: 'Magic Item',
      rarity: item.rarity,
      properties: [item.properties],
      location: 'Adventure reward',
      significance: item.lore
    }));
  }

  private createTroubleshootingGuide(adventure: ProfessionalAdventure): TroubleshootingGuide {
    return {
      commonIssues: [
        {
          problem: 'Players stuck on puzzle',
          symptoms: ['Long silence', 'Frustration', 'Off-topic discussion'],
          solutions: ['Provide subtle hints', 'Allow alternative approaches', 'Skip with consequences'],
          prevention: ['Prepare multiple hints', 'Set time limits', 'Have backup solutions']
        }
      ],
      playerActions: [
        {
          action: 'Unexpected creative solution',
          likelyOutcomes: ['Bypasses intended challenge', 'Creates new complications'],
          gmResponse: ['Reward creativity', 'Adjust difficulty', 'Incorporate into story'],
          consequences: ['Story adaptation needed', 'Potential pacing changes']
        }
      ],
      pacingTips: [
        {
          situation: 'Scene running too long',
          signs: ['Player disengagement', 'Repetitive actions', 'Clock watching'],
          adjustments: ['Introduce complication', 'Fast-forward', 'Take break'],
          timing: 'Immediately when noticed'
        }
      ],
      backupPlans: [
        {
          scenario: 'Key NPC dies unexpectedly',
          quickSolution: 'Information passed through dying words',
          detailedApproach: ['Introduce replacement NPC', 'Use alternative information source', 'Adjust story accordingly'],
          resources: ['Emergency NPC list', 'Alternative plot hooks']
        }
      ]
    };
  }

  private createFlowMetadata(structure: ActStructure): FlowMetadata {
    const totalScenes = structure.acts.reduce((sum, act) => sum + act.scenes.length, 0);
    
    return {
      title: 'Adventure Flow Diagram',
      totalScenes,
      estimatedDuration: structure.totalEstimatedDuration,
      criticalPathLength: structure.criticalPath.length,
      alternativeCount: structure.alternativePaths.length
    };
  }

  private createSceneNodes(structure: ActStructure): SceneNode[] {
    const nodes: SceneNode[] = [];
    
    structure.acts.forEach(act => {
      act.scenes.forEach(scene => {
        nodes.push({
          id: scene.id,
          title: scene.title,
          type: 'required', // Could be determined by scene properties
          act: act.number,
          estimatedDuration: scene.estimatedDuration,
          objectives: scene.objectives,
          keyElements: [scene.description],
          exitConditions: scene.connections.map(c => c.condition)
        });
      });
    });

    return nodes;
  }

  private createSceneConnections(structure: ActStructure): SceneConnection[] {
    const connections: SceneConnection[] = [];
    
    structure.acts.forEach(act => {
      act.scenes.forEach(scene => {
        scene.connections.forEach(connection => {
          connections.push({
            from: scene.id,
            to: connection.to,
            condition: connection.condition,
            type: connection.type === 'required' ? 'automatic' : 'conditional',
            requirements: [connection.condition],
            alternatives: []
          });
        });
      });
    });

    return connections;
  }

  private identifyFlowPaths(structure: ActStructure): FlowPath[] {
    return [
      {
        name: 'Critical Path',
        description: 'Main story progression',
        scenes: structure.criticalPath,
        estimatedDuration: structure.totalEstimatedDuration,
        difficulty: 'Standard',
        playerChoices: ['Key decision points']
      }
    ];
  }

  private findAlternativeRoutes(structure: ActStructure): AlternativeRoute[] {
    return structure.alternativePaths.map(path => ({
      trigger: 'Player choice',
      description: path.description,
      alternativeScenes: path.scenes,
      rejoinsAt: 'Next act',
      consequences: ['Story variation']
    }));
  }

  // Placeholder methods for scaling guides
  private createLevelScalingGuide(adventure: ProfessionalAdventure): LevelScalingGuide {
    return {
      baseLevel: adventure.metadata.partyLevel,
      scalingRanges: [],
      encounterAdjustments: [],
      skillCheckAdjustments: [],
      rewardAdjustments: []
    };
  }

  private createPartySizeScalingGuide(adventure: ProfessionalAdventure): PartySizeScalingGuide {
    return {
      baseSize: adventure.metadata.partySize,
      sizeAdjustments: [],
      encounterModifications: [],
      roleplayConsiderations: []
    };
  }

  private createDifficultyAdjustments(adventure: ProfessionalAdventure): DifficultyAdjustments {
    return {
      currentDifficulty: adventure.metadata.difficultyRating,
      adjustmentOptions: [],
      onTheFlyChanges: [],
      playerFeedbackIntegration: []
    };
  }

  private createQuickScalingTable(adventure: ProfessionalAdventure): QuickScalingTable {
    return {
      levelTable: [],
      sizeTable: [],
      difficultyTable: [],
      combinedAdjustments: []
    };
  }

  private initializeSessionTracker(adventure: ProfessionalAdventure): SessionTracker {
    return {
      timeTracking: {
        sessionStart: null,
        actTimings: adventure.structure.acts.map(act => ({
          act: act.number,
          startTime: null,
          endTime: null,
          estimatedDuration: act.estimatedDuration,
          actualDuration: null
        })),
        sceneTimings: [],
        breakTimes: [],
        estimatedCompletion: null
      },
      progressTracker: {
        completedScenes: [],
        currentScene: null,
        skippedScenes: [],
        alternativesTaken: [],
        playerChoices: []
      },
      playerNotes: {
        characterNotes: [],
        storyNotes: [],
        mechanicalNotes: [],
        gmReminders: []
      },
      decisionLog: {
        rulings: [],
        houseRules: [],
        interpretations: []
      }
    };
  }

  private prepareEmergencyTools(adventure: ProfessionalAdventure): EmergencyTools {
    return {
      quickNPCs: [
        {
          name: 'Village Guard',
          role: 'Authority Figure',
          personality: 'Dutiful but nervous',
          motivation: 'Protect the village',
          appearance: 'Worn leather armor, worried expression',
          voiceNote: 'Speaks quickly when nervous',
          useCase: ['Information source', 'Minor obstacle', 'Ally']
        }
      ],
      randomEncounters: [
        {
          name: 'Frost Wolves',
          description: '2-3 wolves affected by the supernatural winter',
          creatures: ['Wolf (modified with cold resistance)'],
          difficulty: 'Easy',
          duration: '10-15 minutes',
          purpose: ['Pacing adjustment', 'Resource drain', 'Atmosphere']
        }
      ],
      improvisationAids: [
        {
          category: 'Names',
          prompts: ['Elven names', 'Human names', 'Place names'],
          quickRules: ['Use real-world inspiration', 'Keep it simple'],
          examples: ['Aelindra', 'Thornwick', 'Millhaven']
        }
      ],
      storyRecovery: [
        {
          problem: 'Players miss crucial information',
          quickSolution: 'Have NPC repeat information differently',
          narrativeApproach: ['Use environmental storytelling', 'Introduce new information source'],
          mechanicalFix: ['Lower DC for related checks', 'Provide automatic success'],
          playerInvolvement: ['Ask players what they remember', 'Let them piece it together']
        }
      ]
    };
  }
}

// Export singleton instance
export const gmToolsFramework = new GMToolsFramework();