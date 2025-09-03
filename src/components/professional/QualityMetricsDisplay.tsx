/**
 * Quality Metrics Display - The Professional Score Dashboard
 * 
 * This component displays comprehensive quality metrics in a beautiful,
 * easy-to-understand format using the application's amber/gold color scheme.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Star, 
  Crown, 
  Sparkles, 
  Target, 
  Users, 
  DollarSign,
  Award,
  Zap,
  Heart,
  Share2,
  Lightbulb,
  Flame
} from 'lucide-react';

// Simplified interfaces for the component
interface QualityMetrics {
  contentQuality: number;
  mechanicalAccuracy: number;
  editorialStandards: number;
  userExperience: number;
  professionalReadiness: number;
  overallScore: number;
  unicornScore: number;
  processingTime: number;
  featuresSuccessRate: number;
}

interface QualityBreakdown {
  metrics: QualityMetrics;
  grade: string;
  strengths: string[];
  improvements: string[];
  unicornFactors: Array<{
    category: string;
    score: number;
    description: string;
    impact: string;
  }>;
  competitorComparison: {
    vsStandardContent: number;
    vsIndustryAverage: number;
    vsPremiumContent: number;
    marketPosition: string;
  };
  marketReadiness: {
    commercialViability: number;
    scalabilityPotential: number;
    userAdoptionLikelihood: number;
    revenueGeneration: number;
    overallReadiness: number;
  };
}

interface QualityMetricsDisplayProps {
  qualityBreakdown: QualityBreakdown;
  className?: string;
}

export const QualityMetricsDisplay: React.FC<QualityMetricsDisplayProps> = ({
  qualityBreakdown,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { metrics, grade, strengths, improvements, unicornFactors, competitorComparison, marketReadiness } = qualityBreakdown;

  // Get grade styling with amber/gold theme
  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'Unicorn-Tier':
        return {
          color: 'bg-gradient-to-r from-amber-500 to-orange-500',
          text: 'text-white',
          icon: <Crown className="w-5 h-5" />,
          description: 'Silicon Valley Unicorn Quality'
        };
      case 'Publication-Ready':
        return {
          color: 'bg-gradient-to-r from-amber-400 to-yellow-500',
          text: 'text-white',
          icon: <Award className="w-5 h-5" />,
          description: 'Ready for Commercial Publication'
        };
      case 'Premium':
        return {
          color: 'bg-gradient-to-r from-yellow-500 to-amber-400',
          text: 'text-white',
          icon: <Star className="w-5 h-5" />,
          description: 'Premium Professional Quality'
        };
      case 'Professional':
        return {
          color: 'bg-gradient-to-r from-orange-500 to-amber-500',
          text: 'text-white',
          icon: <Target className="w-5 h-5" />,
          description: 'Professional Grade Content'
        };
      default:
        return {
          color: 'bg-muted',
          text: 'text-muted-foreground',
          icon: <Zap className="w-5 h-5" />,
          description: 'Standard Quality'
        };
    }
  };

  const gradeStyle = getGradeStyle(grade);

  // Get score color based on value using amber theme
  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-amber-600';
    if (score >= 90) return 'text-orange-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  // Get unicorn factor icon
  const getUnicornFactorIcon = (category: string) => {
    switch (category) {
      case 'viral-potential': return <Share2 className="w-4 h-4" />;
      case 'memorability': return <Heart className="w-4 h-4" />;
      case 'shareability': return <Users className="w-4 h-4" />;
      case 'innovation': return <Lightbulb className="w-4 h-4" />;
      case 'epicness': return <Flame className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with overall grade */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 ${gradeStyle.color} opacity-10`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${gradeStyle.color} ${gradeStyle.text}`}>
                {gradeStyle.icon}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{grade}</CardTitle>
                <CardDescription className="text-lg">{gradeStyle.description}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-600">
                {Math.round(metrics.overallScore)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(metrics.unicornScore)}`}>
                {Math.round(metrics.unicornScore)}
              </div>
              <div className="text-sm text-muted-foreground">🦄 Unicorn Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(metrics.featuresSuccessRate)}%
              </div>
              <div className="text-sm text-muted-foreground">Features Applied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {metrics.processingTime}ms
              </div>
              <div className="text-sm text-muted-foreground">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {Math.round(marketReadiness.overallReadiness)}%
              </div>
              <div className="text-sm text-muted-foreground">Market Ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed metrics tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="unicorn">🦄 Unicorn</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Quality Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Content Quality</span>
                      <span className={`text-sm font-bold ${getScoreColor(metrics.contentQuality)}`}>
                        {Math.round(metrics.contentQuality)}%
                      </span>
                    </div>
                    <Progress value={metrics.contentQuality} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Mechanical Accuracy</span>
                      <span className={`text-sm font-bold ${getScoreColor(metrics.mechanicalAccuracy)}`}>
                        {Math.round(metrics.mechanicalAccuracy)}%
                      </span>
                    </div>
                    <Progress value={metrics.mechanicalAccuracy} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Editorial Standards</span>
                      <span className={`text-sm font-bold ${getScoreColor(metrics.editorialStandards)}`}>
                        {Math.round(metrics.editorialStandards)}%
                      </span>
                    </div>
                    <Progress value={metrics.editorialStandards} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">User Experience</span>
                      <span className={`text-sm font-bold ${getScoreColor(metrics.userExperience)}`}>
                        {Math.round(metrics.userExperience)}%
                      </span>
                    </div>
                    <Progress value={metrics.userExperience} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Professional Readiness</span>
                      <span className={`text-sm font-bold ${getScoreColor(metrics.professionalReadiness)}`}>
                        {Math.round(metrics.professionalReadiness)}%
                      </span>
                    </div>
                    <Progress value={metrics.professionalReadiness} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Strengths</h4>
                  <div className="space-y-1">
                    {strengths.map((strength, index) => (
                      <div key={index} className="text-sm text-primary/80">
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-600 mb-2">Improvements</h4>
                  <div className="space-y-1">
                    {improvements.map((improvement, index) => (
                      <div key={index} className="text-sm text-amber-600/80">
                        {improvement}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Unicorn Tab */}
        <TabsContent value="unicorn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>Unicorn Factors</span>
                <Badge variant="outline" className="ml-2 border-amber-500 text-amber-600">
                  {Math.round(metrics.unicornScore)}/100
                </Badge>
              </CardTitle>
              <CardDescription>
                Elements that give your content unicorn-level viral potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unicornFactors.map((factor, index) => (
                  <div key={index} className="p-4 border rounded-lg border-amber-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getUnicornFactorIcon(factor.category)}
                        <span className="font-medium capitalize">
                          {factor.category.replace('-', ' ')}
                        </span>
                      </div>
                      <Badge variant={factor.impact === 'unicorn-level' ? 'default' : 'secondary'} className="bg-amber-100 text-amber-800 border-amber-300">
                        {factor.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {factor.description}
                    </p>
                    <div className="mt-2">
                      <Progress value={factor.score} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Competitor Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Competitive Position</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600 capitalize">
                    {competitorComparison.marketPosition.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-muted-foreground">Market Position</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">vs Standard Content</span>
                    <span className="text-sm font-bold text-primary">
                      +{competitorComparison.vsStandardContent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">vs Industry Average</span>
                    <span className="text-sm font-bold text-accent">
                      +{competitorComparison.vsIndustryAverage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">vs Premium Content</span>
                    <span className="text-sm font-bold text-amber-600">
                      +{competitorComparison.vsPremiumContent}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Readiness */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Market Readiness</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Commercial Viability</span>
                      <span className="text-sm font-bold">
                        {marketReadiness.commercialViability}%
                      </span>
                    </div>
                    <Progress value={marketReadiness.commercialViability} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Scalability Potential</span>
                      <span className="text-sm font-bold">
                        {marketReadiness.scalabilityPotential}%
                      </span>
                    </div>
                    <Progress value={marketReadiness.scalabilityPotential} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">User Adoption</span>
                      <span className="text-sm font-bold">
                        {marketReadiness.userAdoptionLikelihood}%
                      </span>
                    </div>
                    <Progress value={marketReadiness.userAdoptionLikelihood} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Revenue Generation</span>
                      <span className="text-sm font-bold">
                        {marketReadiness.revenueGeneration}%
                      </span>
                    </div>
                    <Progress value={marketReadiness.revenueGeneration} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Processing Time</div>
                  <div className="text-lg font-bold">{metrics.processingTime}ms</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Features Applied</div>
                  <div className="text-lg font-bold">{Math.round(metrics.featuresSuccessRate)}%</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Overall Score</div>
                  <div className="text-lg font-bold">{Math.round(metrics.overallScore)}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Unicorn Score</div>
                  <div className="text-lg font-bold text-amber-600">{Math.round(metrics.unicornScore)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityMetricsDisplay;