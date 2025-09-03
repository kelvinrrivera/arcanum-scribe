import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Skull, Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface MonsterGeneratorProps {
  onBack: () => void;
  onGenerated: (monster: any) => void;
}

export function MonsterGenerator({ onBack, onGenerated }: MonsterGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [gameSystem, setGameSystem] = useState('dnd5e');
  const [challengeRating, setChallengeRating] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the monster you want to create');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-monster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          gameSystem,
          challengeRating: challengeRating || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate monster');
      }

      toast.success('Monster generated successfully! ✨');
      onGenerated(data.monster);
      
    } catch (error: any) {
      console.error('Monster generation error:', error);
      toast.error(error.message || 'Failed to generate monster');
    } finally {
      setIsGenerating(false);
    }
  };

  const challengeRatings = [
    '0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '30'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
            <Skull className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Monster Generator</h2>
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
          <CardTitle>Describe Your Monster</CardTitle>
          <CardDescription>
            Provide details about the creature you want to create. Be as specific or creative as you like!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="monster-prompt">Monster Description</Label>
            <Textarea
              id="monster-prompt"
              placeholder="A fearsome dragon that guards an ancient library, breathing not fire but ink that transforms into shadowy creatures..."
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
              <Label htmlFor="challenge-rating">Challenge Rating (Optional)</Label>
              <Select value={challengeRating} onValueChange={setChallengeRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-determine" />
                </SelectTrigger>
                <SelectContent>
                  {challengeRatings.map((cr) => (
                    <SelectItem key={cr} value={cr}>
                      CR {cr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">💡 Tips for Better Results:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Include the monster's appearance, behavior, and abilities</li>
              <li>• Mention the environment where it's found</li>
              <li>• Describe any unique traits or special powers</li>
              <li>• Consider its role in your campaign or story</li>
            </ul>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Summoning Monster...
              </>
            ) : (
              <>
                <Skull className="h-5 w-5 mr-2" />
                Generate Monster (1 ✨)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}