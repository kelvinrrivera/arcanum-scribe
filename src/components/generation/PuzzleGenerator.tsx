import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Puzzle, Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface PuzzleGeneratorProps {
  onBack: () => void;
  onGenerated: (puzzle: any) => void;
}

export function PuzzleGenerator({ onBack, onGenerated }: PuzzleGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [gameSystem, setGameSystem] = useState('dnd5e');
  const [difficulty, setDifficulty] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the puzzle you want to create');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-puzzle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          gameSystem,
          difficulty: difficulty || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate puzzle');
      }

      toast.success('Puzzle generated successfully! ✨');
      onGenerated(data.puzzle);
      
    } catch (error: any) {
      console.error('Puzzle generation error:', error);
      toast.error(error.message || 'Failed to generate puzzle');
    } finally {
      setIsGenerating(false);
    }
  };

  const difficulties = [
    'trivial', 'easy', 'medium', 'hard', 'very_hard', 'nearly_impossible'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg">
            <Puzzle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Puzzle Generator</h2>
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
          <CardTitle>Describe Your Puzzle</CardTitle>
          <CardDescription>
            Create an engaging challenge with clear objectives, multiple solutions, and fair difficulty.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="puzzle-prompt">Puzzle Description</Label>
            <Textarea
              id="puzzle-prompt"
              placeholder="A magical door with five colored gems that must be activated in the correct sequence. Ancient runes provide cryptic clues about the order..."
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
              <Label htmlFor="difficulty">Difficulty (Optional)</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-determine" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff.split('_').map(word => 
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
              <li>• Describe the puzzle's setting and appearance</li>
              <li>• Include the type of challenge (riddle, mechanical, magical, logic)</li>
              <li>• Mention what players need to accomplish</li>
              <li>• Consider what clues or hints are available</li>
              <li>• Think about consequences for success and failure</li>
            </ul>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Crafting Puzzle...
              </>
            ) : (
              <>
                <Puzzle className="h-5 w-5 mr-2" />
                Generate Puzzle (1 ✨)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}