import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Wand2, 
  Search, 
  Plus,
  Calendar,
  Eye,
  Download,
  Trash2,
  Globe,
  Lock,
  Edit3,
  Crown,
  Sparkles,
  Users,
  Filter
} from 'lucide-react';

interface Adventure {
  id: string;
  title: string;
  description: string;
  game_system: string;
  privacy: 'public' | 'private';
  created_at: string;
  view_count: number;
  download_count: number;
  rating_sum: number;
  rating_count: number;
  content?: any;
}

interface UserTierInfo {
  tier: {
    name: 'reader' | 'creator' | 'architect';
    displayName: string;
    generationsPerMonth: number;
    privateAdventuresPerMonth: number;
  };
  usage: {
    generationsUsed: number;
    generationsRemaining: number;
    privateAdventuresUsed: number;
    privateAdventuresRemaining: number;
  };
}

const getTierConfig = (tier: string) => {
  switch (tier) {
    case 'architect':
      return {
        icon: Crown,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300'
      };
    case 'creator':
      return {
        icon: Sparkles,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        borderColor: 'border-violet-300'
      };
    default:
      return {
        icon: Users,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300'
      };
  }
};

export default function Library() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [filteredAdventures, setFilteredAdventures] = useState<Adventure[]>([]);
  const [tierInfo, setTierInfo] = useState<UserTierInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');

  // Redirect if not authenticated
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    navigate('/auth');
    return null;
  }

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    filterAdventures();
  }, [adventures, searchTerm, privacyFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      // Fetch adventures and tier info in parallel
      const [adventuresResponse, tierResponse] = await Promise.all([
        fetch('/api/adventures', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/user/tier-info', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (!adventuresResponse.ok || !tierResponse.ok) {
        if (adventuresResponse.status === 401 || tierResponse.status === 401) {
          localStorage.removeItem('auth_token');
          navigate('/auth');
          return;
        }
        throw new Error('Failed to fetch data');
      }

      const [adventuresData, tierData] = await Promise.all([
        adventuresResponse.json(),
        tierResponse.json()
      ]);

      setAdventures(adventuresData || []);
      setTierInfo(tierData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  const filterAdventures = () => {
    let filtered = adventures;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(adventure =>
        adventure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adventure.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Privacy filter
    if (privacyFilter !== 'all') {
      filtered = filtered.filter(adventure => adventure.privacy === privacyFilter);
    }

    setFilteredAdventures(filtered);
  };

  const updateAdventurePrivacy = async (adventureId: string, newPrivacy: 'public' | 'private') => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/adventure/${adventureId}/privacy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ privacy: newPrivacy })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update privacy');
      }

      // Update local state
      setAdventures(prev => prev.map(adventure =>
        adventure.id === adventureId
          ? { ...adventure, privacy: newPrivacy }
          : adventure
      ));

      // Refresh tier info to update usage
      const tierResponse = await fetch('/api/user/tier-info', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (tierResponse.ok) {
        const tierData = await tierResponse.json();
        setTierInfo(tierData);
      }

      toast.success(`Adventure is now ${newPrivacy}`);
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update privacy');
    }
  };

  const deleteAdventure = async (id: string) => {
    if (!confirm('Are you sure you want to delete this adventure?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/adventure/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete adventure');
      }

      setAdventures(prev => prev.filter(adventure => adventure.id !== id));
      toast.success('Adventure deleted successfully');
    } catch (error) {
      console.error('Error deleting adventure:', error);
      toast.error('Failed to delete adventure');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAverageRating = (adventure: Adventure) => {
    if (adventure.rating_count === 0) return 0;
    return (adventure.rating_sum / adventure.rating_count).toFixed(1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tierConfig = getTierConfig(tierInfo?.tier.name || 'reader');
  const TierIcon = tierConfig.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Adventures</h1>
            <p className="text-muted-foreground">
              Manage your created adventures and privacy settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            {tierInfo && tierInfo.tier && (
              <Badge className={`${tierConfig.bgColor} ${tierConfig.color} ${tierConfig.borderColor} border`}>
                <TierIcon className="h-3 w-3 mr-1" />
                {tierInfo.tier.displayName}
              </Badge>
            )}
            <Button asChild>
              <Link to="/generate">
                <Plus className="h-4 w-4 mr-2" />
                Create Adventure
              </Link>
            </Button>
          </div>
        </div>

        {/* Tier Usage Info */}
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : tierInfo && tierInfo.usage && tierInfo.tier ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Adventures Generated</span>
                    <span>{tierInfo.usage.generationsUsed || 0} / {tierInfo.tier.generationsPerMonth || 0}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(((tierInfo.usage.generationsUsed || 0) / (tierInfo.tier.generationsPerMonth || 1)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                {tierInfo.tier.name !== 'reader' && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Private Adventures</span>
                      <span>
                        {tierInfo.usage.privateAdventuresUsed || 0} / {
                          tierInfo.tier.name === 'architect' ? '∞' : (tierInfo.tier.privateAdventuresPerMonth || 0)
                        }
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          tierInfo.tier.name === 'architect' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}
                        style={{ 
                          width: tierInfo.tier.name === 'architect' 
                            ? '100%' 
                            : `${Math.min(((tierInfo.usage.privateAdventuresUsed || 0) / (tierInfo.tier.privateAdventuresPerMonth || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-4">
                Unable to load usage information
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search adventures..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={privacyFilter} onValueChange={(value: 'all' | 'public' | 'private') => setPrivacyFilter(value)}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Adventures</SelectItem>
                  <SelectItem value="public">Public Only</SelectItem>
                  <SelectItem value="private">Private Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Adventures Grid */}
        {filteredAdventures.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Wand2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {adventures.length === 0 ? 'No adventures yet' : 'No adventures match your filters'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {adventures.length === 0 
                  ? 'Create your first adventure to get started'
                  : 'Try adjusting your search or filter settings'
                }
              </p>
              {adventures.length === 0 && (
                <Button asChild>
                  <Link to="/generate">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Adventure
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdventures.map((adventure) => (
              <Card key={adventure.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2 mb-1">
                        {adventure.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {adventure.description || 'No description available'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {adventure.privacy === 'public' ? (
                        <Globe className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(adventure.created_at)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {adventure.game_system.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Stats */}
                  {adventure.privacy === 'public' && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {adventure.view_count} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {adventure.download_count} downloads
                      </div>
                      {adventure.rating_count > 0 && (
                        <div className="flex items-center gap-1">
                          ⭐ {getAverageRating(adventure)} ({adventure.rating_count})
                        </div>
                      )}
                    </div>
                  )}

                  {/* Privacy Control */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={adventure.privacy}
                      onValueChange={(value: 'public' | 'private') => updateAdventurePrivacy(adventure.id, value)}
                      disabled={tierInfo?.tier.name === 'reader'}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-green-600" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem 
                          value="private" 
                          disabled={
                            tierInfo?.tier.name === 'reader' || 
                            (tierInfo?.tier.name === 'creator')
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-blue-600" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link to={`/adventure/${adventure.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAdventure(adventure.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}