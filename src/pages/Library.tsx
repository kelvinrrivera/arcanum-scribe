import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Wand2, 
  Scroll, 
  Search, 
  Plus,
  Calendar,
  Eye,
  Download,
  Trash2
} from 'lucide-react';

interface Adventure {
  id: string;
  title: string;
  description: string;
  game_system: string;
  created_at: string;
  is_public: boolean;
}

export default function Library() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  useEffect(() => {
    fetchAdventures();
  }, [user]);

  const fetchAdventures = async () => {
    try {
      const { data, error } = await supabase
        .from('adventures')
        .select('id, title, description, game_system, created_at, is_public')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdventures(data || []);
    } catch (error) {
      console.error('Error fetching adventures:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAdventure = async (id: string) => {
    if (!confirm('Are you sure you want to delete this adventure?')) return;

    try {
      const { error } = await supabase
        .from('adventures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAdventures(adventures.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting adventure:', error);
    }
  };

  const filteredAdventures = adventures.filter(adventure =>
    adventure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adventure.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Adventure Library
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Your collection of magical creations
              </p>
            </div>
            
            <Button asChild className="gradient-primary text-primary-foreground magical-glow">
              <Link to="/generate">
                <Plus className="mr-2 h-4 w-4" />
                Create New Adventure
              </Link>
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search adventures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Adventures Grid */}
          {filteredAdventures.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="space-y-4">
                  <Scroll className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {searchTerm ? 'No adventures found' : 'No adventures yet'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm 
                        ? 'Try adjusting your search terms'
                        : "Start creating your first magical adventure!"
                      }
                    </p>
                    {!searchTerm && (
                      <Button asChild className="gradient-primary text-primary-foreground magical-glow">
                        <Link to="/generate">
                          <Wand2 className="mr-2 h-4 w-4" />
                          Create Your First Adventure
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAdventures.map((adventure) => (
                <Card 
                  key={adventure.id} 
                  className="magical-shadow hover:magical-glow transition-all duration-300 cursor-pointer group"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg leading-tight">
                          {adventure.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {adventure.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Badge variant="outline" className="text-xs">
                        {adventure.game_system === 'dnd5e' ? 'D&D 5e' : adventure.game_system}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(adventure.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button 
                          asChild 
                          size="sm" 
                          className="group-hover:scale-105 transition-transform"
                        >
                          <Link to={`/adventure/${adventure.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {/* TODO: Export functionality */}}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
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
      </main>
    </div>
  );
}