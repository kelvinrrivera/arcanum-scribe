import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface NPCGeneratorProps {
  onBack: () => void;
  onGenerated: (npc: any) => void;
}

export function NPCGenerator({ onBack, onGenerated }: NPCGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [gameSystem, setGameSystem] = useState('dnd5e');
  const [npcRole, setNpcRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the NPC you want to create');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-npc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          gameSystem,
          npcRole: npcRole || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate NPC');
      }

      toast.success('NPC generated successfully! ✨');
      onGenerated(data.npc);
      
    } catch (error: any) {
      console.error('NPC generation error:', error);
      toast.error(error.message || 'Failed to generate NPC');
    } finally {
      setIsGenerating(false);
    }
  };

  const npcRoles = [
    'ally', 'mentor', 'quest_giver', 'merchant', 'innkeeper', 'guard', 'noble', 'commoner',
    'villain', 'antagonist', 'rival', 'informant', 'guide', 'healer', 'scholar', 'artisan',
    'religious_figure', 'criminal', 'performer', 'mysterious_stranger'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">NPC Generator</h2>
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
          <CardTitle>Describe Your NPC</CardTitle>
          <CardDescription>
            Create a memorable character with personality, background, and clear motivations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="npc-prompt">NPC Description</Label>
            <Textarea
              id="npc-prompt"
              placeholder="A wise old librarian who knows ancient secrets but speaks only in riddles. She has a pet raven that seems unusually intelligent..."
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
              <Label htmlFor="npc-role">NPC Role (Optional)</Label>
              <Select value={npcRole} onValueChange={setNpcRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-determine" />
                </SelectTrigger>
                <SelectContent>
                  {npcRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.split('_').map(word => 
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
              <li>• Describe their appearance, personality, and mannerisms</li>
              <li>• Include their profession, background, or social status</li>
              <li>• Mention their goals, fears, or secrets</li>
              <li>• Consider their relationships and connections</li>
              <li>• Think about their role in your story or campaign</li>
            </ul>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating Character...
              </>
            ) : (
              <>
                <Users className="h-5 w-5 mr-2" />
                Generate NPC (1 ✨)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}