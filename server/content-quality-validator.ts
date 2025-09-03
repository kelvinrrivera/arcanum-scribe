/**
 * Content Quality Validator - Advanced Prompt System
 * 
 * This service implements automated quality validation for generated content,
 * focusing on narrative coherence, character depth, and plot complexity
 * as specified in the Advanced Prompt System requirements.
 */

import { LLMService } from './llm-service';

// Core quality metrics interfaces
export interface ContentQualityMetrics {
  narrativeCoherence: number;      // 0-10: Story consistency and logical flow
  characterDepth: number;          // 0-10: Character complexity and development
  plotComplexity: number;          // 0-10: Story structure and sophistication
  thematicConsistency: number;     // 0-10: Theme reinforcement throughout
  overallScore: number;            // Weighted average of all metrics
  passesThreshold: boolean;        // Whether content meets quality standards
  timestamp: Date;
}

export interface QualityAnalysisResult {
  metrics: ContentQualityMetrics;
  detailedFeedback: QualityFeedback;
  improvementSuggestions: string[];
  regenerationRequired: boolean;
}

export interface QualityFeedback {
  narrativeCoherence: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    specificIssues: string[];
  };
  characterDepth: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    specificIssues: string[];
  };
  plotComplexity: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    specificIssues: string[];
  };
  thematicConsistency: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    specificIssues: string[];
  };
}

export interface GeneratedContent {
  type: 'adventure' | 'npc' | 'monster' | 'puzzle' | 'magic_item';
  content: any;
  context?: {
    theme?: string;
    tone?: string;
    gameSystem?: string;
    previousElements?: any[];
  };
}

/**
 * Content Quality Validator Service
 * Implements Requirements 5.1 and 5.2 from the Advanced Prompt System spec
 */
export class ContentQualityValidator {
  private llmService: LLMService;
  private qualityThreshold = 8.0; // Minimum score for content to pass validation
  
  // Weightings for overall score calculation
  private readonly METRIC_WEIGHTS = {
    narrativeCoherence: 0.30,
    characterDepth: 0.25,
    plotComplexity: 0.25,
    thematicConsistency: 0.20
  };

  constructor() {
    this.llmService = new LLMService();
    console.log('🔍 [CONTENT-VALIDATOR] Content Quality Validator initialized');
  }

  /**
   * Validate generated content quality
   * Implements Requirements 5.1, 5.2
   */
  async validateContent(content: GeneratedContent): Promise<QualityAnalysisResult> {
    console.log(`🔍 [CONTENT-VALIDATOR] Validating ${content.type} content quality...`);

    try {
      const metrics = await this.analyzeContentQuality(content);
      const detailedFeedback = await this.generateDetailedFeedback(content, metrics);
      const improvementSuggestions = this.generateImprovementSuggestions(metrics, detailedFeedback);
      const regenerationRequired = metrics.overallScore < this.qualityThreshold;

      const result: QualityAnalysisResult = {
        metrics,
        detailedFeedback,
        improvementSuggestions,
        regenerationRequired
      };

      console.log(`📊 [CONTENT-VALIDATOR] Quality analysis complete:`);
      console.log(`   📖 Narrative Coherence: ${metrics.narrativeCoherence}/10`);
      console.log(`   👥 Character Depth: ${metrics.characterDepth}/10`);
      console.log(`   🎭 Plot Complexity: ${metrics.plotComplexity}/10`);
      console.log(`   🎨 Thematic Consistency: ${metrics.thematicConsistency}/10`);
      console.log(`   🎯 Overall Score: ${metrics.overallScore}/10`);
      console.log(`   ${regenerationRequired ? '❌ REGENERATION REQUIRED' : '✅ QUALITY APPROVED'}`);

      return result;
    } catch (error) {
      console.error('❌ [CONTENT-VALIDATOR] Quality validation failed:', error);
      throw new Error(`Content quality validation failed: ${error.message}`);
    }
  }

  /**
   * Analyze content quality using LLM-based evaluation
   */
  private async analyzeContentQuality(content: GeneratedContent): Promise<ContentQualityMetrics> {
    const analysisPrompt = this.buildQualityAnalysisPrompt(content);
    const systemPrompt = this.getQualityAnalysisSystemPrompt();

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
      const analysis = this.parseQualityAnalysis(response);
      
      // Calculate overall score
      const overallScore = this.calculateOverallScore(analysis);
      
      return {
        narrativeCoherence: analysis.narrativeCoherence,
        characterDepth: analysis.characterDepth,
        plotComplexity: analysis.plotComplexity,
        thematicConsistency: analysis.thematicConsistency,
        overallScore,
        passesThreshold: overallScore >= this.qualityThreshold,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ [CONTENT-VALIDATOR] LLM analysis failed:', error);
      throw new Error(`Quality analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate detailed feedback for each quality metric
   */
  private async generateDetailedFeedback(
    content: GeneratedContent, 
    metrics: ContentQualityMetrics
  ): Promise<QualityFeedback> {
    const feedbackPrompt = this.buildDetailedFeedbackPrompt(content, metrics);
    const systemPrompt = this.getDetailedFeedbackSystemPrompt();

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

      return this.parseDetailedFeedback(response);
    } catch (error) {
      console.error('❌ [CONTENT-VALIDATOR] Detailed feedback generation failed:', error);
      // Return basic feedback structure if detailed analysis fails
      return this.generateBasicFeedback(metrics);
    }
  }

  /**
   * Build quality analysis prompt for LLM evaluation
   */
  private buildQualityAnalysisPrompt(content: GeneratedContent): string {
    const contextInfo = content.context ? `
CONTEXT INFORMATION:
- Theme: ${content.context.theme || 'Not specified'}
- Tone: ${content.context.tone || 'Not specified'}
- Game System: ${content.context.gameSystem || 'Not specified'}
- Previous Elements: ${content.context.previousElements?.length || 0} related elements
` : '';

    return `Analyze the quality of this ${content.type} content for professional TTRPG use:

${contextInfo}

CONTENT TO ANALYZE:
${JSON.stringify(content.content, null, 2)}

Evaluate the content on these specific criteria:

1. NARRATIVE COHERENCE (0-10):
   - Does the story flow logically from beginning to end?
   - Are all plot elements connected and consistent?
   - Do events build upon each other naturally?
   - Are there any plot holes or contradictions?

2. CHARACTER DEPTH (0-10):
   - Do characters have clear, distinct personalities?
   - Are character motivations well-defined and believable?
   - Do characters have meaningful relationships with each other?
   - Are characters memorable and engaging?

3. PLOT COMPLEXITY (0-10):
   - Does the story have appropriate depth and sophistication?
   - Are there interesting twists or unexpected developments?
   - Is the pacing well-balanced between action and development?
   - Does the plot offer meaningful choices and consequences?

4. THEMATIC CONSISTENCY (0-10):
   - Are the central themes clearly established and maintained?
   - Do all elements reinforce the intended themes?
   - Is the tone consistent throughout?
   - Do symbols and motifs support the thematic message?

Provide scores as numbers between 0-10 with one decimal place precision.`;
  }

  /**
   * System prompt for quality analysis
   */
  private getQualityAnalysisSystemPrompt(): string {
    return `You are an expert TTRPG content analyst with 20+ years of experience evaluating adventure modules, NPCs, and game content for professional publication. You have worked with major RPG publishers and understand what separates amateur content from professional-quality material.

Your task is to provide objective, detailed quality analysis of TTRPG content. You evaluate content against professional publication standards, not amateur or casual standards.

EVALUATION STANDARDS:
- Professional publication quality (8-10): Content ready for commercial release
- Good amateur quality (6-7): Solid content with minor issues
- Basic quality (4-5): Functional but needs significant improvement
- Poor quality (0-3): Major issues that prevent effective use

Return your analysis in this exact JSON format:
{
  "narrativeCoherence": 8.5,
  "characterDepth": 7.2,
  "plotComplexity": 9.1,
  "thematicConsistency": 8.8,
  "analysisNotes": "Brief summary of key findings"
}

Be precise, objective, and constructive in your evaluation. Focus on specific, actionable observations.`;
  }

  /**
   * Build detailed feedback prompt
   */
  private buildDetailedFeedbackPrompt(content: GeneratedContent, metrics: ContentQualityMetrics): string {
    return `Provide detailed feedback for this ${content.type} content based on the quality scores:

QUALITY SCORES:
- Narrative Coherence: ${metrics.narrativeCoherence}/10
- Character Depth: ${metrics.characterDepth}/10
- Plot Complexity: ${metrics.plotComplexity}/10
- Thematic Consistency: ${metrics.thematicConsistency}/10

CONTENT:
${JSON.stringify(content.content, null, 2)}

For each quality metric, provide:
1. 2-3 specific strengths (what works well)
2. 2-3 specific weaknesses (what needs improvement)
3. 1-2 specific issues (concrete problems to address)

Focus on actionable, specific feedback that would help improve the content.`;
  }

  /**
   * System prompt for detailed feedback
   */
  private getDetailedFeedbackSystemPrompt(): string {
    return `You are a professional TTRPG editor and content developer. Provide specific, actionable feedback that helps creators improve their content to professional publication standards.

Your feedback should be:
- Specific and concrete (not vague generalities)
- Actionable (clear steps for improvement)
- Constructive (focused on solutions, not just problems)
- Professional (appropriate for commercial content development)

Return feedback in this exact JSON format:
{
  "narrativeCoherence": {
    "strengths": ["Specific strength 1", "Specific strength 2"],
    "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
    "specificIssues": ["Concrete issue 1", "Concrete issue 2"]
  },
  "characterDepth": {
    "strengths": ["Specific strength 1", "Specific strength 2"],
    "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
    "specificIssues": ["Concrete issue 1", "Concrete issue 2"]
  },
  "plotComplexity": {
    "strengths": ["Specific strength 1", "Specific strength 2"],
    "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
    "specificIssues": ["Concrete issue 1", "Concrete issue 2"]
  },
  "thematicConsistency": {
    "strengths": ["Specific strength 1", "Specific strength 2"],
    "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
    "specificIssues": ["Concrete issue 1", "Concrete issue 2"]
  }
}`;
  }

  /**
   * Parse quality analysis response from LLM
   */
  private parseQualityAnalysis(response: any): any {
    try {
      // Ensure all required fields are present and valid
      const analysis = {
        narrativeCoherence: this.validateScore(response.narrativeCoherence),
        characterDepth: this.validateScore(response.characterDepth),
        plotComplexity: this.validateScore(response.plotComplexity),
        thematicConsistency: this.validateScore(response.thematicConsistency)
      };

      return analysis;
    } catch (error) {
      console.error('❌ [CONTENT-VALIDATOR] Failed to parse quality analysis:', error);
      throw new Error('Invalid quality analysis response format');
    }
  }

  /**
   * Parse detailed feedback response from LLM
   */
  private parseDetailedFeedback(response: any): QualityFeedback {
    try {
      return {
        narrativeCoherence: {
          score: 0, // Will be filled from metrics
          strengths: response.narrativeCoherence?.strengths || [],
          weaknesses: response.narrativeCoherence?.weaknesses || [],
          specificIssues: response.narrativeCoherence?.specificIssues || []
        },
        characterDepth: {
          score: 0,
          strengths: response.characterDepth?.strengths || [],
          weaknesses: response.characterDepth?.weaknesses || [],
          specificIssues: response.characterDepth?.specificIssues || []
        },
        plotComplexity: {
          score: 0,
          strengths: response.plotComplexity?.strengths || [],
          weaknesses: response.plotComplexity?.weaknesses || [],
          specificIssues: response.plotComplexity?.specificIssues || []
        },
        thematicConsistency: {
          score: 0,
          strengths: response.thematicConsistency?.strengths || [],
          weaknesses: response.thematicConsistency?.weaknesses || [],
          specificIssues: response.thematicConsistency?.specificIssues || []
        }
      };
    } catch (error) {
      console.error('❌ [CONTENT-VALIDATOR] Failed to parse detailed feedback:', error);
      return this.generateBasicFeedback({} as ContentQualityMetrics);
    }
  }

  /**
   * Generate basic feedback structure as fallback
   */
  private generateBasicFeedback(metrics: ContentQualityMetrics): QualityFeedback {
    return {
      narrativeCoherence: {
        score: metrics.narrativeCoherence || 0,
        strengths: ['Content analysis completed'],
        weaknesses: ['Detailed feedback unavailable'],
        specificIssues: ['Manual review recommended']
      },
      characterDepth: {
        score: metrics.characterDepth || 0,
        strengths: ['Content analysis completed'],
        weaknesses: ['Detailed feedback unavailable'],
        specificIssues: ['Manual review recommended']
      },
      plotComplexity: {
        score: metrics.plotComplexity || 0,
        strengths: ['Content analysis completed'],
        weaknesses: ['Detailed feedback unavailable'],
        specificIssues: ['Manual review recommended']
      },
      thematicConsistency: {
        score: metrics.thematicConsistency || 0,
        strengths: ['Content analysis completed'],
        weaknesses: ['Detailed feedback unavailable'],
        specificIssues: ['Manual review recommended']
      }
    };
  }

  /**
   * Validate and normalize quality scores
   */
  private validateScore(score: any): number {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) {
      console.warn('⚠️ [CONTENT-VALIDATOR] Invalid score received, defaulting to 5.0');
      return 5.0;
    }
    return Math.max(0, Math.min(10, numScore));
  }

  /**
   * Calculate weighted overall score
   */
  private calculateOverallScore(analysis: any): number {
    const score = 
      (analysis.narrativeCoherence * this.METRIC_WEIGHTS.narrativeCoherence) +
      (analysis.characterDepth * this.METRIC_WEIGHTS.characterDepth) +
      (analysis.plotComplexity * this.METRIC_WEIGHTS.plotComplexity) +
      (analysis.thematicConsistency * this.METRIC_WEIGHTS.thematicConsistency);

    return Math.round(score * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Generate improvement suggestions based on metrics and feedback
   */
  private generateImprovementSuggestions(
    metrics: ContentQualityMetrics, 
    feedback: QualityFeedback
  ): string[] {
    const suggestions: string[] = [];

    // Narrative coherence improvements
    if (metrics.narrativeCoherence < 8.0) {
      suggestions.push('Strengthen narrative flow by ensuring each scene builds logically on the previous one');
      if (feedback.narrativeCoherence.specificIssues.length > 0) {
        suggestions.push(`Address narrative issues: ${feedback.narrativeCoherence.specificIssues[0]}`);
      }
    }

    // Character depth improvements
    if (metrics.characterDepth < 8.0) {
      suggestions.push('Develop character motivations and relationships more deeply');
      suggestions.push('Add distinctive personality traits and memorable dialogue');
    }

    // Plot complexity improvements
    if (metrics.plotComplexity < 8.0) {
      suggestions.push('Increase plot sophistication with meaningful choices and consequences');
      suggestions.push('Add unexpected twists that recontextualize earlier events');
    }

    // Thematic consistency improvements
    if (metrics.thematicConsistency < 8.0) {
      suggestions.push('Ensure all elements reinforce the central themes');
      suggestions.push('Maintain consistent tone and symbolic elements throughout');
    }

    // Overall quality improvements
    if (metrics.overallScore < this.qualityThreshold) {
      suggestions.push('Content requires regeneration to meet professional quality standards');
      suggestions.push('Focus on the lowest-scoring quality metrics for maximum improvement');
    }

    return suggestions;
  }

  /**
   * Get current quality threshold
   */
  getQualityThreshold(): number {
    return this.qualityThreshold;
  }

  /**
   * Update quality threshold (for testing or configuration)
   */
  setQualityThreshold(threshold: number): void {
    this.qualityThreshold = Math.max(0, Math.min(10, threshold));
    console.log(`🔧 [CONTENT-VALIDATOR] Quality threshold updated to ${this.qualityThreshold}`);
  }
}

// Export singleton instance
export const contentQualityValidator = new ContentQualityValidator();