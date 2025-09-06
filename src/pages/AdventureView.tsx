import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
// Using Express API for data operations
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ArrowLeft,
  Download,
  Share2,
  BookOpen,
  Sword,
  Gem,
  Users,
  Map,
  Calendar,
  Eye,
  Copy,
  Check,
  Target,
  Zap,
  Home,
  ChevronDown,
  Crown,
  Skull,
  Star,
  Sparkles,
  Puzzle,
  Lightbulb,
  Settings,
  TrendingUp,
  GitBranch
} from 'lucide-react';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import StatBlock from '@/components/StatBlock';

interface Adventure {
  id: string;
  title: string;
  description: string;
  content: {
    title: string;
    summary: string;
    backgroundStory: string;
    plotHooks: string[];
    scenes: Array<{
      title: string;
      description: string;
      objectives: string[];
      challenges: string;
    }>;
    npcs: Array<{
      name: string;
      role: string;
      personality: string;
      motivation: string;
    }>;
    monsters: Array<{
      name: string;
      description: string;
      size: string;
      type: string;
      alignment: string;
      abilities: {
        STR: number;
        DEX: number;
        CON: number;
        INT: number;
        WIS: number;
        CHA: number;
      };
      armorClass: number;
      hitPoints: number;
      speed: string;
      skills?: string[];
      senses?: string[];
      languages?: string[];
      challengeRating: string;
      proficiencyBonus: number;
      traits?: Array<{
        name: string;
        description: string;
      }>;
      actions?: Array<{
        name: string;
        description: string;
      }>;
      bonusActions?: Array<{
        name: string;
        description: string;
      }>;
      reactions?: Array<{
        name: string;
        description: string;
      }>;
      tactics?: string;
    }>;
    magicItems: Array<{
      name: string;
      description: string;
      rarity: string;
      properties: string;
    }>;
    rewards: {
      experience: string;
      treasure: string;
      other: string;
    };
  };
  image_urls: string[];
  game_system: string;
  created_at: string;
  is_public: boolean;
  image_generation_cost?: number | string;
  regenerations_used?: number;
  // Professional enhancement fields
  professionalEnhancement?: {
    professionalGrade: string;
    unicornScore: number;
    qualityMetrics: {
      contentQuality: number;
      mechanicalAccuracy: number;
      editorialStandards: number;
      userExperience: number;
      professionalReadiness: number;
      overallScore: number;
    };
    featuresApplied: string[];
    professionalFeatures: any;
  };
}

export default function AdventureView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { trackAdventureViewed, trackAdventureExported } = useAnalytics();
  const navigate = useNavigate();
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (id) {
      fetchAdventure();
    }
  }, [id, user]);

  const fetchAdventure = async () => {
    console.log('🔍 [ADVENTURE-VIEW] Starting to fetch adventure with ID:', id);
    
    try {
      // First, check if this is a temporary adventure stored in sessionStorage
      const sessionKey = `adventure_${id}`;
      console.log('🔍 [ADVENTURE-VIEW] Checking sessionStorage with key:', sessionKey);
      
      const sessionData = sessionStorage.getItem(sessionKey);
      
      if (sessionData) {
        console.log('💾 [ADVENTURE-VIEW] Found data in sessionStorage, size:', sessionData.length, 'characters');
        try {
          const adventureData = JSON.parse(sessionData);
          console.log('📊 [ADVENTURE-VIEW] Parsed sessionStorage data:', Object.keys(adventureData));
          
          // Handle both professional mode and standard mode data structures
          let processedAdventure;
          
          if (adventureData.originalAdventure) {
            // Professional mode structure
            console.log('🦄 [ADVENTURE-VIEW] Processing professional mode adventure');
            processedAdventure = {
              id: id,
              title: adventureData.originalAdventure.title || 'Professional Adventure',
              description: adventureData.originalAdventure.summary || 'Enhanced with professional features',
              content: adventureData.originalAdventure.content || adventureData.originalAdventure,
              gameSystem: adventureData.originalAdventure.gameSystem || 'dnd5e',
              createdAt: adventureData.originalAdventure.createdAt || new Date().toISOString(),
              // Add professional enhancement data
              professionalEnhancement: {
                professionalGrade: adventureData.professionalGrade,
                unicornScore: adventureData.unicornScore,
                qualityMetrics: adventureData.qualityMetrics,
                featuresApplied: adventureData.featuresApplied,
                professionalFeatures: adventureData.professionalFeatures
              }
            };
          } else if (adventureData.adventure) {
            // Standard mode with adventure wrapper
            processedAdventure = {
              id: id,
              ...adventureData.adventure
            };
          } else {
            // Direct adventure data
            processedAdventure = {
              id: id,
              ...adventureData
            };
          }
          
          setAdventure(processedAdventure);
          
          // Track adventure view
          trackAdventureViewed(id);
          
          console.log('✅ [ADVENTURE-VIEW] Adventure loaded from session storage');
          return;
        } catch (parseError) {
          console.error('❌ [ADVENTURE-VIEW] Failed to parse session data:', parseError);
          console.log('🔄 [ADVENTURE-VIEW] Falling back to server fetch');
          // Continue to server fetch as fallback
        }
      } else {
        console.log('📭 [ADVENTURE-VIEW] No data found in sessionStorage for key:', sessionKey);
        console.log('📭 [ADVENTURE-VIEW] Available sessionStorage keys:', Object.keys(sessionStorage));
        console.log('📭 [ADVENTURE-VIEW] Trying server instead');
      }

      // If no session data, try to fetch from server
      console.log('🌐 [ADVENTURE-VIEW] Attempting to fetch from server:', `/api/adventure/${id}`);
      
      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No token found, redirecting to login...');
        // Redirect to login or show login modal
        return;
      }

      const response = await fetch(`/api/adventure/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Token invalid, clearing and redirecting...');
          localStorage.removeItem('auth_token');
          // Redirect to login
          return;
        }
        if (response.status === 404) {
          throw new Error('Adventure not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAdventure(data);
      
      // Track adventure view
      if (data) {
        trackAdventureViewed(data.id);
      }
      
      console.log('✅ [ADVENTURE-VIEW] Adventure loaded from server');
      
    } catch (error: any) {
      console.error('Error fetching adventure:', error);
      
      if (error.message === 'Adventure not found') {
        toast.error('Adventure not found or you don\'t have access to it');
      } else {
        toast.error('Failed to load adventure. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPDF = async (template: 'adventure-masterpiece' | 'full-adventure' | 'monster-card' | 'magic-item-card' | 'spell-card' | 'npc-portfolio', data?: any, title?: string, style?: 'classic' | 'gothic' | 'mystical' | 'arcane') => {
    if (!adventure) return;

    try {
      const loadingMessage = template === 'adventure-masterpiece' 
        ? `🔍 Preparing ${style || 'classic'} preview...` 
        : template === 'full-adventure' 
        ? 'Preparing full adventure preview...' 
        : template === 'monster-card' 
        ? 'Preparing monster card preview...'
        : template === 'magic-item-card'
        ? 'Preparing magic item card preview...'
        : template === 'spell-card'
        ? 'Preparing spell card preview...'
        : 'Preparing NPC portfolio preview...';
      
      toast.loading(loadingMessage);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const requestBody: any = {
        template,
        title: title || adventure.title,
        style: style || 'classic'
      };

      // Add professional mode information for enhanced PDF formatting
      if (professionalEnhancement) {
        requestBody.professionalMode = true;
        requestBody.professionalGrade = professionalEnhancement.professionalGrade;
        requestBody.qualityMetrics = professionalEnhancement.qualityMetrics;
        requestBody.professionalFeatures = {
          multiSolutionPuzzles: true,
          enhancedNPCs: true,
          tacticalCombat: true,
          gmTools: true,
          structuredChallenges: true
        };
      }

      if (template === 'adventure-masterpiece' || template === 'full-adventure') {
        requestBody.adventureId = adventure.id;
      } else {
        requestBody.data = data;
      }

      console.log('[PDF-PREVIEW] Requesting preview:', requestBody);

      const response = await fetch('/api/export/pdf-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      toast.dismiss();

      if (!response.ok) {
        let errorMessage = `PDF preview failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Get HTML response and open in new window
      const htmlContent = await response.text();
      
      // Create new window with preview
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(htmlContent);
        previewWindow.document.close();
        
        // Pass parameters through URL for the professional PDF download
        const params = new URLSearchParams({
          template: template,
          adventureId: adventure.id,
          title: title || adventure.title,
          style: style || 'classic'
        });
        
        // Update the URL to include parameters
        previewWindow.history.replaceState(null, '', '?' + params.toString());
        
        toast.success('📖 Preview generated');
      } else {
        toast.error('Error: Could not open preview window. Please allow popups for this site.');
      }

      // Track preview event
      if (adventure) {
        trackAdventureExported(adventure.id, template + '-preview');
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error(error.message || 'Failed to generate preview');
    }
  };

  const handleExport = async (template: 'adventure-masterpiece' | 'full-adventure' | 'monster-card' | 'magic-item-card' | 'spell-card' | 'npc-portfolio', data?: any, title?: string, style?: 'classic' | 'gothic' | 'mystical' | 'arcane') => {
    if (!adventure) return;

    try {
      const loadingMessage = template === 'adventure-masterpiece' 
        ? `🎨 Forging your legendary ${style || 'classic'} masterpiece...` 
        : template === 'full-adventure' 
        ? 'Generating complete adventure PDF...' 
        : template === 'monster-card' 
        ? 'Generating monster card PDF...'
        : template === 'magic-item-card'
        ? 'Generating magic item card PDF...'
        : template === 'spell-card'
        ? 'Generating spell card PDF...'
        : 'Generating NPC portfolio PDF...';
      
      toast.loading(loadingMessage);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const requestBody: any = {
        template,
        title: title || adventure.title,
        style: style || 'classic'
      };

      // Add professional mode information for enhanced PDF formatting
      if (professionalEnhancement) {
        requestBody.professionalMode = true;
        requestBody.professionalGrade = professionalEnhancement.professionalGrade;
        requestBody.qualityMetrics = professionalEnhancement.qualityMetrics;
        requestBody.professionalFeatures = {
          multiSolutionPuzzles: true,
          enhancedNPCs: true,
          tacticalCombat: true,
          gmTools: true,
          structuredChallenges: true
        };
      }

      if (template === 'adventure-masterpiece' || template === 'full-adventure') {
        requestBody.adventureId = adventure.id;
      } else {
        requestBody.data = data;
      }

      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Authentication expired. Please log in again.');
          localStorage.removeItem('auth_token');
          return;
        }
        throw new Error(`PDF generation failed: ${response.status}`);
      }

      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or create default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${template}_${adventure.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
      
      // Track export event
      if (adventure) {
        trackAdventureExported(adventure.id, template);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export adventure');
    }
  };

  const handleShare = async () => {
    if (!adventure) return;

    try {
      const shareUrl = `${window.location.origin}/adventure/${adventure.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!adventure) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Adventure Not Found</h1>
            <p className="text-muted-foreground mb-6">The adventure you're looking for doesn't exist or you don't have access to it.</p>
            <Button asChild>
              <Link to="/library">Back to Library</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if adventure has content (either in .content or directly)
  const hasContent = adventure.content || adventure.title || adventure.summary;
  if (!hasContent) {
    console.error('❌ [ADVENTURE-VIEW] Adventure content is missing:', adventure);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Adventure Data Error</h1>
            <p className="text-muted-foreground mb-6">The adventure data is incomplete. Please try generating a new adventure.</p>
            <Button asChild>
              <Link to="/generate">Generate New Adventure</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fixed data structure mapping based on actual generated data
  const safeContent = {
    title: adventure.content?.title || adventure.title || 'Untitled Adventure',
    summary: adventure.content?.summary || adventure.content?.introduction || adventure.description || 'No summary available',
    backgroundStory: adventure.content?.backgroundStory || adventure.content?.introduction || 'No background story available',
    plotHooks: Array.isArray(adventure.content?.plotHooks) ? adventure.content.plotHooks : 
               Array.isArray(adventure.content?.hooks) ? adventure.content.hooks : [],
    scenes: Array.isArray(adventure.content?.scenes) ? adventure.content.scenes.map(scene => ({
      ...scene,
      title: scene?.title || 'Untitled Scene',
      description: scene?.description || 'No description available',
      objectives: Array.isArray(scene?.objectives) ? scene.objectives : [],
      challenges: Array.isArray(scene?.challenges) ? scene.challenges : []
    })) : [],
    npcs: Array.isArray(adventure.content?.npcs) ? adventure.content.npcs : [],
    monsters: Array.isArray(adventure.content?.monsters) ? adventure.content.monsters : 
              Array.isArray(adventure.content?.creatures) ? adventure.content.creatures : [],
    magicItems: Array.isArray(adventure.content?.magicItems) ? adventure.content.magicItems : 
                Array.isArray(adventure.content?.treasures) ? adventure.content.treasures : [],
    rewards: adventure.content?.rewards || {
      experience: 'Experience rewards based on encounters completed',
      treasure: 'Treasure rewards as described in scenes',
      other: 'Additional rewards at GM discretion'
    }
  };

  // Helper to get professional enhancement data from either location
  const professionalEnhancement = adventure.professionalEnhancement || adventure.content?.professionalEnhancement;

  // Debug logging (remove in production)
  // console.log('🔍 [ADVENTURE-VIEW] Adventure loaded successfully:', {
  //   title: safeContent.title,
  //   scenesCount: safeContent.scenes.length,
  //   npcsCount: safeContent.npcs.length
  // });

  // Debug render to identify the crash point
  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link to="/library">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Library
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {safeContent.title}
                  </h1>
                <p className="text-muted-foreground mt-1">
                  Created on {new Date(adventure.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {adventure.game_system === 'dnd5e' ? 'D&D 5e' : adventure.game_system}
              </Badge>
              <Button onClick={handleShare} variant="outline" size="sm">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Share'}
              </Button>
              
              {/* Professional Mode Help Button */}
              {professionalEnhancement && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-700 hover:bg-amber-50">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Help
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p className="font-semibold">Professional Mode Features:</p>
                        <ul className="text-xs space-y-1">
                          <li>• 🧩 Multi-solution puzzles with creative approaches</li>
                          <li>• 👥 Enhanced NPCs with dialogue examples</li>
                          <li>• ⚔️ Tactical combat with battlefield layouts</li>
                          <li>• 🛠️ Professional GM tools and references</li>
                          <li>• 📊 Quality metrics and scaling guides</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* PDF Preview - independent button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2 hover:bg-blue-50 border-blue-200 hover:border-blue-400">
                    <Eye className="h-4 w-4" />
                    Preview
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel className="text-center font-display text-blue-600">
                    🔍 PDF Preview (Free)
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Preview Options */}
                  <DropdownMenuItem 
                    onClick={() => handlePreviewPDF('adventure-masterpiece', undefined, undefined, 'classic')}
                    className="flex items-center gap-3 cursor-pointer hover:bg-amber-50"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Classic Masterpiece</div>
                      <div className="text-xs text-muted-foreground">Elegant preview</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handlePreviewPDF('adventure-masterpiece', undefined, undefined, 'gothic')}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-50"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                      <Skull className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Gothic Darkness</div>
                      <div className="text-xs text-muted-foreground">Dark preview</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handlePreviewPDF('adventure-masterpiece', undefined, undefined, 'mystical')}
                    className="flex items-center gap-3 cursor-pointer hover:bg-purple-50"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Mystical Wonder</div>
                      <div className="text-xs text-muted-foreground">Mystical preview</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Professional PDF Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="btn-primary-gradient">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
                    <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="text-center font-display">
                    🎨 Choose Your Masterpiece
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* ADVENTURE MASTERPIECE */}
                  <DropdownMenuLabel className="flex items-center gap-2 text-amber-600">
                    <Crown className="h-4 w-4" />
                    Adventure Masterpiece (NEW!)
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem 
                    onClick={() => handleExport('adventure-masterpiece', undefined, undefined, 'classic')}
                    className="flex items-center gap-3 cursor-pointer hover:bg-amber-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                      <Crown className="h-4 w-4 text-white" />
            </div>
                    <div className="flex-1">
                      <div className="font-medium">Classic Theme</div>
                      <div className="text-xs text-muted-foreground">Traditional RPG elegance</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleExport('adventure-masterpiece', undefined, undefined, 'gothic')}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <Skull className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Gothic Theme</div>
                      <div className="text-xs text-muted-foreground">Dark fantasy horror</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleExport('adventure-masterpiece', undefined, undefined, 'mystical')}
                    className="flex items-center gap-3 cursor-pointer hover:bg-purple-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Mystical Theme</div>
                      <div className="text-xs text-muted-foreground">Arcane mystery</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleExport('adventure-masterpiece', undefined, undefined, 'arcane')}
                    className="flex items-center gap-3 cursor-pointer hover:bg-violet-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Arcane Theme</div>
                      <div className="text-xs text-muted-foreground">Pure magical energy</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* LEGACY OPTIONS */}
                  <DropdownMenuLabel className="text-muted-foreground">
                    Classic Exports
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem 
                    onClick={() => handleExport('full-adventure')}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">Standard Adventure</div>
                      <div className="text-xs text-muted-foreground">Basic PDF export</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>



          {/* Summary */}
          <Card className="magical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Adventure Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{safeContent.summary}</p>
            </CardContent>
          </Card>

          {/* Professional Mode Enhanced Layout */}
          {professionalEnhancement && (
            <Card className="border-2 border-amber-500/30 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Crown className="h-6 w-6 text-amber-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This adventure was enhanced with professional-grade AI features</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-amber-800 dark:text-amber-200">Professional Enhanced Adventure</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="border-amber-500 text-amber-700">
                          Grade: {professionalEnhancement.professionalGrade}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Quality grade based on content analysis, mechanical accuracy, and editorial standards</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>
                  This adventure includes advanced professional features for superior gameplay experience.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="story" className="space-y-6">
            <TabsList className={`grid w-full ${professionalEnhancement ? 'grid-cols-6 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950' : 'grid-cols-4'}`}>
              <TabsTrigger value="story" className={professionalEnhancement ? "data-[state=active]:bg-amber-200 dark:data-[state=active]:bg-amber-800" : ""}>
                {professionalEnhancement ? '📖 Story' : 'Story'}
              </TabsTrigger>
              <TabsTrigger value="npcs" className={professionalEnhancement ? "data-[state=active]:bg-amber-200 dark:data-[state=active]:bg-amber-800" : ""}>
                {professionalEnhancement ? '👥 NPCs' : 'NPCs'}
              </TabsTrigger>
              <TabsTrigger value="monsters" className={professionalEnhancement ? "data-[state=active]:bg-amber-200 dark:data-[state=active]:bg-amber-800" : ""}>
                {professionalEnhancement ? '⚔️ Monsters' : 'Monsters'}
              </TabsTrigger>
              {professionalEnhancement && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="puzzles" className="data-[state=active]:bg-amber-200 dark:data-[state=active]:bg-amber-800">🧩 Puzzles</TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Multi-solution puzzles with creative problem-solving approaches</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TabsTrigger value="items" className={professionalEnhancement ? "data-[state=active]:bg-amber-200 dark:data-[state=active]:bg-amber-800" : ""}>
                {professionalEnhancement ? '💎 Items' : 'Items'}
              </TabsTrigger>
              {professionalEnhancement && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="tools" className="data-[state=active]:bg-amber-200 dark:data-[state=active]:bg-amber-800">🛠️ GM Tools</TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Professional GM tools including quick references and scaling guides</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </TabsList>

              {/* Story Tab - The Narrative Theater */}
            <TabsContent value="story" className="space-y-8">
              {/* Epic Title Section */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-accent/10 p-8 border-2 border-primary/20">
                {/* Atmospheric background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.2),transparent_50%)] pointer-events-none"></div>
                <div className="absolute top-4 right-4 opacity-20">
                  <div className="w-32 h-32 border border-primary/30 rounded-full animate-pulse"></div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      📜 Chronicle Entry
                    </Badge>
                  </div>
                  
                  <h2 className="text-3xl font-display font-bold text-foreground mb-3">
                    The Chronicle Begins...
                  </h2>
                  
                  <div className="prose prose-lg max-w-none">
                    <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-border shadow-inner">
                      <div className="relative">
                        {/* Decorative quote marks */}
                        <div className="absolute -top-2 -left-2 text-4xl text-primary/30 font-display">"</div>
                        <div className="absolute -bottom-4 -right-2 text-4xl text-primary/30 font-display">"</div>
                        
                        {/* Text with better formatting */}
                        <div className="pl-6 pr-6">
                          {safeContent.backgroundStory.split('. ').map((sentence, index) => (
                            <p key={index} className="font-sans text-foreground leading-relaxed text-base mb-3 last:mb-0">
                              <span className="inline-flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                                {sentence.trim()}{sentence.includes('.') ? '' : '.'}
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plot Hooks - The Theater Program */}
              <Card className="magical-shadow border-2 border-border overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                        <Map className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-display">Paths to Adventure</CardTitle>
                        <CardDescription className="text-sm">Choose your players' entry into the tale</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      🎭 {safeContent.plotHooks.length} Hooks
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {safeContent.plotHooks.map((hook, index) => (
                      <div key={index} className="group relative overflow-hidden rounded-lg border border-border bg-background/50 p-4 hover:bg-background transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                        {/* Decorative elements */}
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary/30 animate-pulse"></div>
                        
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {index + 1}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-display font-semibold text-foreground">Hook {index + 1}</h4>
                              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                            </div>
                            <p className="font-sans text-muted-foreground leading-relaxed">{hook}</p>
                          </div>
                        </div>
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Adventure Scenes - The Act Structure */}
              <Card className="magical-shadow border-2 border-border overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-display">The Unfolding Drama</CardTitle>
                      <CardDescription className="text-sm">Key scenes that shape the narrative</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {safeContent.scenes.map((scene, index) => (
                      <div key={index} className="relative group">
                        {/* Timeline connector */}
                        {index < safeContent.scenes.length - 1 && (
                          <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-primary/30 to-transparent"></div>
                        )}
                        
                        <div className="relative bg-background/80 backdrop-blur-sm rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300 group-hover:border-primary/30">
                          {/* Scene number and title */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-shrink-0 relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                                {index + 1}
                        </div>
                              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse"></div>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-xl font-display font-bold text-foreground mb-1">
                                {scene.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Act {index + 1}
                                </Badge>
                                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Scene description */}
                          <div className="mb-6">
                            <p className="font-sans text-foreground leading-relaxed">{scene.description}</p>
                          </div>
                          
                          {/* Objectives and Challenges */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="h-4 w-4 text-green-600" />
                                <h4 className="font-display font-semibold text-foreground">Objectives</h4>
                              </div>
                              <ul className="space-y-2">
                              {(scene.objectives || []).map((objective, objIndex) => (
                                  <li key={objIndex} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                                    <span className="font-sans text-sm text-muted-foreground">{objective}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                            
                            <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                              <div className="flex items-center gap-2 mb-3">
                                <Sword className="h-4 w-4 text-red-600" />
                                <h4 className="font-display font-semibold text-foreground">Challenges</h4>
                          </div>
                              <p className="font-sans text-sm text-muted-foreground leading-relaxed">{scene.challenges}</p>
                        </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NPCs Tab - The Theatrical Cast */}
            <TabsContent value="npcs" className="space-y-8">
              {/* Cast Introduction */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-background to-primary/10 p-8 border-2 border-accent/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none"></div>
                <div className="absolute top-4 left-4 opacity-20">
                  <div className="w-24 h-24 border-2 border-accent/30 rounded-full animate-pulse"></div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-accent/10 border border-accent/20">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      🎭 Cast & Crew
                    </Badge>
                  </div>
                  
                  <h2 className="text-3xl font-display font-bold text-foreground mb-3">
                    The Players Upon This Stage
                  </h2>
                  
                  <p className="font-sans text-muted-foreground leading-relaxed text-lg">
                    Meet the souls who breathe life into this tale, each with their own secrets, desires, and destinies intertwined.
                  </p>
                </div>
              </div>

              {/* The Cast */}
              <div className="grid gap-8">
                {safeContent.npcs.map((npc, index) => {
                  // Determine importance based on index (first NPCs are usually more important)
                  const isProtagonist = index === 0;
                  const isMajorCharacter = index <= 1;
                  
                  return (
                    <div key={index} className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:shadow-2xl ${
                      isProtagonist 
                        ? 'border-primary/40 bg-gradient-to-br from-primary/10 via-background to-accent/5' 
                        : isMajorCharacter 
                          ? 'border-accent/30 bg-gradient-to-br from-accent/5 via-background to-primary/5'
                          : 'border-border bg-background/80'
                    }`}>
                      
                      {/* Character Importance Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <Badge 
                          variant={isProtagonist ? "default" : isMajorCharacter ? "secondary" : "outline"}
                          className={`text-xs font-medium ${
                            isProtagonist 
                              ? 'bg-primary/90 text-primary-foreground animate-pulse' 
                              : isMajorCharacter 
                                ? 'bg-accent/90 text-accent-foreground'
                                : ''
                          }`}
                        >
                          {isProtagonist ? '⭐ Protagonist' : isMajorCharacter ? '🎭 Major Role' : '🎪 Supporting Cast'}
                        </Badge>
                      </div>

                      {/* Atmospheric Background Effects */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className={`absolute inset-0 opacity-30 ${
                          isProtagonist 
                            ? 'bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.2),transparent_60%)]'
                            : 'bg-[radial-gradient(circle_at_70%_30%,rgba(120,119,198,0.1),transparent_60%)]'
                        }`}></div>
                        
                        {/* Floating orbs */}
                        <div className={`absolute top-6 right-12 w-3 h-3 rounded-full animate-pulse ${
                          isProtagonist ? 'bg-primary/40' : 'bg-accent/30'
                        }`}></div>
                        <div className={`absolute bottom-8 left-8 w-2 h-2 rounded-full animate-pulse delay-1000 ${
                          isProtagonist ? 'bg-accent/40' : 'bg-primary/30'
                        }`}></div>
                      </div>
                      
                      <div className="relative p-8">
                        {/* Character Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-3 h-3 rounded-full ${
                                isProtagonist ? 'bg-primary animate-pulse' : 'bg-accent'
                              }`}></div>
                              <h3 className={`font-display font-bold ${
                                isProtagonist ? 'text-2xl' : 'text-xl'
                              } text-foreground`}>
                                {npc.name}
                              </h3>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-sm">
                                {npc.role}
                              </Badge>
                              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Character Details */}
              <div className="grid md:grid-cols-2 gap-6">
                          {/* Personality */}
                          <div className="bg-background/60 backdrop-blur-sm rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-colors duration-300">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 rounded-full bg-primary/10 border border-primary/20">
                                <Eye className="h-4 w-4 text-primary" />
                      </div>
                              <h4 className="font-display font-semibold text-foreground">Personality</h4>
                      </div>
                            <p className="font-sans text-muted-foreground leading-relaxed text-sm">
                              {npc.personality}
                            </p>
                          </div>
                          
                          {/* Motivation */}
                          <div className="bg-background/60 backdrop-blur-sm rounded-xl p-5 border border-border/50 hover:border-accent/30 transition-colors duration-300">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 rounded-full bg-accent/10 border border-accent/20">
                                <Target className="h-4 w-4 text-accent" />
                              </div>
                              <h4 className="font-display font-semibold text-foreground">Motivation</h4>
                            </div>
                            <p className="font-sans text-muted-foreground leading-relaxed text-sm">
                              {npc.motivation}
                            </p>
                          </div>
                        </div>

                        {/* Theatrical Flourish */}
                        <div className="mt-6 pt-4 border-t border-border/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
                              <span className="font-medium">Character Arc: {index + 1} of {safeContent.npcs.length}</span>
                            </div>
                            
                            {isProtagonist && (
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <div key={star} className="w-3 h-3 text-primary">
                                    ⭐
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Effect Overlay */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                        isProtagonist 
                          ? 'bg-gradient-to-br from-primary/5 via-transparent to-accent/5'
                          : 'bg-gradient-to-br from-accent/3 via-transparent to-primary/3'
                      }`}></div>
                    </div>
                  );
                })}
              </div>

              {/* Cast Credits */}
              <div className="text-center pt-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {safeContent.npcs.length} souls ready to bring this tale to life
                  </span>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-accent to-primary animate-pulse delay-500"></div>
                </div>
              </div>

              {/* Professional Mode: Enhanced NPC Features */}
              {professionalEnhancement && (
                <Card className="border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                      <span>Enhanced Character Development</span>
                      <Badge variant="outline" className="border-indigo-500 text-indigo-700">
                        Professional Feature
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Advanced character profiles with dialogue examples and relationship mapping
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Sample Dialogue Examples */}
                      <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <span className="text-indigo-600">💬</span>
                          Dialogue Examples - Gromar the Betrayed
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="p-3 bg-background/50 rounded border-l-4 border-indigo-500">
                            <div className="font-medium text-indigo-700 mb-1">When first encountered:</div>
                            <p className="italic text-muted-foreground">
                              "You dare enter my domain? The forge's curse runs deeper than you know... but perhaps you can succeed where I have failed."
                            </p>
                          </div>
                          <div className="p-3 bg-background/50 rounded border-l-4 border-green-500">
                            <div className="font-medium text-green-700 mb-1">If players show empathy:</div>
                            <p className="italic text-muted-foreground">
                              "Your words... they remind me of who I once was. Maybe redemption is still possible, even for one such as I."
                            </p>
                          </div>
                          <div className="p-3 bg-background/50 rounded border-l-4 border-red-500">
                            <div className="font-medium text-red-700 mb-1">If threatened:</div>
                            <p className="italic text-muted-foreground">
                              "Threaten me? I have endured centuries of torment! Your petty intimidation means nothing!"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Relationship Map */}
                      <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <span className="text-purple-600">🕸️</span>
                          Character Relationships
                        </h4>
                        <div className="flex items-center justify-center space-x-8">
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                              <span className="text-red-700 dark:text-red-300 text-xs font-bold">Gromar</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Cursed Smith</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-red-500 mb-1">Betrayed by</div>
                            <div className="w-16 h-px bg-red-300"></div>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center mb-2">
                              <span className="text-gray-700 dark:text-gray-300 text-xs font-bold">Guild</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Former Masters</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Monsters Tab - The Carnival Bestiary */}
            <TabsContent value="monsters" className="space-y-8">
              {/* Bestiary Introduction */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/20 via-background to-orange-500/10 p-8 border-2 border-red-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.2),transparent_50%)] pointer-events-none"></div>
                <div className="absolute top-4 right-4 opacity-20">
                  <div className="w-32 h-32 border-2 border-red-500/30 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute bottom-4 left-4 opacity-10">
                  <Sword className="h-16 w-16 text-red-500/40 animate-pulse delay-1000" />
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                      <Sword className="h-6 w-6 text-red-500" />
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1 border-red-500/30 text-red-600">
                      ⚔️ Carnival Denizens
                    </Badge>
                  </div>
                  
                  <h2 className="text-3xl font-display font-bold text-foreground mb-3">
                    The Bestiary of Shadows
                  </h2>
                  
                  <p className="font-sans text-muted-foreground leading-relaxed text-lg">
                    Creatures born from nightmares and twisted magic, each one a tactical challenge for the cunning Game Master.
                  </p>
                </div>
              </div>

              {/* The Creatures */}
              <div className="space-y-12">
                {safeContent.monsters.map((monster, index) => (
                  <div key={index} className="group relative">
                    {/* Creature Container */}
                    <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 via-background to-orange-500/5">
                      
                      {/* Atmospheric Background */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(239,68,68,0.1),transparent_60%)] pointer-events-none"></div>
                      
                                            {/* Clean Single Column Layout - Optimized for All Devices */}
                      <div className="flex flex-col gap-8 p-6">
                        
                        {/* Creature Image - Centered & Majestic */}
                        <div className="flex justify-center">
                          {adventure.image_urls && adventure.image_urls[index] ? (
                            <div className="relative group/image">
                              <div className="magical-image floating-image glow-border">
                        <img 
                          src={adventure.image_urls[index]} 
                          alt={`${monster.name} artwork`}
                                  className="w-full max-w-md lg:max-w-lg xl:max-w-xl h-64 lg:h-80 xl:h-96 object-cover mx-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                                {/* Magical Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                
                                {/* Creature Name Overlay - Enhanced for Desktop */}
                                <div className="absolute bottom-4 left-4 right-4">
                                  <div className="xl:bg-transparent bg-black/80 xl:backdrop-blur-none backdrop-blur-sm rounded-lg xl:rounded-none p-3 xl:p-0">
                                    <h3 className="text-lg xl:text-3xl font-display font-bold text-white drop-shadow-lg">
                                      {monster.name}
                                    </h3>
                                    <p className="text-white/90 xl:text-white/80 font-sans text-xs xl:text-base">
                                      {monster.size} {monster.type}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* AI Generated Badge */}
                                <div className="absolute top-4 right-4">
                                  <Badge className="text-xs xl:text-sm bg-black/80 xl:bg-black/70 text-white border-white/30 xl:border-white/20">
                                    ✨ AI Generated
                          </Badge>
                                </div>
                              </div>
                              
                              {/* Creature Danger Level - Majestic */}
                              <div className="absolute -top-3 -right-3 z-10">
                                <div className="w-12 h-12 xl:w-20 xl:h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center border-2 xl:border-4 border-background shadow-xl">
                                  <span className="text-white font-bold text-xs xl:text-base">CR {monster.challengeRating}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-64 xl:h-96 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border-2 border-dashed border-red-500/30 flex items-center justify-center">
                              <div className="text-center">
                                <Sword className="h-12 w-12 xl:h-20 xl:w-20 mx-auto mb-4 text-red-500/70" />
                                <p className="text-sm xl:text-lg font-medium text-muted-foreground">Creature Manifestation</p>
                                <p className="text-xs xl:text-base text-muted-foreground/70">Awaiting dark summoning...</p>
                        </div>
                      </div>
                    )}
                        </div>
                        
                        {/* StatBlock - Full Width & Breathable */}
                        <div className="w-full">
                          <div className="bg-background/90 backdrop-blur-sm rounded-xl border border-red-500/20 p-6 xl:p-8 max-w-6xl mx-auto">
                            <StatBlock monster={monster} className="w-full" />
                          </div>
                        </div>
                      </div>
                      
                                            {/* Bottom Action Bar - Mobile Responsive */}
                      <div className="border-t border-red-500/20 bg-gradient-to-r from-red-500/5 to-orange-500/5 p-3 xl:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2 xl:gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-xs xl:text-sm font-medium text-muted-foreground">
                              Creature {index + 1} of {safeContent.monsters.length}
                            </span>
                            <Badge variant="outline" className="text-xs border-red-500/30 text-red-600 hidden sm:inline-flex">
                              Carnival Beast
                            </Badge>
                          </div>
                          
                      <Button 
                        onClick={() => handleExport('monster-card', monster, monster.name)}
                        variant="outline" 
                        size="sm"
                            className="gap-2 hover:bg-red-500/10 border-red-500/30 hover:border-red-500/50 transition-all duration-300 w-full sm:w-auto"
                      >
                            <Download className="h-3 w-3 xl:h-4 xl:w-4" />
                            <span className="hidden sm:inline">Export Beast Card</span>
                            <span className="sm:hidden">Export</span>
                      </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                
              {/* Empty State */}
                {safeContent.monsters.length === 0 && (
                <div className="text-center py-16">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-6 border-2 border-red-500/20">
                      <Sword className="h-12 w-12 text-red-500/70" />
                    </div>
                    <div className="absolute -inset-4 rounded-full border border-red-500/20 animate-pulse"></div>
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">No Beasts in This Carnival</h3>
                  <p className="text-muted-foreground">The shadows remain empty... for now.</p>
                </div>
              )}

              {/* Bestiary Summary */}
              <div className="text-center pt-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full px-6 py-3 border border-red-500/20">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {safeContent.monsters.length > 0 
                      ? `${safeContent.monsters.length} creatures await your tactical command`
                      : 'The carnival rests peacefully tonight'
                    }
                  </span>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse delay-500"></div>
                </div>
              </div>

              {/* Professional Mode: Tactical Combat Features */}
              {professionalEnhancement && (
                <Card className="border-2 border-red-500/30 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20">
                        <Sword className="h-6 w-6 text-red-600" />
                      </div>
                      <span>Tactical Combat Features</span>
                      <Badge variant="outline" className="border-red-500 text-red-700">
                        Professional Feature
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Advanced combat mechanics with battlefield tactics and environmental features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Battlefield Layout */}
                      <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Map className="h-5 w-5 text-red-500" />
                          Battlefield Layout - The Cursed Forge
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-background/50 rounded border-l-4 border-blue-500">
                              <div className="font-medium text-blue-700 mb-1">🏔️ Terrain Features</div>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Molten channels (difficult terrain)</li>
                                <li>• Anvil platforms (high ground, +2 AC)</li>
                                <li>• Steam vents (obscured vision)</li>
                              </ul>
                            </div>
                            <div className="p-3 bg-background/50 rounded border-l-4 border-green-500">
                              <div className="font-medium text-green-700 mb-1">🛡️ Cover Options</div>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Stone pillars (full cover)</li>
                                <li>• Broken machinery (half cover)</li>
                                <li>• Forge equipment (3/4 cover)</li>
                              </ul>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 bg-background/50 rounded border-l-4 border-yellow-500">
                              <div className="font-medium text-yellow-700 mb-1">⚡ Environmental Hazards</div>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Lava bursts (2d6 fire, DC 15 Dex save)</li>
                                <li>• Toxic fumes (1d4 poison/round)</li>
                                <li>• Unstable floor (DC 12 Acrobatics)</li>
                              </ul>
                            </div>
                            <div className="p-3 bg-background/50 rounded border-l-4 border-purple-500">
                              <div className="font-medium text-purple-700 mb-1">🎯 Combat Objectives</div>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Destroy curse anchors (3 total)</li>
                                <li>• Protect ritual circle</li>
                                <li>• Survive 5 rounds until purification</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Structured Skill Challenge */}
                      <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-500" />
                          Structured Skill Challenge: Forge Purification
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-background/50 rounded">
                            <div>
                              <div className="font-medium text-purple-700">Challenge Format</div>
                              <div className="text-sm text-muted-foreground">6 successes before 3 failures</div>
                            </div>
                            <Badge variant="outline" className="border-purple-500 text-purple-700">
                              Complexity 3
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-green-700 mb-2">✅ Primary Skills (DC 15)</h5>
                              <ul className="text-sm space-y-1">
                                <li>• <strong>Arcana:</strong> Analyze curse patterns</li>
                                <li>• <strong>Religion:</strong> Perform purification ritual</li>
                                <li>• <strong>Investigation:</strong> Find curse anchors</li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-blue-700 mb-2">🔄 Secondary Skills (DC 12)</h5>
                              <ul className="text-sm space-y-1">
                                <li>• <strong>Athletics:</strong> Navigate hazardous terrain</li>
                                <li>• <strong>Perception:</strong> Spot environmental dangers</li>
                                <li>• <strong>Medicine:</strong> Treat curse effects</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                              <div className="font-medium text-green-700 mb-1">🎉 Success Outcome</div>
                              <p className="text-xs text-green-600">
                                The forge is purified, Gromar is freed from his curse, and the party gains his eternal gratitude plus a legendary weapon.
                              </p>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                              <div className="font-medium text-red-700 mb-1">💥 Failure Outcome</div>
                              <p className="text-xs text-red-600">
                                The curse spreads, Gromar becomes hostile, and the party must fight him while the forge collapses around them.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Items Tab - The Magical Arsenal */}
            <TabsContent value="items" className="space-y-8">
              {/* Arsenal Introduction */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-background to-purple-500/10 p-8 border-2 border-amber-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.2),transparent_50%)] pointer-events-none"></div>
                <div className="absolute top-4 right-4 opacity-20">
                  <div className="w-32 h-32 border-2 border-amber-500/30 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute bottom-4 left-4 opacity-10">
                  <div className="w-20 h-20 border border-purple-500/40 rounded-lg rotate-45 animate-pulse delay-1000"></div>
                </div>
                
                        <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Gem className="h-6 w-6 text-amber-500" />
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1 border-amber-500/30 text-amber-600">
                      💎 Treasures & Relics
                    </Badge>
                  </div>
                  
                  <h2 className="text-3xl font-display font-bold text-foreground mb-3">
                    The Vault of Wonders
                  </h2>
                  
                  <p className="font-sans text-muted-foreground leading-relaxed text-lg">
                    Behold the mystical artifacts and powerful relics waiting to be discovered, each one holding secrets of ancient magic and untold power.
                  </p>
                </div>
              </div>

              {/* The Arsenal Collection */}
              <div className="grid gap-8">
                {safeContent.magicItems.map((item, index) => {
                  // Determine rarity colors and effects
                  const getRarityConfig = (rarity: string) => {
                    const rarityLower = (rarity || 'common').toLowerCase();
                    if (rarityLower.includes('legendary')) return {
                      borderColor: 'border-orange-500/40',
                      bgGradient: 'from-orange-500/15 via-background to-amber-500/10',
                      glowColor: 'bg-orange-500/40',
                      iconColor: 'text-orange-500',
                      badge: '🌟 Legendary',
                      badgeClass: 'bg-orange-500/20 text-orange-700 border-orange-500/30'
                    };
                    if (rarityLower.includes('very rare')) return {
                      borderColor: 'border-purple-500/40',
                      bgGradient: 'from-purple-500/15 via-background to-indigo-500/10',
                      glowColor: 'bg-purple-500/40',
                      iconColor: 'text-purple-500',
                      badge: '💜 Very Rare',
                      badgeClass: 'bg-purple-500/20 text-purple-700 border-purple-500/30'
                    };
                    if (rarityLower.includes('rare')) return {
                      borderColor: 'border-blue-500/40',
                      bgGradient: 'from-blue-500/15 via-background to-cyan-500/10',
                      glowColor: 'bg-blue-500/40',
                      iconColor: 'text-blue-500',
                      badge: '💙 Rare',
                      badgeClass: 'bg-blue-500/20 text-blue-700 border-blue-500/30'
                    };
                    if (rarityLower.includes('uncommon')) return {
                      borderColor: 'border-green-500/40',
                      bgGradient: 'from-green-500/15 via-background to-emerald-500/10',
                      glowColor: 'bg-green-500/40',
                      iconColor: 'text-green-500',
                      badge: '💚 Uncommon',
                      badgeClass: 'bg-green-500/20 text-green-700 border-green-500/30'
                    };
                    return {
                      borderColor: 'border-gray-500/40',
                      bgGradient: 'from-gray-500/15 via-background to-slate-500/10',
                      glowColor: 'bg-gray-500/40',
                      iconColor: 'text-gray-500',
                      badge: '🤍 Common',
                      badgeClass: 'bg-gray-500/20 text-gray-700 border-gray-500/30'
                    };
                  };

                  const rarityConfig = getRarityConfig(item.rarity || 'common');
                  
                  return (
                    <div key={index} className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:shadow-2xl bg-gradient-to-br ${rarityConfig.borderColor} ${rarityConfig.bgGradient}`}>
                      
                      {/* Rarity Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className={`text-xs font-medium animate-pulse ${rarityConfig.badgeClass}`}>
                          {rarityConfig.badge}
                        </Badge>
                      </div>

                      {/* Magical Background Effects */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_40%_60%,rgba(245,158,11,0.1),transparent_60%)]"></div>
                        
                        {/* Floating magical orbs */}
                        <div className={`absolute top-6 right-12 w-3 h-3 rounded-full animate-pulse ${rarityConfig.glowColor}`}></div>
                        <div className={`absolute bottom-8 left-8 w-2 h-2 rounded-full animate-pulse delay-700 ${rarityConfig.glowColor}`}></div>
                        <div className={`absolute top-20 left-12 w-1.5 h-1.5 rounded-full animate-pulse delay-1000 ${rarityConfig.glowColor}`}></div>
                      </div>
                      
                      <div className="relative p-8">
                        {/* Item Header */}
                        <div className="flex items-start gap-6">
                          {/* Item Image */}
                          <div className="flex-shrink-0 w-48">
                            {adventure.image_urls && adventure.image_urls[safeContent.monsters.length + index] ? (
                              <div className="relative group/item">
                                <div className={`magical-image floating-image glow-border`}>
                          <img 
                            src={adventure.image_urls[safeContent.monsters.length + index]} 
                            alt={`${item.name} artwork`}
                                    className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                                  {/* Magical Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                  
                                  {/* Rarity Glow Effect */}
                                  <div className={`absolute inset-0 opacity-20 bg-gradient-radial from-center ${
                                    (item.rarity || 'common').toLowerCase().includes('legendary') ? 'from-orange-400/40' :
                                    (item.rarity || 'common').toLowerCase().includes('very rare') ? 'from-purple-400/40' :
                                    (item.rarity || 'common').toLowerCase().includes('rare') ? 'from-blue-400/40' :
                                    (item.rarity || 'common').toLowerCase().includes('uncommon') ? 'from-green-400/40' :
                                    'from-gray-400/40'
                                  } to-transparent`}></div>
                                  
                                  {/* Item Name Overlay */}
                                  <div className="absolute bottom-2 left-2 right-2">
                                    <div className="text-white drop-shadow-lg">
                                      <p className="font-display font-bold text-sm">
                                        {item.name}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* AI Generated Badge */}
                          <div className="absolute top-2 right-2">
                                    <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                                      ✨ AI Generated
                            </Badge>
                                  </div>
                                </div>
                                
                                {/* Floating Rarity Indicator */}
                                <div className="absolute -top-2 -left-2 z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-background shadow-lg ${rarityConfig.bgGradient?.replace('from-', 'bg-').replace('/15', '').replace('/10', '').split(' ')[0] || 'bg-gray-500'}`}>
                                    <span className="text-xs">
                                      {(item.rarity || 'common').toLowerCase().includes('legendary') ? '🌟' :
                                       (item.rarity || 'common').toLowerCase().includes('very rare') ? '💜' :
                                       (item.rarity || 'common').toLowerCase().includes('rare') ? '💙' :
                                       (item.rarity || 'common').toLowerCase().includes('uncommon') ? '💚' : '🤍'}
                                    </span>
                                  </div>
                          </div>
                        </div>
                      ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <div className="text-center">
                                  <Gem className={`h-12 w-12 mx-auto mb-3 ${rarityConfig.iconColor}`} />
                                  <p className="text-xs text-muted-foreground/70 font-medium">Mystical Artifact</p>
                                  <p className="text-xs text-muted-foreground/50">Awaiting manifestation...</p>
                          </div>
                        </div>
                      )}
                          </div>
                          
                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-3 h-3 rounded-full animate-pulse ${rarityConfig.glowColor}`}></div>
                              <h3 className="text-2xl font-display font-bold text-foreground">
                                {item.name}
                              </h3>
                      </div>
                            
                            <div className="flex items-center gap-2 mb-6">
                              <Badge variant="outline" className={`text-sm ${rarityConfig.badgeClass}`}>
                                {item.rarity || 'Common'}
                              </Badge>
                              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                      </div>
                      
                            {/* Item Properties */}
                            <div className="space-y-4">
                              {/* Description */}
                              <div className="bg-background/60 backdrop-blur-sm rounded-xl p-5 border border-border/50 hover:border-amber-500/30 transition-colors duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                    <Eye className="h-4 w-4 text-amber-500" />
                                  </div>
                                  <h4 className="font-display font-semibold text-foreground">Mystical Essence</h4>
                                </div>
                                <p className="font-sans text-muted-foreground leading-relaxed text-sm">
                                  {item.description}
                                </p>
                              </div>
                              
                              {/* Properties */}
                              <div className="bg-background/60 backdrop-blur-sm rounded-xl p-5 border border-border/50 hover:border-purple-500/30 transition-colors duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                                    <Zap className="h-4 w-4 text-purple-500" />
                                  </div>
                                  <h4 className="font-display font-semibold text-foreground">Arcane Properties</h4>
                                </div>
                                <p className="font-sans text-muted-foreground leading-relaxed text-sm">
                                  {item.properties}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Item Footer */}
                        <div className="mt-8 pt-6 border-t border-border/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 animate-pulse"></div>
                              <span className="font-medium">Relic {index + 1} of {safeContent.magicItems.length}</span>
                            </div>
                            
                            {/* Export Button */}
                        <Button 
                          onClick={() => handleExport('magic-item-card', item, item.name)}
                          variant="outline" 
                          size="sm"
                              className="gap-2 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-purple-500/10 transition-all duration-300"
                        >
                          <Download className="h-4 w-4" />
                              Export Relic Card
                        </Button>
                      </div>
                        </div>
                      </div>
                      
                      {/* Magical Hover Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5"></div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {safeContent.magicItems.length === 0 && (
                <div className="text-center py-16">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center mb-6 border-2 border-amber-500/20">
                      <Gem className="h-12 w-12 text-amber-500/70" />
                    </div>
                    <div className="absolute -inset-4 rounded-full border border-amber-500/20 animate-pulse"></div>
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">No Magical Items</h3>
                  <p className="text-muted-foreground">This adventure doesn't include any magical treasures... yet.</p>
                </div>
              )}

              {/* Arsenal Summary */}
              <div className="text-center pt-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-full px-6 py-3 border border-amber-500/20">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {safeContent.magicItems.length > 0 
                      ? `${safeContent.magicItems.length} mystical artifacts await discovery`
                      : 'The vault stands empty, awaiting future treasures'
                    }
                  </span>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-amber-500 animate-pulse delay-500"></div>
                </div>
              </div>
            </TabsContent>

            {/* Professional Mode Exclusive Tabs */}
            {professionalEnhancement && (
              <>
                {/* Puzzles Tab - Multi-Solution Challenges */}
                <TabsContent value="puzzles" className="space-y-8">
                  <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                          <Puzzle className="h-6 w-6 text-purple-600" />
                        </div>
                        <span>Multi-Solution Puzzles</span>
                        <Badge variant="outline" className="border-purple-500 text-purple-700">
                          Professional Feature
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Advanced puzzles with multiple solution paths, designed for creative problem-solving
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Sample Multi-Solution Puzzle */}
                        <div className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            The Forge's Ancient Lock
                          </h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            The cursed forge is sealed by an ancient mechanism that requires both magical and mechanical expertise to unlock.
                          </p>
                          
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="border rounded p-4 bg-background/50">
                              <h5 className="font-medium text-green-700 mb-2">🔧 Mechanical Solution</h5>
                              <p className="text-xs text-muted-foreground">
                                Thieves' Tools + Investigation DC 15. Requires understanding of dwarven engineering.
                              </p>
                            </div>
                            <div className="border rounded p-4 bg-background/50">
                              <h5 className="font-medium text-blue-700 mb-2">✨ Magical Solution</h5>
                              <p className="text-xs text-muted-foreground">
                                Arcana DC 13 + Dispel Magic. Removes the protective enchantments first.
                              </p>
                            </div>
                            <div className="border rounded p-4 bg-background/50">
                              <h5 className="font-medium text-purple-700 mb-2">🗣️ Social Solution</h5>
                              <p className="text-xs text-muted-foreground">
                                Speak with the forge spirit using History DC 12 + Persuasion DC 14.
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                              <strong>Failure State:</strong> Failed attempts trigger a minor curse (disadvantage on next ability check) but don't prevent progress.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* GM Tools Tab - Professional Suite */}
                <TabsContent value="tools" className="space-y-8">
                  <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                          <Settings className="h-6 w-6 text-emerald-600" />
                        </div>
                        <span>Professional GM Tools</span>
                        <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                          Enhanced Suite
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Advanced tools and references for professional-grade game mastering
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Quick Reference */}
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            Quick Reference
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between p-2 bg-background/50 rounded">
                              <span>Easy DC:</span>
                              <span className="font-mono">10</span>
                            </div>
                            <div className="flex justify-between p-2 bg-background/50 rounded">
                              <span>Medium DC:</span>
                              <span className="font-mono">15</span>
                            </div>
                            <div className="flex justify-between p-2 bg-background/50 rounded">
                              <span>Hard DC:</span>
                              <span className="font-mono">20</span>
                            </div>
                            <div className="flex justify-between p-2 bg-background/50 rounded">
                              <span>Very Hard DC:</span>
                              <span className="font-mono">25</span>
                            </div>
                          </div>
                        </div>

                        {/* Scaling Guide */}
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Scaling Guide
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="p-3 bg-background/50 rounded">
                              <div className="font-medium mb-1">Party Size Adjustments:</div>
                              <div className="text-xs text-muted-foreground">
                                • 3 players: Reduce enemy HP by 25%<br/>
                                • 5 players: Increase enemy HP by 25%<br/>
                                • 6 players: Add 1 additional enemy
                              </div>
                            </div>
                            <div className="p-3 bg-background/50 rounded">
                              <div className="font-medium mb-1">Level Adjustments:</div>
                              <div className="text-xs text-muted-foreground">
                                • Level 3-4: Use as written<br/>
                                • Level 5-6: +2 to all DCs, +10 HP to bosses<br/>
                                • Level 7+: +4 to all DCs, +20 HP to bosses
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scene Flow Diagram */}
                      <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <GitBranch className="h-5 w-5 text-indigo-500" />
                          Scene Flow Diagram
                        </h4>
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                              <span className="text-green-700 dark:text-green-300 font-bold">1</span>
                            </div>
                            <div className="text-xs">Arrival</div>
                          </div>
                          <div className="flex-1 h-px bg-border mx-2"></div>
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-2">
                              <span className="text-yellow-700 dark:text-yellow-300 font-bold">2</span>
                            </div>
                            <div className="text-xs">Investigation</div>
                          </div>
                          <div className="flex-1 h-px bg-border mx-2"></div>
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                              <span className="text-red-700 dark:text-red-300 font-bold">3</span>
                            </div>
                            <div className="text-xs">Confrontation</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>

          {/* Rewards */}
          <Card className="magical-shadow">
            <CardHeader>
              <CardTitle>Adventure Rewards</CardTitle>
              <CardDescription>What the party can expect to gain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Experience</h4>
                  <p className="text-sm text-muted-foreground">{safeContent.rewards.experience}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Treasure</h4>
                  <p className="text-sm text-muted-foreground">{safeContent.rewards.treasure}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Other Rewards</h4>
                  <p className="text-sm text-muted-foreground">{safeContent.rewards.other}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Images */}
          <Card className="magical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Generated Artwork</span>
              </CardTitle>
              <CardDescription>
                AI-generated illustrations for this adventure
                                  {adventure.image_generation_cost && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      • Cost: ${Number(adventure.image_generation_cost).toFixed(4)}
                    </span>
                  )}
                {adventure.regenerations_used && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    • Regenerations: {adventure.regenerations_used}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adventure.image_urls && adventure.image_urls.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(adventure.image_urls || []).map((imageUrl, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border relative">
                      <img 
                        src={imageUrl} 
                        alt={`Adventure artwork ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          AI Generated
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-full flex items-center justify-center">
                    <Eye className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">AI Artwork Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Our advanced AI image generation system is being configured to create stunning artwork for your adventures.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Sword className="h-4 w-4" />
                      <span>Monster Art</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Gem className="h-4 w-4" />
                      <span>Magic Items</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>NPC Portraits</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
  } catch (renderError) {
    console.error('❌ [ADVENTURE-VIEW] Render error:', renderError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Adventure Display Error</h1>
            <p className="text-muted-foreground mb-6">There was an error displaying this adventure.</p>
            <Button asChild>
              <Link to="/library">Back to Library</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
} 