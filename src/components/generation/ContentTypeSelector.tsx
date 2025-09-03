import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  Skull, 
  Users, 
  Gem, 
  Puzzle, 
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';

export interface ContentType {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ComponentType<any>;
  color: string;
  examples: string[];
}

const contentTypes: ContentType[] = [
  {
    id: 'fullAdventure',
    name: 'Full Adventure',
    description: 'Complete adventure with story, encounters, NPCs, and locations',
    cost: 3,
    icon: Wand2,
    color: 'from-purple-500 to-pink-500',
    examples: ['Epic quest', 'Mystery investigation', 'Dungeon crawl', 'Political intrigue']
  },
  {
    id: 'individualMonster',
    name: 'Monster',
    description: 'Detailed creature with stats, abilities, and lore',
    cost: 1,
    icon: Skull,
    color: 'from-red-500 to-orange-500',
    examples: ['Ancient dragon', 'Undead knight', 'Fey trickster', 'Aberrant horror']
  },
  {
    id: 'individualNPC',
    name: 'NPC',
    description: 'Memorable character with personality, background, and motivations',
    cost: 1,
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    examples: ['Wise mentor', 'Cunning merchant', 'Mysterious stranger', 'Noble lord']
  },
  {
    id: 'magicItem',
    name: 'Magic Item',
    description: 'Enchanted object with unique properties and rich history',
    cost: 1,
    icon: Gem,
    color: 'from-emerald-500 to-teal-500',
    examples: ['Legendary sword', 'Mystical amulet', 'Cursed ring', 'Ancient tome']
  },
  {
    id: 'puzzle',
    name: 'Puzzle',
    description: 'Engaging challenge with multiple solutions and clear objectives',
    cost: 1,
    icon: Puzzle,
    color: 'from-amber-500 to-yellow-500',
    examples: ['Ancient riddle', 'Mechanical trap', 'Magical seal', 'Logic challenge']
  }
];

interface ContentTypeSelectorProps {
  onSelect: (contentType: ContentType) => void;
  userCredits?: number;
}

export function ContentTypeSelector({ onSelect, userCredits = 0 }: ContentTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);

  const handleSelect = (contentType: ContentType) => {
    setSelectedType(contentType);
    onSelect(contentType);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl rounded-full"></div>
          <h2 className="relative text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ✨ Choose Your Creation ✨
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select what you'd like to create. Each type costs different amounts of Magic Credits.
        </p>
        
        {userCredits > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{userCredits} Magic Credits Available</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map((contentType) => {
          const Icon = contentType.icon;
          const canAfford = userCredits >= contentType.cost;
          
          return (
            <Card 
              key={contentType.id}
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                selectedType?.id === contentType.id 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : canAfford 
                    ? 'hover:border-primary/50' 
                    : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => canAfford && handleSelect(contentType)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${contentType.color} opacity-10`}></div>
              
              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${contentType.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-display">{contentType.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {contentType.cost} Credit{contentType.cost > 1 ? 's' : ''}
                        </Badge>
                        {!canAfford && (
                          <Badge variant="destructive" className="text-xs">
                            Not enough credits
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {contentType.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Examples:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {contentType.examples.slice(0, 2).map((example, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                    {contentType.examples.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{contentType.examples.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                {selectedType?.id === contentType.id && (
                  <div className="pt-2">
                    <Button 
                      className={`w-full bg-gradient-to-r ${contentType.color} hover:opacity-90 text-white shadow-lg`}
                      disabled={!canAfford}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Create {contentType.name}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {userCredits === 0 && (
        <div className="text-center py-8">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Magic Credits Available</p>
              <p className="text-sm">Upgrade your tier or purchase additional credits to start creating.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}