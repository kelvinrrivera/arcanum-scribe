/**
 * Quality Analytics Dashboard - Advanced Prompt System
 * 
 * This service provides comprehensive quality metrics visualization, trend analysis,
 * and improvement opportunity identification for the Advanced Prompt System.
 * Implements Requirements 5.1 and 5.5 from the spec.
 */

import { AutomatedQualityService, UnifiedQualityResult, QualityReport } from './automated-quality-service';
import { ContentQualityMetrics } from './content-quality-validator';
import { VisualQualityMetrics } from './visual-quality-validator';

// Analytics interfaces
export interface QualityTrend {
  timestamp: Date;
  overallScore: number;
  contentScore?: number;
  visualScore?: number;
  passRate: number;
  regenerationRate: number;
}

export interface QualityAnalytics {
  summary: QualityAnalyticsSummary;
  trends: QualityTrend[];
  metrics: DetailedMetricsAnalysis;
  improvements: ImprovementOpportunity[];
  recommendations: AnalyticsRecommendation[];
}

export interface QualityAnalyticsSummary {
  totalValidations: number;
  averageQualityScore: number;
  passRate: number;
  regenerationRate: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  lastUpdated: Date;
}

export interface DetailedMetricsAnalysis {
  contentMetrics: {
    narrativeCoherence: MetricAnalysis;
    characterDepth: MetricAnalysis;
    plotComplexity: MetricAnalysis;
    thematicConsistency: MetricAnalysis;
  };
  visualMetrics: {
    imageQuality: MetricAnalysis;
    visualConsistency: MetricAnalysis;
    professionalStandard: MetricAnalysis;
    narrativeAlignment: MetricAnalysis;
  };
}

export interface MetricAnalysis {
  currentAverage: number;
  trend: number; // Positive = improving, negative = declining
  bestScore: number;
  worstScore: number;
  improvementPotential: number;
  commonIssues: string[];
}

export interface ImprovementOpportunity {
  area: string;
  currentScore: number;
  potentialGain: number;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  estimatedImpact: string;
}

export interface AnalyticsRecommendation {
  type: 'threshold_adjustment' | 'prompt_optimization' | 'process_improvement' | 'quality_focus';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  expectedImpact: string;
  implementationSteps: string[];
}

export interface DashboardVisualization {
  chartType: 'line' | 'bar' | 'pie' | 'heatmap' | 'gauge';
  title: string;
  data: any;
  config: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    thresholds?: number[];
  };
}

/**
 * Quality Analytics Dashboard Service
 * Provides comprehensive analytics and visualization for quality metrics
 */
export class QualityAnalyticsDashboard {
  private qualityService: AutomatedQualityService;
  private qualityHistory: UnifiedQualityResult[] = [];
  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly TREND_ANALYSIS_WINDOW = 50; // Number of recent results to analyze for trends

  constructor() {
    this.qualityService = new AutomatedQualityService();
    console.log('📊 [ANALYTICS-DASHBOARD] Quality Analytics Dashboard initialized');
  }

  /**
   * Record quality validation result for analytics
   */
  recordQualityResult(result: UnifiedQualityResult): void {
    this.qualityHistory.push(result);
    
    // Maintain history size limit
    if (this.qualityHistory.length > this.MAX_HISTORY_SIZE) {
      this.qualityHistory = this.qualityHistory.slice(-this.MAX_HISTORY_SIZE);
    }

    console.log(`📊 [ANALYTICS-DASHBOARD] Quality result recorded (${this.qualityHistory.length} total)`);
  }

  /**
   * Generate comprehensive quality analytics
   */
  async generateQualityAnalytics(): Promise<QualityAnalytics> {
    console.log('📊 [ANALYTICS-DASHBOARD] Generating comprehensive quality analytics...');

    if (this.qualityHistory.length === 0) {
      return this.generateEmptyAnalytics();
    }

    const summary = this.generateAnalyticsSummary();
    const trends = this.generateQualityTrends();
    const metrics = this.generateDetailedMetricsAnalysis();
    const improvements = this.identifyImprovementOpportunities(metrics);
    const recommendations = this.generateAnalyticsRecommendations(summary, metrics, improvements);

    const analytics: QualityAnalytics = {
      summary,
      trends,
      metrics,
      improvements,
      recommendations
    };

    console.log(`📊 [ANALYTICS-DASHBOARD] Analytics generated:`);
    console.log(`   📈 Average Quality: ${summary.averageQualityScore}/10`);
    console.log(`   ✅ Pass Rate: ${(summary.passRate * 100).toFixed(1)}%`);
    console.log(`   📊 Trend: ${summary.trendDirection}`);
    console.log(`   🎯 Improvement Opportunities: ${improvements.length}`);

    return analytics;
  }

  /**
   * Generate quality trend analysis
   */
  generateQualityTrends(): QualityTrend[] {
    const trends: QualityTrend[] = [];
    const windowSize = 10; // Group results into windows for trend analysis

    for (let i = 0; i < this.qualityHistory.length; i += windowSize) {
      const window = this.qualityHistory.slice(i, i + windowSize);
      if (window.length === 0) continue;

      const overallScores = window.map(r => r.overallQualityScore);
      const contentScores = window
        .filter(r => r.contentResult)
        .map(r => r.contentResult!.metrics.overallScore);
      const visualScores = window
        .filter(r => r.visualResult)
        .map(r => r.visualResult!.metrics.overallScore);

      const passCount = window.filter(r => r.passesAllStandards).length;
      const regenerationCount = window.filter(r => r.regenerationResult).length;

      trends.push({
        timestamp: window[window.length - 1].timestamp,
        overallScore: this.calculateAverage(overallScores),
        contentScore: contentScores.length > 0 ? this.calculateAverage(contentScores) : undefined,
        visualScore: visualScores.length > 0 ? this.calculateAverage(visualScores) : undefined,
        passRate: passCount / window.length,
        regenerationRate: regenerationCount / window.length
      });
    }

    return trends.slice(-20); // Return last 20 trend points
  }

  /**
   * Generate detailed metrics analysis
   */
  generateDetailedMetricsAnalysis(): DetailedMetricsAnalysis {
    const contentResults = this.qualityHistory
      .filter(r => r.contentResult)
      .map(r => r.contentResult!.metrics);

    const visualResults = this.qualityHistory
      .filter(r => r.visualResult)
      .map(r => r.visualResult!.metrics);

    return {
      contentMetrics: {
        narrativeCoherence: this.analyzeMetric(contentResults, 'narrativeCoherence'),
        characterDepth: this.analyzeMetric(contentResults, 'characterDepth'),
        plotComplexity: this.analyzeMetric(contentResults, 'plotComplexity'),
        thematicConsistency: this.analyzeMetric(contentResults, 'thematicConsistency')
      },
      visualMetrics: {
        imageQuality: this.analyzeMetric(visualResults, 'imageQuality'),
        visualConsistency: this.analyzeMetric(visualResults, 'visualConsistency'),
        professionalStandard: this.analyzeMetric(visualResults, 'professionalStandard'),
        narrativeAlignment: this.analyzeMetric(visualResults, 'narrativeAlignment')
      }
    };
  }

  /**
   * Analyze individual metric performance
   */
  private analyzeMetric(results: any[], metricName: string): MetricAnalysis {
    if (results.length === 0) {
      return {
        currentAverage: 0,
        trend: 0,
        bestScore: 0,
        worstScore: 0,
        improvementPotential: 0,
        commonIssues: []
      };
    }

    const scores = results.map(r => r[metricName]).filter(s => s !== undefined);
    const recentScores = scores.slice(-this.TREND_ANALYSIS_WINDOW);
    const olderScores = scores.slice(0, -this.TREND_ANALYSIS_WINDOW);

    const currentAverage = this.calculateAverage(recentScores);
    const previousAverage = olderScores.length > 0 ? this.calculateAverage(olderScores) : currentAverage;
    const trend = currentAverage - previousAverage;

    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    const improvementPotential = 10 - currentAverage;

    return {
      currentAverage: Math.round(currentAverage * 10) / 10,
      trend: Math.round(trend * 100) / 100,
      bestScore: Math.round(bestScore * 10) / 10,
      worstScore: Math.round(worstScore * 10) / 10,
      improvementPotential: Math.round(improvementPotential * 10) / 10,
      commonIssues: this.identifyCommonIssues(metricName, scores)
    };
  }

  /**
   * Identify improvement opportunities
   */
  identifyImprovementOpportunities(metrics: DetailedMetricsAnalysis): ImprovementOpportunity[] {
    const opportunities: ImprovementOpportunity[] = [];

    // Analyze content metrics
    Object.entries(metrics.contentMetrics).forEach(([key, analysis]) => {
      if (analysis.currentAverage < 8.0 && analysis.improvementPotential > 1.0) {
        opportunities.push({
          area: `Content: ${this.formatMetricName(key)}`,
          currentScore: analysis.currentAverage,
          potentialGain: Math.min(analysis.improvementPotential, 2.0),
          priority: this.determinePriority(analysis.currentAverage, analysis.improvementPotential),
          actionItems: this.generateActionItems(key, 'content'),
          estimatedImpact: this.estimateImpact(analysis.improvementPotential)
        });
      }
    });

    // Analyze visual metrics
    Object.entries(metrics.visualMetrics).forEach(([key, analysis]) => {
      if (analysis.currentAverage < 8.0 && analysis.improvementPotential > 1.0) {
        opportunities.push({
          area: `Visual: ${this.formatMetricName(key)}`,
          currentScore: analysis.currentAverage,
          potentialGain: Math.min(analysis.improvementPotential, 2.0),
          priority: this.determinePriority(analysis.currentAverage, analysis.improvementPotential),
          actionItems: this.generateActionItems(key, 'visual'),
          estimatedImpact: this.estimateImpact(analysis.improvementPotential)
        });
      }
    });

    // Sort by priority and potential impact
    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.potentialGain - a.potentialGain;
    });
  }

  /**
   * Generate analytics recommendations
   */
  generateAnalyticsRecommendations(
    summary: QualityAnalyticsSummary,
    metrics: DetailedMetricsAnalysis,
    improvements: ImprovementOpportunity[]
  ): AnalyticsRecommendation[] {
    const recommendations: AnalyticsRecommendation[] = [];

    // Quality threshold recommendations
    if (summary.passRate < 0.7) {
      recommendations.push({
        type: 'threshold_adjustment',
        title: 'Consider Adjusting Quality Thresholds',
        description: `Current pass rate of ${(summary.passRate * 100).toFixed(1)}% is below optimal range. Consider temporarily lowering thresholds while improving base quality.`,
        priority: 'high',
        expectedImpact: 'Immediate improvement in pass rate while maintaining quality focus',
        implementationSteps: [
          'Review current threshold settings',
          'Analyze failed validations for common patterns',
          'Implement gradual threshold adjustment',
          'Monitor impact on quality outcomes'
        ]
      });
    }

    // Prompt optimization recommendations
    const lowPerformingAreas = improvements.filter(i => i.priority === 'high');
    if (lowPerformingAreas.length > 0) {
      recommendations.push({
        type: 'prompt_optimization',
        title: 'Optimize Prompts for Low-Performing Areas',
        description: `Focus prompt improvements on: ${lowPerformingAreas.map(i => i.area).join(', ')}`,
        priority: 'critical',
        expectedImpact: `Potential quality improvement of ${lowPerformingAreas.reduce((sum, i) => sum + i.potentialGain, 0).toFixed(1)} points`,
        implementationSteps: [
          'Analyze current prompts for identified weak areas',
          'Research best practices for improvement areas',
          'Implement A/B testing for prompt variations',
          'Monitor quality improvements over time'
        ]
      });
    }

    // Trend-based recommendations
    if (summary.trendDirection === 'declining') {
      recommendations.push({
        type: 'process_improvement',
        title: 'Address Declining Quality Trend',
        description: 'Quality metrics show a declining trend. Immediate investigation and corrective action needed.',
        priority: 'critical',
        expectedImpact: 'Prevent further quality degradation and restore improvement trajectory',
        implementationSteps: [
          'Investigate recent changes that may impact quality',
          'Review and validate current quality processes',
          'Implement additional quality checkpoints',
          'Establish quality monitoring alerts'
        ]
      });
    }

    // Regeneration rate recommendations
    if (summary.regenerationRate > 0.3) {
      recommendations.push({
        type: 'quality_focus',
        title: 'Reduce High Regeneration Rate',
        description: `${(summary.regenerationRate * 100).toFixed(1)}% regeneration rate indicates base quality issues`,
        priority: 'high',
        expectedImpact: 'Reduced processing time and improved user experience',
        implementationSteps: [
          'Analyze common regeneration triggers',
          'Improve base prompt quality',
          'Implement preventive quality measures',
          'Monitor regeneration rate trends'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate dashboard visualizations
   */
  generateDashboardVisualizations(): DashboardVisualization[] {
    const visualizations: DashboardVisualization[] = [];

    // Quality trend line chart
    const trends = this.generateQualityTrends();
    visualizations.push({
      chartType: 'line',
      title: 'Quality Score Trends',
      data: {
        labels: trends.map(t => t.timestamp.toISOString().split('T')[0]),
        datasets: [
          {
            label: 'Overall Quality',
            data: trends.map(t => t.overallScore),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'Content Quality',
            data: trends.map(t => t.contentScore || null),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          },
          {
            label: 'Visual Quality',
            data: trends.map(t => t.visualScore || null),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)'
          }
        ]
      },
      config: {
        xAxis: 'Date',
        yAxis: 'Quality Score (0-10)',
        thresholds: [8.0]
      }
    });

    // Pass rate gauge
    const summary = this.generateAnalyticsSummary();
    visualizations.push({
      chartType: 'gauge',
      title: 'Quality Pass Rate',
      data: {
        value: summary.passRate * 100,
        min: 0,
        max: 100,
        thresholds: [70, 85, 95]
      },
      config: {
        colors: ['#ef4444', '#f59e0b', '#10b981', '#059669']
      }
    });

    // Metrics heatmap
    const metrics = this.generateDetailedMetricsAnalysis();
    const heatmapData = [
      ['Narrative Coherence', metrics.contentMetrics.narrativeCoherence.currentAverage],
      ['Character Depth', metrics.contentMetrics.characterDepth.currentAverage],
      ['Plot Complexity', metrics.contentMetrics.plotComplexity.currentAverage],
      ['Thematic Consistency', metrics.contentMetrics.thematicConsistency.currentAverage],
      ['Image Quality', metrics.visualMetrics.imageQuality.currentAverage],
      ['Visual Consistency', metrics.visualMetrics.visualConsistency.currentAverage],
      ['Professional Standard', metrics.visualMetrics.professionalStandard.currentAverage],
      ['Narrative Alignment', metrics.visualMetrics.narrativeAlignment.currentAverage]
    ];

    visualizations.push({
      chartType: 'heatmap',
      title: 'Quality Metrics Heatmap',
      data: heatmapData,
      config: {
        colors: ['#ef4444', '#f59e0b', '#10b981'],
        thresholds: [6, 8]
      }
    });

    return visualizations;
  }

  /**
   * Generate analytics summary
   */
  private generateAnalyticsSummary(): QualityAnalyticsSummary {
    if (this.qualityHistory.length === 0) {
      return {
        totalValidations: 0,
        averageQualityScore: 0,
        passRate: 0,
        regenerationRate: 0,
        trendDirection: 'stable',
        lastUpdated: new Date()
      };
    }

    const recentResults = this.qualityHistory.slice(-this.TREND_ANALYSIS_WINDOW);
    const olderResults = this.qualityHistory.slice(0, -this.TREND_ANALYSIS_WINDOW);

    const averageQualityScore = this.calculateAverage(
      this.qualityHistory.map(r => r.overallQualityScore)
    );

    const passRate = this.qualityHistory.filter(r => r.passesAllStandards).length / this.qualityHistory.length;
    const regenerationRate = this.qualityHistory.filter(r => r.regenerationResult).length / this.qualityHistory.length;

    // Determine trend direction
    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
    if (olderResults.length > 0) {
      const recentAverage = this.calculateAverage(recentResults.map(r => r.overallQualityScore));
      const olderAverage = this.calculateAverage(olderResults.map(r => r.overallQualityScore));
      const trendDiff = recentAverage - olderAverage;
      
      if (trendDiff > 0.2) trendDirection = 'improving';
      else if (trendDiff < -0.2) trendDirection = 'declining';
    }

    return {
      totalValidations: this.qualityHistory.length,
      averageQualityScore: Math.round(averageQualityScore * 10) / 10,
      passRate: Math.round(passRate * 1000) / 1000,
      regenerationRate: Math.round(regenerationRate * 1000) / 1000,
      trendDirection,
      lastUpdated: new Date()
    };
  }

  /**
   * Generate empty analytics for when no data is available
   */
  private generateEmptyAnalytics(): QualityAnalytics {
    return {
      summary: {
        totalValidations: 0,
        averageQualityScore: 0,
        passRate: 0,
        regenerationRate: 0,
        trendDirection: 'stable',
        lastUpdated: new Date()
      },
      trends: [],
      metrics: {
        contentMetrics: {
          narrativeCoherence: this.getEmptyMetricAnalysis(),
          characterDepth: this.getEmptyMetricAnalysis(),
          plotComplexity: this.getEmptyMetricAnalysis(),
          thematicConsistency: this.getEmptyMetricAnalysis()
        },
        visualMetrics: {
          imageQuality: this.getEmptyMetricAnalysis(),
          visualConsistency: this.getEmptyMetricAnalysis(),
          professionalStandard: this.getEmptyMetricAnalysis(),
          narrativeAlignment: this.getEmptyMetricAnalysis()
        }
      },
      improvements: [],
      recommendations: [{
        type: 'process_improvement',
        title: 'Start Quality Tracking',
        description: 'No quality data available yet. Begin generating content to start tracking quality metrics.',
        priority: 'medium',
        expectedImpact: 'Enable quality monitoring and improvement',
        implementationSteps: [
          'Generate initial content samples',
          'Enable quality validation',
          'Review initial quality metrics',
          'Establish quality improvement processes'
        ]
      }]
    };
  }

  /**
   * Helper methods
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private getEmptyMetricAnalysis(): MetricAnalysis {
    return {
      currentAverage: 0,
      trend: 0,
      bestScore: 0,
      worstScore: 0,
      improvementPotential: 0,
      commonIssues: []
    };
  }

  private formatMetricName(name: string): string {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  private determinePriority(currentScore: number, potential: number): 'high' | 'medium' | 'low' {
    if (currentScore < 6.0 || potential > 2.0) return 'high';
    if (currentScore < 7.5 || potential > 1.5) return 'medium';
    return 'low';
  }

  private generateActionItems(metricName: string, type: 'content' | 'visual'): string[] {
    const actionMap: Record<string, string[]> = {
      narrativeCoherence: [
        'Review story structure and pacing requirements',
        'Enhance plot continuity validation',
        'Improve character relationship tracking'
      ],
      characterDepth: [
        'Add character motivation requirements',
        'Enhance personality trait specifications',
        'Improve dialogue quality standards'
      ],
      plotComplexity: [
        'Increase story sophistication requirements',
        'Add meaningful choice specifications',
        'Enhance conflict resolution depth'
      ],
      thematicConsistency: [
        'Strengthen theme reinforcement requirements',
        'Improve symbolic element integration',
        'Enhance tone consistency validation'
      ],
      imageQuality: [
        'Improve technical quality specifications',
        'Enhance resolution and clarity requirements',
        'Optimize lighting and composition prompts'
      ],
      visualConsistency: [
        'Strengthen style guide adherence',
        'Improve color palette consistency',
        'Enhance cross-image coherence validation'
      ],
      professionalStandard: [
        'Elevate professional quality requirements',
        'Improve publication readiness standards',
        'Enhance artistic craftsmanship specifications'
      ],
      narrativeAlignment: [
        'Improve story context integration',
        'Enhance narrative element accuracy',
        'Strengthen mood and tone alignment'
      ]
    };

    return actionMap[metricName] || ['Review and improve prompt specifications'];
  }

  private estimateImpact(potential: number): string {
    if (potential > 2.0) return 'High impact - significant quality improvement expected';
    if (potential > 1.0) return 'Medium impact - noticeable quality improvement expected';
    return 'Low impact - minor quality improvement expected';
  }

  private identifyCommonIssues(metricName: string, scores: number[]): string[] {
    // Simplified common issues identification
    const lowScores = scores.filter(s => s < 7.0).length;
    const totalScores = scores.length;
    
    if (lowScores / totalScores > 0.3) {
      return [`Frequent low scores in ${this.formatMetricName(metricName)}`];
    }
    
    return [];
  }

  /**
   * Get quality history for external analysis
   */
  getQualityHistory(): UnifiedQualityResult[] {
    return [...this.qualityHistory];
  }

  /**
   * Clear quality history (for testing or reset)
   */
  clearQualityHistory(): void {
    this.qualityHistory = [];
    console.log('📊 [ANALYTICS-DASHBOARD] Quality history cleared');
  }
}

// Export singleton instance
export const qualityAnalyticsDashboard = new QualityAnalyticsDashboard();