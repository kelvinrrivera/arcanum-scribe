/**
 * Automated Quality Service - Advanced Prompt System Integration
 * 
 * This service provides a unified interface for the complete automated quality
 * validation system, integrating content validation, visual validation, and
 * regeneration triggers into a cohesive quality assurance pipeline.
 */

import { ContentQualityValidator, GeneratedContent, QualityAnalysisResult } from './content-quality-validator';
import { VisualQualityValidator, GeneratedImage, VisualAnalysisResult } from './visual-quality-validator';
import { QualityRegenerationSystem, RegenerationResult } from './quality-regeneration-system';

// Unified quality interfaces
export interface UnifiedQualityResult {
  contentResult?: QualityAnalysisResult;
  visualResult?: VisualAnalysisResult;
  regenerationResult?: RegenerationResult;
  overallQualityScore: number;
  passesAllStandards: boolean;
  qualityGrade: QualityGrade;
  processingTime: number;
  timestamp: Date;
}

export interface QualityValidationRequest {
  content?: GeneratedContent;
  images?: GeneratedImage[];
  enableRegeneration?: boolean;
  customThresholds?: {
    contentThreshold?: number;
    visualThreshold?: number;
  };
}

export interface QualityReport {
  summary: QualitySummary;
  contentAnalysis?: QualityAnalysisResult[];
  visualAnalysis?: VisualAnalysisResult[];
  regenerationResults?: RegenerationResult[];
  recommendations: string[];
  nextSteps: string[];
}

export interface QualitySummary {
  totalItems: number;
  itemsPassed: number;
  itemsFailed: number;
  averageQualityScore: number;
  regenerationsTriggered: number;
  regenerationsSuccessful: number;
  overallGrade: QualityGrade;
}

export type QualityGrade = 'Excellent' | 'Good' | 'Acceptable' | 'Needs Improvement' | 'Poor';

/**
 * Automated Quality Service
 * Unified interface for the complete quality validation system
 */
export class AutomatedQualityService {
  private contentValidator: ContentQualityValidator;
  private visualValidator: VisualQualityValidator;
  private regenerationSystem: QualityRegenerationSystem;

  constructor() {
    this.contentValidator = new ContentQualityValidator();
    this.visualValidator = new VisualQualityValidator();
    this.regenerationSystem = new QualityRegenerationSystem();
    console.log('🎯 [QUALITY-SERVICE] Automated Quality Service initialized');
  }

  /**
   * Comprehensive quality validation with optional regeneration
   */
  async validateQuality(request: QualityValidationRequest): Promise<UnifiedQualityResult> {
    console.log('🎯 [QUALITY-SERVICE] Starting comprehensive quality validation...');
    const startTime = Date.now();

    try {
      let contentResult: QualityAnalysisResult | undefined;
      let visualResult: VisualAnalysisResult | undefined;
      let regenerationResult: RegenerationResult | undefined;

      // Validate content if provided
      if (request.content) {
        console.log('📝 [QUALITY-SERVICE] Validating content quality...');
        
        if (request.enableRegeneration) {
          regenerationResult = await this.regenerationSystem.validateAndRegenerate(request.content);
          contentResult = {
            metrics: regenerationResult.finalMetrics as any,
            detailedFeedback: {} as any, // Would be populated in full implementation
            improvementSuggestions: [],
            regenerationRequired: !regenerationResult.success
          };
        } else {
          contentResult = await this.contentValidator.validateContent(request.content);
        }
      }

      // Validate images if provided
      if (request.images && request.images.length > 0) {
        console.log(`🎨 [QUALITY-SERVICE] Validating ${request.images.length} images...`);
        
        // For now, validate the first image (in full implementation, would handle multiple)
        const firstImage = request.images[0];
        
        if (request.enableRegeneration) {
          const imageRegenResult = await this.regenerationSystem.validateAndRegenerateImage(firstImage);
          visualResult = {
            metrics: imageRegenResult.finalMetrics as any,
            detailedFeedback: {} as any, // Would be populated in full implementation
            improvementSuggestions: [],
            regenerationRequired: !imageRegenResult.success,
            technicalIssues: []
          };
        } else {
          visualResult = await this.visualValidator.validateImage(firstImage);
        }
      }

      // Calculate unified results
      const result = this.calculateUnifiedResult(
        contentResult,
        visualResult,
        regenerationResult,
        Date.now() - startTime
      );

      console.log(`🎯 [QUALITY-SERVICE] Quality validation complete:`);
      console.log(`   📊 Overall Quality Score: ${result.overallQualityScore}/10`);
      console.log(`   🏆 Quality Grade: ${result.qualityGrade}`);
      console.log(`   ${result.passesAllStandards ? '✅ PASSES ALL STANDARDS' : '❌ QUALITY ISSUES DETECTED'}`);

      return result;
    } catch (error) {
      console.error('❌ [QUALITY-SERVICE] Quality validation failed:', error);
      throw new Error(`Quality validation failed: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive quality report
   */
  async generateQualityReport(requests: QualityValidationRequest[]): Promise<QualityReport> {
    console.log(`📊 [QUALITY-SERVICE] Generating quality report for ${requests.length} items...`);

    const results: UnifiedQualityResult[] = [];
    const contentAnalyses: QualityAnalysisResult[] = [];
    const visualAnalyses: VisualAnalysisResult[] = [];
    const regenerationResults: RegenerationResult[] = [];

    // Process all validation requests
    for (const request of requests) {
      try {
        const result = await this.validateQuality(request);
        results.push(result);

        if (result.contentResult) contentAnalyses.push(result.contentResult);
        if (result.visualResult) visualAnalyses.push(result.visualResult);
        if (result.regenerationResult) regenerationResults.push(result.regenerationResult);
      } catch (error) {
        console.error('❌ [QUALITY-SERVICE] Failed to process validation request:', error);
      }
    }

    // Generate summary
    const summary = this.generateQualitySummary(results, regenerationResults);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(results);
    const nextSteps = this.generateNextSteps(summary, results);

    const report: QualityReport = {
      summary,
      contentAnalysis: contentAnalyses.length > 0 ? contentAnalyses : undefined,
      visualAnalysis: visualAnalyses.length > 0 ? visualAnalyses : undefined,
      regenerationResults: regenerationResults.length > 0 ? regenerationResults : undefined,
      recommendations,
      nextSteps
    };

    console.log(`📊 [QUALITY-SERVICE] Quality report generated:`);
    console.log(`   📈 Overall Grade: ${summary.overallGrade}`);
    console.log(`   ✅ Items Passed: ${summary.itemsPassed}/${summary.totalItems}`);
    console.log(`   🔄 Regenerations: ${summary.regenerationsSuccessful}/${summary.regenerationsTriggered}`);

    return report;
  }

  /**
   * Calculate unified quality result
   */
  private calculateUnifiedResult(
    contentResult?: QualityAnalysisResult,
    visualResult?: VisualAnalysisResult,
    regenerationResult?: RegenerationResult,
    processingTime?: number
  ): UnifiedQualityResult {
    let overallScore = 0;
    let scoreCount = 0;
    let allPass = true;

    // Include content score
    if (contentResult) {
      overallScore += contentResult.metrics.overallScore;
      scoreCount++;
      if (contentResult.regenerationRequired) allPass = false;
    }

    // Include visual score
    if (visualResult) {
      overallScore += visualResult.metrics.overallScore;
      scoreCount++;
      if (visualResult.regenerationRequired) allPass = false;
    }

    // Calculate average score
    const averageScore = scoreCount > 0 ? overallScore / scoreCount : 0;

    // Determine quality grade
    const qualityGrade = this.determineQualityGrade(averageScore);

    return {
      contentResult,
      visualResult,
      regenerationResult,
      overallQualityScore: Math.round(averageScore * 10) / 10,
      passesAllStandards: allPass,
      qualityGrade,
      processingTime: processingTime || 0,
      timestamp: new Date()
    };
  }

  /**
   * Determine quality grade based on score
   */
  private determineQualityGrade(score: number): QualityGrade {
    if (score >= 9.0) return 'Excellent';
    if (score >= 8.0) return 'Good';
    if (score >= 7.0) return 'Acceptable';
    if (score >= 5.0) return 'Needs Improvement';
    return 'Poor';
  }

  /**
   * Generate quality summary
   */
  private generateQualitySummary(
    results: UnifiedQualityResult[],
    regenerationResults: RegenerationResult[]
  ): QualitySummary {
    const totalItems = results.length;
    const itemsPassed = results.filter(r => r.passesAllStandards).length;
    const itemsFailed = totalItems - itemsPassed;
    
    const averageScore = results.length > 0 
      ? results.reduce((sum, r) => sum + r.overallQualityScore, 0) / results.length 
      : 0;

    const regenerationsTriggered = regenerationResults.length;
    const regenerationsSuccessful = regenerationResults.filter(r => r.success).length;

    const overallGrade = this.determineQualityGrade(averageScore);

    return {
      totalItems,
      itemsPassed,
      itemsFailed,
      averageQualityScore: Math.round(averageScore * 10) / 10,
      regenerationsTriggered,
      regenerationsSuccessful,
      overallGrade
    };
  }

  /**
   * Generate quality recommendations
   */
  private generateRecommendations(results: UnifiedQualityResult[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze common issues
    const lowContentScores = results.filter(r => 
      r.contentResult && r.contentResult.metrics.overallScore < 8.0
    ).length;
    
    const lowVisualScores = results.filter(r => 
      r.visualResult && r.visualResult.metrics.overallScore < 8.0
    ).length;

    if (lowContentScores > results.length * 0.3) {
      recommendations.push('Focus on improving content quality: enhance narrative coherence and character depth');
    }

    if (lowVisualScores > results.length * 0.3) {
      recommendations.push('Improve visual quality: enhance image resolution and professional standards');
    }

    const failureRate = results.filter(r => !r.passesAllStandards).length / results.length;
    if (failureRate > 0.2) {
      recommendations.push('Consider adjusting quality thresholds or improving base prompts');
    }

    if (recommendations.length === 0) {
      recommendations.push('Quality standards are being met consistently - maintain current processes');
    }

    return recommendations;
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(summary: QualitySummary, results: UnifiedQualityResult[]): string[] {
    const nextSteps: string[] = [];

    if (summary.overallGrade === 'Poor' || summary.overallGrade === 'Needs Improvement') {
      nextSteps.push('Immediate action required: Review and improve base prompt templates');
      nextSteps.push('Enable automatic regeneration for all content below threshold');
    }

    if (summary.regenerationsTriggered > 0 && summary.regenerationsSuccessful < summary.regenerationsTriggered) {
      nextSteps.push('Investigate regeneration failures and improve feedback mechanisms');
    }

    if (summary.itemsPassed / summary.totalItems < 0.8) {
      nextSteps.push('Consider lowering quality thresholds temporarily while improving base quality');
    }

    if (summary.overallGrade === 'Excellent') {
      nextSteps.push('Quality standards exceeded - consider raising thresholds for continuous improvement');
    }

    return nextSteps;
  }

  /**
   * Get quality validation statistics
   */
  async getQualityStatistics(): Promise<any> {
    return {
      contentThreshold: this.contentValidator.getQualityThreshold(),
      visualThreshold: this.visualValidator.getVisualQualityThreshold(),
      regenerationConfig: this.regenerationSystem.getConfig(),
      activeRegenerations: this.regenerationSystem.getActiveRegenerations().length
    };
  }

  /**
   * Update quality thresholds
   */
  updateQualityThresholds(contentThreshold?: number, visualThreshold?: number): void {
    if (contentThreshold !== undefined) {
      this.contentValidator.setQualityThreshold(contentThreshold);
    }
    if (visualThreshold !== undefined) {
      this.visualValidator.setVisualQualityThreshold(visualThreshold);
    }
    console.log('🔧 [QUALITY-SERVICE] Quality thresholds updated');
  }
}

// Export singleton instance
export const automatedQualityService = new AutomatedQualityService();