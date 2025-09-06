import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  Eye,
  Download,
  Trash2,
  Globe,
  Lock,
  Edit3
} from 'lucide-react';

// EXACT interface from /library
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

interface LibraryAdventureCardProps {
  adventure: Adventure;
  onPrivacyChange?: (adventureId: string, privacy: 'public' | 'private') => void;
  onDelete?: (adventureId: string) => void;
  showPrivacyControl?: boolean;
  showDeleteButton?: boolean;
  isReadOnly?: boolean;
}

export function LibraryAdventureCard({ 
  adventure, 
  onPrivacyChange,
  onDelete,
  showPrivacyControl = false,
  showDeleteButton = false,
  isReadOnly = true
}: LibraryAdventureCardProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAverageRating = (adventure: Adventure) => {
    // This would come from actual rating data
    return 0;
  };

  // Extract the main image from adventure content - EXACT same logic as /library
  const getAdventureImage = () => {
    if (adventure.content?.images && adventure.content.images.length > 0) {
      return adventure.content.images[0].url;
    }
    if (adventure.content?.monsters && adventure.content.monsters.length > 0) {
      const monster = adventure.content.monsters[0];
      if (monster.image_url) return monster.image_url;
    }
    if (adventure.content?.npcs && adventure.content.npcs.length > 0) {
      const npc = adventure.content.npcs[0];
      if (npc.image_url) return npc.image_url;
    }
    return null;
  };

  const mainImage = getAdventureImage();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Adventure Image - EXACT same as /library */}
      {mainImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={mainImage}
            alt={adventure.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            {(adventure.privacy || 'public') === 'public' ? (
              <Badge className="bg-green-600/90 text-white border-0">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge className="bg-blue-600/90 text-white border-0">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg line-clamp-2 drop-shadow-lg">
              {adventure.title}
            </h3>
          </div>
        </div>
      )}

      <CardHeader className={mainImage ? "pb-2" : ""}>
        {!mainImage && (
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
              {(adventure.privacy || 'public') === 'public' ? (
                <Globe className="h-4 w-4 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 text-blue-600" />
              )}
            </div>
          </div>
        )}
        {mainImage && (
          <CardDescription className="line-clamp-2 mt-2">
            {adventure.description || 'No description available'}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metadata - EXACT same as /library */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(adventure.created_at)}
          </div>
          <Badge variant="outline" className="text-xs">
            {adventure.game_system.toUpperCase()}
          </Badge>
        </div>

        {/* Stats - EXACT same as /library */}
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

        {/* Privacy Control - Only show if not read-only */}
        {showPrivacyControl && onPrivacyChange && (
          <div className="flex items-center gap-2">
            <Select
              value={adventure.privacy || 'public'}
              onValueChange={(value: 'public' | 'private') => onPrivacyChange?.(adventure.id, value)}
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
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-600" />
                    Private
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Actions - EXACT same as /library */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to={`/adventure/${adventure.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Link>
          </Button>

          {!isReadOnly && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/adventure/${adventure.id}/edit`}>
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Link>
              </Button>

              {showDeleteButton && onDelete && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDelete(adventure.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}