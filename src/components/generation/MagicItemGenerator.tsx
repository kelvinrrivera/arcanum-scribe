import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gem, Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface MagicItemGeneratorProps {
  onBack: () => void;
  onGenerated: (magicItem: any) => void;
}

export function MagicItemGenerator({ onBack, onGenerated }: MagicItemGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [gameSystem, setGameSystem] = useState('dnd5e');
  const [rarity, setRarity] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the magic item you want to create');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-magic-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          gameSystem,
          rarity: rarity || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate magic item');
      }

      toast.success('Magic item generated successfully! ✨');
      onGenerated(data.magicItem);
      
    } catch (error: any) {
      console.error('Magic item generation error:', error);
      toast.error(error.message || 'Failed to generate magic item');
    } finally {
      setIsGenerating(false);
    }
  };

  const rarities = [
    'common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
            <Gem className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Magic Item Generator</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                1 Magic Credit
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Describe Your Magic Item</CardTitle>
          <CardDescription>
            Create an enchanted object with unique properties, rich history, and balanced mechanics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="item-prompt">Magic Item Description</Label>
            <Textarea
              id="item-prompt"
              placeholder="A crystalline staff that contains the essence of a storm. When wielded, it crackles with electricity and can summon thunder clouds..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="game-system">Game System</Label>
              <Select value={gameSystem} onValueChange={setGameSystem}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dnd5e">D&D 5th Edition</SelectItem>
                  <SelectItem value="pathfinder2e">Pathfinder 2E</SelectItem>
                  <SelectItem value="dnd35">D&D 3.5</SelectItem>
                  <SelectItem value="generic">Generic/System Agnostic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rarity">Rarity (Optional)</Label>
              <Select value={rarity} onValueChange={setRarity}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-determine" />
                </SelectTrigger>
                <SelectContent>
                  {rarities.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">💡 Tips for Better Results:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Describe the item's appearance and materials</li>
              <li>• Include the type of item (weapon, armor, wondrous item, etc.)</li>
              <li>• Mention desired magical properties or abilities</li>
              <li>• Consider the item's history or origin story</li>
              <li>• Think about any drawbacks or requirements</li>
            </ul>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Enchanting Item...
              </>
            ) : (
              <>
                <Gem className="h-5 w-5 mr-2" />
                Generate Magic Item (1 ✨)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}