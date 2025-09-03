import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Download, Crown, Zap } from 'lucide-react';

interface MagicCreditsIndicatorProps {
  tier: 'reader' | 'creator' | 'architect';
  magicCredits: number;
  creditsUsed: number;
  downloadLimit: number;
  downloadsUsed: number;
  onUpgrade?: () => void;
  onPurchaseCredits?: () => void;
}

const tierConfig = {
  reader: {
    name: 'The Reader',
    icon: '📚',
    color: 'bg-muted',
    textColor: 'text-muted-foreground',
    description: 'Explore community legends'
  },
  creator: {
    name: 'The Creator',
    icon: '⚒️',
    color: 'bg-primary',
    textColor: 'text-primary',
    description: 'Forge your own legends'
  },
  architect: {
    name: 'The Architect',
    icon: '🏛️',
    color: 'bg-accent',
    textColor: 'text-accent',
    description: 'Design worlds in secret'
  }
};

const creditCosts = {
  fullAdventure: 3,
  individualMonster: 1,
  individualNPC: 1,
  magicItem: 1,
  puzzle: 1,
  regenerateSection: 1
};

export const MagicCreditsIndicator: React.FC<MagicCreditsIndicatorProps> = ({
  tier,
  magicCredits,
  creditsUsed,
  downloadLimit,
  downloadsUsed,
  onUpgrade,
  onPurchaseCredits
}) => {
  const config = tierConfig[tier];
  const creditsRemaining = Math.max(0, magicCredits - creditsUsed);
  const creditsProgress = magicCredits > 0 ? (creditsUsed / magicCredits) * 100 : 0;
  
  const downloadsRemaining = downloadLimit === -1 ? -1 : Math.max(0, downloadLimit - downloadsUsed);
  const downloadsProgress = downloadLimit > 0 ? (downloadsUsed / downloadLimit) * 100 : 0;

  const canPurchaseCredits = tier === 'creator' || tier === 'architect';

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-4 space-y-4">
      {/* Tier Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white text-sm font-bold`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{config.name}</h3>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        {tier !== 'architect' && (
          <Button
            size="sm"
            variant="outline"
            onClick={onUpgrade}
            className="text-xs"
          >
            <Crown className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        )}
      </div>

      {/* Magic Credits Section */}
      {magicCredits > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Magic Credits</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-primary">
                {creditsRemaining} ✨
              </span>
              <span className="text-xs text-muted-foreground">
                / {magicCredits}
              </span>
            </div>
          </div>
          
          <Progress 
            value={creditsProgress} 
            className="h-2"
            style={{
              background: creditsProgress > 80 ? '#FEE2E2' : '#F3F4F6'
            }}
          />
          
          {creditsRemaining === 0 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-destructive">No credits remaining</p>
              {canPurchaseCredits && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onPurchaseCredits}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Buy Credits
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Reader tier - no credits
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground mb-2">
            Upgrade to start creating with Magic Credits ✨
          </p>
          <Button
            size="sm"
            onClick={onUpgrade}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Get Magic Credits
          </Button>
        </div>
      )}

      {/* Downloads Section */}
      {downloadLimit > 0 && (
        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Downloads</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-blue-600">
                {downloadsRemaining}
              </span>
              <span className="text-xs text-gray-500">
                / {downloadLimit}
              </span>
            </div>
          </div>
          
          <Progress 
            value={downloadsProgress} 
            className="h-2"
            style={{
              background: downloadsProgress > 80 ? '#FEE2E2' : '#F3F4F6'
            }}
          />
          
          {downloadsRemaining === 0 && (
            <p className="text-xs text-red-600">No downloads remaining this month</p>
          )}
        </div>
      )}

      {/* Credit Costs Reference */}
      {magicCredits > 0 && (
        <div className="border-t pt-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Credit Costs:</h4>
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Full Adventure</span>
              <span>{creditCosts.fullAdventure} ✨</span>
            </div>
            <div className="flex justify-between">
              <span>Monster/NPC</span>
              <span>{creditCosts.individualMonster} ✨</span>
            </div>
            <div className="flex justify-between">
              <span>Magic Item</span>
              <span>{creditCosts.magicItem} ✨</span>
            </div>
            <div className="flex justify-between">
              <span>Puzzle</span>
              <span>{creditCosts.puzzle} ✨</span>
            </div>
          </div>
        </div>
      )}

      {/* Tier Benefits */}
      <div className="border-t pt-3">
        <div className="flex flex-wrap gap-1">
          {tier === 'reader' && (
            <>
              <Badge variant="secondary" className="text-xs">Gallery Access</Badge>
              <Badge variant="secondary" className="text-xs">3 Downloads/month</Badge>
            </>
          )}
          {tier === 'creator' && (
            <>
              <Badge variant="secondary" className="text-xs">10 Credits/month</Badge>
              <Badge variant="secondary" className="text-xs">Unlimited Downloads</Badge>
              <Badge variant="secondary" className="text-xs">Public Sharing</Badge>
            </>
          )}
          {tier === 'architect' && (
            <>
              <Badge variant="secondary" className="text-xs">30 Credits/month</Badge>
              <Badge variant="secondary" className="text-xs">Private by Default</Badge>
              <Badge variant="secondary" className="text-xs">Adventure Forge</Badge>
              <Badge variant="secondary" className="text-xs">Priority Queue</Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagicCreditsIndicator;