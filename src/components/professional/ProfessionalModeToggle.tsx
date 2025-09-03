/**
 * Enhanced Mode Toggle - Advanced Features Activation
 * 
 * This component provides users with a toggle to activate enhanced
 * features for higher quality adventure generation.
 */

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap, Crown, Star } from 'lucide-react';

interface ProfessionalModeToggleProps {
  enabled: boolean;
  available: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export const ProfessionalModeToggle: React.FC<ProfessionalModeToggleProps> = ({
  enabled,
  available,
  onToggle,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle toggle with animation
  const handleToggle = (newEnabled: boolean) => {
    if (!available) return;
    
    setIsAnimating(true);
    onToggle(newEnabled);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Get status info based on current state
  const getStatusInfo = () => {
    if (!available) {
      return {
        status: 'Enhanced Features Unavailable',
        description: 'Enhanced features are not currently available',
        color: 'bg-muted',
        icon: <Zap className="w-4 h-4 text-muted-foreground" />,
        badge: 'secondary'
      };
    }
    
    if (enabled) {
      return {
        status: 'Enhanced Mode Active',
        description: 'Advanced features enabled for superior quality',
        color: 'bg-gradient-to-r from-primary to-accent',
        icon: <Crown className="w-4 h-4 text-amber-400" />,
        badge: 'default'
      };
    }
    
    return {
      status: 'Standard Mode',
      description: 'Using standard adventure generation',
      color: 'bg-muted',
      icon: <Star className="w-4 h-4 text-muted-foreground" />,
      badge: 'outline'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${
      enabled ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
    } ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${statusInfo.color} transition-all duration-300`}>
              {statusInfo.icon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {statusInfo.status}
              </CardTitle>
              <CardDescription className="text-sm">
                {statusInfo.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Status badge */}
            <Badge variant={statusInfo.badge as any}>
              {enabled ? 'ACTIVE' : available ? 'READY' : 'UNAVAILABLE'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="space-y-2">
              {/* Toggle switch */}
              <div className="flex items-center space-x-3">
                <Switch
                  checked={enabled}
                  onCheckedChange={handleToggle}
                  disabled={!available || isAnimating}
                  className="transition-all duration-300"
                />
                <span className="text-sm font-medium">
                  {enabled ? 'Enhanced Mode Active' : 'Activate Enhanced Features'}
                </span>
              </div>

              {/* Feature preview */}
              {enabled && (
                <div className="mt-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Enhanced Features Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Advanced Analysis</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Complex Puzzles</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Enhanced Layout</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Rich NPCs</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Tactical Combat</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Editorial Polish</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Unavailable message */}
              {!available && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-muted">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Enhanced features are currently unavailable. Please check system status.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalModeToggle;