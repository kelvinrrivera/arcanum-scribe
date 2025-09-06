import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { LibraryAdventureCard } from '@/components/library/LibraryAdventureCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Sparkles,
  Crown,
  Loader2,
  Lock,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

// EXACT same interface as /library - NO CHANGES
interface Adventure {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  game_system: string;
  privacy: 'public' | 'private';
  view_count: number;
  download_count: number;
  rating_count: number;
  content?: {
    images?: Array<{ url: string }>;
    monsters?: Array<{ image_url?: string }>;
    npcs?: Array<{ image_url?: string }>;
  };
}

export default function Showcase() {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'recent' | 'popular' | 'top-rated'>('recent');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load public adventures from REAL API
  useEffect(() => {
    const loadPublicAdventures = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/public/adventures?filter=${filter}&limit=12`);
        if (!response.ok) throw new Error('Failed to load adventures');
        const data = await response.json();
        
        setAdventures(data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load adventures');
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicAdventures();
  }, [filter]);



  return (
    <div className="min-h-screen">
      <SEOHead
        title="Adventure Showcase - Community Creations"
        description="Discover amazing D&D adventures created by our community. Browse, download, and get inspired by the latest public adventures from fellow Game Masters."
        keywords={['D&D adventures', 'community adventures', 'public adventures', 'RPG showcase', 'adventure gallery']}
      />
      
      <Navigation />
      
      <div className="bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
                D&D 5e Adventure Showcase
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Discover incredible D&D 5e adventures created by our community of Game Masters. 
                Get inspired and bring these stories to your table.
              </p>
              
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  <span>Community Curated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>AI Enhanced</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  <span>Free to Use</span>
                </div>
              </div>
            </motion.div>

            {/* Filter Buttons */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { key: 'recent', label: 'Most Recent' },
                { key: 'popular', label: 'Most Popular' },
                { key: 'top-rated', label: 'Top Rated' },
                { key: 'all', label: 'All Adventures' },
              ].map((filterOption) => (
                <Button
                  key={filterOption.key}
                  variant={filter === filterOption.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(filterOption.key as any)}
                  className="min-w-[120px]"
                >
                  {filterOption.label}
                </Button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Adventures Grid */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-6xl">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading adventures...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : adventures.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Adventures Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to share your adventure with the community!
                </p>
                <Button>Create Your First Adventure</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adventures.slice(0, 12).map((adventure, index) => (
                  <motion.div
                    key={adventure.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <LibraryAdventureCard
                      adventure={adventure}
                      isReadOnly={!user}
                      showPrivacyControl={false}
                      showDeleteButton={false}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-card/95 to-card/80 border-primary/30">
                <CardContent className="p-8">
                  {!user ? (
                    <>
                      <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-4">Unlock Full Adventures</h3>
                      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Sign up to access complete D&D 5e adventures, create your own, 
                        and join our community of Game Masters.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                          onClick={() => navigate('/auth')}
                        >
                          Join Beta - Free Access
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/pricing')}>
                          View Plans
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-4">Create Your D&D 5e Adventures</h3>
                      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Ready to forge your own epic D&D 5e adventures? 
                        Use our AI-powered tools to create amazing content.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                          onClick={() => navigate('/generate')}
                        >
                          Start Creating
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/library')}>
                          My Library
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}