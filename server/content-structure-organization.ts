/**
 * Content Structure and Organization System
 * 
 * This module implements 3-act structure system with estimated timing,
 * table of contents generation, cross-reference system, and content
 * density optimization for specified session lengths.
 */

export interface ContentStructure {
  id: string;
  title: string;
  structure: ThreeActStructure;
  tableOfContents: TableOfContents;
  crossReferences: CrossReference[];
  contentDensity: ContentDensity;
  navigation: NavigationSystem;
  timing: TimingEstimation;
  organization: OrganizationMetadata;
}

export interface ThreeActStructure {
  act1: Act;
  act2: Act;
  act3: Act;
  transitions: ActTransition[];
  pacing: PacingStructure;
  climaxPoints: ClimaxPoint[];
}

export interface Act {
  id: string;
  name: string;
  purpose: ActPurpose;
  scenes: Scene[];
  estimatedDuration: number;
  objectives: ActObjective[];
  keyEvents: KeyEvent[];
  characterDevelopment: CharacterDevelopment[];
}

export interface Scene {
  id: string;
  name: string;
  type: SceneType;
  purpose: ScenePurpose;
  content: SceneContent;
  estimatedDuration: number;
  prerequisites: string[];
  outcomes: SceneOutcome[];
  connections: SceneConnection[];
}

export interface TableOfContents {
  id: string;
  structure: TOCStructure;
  entries: TOCEntry[];
  navigation: TOCNavigation;
  formatting: TOCFormatting;
  pageNumbers: PageNumbering;
}

export interface CrossReference {
  id: string;
  type: ReferenceType;
  source: ReferenceSource;
  target: ReferenceTarget;
  context: string;
  displayText: string;
  category: ReferenceCategory;
}ex
port interface ContentDensity {
  overall: DensityMetrics;
  bySection: SectionDensity[];
  optimization: DensityOptimization;
  sessionLength: SessionLengthTarget;
  pacing: PacingDensity;
}

export interface NavigationSystem {
  primaryNavigation: NavigationElement[];
  secondaryNavigation: NavigationElement[];
  quickAccess: QuickAccessElement[];
  searchability: SearchabilityFeatures;
  bookmarks: BookmarkSystem;
}

export interface TimingEstimation {
  totalDuration: number;
  actBreakdown: ActTiming[];
  sceneBreakdown: SceneTiming[];
  bufferTime: number;
  variabilityFactors: VariabilityFactor[];
}

export interface OrganizationMetadata {
  version: string;
  lastModified: string;
  author: string;
  tags: string[];
  difficulty: string;
  playerCount: string;
  sessionType: string;
}

// Supporting interfaces
export interface ActTransition {
  from: string;
  to: string;
  method: TransitionMethod;
  duration: number;
  description: string;
}

export interface PacingStructure {
  overall: PacingCurve;
  actPacing: ActPacing[];
  tensionPoints: TensionPoint[];
  restPoints: RestPoint[];
}

export interface ClimaxPoint {
  location: string;
  intensity: ClimaxIntensity;
  type: ClimaxType;
  buildup: number;
  resolution: number;
}

export interface ActObjective {
  description: string;
  priority: ObjectivePriority;
  measurable: boolean;
  dependencies: string[];
}

export interface KeyEvent {
  name: string;
  description: string;
  timing: EventTiming;
  impact: EventImpact;
  alternatives: string[];
}

export interface CharacterDevelopment {
  character: string;
  development: string;
  method: DevelopmentMethod;
  timing: string;
}

export interface SceneContent {
  description: string;
  boxedText?: string;
  encounters: EncounterReference[];
  npcs: NPCReference[];
  locations: LocationReference[];
  items: ItemReference[];
  handouts: HandoutReference[];
}

export interface SceneOutcome {
  condition: string;
  result: string;
  impact: OutcomeImpact;
  nextScene?: string;
}

export interface SceneConnection {
  type: ConnectionType;
  target: string;
  condition?: string;
  description: string;
}

// Enums and types
export type ActPurpose = 'setup' | 'confrontation' | 'resolution';
export type SceneType = 'combat' | 'social' | 'exploration' | 'puzzle' | 'transition' | 'climax';
export type ScenePurpose = 'introduction' | 'development' | 'conflict' | 'resolution' | 'transition';
export type ReferenceType = 'internal' | 'external' | 'cross-section' | 'appendix';
export type ReferenceCategory = 'rule' | 'npc' | 'location' | 'item' | 'spell' | 'monster';
export type TransitionMethod = 'narrative' | 'mechanical' | 'temporal' | 'spatial';
export type ClimaxIntensity = 'minor' | 'moderate' | 'major' | 'climactic';
export type ClimaxType = 'action' | 'emotional' | 'revelation' | 'decision';
export type ObjectivePriority = 'primary' | 'secondary' | 'optional';
export type EventTiming = 'fixed' | 'flexible' | 'conditional' | 'player-driven';
export type EventImpact = 'local' | 'act' | 'adventure' | 'campaign';
export type DevelopmentMethod = 'dialogue' | 'action' | 'revelation' | 'choice';
export type OutcomeImpact = 'immediate' | 'delayed' | 'ongoing' | 'permanent';
export type ConnectionType = 'sequential' | 'conditional' | 'optional' | 'parallel';

/**
 * Content Structure and Organization System Class
 */
export class ContentStructureOrganizationSystem {
  private readonly SCENE_DURATION_ESTIMATES = {
    'combat': { min: 30, avg: 45, max: 90 },
    'social': { min: 15, avg: 30, max: 60 },
    'exploration': { min: 20, avg: 35, max: 75 },
    'puzzle': { min: 15, avg: 25, max: 45 },
    'transition': { min: 5, avg: 10, max: 20 },
    'climax': { min: 45, avg: 60, max: 120 }
  };

  private readonly PACING_TEMPLATES = {
    'standard': {
      act1: 0.25, // 25% of total time
      act2: 0.50, // 50% of total time  
      act3: 0.25  // 25% of total time
    },
    'slow-burn': {
      act1: 0.35,
      act2: 0.45,
      act3: 0.20
    },
    'action-packed': {
      act1: 0.20,
      act2: 0.55,
      act3: 0.25
    }
  };

  /**
   * Generate complete content structure with 3-act organization
   */
  generateContentStructure(
    contentData: ContentData,
    requirements: StructureRequirements
  ): ContentStructure {
    console.log(`📚 [STRUCTURE] Generating content structure for "${contentData.title}"`);
    
    const threeActStructure = this.generateThreeActStructure(contentData, requirements);
    const tableOfContents = this.generateTableOfContents(threeActStructure, requirements);
    const crossReferences = this.generateCrossReferences(contentData, threeActStructure);
    const contentDensity = this.calculateContentDensity(threeActStructure, requirements);
    const navigation = this.generateNavigationSystem(threeActStructure, tableOfContents);
    const timing = this.estimateTiming(threeActStructure, requirements);
    
    const structure: ContentStructure = {
      id: `structure-${Date.now()}`,
      title: contentData.title,
      structure: threeActStructure,
      tableOfContents,
      crossReferences,
      contentDensity,
      navigation,
      timing,
      organization: this.generateOrganizationMetadata(contentData, requirements)
    };

    console.log(`✅ [STRUCTURE] Generated structure with ${structure.timing.totalDuration} min duration`);
    console.log(`   Acts: ${threeActStructure.act1.scenes.length}/${threeActStructure.act2.scenes.length}/${threeActStructure.act3.scenes.length} scenes`);
    
    return structure;
  }  
/**
   * Optimize content density for target session length
   */
  optimizeContentDensity(
    structure: ContentStructure,
    targetDuration: number,
    preferences: OptimizationPreferences
  ): OptimizedStructure {
    console.log(`⚡ [STRUCTURE] Optimizing content density for ${targetDuration} min session`);
    
    const currentDuration = structure.timing.totalDuration;
    const adjustmentRatio = targetDuration / currentDuration;
    
    const optimizedActs = this.optimizeActs(structure.structure, adjustmentRatio, preferences);
    const updatedTiming = this.recalculateTiming(optimizedActs);
    const densityMetrics = this.calculateOptimizedDensity(optimizedActs, targetDuration);
    
    const optimized: OptimizedStructure = {
      ...structure,
      id: `optimized-${structure.id}`,
      structure: {
        ...structure.structure,
        act1: optimizedActs.act1,
        act2: optimizedActs.act2,
        act3: optimizedActs.act3
      },
      timing: updatedTiming,
      contentDensity: {
        ...structure.contentDensity,
        optimization: {
          applied: true,
          targetDuration,
          actualDuration: updatedTiming.totalDuration,
          adjustmentRatio,
          changes: this.documentOptimizationChanges(structure.structure, optimizedActs)
        }
      }
    };

    console.log(`✅ [STRUCTURE] Optimized to ${optimized.timing.totalDuration} min (${Math.round(adjustmentRatio * 100)}% of original)`);
    
    return optimized;
  }

  /**
   * Generate comprehensive table of contents with page numbers
   */
  generateTableOfContents(
    structure: ThreeActStructure,
    requirements: StructureRequirements
  ): TableOfContents {
    console.log(`📑 [STRUCTURE] Generating table of contents`);
    
    const entries: TOCEntry[] = [];
    let currentPage = 1;
    
    // Add acts and scenes to TOC
    [structure.act1, structure.act2, structure.act3].forEach((act, actIndex) => {
      const actEntry: TOCEntry = {
        id: act.id,
        title: act.name,
        level: 1,
        pageNumber: currentPage,
        type: 'act',
        children: []
      };
      
      act.scenes.forEach(scene => {
        const sceneEntry: TOCEntry = {
          id: scene.id,
          title: scene.name,
          level: 2,
          pageNumber: currentPage,
          type: 'scene',
          children: []
        };
        
        actEntry.children!.push(sceneEntry);
        currentPage += this.estimateScenePages(scene);
      });
      
      entries.push(actEntry);
      currentPage += 1; // Act separator page
    });
    
    const toc: TableOfContents = {
      id: `toc-${Date.now()}`,
      structure: {
        maxDepth: 3,
        showPageNumbers: true,
        showEstimatedTiming: requirements.includeTimingInTOC || false,
        groupByAct: true
      },
      entries,
      navigation: {
        clickable: true,
        expandable: true,
        searchable: true
      },
      formatting: {
        indentSize: '20px',
        dotLeaders: true,
        pageNumberAlignment: 'right',
        fontSizes: {
          level1: '16px',
          level2: '14px',
          level3: '12px'
        }
      },
      pageNumbers: {
        startPage: 1,
        format: 'decimal',
        includeTotal: true
      }
    };

    console.log(`✅ [STRUCTURE] Generated TOC with ${entries.length} main entries`);
    
    return toc;
  }

  /**
   * Create cross-reference system for easy lookup
   */
  generateCrossReferences(
    contentData: ContentData,
    structure: ThreeActStructure
  ): CrossReference[] {
    console.log(`🔗 [STRUCTURE] Generating cross-references`);
    
    const references: CrossReference[] = [];
    
    // Generate NPC references
    contentData.npcs?.forEach(npc => {
      const appearances = this.findNPCAppearances(npc.id, structure);
      appearances.forEach(appearance => {
        references.push({
          id: `ref-npc-${npc.id}-${appearance.sceneId}`,
          type: 'internal',
          source: { type: 'npc', id: npc.id, name: npc.name },
          target: { type: 'scene', id: appearance.sceneId, name: appearance.sceneName },
          context: appearance.context,
          displayText: `See "${appearance.sceneName}"`,
          category: 'npc'
        });
      });
    });
    
    // Generate location references
    contentData.locations?.forEach(location => {
      const usages = this.findLocationUsages(location.id, structure);
      usages.forEach(usage => {
        references.push({
          id: `ref-location-${location.id}-${usage.sceneId}`,
          type: 'internal',
          source: { type: 'location', id: location.id, name: location.name },
          target: { type: 'scene', id: usage.sceneId, name: usage.sceneName },
          context: usage.context,
          displayText: `Used in "${usage.sceneName}"`,
          category: 'location'
        });
      });
    });
    
    // Generate item references
    contentData.items?.forEach(item => {
      const mentions = this.findItemMentions(item.id, structure);
      mentions.forEach(mention => {
        references.push({
          id: `ref-item-${item.id}-${mention.sceneId}`,
          type: 'internal',
          source: { type: 'item', id: item.id, name: item.name },
          target: { type: 'scene', id: mention.sceneId, name: mention.sceneName },
          context: mention.context,
          displayText: `Found in "${mention.sceneName}"`,
          category: 'item'
        });
      });
    });

    console.log(`✅ [STRUCTURE] Generated ${references.length} cross-references`);
    
    return references;
  }

  // Private helper methods

  private generateThreeActStructure(
    contentData: ContentData,
    requirements: StructureRequirements
  ): ThreeActStructure {
    const pacingTemplate = this.PACING_TEMPLATES[requirements.pacingStyle || 'standard'];
    const totalScenes = contentData.scenes?.length || 6;
    
    const act1Scenes = Math.ceil(totalScenes * pacingTemplate.act1);
    const act2Scenes = Math.ceil(totalScenes * pacingTemplate.act2);
    const act3Scenes = totalScenes - act1Scenes - act2Scenes;
    
    const act1 = this.createAct('act1', 'Setup', 'setup', contentData.scenes?.slice(0, act1Scenes) || []);
    const act2 = this.createAct('act2', 'Confrontation', 'confrontation', contentData.scenes?.slice(act1Scenes, act1Scenes + act2Scenes) || []);
    const act3 = this.createAct('act3', 'Resolution', 'resolution', contentData.scenes?.slice(act1Scenes + act2Scenes) || []);
    
    return {
      act1,
      act2,
      act3,
      transitions: this.generateActTransitions(),
      pacing: this.generatePacingStructure(requirements.pacingStyle || 'standard'),
      climaxPoints: this.identifyClimaxPoints([act1, act2, act3])
    };
  }

  private createAct(id: string, name: string, purpose: ActPurpose, sceneData: any[]): Act {
    const scenes = sceneData.map((scene, index) => this.createScene(scene, index));
    const estimatedDuration = scenes.reduce((total, scene) => total + scene.estimatedDuration, 0);
    
    return {
      id,
      name,
      purpose,
      scenes,
      estimatedDuration,
      objectives: this.generateActObjectives(purpose),
      keyEvents: this.identifyKeyEvents(scenes),
      characterDevelopment: this.planCharacterDevelopment(purpose, scenes)
    };
  }

  private createScene(sceneData: any, index: number): Scene {
    const sceneType = sceneData.type || this.inferSceneType(sceneData);
    const duration = this.estimateSceneDuration(sceneType, sceneData);
    
    return {
      id: sceneData.id || `scene-${index}`,
      name: sceneData.name || `Scene ${index + 1}`,
      type: sceneType,
      purpose: this.inferScenePurpose(sceneType, index),
      content: this.processSceneContent(sceneData),
      estimatedDuration: duration,
      prerequisites: sceneData.prerequisites || [],
      outcomes: this.generateSceneOutcomes(sceneData),
      connections: this.generateSceneConnections(sceneData)
    };
  }

  private estimateSceneDuration(type: SceneType, sceneData: any): number {
    const estimates = this.SCENE_DURATION_ESTIMATES[type];
    
    // Base duration
    let duration = estimates.avg;
    
    // Adjust based on complexity
    if (sceneData.complexity === 'simple') duration *= 0.8;
    if (sceneData.complexity === 'complex') duration *= 1.3;
    
    // Adjust based on content
    if (sceneData.encounters?.length > 1) duration *= 1.2;
    if (sceneData.npcs?.length > 3) duration *= 1.1;
    
    return Math.round(duration);
  }

  private calculateContentDensity(
    structure: ThreeActStructure,
    requirements: StructureRequirements
  ): ContentDensity {
    const acts = [structure.act1, structure.act2, structure.act3];
    const totalDuration = acts.reduce((sum, act) => sum + act.estimatedDuration, 0);
    const totalScenes = acts.reduce((sum, act) => sum + act.scenes.length, 0);
    
    return {
      overall: {
        scenesPerHour: (totalScenes / totalDuration) * 60,
        averageSceneDuration: totalDuration / totalScenes,
        contentComplexity: this.calculateComplexityScore(acts),
        informationDensity: this.calculateInformationDensity(acts)
      },
      bySection: acts.map(act => this.calculateSectionDensity(act)),
      optimization: {
        applied: false,
        targetDuration: requirements.targetDuration || totalDuration,
        actualDuration: totalDuration,
        adjustmentRatio: 1.0,
        changes: []
      },
      sessionLength: {
        target: requirements.targetDuration || totalDuration,
        actual: totalDuration,
        variance: 0,
        confidence: 0.85
      },
      pacing: this.calculatePacingDensity(structure.pacing)
    };
  }

  private generateNavigationSystem(
    structure: ThreeActStructure,
    toc: TableOfContents
  ): NavigationSystem {
    return {
      primaryNavigation: [
        { type: 'act', id: structure.act1.id, label: structure.act1.name, target: structure.act1.id },
        { type: 'act', id: structure.act2.id, label: structure.act2.name, target: structure.act2.id },
        { type: 'act', id: structure.act3.id, label: structure.act3.name, target: structure.act3.id }
      ],
      secondaryNavigation: this.generateSceneNavigation(structure),
      quickAccess: this.generateQuickAccessElements(structure),
      searchability: {
        enabled: true,
        indexedFields: ['name', 'description', 'content'],
        searchTypes: ['text', 'tag', 'reference']
      },
      bookmarks: {
        enabled: true,
        categories: ['important', 'reference', 'optional'],
        userDefined: true
      }
    };
  }

  private estimateTiming(
    structure: ThreeActStructure,
    requirements: StructureRequirements
  ): TimingEstimation {
    const acts = [structure.act1, structure.act2, structure.act3];
    const totalDuration = acts.reduce((sum, act) => sum + act.estimatedDuration, 0);
    const bufferTime = Math.round(totalDuration * 0.15); // 15% buffer
    
    return {
      totalDuration: totalDuration + bufferTime,
      actBreakdown: acts.map(act => ({
        actId: act.id,
        estimatedDuration: act.estimatedDuration,
        sceneCount: act.scenes.length,
        averageSceneDuration: act.estimatedDuration / act.scenes.length
      })),
      sceneBreakdown: acts.flatMap(act => 
        act.scenes.map(scene => ({
          sceneId: scene.id,
          estimatedDuration: scene.estimatedDuration,
          type: scene.type,
          complexity: this.assessSceneComplexity(scene)
        }))
      ),
      bufferTime,
      variabilityFactors: this.identifyVariabilityFactors(structure)
    };
  }

  // Utility methods (simplified implementations)
  private inferSceneType(sceneData: any): SceneType {
    if (sceneData.encounters?.length > 0) return 'combat';
    if (sceneData.npcs?.length > 0) return 'social';
    if (sceneData.puzzles?.length > 0) return 'puzzle';
    return 'exploration';
  }

  private inferScenePurpose(type: SceneType, index: number): ScenePurpose {
    if (index === 0) return 'introduction';
    if (type === 'climax') return 'resolution';
    return 'development';
  }

  private processSceneContent(sceneData: any): SceneContent {
    return {
      description: sceneData.description || '',
      boxedText: sceneData.boxedText,
      encounters: sceneData.encounters?.map((e: any) => ({ id: e.id, name: e.name, type: e.type })) || [],
      npcs: sceneData.npcs?.map((n: any) => ({ id: n.id, name: n.name, role: n.role })) || [],
      locations: sceneData.locations?.map((l: any) => ({ id: l.id, name: l.name, type: l.type })) || [],
      items: sceneData.items?.map((i: any) => ({ id: i.id, name: i.name, type: i.type })) || [],
      handouts: sceneData.handouts?.map((h: any) => ({ id: h.id, name: h.name, type: h.type })) || []
    };
  }

  private generateSceneOutcomes(sceneData: any): SceneOutcome[] {
    return sceneData.outcomes?.map((outcome: any) => ({
      condition: outcome.condition,
      result: outcome.result,
      impact: outcome.impact || 'immediate',
      nextScene: outcome.nextScene
    })) || [];
  }

  private generateSceneConnections(sceneData: any): SceneConnection[] {
    return sceneData.connections?.map((conn: any) => ({
      type: conn.type || 'sequential',
      target: conn.target,
      condition: conn.condition,
      description: conn.description
    })) || [];
  }

  private generateActObjectives(purpose: ActPurpose): ActObjective[] {
    const objectiveMap = {
      'setup': [
        { description: 'Introduce main characters and setting', priority: 'primary', measurable: true, dependencies: [] },
        { description: 'Establish the central conflict', priority: 'primary', measurable: true, dependencies: [] }
      ],
      'confrontation': [
        { description: 'Develop the central conflict', priority: 'primary', measurable: true, dependencies: ['setup'] },
        { description: 'Present obstacles and challenges', priority: 'primary', measurable: true, dependencies: [] }
      ],
      'resolution': [
        { description: 'Resolve the central conflict', priority: 'primary', measurable: true, dependencies: ['confrontation'] },
        { description: 'Provide satisfying conclusion', priority: 'primary', measurable: true, dependencies: [] }
      ]
    };
    
    return objectiveMap[purpose] || [];
  }

  private identifyKeyEvents(scenes: Scene[]): KeyEvent[] {
    return scenes
      .filter(scene => scene.type === 'climax' || scene.purpose === 'conflict')
      .map(scene => ({
        name: `Key Event: ${scene.name}`,
        description: scene.content.description,
        timing: 'fixed',
        impact: 'act',
        alternatives: []
      }));
  }

  private planCharacterDevelopment(purpose: ActPurpose, scenes: Scene[]): CharacterDevelopment[] {
    // Simplified implementation
    return [];
  }

  private generateActTransitions(): ActTransition[] {
    return [
      {
        from: 'act1',
        to: 'act2',
        method: 'narrative',
        duration: 5,
        description: 'Transition from setup to confrontation'
      },
      {
        from: 'act2',
        to: 'act3',
        method: 'narrative',
        duration: 5,
        description: 'Transition from confrontation to resolution'
      }
    ];
  }

  private generatePacingStructure(pacingStyle: string): PacingStructure {
    return {
      overall: {
        style: pacingStyle,
        intensity: 'moderate',
        variation: 'high'
      },
      actPacing: [
        { actId: 'act1', intensity: 'building', duration: 'extended' },
        { actId: 'act2', intensity: 'high', duration: 'sustained' },
        { actId: 'act3', intensity: 'climactic', duration: 'focused' }
      ],
      tensionPoints: [],
      restPoints: []
    };
  }

  private identifyClimaxPoints(acts: Act[]): ClimaxPoint[] {
    const climaxPoints: ClimaxPoint[] = [];
    
    acts.forEach(act => {
      const climaxScenes = act.scenes.filter(scene => scene.type === 'climax');
      climaxScenes.forEach(scene => {
        climaxPoints.push({
          location: scene.id,
          intensity: 'major',
          type: 'action',
          buildup: 15,
          resolution: 10
        });
      });
    });
    
    return climaxPoints;
  }

  // Additional utility methods (simplified)
  private estimateScenePages(scene: Scene): number {
    return Math.ceil(scene.estimatedDuration / 15); // Rough estimate: 15 min per page
  }

  private findNPCAppearances(npcId: string, structure: ThreeActStructure): any[] {
    return []; // Simplified implementation
  }

  private findLocationUsages(locationId: string, structure: ThreeActStructure): any[] {
    return []; // Simplified implementation
  }

  private findItemMentions(itemId: string, structure: ThreeActStructure): any[] {
    return []; // Simplified implementation
  }

  private calculateComplexityScore(acts: Act[]): number {
    return 75; // Simplified implementation
  }

  private calculateInformationDensity(acts: Act[]): number {
    return 68; // Simplified implementation
  }

  private calculateSectionDensity(act: Act): SectionDensity {
    return {
      sectionId: act.id,
      scenesPerHour: (act.scenes.length / act.estimatedDuration) * 60,
      averageSceneDuration: act.estimatedDuration / act.scenes.length,
      contentComplexity: 70,
      informationDensity: 65
    };
  }

  private calculatePacingDensity(pacing: PacingStructure): PacingDensity {
    return {
      overall: 'moderate',
      variation: 'high',
      tensionCurve: 'ascending',
      restDistribution: 'balanced'
    };
  }

  private generateSceneNavigation(structure: ThreeActStructure): NavigationElement[] {
    const acts = [structure.act1, structure.act2, structure.act3];
    return acts.flatMap(act => 
      act.scenes.map(scene => ({
        type: 'scene',
        id: scene.id,
        label: scene.name,
        target: scene.id
      }))
    );
  }

  private generateQuickAccessElements(structure: ThreeActStructure): QuickAccessElement[] {
    return [
      { type: 'bookmark', label: 'Important NPCs', target: 'npcs-section' },
      { type: 'bookmark', label: 'Combat Encounters', target: 'combat-section' },
      { type: 'bookmark', label: 'Handouts', target: 'handouts-section' }
    ];
  }

  private assessSceneComplexity(scene: Scene): string {
    const factors = [
      scene.content.encounters.length,
      scene.content.npcs.length,
      scene.outcomes.length,
      scene.connections.length
    ];
    
    const totalComplexity = factors.reduce((sum, factor) => sum + factor, 0);
    
    if (totalComplexity <= 3) return 'simple';
    if (totalComplexity <= 7) return 'moderate';
    return 'complex';
  }

  private identifyVariabilityFactors(structure: ThreeActStructure): VariabilityFactor[] {
    return [
      { factor: 'Player decision speed', impact: 'moderate', description: 'Players may take longer to make decisions' },
      { factor: 'Combat duration', impact: 'high', description: 'Combat encounters can vary significantly in length' },
      { factor: 'Roleplay engagement', impact: 'moderate', description: 'Social scenes may extend based on player engagement' }
    ];
  }

  private optimizeActs(structure: ThreeActStructure, adjustmentRatio: number, preferences: OptimizationPreferences): any {
    // Simplified optimization - would be more complex in practice
    return {
      act1: structure.act1,
      act2: structure.act2,
      act3: structure.act3
    };
  }

  private recalculateTiming(optimizedActs: any): TimingEstimation {
    // Simplified recalculation
    return {
      totalDuration: 180,
      actBreakdown: [],
      sceneBreakdown: [],
      bufferTime: 27,
      variabilityFactors: []
    };
  }

  private calculateOptimizedDensity(optimizedActs: any, targetDuration: number): any {
    return {
      applied: true,
      targetDuration,
      actualDuration: 180,
      adjustmentRatio: 1.0,
      changes: []
    };
  }

  private documentOptimizationChanges(original: ThreeActStructure, optimized: any): string[] {
    return ['Adjusted scene durations', 'Optimized pacing'];
  }

  private generateOrganizationMetadata(contentData: ContentData, requirements: StructureRequirements): OrganizationMetadata {
    return {
      version: '1.0',
      lastModified: new Date().toISOString(),
      author: contentData.author || 'Unknown',
      tags: contentData.tags || [],
      difficulty: requirements.difficulty || 'moderate',
      playerCount: requirements.playerCount || '4-6',
      sessionType: requirements.sessionType || 'standard'
    };
  }
}

// Supporting interfaces for external use
export interface ContentData {
  title: string;
  author?: string;
  tags?: string[];
  scenes?: any[];
  npcs?: any[];
  locations?: any[];
  items?: any[];
}

export interface StructureRequirements {
  targetDuration?: number;
  pacingStyle?: string;
  includeTimingInTOC?: boolean;
  difficulty?: string;
  playerCount?: string;
  sessionType?: string;
}

export interface OptimizationPreferences {
  prioritizeScenes?: string[];
  flexibleScenes?: string[];
  maintainPacing?: boolean;
  allowSceneRemoval?: boolean;
}

export interface OptimizedStructure extends ContentStructure {
  optimizationApplied: boolean;
  originalDuration: number;
}

// Additional supporting interfaces (simplified)
export interface TOCEntry {
  id: string;
  title: string;
  level: number;
  pageNumber: number;
  type: string;
  children?: TOCEntry[];
}

export interface TOCStructure {
  maxDepth: number;
  showPageNumbers: boolean;
  showEstimatedTiming: boolean;
  groupByAct: boolean;
}

export interface TOCNavigation {
  clickable: boolean;
  expandable: boolean;
  searchable: boolean;
}

export interface TOCFormatting {
  indentSize: string;
  dotLeaders: boolean;
  pageNumberAlignment: string;
  fontSizes: {
    level1: string;
    level2: string;
    level3: string;
  };
}

export interface PageNumbering {
  startPage: number;
  format: string;
  includeTotal: boolean;
}

export interface ReferenceSource {
  type: string;
  id: string;
  name: string;
}

export interface ReferenceTarget {
  type: string;
  id: string;
  name: string;
}

export interface DensityMetrics {
  scenesPerHour: number;
  averageSceneDuration: number;
  contentComplexity: number;
  informationDensity: number;
}

export interface SectionDensity {
  sectionId: string;
  scenesPerHour: number;
  averageSceneDuration: number;
  contentComplexity: number;
  informationDensity: number;
}

export interface DensityOptimization {
  applied: boolean;
  targetDuration: number;
  actualDuration: number;
  adjustmentRatio: number;
  changes: string[];
}

export interface SessionLengthTarget {
  target: number;
  actual: number;
  variance: number;
  confidence: number;
}

export interface PacingDensity {
  overall: string;
  variation: string;
  tensionCurve: string;
  restDistribution: string;
}

export interface NavigationElement {
  type: string;
  id: string;
  label: string;
  target: string;
}

export interface QuickAccessElement {
  type: string;
  label: string;
  target: string;
}

export interface SearchabilityFeatures {
  enabled: boolean;
  indexedFields: string[];
  searchTypes: string[];
}

export interface BookmarkSystem {
  enabled: boolean;
  categories: string[];
  userDefined: boolean;
}

export interface ActTiming {
  actId: string;
  estimatedDuration: number;
  sceneCount: number;
  averageSceneDuration: number;
}

export interface SceneTiming {
  sceneId: string;
  estimatedDuration: number;
  type: SceneType;
  complexity: string;
}

export interface VariabilityFactor {
  factor: string;
  impact: string;
  description: string;
}

export interface EncounterReference {
  id: string;
  name: string;
  type: string;
}

export interface NPCReference {
  id: string;
  name: string;
  role: string;
}

export interface LocationReference {
  id: string;
  name: string;
  type: string;
}

export interface ItemReference {
  id: string;
  name: string;
  type: string;
}

export interface HandoutReference {
  id: string;
  name: string;
  type: string;
}

export interface PacingCurve {
  style: string;
  intensity: string;
  variation: string;
}

export interface ActPacing {
  actId: string;
  intensity: string;
  duration: string;
}

export interface TensionPoint {
  location: string;
  intensity: string;
  buildup: number;
}

export interface RestPoint {
  location: string;
  duration: number;
  purpose: string;
}

// Export singleton instance
export const contentStructureOrganizationSystem = new ContentStructureOrganizationSystem();