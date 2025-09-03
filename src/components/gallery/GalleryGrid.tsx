import { useState, useEffect } from 'react';
import { AdventureCard } from './AdventureCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface Adventure {
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

interface GalleryGridProps {
  adventures: Adventure[];
  loading?: boolean;
  error?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onAdventureView?: (id: string) => void;
  onAdventureFavorite?: (id: string) => Promise<void>;
  onAdventureDownload?: (id: string) => Promise<void>;
  showCreator?: boolean;
}

function AdventureCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-18" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function GalleryGrid({
  adventures,
  loading = false,
  error,
  hasMore = false,
  onLoadMore,
  onAdventureView,
  onAdventureFavorite,
  onAdventureDownload,
  showCreator = true
}: GalleryGridProps) {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (onLoadMore && !loadingMore) {
      setLoadingMore(true);
      await onLoadMore();
      setLoadingMore(false);
    }
  };

  // Show error state
  if (error && !loading && adventures.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading skeletons for initial load
  if (loading && adventures.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <AdventureCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!loading && adventures.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No adventures found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters or search terms to find more adventures.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adventures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {adventures.map((adventure) => (
          <AdventureCard
            key={adventure.id}
            adventure={adventure}
            onView={onAdventureView}
            onFavorite={onAdventureFavorite}
            onDownload={onAdventureDownload}
            showCreator={showCreator}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-w-32"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Loading indicator for additional content */}
      {loading && adventures.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdventureCardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
}