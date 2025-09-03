/**
 * Performance Monitor Component - The Unicorn Speed Dashboard
 * 
 * This component displays comprehensive performance metrics and optimization
 * suggestions for the professional mode, ensuring unicorn-level performance.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  MemoryStick, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Trash2,
  RefreshCw,
  BarChart3,
  Target,
  Gauge
} from 'lucide-react';

import type { UseProfessionalModeReturn } from '@/hooks/useProfessionalMode';

interface PerformanceMonitorProps {
  professionalMode: UseProfessionalModeReturn;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  professionalMode,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Get performance data
  const performanceComparison = professionalMode.getPerformanceComparison();
  const performanceStats = professionalMode.getPerformanceStatistics();
  const performanceAlerts = professionalMode.getPerformanceAlerts();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle cache clear
  const handleClearCache = () => {
    professionalMode.clearPerformanceCache();
    setRefreshKey(prev => prev + 1);
  };

  // Get performance status
  const getPerformanceStatus = () => {
    const ratio = performanceComparison.performanceRatio;
    const efficiency = performanceComparison.efficiency;
    
    if (ratio <= 1.2 && efficiency >= 1.0) {
      return { status: 'excellent', color: 'text-green-600', icon: <CheckCircle className="w-5 h-5" /> };
    } else if (ratio <= 1.5 && efficiency >= 0.8) {
      return { status: 'good', color: 'text-amber-600', icon: <AlertTriangle className="w-5 h-5" /> };
    } else {
      return { status: 'needs-optimization', color: 'text-red-600', icon: <XCircle className="w-5 h-5" /> };
    }
  };

  const performanceStatus = getPerformanceStatus();

  // Get alert color
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'warning': return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`} key={refreshKey}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <CardTitle>Performance Monitor</CardTitle>
                <CardDescription>
                  Real-time performance metrics and optimization insights
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={performanceStatus.color}>
                {performanceStatus.icon}
                <span className="ml-1 capitalize">{performanceStatus.status.replace('-', ' ')}</span>
              </Badge>
              <Button variant="outline" size="sm" onClick={handleClearCache}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Speed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Professional Mode</span>
                <span className="font-bold">{performanceComparison.professionalMode.averageTime}ms</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Standard Mode</span>
                <span>{performanceComparison.standardMode.averageTime}ms</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Performance Ratio</span>
                  <Badge variant={performanceComparison.performanceRatio <= 1.5 ? 'default' : 'destructive'}>
                    {performanceComparison.performanceRatio}x
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span>Quality</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Quality Boost</span>
                <span className="font-bold text-green-600">+{performanceComparison.professionalMode.qualityBoost}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span className="font-bold">{Math.round(performanceComparison.professionalMode.successRate * 100)}%</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Efficiency</span>
                  <Badge variant={performanceComparison.efficiency >= 1.0 ? 'default' : 'secondary'}>
                    {performanceComparison.efficiency}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <MemoryStick className="w-5 h-5 text-purple-600" />
              <span>Memory</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Usage</span>
                <span className="font-bold">{Math.round(performanceComparison.professionalMode.memoryUsage / 1024 / 1024)}MB</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Standard Mode</span>
                <span>{Math.round(performanceComparison.standardMode.memoryUsage / 1024 / 1024)}MB</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Cache Hit Rate</span>
                  <Badge variant={performanceStats.cacheHitRate >= 0.5 ? 'default' : 'secondary'}>
                    {Math.round(performanceStats.cacheHitRate * 100)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Sessions</span>
                <span className="font-bold">{performanceStats.totalSessions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Duration</span>
                <span className="font-bold">{performanceStats.averageDuration}ms</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Active Alerts</span>
                  <Badge variant={performanceStats.alertCount === 0 ? 'default' : 'destructive'}>
                    {performanceStats.alertCount}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({performanceStats.alertCount})</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Performance Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="w-5 h-5" />
                  <span>Performance Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Generation Speed</span>
                      <span className="text-sm">{performanceComparison.performanceRatio}x slower</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (performanceComparison.performanceRatio - 1) * 100)} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Quality Improvement</span>
                      <span className="text-sm text-green-600">+{performanceComparison.professionalMode.qualityBoost}%</span>
                    </div>
                    <Progress 
                      value={performanceComparison.professionalMode.qualityBoost} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Efficiency Score</span>
                      <span className="text-sm font-bold">{performanceComparison.efficiency}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, performanceComparison.efficiency * 50)} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Slow Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Slowest Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceStats.topSlowFeatures.length > 0 ? (
                    performanceStats.topSlowFeatures.map((feature, index) => (
                      <div key={feature.feature} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <span className="text-sm">{feature.feature}</span>
                        </div>
                        <span className="text-sm font-bold text-amber-600">
                          {Math.round(feature.averageTime)}ms
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No performance data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {performanceAlerts.length > 0 ? (
            <div className="space-y-3">
              {performanceAlerts.slice(0, 10).map((alert, index) => (
                <Alert key={index} className={getAlertColor(alert.type)}>
                  <div className="flex items-start space-x-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertTitle className="capitalize">{alert.type}</AlertTitle>
                      <AlertDescription className="mt-1">
                        {alert.message}
                      </AlertDescription>
                      {alert.suggestions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium mb-1">Suggestions:</div>
                          <ul className="text-sm space-y-1">
                            {alert.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex items-start space-x-1">
                                <span>•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <div className="text-lg font-medium mb-2">No Performance Issues</div>
                <div className="text-muted-foreground">
                  All systems are running optimally!
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Optimization Recommendations</span>
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to improve performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Performance Status */}
                <div className={`p-4 rounded-lg border ${
                  performanceStatus.status === 'excellent' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' :
                  performanceStatus.status === 'good' ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' :
                  'border-red-200 bg-red-50 dark:bg-red-950/20'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {performanceStatus.icon}
                    <span className="font-medium capitalize">
                      {performanceStatus.status.replace('-', ' ')} Performance
                    </span>
                  </div>
                  <div className="text-sm">
                    {performanceStatus.status === 'excellent' && 
                      'Your professional mode is running at optimal performance! All metrics are within excellent ranges.'
                    }
                    {performanceStatus.status === 'good' && 
                      'Your professional mode is performing well with minor optimization opportunities.'
                    }
                    {performanceStatus.status === 'needs-optimization' && 
                      'Your professional mode could benefit from performance optimization.'
                    }
                  </div>
                </div>

                {/* Optimization Tips */}
                <div className="space-y-3">
                  <h4 className="font-medium">Optimization Tips:</h4>
                  <div className="grid gap-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-1">Enable Caching</div>
                      <div className="text-sm text-muted-foreground">
                        Current cache hit rate: {Math.round(performanceStats.cacheHitRate * 100)}%
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-1">Feature Optimization</div>
                      <div className="text-sm text-muted-foreground">
                        Consider disabling unused features to improve speed
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-1">Memory Management</div>
                      <div className="text-sm text-muted-foreground">
                        Current usage: {Math.round(performanceComparison.professionalMode.memoryUsage / 1024 / 1024)}MB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitor;