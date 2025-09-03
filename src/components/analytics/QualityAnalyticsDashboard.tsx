/**
 * Quality Analytics Dashboard Component
 * 
 * React component for visualizing quality metrics, trends, and improvement opportunities
 * from the Advanced Prompt System quality validation system.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  LineChart,
  Target,
  Lightbulb
} from 'lucide-react';

// Types for analytics data
interface QualityAnalytics {
  summary: QualityAnalyticsSummary;
  trends: QualityTrend[];
  metrics: DetailedMetricsAnalysis;
  improvements: ImprovementOpportunity[];
  recommendations: AnalyticsRecommendation[];
}

interface QualityAnalyticsSummary {
  totalValidations: number;
  averageQualityScore: number;
  passRate: number;
  regenerationRate: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  lastUpdated: Date;
}

interface QualityTrend {
  timestamp: Date;
  overallScore: number;
  contentScore?: number;
  visualScore?: number;
  passRate: number;
  regenerationRate: number;
}

interface DetailedMetricsAnalysis {
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

interface MetricAnalysis {
  currentAverage: number;
  trend: number;
  bestScore: number;
  worstScore: number;
  improvementPotential: number;
  commonIssues: string[];
}

interface ImprovementOpportunity {
  area: string;
  currentScore: number;
  potentialGain: number;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  estimatedImpact: string;
}

interface AnalyticsRecommendation {
  type: 'threshold_adjustment' | 'prompt_optimization' | 'process_improvement' | 'quality_focus';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  expectedImpact: string;
  implementationSteps: string[];
}

export const QualityAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<QualityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/quality/analytics');
      if (!response.ok) {
        throw new Error('Failed to load quality analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quality analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Analytics</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Analytics Data</AlertTitle>
        <AlertDescription>No quality analytics data available yet.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quality Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor and analyze content quality metrics and trends
          </p>
        </div>
        <Button 
          onClick={refreshAnalytics} 
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Average Quality"
          value={`${analytics.summary.averageQualityScore}/10`}
          trend={analytics.summary.trendDirection}
          icon={<Target className="h-4 w-4" />}
        />
        <SummaryCard
          title="Pass Rate"
          value={`${(analytics.summary.passRate * 100).toFixed(1)}%`}
          trend={analytics.summary.passRate >= 0.8 ? 'improving' : 'declining'}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <SummaryCard
          title="Total Validations"
          value={analytics.summary.totalValidations.toString()}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <SummaryCard
          title="Regeneration Rate"
          value={`${(analytics.summary.regenerationRate * 100).toFixed(1)}%`}
          trend={analytics.summary.regenerationRate <= 0.2 ? 'improving' : 'declining'}
          icon={<LineChart className="h-4 w-4" />}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QualityTrendsChart trends={analytics.trends} />
            <MetricsOverview metrics={analytics.metrics} />
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <DetailedMetricsView metrics={analytics.metrics} />
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <ImprovementOpportunitiesView improvements={analytics.improvements} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationsView recommendations={analytics.recommendations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Summary Card Component
const SummaryCard: React.FC<{
  title: string;
  value: string;
  trend?: 'improving' | 'declining' | 'stable';
  icon: React.ReactNode;
}> = ({ title, value, trend, icon }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className={`flex items-center ${getTrendColor()}`}>
              {getTrendIcon()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Quality Trends Chart Component
const QualityTrendsChart: React.FC<{ trends: QualityTrend[] }> = ({ trends }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Trends</CardTitle>
        <CardDescription>Quality score trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        {trends.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No trend data available yet
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simplified trend visualization */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Quality</span>
                <span>{trends[trends.length - 1]?.overallScore.toFixed(1)}/10</span>
              </div>
              <Progress 
                value={(trends[trends.length - 1]?.overallScore || 0) * 10} 
                className="h-2"
              />
            </div>
            
            {trends[trends.length - 1]?.contentScore && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Content Quality</span>
                  <span>{trends[trends.length - 1].contentScore!.toFixed(1)}/10</span>
                </div>
                <Progress 
                  value={trends[trends.length - 1].contentScore! * 10} 
                  className="h-2"
                />
              </div>
            )}
            
            {trends[trends.length - 1]?.visualScore && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Visual Quality</span>
                  <span>{trends[trends.length - 1].visualScore!.toFixed(1)}/10</span>
                </div>
                <Progress 
                  value={trends[trends.length - 1].visualScore! * 10} 
                  className="h-2"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Metrics Overview Component
const MetricsOverview: React.FC<{ metrics: DetailedMetricsAnalysis }> = ({ metrics }) => {
  const allMetrics = [
    ...Object.entries(metrics.contentMetrics).map(([key, value]) => ({
      name: formatMetricName(key),
      category: 'Content',
      ...value
    })),
    ...Object.entries(metrics.visualMetrics).map(([key, value]) => ({
      name: formatMetricName(key),
      category: 'Visual',
      ...value
    }))
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Overview</CardTitle>
        <CardDescription>Current performance across all quality metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allMetrics.map((metric, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {metric.category}
                  </Badge>
                  {metric.name}
                </span>
                <span className="font-medium">
                  {metric.currentAverage.toFixed(1)}/10
                </span>
              </div>
              <Progress value={metric.currentAverage * 10} className="h-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Detailed Metrics View Component
const DetailedMetricsView: React.FC<{ metrics: DetailedMetricsAnalysis }> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Metrics</CardTitle>
          <CardDescription>Detailed analysis of content quality metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.contentMetrics).map(([key, analysis]) => (
              <MetricDetailCard key={key} name={formatMetricName(key)} analysis={analysis} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visual Metrics</CardTitle>
          <CardDescription>Detailed analysis of visual quality metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.visualMetrics).map(([key, analysis]) => (
              <MetricDetailCard key={key} name={formatMetricName(key)} analysis={analysis} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Metric Detail Card Component
const MetricDetailCard: React.FC<{ name: string; analysis: MetricAnalysis }> = ({ name, analysis }) => {
  const getTrendIcon = () => {
    if (analysis.trend > 0.1) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (analysis.trend < -0.1) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-600" />;
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">{name}</h4>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className="text-sm font-medium">{analysis.currentAverage.toFixed(1)}/10</span>
        </div>
      </div>
      <Progress value={analysis.currentAverage * 10} className="h-1" />
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
        <div>Best: {analysis.bestScore.toFixed(1)}</div>
        <div>Worst: {analysis.worstScore.toFixed(1)}</div>
        <div>Potential: +{analysis.improvementPotential.toFixed(1)}</div>
      </div>
    </div>
  );
};

// Improvement Opportunities View Component
const ImprovementOpportunitiesView: React.FC<{ improvements: ImprovementOpportunity[] }> = ({ improvements }) => {
  return (
    <div className="space-y-4">
      {improvements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Major Improvements Needed</h3>
            <p className="text-gray-600">All quality metrics are performing well!</p>
          </CardContent>
        </Card>
      ) : (
        improvements.map((improvement, index) => (
          <ImprovementCard key={index} improvement={improvement} />
        ))
      )}
    </div>
  );
};

// Improvement Card Component
const ImprovementCard: React.FC<{ improvement: ImprovementOpportunity }> = ({ improvement }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{improvement.area}</CardTitle>
            <CardDescription>{improvement.estimatedImpact}</CardDescription>
          </div>
          <Badge variant={getPriorityColor(improvement.priority)}>
            {improvement.priority} priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Current Score:</span>
            <span className="font-medium">{improvement.currentScore.toFixed(1)}/10</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Potential Gain:</span>
            <span className="font-medium text-green-600">+{improvement.potentialGain.toFixed(1)}</span>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Action Items:</h4>
            <ul className="space-y-1">
              {improvement.actionItems.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Recommendations View Component
const RecommendationsView: React.FC<{ recommendations: AnalyticsRecommendation[] }> = ({ recommendations }) => {
  return (
    <div className="space-y-4">
      {recommendations.map((recommendation, index) => (
        <RecommendationCard key={index} recommendation={recommendation} />
      ))}
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard: React.FC<{ recommendation: AnalyticsRecommendation }> = ({ recommendation }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-600 mt-1" />
            <div>
              <CardTitle className="text-lg">{recommendation.title}</CardTitle>
              <CardDescription>{recommendation.description}</CardDescription>
            </div>
          </div>
          <Badge variant={getPriorityColor(recommendation.priority)}>
            {recommendation.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Expected Impact:</h4>
            <p className="text-sm text-gray-600">{recommendation.expectedImpact}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Implementation Steps:</h4>
            <ol className="space-y-1">
              {recommendation.implementationSteps.map((step, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-600 font-medium">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function
const formatMetricName = (name: string): string => {
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export default QualityAnalyticsDashboard;