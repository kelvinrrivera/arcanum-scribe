import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Share2, 
  Skull, 
  Users, 
  Gem, 
  Puzzle,
  Wand2,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedContentViewerProps {
  content: any;
  contentType: string;
  onBack: () => void;
  onNewGeneration: () => void;
}

export function GeneratedContentViewer({ 
  content, 
  contentType, 
  onBack, 
  onNewGeneration 
}: GeneratedContentViewerProps) {
  const [copied, setCopied] = useState(false);

  const getContentIcon = () => {
    switch (contentType) {
      case 'monster': return Skull;
      case 'npc': return Users;
      case 'magicItem': return Gem;
      case 'puzzle': return Puzzle;
      default: return Wand2;
    }
  };

  const getContentColor = () => {
    switch (contentType) {
      case 'monster': return 'from-red-500 to-orange-500';
      case 'npc': return 'from-blue-500 to-cyan-500';
      case 'magicItem': return 'from-emerald-500 to-teal-500';
      case 'puzzle': return 'from-amber-500 to-yellow-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  const getContentTitle = () => {
    switch (contentType) {
      case 'monster': return 'Monster';
      case 'npc': return 'NPC';
      case 'magicItem': return 'Magic Item';
      case 'puzzle': return 'Puzzle';
      default: return 'Content';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(content, null, 2));
      setCopied(true);
      toast.success('Content copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const renderContent = () => {
    if (contentType === 'monster') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Information</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Type:</strong> {content.type}</p>
                <p><strong>Size:</strong> {content.size}</p>
                <p><strong>Alignment:</strong> {content.alignment}</p>
                <p><strong>Challenge Rating:</strong> {content.challengeRating}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Combat Stats</h4>
              <div className="space-y-1 text-sm">
                <p><strong>AC:</strong> {content.armorClass}</p>
                <p><strong>HP:</strong> {content.hitPoints}</p>
                <p><strong>Speed:</strong> {content.speed}</p>
              </div>
            </div>
          </div>

          {content.abilities && (
            <div>
              <h4 className="font-semibold mb-2">Ability Scores</h4>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-medium">STR</div>
                  <div>{content.abilities.strength}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">DEX</div>
                  <div>{content.abilities.dexterity}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">CON</div>
                  <div>{content.abilities.constitution}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">INT</div>
                  <div>{content.abilities.intelligence}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">WIS</div>
                  <div>{content.abilities.wisdom}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">CHA</div>
                  <div>{content.abilities.charisma}</div>
                </div>
              </div>
            </div>
          )}

          {content.description && (
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.description}</p>
            </div>
          )}

          {content.traits && content.traits.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Traits</h4>
              <div className="space-y-2">
                {content.traits.map((trait: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <h5 className="font-medium text-sm">{trait.name}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{trait.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.actions && content.actions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Actions</h4>
              <div className="space-y-2">
                {content.actions.map((action: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <h5 className="font-medium text-sm">{action.name}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (contentType === 'npc') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Information</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Race:</strong> {content.race}</p>
                <p><strong>Class:</strong> {content.class}</p>
                <p><strong>Alignment:</strong> {content.alignment}</p>
                {content.level && <p><strong>Level:</strong> {content.level}</p>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Languages & Skills</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Languages:</strong> {content.languages}</p>
                {content.skills && <p><strong>Skills:</strong> {content.skills}</p>}
              </div>
            </div>
          </div>

          {content.appearance && (
            <div>
              <h4 className="font-semibold mb-2">Appearance</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.appearance}</p>
            </div>
          )}

          {content.personality && (
            <div>
              <h4 className="font-semibold mb-2">Personality</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.personality}</p>
            </div>
          )}

          {content.background && (
            <div>
              <h4 className="font-semibold mb-2">Background</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.background}</p>
            </div>
          )}

          {content.motivation && (
            <div>
              <h4 className="font-semibold mb-2">Motivation</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.motivation}</p>
            </div>
          )}

          {content.roleplayingTips && (
            <div>
              <h4 className="font-semibold mb-2">Roleplaying Tips</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.roleplayingTips}</p>
            </div>
          )}
        </div>
      );
    }

    // Generic content display for other types
    return (
      <div className="space-y-4">
        {Object.entries(content).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return (
              <div key={key}>
                <h4 className="font-semibold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <pre className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            );
          }
          return (
            <div key={key}>
              <h4 className="font-semibold mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
              <p className="text-sm text-muted-foreground">{String(value)}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const Icon = getContentIcon();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getContentColor()} shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">{content.name || `Generated ${getContentTitle()}`}</h2>
              <Badge variant="outline" className="text-xs">
                {getContentTitle()} • Generated Successfully
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {content.name || `Generated ${getContentTitle()}`}
          </CardTitle>
          <CardDescription>
            Your {getContentTitle().toLowerCase()} has been generated successfully! Review the details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {renderContent()}
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          onClick={onNewGeneration}
          className={`bg-gradient-to-r ${getContentColor()} hover:opacity-90 text-white shadow-lg`}
          size="lg"
        >
          <Wand2 className="h-5 w-5 mr-2" />
          Generate Another {getContentTitle()}
        </Button>
      </div>
    </div>
  );
}