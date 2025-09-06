import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { AdventureWizard } from '@/components/adventure-wizard/AdventureWizard';
import { TierUsageIndicator } from '@/components/tier';
import { CreditPurchaseModal } from '@/components/tier/CreditPurchaseModal';
// WebSocket progress removed - using simple themed progress instead
import { ContentTypeSelector, ContentType } from '@/components/generation/ContentTypeSelector';
import { MonsterGenerator } from '@/components/generation/MonsterGenerator';
import { NPCGenerator } from '@/components/generation/NPCGenerator';
import { MagicItemGenerator } from '@/components/generation/MagicItemGenerator';
import { PuzzleGenerator } from '@/components/generation/PuzzleGenerator';
import { GeneratedContentViewer } from '@/components/generation/GeneratedContentViewer';
import { 
  Wand2, 
  Sparkles, 
  Crown, 
  Loader2,
  Coins,
  Zap
} from 'lucide-react';

export default function Generate() {
  // ALL HOOKS MUST BE AT THE TOP - NO CONDITIONAL HOOKS
  const { user, isLoading } = useAuth();
  const { trackAdventureGenerated } = useAnalytics();
  const navigate = useNavigate();
  // WebSocket progress removed - using simple themed progress instead

  // ALL useState hooks
  const [gameSystem, setGameSystem] = useState('dnd5e');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [showWizard, setShowWizard] = useState(true);
  const [userTier, setUserTier] = useState<string | null>(null);
  const [tierLoading, setTierLoading] = useState(true);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [creditPurchaseLoading, setCreditPurchaseLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'selector' | 'generator' | 'result'>('selector');
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [userCredits, setUserCredits] = useState(0);

  // ALL useEffect hooks
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserTier();
  }, [user, navigate]);

  // ALL FUNCTIONS DEFINED AFTER HOOKS
  const fetchUserTier = async () => {
    try {
      const response = await fetch('/api/user/tier-info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const tierInfo = await response.json();
        setUserTier(tierInfo.tier.name);
        setUserCredits(tierInfo.usage.generationsRemaining);
        console.log('Generate.tsx - Tier info loaded:', { 
          tier: tierInfo.tier.name, 
          credits: tierInfo.usage.generationsRemaining 
        });
      }
    } catch (error) {
      console.error('Error fetching tier info:', error);
    } finally {
      setTierLoading(false);
    }
  };

  const handleContentTypeSelect = (contentType: ContentType) => {
    setSelectedContentType(contentType);
    setCurrentView('generator');
  };

  const handleGenerationComplete = (content: any) => {
    setGeneratedContent(content);
    setCurrentView('result');
    fetchUserTier();
  };

  const handleBack = () => {
    if (currentView === 'result') {
      setCurrentView('generator');
    } else if (currentView === 'generator') {
      setCurrentView('selector');
      setSelectedContentType(null);
    }
  };

  const handleNewGeneration = () => {
    setCurrentView('selector');
    setSelectedContentType(null);
    setGeneratedContent(null);
  };

  const handleWizardComplete = async (prompt: string, selectedGameSystem: string, wizardData?: any) => {
    if (!user) {
      toast.error('Please log in to generate adventures.');
      return;
    }

    setIsGenerating(true);
    setShowWizard(false);

    // Start elegant themed progress system
    setProgress(0);
    setCurrentStep('🎲 Invocando las fuerzas creativas...');
    
    const progressSteps = [
      { progress: 5, message: '🎲 Invocando las fuerzas creativas...' },
      { progress: 15, message: '🧙‍♂️ Consultando el Oráculo Arcano...' },
      { progress: 25, message: '📜 Forjando la leyenda principal...' },
      { progress: 40, message: '🏰 Construyendo ubicaciones épicas...' },
      { progress: 55, message: '👥 Dando vida a personajes memorables...' },
      { progress: 70, message: '🐉 Despertando criaturas legendarias...' },
      { progress: 80, message: '🎨 Invocando artistas espectrales...' },
      { progress: 90, message: '✨ Aplicando encantos magistrales...' },
      { progress: 100, message: '🎉 ¡Tu aventura épica está lista!' }
    ];

    // Simulate realistic progress with beautiful themed messages
    let currentStepIndex = 0;
    const progressInterval = setInterval(() => {
      if (currentStepIndex < progressSteps.length - 1) {
        currentStepIndex++;
        const step = progressSteps[currentStepIndex];
        setProgress(step.progress);
        setCurrentStep(step.message);
      }
    }, 2000 + Math.random() * 3000); // Random intervals 2-5 seconds for realism

    try {

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const defaultPrivacy = userTier === 'architect' ? 'private' : 'public';

      const requestBody = {
        prompt,
        gameSystem: selectedGameSystem,
        privacy: wizardData?.privacy || defaultPrivacy,
        playerLevel: wizardData?.playerLevel,
        partySize: wizardData?.partySize,
        duration: wizardData?.duration,
        tone: wizardData?.tone,
        setting: wizardData?.setting,
        themes: wizardData?.themes,
        professionalMode: {
          enabled: true,
          features: {
            enhancedNPCs: true,
            multiSolutionPuzzles: true,
            tacticalCombat: true,
            professionalLayout: true,
            editorialExcellence: true,
            accessibilityFeatures: true
          }
        }
      };

      // CRITICAL FIX: Add timeout to prevent infinite hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes timeout
      
      const response = await fetch('/api/generate-adventure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate adventure');
      }

      const result = await response.json();

      if (result && (result.professionalEnhancement || result.qualityMetrics)) {
        console.log('Professional quality adventure generated successfully');
      }

      // Progress interval already removed

      if (!result) {
        throw new Error('No adventure data received');
      }

      // Complete progress and clean up
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStep('🎉 ¡Tu aventura épica está lista!');

      trackAdventureGenerated(selectedGameSystem, prompt.length);
      toast.success('¡Aventura Profesional Creada!');

      setTimeout(() => {
        let adventureId = result.originalAdventure?.id || result.adventure?.id || result.id || result._id;
        
        if (!adventureId) {
          adventureId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        const sessionKey = `adventure_${adventureId}`;
        const adventureData = {
          ...result,
          // Normalize fields for AdventureView robustness
          content: result.content || result,
          image_urls: result.image_urls || result.imageUrls || [],
          created_at: result.created_at || result.createdAt || new Date().toISOString(),
        };

        try {
          sessionStorage.setItem(sessionKey, JSON.stringify(adventureData));
        } catch (storageError) {
          console.error('Failed to store in sessionStorage:', storageError);
        }

        fetchUserTier();
        navigate(`/adventure/${adventureId}`);
      }, 500);

    } catch (error: any) {
      // Clean up progress on error
      clearInterval(progressInterval);
      setProgress(0);
      setCurrentStep('');
      
      // CRITICAL FIX: Handle different error types including timeouts
      if (error.name === 'AbortError') {
        toast.error('Generation timed out. Please try again with a shorter prompt.');
      } else if (error.message?.includes('Insufficient credits')) {
        toast.error('Insufficient credits. Please upgrade your plan.');
      } else if (error.message?.includes('rate limit')) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.message || 'Failed to generate adventure. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const resetWizard = () => {
    setShowWizard(true);
    setIsGenerating(false);
    setProgress(0);
    setCurrentStep('');
  };

  const handleCreditPurchase = async (packageId: string) => {
    setCreditPurchaseLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in to purchase credits');
        return;
      }

      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packageId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create purchase');
      }

      const result = await response.json();
      
      if (result.clientSecret) {
        toast.success('Redirecting to payment...');
      } else {
        toast.success('Credits purchased successfully!');
        setShowCreditPurchase(false);
        fetchUserTier();
      }
    } catch (error) {
      console.error('Credit purchase error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to purchase credits');
    } finally {
      setCreditPurchaseLoading(false);
    }
  };

  // ALL CONDITIONAL RETURNS AT THE END
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (tierLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (userTier === 'reader') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                ✨ Discover Amazing Legends
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our gallery of community-created adventures. 
                Upgrade to The Creator to start forging your own legends with Magic Credits!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                    The Creator
                  </CardTitle>
                  <CardDescription>
                    Forge your own legends and share them with the world
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold text-primary">€12/month</div>
                  <div className="text-center p-3 bg-primary/20 rounded-lg border border-primary/30">
                    <div className="text-3xl font-bold text-primary mb-1">10 ✨</div>
                    <div className="text-sm text-muted-foreground">Magic Credits per month</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Generate full adventures (3 ✨) and components (1 ✨)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Unlimited downloads, watermark-free
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Public sharing by default
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Option to buy additional credits
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link to="/pricing">
                      Upgrade to Creator
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-background relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-accent text-accent-foreground">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <Crown className="h-5 w-5" />
                    The Architect
                  </CardTitle>
                  <CardDescription>
                    Design your worlds in secret with master tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold text-accent">€29/month</div>
                  <div className="text-center p-3 bg-accent/20 rounded-lg border border-accent/30">
                    <div className="text-3xl font-bold text-primary mb-1">30 ✨</div>
                    <div className="text-sm text-muted-foreground">Magic Credits per month</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                      Private creations by default
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                      Adventure Forge (node builder)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                      Priority generation queue
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                      Advanced export formats
                    </li>
                  </ul>
                  <Button className="w-full" variant="secondary" asChild>
                    <Link to="/pricing">
                      Upgrade to Architect
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="text-center">
              <CardContent className="py-8">
                <h2 className="text-2xl font-bold mb-4">
                  Explore the Legend Library
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Browse thousands of adventures created by our Creator and Architect tier users. 
                  Download up to 3 adventures per month with your Reader tier!
                </p>
                <Button size="lg" asChild>
                  <Link to="/gallery">
                    <Wand2 className="h-5 w-5 mr-2" />
                    Browse Legend Library
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // MAIN RENDER - Only reached if all conditions pass
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <h1 className="text-4xl xl:text-5xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                ⚡ Creation Forge ⚡
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Forge complete adventures or individual components with precision and creativity
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Crown className="h-4 w-4 mr-2 text-primary" />
                {user?.tier || 'Apprentice'} GM
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Zap className="h-4 w-4 mr-2 text-primary" />
                {userCredits} Magic Credits ✨
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <TierUsageIndicator 
              onPurchaseCredits={() => setShowCreditPurchase(true)}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Game System</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={gameSystem} onValueChange={setGameSystem}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dnd5e">🐉 D&D 5th Edition</SelectItem>
                    <SelectItem value="pathfinder2e" disabled>🗡️ Pathfinder 2e (Coming Soon)</SelectItem>
                    <SelectItem value="other" disabled>🌌 Other Systems (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {currentView === 'selector' && (
            <ContentTypeSelector 
              onSelect={handleContentTypeSelect}
              userCredits={userCredits}
            />
          )}

          {currentView === 'generator' && selectedContentType && (
            <>
              {selectedContentType.id === 'fullAdventure' && showWizard && (
                <AdventureWizard
                  onComplete={handleWizardComplete}
                  gameSystem={gameSystem}
                  onGameSystemChange={setGameSystem}
                  userTier={userTier as 'reader' | 'creator' | 'architect'}
                />
              )}
              
              {selectedContentType.id === 'individualMonster' && (
                <MonsterGenerator 
                  onBack={handleBack}
                  onGenerated={handleGenerationComplete}
                />
              )}
              
              {selectedContentType.id === 'individualNPC' && (
                <NPCGenerator 
                  onBack={handleBack}
                  onGenerated={handleGenerationComplete}
                />
              )}
              
              {selectedContentType.id === 'magicItem' && (
                <MagicItemGenerator 
                  onBack={handleBack}
                  onGenerated={handleGenerationComplete}
                />
              )}
              
              {selectedContentType.id === 'puzzle' && (
                <PuzzleGenerator 
                  onBack={handleBack}
                  onGenerated={handleGenerationComplete}
                />
              )}
            </>
          )}

          {currentView === 'result' && generatedContent && selectedContentType && (
            <GeneratedContentViewer
              content={generatedContent}
              contentType={selectedContentType.id}
              onBack={handleBack}
              onNewGeneration={handleNewGeneration}
            />
          )}

          {isGenerating && selectedContentType?.id === 'fullAdventure' && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="h-5 w-5 animate-pulse" />
                  <span>Creating Professional Adventure</span>
                  <Badge variant="outline" className="ml-2 border-primary text-primary">
                    Professional Quality
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Advanced AI is crafting your professional-quality adventure with superior features...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentStep}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" onClick={resetWizard}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <CreditPurchaseModal
        isOpen={showCreditPurchase}
        onClose={() => setShowCreditPurchase(false)}
        onPurchase={handleCreditPurchase}
        isLoading={creditPurchaseLoading}
      />

      {/* WebSocket progress removed - using simple themed progress instead */}
    </div>
  );
}