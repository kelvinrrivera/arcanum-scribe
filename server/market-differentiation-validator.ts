import { z } from 'zod';
import { uniquenessDetectionService } from './uniqueness-detection-service.js';
import { professionalPolishValidator } from './professional-polish-validator.js';
import { userSatisfactionMetrics } from './user-satisfaction-metrics.js';

// Schema for comprehensive market differentiation analysis
const MarketDifferentiationAnalysisSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(['adventure', 'npc', 'monster', 'location', 'item', 'image']),
  timestamp: z.date(),
  
  // Uniqueness metrics
  uniquenessScore: z.number().min(0).max(10),
  competitiveAdvantage: z.number().min(0).max(10),
  differentiationFactors: z.array(z.string()),
  genericityIndicators: z.array(z.string()),
  
  // Professional polish metrics
  publicationQualityScore: z.number().min(0).max(10),
  professionalStandardsScore: z.number().min(0).max(10),
  premiumQualityScore: z.number().min(0).max(10),
  marketReadiness: z.boolean(),
  
  // User satisfaction metrics (if available)
  userSatisfactionScore: z.number().min(0).max(10).optional(),
  recommendationRate: z.number().min(0).max(1).optional(),
  premiumPerceptionRate: z.number().min(0).max(1).optional(),
  
  // Overall assessment
  overallMarketDifferentiation: z.number().min(0).max(10),
  marketPosition: z.enum(['market_leader', 'competitive', 'standard', 'below_standard']),
  actionRequired: z.boolean(),
  
  // Recommendations
  priorityRecommendations: z.array(z.string()),
  improvementPlan: z.array(z.object({
    area: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    action: z.string(),
    expectedImpact: z.string(),
    timeframe: z.string()
  }))
});

type MarketDifferentiationAnalysis = z.infer<typeof MarketDifferentiationAnalysisSchema>;

// Market positioning thresholds
const MARKET_POSITIONING_THRESHOLDS = {
  market_leader: 8.5,
  competitive: 7.0,
  standard: 5.5,
  below_standard: 0
};

// Quality gates for market readiness
const QUALITY_GATES = {
  minimum_uniqueness: 6.0,
  minimum_professional_polish: 7.0,
  minimum_user_satisfaction: 7.5,
  minimum_overall_differentiation: 7.0
};

export class MarketDifferentiationValidator {
  /**
   * Perform comprehensive market differentiation analysis
   */
  async validateMarketDifferentiation(
    contentId: string,
    contentType: 'adventure' | 'npc' | 'monster' | 'location' | 'item' | 'image',
    content: string
  ): Promise<MarketDifferentiationAnalysis> {
    
    // Run uniqueness detection
    const uniquenessAnalysis = await uniquenessDetectionService.analyzeUniqueness(
      contentId, contentType, content
    );

    // Run professional polish validation
    const polishAnalysis = await professionalPolishValidator.validateProfessionalPolish(
      contentId, contentType, content
    );

    // Try to get user satisfaction data (may not exist for new content)
    let satisfactionAnalysis;
    try {
      satisfactionAnalysis = await userSatisfactionMetrics.analyzeSatisfaction(contentId);
    } catch (error) {
      // No satisfaction data available yet
      satisfactionAnalysis = null;
    }

    // Calculate overall market differentiation score
    const overallMarketDifferentiation = this.calculateOverallDifferentiation(
      uniquenessAnalysis.uniquenessScore,
      uniquenessAnalysis.competitiveAdvantage,
      polishAnalysis.publicationQualityScore,
      polishAnalysis.professionalStandardsScore,
      polishAnalysis.premiumQualityScore,
      satisfactionAnalysis?.averageOverallSatisfaction
    );

    // Determine market position
    const marketPosition = this.determineMarketPosition(overallMarketDifferentiation);

    // Check if action is required
    const actionRequired = this.isActionRequired(
      uniquenessAnalysis.uniquenessScore,
      polishAnalysis.publicationQualityScore,
      satisfactionAnalysis?.averageOverallSatisfaction,
      overallMarketDifferentiation
    );

    // Generate recommendations
    const priorityRecommendations = this.generatePriorityRecommendations(
      uniquenessAnalysis,
      polishAnalysis,
      satisfactionAnalysis,
      overallMarketDifferentiation
    );

    // Create improvement plan
    const improvementPlan = this.createImprovementPlan(
      uniquenessAnalysis,
      polishAnalysis,
      satisfactionAnalysis
    );

    return {
      contentId,
      contentType,
      timestamp: new Date(),
      
      // Uniqueness metrics
      uniquenessScore: uniquenessAnalysis.uniquenessScore,
      competitiveAdvantage: uniquenessAnalysis.competitiveAdvantage,
      differentiationFactors: uniquenessAnalysis.differentiationFactors,
      genericityIndicators: uniquenessAnalysis.genericityIndicators,
      
      // Professional polish metrics
      publicationQualityScore: polishAnalysis.publicationQualityScore,
      professionalStandardsScore: polishAnalysis.professionalStandardsScore,
      premiumQualityScore: polishAnalysis.premiumQualityScore,
      marketReadiness: polishAnalysis.marketReadiness,
      
      // User satisfaction metrics
      userSatisfactionScore: satisfactionAnalysis?.averageOverallSatisfaction,
      recommendationRate: satisfactionAnalysis?.recommendationRate,
      premiumPerceptionRate: satisfactionAnalysis?.premiumPerceptionRate,
      
      // Overall assessment
      overallMarketDifferentiation,
      marketPosition,
      actionRequired,
      
      // Recommendations
      priorityRecommendations,
      improvementPlan
    };
  }

  /**
   * Batch validate market differentiation for multiple content pieces
   */
  async batchValidateMarketDifferentiation(
    contentItems: Array<{
      id: string;
      type: 'adventure' | 'npc' | 'monster' | 'location' | 'item' | 'image';
      content: string;
    }>
  ): Promise<MarketDifferentiationAnalysis[]> {
    const analyses = await Promise.all(
      contentItems.map(item =>
        this.validateMarketDifferentiation(item.id, item.type, item.content)
      )
    );

    return analyses;
  }

  /**
   * Get market differentiation dashboard summary
   */
  async getMarketDifferentiationSummary(
    contentIds?: string[]
  ): Promise<{
    totalContent: number;
    averageMarketDifferentiation: number;
    marketPositionBreakdown: Record<string, number>;
    contentRequiringAction: number;
    topDifferentiators: string[];
    commonWeaknesses: string[];
    overallMarketPosition: string;
    competitiveAdvantageScore: number;
    recommendedActions: Array<{
      priority: string;
      action: string;
      impact: string;
      contentCount: number;
    }>;
  }> {
    // This would typically query your database for analyses
    // For now, we'll simulate with placeholder logic
    
    const analyses: MarketDifferentiationAnalysis[] = []; // Would be populated from DB
    
    if (analyses.length === 0) {
      return {
        totalContent: 0,
        averageMarketDifferentiation: 0,
        marketPositionBreakdown: {},
        contentRequiringAction: 0,
        topDifferentiators: [],
        commonWeaknesses: [],
        overallMarketPosition: 'insufficient_data',
        competitiveAdvantageScore: 0,
        recommendedActions: []
      };
    }

    const totalContent = analyses.length;
    const averageMarketDifferentiation = analyses.reduce(
      (sum, a) => sum + a.overallMarketDifferentiation, 0
    ) / totalContent;

    // Market position breakdown
    const marketPositionBreakdown = analyses.reduce((breakdown, analysis) => {
      breakdown[analysis.marketPosition] = (breakdown[analysis.marketPosition] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    const contentRequiringAction = analyses.filter(a => a.actionRequired).length;

    // Collect top differentiators
    const allDifferentiators = analyses.flatMap(a => a.differentiationFactors);
    const differentiatorCounts = allDifferentiators.reduce((counts, factor) => {
      counts[factor] = (counts[factor] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const topDifferentiators = Object.entries(differentiatorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([factor]) => factor);

    // Collect common weaknesses
    const allWeaknesses = analyses.flatMap(a => a.genericityIndicators);
    const weaknessCounts = allWeaknesses.reduce((counts, weakness) => {
      counts[weakness] = (counts[weakness] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const commonWeaknesses = Object.entries(weaknessCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([weakness]) => weakness);

    // Overall market position
    const overallMarketPosition = this.determineMarketPosition(averageMarketDifferentiation);

    // Competitive advantage score
    const competitiveAdvantageScore = analyses.reduce(
      (sum, a) => sum + a.competitiveAdvantage, 0
    ) / totalContent;

    // Recommended actions
    const recommendedActions = this.aggregateRecommendedActions(analyses);

    return {
      totalContent,
      averageMarketDifferentiation,
      marketPositionBreakdown,
      contentRequiringAction,
      topDifferentiators,
      commonWeaknesses,
      overallMarketPosition,
      competitiveAdvantageScore,
      recommendedActions
    };
  }

  /**
   * Calculate overall market differentiation score
   */
  private calculateOverallDifferentiation(
    uniquenessScore: number,
    competitiveAdvantage: number,
    publicationQuality: number,
    professionalStandards: number,
    premiumQuality: number,
    userSatisfaction?: number
  ): number {
    // Weighted calculation
    let totalWeight = 0;
    let weightedSum = 0;

    // Uniqueness (30% weight)
    const uniquenessWeight = 0.15;
    const competitiveWeight = 0.15;
    weightedSum += uniquenessScore * uniquenessWeight;
    weightedSum += competitiveAdvantage * competitiveWeight;
    totalWeight += uniquenessWeight + competitiveWeight;

    // Professional polish (40% weight)
    const publicationWeight = 0.15;
    const professionalWeight = 0.15;
    const premiumWeight = 0.10;
    weightedSum += publicationQuality * publicationWeight;
    weightedSum += professionalStandards * professionalWeight;
    weightedSum += premiumQuality * premiumWeight;
    totalWeight += publicationWeight + professionalWeight + premiumWeight;

    // User satisfaction (30% weight, if available)
    if (userSatisfaction !== undefined) {
      const satisfactionWeight = 0.30;
      weightedSum += userSatisfaction * satisfactionWeight;
      totalWeight += satisfactionWeight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Determine market position based on overall score
   */
  private determineMarketPosition(overallScore: number): 'market_leader' | 'competitive' | 'standard' | 'below_standard' {
    if (overallScore >= MARKET_POSITIONING_THRESHOLDS.market_leader) {
      return 'market_leader';
    } else if (overallScore >= MARKET_POSITIONING_THRESHOLDS.competitive) {
      return 'competitive';
    } else if (overallScore >= MARKET_POSITIONING_THRESHOLDS.standard) {
      return 'standard';
    } else {
      return 'below_standard';
    }
  }

  /**
   * Check if immediate action is required
   */
  private isActionRequired(
    uniquenessScore: number,
    publicationQuality: number,
    userSatisfaction: number | undefined,
    overallScore: number
  ): boolean {
    return (
      uniquenessScore < QUALITY_GATES.minimum_uniqueness ||
      publicationQuality < QUALITY_GATES.minimum_professional_polish ||
      (userSatisfaction !== undefined && userSatisfaction < QUALITY_GATES.minimum_user_satisfaction) ||
      overallScore < QUALITY_GATES.minimum_overall_differentiation
    );
  }

  /**
   * Generate priority recommendations
   */
  private generatePriorityRecommendations(
    uniquenessAnalysis: any,
    polishAnalysis: any,
    satisfactionAnalysis: any,
    overallScore: number
  ): string[] {
    const recommendations: string[] = [];

    // Critical issues first
    if (uniquenessAnalysis.uniquenessScore < QUALITY_GATES.minimum_uniqueness) {
      recommendations.push('CRITICAL: Improve content uniqueness to meet market differentiation standards');
    }

    if (polishAnalysis.publicationQualityScore < QUALITY_GATES.minimum_professional_polish) {
      recommendations.push('CRITICAL: Enhance professional polish to meet publication standards');
    }

    if (satisfactionAnalysis && satisfactionAnalysis.averageOverallSatisfaction < QUALITY_GATES.minimum_user_satisfaction) {
      recommendations.push('CRITICAL: Address user satisfaction issues immediately');
    }

    // High priority improvements
    if (uniquenessAnalysis.competitiveAdvantage < 6) {
      recommendations.push('HIGH: Strengthen competitive advantage through innovation');
    }

    if (!polishAnalysis.marketReadiness) {
      recommendations.push('HIGH: Achieve market readiness through quality improvements');
    }

    // Medium priority enhancements
    if (overallScore < 8) {
      recommendations.push('MEDIUM: Enhance overall market differentiation for leadership position');
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Create detailed improvement plan
   */
  private createImprovementPlan(
    uniquenessAnalysis: any,
    polishAnalysis: any,
    satisfactionAnalysis: any
  ): Array<{
    area: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    timeframe: string;
  }> {
    const plan: Array<{
      area: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      action: string;
      expectedImpact: string;
      timeframe: string;
    }> = [];

    // Uniqueness improvements
    if (uniquenessAnalysis.uniquenessScore < 7) {
      plan.push({
        area: 'Content Uniqueness',
        priority: uniquenessAnalysis.uniquenessScore < 5 ? 'critical' : 'high',
        action: 'Implement advanced prompt engineering and uniqueness validation',
        expectedImpact: 'Significant improvement in market differentiation',
        timeframe: '2-4 weeks'
      });
    }

    // Professional polish improvements
    if (polishAnalysis.publicationQualityScore < 7) {
      plan.push({
        area: 'Professional Polish',
        priority: polishAnalysis.publicationQualityScore < 5 ? 'critical' : 'high',
        action: 'Enhance quality validation and professional standards compliance',
        expectedImpact: 'Improved market readiness and user perception',
        timeframe: '1-3 weeks'
      });
    }

    // User satisfaction improvements
    if (satisfactionAnalysis && satisfactionAnalysis.averageOverallSatisfaction < 7) {
      plan.push({
        area: 'User Satisfaction',
        priority: satisfactionAnalysis.averageOverallSatisfaction < 5 ? 'critical' : 'high',
        action: 'Address user feedback and improve user experience',
        expectedImpact: 'Higher user retention and recommendations',
        timeframe: '2-6 weeks'
      });
    }

    return plan.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Aggregate recommended actions across multiple analyses
   */
  private aggregateRecommendedActions(analyses: MarketDifferentiationAnalysis[]): Array<{
    priority: string;
    action: string;
    impact: string;
    contentCount: number;
  }> {
    const actionCounts: Record<string, { priority: string; impact: string; count: number }> = {};

    analyses.forEach(analysis => {
      analysis.improvementPlan.forEach(item => {
        const key = item.action;
        if (!actionCounts[key]) {
          actionCounts[key] = {
            priority: item.priority,
            impact: item.expectedImpact,
            count: 0
          };
        }
        actionCounts[key].count++;
      });
    });

    return Object.entries(actionCounts)
      .map(([action, data]) => ({
        priority: data.priority,
        action,
        impact: data.impact,
        contentCount: data.count
      }))
      .sort((a, b) => b.contentCount - a.contentCount)
      .slice(0, 10);
  }
}

export const marketDifferentiationValidator = new MarketDifferentiationValidator();