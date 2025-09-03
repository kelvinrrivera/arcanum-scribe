import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, ScrollText, Sparkles } from 'lucide-react';

export const ThemeShowcase = () => {
  return (
    <Card className="w-96 border-border magical-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">The Alchemist's Tower</CardTitle>
          <Badge variant="secondary" className="badge-compact">
            <Sparkles className="h-3 w-3 mr-1" />
            Magical
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 font-sans">
          Discover the secrets hidden within the ancient spire, where mystical energies 
          converge and forbidden knowledge awaits those brave enough to seek it.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-primary" />
            <span className="text-sm">Uses Nunito Sans for readability</span>
          </div>
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="text-sm">Cinzel font for magical titles</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button className="flex-1">
            Begin Quest
          </Button>
          <Button variant="outline" size="icon" className="magical-glow">
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">
            <strong>Light Mode (Scribe):</strong> Professional purple with clean design<br/>
            <strong>Dark Mode (Archmage):</strong> Magical gold with immersive atmosphere
          </p>
        </div>
      </CardContent>
    </Card>
  );
};