import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  TrendingUp, 
  Sparkles,
  Crown,
  Users
} from 'lucide-react';

interface FeaturedAdventure {
  id: string;
  title: string;
  description: string;
  creator: {
    displayName: string;
    tier: 'explorer' | 'creator' | 'master';
  };
  stats: {
    rating: number;
    ratingCount: number;
    views: number;
  };
  thumbnail?: string;
  gameSystem: string;
}

interface GalleryHeaderProps {
  featuredAdventures: FeaturedAdventure[];
  onAdventureView?: (id: string) => void;
}

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'master': return Crown;
    case 'creator': return Sparkles;
    default: return Users;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'master': return 'text-amber-600 bg-amber-100 border-amber-300';
    case 'creator': return 'text-violet-600 bg-violet-100 border-violet-300';
    default: return 'text-slate-600 bg-slate-100 border-slate-300';
  }
};

export function GalleryHeader({ featuredAdventures, onAdventureView }: GalleryHeaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || featuredAdventures.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredAdventures.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredAdventures.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => 
      prev === 0 ? featuredAdventures.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % featuredAdventures.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (featuredAdventures.length === 0) {
    return (
      <div className="mb-8">
        <div className="text-center py-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Adventure Gallery</h1>
          <p className="text-muted-foreground">
            Discover amazing adventures created by our community
          </p>
        </div>
      </div>
    );
  }

  const currentAdventure = featuredAdventures[currentIndex];
  const TierIcon = getTierIcon(currentAdventure.creator.tier);

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Adventure Gallery
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover professional-quality adventures created by our community
        </p>
      </div>

      {/* Featured Carousel */}
      <Card className="relative overflow-hidden">
        <div className="relative">
          {/* Background Image */}
          <div className="aspect-[21/9] bg-gradient-to-r from-primary/20 to-accent/20 relative overflow-hidden">
            {currentAdventure.thumbnail ? (
              <img 
                src={currentAdventure.thumbnail}
                alt={currentAdventure.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-background to-accent/10" />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-background/90">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                  <Badge variant="outline" className="bg-background/90">
                    {currentAdventure.gameSystem.toUpperCase()}
                  </Badge>
                  <Badge className={`border ${getTierColor(currentAdventure.creator.tier)}`}>
                    <TierIcon className="h-3 w-3 mr-1" />
                    {currentAdventure.creator.tier.charAt(0).toUpperCase() + currentAdventure.creator.tier.slice(1)}
                  </Badge>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold mb-3 text-foreground">
                  {currentAdventure.title}
                </h2>

                {/* Description */}
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {currentAdventure.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{currentAdventure.stats.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({currentAdventure.stats.ratingCount} reviews)
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {currentAdventure.stats.views.toLocaleString()} views
                  </div>
                  <div className="text-muted-foreground">
                    by {currentAdventure.creator.displayName}
                  </div>
                </div>

                {/* CTA */}
                <Button 
                  onClick={() => onAdventureView?.(currentAdventure.id)}
                  className="bg-primary hover:bg-primary/90"
                >
                  View Adventure
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {featuredAdventures.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {featuredAdventures.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {featuredAdventures.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-background/50 hover:bg-background/70'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}