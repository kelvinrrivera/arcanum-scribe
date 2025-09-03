import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, 
  Download, 
  Eye, 
  Star, 
  Clock, 
  Users, 
  MapPin,
  Crown,
  Sparkles,
  Coins
} from 'lucide-react';

interface AdventureCard {
  id: string;
  title: string;
  description: string;
  creator: {
    id: string;
    displayName: string;
    tier: 'explorer' | 'creator' | 'master';
    verified: boolean;
  };
  metadata: {
    playerLevel: string;
    partySize: string;
    duration: string;
    tone: string;
    setting: string;
    themes: string[];
  };
  stats: {
    views: number;
    downloads: number;
    rating: number;
    ratingCount: number;
    createdAt: Date;
  };
  thumbnail?: string;
  tags: string[];
  gameSystem: string;
  isFavorited?: boolean;
}

interface AdventureCardProps {
  adventure: AdventureCard;
  onView?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onDownload?: (id: string) => void;
  showCreator?: boolean;
}

const getTierConfig = (tier: string) => {
  switch (tier) {
    case 'master':
      return {
        icon: Crown,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-300',
        name: 'Master'
      };
    case 'creator':
      return {
        icon: Sparkles,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        borderColor: 'border-violet-300',
        name: 'Creator'
      };
    default:
      return {
        icon: Coins,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        name: 'Explorer'
      };
  }
};

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
};

export function AdventureCard({ 
  adventure, 
  onView, 
  onFavorite, 
  onDownload,
  showCreator = true 
}: AdventureCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const tierConfig = getTierConfig(adventure.creator.tier);
  const TierIcon = tierConfig.icon;

  const handleView = () => {
    if (onView) {
      onView(adventure.id);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      setIsLoading(true);
      await onFavorite(adventure.id);
      setIsLoading(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      setIsLoading(true);
      await onDownload(adventure.id);
      setIsLoading(false);
    }
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleView}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
        {adventure.thumbnail ? (
          <img 
            src={adventure.thumbnail} 
            alt={adventure.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Game System Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm"
        >
          {adventure.gameSystem.toUpperCase()}
        </Badge>

        {/* Tier Badge */}
        <Badge 
          className={`absolute top-2 right-2 ${tierConfig.bgColor} ${tierConfig.color} ${tierConfig.borderColor} border`}
        >
          <TierIcon className="h-3 w-3 mr-1" />
          {tierConfig.name}
        </Badge>

        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm"
            onClick={handleFavorite}
            disabled={isLoading}
          >
            <Heart 
              className={`h-4 w-4 ${adventure.isFavorited ? 'fill-red-500 text-red-500' : ''}`} 
            />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm"
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title and Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1 mr-2">
            {adventure.title}
          </h3>
          {adventure.stats.ratingCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{adventure.stats.rating.toFixed(1)}</span>
              <span>({adventure.stats.ratingCount})</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
          {adventure.description}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-3">
          {adventure.metadata.playerLevel && (
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Level {adventure.metadata.playerLevel}
            </Badge>
          )}
          {adventure.metadata.duration && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {adventure.metadata.duration}
            </Badge>
          )}
          {adventure.metadata.setting && (
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {adventure.metadata.setting}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {adventure.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {adventure.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {adventure.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{adventure.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          {/* Creator Info */}
          {showCreator && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {adventure.creator.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {adventure.creator.displayName}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{formatNumber(adventure.stats.views)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{formatNumber(adventure.stats.downloads)}</span>
            </div>
            <span>{formatDate(adventure.stats.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}