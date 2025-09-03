import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wand2, ArrowLeft, ArrowRight, Sparkles, Edit3, Globe, Lock } from 'lucide-react';

interface WizardData {
  playerLevel: string;
  partySize: string;
  duration: string;
  tone: string;
  setting: string;
  themes: string[];
  customElements: string;
  privacy: 'public' | 'private';
}

interface AdventureWizardProps {
  onComplete: (prompt: string, gameSystem: string, wizardData?: WizardData) => void;
  gameSystem: string;
  onGameSystemChange: (system: string) => void;
  userTier?: 'explorer' | 'creator' | 'master';
}

const STEPS = [
  { id: 1, title: 'Party', description: 'Level and party size' },
  { id: 2, title: 'Adventure', description: 'Duration and tone' },
  { id: 3, title: 'Setting', description: 'World and themes' },
  { id: 4, title: 'Privacy', description: 'Visibility settings' },
  { id: 5, title: 'Custom', description: 'Unique elements' },
  { id: 6, title: 'Review', description: 'Final prompt' }
];

export function AdventureWizard({ onComplete, gameSystem, onGameSystemChange, userTier = 'explorer' }: AdventureWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    playerLevel: '',
    partySize: '',
    duration: '',
    tone: '',
    setting: '',
    themes: [],
    customElements: '',
    privacy: userTier === 'master' ? 'private' : 'public'
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const updateWizardData = (field: keyof WizardData, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTheme = (theme: string) => {
    setWizardData(prev => ({
      ...prev,
      themes: prev.themes.includes(theme) 
        ? prev.themes.filter(t => t !== theme)
        : [...prev.themes, theme]
    }));
  };

  const generatePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      // Build the prompt based on wizard data
      const contextPrompt = `
Generate a detailed prompt for a ${gameSystem} adventure with the following specifications:

- Character level: ${wizardData.playerLevel}
- Party size: ${wizardData.partySize} players
- Duration: ${wizardData.duration}
- Tone: ${wizardData.tone}
- Setting: ${wizardData.setting}
- Themes: ${wizardData.themes.join(', ')}
${wizardData.customElements ? `- Specific elements: ${wizardData.customElements}` : ''}

The prompt should include:
1. A unique and compelling premise
2. Clear objectives for the characters
3. Specific antagonists or conflicts
4. Stakes appropriate for the level
5. Hooks that connect with the PCs
6. Clear narrative structure
`;

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contextPrompt })
      });

      if (!response.ok) throw new Error('Failed to generate prompt');
      
      const data = await response.json();
      setGeneratedPrompt(data.prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      // Fallback: generate basic prompt
      const fallbackPrompt = `A ${wizardData.duration} adventure for ${wizardData.partySize} level ${wizardData.playerLevel} characters. ${wizardData.tone} tone in a ${wizardData.setting} setting. ${wizardData.themes.length > 0 ? `Includes elements of: ${wizardData.themes.join(', ')}.` : ''} ${wizardData.customElements}`;
      setGeneratedPrompt(fallbackPrompt);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return wizardData.playerLevel && wizardData.partySize;
      case 2: return wizardData.duration && wizardData.tone;
      case 3: return wizardData.setting;
      case 4: return true; // Privacy is optional
      case 5: return true; // Custom elements are optional
      case 6: return generatedPrompt;
      default: return false;
    }
  };

  const nextStep = async () => {
    if (currentStep === 5) {
      await generatePrompt();
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Character Level</Label>
              <Select value={wizardData.playerLevel} onValueChange={(value) => updateWizardData('playerLevel', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select party level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3">Level 1-3 (Beginners)</SelectItem>
                  <SelectItem value="4-6">Level 4-6 (Adventurers)</SelectItem>
                  <SelectItem value="7-10">Level 7-10 (Heroes)</SelectItem>
                  <SelectItem value="11-15">Level 11-15 (Champions)</SelectItem>
                  <SelectItem value="16-20">Level 16-20 (Legends)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Party Size</Label>
              <Select value={wizardData.partySize} onValueChange={(value) => updateWizardData('partySize', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="How many players?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-3">2-3 players (Small party)</SelectItem>
                  <SelectItem value="4-5">4-5 players (Standard party)</SelectItem>
                  <SelectItem value="6-7">6-7 players (Large party)</SelectItem>
                  <SelectItem value="8+">8+ players (Epic party)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Adventure Duration</Label>
              <Select value={wizardData.duration} onValueChange={(value) => updateWizardData('duration', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="How long do you want to play?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-shot">One-shot (1 session, 3-4 hours)</SelectItem>
                  <SelectItem value="short">Short adventure (2-3 sessions)</SelectItem>
                  <SelectItem value="medium">Mini-campaign (4-8 sessions)</SelectItem>
                  <SelectItem value="long">Long campaign (9+ sessions)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Adventure Tone</Label>
              <Select value={wizardData.tone} onValueChange={(value) => updateWizardData('tone', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="What atmosphere are you looking for?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heroic">Heroic (Classic adventure)</SelectItem>
                  <SelectItem value="dark">Dark (Horror and suspense)</SelectItem>
                  <SelectItem value="mystery">Mystery (Investigation)</SelectItem>
                  <SelectItem value="political">Political (Intrigue and diplomacy)</SelectItem>
                  <SelectItem value="comedy">Comedy (Light and fun)</SelectItem>
                  <SelectItem value="epic">Epic (Cosmic stakes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Primary Setting</Label>
              <Select value={wizardData.setting} onValueChange={(value) => updateWizardData('setting', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Where does the adventure take place?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urban">Urban (City, town)</SelectItem>
                  <SelectItem value="dungeon">Dungeon (Dungeons, ruins)</SelectItem>
                  <SelectItem value="wilderness">Wilderness (Forests, mountains)</SelectItem>
                  <SelectItem value="planar">Planar (Other planes)</SelectItem>
                  <SelectItem value="nautical">Nautical (Sea, islands)</SelectItem>
                  <SelectItem value="underground">Underground (Underdark)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Themes and elements (optional)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['Dragons', 'Ancient Magic', 'Politics', 'Romance', 'Betrayal', 'Redemption', 'Revenge', 'Mystery'].map(theme => (
                  <Button
                    key={theme}
                    variant={wizardData.themes.includes(theme) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTheme(theme)}
                    className="justify-start"
                  >
                    {theme}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Adventure Privacy</Label>
              <Select value={wizardData.privacy} onValueChange={(value: 'public' | 'private') => updateWizardData('privacy', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose privacy setting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">Public</div>
                        <div className="text-xs text-muted-foreground">
                          Visible in gallery, can be downloaded by all users
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="private" disabled={userTier === 'explorer'}>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">Private</div>
                        <div className="text-xs text-muted-foreground">
                          Only visible to you
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {userTier === 'reader' && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Reader tier</strong> users cannot create adventures. 
                    Upgrade to Creator or Architect tier to start generating content.
                  </p>
                </div>
              )}
              
              {userTier === 'creator' && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Creator tier</strong> creates public adventures by default. 
                    Upgrade to Architect for private creations.
                  </p>
                </div>
              )}
              
              {userTier === 'architect' && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700">
                    <strong>Architect tier</strong> creates private adventures by default.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Specific elements (optional)</Label>
              <Textarea
                value={wizardData.customElements}
                onChange={(e) => updateWizardData('customElements', e.target.value)}
                placeholder="Is there anything specific you want to include? NPCs, locations, magic items, etc."
                className="mt-2 min-h-[100px]"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Generated Prompt</Label>
              {isGeneratingPrompt ? (
                <div className="flex items-center justify-center p-8">
                  <Wand2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Generating custom prompt...</span>
                </div>
              ) : (
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="mt-2 min-h-[200px]"
                  placeholder="The prompt will appear here..."
                />
              )}
            </div>
            
            {generatedPrompt && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={generatePrompt}
                  disabled={isGeneratingPrompt}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Adventure Wizard
            </CardTitle>
            <CardDescription>
              {STEPS[currentStep - 1]?.description}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {currentStep} de {STEPS.length}
          </Badge>
        </div>
        <Progress value={(currentStep / STEPS.length) * 100} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStep()}

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isGeneratingPrompt}
            >
              {currentStep === 5 ? (
                isGeneratingPrompt ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Prompt...
                  </>
                ) : (
                  <>
                    Generate Prompt
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => onComplete(generatedPrompt, gameSystem, wizardData)}
              disabled={!generatedPrompt}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Adventure
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}