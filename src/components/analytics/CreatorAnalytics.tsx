import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Eye, 
  Download, 
  Star, 
  Users, 
  Calendar,
  Award,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface AnalyticsData {
  totalAdventures: number;
  totalViews: number;
  totalDownloads: number;
  averageRating: number;
  totalRatings: number;
  publicAdventures: number;
  privateAdventures: number;
  topAdventures: Array<{
    id: string;
    title: string;
    views: number;
    downloads: number;
    rating: number;
    ratingCount: number;
  }>;
  monthlyStats: Array<{
    month: string;
    adventures: number;
    views: number;
    downloads: number;
  }>;
}

interface CreatorAnalyticsProps {
  userId?: string;
  className?: string;
}

export function CreatorAnalytics({ userId, className = '' }: CreatorAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const endpoint = userId ? `/api/analytics/creator/${userId}` : '/api/analytics/my-stats';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Failed to load analytics data'}
        </AlertDescription>
      </Alert>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Adventures</p>
                <p className="text-2xl font-bold">{analytics.totalAdventures}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {analytics.publicAdventures} public
              </Badge>
              <Badge variant="outline" className="text-xs">
                {analytics.privateAdventures} private
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.totalViews)}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all public adventures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.totalDownloads)}</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Community engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {analytics.averageRating.toFixed(1)}
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From {analytics.totalRatings} ratings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Adventures */}
      {analytics.topAdventures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Adventures
            </CardTitle>
            <CardDescription>
              Your most popular adventures by engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topAdventures.map((adventure, index) => (
                <div key={adventure.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium line-clamp-1">{adventure.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(adventure.views)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {formatNumber(adventure.downloads)}
                        </div>
                        {adventure.ratingCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {adventure.rating.toFixed(1)} ({adventure.ratingCount})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trends */}
      {analytics.monthlyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Activity
            </CardTitle>
            <CardDescription>
              Your creation and engagement trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyStats.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="font-medium">{month.month}</div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-primary" />
                      {month.adventures} adventures
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-blue-500" />
                      {formatNumber(month.views)} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3 text-green-500" />
                      {formatNumber(month.downloads)} downloads
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recognition Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Creator Recognition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.totalViews >= 1000 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Eye className="h-3 w-3 mr-1" />
                1K+ Views
              </Badge>
            )}
            {analytics.totalDownloads >= 100 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Download className="h-3 w-3 mr-1" />
                100+ Downloads
              </Badge>
            )}
            {analytics.averageRating >= 4.5 && analytics.totalRatings >= 5 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                <Star className="h-3 w-3 mr-1" />
                Highly Rated
              </Badge>
            )}
            {analytics.totalAdventures >= 10 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <Users className="h-3 w-3 mr-1" />
                Prolific Creator
              </Badge>
            )}
            {analytics.publicAdventures >= 5 && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                Community Contributor
              </Badge>
            )}
          </div>
          {analytics.totalViews < 100 && analytics.totalAdventures < 3 && (
            <p className="text-sm text-muted-foreground mt-4">
              Keep creating and sharing adventures to earn recognition badges!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}