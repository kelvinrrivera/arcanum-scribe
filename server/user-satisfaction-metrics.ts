import { z } from 'zod';

// Schema for user satisfaction tracking
const UserSatisfactionMetricSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  contentType: z.enum(['adventure', 'npc', 'monster', 'location', 'item', 'image']),
  timestamp: z.date(),
  qualityRating: z.number().min(1).max(10),
  usabilityRating: z.number().min(1).max(10),
  creativityRating: z.number().min(1).max(10),
  overallSatisfaction: z.number().min(1).max(10),
  feedback: z.string().optional(),
  wouldRecommend: z.boolean(),
  premiumQualityPerception: z.boolean(),
  competitorComparison: z.enum(['much_better', 'better', 'same', 'worse', 'much_worse']).optional(),
  usageContext: z.enum(['personal_game', 'professional_use', 'commercial_project', 'educational']).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional()
});

const SatisfactionAnalysisSchema = z.object({
  contentId: z.string(),
  contentType: z.string(),
  totalRatings: z.number(),
  averageQuality: z.number(),
  averageUsability: z.number(),
  averageCreativity: z.number(),
  averageOverallSatisfaction: z.number(),
  recommendationRate: z.number(),
  premiumPerceptionRate: z.number(),
  competitorAdvantageScore: z.number(),
  satisfactionTrend: z.enum(['improving', 'stable', 'declining']),
  userSegmentBreakdown: z.record(z.any()),
  commonFeedbackThemes: z.array(z.string()),
  improvementOpportunities: z.array(z.string())
});

type UserSatisfactionMetric = z.infer<typeof UserSatisfactionMetricSchema>;
type SatisfactionAnalysis = z.infer<typeof SatisfactionAnalysisSchema>;

// Satisfaction benchmarks and thresholds
const SATISFACTION_BENCHMARKS = {
  excellent: 8.5,
  good: 7.0,
  acceptable: 6.0,
  poor: 4.0
};

const QUALITY_PERCEPTION_INDICATORS = {
  premium: [
    'professional', 'polished', 'high-quality', 'excellent',
    'outstanding', 'exceptional', 'masterful', 'publication-ready'
  ],
  standard: [
    'good', 'decent', 'adequate', 'satisfactory',
    'acceptable', 'reasonable', 'fair', 'okay'
  ],
  poor: [
    'poor', 'low-quality', 'disappointing', 'subpar',
    'mediocre', 'lacking', 'insufficient', 'amateur'
  ]
};

export class UserSatisfactionMetrics {
  private satisfactionData: Map<string, UserSatisfactionMetric[]> = new Map();

  /**
   * Record user satisfaction feedback
   */
  async recordSatisfaction(satisfaction: Omit<UserSatisfactionMetric, 'timestamp'>): Promise<void> {
    const metric: UserSatisfactionMetric = {
      ...satisfaction,
      timestamp: new Date()
    };

    const contentKey = metric.contentId;
    const existing = this.satisfactionData.get(contentKey) || [];
    existing.push(metric);
    this.satisfactionData.set(contentKey, existing);

    // Store in database (implementation would depend on your DB setup)
    await this.persistSatisfactionMetric(metric);
  }

  /**
   * Analyze satisfaction for specific content
   */
  async analyzeSatisfaction(contentId: string): Promise<SatisfactionAnalysis> {
    const metrics = this.satisfactionData.get(contentId) || [];
    
    if (metrics.length === 0) {
      throw new Error(`No satisfaction data found for content ${contentId}`);
    }

    const contentType = metrics[0].contentType;
    const totalRatings = metrics.length;

    // Calculate averages
    const averageQuality = this.calculateAverage(metrics, 'qualityRating');
    const averageUsability = this.calculateAverage(metrics, 'usabilityRating');
    const averageCreativity = this.calculateAverage(metrics, 'creativityRating');
    const averageOverallSatisfaction = this.calculateAverage(metrics, 'overallSatisfaction');

    // Calculate rates
    const recommendationRate = metrics.filter(m => m.wouldRecommend).length / totalRatings;
    const premiumPerceptionRate = metrics.filter(m => m.premiumQualityPerception).length / totalRatings;

    // Calculate competitive advantage
    const competitorAdvantageScore = this.calculateCompetitorAdvantage(metrics);

    // Determine satisfaction trend
    const satisfactionTrend = this.calculateSatisfactionTrend(metrics);

    // Analyze user segments
    const userSegmentBreakdown = this.analyzeUserSegments(metrics);

    // Extract feedback themes
    const commonFeedbackThemes = this.extractFeedbackThemes(metrics);

    // Generate improvement opportunities
    const improvementOpportunities = this.identifyImprovementOpportunities(metrics);

    return {
      contentId,
      contentType,
      totalRatings,
      averageQuality,
      averageUsability,
      averageCreativity,
      averageOverallSatisfaction,
      recommendationRate,
      premiumPerceptionRate,
      competitorAdvantageScore,
      satisfactionTrend,
      userSegmentBreakdown,
      commonFeedbackThemes,
      improvementOpportunities
    };
  }

  /**
   * Get satisfaction summary across all content
   */
  async getOverallSatisfactionSummary(): Promise<{
    totalUsers: number;
    totalRatings: number;
    averageOverallSatisfaction: number;
    recommendationRate: number;
    premiumPerceptionRate: number;
    competitorAdvantageScore: number;
    satisfactionByContentType: Record<string, number>;
    topPerformingContent: Array<{ contentId: string; satisfaction: number }>;
    improvementPriorities: string[];
  }> {
    const allMetrics = Array.from(this.satisfactionData.values()).flat();
    
    if (allMetrics.length === 0) {
      throw new Error('No satisfaction data available');
    }

    const uniqueUsers = new Set(allMetrics.map(m => m.userId)).size;
    const totalRatings = allMetrics.length;
    const averageOverallSatisfaction = this.calculateAverage(allMetrics, 'overallSatisfaction');
    const recommendationRate = allMetrics.filter(m => m.wouldRecommend).length / totalRatings;
    const premiumPerceptionRate = allMetrics.filter(m => m.premiumQualityPerception).length / totalRatings;
    const competitorAdvantageScore = this.calculateCompetitorAdvantage(allMetrics);

    // Satisfaction by content type
    const satisfactionByContentType = this.calculateSatisfactionByContentType(allMetrics);

    // Top performing content
    const topPerformingContent = this.getTopPerformingContent();

    // Improvement priorities
    const improvementPriorities = this.getImprovementPriorities(allMetrics);

    return {
      totalUsers: uniqueUsers,
      totalRatings,
      averageOverallSatisfaction,
      recommendationRate,
      premiumPerceptionRate,
      competitorAdvantageScore,
      satisfactionByContentType,
      topPerformingContent,
      improvementPriorities
    };
  }

  /**
   * Track quality perception over time
   */
  async trackQualityPerceptionTrend(
    timeframe: 'week' | 'month' | 'quarter'
  ): Promise<Array<{
    period: string;
    averageSatisfaction: number;
    premiumPerceptionRate: number;
    recommendationRate: number;
    sampleSize: number;
  }>> {
    const allMetrics = Array.from(this.satisfactionData.values()).flat();
    const now = new Date();
    
    let periods: Date[] = [];
    let periodLength: number;

    switch (timeframe) {
      case 'week':
        periodLength = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
        for (let i = 11; i >= 0; i--) {
          periods.push(new Date(now.getTime() - i * periodLength));
        }
        break;
      case 'month':
        periodLength = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
        for (let i = 11; i >= 0; i--) {
          periods.push(new Date(now.getTime() - i * periodLength));
        }
        break;
      case 'quarter':
        periodLength = 90 * 24 * 60 * 60 * 1000; // 90 days in ms
        for (let i = 3; i >= 0; i--) {
          periods.push(new Date(now.getTime() - i * periodLength));
        }
        break;
    }

    return periods.map((periodStart, index) => {
      const periodEnd = new Date(periodStart.getTime() + periodLength);
      const periodMetrics = allMetrics.filter(m => 
        m.timestamp >= periodStart && m.timestamp < periodEnd
      );

      const averageSatisfaction = periodMetrics.length > 0 
        ? this.calculateAverage(periodMetrics, 'overallSatisfaction')
        : 0;
      
      const premiumPerceptionRate = periodMetrics.length > 0
        ? periodMetrics.filter(m => m.premiumQualityPerception).length / periodMetrics.length
        : 0;

      const recommendationRate = periodMetrics.length > 0
        ? periodMetrics.filter(m => m.wouldRecommend).length / periodMetrics.length
        : 0;

      return {
        period: this.formatPeriod(periodStart, timeframe),
        averageSatisfaction,
        premiumPerceptionRate,
        recommendationRate,
        sampleSize: periodMetrics.length
      };
    });
  }

  /**
   * Generate satisfaction improvement recommendations
   */
  async generateImprovementRecommendations(contentId?: string): Promise<{
    priority: 'high' | 'medium' | 'low';
    category: 'quality' | 'usability' | 'creativity' | 'overall';
    recommendation: string;
    expectedImpact: string;
    implementationEffort: 'low' | 'medium' | 'high';
  }[]> {
    const metrics = contentId 
      ? this.satisfactionData.get(contentId) || []
      : Array.from(this.satisfactionData.values()).flat();

    const recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      category: 'quality' | 'usability' | 'creativity' | 'overall';
      recommendation: string;
      expectedImpact: string;
      implementationEffort: 'low' | 'medium' | 'high';
    }> = [];

    // Analyze weak areas
    const avgQuality = this.calculateAverage(metrics, 'qualityRating');
    const avgUsability = this.calculateAverage(metrics, 'usabilityRating');
    const avgCreativity = this.calculateAverage(metrics, 'creativityRating');
    const avgOverall = this.calculateAverage(metrics, 'overallSatisfaction');

    if (avgQuality < SATISFACTION_BENCHMARKS.good) {
      recommendations.push({
        priority: 'high',
        category: 'quality',
        recommendation: 'Implement stricter quality validation and regeneration triggers',
        expectedImpact: 'Significant improvement in perceived content quality',
        implementationEffort: 'medium'
      });
    }

    if (avgUsability < SATISFACTION_BENCHMARKS.good) {
      recommendations.push({
        priority: 'high',
        category: 'usability',
        recommendation: 'Enhance GM usability with clearer instructions and better organization',
        expectedImpact: 'Improved user experience and adoption',
        implementationEffort: 'low'
      });
    }

    if (avgCreativity < SATISFACTION_BENCHMARKS.good) {
      recommendations.push({
        priority: 'medium',
        category: 'creativity',
        recommendation: 'Enhance prompt engineering for more innovative and unique content',
        expectedImpact: 'Better market differentiation and user engagement',
        implementationEffort: 'high'
      });
    }

    // Analyze feedback themes
    const feedbackThemes = this.extractFeedbackThemes(metrics);
    feedbackThemes.forEach(theme => {
      if (theme.includes('generic') || theme.includes('repetitive')) {
        recommendations.push({
          priority: 'high',
          category: 'creativity',
          recommendation: 'Implement uniqueness detection and enforce content differentiation',
          expectedImpact: 'Reduced generic content and improved market positioning',
          implementationEffort: 'medium'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate average for a specific metric
   */
  private calculateAverage(metrics: UserSatisfactionMetric[], field: keyof UserSatisfactionMetric): number {
    const values = metrics.map(m => m[field]).filter(v => typeof v === 'number') as number[];
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  /**
   * Calculate competitive advantage score
   */
  private calculateCompetitorAdvantage(metrics: UserSatisfactionMetric[]): number {
    const comparisons = metrics.filter(m => m.competitorComparison);
    if (comparisons.length === 0) return 5; // Neutral if no data

    const scores = {
      much_better: 10,
      better: 7.5,
      same: 5,
      worse: 2.5,
      much_worse: 0
    };

    const totalScore = comparisons.reduce((sum, m) => 
      sum + scores[m.competitorComparison!], 0
    );

    return totalScore / comparisons.length;
  }

  /**
   * Calculate satisfaction trend
   */
  private calculateSatisfactionTrend(metrics: UserSatisfactionMetric[]): 'improving' | 'stable' | 'declining' {
    if (metrics.length < 10) return 'stable'; // Need sufficient data

    const sortedMetrics = metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const midPoint = Math.floor(sortedMetrics.length / 2);
    
    const firstHalf = sortedMetrics.slice(0, midPoint);
    const secondHalf = sortedMetrics.slice(midPoint);

    const firstAvg = this.calculateAverage(firstHalf, 'overallSatisfaction');
    const secondAvg = this.calculateAverage(secondHalf, 'overallSatisfaction');

    const difference = secondAvg - firstAvg;

    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  /**
   * Analyze user segments
   */
  private analyzeUserSegments(metrics: UserSatisfactionMetric[]): Record<string, any> {
    const segments: Record<string, any> = {};

    // By experience level
    const byExperience = metrics.reduce((acc, m) => {
      const level = m.experienceLevel || 'unknown';
      if (!acc[level]) acc[level] = [];
      acc[level].push(m);
      return acc;
    }, {} as Record<string, UserSatisfactionMetric[]>);

    segments.byExperience = Object.entries(byExperience).map(([level, levelMetrics]) => ({
      level,
      count: levelMetrics.length,
      averageSatisfaction: this.calculateAverage(levelMetrics, 'overallSatisfaction'),
      recommendationRate: levelMetrics.filter(m => m.wouldRecommend).length / levelMetrics.length
    }));

    // By usage context
    const byContext = metrics.reduce((acc, m) => {
      const context = m.usageContext || 'unknown';
      if (!acc[context]) acc[context] = [];
      acc[context].push(m);
      return acc;
    }, {} as Record<string, UserSatisfactionMetric[]>);

    segments.byContext = Object.entries(byContext).map(([context, contextMetrics]) => ({
      context,
      count: contextMetrics.length,
      averageSatisfaction: this.calculateAverage(contextMetrics, 'overallSatisfaction'),
      premiumPerception: contextMetrics.filter(m => m.premiumQualityPerception).length / contextMetrics.length
    }));

    return segments;
  }

  /**
   * Extract common feedback themes
   */
  private extractFeedbackThemes(metrics: UserSatisfactionMetric[]): string[] {
    const feedbacks = metrics.map(m => m.feedback).filter(Boolean) as string[];
    const themes: Record<string, number> = {};

    // Simple keyword-based theme extraction
    const keywords = [
      'quality', 'creative', 'unique', 'generic', 'repetitive',
      'professional', 'polished', 'detailed', 'engaging',
      'useful', 'practical', 'easy', 'difficult', 'confusing'
    ];

    keywords.forEach(keyword => {
      const count = feedbacks.filter(feedback => 
        feedback.toLowerCase().includes(keyword)
      ).length;
      
      if (count > 0) {
        themes[keyword] = count;
      }
    });

    return Object.entries(themes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  /**
   * Identify improvement opportunities
   */
  private identifyImprovementOpportunities(metrics: UserSatisfactionMetric[]): string[] {
    const opportunities: string[] = [];

    const avgQuality = this.calculateAverage(metrics, 'qualityRating');
    const avgUsability = this.calculateAverage(metrics, 'usabilityRating');
    const avgCreativity = this.calculateAverage(metrics, 'creativityRating');

    if (avgQuality < SATISFACTION_BENCHMARKS.good) {
      opportunities.push('Improve content quality standards');
    }

    if (avgUsability < SATISFACTION_BENCHMARKS.good) {
      opportunities.push('Enhance user experience and usability');
    }

    if (avgCreativity < SATISFACTION_BENCHMARKS.good) {
      opportunities.push('Increase creativity and uniqueness');
    }

    const premiumRate = metrics.filter(m => m.premiumQualityPerception).length / metrics.length;
    if (premiumRate < 0.7) {
      opportunities.push('Strengthen premium quality perception');
    }

    const recommendationRate = metrics.filter(m => m.wouldRecommend).length / metrics.length;
    if (recommendationRate < 0.8) {
      opportunities.push('Improve overall user satisfaction for recommendations');
    }

    return opportunities;
  }

  /**
   * Calculate satisfaction by content type
   */
  private calculateSatisfactionByContentType(metrics: UserSatisfactionMetric[]): Record<string, number> {
    const byType = metrics.reduce((acc, m) => {
      if (!acc[m.contentType]) acc[m.contentType] = [];
      acc[m.contentType].push(m);
      return acc;
    }, {} as Record<string, UserSatisfactionMetric[]>);

    return Object.entries(byType).reduce((result, [type, typeMetrics]) => {
      result[type] = this.calculateAverage(typeMetrics, 'overallSatisfaction');
      return result;
    }, {} as Record<string, number>);
  }

  /**
   * Get top performing content
   */
  private getTopPerformingContent(): Array<{ contentId: string; satisfaction: number }> {
    return Array.from(this.satisfactionData.entries())
      .map(([contentId, metrics]) => ({
        contentId,
        satisfaction: this.calculateAverage(metrics, 'overallSatisfaction')
      }))
      .sort((a, b) => b.satisfaction - a.satisfaction)
      .slice(0, 10);
  }

  /**
   * Get improvement priorities
   */
  private getImprovementPriorities(metrics: UserSatisfactionMetric[]): string[] {
    const priorities: string[] = [];

    const avgOverall = this.calculateAverage(metrics, 'overallSatisfaction');
    if (avgOverall < SATISFACTION_BENCHMARKS.acceptable) {
      priorities.push('Critical: Overall satisfaction below acceptable threshold');
    }

    const premiumRate = metrics.filter(m => m.premiumQualityPerception).length / metrics.length;
    if (premiumRate < 0.5) {
      priorities.push('High: Premium quality perception needs improvement');
    }

    const competitorScore = this.calculateCompetitorAdvantage(metrics);
    if (competitorScore < 6) {
      priorities.push('High: Competitive advantage is weak');
    }

    return priorities;
  }

  /**
   * Format period for display
   */
  private formatPeriod(date: Date, timeframe: string): string {
    switch (timeframe) {
      case 'week':
        return `Week of ${date.toLocaleDateString()}`;
      case 'month':
        return `${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      default:
        return date.toLocaleDateString();
    }
  }

  /**
   * Persist satisfaction metric to database
   */
  private async persistSatisfactionMetric(metric: UserSatisfactionMetric): Promise<void> {
    // Implementation would depend on your database setup
    // This is a placeholder for the actual database persistence logic
    console.log('Persisting satisfaction metric:', metric);
  }
}

export const userSatisfactionMetrics = new UserSatisfactionMetrics();