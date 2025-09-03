import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Globe, 
  Lock, 
  Info, 
  AlertTriangle,
  Crown,
  Sparkles,
  Users
} from 'lucide-react';

interface PrivacyControlProps {
  currentPrivacy: 'public' | 'private';
  userTier: 'explorer' | 'creator' | 'master';
  privateAdventuresUsed: number;
  privateAdventuresRemaining: number;
  onPrivacyChange: (privacy: 'public' | 'private') => Promise<boolean>;
  disabled?: boolean;
}

const getTierConfig = (tier: string) => {
  switch (tier) {
    case 'master':
      return {
        icon: Crown,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-300',
        name: 'Master',
        privateLimit: 'Unlimited'
      };
    case 'creator':
      return {
        icon: Sparkles,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        borderColor: 'border-violet-300',
        name: 'Creator',
        privateLimit: '3 per month'
      };
    default:
      return {
        icon: Users,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        name: 'Explorer',
        privateLimit: 'None'
      };
  }
};

export function PrivacyControl({
  currentPrivacy,
  userTier,
  privateAdventuresUsed,
  privateAdventuresRemaining,
  onPrivacyChange,
  disabled = false
}: PrivacyControlProps) {
  const [isChanging, setIsChanging] = useState(false);
  const tierConfig = getTierConfig(userTier);
  const TierIcon = tierConfig.icon;

  const handlePrivacyChange = async (newPrivacy: 'public' | 'private') => {
    if (newPrivacy === currentPrivacy || isChanging) return;

    setIsChanging(true);
    try {
      const success = await onPrivacyChange(newPrivacy);
      if (!success) {
        // Handle error - the parent component should show appropriate error message
      }
    } finally {
      setIsChanging(false);
    }
  };

  const canSetPrivate = userTier === 'master' || privateAdventuresRemaining > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Adventure Privacy
            </CardTitle>
            <CardDescription>
              Control who can see and access this adventure
            </CardDescription>
          </div>
          <Badge className={`${tierConfig.bgColor} ${tierConfig.color} ${tierConfig.borderColor} border`}>
            <TierIcon className="h-3 w-3 mr-1" />
            {tierConfig.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Privacy Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Visibility</label>
          <Select 
            value={currentPrivacy} 
            onValueChange={handlePrivacyChange}
            disabled={disabled || isChanging}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Public</div>
                    <div className="text-xs text-muted-foreground">
                      Visible in gallery, can be downloaded by all users
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="private" disabled={!canSetPrivate}>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Private</div>
                    <div className="text-xs text-muted-foreground">
                      Only visible to you
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Privacy Status Alerts */}
        {currentPrivacy === 'public' && (
          <Alert>
            <Globe className="h-4 w-4 text-green-600" />
            <AlertDescription>
              This adventure is <strong>public</strong> and visible in the community gallery. 
              Other users can view, download, and rate it.
            </AlertDescription>
          </Alert>
        )}

        {currentPrivacy === 'private' && (
          <Alert>
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              This adventure is <strong>private</strong> and only visible to you. 
              It won't appear in the public gallery.
            </AlertDescription>
          </Alert>
        )}

        {/* Tier-specific Information */}
        {userTier === 'explorer' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Reader tier</strong> users cannot create adventures. 
              Upgrade to Creator or Architect tier to start generating content.
            </AlertDescription>
          </Alert>
        )}

        {userTier === 'creator' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Private adventures this month</span>
              <span className="font-medium">
                {privateAdventuresUsed} / 3 used
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(privateAdventuresUsed / 3) * 100}%` }}
              />
            </div>
            {privateAdventuresRemaining === 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Private adventures are only available with Architect tier. 
                  Creator tier adventures are public by default to build our community.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {userTier === 'master' && (
          <Alert>
            <Crown className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <strong>Architect tier</strong> includes unlimited private adventures. 
              You can make any adventure private without restrictions.
            </AlertDescription>
          </Alert>
        )}

        {/* Upgrade Prompts */}
        {userTier === 'explorer' && (
          <div className="pt-2 border-t">
            <Button variant="outline" className="w-full" asChild>
              <a href="/pricing">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Creator - $12/month
              </a>
            </Button>
          </div>
        )}

        {userTier === 'creator' && privateAdventuresRemaining === 0 && (
          <div className="pt-2 border-t">
            <Button variant="outline" className="w-full" asChild>
              <a href="/pricing">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Master - $25/month
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}