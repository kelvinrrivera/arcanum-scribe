/**
 * Continuous Improvement Dashboard Component
 * 
 * React component for visualizing continuous improvement metrics, automated actions,
 * and system optimization from the Advanced Prompt System.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Switch } from '../ui/switch';
import { 
  Zap, 
  TrendingUp, 
  Settings, 
  Bot, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  Activity,
  Gauge,
  Cog,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

// Types for continuous improvement data
interface ContinuousImprovementAnalysis {
  summary: ImprovementSummary;
  promptOptimization: PromptOptimizationAnalysis;
  qualityTrends: QualityTrendAnalysis;
  systemPerformance: SystemPerformanceAnalysis;
  improvementRecommendations: ImprovementRecommendation[];
  automatedActions: AutomatedAction[];
}

interface ImprovementSummary {
  overallImprovementScore: number;
  improvementVelocity: number;
  systemMaturity: SystemMaturity;
  automationLevel: number;
  lastOptimization: Date;
  nextOptimizationDue: Date;
  criticalIssuesCount: number;
  improvementOpportunitiesCount: number;
}

interface PromptOptimizationAnalysis {
  currentPrompts: PromptAnalysis[];
  optimizationOpportunities: PromptOptimizationOpportunity[];
  performanceMetrics: PromptPerformanceMetrics;
  abTestResults: ABTestResult[];
  recommendedOptimizations: PromptOptimization[];
}

interface PromptAnalysis {
  promptId: string;
  promptType: 'adventure' | 'npc' | 'monster' | 'image' | 'quality_validation';
  currentVersion: string;
  performanceScore: number;
  qualityScore: number;
  usageFrequency: number;
  lastUpdated: Date;
  improvementPotential: number;
  issues: string[];
  strengths: string[];
}

interface PromptOptimizationOpportunity {
  promptId: string;
  opportunityType: 'quality_improvement' | 'performance_enhancement' | 'consistency_fix' | 'innovation_addition';
  description: string;
  potentialImpact: number;
  implementationDifficulty: number;
  estimatedTimeframe: string;
  requiredResources: string[];
  expectedOutcome: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface PromptPerformanceMetrics {
  averageQualityScore: number;
  averageGenerationTime: number;
  successRate: number;
  userSatisfactionScore: number;
  consistencyScore: number;
  innovationScore: number;
  competitiveAdvantageScore: number;
}

interface ABTestResult {
  testId: string;
  promptType: string;
  variantA: PromptVariant;
  variantB: PromptVariant;
  winner: 'A' | 'B' | 'inconclusive';
  confidenceLevel: number;
  sampleSize: number;
  testDuration: string;
  keyFindings: string[];
  recommendedAction: string;
}

interface PromptVariant {
  version: string;
  qualityScore: number;
  performanceScore: number;
  userPreference: number;
  statisticalSignificance: boolean;
}

interface QualityTrendAnalysis {
  overallTrend: TrendDirection;
  trendStrength: number;
  trendDuration: string;
  keyInfluencers: TrendInfluencer[];
  predictedTrajectory: QualityPrediction[];
  anomalies: QualityAnomaly[];
  seasonalPatterns: SeasonalPattern[];
}

interface TrendInfluencer {
  factor: string;
  impact: number;
  confidence: number;
  description: string;
  actionable: boolean;
}

interface QualityPrediction {
  timeframe: string;
  predictedScore: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  assumptions: string[];
}

interface SystemPerformanceAnalysis {
  systemHealth: SystemHealth;
  performanceMetrics: SystemPerformanceMetrics;
  scalabilityAnalysis: ScalabilityAnalysis;
  reliabilityMetrics: ReliabilityMetrics;
  efficiencyMetrics: EfficiencyMetrics;
}

interface SystemHealth {
  overallHealth: number;
  componentHealth: ComponentHealth[];
  criticalIssues: SystemIssue[];
  warnings: SystemWarning[];
  uptime: number;
  lastHealthCheck: Date;
}

interface ComponentHealth {
  component: string;
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  lastChecked: Date;
  issues: string[];
}

interface ImprovementRecommendation {
  recommendationId: string;
  category: 'prompt_optimization' | 'system_performance' | 'quality_enhancement' | 'automation_improvement';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  expectedImpact: string;
  implementationComplexity: 'low' | 'medium' | 'high';
  timeframe: string;
  requiredResources: string[];
  successMetrics: string[];
}

interface AutomatedAction {
  actionId: string;
  actionType: 'prompt_adjustment' | 'threshold_update' | 'performance_optimization' | 'quality_improvement';
  description: string;
  executedAt: Date;
  result: AutomationResult;
  impact: string;
  nextScheduled?: Date;
}

interface AutomationResult {
  success: boolean;
  changes: string[];
  metrics: {
    before: Record<string, number>;
    after: Record<string, number>;
  };
  issues: string[];
}

type SystemMaturity = 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
type TrendDirection = 'improving' | 'stable' | 'declining' | 'volatile';

export const ContinuousImprovementDashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<ContinuousImprovementAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  // Load continuous improvement analysis data
  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/improvement/analysis');
      if (!response.ok) {
        throw new Error('Failed to load continuous improvement analysis');
      }
      
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalysis = async () => {
    setRefreshing(true);
    await loadAnalysis();
    setRefreshing(false);
  };

  const toggleAutomation = async () => {
    try {
      const response = await fetch('/api/improvement/automation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !automationEnabled })
      });
      
      if (response.ok) {
        setAutomationEnabled(!automationEnabled);
      }
    } catch (err) {
      console.error('Failed to toggle automation:', err);
    }
  };

  const forceOptimization = async () => {
    try {
      setOptimizing(true);
      const response = await fetch('/api/improvement/optimize', {
        method: 'POST'
      });
      
      if (response.ok) {
        await refreshAnalysis();
      }
    } catch (err) {
      console.error('Failed to force optimization:', err);
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading continuous improvement analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Analysis</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Analysis Data</AlertTitle>
        <AlertDescription>No continuous improvement analysis data available yet.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Continuous Improvement Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor automated optimization and system improvements
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Automation</span>
            <Switch 
              checked={automationEnabled} 
              onCheckedChange={toggleAutomation}
            />
            {automationEnabled ? (
              <PlayCircle className="h-4 w-4 text-green-600" />
            ) : (
              <PauseCircle className="h-4 w-4 text-gray-600" />
            )}
          </div>
          <Button 
            onClick={forceOptimization} 
            disabled={optimizing}
            variant="outline"
          >
            {optimizing ? 'Optimizing...' : 'Force Optimization'}
          </Button>
          <Button 
            onClick={refreshAnalysis} 
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Improvement Score"
          value={`${analysis.summary.overallImprovementScore}/10`}
          icon={<Target className="h-4 w-4" />}
          color="blue"
        />
        <SummaryCard
          title="System Maturity"
          value={formatSystemMaturity(analysis.summary.systemMaturity)}
          icon={<Gauge className="h-4 w-4" />}
          color="green"
        />
        <SummaryCard
          title="Automation Level"
          value={`${analysis.summary.automationLevel}/10`}
          icon={<Bot className="h-4 w-4" />}
          color="purple"
        />
        <SummaryCard
          title="Improvement Velocity"
          value={`${analysis.summary.improvementVelocity > 0 ? '+' : ''}${analysis.summary.improvementVelocity.toFixed(2)}`}
          icon={<TrendingUp className="h-4 w-4" />}
          color={analysis.summary.improvementVelocity > 0 ? "green" : "red"}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prompts">Prompt Optimization</TabsTrigger>
          <TabsTrigger value="trends">Quality Trends</TabsTrigger>
          <TabsTrigger value="performance">System Performance</TabsTrigger>
          <TabsTrigger value="actions">Automated Actions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImprovementOverview summary={analysis.summary} />
            <SystemHealthOverview health={analysis.systemPerformance.systemHealth} />
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <PromptOptimizationView optimization={analysis.promptOptimization} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <QualityTrendsView trends={analysis.qualityTrends} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <SystemPerformanceView performance={analysis.systemPerformance} />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <AutomatedActionsView actions={analysis.automatedActions} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationsView recommendations={analysis.improvementRecommendations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Summary Card Component
const SummaryCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={colorClasses[color] || colorClasses.blue}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

// Improvement Overview Component
const ImprovementOverview: React.FC<{ summary: ImprovementSummary }> = ({ summary }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Improvement Overview</CardTitle>
        <CardDescription>Current improvement status and metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Overall Improvement Score</span>
            <span className="font-medium">{summary.overallImprovementScore}/10</span>
          </div>
          <Progress value={summary.overallImprovementScore * 10} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Automation Level</span>
            <span className="font-medium">{summary.automationLevel}/10</span>
          </div>
          <Progress value={summary.automationLevel * 10} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">System Maturity</div>
            <Badge variant="outline">{formatSystemMaturity(summary.systemMaturity)}</Badge>
          </div>
          <div>
            <div className="text-gray-600">Improvement Velocity</div>
            <span className={`font-medium ${summary.improvementVelocity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.improvementVelocity > 0 ? '+' : ''}{summary.improvementVelocity.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Critical Issues</div>
            <span className="font-medium text-red-600">{summary.criticalIssuesCount}</span>
          </div>
          <div>
            <div className="text-gray-600">Opportunities</div>
            <span className="font-medium text-blue-600">{summary.improvementOpportunitiesCount}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Last optimization: {new Date(summary.lastOptimization).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

// System Health Overview Component
const SystemHealthOverview: React.FC<{ health: SystemHealth }> = ({ health }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Current system health and component status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Overall Health</span>
            <span className="font-medium">{health.overallHealth}/10</span>
          </div>
          <Progress value={health.overallHealth * 10} className="h-2" />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Component Health</h4>
          {health.componentHealth.map((component, index) => (
            <ComponentHealthCard key={index} component={component} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Uptime</div>
            <span className="font-medium text-green-600">{health.uptime}%</span>
          </div>
          <div>
            <div className="text-gray-600">Critical Issues</div>
            <span className="font-medium text-red-600">{health.criticalIssues.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component Health Card
const ComponentHealthCard: React.FC<{ component: ComponentHealth }> = ({ component }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'offline': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-3 w-3" />;
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'offline': return <AlertTriangle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className="flex justify-between items-center p-2 border rounded">
      <div className="flex items-center gap-2">
        <div className={getStatusColor(component.status)}>
          {getStatusIcon(component.status)}
        </div>
        <span className="text-sm">{component.component}</span>
      </div>
      <div className="text-sm font-medium">{component.healthScore}/10</div>
    </div>
  );
};

// Prompt Optimization View Component
const PromptOptimizationView: React.FC<{ optimization: PromptOptimizationAnalysis }> = ({ optimization }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Prompts</CardTitle>
            <CardDescription>Performance analysis of active prompts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimization.currentPrompts.map((prompt, index) => (
                <PromptAnalysisCard key={index} prompt={prompt} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Overall prompt performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <PromptPerformanceMetricsView metrics={optimization.performanceMetrics} />
          </CardContent>
        </Card>
      </div>

      {optimization.optimizationOpportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Opportunities</CardTitle>
            <CardDescription>Identified opportunities for prompt improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimization.optimizationOpportunities.map((opportunity, index) => (
                <OptimizationOpportunityCard key={index} opportunity={opportunity} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {optimization.abTestResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>A/B Test Results</CardTitle>
            <CardDescription>Recent prompt testing results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimization.abTestResults.map((result, index) => (
                <ABTestResultCard key={index} result={result} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Prompt Analysis Card Component
const PromptAnalysisCard: React.FC<{ prompt: PromptAnalysis }> = ({ prompt }) => {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{prompt.promptId}</h4>
          <p className="text-sm text-gray-600">v{prompt.currentVersion} • {prompt.promptType}</p>
        </div>
        <Badge variant="outline">{prompt.qualityScore.toFixed(1)}/10</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>Performance: {prompt.performanceScore.toFixed(1)}/10</div>
        <div>Usage: {(prompt.usageFrequency * 100).toFixed(0)}%</div>
      </div>
      
      <Progress value={prompt.qualityScore * 10} className="h-1" />
      
      {prompt.improvementPotential > 1.0 && (
        <div className="text-xs text-blue-600">
          Improvement potential: +{prompt.improvementPotential.toFixed(1)}
        </div>
      )}
    </div>
  );
};

// Prompt Performance Metrics View Component
const PromptPerformanceMetricsView: React.FC<{ metrics: PromptPerformanceMetrics }> = ({ metrics }) => {
  const performanceMetrics = [
    { name: 'Quality Score', value: metrics.averageQualityScore },
    { name: 'Success Rate', value: metrics.successRate * 10 },
    { name: 'User Satisfaction', value: metrics.userSatisfactionScore },
    { name: 'Consistency', value: metrics.consistencyScore },
    { name: 'Innovation', value: metrics.innovationScore },
    { name: 'Competitive Advantage', value: metrics.competitiveAdvantageScore }
  ];

  return (
    <div className="space-y-3">
      {performanceMetrics.map((metric, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{metric.name}</span>
            <span className="font-medium">{metric.value.toFixed(1)}/10</span>
          </div>
          <Progress value={metric.value * 10} className="h-1" />
        </div>
      ))}
      
      <div className="text-xs text-gray-500 mt-4">
        Average generation time: {metrics.averageGenerationTime.toFixed(1)}s
      </div>
    </div>
  );
};

// Optimization Opportunity Card Component
const OptimizationOpportunityCard: React.FC<{ opportunity: PromptOptimizationOpportunity }> = ({ opportunity }) => {
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
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{opportunity.promptId}</h4>
        <Badge variant={getPriorityColor(opportunity.priority)}>
          {opportunity.priority}
        </Badge>
      </div>
      
      <p className="text-sm text-gray-600">{opportunity.description}</p>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>Impact: {opportunity.potentialImpact.toFixed(1)}/10</div>
        <div>Difficulty: {opportunity.implementationDifficulty.toFixed(1)}/10</div>
      </div>
      
      <div className="text-xs text-gray-500">
        Timeframe: {opportunity.estimatedTimeframe}
      </div>
    </div>
  );
};

// A/B Test Result Card Component
const ABTestResultCard: React.FC<{ result: ABTestResult }> = ({ result }) => {
  const getWinnerColor = (winner: string) => {
    switch (winner) {
      case 'A': return 'text-blue-600';
      case 'B': return 'text-green-600';
      case 'inconclusive': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{result.testId}</h4>
        <Badge variant="outline" className={getWinnerColor(result.winner)}>
          Winner: {result.winner}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium">Variant A (v{result.variantA.version})</div>
          <div>Quality: {result.variantA.qualityScore.toFixed(1)}/10</div>
          <div>Preference: {(result.variantA.userPreference * 100).toFixed(0)}%</div>
        </div>
        <div>
          <div className="font-medium">Variant B (v{result.variantB.version})</div>
          <div>Quality: {result.variantB.qualityScore.toFixed(1)}/10</div>
          <div>Preference: {(result.variantB.userPreference * 100).toFixed(0)}%</div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Confidence: {(result.confidenceLevel * 100).toFixed(0)}% • Sample: {result.sampleSize} • Duration: {result.testDuration}
      </div>
      
      <div className="text-xs text-blue-600">
        {result.recommendedAction}
      </div>
    </div>
  );
};

// Quality Trends View Component
const QualityTrendsView: React.FC<{ trends: QualityTrendAnalysis }> = ({ trends }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
            <CardDescription>Current quality trend direction and strength</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Overall Trend</span>
              <Badge variant={getTrendColor(trends.overallTrend)}>
                {trends.overallTrend}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Trend Strength</span>
                <span className="font-medium">{trends.trendStrength.toFixed(1)}/10</span>
              </div>
              <Progress value={trends.trendStrength * 10} className="h-2" />
            </div>
            
            <div className="text-sm text-gray-600">
              Duration: {trends.trendDuration}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Influencers</CardTitle>
            <CardDescription>Factors affecting quality trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.keyInfluencers.map((influencer, index) => (
                <TrendInfluencerCard key={index} influencer={influencer} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {trends.predictedTrajectory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Predictions</CardTitle>
            <CardDescription>Predicted quality trajectory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends.predictedTrajectory.map((prediction, index) => (
                <QualityPredictionCard key={index} prediction={prediction} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Trend Influencer Card Component
const TrendInfluencerCard: React.FC<{ influencer: TrendInfluencer }> = ({ influencer }) => {
  const getImpactColor = (impact: number) => {
    if (impact > 1) return 'text-green-600';
    if (impact < -1) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="border rounded-lg p-2 space-y-1">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium">{influencer.factor}</span>
        <div className="flex items-center gap-2">
          {influencer.actionable && <Badge variant="outline" className="text-xs">Actionable</Badge>}
          <span className={`text-sm font-medium ${getImpactColor(influencer.impact)}`}>
            {influencer.impact > 0 ? '+' : ''}{influencer.impact.toFixed(1)}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-600">{influencer.description}</p>
      <div className="text-xs text-gray-500">
        Confidence: {influencer.confidence.toFixed(1)}/10
      </div>
    </div>
  );
};

// Quality Prediction Card Component
const QualityPredictionCard: React.FC<{ prediction: QualityPrediction }> = ({ prediction }) => {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{prediction.timeframe}</span>
        <span className="text-lg font-bold">{prediction.predictedScore.toFixed(1)}/10</span>
      </div>
      
      <div className="text-sm text-gray-600">
        Range: {prediction.confidenceInterval.lower.toFixed(1)} - {prediction.confidenceInterval.upper.toFixed(1)}
      </div>
      
      <div>
        <h5 className="text-xs font-medium mb-1">Assumptions:</h5>
        <ul className="space-y-1">
          {prediction.assumptions.map((assumption, index) => (
            <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
              <span className="text-blue-600">•</span>
              {assumption}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// System Performance View Component
const SystemPerformanceView: React.FC<{ performance: SystemPerformanceAnalysis }> = ({ performance }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Current system performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <SystemPerformanceMetricsView metrics={performance.performanceMetrics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>Current resource usage levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceUtilizationView utilization={performance.performanceMetrics.resourceUtilization} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Efficiency Metrics</CardTitle>
          <CardDescription>System efficiency and cost metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <EfficiencyMetricsView metrics={performance.efficiencyMetrics} />
        </CardContent>
      </Card>
    </div>
  );
};

// System Performance Metrics View Component
const SystemPerformanceMetricsView: React.FC<{ metrics: any }> = ({ metrics }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Response Time</div>
          <div className="font-medium">{metrics.averageResponseTime}ms</div>
        </div>
        <div>
          <div className="text-gray-600">Throughput</div>
          <div className="font-medium">{metrics.throughput}/min</div>
        </div>
        <div>
          <div className="text-gray-600">Error Rate</div>
          <div className="font-medium text-red-600">{(metrics.errorRate * 100).toFixed(2)}%</div>
        </div>
        <div>
          <div className="text-gray-600">API Calls</div>
          <div className="font-medium">{metrics.resourceUtilization.apiCalls}</div>
        </div>
      </div>
    </div>
  );
};

// Resource Utilization View Component
const ResourceUtilizationView: React.FC<{ utilization: any }> = ({ utilization }) => {
  const resources = [
    { name: 'CPU', value: utilization.cpu, unit: '%' },
    { name: 'Memory', value: utilization.memory, unit: '%' },
    { name: 'Storage', value: utilization.storage, unit: '%' },
    { name: 'Network', value: utilization.network, unit: '%' }
  ];

  return (
    <div className="space-y-3">
      {resources.map((resource, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{resource.name}</span>
            <span className="font-medium">{resource.value}{resource.unit}</span>
          </div>
          <Progress value={resource.value} className="h-2" />
        </div>
      ))}
    </div>
  );
};

// Efficiency Metrics View Component
const EfficiencyMetricsView: React.FC<{ metrics: any }> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold">${metrics.costPerGeneration.toFixed(3)}</div>
        <div className="text-sm text-gray-600">Cost per Generation</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{metrics.timePerGeneration.toFixed(1)}s</div>
        <div className="text-sm text-gray-600">Time per Generation</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{metrics.qualityPerCost.toFixed(1)}</div>
        <div className="text-sm text-gray-600">Quality per Cost</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{metrics.resourceEfficiency.toFixed(1)}/10</div>
        <div className="text-sm text-gray-600">Resource Efficiency</div>
      </div>
    </div>
  );
};

// Automated Actions View Component
const AutomatedActionsView: React.FC<{ actions: AutomatedAction[] }> = ({ actions }) => {
  return (
    <div className="space-y-4">
      {actions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recent Automated Actions</h3>
            <p className="text-gray-600">Automated actions will appear here when executed.</p>
          </CardContent>
        </Card>
      ) : (
        actions.map((action, index) => (
          <AutomatedActionCard key={index} action={action} />
        ))
      )}
    </div>
  );
};

// Automated Action Card Component
const AutomatedActionCard: React.FC<{ action: AutomatedAction }> = ({ action }) => {
  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'prompt_adjustment': return <Settings className="h-4 w-4" />;
      case 'threshold_update': return <Target className="h-4 w-4" />;
      case 'performance_optimization': return <Zap className="h-4 w-4" />;
      case 'quality_improvement': return <CheckCircle className="h-4 w-4" />;
      default: return <Cog className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {getActionTypeIcon(action.actionType)}
            <div>
              <CardTitle className="text-lg">{action.actionId}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </div>
          </div>
          <Badge variant={action.result.success ? 'default' : 'destructive'}>
            {action.result.success ? 'Success' : 'Failed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm">
            <span className="text-gray-600">Executed: </span>
            <span>{new Date(action.executedAt).toLocaleString()}</span>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-600">Impact: </span>
            <span>{action.impact}</span>
          </div>
          
          {action.result.changes.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Changes Made:</h5>
              <ul className="space-y-1">
                {action.result.changes.map((change, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {Object.keys(action.result.metrics.before).length > 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-1">Before</h5>
                {Object.entries(action.result.metrics.before).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div>
                <h5 className="font-medium mb-1">After</h5>
                {Object.entries(action.result.metrics.after).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span className="text-green-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Recommendations View Component
const RecommendationsView: React.FC<{ recommendations: ImprovementRecommendation[] }> = ({ recommendations }) => {
  return (
    <div className="space-y-4">
      {recommendations.map((recommendation, index) => (
        <ImprovementRecommendationCard key={index} recommendation={recommendation} />
      ))}
    </div>
  );
};

// Improvement Recommendation Card Component
const ImprovementRecommendationCard: React.FC<{ recommendation: ImprovementRecommendation }> = ({ recommendation }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prompt_optimization': return <Settings className="h-4 w-4" />;
      case 'system_performance': return <Zap className="h-4 w-4" />;
      case 'quality_enhancement': return <CheckCircle className="h-4 w-4" />;
      case 'automation_improvement': return <Bot className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {getCategoryIcon(recommendation.category)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-1">Expected Impact</h5>
              <p className="text-gray-600">{recommendation.expectedImpact}</p>
            </div>
            <div>
              <h5 className="font-medium mb-1">Timeframe</h5>
              <p className="text-gray-600">{recommendation.timeframe}</p>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Required Resources</h5>
            <div className="flex flex-wrap gap-1">
              {recommendation.requiredResources.map((resource, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {resource}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Success Metrics</h5>
            <ul className="space-y-1">
              {recommendation.successMetrics.map((metric, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {metric}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions
const formatSystemMaturity = (maturity: SystemMaturity): string => {
  return maturity.charAt(0).toUpperCase() + maturity.slice(1);
};

const getTrendColor = (trend: TrendDirection) => {
  switch (trend) {
    case 'improving': return 'default';
    case 'stable': return 'secondary';
    case 'declining': return 'destructive';
    case 'volatile': return 'outline';
    default: return 'secondary';
  }
};

export default ContinuousImprovementDashboard;