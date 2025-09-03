/**
 * Quality Regeneration System - Advanced Prompt System
 * 
 * This service implements automated regeneration triggers for substandard content,
 * quality threshold detection, and quality improvement feedback loops as specified
 * in the Advanced Prompt System requirements.
 */

import { ContentQualityValidator, ContentQualityMetrics, GeneratedContent, QualityAnalysisResult } from './content-quality-validator';
import { VisualQualityValidator, VisualQualityMetrics, GeneratedImage, VisualAnalysisResult } from './visual-quality-validator';
import { LLMService } from './llm-service';

// Regeneration system interfaces
export interface RegenerationTrigger {
  id: string;
  contentType: 'content' | 'image';
  triggerReason: RegenerationReason;
  originalContent: GeneratedContent | GeneratedImage;
  qualityMetrics: ContentQualityMetrics | VisualQualityMetrics;
  improvementTargets: string[];
  maxAttempts: number;
  currentAttempt: number;
  timestamp: Date;
}

export interface RegenerationResult {
  success: boolean;
  finalContent: GeneratedContent | GeneratedImage | null;
  finalMetrics: ContentQualityMetrics | VisualQualityMetrics | null;
  attemptsUsed: number;
  improvementAchieved: number; // Percentage improvement in overall score
  failureReasons?: string[];
}

export interface QualityImprovementFeedback {
  previousScore: number;
  currentScore: number;
  improvement: number;
  targetAreas: string[];
  successfulImprovements: string[];
  remainingIssues: string[];
  nextIterationGuidance: string[];
}

export type RegenerationReason = 
  | 'below_threshold'
  | 'narrative_coherence_low'
  | 'character_depth_insufficient'
  | 'plot_complexity_low'
  | 'thematic_inconsistency'
  | 'image_quality_poor'
  | 'visual_inconsistency'
  | 'professional_standard_unmet'
  | 'narrative_misalignment';

export interface RegenerationConfig {
  maxAttempts: number;
  qualityThreshold: number;
  visualQualityThreshold: number;
  improvementThreshold: number; // Minimum improvement required between attempts
  timeoutMs: number;
  enableAdaptivePrompts: boolean;
  enableQualityFeedbackLoop: boolean;
}

/**
 * Quality Regeneration System
 * Implements Requirements 5.4 and 5.5 from the Advanced Prompt System spec
 */
export class QualityRegenerationSystem {
  private contentValidator: ContentQualityValidator;
  private visualValidator: VisualQualityValidator;
  private llmService: LLMService;
  
  private config: RegenerationConfig = {
    maxAttempts: 3,
    qualityThreshold: 8.0,
    visualQualityThreshold: 8.0,
    improvementThreshold: 0.5, // Minimum 0.5 point improvement required
    timeoutMs: 300000, // 5 minutes total timeout
    enableAdaptivePrompts: true,
    enableQualityFeedbackLoop: true
  };

  private activeRegenerations = new Map<string, RegenerationTrigger>();

  constructor() {
    this.contentValidator = new ContentQualityValidator();
    this.visualValidator = new VisualQualityValidator();
    this.llmService = new LLMService();
    console.log('🔄 [REGENERATION-SYSTEM] Quality Regeneration System initialized');
  }

  /**
   * Validate content and trigger regeneration if needed
   * Implements Requirements 5.4, 5.5
   */
  async validateAndRegenerate(content: GeneratedContent): Promise<RegenerationResult> {
    console.log(`🔄 [REGENERATION-SYSTEM] Validating ${content.type} content...`);

    try {
      // Initial quality validation
      const initialAnalysis = await this.contentValidator.validateContent(content);
      
      if (!initialAnalysis.regenerationRequired) {
        console.log('✅ [REGENERATION-SYSTEM] Content passes quality validation');
        return {
          success: true,
          finalContent: content,
          finalMetrics: initialAnalysis.metrics,
          attemptsUsed: 0,
          improvementAchieved: 0
        };
      }

      // Create regeneration trigger
      const trigger = this.createRegenerationTrigger('content', content, initialAnalysis);
      
      // Execute regeneration process
      return await this.executeContentRegeneration(trigger);
    } catch (error) {
      console.error('❌ [REGENERATION-SYSTEM] Content validation and regeneration failed:', error);
      throw new Error(`Content regeneration failed: ${error.message}`);
    }
  }

  /**
   * Validate image and trigger regeneration if needed
   * Implements Requirements 5.4, 5.5
   */
  async validateAndRegenerateImage(image: GeneratedImage): Promise<RegenerationResult> {
    console.log(`🔄 [REGENERATION-SYSTEM] Validating ${image.context.contentType} image...`);

    try {
      // Initial visual quality validation
      const initialAnalysis = await this.visualValidator.validateImage(image);
      
      if (!initialAnalysis.regenerationRequired) {
        console.log('✅ [REGENERATION-SYSTEM] Image passes quality validation');
        return {
          success: true,
          finalContent: image,
          finalMetrics: initialAnalysis.metrics,
          attemptsUsed: 0,
          improvementAchieved: 0
        };
      }

      // Create regeneration trigger
      const trigger = this.createRegenerationTrigger('image', image, initialAnalysis);
      
      // Execute regeneration process
      return await this.executeImageRegeneration(trigger);
    } catch (error) {
      console.error('❌ [REGENERATION-SYSTEM] Image validation and regeneration failed:', error);
      throw new Error(`Image regeneration failed: ${error.message}`);
    }
  }

  /**
   * Execute content regeneration process
   */
  private async executeContentRegeneration(trigger: RegenerationTrigger): Promise<RegenerationResult> {
    console.log(`🔄 [REGENERATION-SYSTEM] Starting content regeneration (${trigger.triggerReason})`);
    
    const startTime = Date.now();
    let bestContent = trigger.originalContent as GeneratedContent;
    let bestMetrics = trigger.qualityMetrics as ContentQualityMetrics;
    let bestScore = bestMetrics.overallScore;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      // Check timeout
      if (Date.now() - startTime > this.config.timeoutMs) {
        console.warn('⏰ [REGENERATION-SYSTEM] Regeneration timeout reached');
        break;
      }

      console.log(`🔄 [REGENERATION-SYSTEM] Regeneration attempt ${attempt}/${this.config.maxAttempts}`);
      
      try {
        // Generate improved content
        const improvedContent = await this.generateImprovedContent(
          bestContent, 
          trigger.improvementTargets,
          attempt
        );

        // Validate improved content
        const analysis = await this.contentValidator.validateContent(improvedContent);
        
        // Check for improvement
        const improvement = analysis.metrics.overallScore - bestScore;
        console.log(`📊 [REGENERATION-SYSTEM] Score improvement: ${improvement.toFixed(2)} points`);

        if (analysis.metrics.overallScore > bestScore) {
          bestContent = improvedContent;
          bestMetrics = analysis.metrics;
          bestScore = analysis.metrics.overallScore;
          
          // Update improvement targets based on feedback
          trigger.improvementTargets = analysis.improvementSuggestions;
        }

        // Check if quality threshold is met
        if (analysis.metrics.overallScore >= this.config.qualityThreshold) {
          console.log('✅ [REGENERATION-SYSTEM] Quality threshold achieved');
          return {
            success: true,
            finalContent: improvedContent,
            finalMetrics: analysis.metrics,
            attemptsUsed: attempt,
            improvementAchieved: ((analysis.metrics.overallScore - (trigger.qualityMetrics as ContentQualityMetrics).overallScore) / (trigger.qualityMetrics as ContentQualityMetrics).overallScore) * 100
          };
        }

        // Check for insufficient improvement
        if (attempt > 1 && improvement < this.config.improvementThreshold) {
          console.warn('⚠️ [REGENERATION-SYSTEM] Insufficient improvement detected');
        }

      } catch (error) {
        console.error(`❌ [REGENERATION-SYSTEM] Attempt ${attempt} failed:`, error);
        continue;
      }
    }

    // Return best result achieved
    const finalImprovement = ((bestScore - (trigger.qualityMetrics as ContentQualityMetrics).overallScore) / (trigger.qualityMetrics as ContentQualityMetrics).overallScore) * 100;
    
    return {
      success: bestScore >= this.config.qualityThreshold,
      finalContent: bestContent,
      finalMetrics: bestMetrics,
      attemptsUsed: this.config.maxAttempts,
      improvementAchieved: finalImprovement,
      failureReasons: bestScore < this.config.qualityThreshold ? 
        ['Quality threshold not achieved after maximum attempts'] : undefined
    };
  }

  /**
   * Execute image regeneration process
   */
  private async executeImageRegeneration(trigger: RegenerationTrigger): Promise<RegenerationResult> {
    console.log(`🔄 [REGENERATION-SYSTEM] Starting image regeneration (${trigger.triggerReason})`);
    
    const startTime = Date.now();
    let bestImage = trigger.originalContent as GeneratedImage;
    let bestMetrics = trigger.qualityMetrics as VisualQualityMetrics;
    let bestScore = bestMetrics.overallScore;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      // Check timeout
      if (Date.now() - startTime > this.config.timeoutMs) {
        console.warn('⏰ [REGENERATION-SYSTEM] Image regeneration timeout reached');
        break;
      }

      console.log(`🔄 [REGENERATION-SYSTEM] Image regeneration attempt ${attempt}/${this.config.maxAttempts}`);
      
      try {
        // Generate improved image
        const improvedImage = await this.generateImprovedImage(
          bestImage, 
          trigger.improvementTargets,
          attempt
        );

        // Validate improved image
        const analysis = await this.visualValidator.validateImage(improvedImage);
        
        // Check for improvement
        const improvement = analysis.metrics.overallScore - bestScore;
        console.log(`📊 [REGENERATION-SYSTEM] Visual score improvement: ${improvement.toFixed(2)} points`);

        if (analysis.metrics.overallScore > bestScore) {
          bestImage = improvedImage;
          bestMetrics = analysis.metrics;
          bestScore = analysis.metrics.overallScore;
          
          // Update improvement targets based on feedback
          trigger.improvementTargets = analysis.improvementSuggestions;
        }

        // Check if quality threshold is met
        if (analysis.metrics.overallScore >= this.config.visualQualityThreshold) {
          console.log('✅ [REGENERATION-SYSTEM] Visual quality threshold achieved');
          return {
            success: true,
            finalContent: improvedImage,
            finalMetrics: analysis.metrics,
            attemptsUsed: attempt,
            improvementAchieved: ((analysis.metrics.overallScore - (trigger.qualityMetrics as VisualQualityMetrics).overallScore) / (trigger.qualityMetrics as VisualQualityMetrics).overallScore) * 100
          };
        }

      } catch (error) {
        console.error(`❌ [REGENERATION-SYSTEM] Image attempt ${attempt} failed:`, error);
        continue;
      }
    }

    // Return best result achieved
    const finalImprovement = ((bestScore - (trigger.qualityMetrics as VisualQualityMetrics).overallScore) / (trigger.qualityMetrics as VisualQualityMetrics).overallScore) * 100;
    
    return {
      success: bestScore >= this.config.visualQualityThreshold,
      finalContent: bestImage,
      finalMetrics: bestMetrics,
      attemptsUsed: this.config.maxAttempts,
      improvementAchieved: finalImprovement,
      failureReasons: bestScore < this.config.visualQualityThreshold ? 
        ['Visual quality threshold not achieved after maximum attempts'] : undefined
    };
  }

  /**
   * Generate improved content based on quality feedback
   */
  private async generateImprovedContent(
    originalContent: GeneratedContent,
    improvementTargets: string[],
    attempt: number
  ): Promise<GeneratedContent> {
    const improvementPrompt = this.buildContentImprovementPrompt(
      originalContent, 
      improvementTargets, 
      attempt
    );
    
    const systemPrompt = this.getContentImprovementSystemPrompt();

    try {
      const response = await this.llmService.generateText(
        improvementPrompt,
        systemPrompt,
        { 
          temperature: 0.7 + (attempt * 0.1), // Increase creativity with attempts
          max_tokens: 4000,
          responseFormat: 'json'
        }
      );

      return {
        type: originalContent.type,
        content: response,
        context: originalContent.context
      };
    } catch (error) {
      console.error('❌ [REGENERATION-SYSTEM] Content improvement generation failed:', error);
      throw new Error(`Content improvement failed: ${error.message}`);
    }
  }

  /**
   * Generate improved image based on visual quality feedback
   */
  private async generateImprovedImage(
    originalImage: GeneratedImage,
    improvementTargets: string[],
    attempt: number
  ): Promise<GeneratedImage> {
    const improvedPrompt = this.buildImageImprovementPrompt(
      originalImage, 
      improvementTargets, 
      attempt
    );

    try {
      const imageUrl = await this.llmService.generateImage(improvedPrompt, {
        provider: originalImage.metadata?.provider,
        model: originalImage.metadata?.model
      });

      if (!imageUrl) {
        throw new Error('Image generation returned null');
      }

      return {
        imageUrl,
        prompt: improvedPrompt,
        context: originalImage.context,
        metadata: {
          ...originalImage.metadata,
          generationTime: Date.now(),
          attempt: attempt
        }
      };
    } catch (error) {
      console.error('❌ [REGENERATION-SYSTEM] Image improvement generation failed:', error);
      throw new Error(`Image improvement failed: ${error.message}`);
    }
  }

  /**
   * Create regeneration trigger
   */
  private createRegenerationTrigger(
    contentType: 'content' | 'image',
    content: GeneratedContent | GeneratedImage,
    analysis: QualityAnalysisResult | VisualAnalysisResult
  ): RegenerationTrigger {
    const trigger: RegenerationTrigger = {
      id: `regen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentType,
      triggerReason: this.determineTriggerReason(analysis),
      originalContent: content,
      qualityMetrics: analysis.metrics,
      improvementTargets: analysis.improvementSuggestions,
      maxAttempts: this.config.maxAttempts,
      currentAttempt: 0,
      timestamp: new Date()
    };

    this.activeRegenerations.set(trigger.id, trigger);
    return trigger;
  }

  /**
   * Determine the primary reason for regeneration
   */
  private determineTriggerReason(analysis: QualityAnalysisResult | VisualAnalysisResult): RegenerationReason {
    const metrics = analysis.metrics;

    if ('narrativeCoherence' in metrics) {
      // Content metrics
      const contentMetrics = metrics as ContentQualityMetrics;
      if (contentMetrics.narrativeCoherence < 6.0) return 'narrative_coherence_low';
      if (contentMetrics.characterDepth < 6.0) return 'character_depth_insufficient';
      if (contentMetrics.plotComplexity < 6.0) return 'plot_complexity_low';
      if (contentMetrics.thematicConsistency < 6.0) return 'thematic_inconsistency';
    } else {
      // Visual metrics
      const visualMetrics = metrics as VisualQualityMetrics;
      if (visualMetrics.imageQuality < 6.0) return 'image_quality_poor';
      if (visualMetrics.visualConsistency < 6.0) return 'visual_inconsistency';
      if (visualMetrics.professionalStandard < 6.0) return 'professional_standard_unmet';
      if (visualMetrics.narrativeAlignment < 6.0) return 'narrative_misalignment';
    }

    return 'below_threshold';
  }

  /**
   * Build content improvement prompt
   */
  private buildContentImprovementPrompt(
    content: GeneratedContent,
    targets: string[],
    attempt: number
  ): string {
    return `Improve this ${content.type} content to address the following quality issues:

IMPROVEMENT TARGETS (Attempt ${attempt}):
${targets.map((target, i) => `${i + 1}. ${target}`).join('\n')}

ORIGINAL CONTENT:
${JSON.stringify(content.content, null, 2)}

CONTEXT:
${JSON.stringify(content.context, null, 2)}

Generate an improved version that specifically addresses each improvement target while maintaining the core concept and context. Focus on professional quality and narrative excellence.`;
  }

  /**
   * Build image improvement prompt
   */
  private buildImageImprovementPrompt(
    image: GeneratedImage,
    targets: string[],
    attempt: number
  ): string {
    const basePrompt = image.prompt;
    const improvements = targets.join(', ');
    
    return `${basePrompt}

QUALITY IMPROVEMENTS NEEDED (Attempt ${attempt}):
${improvements}

Enhanced with: professional illustration quality, improved composition, better lighting, enhanced detail level, publication-ready standards.`;
  }

  /**
   * System prompt for content improvement
   */
  private getContentImprovementSystemPrompt(): string {
    return `You are an expert TTRPG content developer specializing in quality improvement and professional polish. Your task is to enhance content to meet professional publication standards.

Focus on:
- Addressing specific quality issues mentioned in the improvement targets
- Maintaining narrative coherence and thematic consistency
- Enhancing character depth and plot complexity
- Ensuring professional-quality writing and structure

Generate improved content that directly addresses the identified weaknesses while preserving the core strengths and concept.`;
  }

  /**
   * Update regeneration configuration
   */
  updateConfig(newConfig: Partial<RegenerationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 [REGENERATION-SYSTEM] Configuration updated:', newConfig);
  }

  /**
   * Get current configuration
   */
  getConfig(): RegenerationConfig {
    return { ...this.config };
  }

  /**
   * Get active regeneration status
   */
  getActiveRegenerations(): RegenerationTrigger[] {
    return Array.from(this.activeRegenerations.values());
  }

  /**
   * Clear completed regenerations
   */
  clearCompletedRegenerations(): void {
    // In a real implementation, you'd track completion status
    this.activeRegenerations.clear();
    console.log('🧹 [REGENERATION-SYSTEM] Cleared completed regenerations');
  }
}

// Export singleton instance
export const qualityRegenerationSystem = new QualityRegenerationSystem();