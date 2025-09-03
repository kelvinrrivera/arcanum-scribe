import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Sparkles, 
  Download, 
  Zap, 
  AlertTriangle,
  ShoppingCart
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MagicCreditsData {
  tier: {
    name: 'reader' | 'creator' | 'architect';
    displayName: string;
    magicCreditsPerMonth: number;
    downloadLimit: number;
    privateCreations: boolean;
    priorityQueue: boolean;
    advancedFeatures: boolean;
  };
  credits: {
    magicCredits: number;
    creditsUsed: number;
    creditsRemaining: number;
    downloadLimit: number;
    downloadsUsed: number;
    downloadsRemaining: number;
    periodStart: Date;
  };
}

interface TierUsageIndicatorProps {
  className?: string;
  showUpgradePrompts?: boolean;
  onPurchaseCredits?: () => void;
}

const getTierConfig = (tier: string) => {
  switch (tier) {
    case 'architect':
      return {
        icon: Crown,
        color: 'text-accent',
        bgColor: 'bg-accent/20',
        borderColor: 'border-accent/30',
        emoji: '🏛️'
      };
    case 'creator':
      return {
        icon: Sparkles,
        color: 'text-primary',
        bgColor: 'bg-primary/20',
        borderColor: 'border-primary/30',
        emoji: '⚒️'
      };
    default:
      return {
        icon: Download,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/50',
        borderColor: 'border-border',
        emoji: '📚'
      };
  }
};

export function TierUsageIndicator({ className = '', showUpgradePrompts = true, onPurchaseCredits }: TierUsageIndicatorProps) {
  const [tierData, setTierData] = useState<MagicCreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTierData();
  }, []);

  const fetchTierData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/user/magic-credits-info', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tier information');
      }

      const data = await response.json();
      setTierData({
        ...data,
        credits: {
          ...data.credits,
          periodStart: new Date(data.credits.periodStart)
        }
      });
    } catch (error) {
      console.error('Error fetching tier data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tier data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !tierData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Failed to load tier information'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const tierConfig = getTierConfig(tierData.tier.name);
  const TierIcon = tierConfig.icon;

  const creditsPercentage = tierData.tier.magicCreditsPerMonth > 0 
    ? (tierData.credits.creditsUsed / tierData.tier.magicCreditsPerMonth) * 100 
    : 0;

  const downloadsPercentage = tierData.tier.downloadLimit > 0 
    ? (tierData.credits.downloadsUsed / tierData.tier.downloadLimit) * 100 
    : 0;

  const isCreditsLimitReached = tierData.credits.creditsRemaining === 0;
  const isDownloadLimitReached = tierData.tier.downloadLimit > 0 && tierData.credits.downloadsRemaining === 0;

  const nextResetDate = new Date(tierData.credits.periodStart);
  nextResetDate.setMonth(nextResetDate.getMonth() + 1);

  const canPurchaseCredits = tierData.tier.name === 'creator' || tierData.tier.name === 'architect';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{tierConfig.emoji}</span>
              {tierData.tier.displayName}
            </CardTitle>
            <CardDescription>
              Usage resets on {nextResetDate.toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge className={`${tierConfig.bgColor} ${tierConfig.color} ${tierConfig.borderColor} border`}>
            <TierIcon className="h-3 w-3 mr-1" />
            {tierData.tier.displayName}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Magic Credits Usage */}
        {tierData.tier.magicCreditsPerMonth > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">Magic Credits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {tierData.credits.creditsRemaining} ✨
                </span>
                <span className="text-sm text-muted-foreground">
                  / {tierData.tier.magicCreditsPerMonth}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={creditsPercentage} 
                className="h-3"
                style={{
                  background: creditsPercentage > 80 ? '#FEE2E2' : '#F3F4F6'
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{tierData.credits.creditsUsed} used</span>
                <span>{Math.round(creditsPercentage)}% used</span>
              </div>
            </div>

            {isCreditsLimitReached && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>No Magic Credits remaining this month</span>
                  {canPurchaseCredits && onPurchaseCredits && (
                    <Button size="sm" variant="outline" onClick={onPurchaseCredits}>
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Buy Credits
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Upgrade to start creating with Magic Credits ✨
            </p>
            <Button size="sm" asChild>
              <Link to="/pricing">
                <Sparkles className="h-3 w-3 mr-1" />
                Get Magic Credits
              </Link>
            </Button>
          </div>
        )}

        {/* Downloads Usage (Reader tier only) */}
        {tierData.tier.downloadLimit > 0 && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-accent" />
                <span className="font-medium">Downloads</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {tierData.credits.downloadsRemaining} / {tierData.tier.downloadLimit}
              </span>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={downloadsPercentage} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{tierData.credits.downloadsUsed} used</span>
                <span>{Math.round(downloadsPercentage)}% used</span>
              </div>
            </div>

            {isDownloadLimitReached && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No downloads remaining this month. Upgrade for unlimited downloads!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Credit Costs Reference */}
        {tierData.tier.magicCreditsPerMonth > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-xs font-medium text-foreground mb-2">Credit Costs:</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Full Adventure</span>
                <span>3 ✨</span>
              </div>
              <div className="flex justify-between">
                <span>Monster/NPC</span>
                <span>1 ✨</span>
              </div>
              <div className="flex justify-between">
                <span>Magic Item</span>
                <span>1 ✨</span>
              </div>
              <div className="flex justify-between">
                <span>Puzzle</span>
                <span>1 ✨</span>
              </div>
            </div>
          </div>
        )}

        {/* Tier Benefits */}
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-1">
            {tierData.tier.name === 'reader' && (
              <>
                <Badge variant="secondary" className="text-xs">Gallery Access</Badge>
                <Badge variant="secondary" className="text-xs">3 Downloads/month</Badge>
              </>
            )}
            {tierData.tier.name === 'creator' && (
              <>
                <Badge variant="secondary" className="text-xs">10 Credits/month</Badge>
                <Badge variant="secondary" className="text-xs">Unlimited Downloads</Badge>
                <Badge variant="secondary" className="text-xs">Public Sharing</Badge>
              </>
            )}
            {tierData.tier.name === 'architect' && (
              <>
                <Badge variant="secondary" className="text-xs">30 Credits/month</Badge>
                <Badge variant="secondary" className="text-xs">Private by Default</Badge>
                <Badge variant="secondary" className="text-xs">Adventure Forge</Badge>
                <Badge variant="secondary" className="text-xs">Priority Queue</Badge>
              </>
            )}
          </div>
        </div>

        {/* Upgrade Prompts */}
        {showUpgradePrompts && (
          <div className="pt-4 border-t space-y-2">
            {tierData.tier.name === 'reader' && (
              <Button className="w-full" variant="outline" asChild>
                <Link to="/pricing">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Creator - €12/month
                </Link>
              </Button>
            )}
            
            {tierData.tier.name === 'creator' && (
              <Button className="w-full" variant="outline" asChild>
                <Link to="/pricing">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Architect - €29/month
                </Link>
              </Button>
            )}

            {tierData.tier.name === 'architect' && (
              <div className="text-center text-sm text-muted-foreground">
                🎉 You have the highest tier with all features unlocked!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}