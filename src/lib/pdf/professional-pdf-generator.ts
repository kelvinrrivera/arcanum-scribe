/**
 * Professional PDF Generation Integration
 * 
 * Enhanced PDF generation that handles professional enhancement data structures,
 * applies professional layout, and includes quality metrics display.
 */

import type { ProfessionalEnhancement } from '../professional-mode-manager';
import type { LayoutElement } from '../content-enhancers/professional-layout-enhancer';

export interface ProfessionalPDFOptions {
  includeQualityMetrics: boolean;
  includeProfessionalGrade: boolean;
  includeEnhancedFeatures: boolean;
  layoutStyle: 'standard' | 'professional' | 'premium' | 'publication';
  colorScheme: 'default' | 'professional' | 'fantasy' | 'modern';
  typography: 'readable' | 'elegant' | 'fantasy' | 'modern';
}

export interface PDFGenerationResult {
  success: boolean;
  pdfUrl?: string;
  pdfBuffer?: Buffer;
  metadata: {
    pageCount: number;
    wordCount: number;
    fileSize: number;
    generationTime: number;
    professionalGrade?: string;
    qualityScore?: number;
  };
  errors?: string[];
  warnings?: string[];
}

export class ProfessionalPDFGenerator {
  private readonly DEFAULT_OPTIONS: ProfessionalPDFOptions = {
    includeQualityMetrics: true,
    includeProfessionalGrade: true,
    includeEnhancedFeatures: true,
    layoutStyle: 'professional',
    colorScheme: 'professional',
    typography: 'elegant'
  };

  /**
   * Generate PDF with professional enhancements
   */
  async generateProfessionalPDF(
    adventure: any,
    professionalEnhancement?: ProfessionalEnhancement,
    options: Partial<ProfessionalPDFOptions> = {}
  ): Promise<PDFGenerationResult> {
    const startTime = Date.now();
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log('📄 [PDF-GEN] Starting professional PDF generation...');
    console.log(`🎨 [PDF-GEN] Layout: ${finalOptions.layoutStyle}, Typography: ${finalOptions.typography}`);

    try {
      // Prepare content for PDF generation
      const pdfContent = await this.preparePDFContent(adventure, professionalEnhancement, finalOptions);
      
      // Apply professional styling
      const styledContent = this.applyProfessionalStyling(pdfContent, finalOptions);
      
      // Generate the PDF
      const pdfResult = await this.generatePDF(styledContent, finalOptions);
      
      // Calculate metadata
      const metadata = this.calculatePDFMetadata(pdfResult, professionalEnhancement, startTime);
      
      console.log(`✅ [PDF-GEN] PDF generated successfully - ${metadata.pageCount} pages, ${metadata.fileSize} bytes`);
      
      return {
        success: true,
        pdfBuffer: pdfResult.buffer,
        pdfUrl: pdfResult.url,
        metadata
      };

    } catch (error) {
      console.error('❌ [PDF-GEN] PDF generation failed:', error);
      
      return {
        success: false,
        metadata: {
          pageCount: 0,
          wordCount: 0,
          fileSize: 0,
          generationTime: Date.now() - startTime
        },
        errors: [error instanceof Error ? error.message : 'Unknown PDF generation error']
      };
    }
  }

  /**
   * Prepare content for PDF generation
   */
  private async preparePDFContent(
    adventure: any,
    professionalEnhancement?: ProfessionalEnhancement,
    options: ProfessionalPDFOptions
  ): Promise<any> {
    const content = {
      title: adventure.title || 'Generated Adventure',
      sections: [],
      metadata: {},
      professionalFeatures: {}
    };

    // Add main adventure content
    if (adventure.introduction) {
      content.sections.push({
        type: 'introduction',
        title: 'Introduction',
        content: adventure.introduction
      });
    }

    if (adventure.sections) {
      content.sections.push(...adventure.sections.map((section: any) => ({
        type: 'section',
        title: section.title,
        content: section.content
      })));
    }

    // Add professional enhancements if available
    if (professionalEnhancement && options.includeEnhancedFeatures) {
      await this.addProfessionalContent(content, professionalEnhancement);
    }

    // Add quality metrics section
    if (professionalEnhancement && options.includeQualityMetrics) {
      this.addQualityMetricsSection(content, professionalEnhancement);
    }

    return content;
  }

  /**
   * Add professional content to PDF
   */
  private async addProfessionalContent(
    content: any,
    enhancement: ProfessionalEnhancement
  ): Promise<void> {
    // Add Enhanced NPCs
    if (enhancement.professionalFeatures.enhancedNPCs) {
      const npcs = enhancement.professionalFeatures.enhancedNPCs.npcs || [];
      if (npcs.length > 0) {
        content.sections.push({
          type: 'enhanced-npcs',
          title: 'Notable Characters',
          content: this.formatNPCsForPDF(npcs)
        });
      }
    }

    // Add Multi-Solution Puzzles
    if (enhancement.professionalFeatures.multiSolutionPuzzles) {
      const puzzles = enhancement.professionalFeatures.multiSolutionPuzzles.puzzles || [];
      if (puzzles.length > 0) {
        content.sections.push({
          type: 'puzzles',
          title: 'Puzzles & Challenges',
          content: this.formatPuzzlesForPDF(puzzles)
        });
      }
    }

    // Add Tactical Combat
    if (enhancement.professionalFeatures.tacticalCombat) {
      const encounters = enhancement.professionalFeatures.tacticalCombat.encounters || [];
      if (encounters.length > 0) {
        content.sections.push({
          type: 'combat',
          title: 'Combat Encounters',
          content: this.formatCombatForPDF(encounters)
        });
      }
    }

    // Add Professional Layout Elements
    if (enhancement.professionalFeatures.professionalLayout) {
      const layoutElements = enhancement.professionalFeatures.professionalLayout.layoutElements || [];
      content.professionalFeatures.layoutElements = layoutElements;
    }
  }

  /**
   * Format NPCs for PDF display
   */
  private formatNPCsForPDF(npcs: any[]): string {
    return npcs.map(npc => {
      let formatted = `**${npc.name}** (${npc.role})\n\n`;
      formatted += `${npc.description}\n\n`;
      
      if (npc.personality) {
        formatted += `*Personality Traits:* ${npc.personality.traits?.join(', ') || 'None'}\n`;
        formatted += `*Motivations:* ${npc.personality.motivations?.join(', ') || 'None'}\n\n`;
      }
      
      if (npc.stats) {
        formatted += `*Level:* ${npc.stats.level} | *Primary Ability:* ${npc.stats.primaryAbility}\n`;
        if (npc.stats.skills && Object.keys(npc.stats.skills).length > 0) {
          const skills = Object.entries(npc.stats.skills)
            .map(([skill, value]) => `${skill} +${value}`)
            .join(', ');
          formatted += `*Skills:* ${skills}\n`;
        }
        formatted += '\n';
      }
      
      if (npc.questPotential && npc.questPotential.length > 0) {
        formatted += `*Quest Hooks:*\n`;
        npc.questPotential.forEach((quest: string, index: number) => {
          formatted += `${index + 1}. ${quest}\n`;
        });
        formatted += '\n';
      }
      
      return formatted;
    }).join('\n---\n\n');
  }

  /**
   * Format puzzles for PDF display
   */
  private formatPuzzlesForPDF(puzzles: any[]): string {
    return puzzles.map((puzzle, index) => {
      let formatted = `**Puzzle ${index + 1}: ${puzzle.type}**\n\n`;
      formatted += `*Difficulty:* ${puzzle.difficulty}\n\n`;
      formatted += `${puzzle.description}\n\n`;
      
      if (puzzle.solutions && puzzle.solutions.length > 0) {
        formatted += `**Multiple Solutions:**\n\n`;
        puzzle.solutions.forEach((solution: any, sIndex: number) => {
          formatted += `*Solution ${sIndex + 1}: ${solution.approach}*\n`;
          formatted += `${solution.description}\n`;
          formatted += `Required Skills: ${solution.requiredSkills?.join(', ') || 'None'}\n`;
          formatted += `Time Required: ${solution.timeRequired}\n\n`;
        });
      }
      
      if (puzzle.hints && puzzle.hints.length > 0) {
        formatted += `**Hints:**\n`;
        puzzle.hints.forEach((hint: string, hIndex: number) => {
          formatted += `${hIndex + 1}. ${hint}\n`;
        });
        formatted += '\n';
      }
      
      return formatted;
    }).join('\n---\n\n');
  }

  /**
   * Format combat encounters for PDF display
   */
  private formatCombatForPDF(encounters: any[]): string {
    return encounters.map((encounter, index) => {
      let formatted = `**${index + 1}. ${encounter.name}**\n\n`;
      formatted += `*Difficulty:* ${encounter.difficulty} | *Duration:* ${encounter.estimatedDuration}\n\n`;
      formatted += `${encounter.description}\n\n`;
      
      if (encounter.enemies && encounter.enemies.length > 0) {
        formatted += `**Enemies:**\n`;
        encounter.enemies.forEach((enemy: any) => {
          formatted += `• ${enemy.name} (Level ${enemy.level})\n`;
          formatted += `  HP: ${enemy.hitPoints} | AC: ${enemy.armorClass}\n`;
          if (enemy.tactics && enemy.tactics.length > 0) {
            formatted += `  Tactics: ${enemy.tactics.join(', ')}\n`;
          }
        });
        formatted += '\n';
      }
      
      if (encounter.tacticalElements && encounter.tacticalElements.length > 0) {
        formatted += `**Tactical Considerations:**\n`;
        encounter.tacticalElements.forEach((element: any) => {
          formatted += `• **${element.name}:** ${element.description}\n`;
          formatted += `  Benefit: ${element.benefit}\n`;
          if (element.risk) {
            formatted += `  Risk: ${element.risk}\n`;
          }
        });
        formatted += '\n';
      }
      
      if (encounter.environment) {
        formatted += `**Environment:**\n`;
        formatted += `• Terrain: ${encounter.environment.terrain}\n`;
        formatted += `• Size: ${encounter.environment.size}\n`;
        formatted += `• Lighting: ${encounter.environment.lighting}\n`;
        
        if (encounter.environment.hazards && encounter.environment.hazards.length > 0) {
          formatted += `• Hazards: ${encounter.environment.hazards.map((h: any) => h.name).join(', ')}\n`;
        }
        formatted += '\n';
      }
      
      return formatted;
    }).join('\n---\n\n');
  }

  /**
   * Add quality metrics section to PDF
   */
  private addQualityMetricsSection(content: any, enhancement: ProfessionalEnhancement): void {
    const metrics = enhancement.qualityMetrics;
    
    let metricsContent = `**Professional Quality Analysis**\n\n`;
    metricsContent += `**Overall Grade:** ${enhancement.professionalGrade}\n`;
    metricsContent += `**Unicorn Score:** ${Math.round(enhancement.unicornScore)}/100\n\n`;
    
    metricsContent += `**Quality Breakdown:**\n`;
    metricsContent += `• Content Quality: ${Math.round(metrics.contentQuality)}/100\n`;
    metricsContent += `• Mechanical Accuracy: ${Math.round(metrics.mechanicalAccuracy)}/100\n`;
    metricsContent += `• Editorial Standards: ${Math.round(metrics.editorialStandards)}/100\n`;
    metricsContent += `• User Experience: ${Math.round(metrics.userExperience)}/100\n`;
    metricsContent += `• Professional Readiness: ${Math.round(metrics.professionalReadiness)}/100\n\n`;
    
    metricsContent += `**Processing Statistics:**\n`;
    metricsContent += `• Processing Time: ${enhancement.processingTime}ms\n`;
    metricsContent += `• Features Applied: ${enhancement.featuresApplied.length}\n`;
    metricsContent += `• Success Rate: ${Math.round(metrics.featuresSuccessRate)}%\n\n`;
    
    if (enhancement.featuresApplied.length > 0) {
      metricsContent += `**Applied Professional Features:**\n`;
      enhancement.featuresApplied.forEach(feature => {
        const displayName = feature.replace(/([A-Z])/g, ' $1').trim();
        metricsContent += `• ${displayName}\n`;
      });
    }

    content.sections.push({
      type: 'quality-metrics',
      title: 'Quality Metrics & Analysis',
      content: metricsContent
    });
  }

  /**
   * Apply professional styling to content
   */
  private applyProfessionalStyling(content: any, options: ProfessionalPDFOptions): any {
    const styledContent = { ...content };
    
    // Apply layout style
    styledContent.layoutConfig = this.getLayoutConfig(options.layoutStyle);
    
    // Apply color scheme
    styledContent.colorScheme = this.getColorScheme(options.colorScheme);
    
    // Apply typography
    styledContent.typography = this.getTypographyConfig(options.typography);
    
    return styledContent;
  }

  /**
   * Get layout configuration
   */
  private getLayoutConfig(style: string) {
    const configs = {
      standard: {
        pageSize: 'A4',
        margins: { top: 20, right: 15, bottom: 20, left: 15 },
        columns: 1,
        headerHeight: 30,
        footerHeight: 20
      },
      professional: {
        pageSize: 'A4',
        margins: { top: 25, right: 20, bottom: 25, left: 20 },
        columns: 1,
        headerHeight: 40,
        footerHeight: 25
      },
      premium: {
        pageSize: 'A4',
        margins: { top: 30, right: 25, bottom: 30, left: 25 },
        columns: 2,
        headerHeight: 50,
        footerHeight: 30
      },
      publication: {
        pageSize: 'A4',
        margins: { top: 35, right: 30, bottom: 35, left: 30 },
        columns: 2,
        headerHeight: 60,
        footerHeight: 35
      }
    };
    
    return configs[style as keyof typeof configs] || configs.professional;
  }

  /**
   * Get color scheme configuration
   */
  private getColorScheme(scheme: string) {
    const schemes = {
      default: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#333333',
        background: '#ffffff',
        text: '#000000'
      },
      professional: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
        background: '#ffffff',
        text: '#2c3e50'
      },
      fantasy: {
        primary: '#8b4513',
        secondary: '#d2691e',
        accent: '#cd853f',
        background: '#fff8dc',
        text: '#2f1b14'
      },
      modern: {
        primary: '#1a202c',
        secondary: '#2d3748',
        accent: '#4299e1',
        background: '#ffffff',
        text: '#1a202c'
      }
    };
    
    return schemes[scheme as keyof typeof schemes] || schemes.professional;
  }

  /**
   * Get typography configuration
   */
  private getTypographyConfig(typography: string) {
    const configs = {
      readable: {
        headingFont: 'Arial, sans-serif',
        bodyFont: 'Arial, sans-serif',
        codeFont: 'Courier New, monospace',
        baseFontSize: 11,
        lineHeight: 1.5,
        headingScale: [1.8, 1.5, 1.3, 1.1, 1.0]
      },
      elegant: {
        headingFont: 'Times New Roman, serif',
        bodyFont: 'Times New Roman, serif',
        codeFont: 'Courier New, monospace',
        baseFontSize: 11,
        lineHeight: 1.6,
        headingScale: [2.0, 1.7, 1.4, 1.2, 1.0]
      },
      fantasy: {
        headingFont: 'Cinzel, serif',
        bodyFont: 'Crimson Text, serif',
        codeFont: 'Source Code Pro, monospace',
        baseFontSize: 11,
        lineHeight: 1.6,
        headingScale: [2.2, 1.8, 1.5, 1.25, 1.1]
      },
      modern: {
        headingFont: 'Helvetica, sans-serif',
        bodyFont: 'Helvetica, sans-serif',
        codeFont: 'Monaco, monospace',
        baseFontSize: 10,
        lineHeight: 1.4,
        headingScale: [1.9, 1.6, 1.3, 1.1, 1.0]
      }
    };
    
    return configs[typography as keyof typeof configs] || configs.elegant;
  }

  /**
   * Generate the actual PDF
   */
  private async generatePDF(content: any, options: ProfessionalPDFOptions): Promise<{
    buffer: Buffer;
    url?: string;
  }> {
    // This would integrate with a PDF generation library like PDFKit, jsPDF, or Puppeteer
    // For now, we'll simulate the PDF generation
    
    console.log('📄 [PDF-GEN] Generating PDF with professional layout...');
    
    // Simulate PDF generation time
    // Use real PDF generation - delegate to server-side PDF generation
    throw new Error('PDF generation must be handled by the server-side API. Use /api/export/pdf endpoint instead.');
  }



  /**
   * Calculate PDF metadata
   */
  private calculatePDFMetadata(
    pdfResult: any,
    enhancement?: ProfessionalEnhancement,
    startTime: number = Date.now()
  ) {
    const wordCount = pdfResult.buffer.toString().split(/\s+/).length;
    const pageCount = Math.ceil(wordCount / 250); // Rough estimate
    
    return {
      pageCount,
      wordCount,
      fileSize: pdfResult.buffer.length,
      generationTime: Date.now() - startTime,
      professionalGrade: enhancement?.professionalGrade,
      qualityScore: enhancement ? Math.round(enhancement.qualityMetrics.overallScore) : undefined
    };
  }
}

export const professionalPDFGenerator = new ProfessionalPDFGenerator();