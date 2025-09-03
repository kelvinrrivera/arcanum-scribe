/**
 * Competitive Analysis Dashboard Component
 * 
 * React component for visualizing competitive analysis, market positioning,
 * and competitive advantage tracking from the Advanced Prompt System.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  Users,
  BarChart3,
  Zap,
  Award,
  Eye
} from 'lucide-react';

// Types for competitive analysis data
interface CompetitiveAnalysis {
  summary: CompetitiveSummary;
  marketComparison: MarketComparison;
  competitiveAdvantage: CompetitiveAdvantageAnalysis;
  marketPositioning: MarketPositioningAnalysis;
  benchmarks: CompetitiveBenchmarks;
  recommendations: CompetitiveRecommendation[];
}

interface CompetitiveSummary {
  overallMarketPosition: MarketPosition;
  competitiveStrength: number;
  marketShare: number;
  differentiationScore: number;
  competitiveGaps: string[];
  keyAdvantages: string[];
  lastUpdated: Date;
}

interface MarketComparison {
  industryBenchmarks: {
    averageQualityScore: number;
    averageUniquenesScore: number;
    averageProfessionalPolish: number;
    averageUserSatisfaction: number;
  };
  competitorAnalysis: CompetitorAnalysis[];
  marketGaps: MarketGap[];
  opportunityAreas: OpportunityArea[];
}

interface CompetitorAnalysis {
  competitorName: string;
  competitorType: 'direct' | 'indirect' | 'substitute';
  strengths: string[];
  weaknesses: string[];
  marketPosition: MarketPosition;
  estimatedQualityScore: number;
  differentiationFactors: string[];
  threatLevel: 'high' | 'medium' | 'low';
}

interface MarketGap {
  area: string;
  description: string;
  opportunitySize: 'large' | 'medium' | 'small';
  difficulty: 'easy' | 'medium' | 'hard';
  timeToCapture: string;
  requiredCapabilities: string[];
}

interface OpportunityArea {
  name: string;
  description: string;
  potentialImpact: number;
  implementationDifficulty: number;
  timeframe: string;
  requiredInvestment: 'low' | 'medium' | 'high';
  expectedROI: string;
}

interface CompetitiveAdvantageAnalysis {
  currentAdvantages: CompetitiveAdvantage[];
  potentialAdvantages: CompetitiveAdvantage[];
  vulnerabilities: CompetitiveVulnerability[];
  sustainabilityScore: number;
  innovationIndex: number;
}

interface CompetitiveAdvantage {
  name: string;
  description: string;
  strength: number;
  sustainability: 'high' | 'medium' | 'low';
  uniqueness: 'unique' | 'rare' | 'common';
  valueToCustomers: number;
  difficultyToReplicate: number;
}

interface CompetitiveVulnerability {
  area: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  likelihood: number;
  potentialImpact: string;
  mitigationStrategies: string[];
}

interface MarketPositioningAnalysis {
  currentPosition: MarketPosition;
  targetPosition: MarketPosition;
  positioningStrategies: PositioningStrategy[];
  competitiveMap: CompetitiveMap;
  brandPerception: BrandPerception;
}

interface PositioningStrategy {
  name: string;
  description: string;
  targetSegment: string;
  keyMessages: string[];
  differentiators: string[];
  implementationSteps: string[];
  expectedOutcome: string;
}

interface CompetitiveMap {
  dimensions: {
    xAxis: string;
    yAxis: string;
  };
  ourPosition: {
    x: number;
    y: number;
    label: string;
  };
  competitors: Array<{
    name: string;
    x: number;
    y: number;
    marketShare: number;
  }>;
  idealPosition: {
    x: number;
    y: number;
    description: string;
  };
}

interface BrandPerception {
  qualityPerception: number;
  innovationPerception: number;
  valuePerception: number;
  trustPerception: number;
  differentiationPerception: number;
  overallBrandStrength: number;
}

interface CompetitiveBenchmarks {
  qualityBenchmarks: QualityBenchmark[];
  featureBenchmarks: FeatureBenchmark[];
  performanceBenchmarks: PerformanceBenchmark[];
  userExperienceBenchmarks: UXBenchmark[];
}

interface QualityBenchmark {
  metric: string;
  ourScore: number;
  industryAverage: number;
  bestInClass: number;
  gap: number;
  percentile: number;
}

interface FeatureBenchmark {
  feature: string;
  ourCapability: 'excellent' | 'good' | 'average' | 'poor' | 'missing';
  competitorCapabilities: Record<string, string>;
  importance: 'critical' | 'high' | 'medium' | 'low';
  differentiationPotential: number;
}

interface PerformanceBenchmark {
  metric: string;
  ourPerformance: number;
  industryAverage: number;
  bestInClass: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

interface UXBenchmark {
  aspect: string;
  ourRating: number;
  industryAverage: number;
  bestInClass: number;
  userFeedback: string[];
  improvementPriority: 'high' | 'medium' | 'low';
}

interface CompetitiveRecommendation {
  type: 'positioning' | 'differentiation' | 'capability_building' | 'market_expansion';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  expectedImpact: string;
  implementationComplexity: 'low' | 'medium' | 'high';
  timeframe: string;
  requiredResources: string[];
  successMetrics: string[];
}

type MarketPosition = 'market_leader' | 'challenger' | 'follower' | 'niche_player' | 'new_entrant';

export const CompetitiveAnalysisDashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<CompetitiveAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load competitive analysis data
  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/competitive/analysis');
      if (!response.ok) {
        throw new Error('Failed to load competitive analysis');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading competitive analysis...</p>
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
        <AlertDescription>No competitive analysis data available yet.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Competitive Analysis Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor market position and competitive advantage
          </p>
        </div>
        <Button 
          onClick={refreshAnalysis} 
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Market Position"
          value={formatMarketPosition(analysis.summary.overallMarketPosition)}
          icon={<Trophy className="h-4 w-4" />}
          color={getPositionColor(analysis.summary.overallMarketPosition)}
        />
        <SummaryCard
          title="Competitive Strength"
          value={`${analysis.summary.competitiveStrength}/10`}
          icon={<Shield className="h-4 w-4" />}
          color="blue"
        />
        <SummaryCard
          title="Market Share"
          value={`${analysis.summary.marketShare}%`}
          icon={<BarChart3 className="h-4 w-4" />}
          color="green"
        />
        <SummaryCard
          title="Differentiation"
          value={`${analysis.summary.differentiationScore.toFixed(1)}/10`}
          icon={<Zap className="h-4 w-4" />}
          color="purple"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="advantages">Advantages</TabsTrigger>
          <TabsTrigger value="positioning">Positioning</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompetitiveOverview summary={analysis.summary} />
            <MarketOpportunities opportunities={analysis.marketComparison.opportunityAreas} />
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <CompetitorAnalysisView competitors={analysis.marketComparison.competitorAnalysis} />
        </TabsContent>

        <TabsContent value="advantages" className="space-y-4">
          <CompetitiveAdvantageView advantage={analysis.competitiveAdvantage} />
        </TabsContent>

        <TabsContent value="positioning" className="space-y-4">
          <MarketPositioningView positioning={analysis.marketPositioning} />
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <BenchmarksView benchmarks={analysis.benchmarks} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationsView recommendations={analysis.recommendations} />
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

// Competitive Overview Component
const CompetitiveOverview: React.FC<{ summary: CompetitiveSummary }> = ({ summary }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitive Overview</CardTitle>
        <CardDescription>Current competitive position and key metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Competitive Strength</span>
            <span className="font-medium">{summary.competitiveStrength}/10</span>
          </div>
          <Progress value={summary.competitiveStrength * 10} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Differentiation Score</span>
            <span className="font-medium">{summary.differentiationScore.toFixed(1)}/10</span>
          </div>
          <Progress value={summary.differentiationScore * 10} className="h-2" />
        </div>

        <div>
          <h4 className="font-medium mb-2">Key Advantages</h4>
          <div className="space-y-1">
            {summary.keyAdvantages.map((advantage, index) => (
              <Badge key={index} variant="secondary" className="mr-2 mb-1">
                {advantage}
              </Badge>
            ))}
          </div>
        </div>

        {summary.competitiveGaps.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Competitive Gaps</h4>
            <div className="space-y-1">
              {summary.competitiveGaps.map((gap, index) => (
                <div key={index} className="text-sm text-red-600 flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 mt-0.5" />
                  {gap}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Market Opportunities Component
const MarketOpportunities: React.FC<{ opportunities: OpportunityArea[] }> = ({ opportunities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Opportunities</CardTitle>
        <CardDescription>High-impact opportunities for growth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {opportunities.slice(0, 3).map((opportunity, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{opportunity.name}</h4>
                <Badge variant={getInvestmentColor(opportunity.requiredInvestment)}>
                  {opportunity.requiredInvestment} investment
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{opportunity.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Impact: {opportunity.potentialImpact}/10</div>
                <div>Timeframe: {opportunity.timeframe}</div>
              </div>
              <Progress value={opportunity.potentialImpact * 10} className="h-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Competitor Analysis View Component
const CompetitorAnalysisView: React.FC<{ competitors: CompetitorAnalysis[] }> = ({ competitors }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {competitors.map((competitor, index) => (
        <CompetitorCard key={index} competitor={competitor} />
      ))}
    </div>
  );
};

// Competitor Card Component
const CompetitorCard: React.FC<{ competitor: CompetitorAnalysis }> = ({ competitor }) => {
  const getThreatColor = (level: string) => {
    switch (level) {
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
            <CardTitle className="text-lg">{competitor.competitorName}</CardTitle>
            <CardDescription>{competitor.competitorType} competitor</CardDescription>
          </div>
          <Badge variant={getThreatColor(competitor.threatLevel)}>
            {competitor.threatLevel} threat
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Quality Score:</span>
          <span className="font-medium">{competitor.estimatedQualityScore}/10</span>
        </div>
        <Progress value={competitor.estimatedQualityScore * 10} className="h-2" />
        
        <div>
          <h4 className="font-medium mb-2 text-green-700">Strengths</h4>
          <ul className="space-y-1">
            {competitor.strengths.map((strength, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-600 mt-1">+</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2 text-red-700">Weaknesses</h4>
          <ul className="space-y-1">
            {competitor.weaknesses.map((weakness, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-red-600 mt-1">-</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Competitive Advantage View Component
const CompetitiveAdvantageView: React.FC<{ advantage: CompetitiveAdvantageAnalysis }> = ({ advantage }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Advantages</CardTitle>
            <CardDescription>Existing competitive advantages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {advantage.currentAdvantages.map((adv, index) => (
                <AdvantageCard key={index} advantage={adv} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Potential Advantages</CardTitle>
            <CardDescription>Opportunities for competitive advantage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {advantage.potentialAdvantages.map((adv, index) => (
                <AdvantageCard key={index} advantage={adv} isPotential />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {advantage.vulnerabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competitive Vulnerabilities</CardTitle>
            <CardDescription>Areas requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {advantage.vulnerabilities.map((vuln, index) => (
                <VulnerabilityCard key={index} vulnerability={vuln} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Advantage Card Component
const AdvantageCard: React.FC<{ advantage: CompetitiveAdvantage; isPotential?: boolean }> = ({ advantage, isPotential }) => {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{advantage.name}</h4>
        <Badge variant={isPotential ? "outline" : "default"}>
          {advantage.uniqueness}
        </Badge>
      </div>
      <p className="text-sm text-gray-600">{advantage.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>Strength: {advantage.strength}/10</div>
        <div>Value: {advantage.valueToCustomers}/10</div>
      </div>
      <Progress value={advantage.strength * 10} className="h-1" />
    </div>
  );
};

// Vulnerability Card Component
const VulnerabilityCard: React.FC<{ vulnerability: CompetitiveVulnerability }> = ({ vulnerability }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
        <h4 className="font-medium">{vulnerability.area}</h4>
        <Badge variant={getSeverityColor(vulnerability.severity)}>
          {vulnerability.severity}
        </Badge>
      </div>
      <p className="text-sm text-gray-600">{vulnerability.description}</p>
      <div className="text-xs text-gray-500">
        Likelihood: {vulnerability.likelihood}/10
      </div>
      {vulnerability.mitigationStrategies.length > 0 && (
        <div>
          <h5 className="text-xs font-medium mb-1">Mitigation Strategies:</h5>
          <ul className="space-y-1">
            {vulnerability.mitigationStrategies.map((strategy, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                <span className="text-blue-600">•</span>
                {strategy}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Market Positioning View Component
const MarketPositioningView: React.FC<{ positioning: MarketPositioningAnalysis }> = ({ positioning }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Position Transition</CardTitle>
            <CardDescription>Current and target market positions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-sm text-gray-600">Current</div>
                <Badge variant="outline" className="mt-1">
                  {formatMarketPosition(positioning.currentPosition)}
                </Badge>
              </div>
              <div className="flex-1 mx-4">
                <div className="border-t-2 border-dashed border-gray-300 relative">
                  <TrendingUp className="h-4 w-4 absolute -top-2 left-1/2 transform -translate-x-1/2 text-blue-600" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Target</div>
                <Badge variant="default" className="mt-1">
                  {formatMarketPosition(positioning.targetPosition)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand Perception</CardTitle>
            <CardDescription>How the market perceives our brand</CardDescription>
          </CardHeader>
          <CardContent>
            <BrandPerceptionView perception={positioning.brandPerception} />
          </CardContent>
        </Card>
      </div>

      {positioning.positioningStrategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Positioning Strategies</CardTitle>
            <CardDescription>Strategic approaches to improve market position</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {positioning.positioningStrategies.map((strategy, index) => (
                <PositioningStrategyCard key={index} strategy={strategy} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Brand Perception View Component
const BrandPerceptionView: React.FC<{ perception: BrandPerception }> = ({ perception }) => {
  const perceptionMetrics = [
    { name: 'Quality', value: perception.qualityPerception },
    { name: 'Innovation', value: perception.innovationPerception },
    { name: 'Value', value: perception.valuePerception },
    { name: 'Trust', value: perception.trustPerception },
    { name: 'Differentiation', value: perception.differentiationPerception }
  ];

  return (
    <div className="space-y-3">
      {perceptionMetrics.map((metric, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{metric.name}</span>
            <span className="font-medium">{metric.value.toFixed(1)}/10</span>
          </div>
          <Progress value={metric.value * 10} className="h-1" />
        </div>
      ))}
    </div>
  );
};

// Positioning Strategy Card Component
const PositioningStrategyCard: React.FC<{ strategy: PositioningStrategy }> = ({ strategy }) => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h4 className="font-medium">{strategy.name}</h4>
      <p className="text-sm text-gray-600">{strategy.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h5 className="font-medium mb-1">Target Segment</h5>
          <p className="text-gray-600">{strategy.targetSegment}</p>
        </div>
        <div>
          <h5 className="font-medium mb-1">Expected Outcome</h5>
          <p className="text-gray-600">{strategy.expectedOutcome}</p>
        </div>
      </div>

      <div>
        <h5 className="font-medium mb-2">Key Messages</h5>
        <div className="flex flex-wrap gap-1">
          {strategy.keyMessages.map((message, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {message}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

// Benchmarks View Component
const BenchmarksView: React.FC<{ benchmarks: CompetitiveBenchmarks }> = ({ benchmarks }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quality Benchmarks</CardTitle>
          <CardDescription>How we compare on quality metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarks.qualityBenchmarks.map((benchmark, index) => (
              <QualityBenchmarkCard key={index} benchmark={benchmark} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Benchmarks</CardTitle>
          <CardDescription>Feature comparison with competitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarks.featureBenchmarks.map((benchmark, index) => (
              <FeatureBenchmarkCard key={index} benchmark={benchmark} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Quality Benchmark Card Component
const QualityBenchmarkCard: React.FC<{ benchmark: QualityBenchmark }> = ({ benchmark }) => {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{benchmark.metric}</h4>
        <Badge variant="outline">{benchmark.percentile}th percentile</Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-600">Our Score</div>
          <div className="font-medium text-blue-600">{benchmark.ourScore}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Industry Avg</div>
          <div className="font-medium">{benchmark.industryAverage}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Best in Class</div>
          <div className="font-medium text-green-600">{benchmark.bestInClass}</div>
        </div>
      </div>
      
      <Progress value={(benchmark.ourScore / benchmark.bestInClass) * 100} className="h-2" />
    </div>
  );
};

// Feature Benchmark Card Component
const FeatureBenchmarkCard: React.FC<{ benchmark: FeatureBenchmark }> = ({ benchmark }) => {
  const getCapabilityColor = (capability: string) => {
    switch (capability) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'missing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{benchmark.feature}</h4>
        <Badge variant={benchmark.importance === 'critical' ? 'destructive' : 'default'}>
          {benchmark.importance}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Our Capability: </span>
          <span className={`font-medium ${getCapabilityColor(benchmark.ourCapability)}`}>
            {benchmark.ourCapability}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Differentiation Potential: </span>
          <span className="font-medium">{benchmark.differentiationPotential}/10</span>
        </div>
      </div>
    </div>
  );
};

// Recommendations View Component
const RecommendationsView: React.FC<{ recommendations: CompetitiveRecommendation[] }> = ({ recommendations }) => {
  return (
    <div className="space-y-4">
      {recommendations.map((recommendation, index) => (
        <RecommendationCard key={index} recommendation={recommendation} />
      ))}
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard: React.FC<{ recommendation: CompetitiveRecommendation }> = ({ recommendation }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positioning': return <Target className="h-4 w-4" />;
      case 'differentiation': return <Zap className="h-4 w-4" />;
      case 'capability_building': return <Award className="h-4 w-4" />;
      case 'market_expansion': return <Users className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {getTypeIcon(recommendation.type)}
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
const formatMarketPosition = (position: MarketPosition): string => {
  return position.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getPositionColor = (position: MarketPosition): string => {
  switch (position) {
    case 'market_leader': return 'green';
    case 'challenger': return 'blue';
    case 'follower': return 'orange';
    case 'niche_player': return 'purple';
    case 'new_entrant': return 'red';
    default: return 'blue';
  }
};

const getInvestmentColor = (investment: string) => {
  switch (investment) {
    case 'low': return 'secondary';
    case 'medium': return 'default';
    case 'high': return 'destructive';
    default: return 'default';
  }
};

export default CompetitiveAnalysisDashboard;