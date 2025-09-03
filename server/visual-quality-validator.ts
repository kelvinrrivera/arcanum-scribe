/**
 * Visual Quality Validator - Advanced Prompt System
 * 
 * This service implements automated visual quality validation for generated images,
 * focusing on image quality assessment, visual consistency scoring, and professional
 * standard validation as specified in the Advanced Prompt System requirements.
 */

import { LLMService } from './llm-service';

// Visual quality metrics interfaces
export interface VisualQualityMetrics {
  imageQuality: number;           // 0-10: Technical image quality and clarity
  visualConsistency: number;      // 0-10: Consistency with established style
  professionalStandard: number;   // 0-10: Professional publication readiness
  narrativeAlignment: number;     // 0-10: How well image supports the story
  overallScore: number;           // Weighted average of all metrics
  passesThreshold: boolean;       // Whether image meets quality standards
  timestamp: Date;
}

export interface VisualAnalysisResult {
  metrics: VisualQualityMetrics;
  detailedFeedback: VisualFeedback;
  improvementSuggestions: string[];
  regenerationRequired: boolean;
  technicalIssues: string[];
}

export interface VisualFeedback {
  imageQuality: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    technicalIssues: string[];
  };
  visualConsistency: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    consistencyIssues: string[];
  };
  professionalStandard: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    standardIssues: string[];
  };
  narrativeAlignment: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    alignmentIssues: string[];
  };
}

export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  context: {
    contentType: 'boss_monster' | 'scene' | 'character' | 'magic_item' | 'environment';
    narrativeContext?: string;
    establishedStyle?: VisualStyle;
    relatedImages?: string[];
    storyElements?: any;
  };
  metadata?: {
    model: string;
    provider: string;
    generationTime: number;
    parameters?: any;
  };
}

export interface VisualStyle {
  artStyle: string;
  colorPalette: string[];
  lightingMood: string;
  compositionStyle: string;
  detailLevel: string;
  thematicElements: string[];
}

/**
 * Visual Quality Validator Service
 * Implements Requirements 5.3 and 5.4 from the Advanced Prompt System spec
 */
export class VisualQualityValidator {
  private llmService: LLMService;
  private qualityThreshold = 8.0; // Minimum score for images to pass validation
  
  // Weightings for overall score calculation
  private readonly METRIC_WEIGHTS = {
    imageQuality: 0.30,
    visualConsistency: 0.25,
    professionalStandard: 0.25,
    narrativeAlignment: 0.20
  };

  constructor() {
    this.llmService = new LLMService();
    console.log('🎨 [VISUAL-VALIDATOR] Visual Quality Validator initialized');
  }

  /**
   * Validate generated image quality
   * Implements Requirements 5.3, 5.4
   */
  async validateImage(image: GeneratedImage): Promise<VisualAnalysisResult> {
    console.log(`🎨 [VISUAL-VALIDATOR] Validating ${image.context.contentType} image quality...`);

    try {
      const metrics = await this.analyzeImageQuality(image);
      const detailedFeedback = await this.generateVisualFeedback(image, metrics);
      const improvementSuggestions = this.generateVisualImprovements(metrics, detailedFeedback);
      const technicalIssues = this.identifyTechnicalIssues(image, metrics);
      const regenerationRequired = metrics.overallScore < this.qualityThreshold;

      const result: VisualAnalysisResult = {
        metrics,
        detailedFeedback,
        improvementSuggestions,
        regenerationRequired,
        technicalIssues
      };

      console.log(`🎨 [VISUAL-VALIDATOR] Visual analysis complete:`);
      console.log(`   🖼️ Image Quality: ${metrics.imageQuality}/10`);
      console.log(`   🎨 Visual Consistency: ${metrics.visualConsistency}/10`);
      console.log(`   🏆 Professional Standard: ${metrics.professionalStandard}/10`);
      console.log(`   📖 Narrative Alignment: ${metrics.narrativeAlignment}/10`);
      console.log(`   🎯 Overall Score: ${metrics.overallScore}/10`);
      console.log(`   ${regenerationRequired ? '❌ REGENERATION REQUIRED' : '✅ QUALITY APPROVED'}`);

      return result;
    } catch (error) {
      console.error('❌ [VISUAL-VALIDATOR] Visual quality validation failed:', error);
      throw new Error(`Visual quality validation failed: ${error.message}`);
    }
  }

  /**
   * Analyze image quality using LLM-based visual assessment
   */
  private async analyzeImageQuality(image: GeneratedImage): Promise<VisualQualityMetrics> {
    const analysisPrompt = this.buildVisualAnalysisPrompt(image);
    const systemPrompt = this.getVisualAnalysisSystemPrompt();

    try {
      const response = await this.llmService.generateText(
        analysisPrompt,
        systemPrompt,
        { 
          temperature: 0.3, // Lower temperature for consistent analysis
          max_tokens: 2000,
          responseFormat: 'json'
        }
      );

      // Parse and validate the response
      const analysis = this.parseVisualAnalysis(response);
      
      // Calculate overall score
      const overallScore = this.calculateVisualOverallScore(analysis);
      
      return {
        imageQuality: analysis.imageQuality,
        visualConsistency: analysis.visualConsistency,
        professionalStandard: analysis.professionalStandard,
        narrativeAlignment: analysis.narrativeAlignment,
        overallScore,
        passesThreshold: overallScore >= this.qualityThreshold,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ [VISUAL-VALIDATOR] LLM visual analysis failed:', error);
      throw new Error(`Visual analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate detailed visual feedback
   */
  private async generateVisualFeedback(
    image: GeneratedImage, 
    metrics: VisualQualityMetrics
  ): Promise<VisualFeedback> {
    const feedbackPrompt = this.buildVisualFeedbackPrompt(image, metrics);
    const systemPrompt = this.getVisualFeedbackSystemPrompt();

    try {
      const response = await this.llmService.generateText(
        feedbackPrompt,
        systemPrompt,
        { 
          temperature: 0.4,
          max_tokens: 3000,
          responseFormat: 'json'
        }
      );

      return this.parseVisualFeedback(response);
    } catch (error) {
      console.error('❌ [VISUAL-VALIDATOR] Visual feedback generation failed:', error);
      // Return basic feedback structure if detailed analysis fails
      return this.generateBasicVisualFeedback(metrics);
    }
  }

  /**
   * Build visual analysis prompt for LLM evaluation
   */
  private buildVisualAnalysisPrompt(image: GeneratedImage): string {
    const contextInfo = `
VISUAL CONTEXT:
- Content Type: ${image.context.contentType}
- Narrative Context: ${image.context.narrativeContext || 'Not specified'}
- Established Style: ${image.context.establishedStyle ? JSON.stringify(image.context.establishedStyle) : 'Not specified'}
- Related Images: ${image.context.relatedImages?.length || 0} related images in series
- Story Elements: ${image.context.storyElements ? JSON.stringify(image.context.storyElements) : 'Not specified'}

GENERATION DETAILS:
- Original Prompt: ${image.prompt}
- Model: ${image.metadata?.model || 'Unknown'}
- Provider: ${image.metadata?.provider || 'Unknown'}
`;

    return `Analyze the visual quality of this generated image for professional TTRPG use:

${contextInfo}

IMAGE URL: ${image.imageUrl}

Note: You are analyzing the image at the provided URL. Evaluate the actual visual content you can observe.

Evaluate the image on these specific criteria:

1. IMAGE QUALITY (0-10):
   - Technical clarity and resolution
   - Proper lighting and composition
   - Color balance and saturation
   - Overall visual appeal and craftsmanship

2. VISUAL CONSISTENCY (0-10):
   - Adherence to established art style (if specified)
   - Consistency with color palette and mood
   - Matching lighting and composition approach
   - Coherence with related images in the series

3. PROFESSIONAL STANDARD (0-10):
   - Publication-ready quality for commercial use
   - Professional illustration standards
   - Appropriate detail level for intended use
   - Market-competitive visual quality

4. NARRATIVE ALIGNMENT (0-10):
   - How well the image supports the story context
   - Accuracy in depicting described elements
   - Emotional tone matching narrative mood
   - Visual storytelling effectiveness

Provide scores as numbers between 0-10 with one decimal place precision.`;
  }

  /**
   * System prompt for visual analysis
   */
  private getVisualAnalysisSystemPrompt(): string {
    return `You are an expert art director and visual quality analyst with 20+ years of experience in professional illustration, game art, and visual content for TTRPG publications. You have worked with major RPG publishers and understand what separates amateur artwork from professional-quality illustrations.

Your task is to provide objective, detailed visual quality analysis of generated images for TTRPG content. You evaluate images against professional publication standards used by major RPG companies.

EVALUATION STANDARDS:
- Professional publication quality (8-10): Ready for commercial release in major RPG products
- Good amateur quality (6-7): Solid artwork with minor issues
- Basic quality (4-5): Functional but needs significant improvement
- Poor quality (0-3): Major issues that prevent effective use

IMPORTANT: You can see and analyze the actual image at the provided URL. Base your evaluation on what you observe in the image, not just the prompt or context.

Return your analysis in this exact JSON format:
{
  "imageQuality": 8.5,
  "visualConsistency": 7.2,
  "professionalStandard": 9.1,
  "narrativeAlignment": 8.8,
  "analysisNotes": "Brief summary of key visual findings"
}

Be precise, objective, and constructive in your evaluation. Focus on specific, actionable visual observations.`;
  }

  /**
   * Build visual feedback prompt
   */
  private buildVisualFeedbackPrompt(image: GeneratedImage, metrics: VisualQualityMetrics): string {
    return `Provide detailed visual feedback for this ${image.context.contentType} image based on the quality scores:

VISUAL QUALITY SCORES:
- Image Quality: ${metrics.imageQuality}/10
- Visual Consistency: ${metrics.visualConsistency}/10
- Professional Standard: ${metrics.professionalStandard}/10
- Narrative Alignment: ${metrics.narrativeAlignment}/10

IMAGE URL: ${image.imageUrl}
ORIGINAL PROMPT: ${image.prompt}

CONTEXT:
${JSON.stringify(image.context, null, 2)}

For each visual quality metric, provide:
1. 2-3 specific strengths (what works well visually)
2. 2-3 specific weaknesses (what needs visual improvement)
3. 1-2 specific issues (concrete visual problems to address)

Focus on actionable, specific visual feedback that would help improve the image quality.`;
  }

  /**
   * System prompt for visual feedback
   */
  private getVisualFeedbackSystemPrompt(): string {
    return `You are a professional art director and visual content developer for TTRPG publications. Provide specific, actionable visual feedback that helps creators improve their images to professional publication standards.

Your feedback should be:
- Visually specific and concrete (not vague artistic generalities)
- Actionable (clear steps for visual improvement)
- Constructive (focused on visual solutions, not just problems)
- Professional (appropriate for commercial art development)

IMPORTANT: You can see and analyze the actual image. Base your feedback on what you observe visually.

Return feedback in this exact JSON format:
{
  "imageQuality": {
    "strengths": ["Specific visual strength 1", "Specific visual strength 2"],
    "weaknesses": ["Specific visual weakness 1", "Specific visual weakness 2"],
    "technicalIssues": ["Concrete visual issue 1", "Concrete visual issue 2"]
  },
  "visualConsistency": {
    "strengths": ["Specific consistency strength 1", "Specific consistency strength 2"],
    "weaknesses": ["Specific consistency weakness 1", "Specific consistency weakness 2"],
    "consistencyIssues": ["Concrete consistency issue 1", "Concrete consistency issue 2"]
  },
  "professionalStandard": {
    "strengths": ["Specific professional strength 1", "Specific professional strength 2"],
    "weaknesses": ["Specific professional weakness 1", "Specific professional weakness 2"],
    "standardIssues": ["Concrete standard issue 1", "Concrete standard issue 2"]
  },
  "narrativeAlignment": {
    "strengths": ["Specific alignment strength 1", "Specific alignment strength 2"],
    "weaknesses": ["Specific alignment weakness 1", "Specific alignment weakness 2"],
    "alignmentIssues": ["Concrete alignment issue 1", "Concrete alignment issue 2"]
  }
}`;
  }

  /**
   * Parse visual analysis response from LLM
   */
  private parseVisualAnalysis(response: any): any {
    try {
      // Ensure all required fields are present and valid
      const analysis = {
        imageQuality: this.validateScore(response.imageQuality),
        visualConsistency: this.validateScore(response.visualConsistency),
        professionalStandard: this.validateScore(response.professionalStandard),
        narrativeAlignment: this.validateScore(response.narrativeAlignment)
      };

      return analysis;
    } catch (error) {
      console.error('❌ [VISUAL-VALIDATOR] Failed to parse visual analysis:', error);
      throw new Error('Invalid visual analysis response format');
    }
  }

  /**
   * Parse visual feedback response from LLM
   */
  private parseVisualFeedback(response: any): VisualFeedback {
    try {
      return {
        imageQuality: {
          score: 0, // Will be filled from metrics
          strengths: response.imageQuality?.strengths || [],
          weaknesses: response.imageQuality?.weaknesses || [],
          technicalIssues: response.imageQuality?.technicalIssues || []
        },
        visualConsistency: {
          score: 0,
          strengths: response.visualConsistency?.strengths || [],
          weaknesses: response.visualConsistency?.weaknesses || [],
          consistencyIssues: response.visualConsistency?.consistencyIssues || []
        },
        professionalStandard: {
          score: 0,
          strengths: response.professionalStandard?.strengths || [],
          weaknesses: response.professionalStandard?.weaknesses || [],
          standardIssues: response.professionalStandard?.standardIssues || []
        },
        narrativeAlignment: {
          score: 0,
          strengths: response.narrativeAlignment?.strengths || [],
          weaknesses: response.narrativeAlignment?.weaknesses || [],
          alignmentIssues: response.narrativeAlignment?.alignmentIssues || []
        }
      };
    } catch (error) {
      console.error('❌ [VISUAL-VALIDATOR] Failed to parse visual feedback:', error);
      return this.generateBasicVisualFeedback({} as VisualQualityMetrics);
    }
  }

  /**
   * Generate basic visual feedback structure as fallback
   */
  private generateBasicVisualFeedback(metrics: VisualQualityMetrics): VisualFeedback {
    return {
      imageQuality: {
        score: metrics.imageQuality || 0,
        strengths: ['Visual analysis completed'],
        weaknesses: ['Detailed feedback unavailable'],
        technicalIssues: ['Manual review recommended']
      },
      visualConsistency: {
        score: metrics.visualConsistency || 0,
        strengths: ['Visual analysis completed'],
        weaknesses: ['Detailed feedback unavailable'],
        consistencyIssues: ['Manual review recommended']
      },
      professionalStandard: {
        score: metrics.professionalStandard || 0,
        strengths: ['Visual analysis completed'],
        weaknesses: ['Detailed feedback unavailable'],
        standardIssues: ['Manual review recommended']
      },
      narrativeAlignment: {
        score: metrics.narrativeAlignment || 0,
        strengths: ['Visual analysis completed'],
        weaknesses: ['Detailed feedback unavailable'],
        alignmentIssues: ['Manual review recommended']
      }
    };
  }

  /**
   * Validate and normalize quality scores
   */
  private validateScore(score: any): number {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) {
      console.warn('⚠️ [VISUAL-VALIDATOR] Invalid score received, defaulting to 5.0');
      return 5.0;
    }
    return Math.max(0, Math.min(10, numScore));
  }

  /**
   * Calculate weighted overall visual score
   */
  private calculateVisualOverallScore(analysis: any): number {
    const score = 
      (analysis.imageQuality * this.METRIC_WEIGHTS.imageQuality) +
      (analysis.visualConsistency * this.METRIC_WEIGHTS.visualConsistency) +
      (analysis.professionalStandard * this.METRIC_WEIGHTS.professionalStandard) +
      (analysis.narrativeAlignment * this.METRIC_WEIGHTS.narrativeAlignment);

    return Math.round(score * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Generate visual improvement suggestions
   */
  private generateVisualImprovements(
    metrics: VisualQualityMetrics, 
    feedback: VisualFeedback
  ): string[] {
    const suggestions: string[] = [];

    // Image quality improvements
    if (metrics.imageQuality < 8.0) {
      suggestions.push('Improve technical image quality: enhance resolution, lighting, and composition');
      if (feedback.imageQuality.technicalIssues.length > 0) {
        suggestions.push(`Address technical issues: ${feedback.imageQuality.technicalIssues[0]}`);
      }
    }

    // Visual consistency improvements
    if (metrics.visualConsistency < 8.0) {
      suggestions.push('Maintain consistent art style, color palette, and lighting approach');
      suggestions.push('Ensure visual coherence with established style guidelines');
    }

    // Professional standard improvements
    if (metrics.professionalStandard < 8.0) {
      suggestions.push('Elevate to professional publication standards');
      suggestions.push('Increase detail level and artistic craftsmanship');
    }

    // Narrative alignment improvements
    if (metrics.narrativeAlignment < 8.0) {
      suggestions.push('Better align visual elements with story context and mood');
      suggestions.push('Ensure image accurately depicts described narrative elements');
    }

    // Overall quality improvements
    if (metrics.overallScore < this.qualityThreshold) {
      suggestions.push('Image requires regeneration to meet professional quality standards');
      suggestions.push('Focus on the lowest-scoring visual metrics for maximum improvement');
    }

    return suggestions;
  }

  /**
   * Identify technical issues with the image
   */
  private identifyTechnicalIssues(image: GeneratedImage, metrics: VisualQualityMetrics): string[] {
    const issues: string[] = [];

    // Check for common technical issues based on scores
    if (metrics.imageQuality < 6.0) {
      issues.push('Low technical quality detected - resolution or clarity issues likely');
    }

    if (metrics.professionalStandard < 6.0) {
      issues.push('Below professional standards - significant quality improvements needed');
    }

    if (metrics.visualConsistency < 6.0 && image.context.establishedStyle) {
      issues.push('Visual inconsistency with established style guidelines');
    }

    if (metrics.narrativeAlignment < 6.0) {
      issues.push('Poor alignment with narrative context - image may not match story requirements');
    }

    // Check metadata for potential issues
    if (image.metadata?.generationTime && image.metadata.generationTime < 5000) {
      issues.push('Very fast generation time may indicate lower quality settings');
    }

    return issues;
  }

  /**
   * Get current visual quality threshold
   */
  getVisualQualityThreshold(): number {
    return this.qualityThreshold;
  }

  /**
   * Update visual quality threshold (for testing or configuration)
   */
  setVisualQualityThreshold(threshold: number): void {
    this.qualityThreshold = Math.max(0, Math.min(10, threshold));
    console.log(`🔧 [VISUAL-VALIDATOR] Visual quality threshold updated to ${this.qualityThreshold}`);
  }
}

// Export singleton instance
export const visualQualityValidator = new VisualQualityValidator();