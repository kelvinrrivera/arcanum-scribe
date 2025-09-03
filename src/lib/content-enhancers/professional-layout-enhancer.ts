/**
 * Professional Layout and Typography Enhancement
 * 
 * Applies professional layout, typography, and formatting standards
 * to generated adventure content for publication-ready presentation.
 */

export interface LayoutConfiguration {
  pageSize: 'A4' | 'Letter' | 'Legal';
  margins: { top: number; right: number; bottom: number; left: number };
  columns: 1 | 2 | 3;
  typography: TypographySettings;
  colorScheme: ColorScheme;
  branding: BrandingSettings;
}

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  codeFont: string;
  baseFontSize: number;
  lineHeight: number;
  headingScale: number[];
  paragraphSpacing: number;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface BrandingSettings {
  logo?: string;
  watermark?: string;
  headerText?: string;
  footerText?: string;
  showPageNumbers: boolean;
}

export interface LayoutElement {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'image' | 'callout' | 'sidebar';
  content: string;
  level?: number;
  styling: ElementStyling;
  metadata?: { [key: string]: any };
}

export interface ElementStyling {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'light';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  backgroundColor?: string;
  padding?: number;
  margin?: number;
  border?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface ProfessionalLayoutResult {
  layoutElements: LayoutElement[];
  configuration: LayoutConfiguration;
  pageCount: number;
  wordCount: number;
  readabilityScore: number;
  professionalGrade: string;
  layoutComplexity: number;
}

export class ProfessionalLayoutEnhancer {
  private readonly DEFAULT_CONFIG: LayoutConfiguration = {
    pageSize: 'A4',
    margins: { top: 25, right: 20, bottom: 25, left: 20 },
    columns: 1,
    typography: {
      headingFont: 'Cinzel, serif',
      bodyFont: 'Crimson Text, serif',
      codeFont: 'Source Code Pro, monospace',
      baseFontSize: 11,
      lineHeight: 1.6,
      headingScale: [2.5, 2.0, 1.5, 1.25, 1.1],
      paragraphSpacing: 12
    },
    colorScheme: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#CD853F',
      background: '#FFF8DC',
      text: '#2F1B14',
      muted: '#8B7355'
    },
    branding: {
      headerText: 'Adventure Module',
      footerText: 'Generated with Professional Mode',
      showPageNumbers: true
    }
  };

  /**
   * Apply professional layout and typography to adventure content
   */
  async enhanceLayout(
    adventureContent: any,
    customConfig?: Partial<LayoutConfiguration>
  ): Promise<ProfessionalLayoutResult> {
    console.log('📐 [LAYOUT-ENHANCER] Applying professional layout...');

    try {
      const config = this.mergeConfiguration(customConfig);
      const layoutElements = await this.processContent(adventureContent, config);
      const analysis = this.analyzeLayout(layoutElements, config);
      
      console.log(`✅ [LAYOUT-ENHANCER] Layout applied - ${analysis.pageCount} pages, readability: ${Math.round(analysis.readabilityScore)}/100`);
      
      return {
        layoutElements,
        configuration: config,
        ...analysis
      };

    } catch (error) {
      console.error('❌ [LAYOUT-ENHANCER] Layout enhancement failed:', error);
      throw error;
    }
  }

  /**
   * Process adventure content into layout elements
   */
  private async processContent(content: any, config: LayoutConfiguration): Promise<LayoutElement[]> {
    const elements: LayoutElement[] = [];
    
    // Process title
    if (content.title) {
      elements.push(this.createTitleElement(content.title, config));
    }

    // Process introduction
    if (content.introduction) {
      elements.push(this.createIntroductionElement(content.introduction, config));
    }

    // Process main content sections
    if (content.sections) {
      for (const section of content.sections) {
        elements.push(...this.processSectionContent(section, config));
      }
    }

    // Process NPCs
    if (content.npcs) {
      elements.push(...this.processNPCContent(content.npcs, config));
    }

    // Process combat encounters
    if (content.encounters) {
      elements.push(...this.processCombatContent(content.encounters, config));
    }

    // Process puzzles
    if (content.puzzles) {
      elements.push(...this.processPuzzleContent(content.puzzles, config));
    }

    // Add professional callouts and sidebars
    elements.push(...this.addProfessionalElements(content, config));

    return elements;
  }

  private createTitleElement(title: string, config: LayoutConfiguration): LayoutElement {
    return {
      type: 'heading',
      content: title,
      level: 1,
      styling: {
        fontSize: config.typography.baseFontSize * config.typography.headingScale[0],
        fontWeight: 'bold',
        color: config.colorScheme.primary,
        alignment: 'center',
        margin: 24
      }
    };
  }

  private createIntroductionElement(introduction: string, config: LayoutConfiguration): LayoutElement {
    return {
      type: 'callout',
      content: introduction,
      styling: {
        fontSize: config.typography.baseFontSize * 1.1,
        fontStyle: 'italic',
        backgroundColor: config.colorScheme.background,
        border: `2px solid ${config.colorScheme.accent}`,
        padding: 16,
        margin: 16
      }
    };
  }

  private processSectionContent(section: any, config: LayoutConfiguration): LayoutElement[] {
    const elements: LayoutElement[] = [];

    // Section heading
    elements.push({
      type: 'heading',
      content: section.title || 'Section',
      level: 2,
      styling: {
        fontSize: config.typography.baseFontSize * config.typography.headingScale[1],
        fontWeight: 'bold',
        color: config.colorScheme.primary,
        margin: 18
      }
    });

    // Section content
    if (section.content) {
      const paragraphs = this.splitIntoParagraphs(section.content);
      paragraphs.forEach(paragraph => {
        elements.push({
          type: 'paragraph',
          content: paragraph,
          styling: {
            fontSize: config.typography.baseFontSize,
            lineHeight: config.typography.lineHeight,
            color: config.colorScheme.text,
            margin: config.typography.paragraphSpacing,
            alignment: 'justify'
          }
        });
      });
    }

    return elements;
  }

  private processNPCContent(npcs: any[], config: LayoutConfiguration): LayoutElement[] {
    const elements: LayoutElement[] = [];

    elements.push({
      type: 'heading',
      content: 'Notable Characters',
      level: 2,
      styling: {
        fontSize: config.typography.baseFontSize * config.typography.headingScale[1],
        fontWeight: 'bold',
        color: config.colorScheme.primary,
        margin: 18
      }
    });

    npcs.forEach(npc => {
      // NPC name as subheading
      elements.push({
        type: 'heading',
        content: npc.name,
        level: 3,
        styling: {
          fontSize: config.typography.baseFontSize * config.typography.headingScale[2],
          fontWeight: 'bold',
          color: config.colorScheme.secondary,
          margin: 14
        }
      });

      // NPC description
      elements.push({
        type: 'paragraph',
        content: npc.description,
        styling: {
          fontSize: config.typography.baseFontSize,
          color: config.colorScheme.text,
          margin: config.typography.paragraphSpacing
        }
      });

      // NPC stats sidebar
      if (npc.stats) {
        elements.push({
          type: 'sidebar',
          content: this.formatNPCStats(npc.stats),
          styling: {
            fontSize: config.typography.baseFontSize * 0.9,
            backgroundColor: config.colorScheme.muted + '20',
            border: `1px solid ${config.colorScheme.muted}`,
            padding: 12,
            margin: 8
          }
        });
      }
    });

    return elements;
  }

  private processCombatContent(encounters: any[], config: LayoutConfiguration): LayoutElement[] {
    const elements: LayoutElement[] = [];

    elements.push({
      type: 'heading',
      content: 'Combat Encounters',
      level: 2,
      styling: {
        fontSize: config.typography.baseFontSize * config.typography.headingScale[1],
        fontWeight: 'bold',
        color: config.colorScheme.primary,
        margin: 18
      }
    });

    encounters.forEach((encounter, index) => {
      // Encounter name
      elements.push({
        type: 'heading',
        content: `${index + 1}. ${encounter.name}`,
        level: 3,
        styling: {
          fontSize: config.typography.baseFontSize * config.typography.headingScale[2],
          fontWeight: 'bold',
          color: config.colorScheme.secondary,
          margin: 14
        }
      });

      // Encounter description
      elements.push({
        type: 'paragraph',
        content: encounter.description,
        styling: {
          fontSize: config.typography.baseFontSize,
          color: config.colorScheme.text,
          margin: config.typography.paragraphSpacing
        }
      });

      // Tactical elements callout
      if (encounter.tacticalElements && encounter.tacticalElements.length > 0) {
        elements.push({
          type: 'callout',
          content: `Tactical Considerations: ${encounter.tacticalElements.map((t: any) => t.name).join(', ')}`,
          styling: {
            fontSize: config.typography.baseFontSize * 0.95,
            backgroundColor: config.colorScheme.accent + '20',
            border: `1px solid ${config.colorScheme.accent}`,
            padding: 10,
            margin: 8,
            fontStyle: 'italic'
          }
        });
      }
    });

    return elements;
  }

  private processPuzzleContent(puzzles: any[], config: LayoutConfiguration): LayoutElement[] {
    const elements: LayoutElement[] = [];

    elements.push({
      type: 'heading',
      content: 'Puzzles & Challenges',
      level: 2,
      styling: {
        fontSize: config.typography.baseFontSize * config.typography.headingScale[1],
        fontWeight: 'bold',
        color: config.colorScheme.primary,
        margin: 18
      }
    });

    puzzles.forEach((puzzle: any, index: number) => {
      // Puzzle name
      elements.push({
        type: 'heading',
        content: `Puzzle ${index + 1}: ${puzzle.type}`,
        level: 3,
        styling: {
          fontSize: config.typography.baseFontSize * config.typography.headingScale[2],
          fontWeight: 'bold',
          color: config.colorScheme.secondary,
          margin: 14
        }
      });

      // Puzzle description
      elements.push({
        type: 'paragraph',
        content: puzzle.description,
        styling: {
          fontSize: config.typography.baseFontSize,
          color: config.colorScheme.text,
          margin: config.typography.paragraphSpacing
        }
      });

      // Solutions sidebar
      if (puzzle.solutions && puzzle.solutions.length > 0) {
        const solutionText = puzzle.solutions.map((s: any, i: number) => 
          `Solution ${i + 1}: ${s.approach} - ${s.description}`
        ).join('\n\n');

        elements.push({
          type: 'sidebar',
          content: `Multiple Solutions Available:\n\n${solutionText}`,
          styling: {
            fontSize: config.typography.baseFontSize * 0.9,
            backgroundColor: config.colorScheme.secondary + '15',
            border: `1px solid ${config.colorScheme.secondary}`,
            padding: 12,
            margin: 8
          }
        });
      }
    });

    return elements;
  }

  private addProfessionalElements(content: any, config: LayoutConfiguration): LayoutElement[] {
    const elements: LayoutElement[] = [];

    // Add design notes callout
    elements.push({
      type: 'callout',
      content: 'Design Notes: This adventure has been enhanced with professional features including multi-solution puzzles, tactical combat encounters, and detailed NPCs to provide a rich, engaging experience.',
      styling: {
        fontSize: config.typography.baseFontSize * 0.9,
        backgroundColor: config.colorScheme.primary + '10',
        border: `1px dashed ${config.colorScheme.primary}`,
        padding: 12,
        margin: 16,
        fontStyle: 'italic'
      }
    });

    // Add accessibility note
    elements.push({
      type: 'sidebar',
      content: 'Accessibility Features: This adventure includes multiple solution paths for puzzles, clear tactical guidance for combat, and detailed NPC information to accommodate different play styles and accessibility needs.',
      styling: {
        fontSize: config.typography.baseFontSize * 0.85,
        backgroundColor: config.colorScheme.muted + '15',
        border: `1px solid ${config.colorScheme.muted}`,
        padding: 10,
        margin: 12
      }
    });

    return elements;
  }

  private formatNPCStats(stats: any): string {
    let formatted = `Level: ${stats.level}\n`;
    formatted += `Primary Ability: ${stats.primaryAbility}\n`;
    
    if (stats.skills && Object.keys(stats.skills).length > 0) {
      formatted += `Skills: ${Object.entries(stats.skills).map(([skill, value]) => `${skill} +${value}`).join(', ')}\n`;
    }
    
    return formatted;
  }

  private splitIntoParagraphs(content: string): string[] {
    return content.split('\n\n').filter(p => p.trim().length > 0);
  }

  private mergeConfiguration(customConfig?: Partial<LayoutConfiguration>): LayoutConfiguration {
    if (!customConfig) return this.DEFAULT_CONFIG;

    return {
      ...this.DEFAULT_CONFIG,
      ...customConfig,
      typography: { ...this.DEFAULT_CONFIG.typography, ...customConfig.typography },
      colorScheme: { ...this.DEFAULT_CONFIG.colorScheme, ...customConfig.colorScheme },
      branding: { ...this.DEFAULT_CONFIG.branding, ...customConfig.branding }
    };
  }

  private analyzeLayout(elements: LayoutElement[], config: LayoutConfiguration) {
    const wordCount = elements.reduce((count, element) => {
      return count + element.content.split(' ').length;
    }, 0);

    // Estimate page count (rough calculation)
    const wordsPerPage = 250; // Conservative estimate for formatted content
    const pageCount = Math.ceil(wordCount / wordsPerPage);

    // Calculate readability score
    const readabilityScore = this.calculateReadabilityScore(elements, config);

    // Determine professional grade
    const professionalGrade = this.determineProfessionalGrade(readabilityScore, elements.length);

    // Calculate layout complexity
    const layoutComplexity = this.calculateLayoutComplexity(elements);

    return {
      pageCount,
      wordCount,
      readabilityScore,
      professionalGrade,
      layoutComplexity
    };
  }

  private calculateReadabilityScore(elements: LayoutElement[], config: LayoutConfiguration): number {
    let score = 70; // Base score

    // Typography quality
    if (config.typography.lineHeight >= 1.5) score += 10;
    if (config.typography.baseFontSize >= 11) score += 5;

    // Layout structure
    const headingCount = elements.filter(e => e.type === 'heading').length;
    const paragraphCount = elements.filter(e => e.type === 'paragraph').length;
    
    if (headingCount > 0 && paragraphCount > 0) {
      const headingRatio = headingCount / (headingCount + paragraphCount);
      if (headingRatio >= 0.1 && headingRatio <= 0.3) score += 10; // Good heading structure
    }

    // Professional elements
    const calloutCount = elements.filter(e => e.type === 'callout').length;
    const sidebarCount = elements.filter(e => e.type === 'sidebar').length;
    
    if (calloutCount > 0) score += 5;
    if (sidebarCount > 0) score += 5;

    return Math.min(100, score);
  }

  private determineProfessionalGrade(readabilityScore: number, elementCount: number): string {
    if (readabilityScore >= 95 && elementCount >= 10) return 'Publication-Ready';
    if (readabilityScore >= 85 && elementCount >= 8) return 'Premium';
    if (readabilityScore >= 75 && elementCount >= 5) return 'Professional';
    return 'Standard';
  }

  private calculateLayoutComplexity(elements: LayoutElement[]): number {
    const typeVariety = new Set(elements.map(e => e.type)).size;
    const stylingVariety = elements.reduce((count, element) => {
      return count + Object.keys(element.styling).length;
    }, 0) / elements.length;

    return Math.min(100, (typeVariety * 15) + (stylingVariety * 10));
  }
}

export const professionalLayoutEnhancer = new ProfessionalLayoutEnhancer();