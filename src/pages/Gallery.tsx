import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  GalleryHeader, 
  GalleryFilters, 
  GalleryGrid,
  type GalleryFilters as FilterType 
} from '@/components/gallery';

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

interface GalleryResponse {
  adventures: Adventure[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export default function Gallery() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [featuredAdventures, setFeaturedAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<FilterType>({
    sortBy: 'newest'
  });

  // Fetch featured adventures
  const fetchFeaturedAdventures = useCallback(async () => {
    try {
      const response = await fetch('/api/gallery/featured');
      if (!response.ok) throw new Error('Failed to fetch featured adventures');
      
      const data = await response.json();
      setFeaturedAdventures(data.adventures.map((adventure: any) => ({
        ...adventure,
        stats: {
          ...adventure.stats,
          createdAt: new Date(adventure.stats.createdAt)
        }
      })));
    } catch (error) {
      console.error('Error fetching featured adventures:', error);
    }
  }, []);

  // Fetch adventures with filters
  const fetchAdventures = useCallback(async (page: number = 1, resetList: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(filters.gameSystem && { gameSystem: filters.gameSystem }),
        ...(filters.playerLevel && { playerLevel: filters.playerLevel }),
        ...(filters.duration && { duration: filters.duration }),
        ...(filters.tone && { tone: filters.tone }),
        ...(filters.setting && { setting: filters.setting }),
        ...(filters.themes && filters.themes.length > 0 && { themes: filters.themes.join(',') }),
        ...(filters.search && { search: filters.search }),
        ...(filters.sortBy && { sortBy: filters.sortBy })
      });

      const response = await fetch(`/api/gallery/adventures?${params}`);
      if (!response.ok) throw new Error('Failed to fetch adventures');

      const data: GalleryResponse = await response.json();
      
      const processedAdventures = data.adventures.map(adventure => ({
        ...adventure,
        stats: {
          ...adventure.stats,
          createdAt: new Date(adventure.stats.createdAt)
        }
      }));

      if (resetList) {
        setAdventures(processedAdventures);
      } else {
        setAdventures(prev => [...prev, ...processedAdventures]);
      }

      setCurrentPage(data.page);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching adventures:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch adventures');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchFeaturedAdventures();
    fetchAdventures(1, true);
  }, [fetchFeaturedAdventures, fetchAdventures]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // fetchAdventures will be called by the useEffect above
  };

  const handleClearFilters = () => {
    setFilters({ sortBy: 'newest' });
    setCurrentPage(1);
  };

  // Handle load more
  const handleLoadMore = async () => {
    if (hasMore && !loading) {
      await fetchAdventures(currentPage + 1, false);
    }
  };

  // Handle adventure view
  const handleAdventureView = (adventureId: string) => {
    navigate(`/adventure/${adventureId}`);
  };

  // Handle favorite toggle
  const handleAdventureFavorite = async (adventureId: string) => {
    if (!user) {
      toast.error('Please log in to favorite adventures');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/gallery/adventure/${adventureId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to toggle favorite');

      const data = await response.json();
      
      // Update the adventure in the list
      setAdventures(prev => prev.map(adventure => 
        adventure.id === adventureId 
          ? { ...adventure, isFavorited: data.isFavorited }
          : adventure
      ));

      toast.success(data.isFavorited ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  // Handle adventure download
  const handleAdventureDownload = async (adventureId: string) => {
    try {
      // Record the download
      await fetch(`/api/gallery/adventure/${adventureId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` })
        },
        body: JSON.stringify({ format: 'pdf' })
      });

      // Navigate to the adventure page for actual download
      navigate(`/adventure/${adventureId}`);
    } catch (error) {
      console.error('Error recording download:', error);
      // Still navigate to adventure page
      navigate(`/adventure/${adventureId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header with Featured Carousel */}
        <GalleryHeader 
          featuredAdventures={featuredAdventures}
          onAdventureView={handleAdventureView}
        />

        {/* Filters */}
        <GalleryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Results Summary */}
        {!loading && adventures.length > 0 && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {adventures.length} of {adventures.length} adventures
              {filters.search && ` for "${filters.search}"`}
            </p>
          </div>
        )}

        {/* Adventures Grid */}
        <GalleryGrid
          adventures={adventures}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onAdventureView={handleAdventureView}
          onAdventureFavorite={handleAdventureFavorite}
          onAdventureDownload={handleAdventureDownload}
        />
      </main>
    </div>
  );
}