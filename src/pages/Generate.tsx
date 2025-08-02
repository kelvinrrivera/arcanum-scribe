import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Wand2, 
  Sparkles, 
  Crown, 
  Zap, 
  Loader2,
  BookOpen,
  Image,
  FileText
} from 'lucide-react';

const generateSchema = z.object({
  prompt: z.string().min(10, 'Please provide a more detailed prompt (at least 10 characters)'),
  gameSystem: z.string(),
});

type GenerateForm = z.infer<typeof generateSchema>;

export default function Generate() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const form = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      gameSystem: 'dnd5e',
    },
  });

  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  const onSubmit = async (data: GenerateForm) => {
    if (!profile || profile.credits_remaining <= 0) {
      toast.error('Insufficient credits. Please upgrade your plan.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Initializing magical forge...');

    try {
      // Simulate progress steps
      const steps = [
        'Consulting the ancient scrolls...',
        'Weaving narrative threads...',
        'Summoning creatures and NPCs...',
        'Crafting magical items...',
        'Generating mystical artwork...',
        'Binding the adventure together...',
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          setProgress((stepIndex + 1) * (80 / steps.length));
          stepIndex++;
        }
      }, 2000);

      const { data: result, error } = await supabase.functions.invoke('generate-adventure', {
        body: { 
          prompt: data.prompt,
          gameSystem: data.gameSystem
        },
      });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      setProgress(100);
      setCurrentStep('Adventure complete!');

      toast.success('Your adventure has been forged by ancient magic!');
      
      // Navigate to the adventure view
      setTimeout(() => {
        navigate(`/adventure/${result.adventure.id}`);
      }, 1000);

    } catch (error: any) {
      setProgress(0);
      setCurrentStep('');
      toast.error(error.message || 'Failed to generate adventure');
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    "A haunted lighthouse where the keeper's ghost warns ships of a greater danger lurking beneath the waves",
    "A traveling carnival that appears only during the new moon, hiding a dark secret about the townsfolk who never return",
    "An ancient library where books come alive at night and the party must solve a riddle to prevent knowledge from being lost forever",
    "A dragon's hoard that's actually a prison, and the 'treasure' are the souls of heroes who tried to defeat it",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Adventure Generator
            </h1>
            <p className="text-xl text-muted-foreground">
              Transform your imagination into legendary adventures
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Crown className="h-3 w-3 mr-1" />
                {profile?.subscription_tier || 'Free'} Plan
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Zap className="h-3 w-3 mr-1" />
                {profile?.credits_remaining || 0} Credits Remaining
              </Badge>
            </div>
          </div>

          {isGenerating ? (
            // Generation Progress
            <Card className="magical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="h-5 w-5 animate-pulse" />
                  <span>Forging Your Adventure</span>
                </CardTitle>
                <CardDescription>
                  The magical energies are at work. This may take a few moments...
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
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Narrative</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                      <Image className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Artwork</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Layout</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Generation Form
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="magical-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>Describe Your Adventure</span>
                    </CardTitle>
                    <CardDescription>
                      Tell us about the adventure you want to create. Be as detailed or as brief as you like!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="gameSystem">Game System</Label>
                        <Select
                          defaultValue="dnd5e"
                          onValueChange={(value) => form.setValue('gameSystem', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select game system" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dnd5e">D&D 5th Edition</SelectItem>
                            <SelectItem value="pathfinder2e" disabled>Pathfinder 2e (Coming Soon)</SelectItem>
                            <SelectItem value="other" disabled>Other Systems (Coming Soon)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prompt">Adventure Prompt</Label>
                        <Textarea
                          id="prompt"
                          placeholder="Describe your adventure idea here... For example: 'A mysterious fog has engulfed the village, and strange creatures emerge at night. The party must investigate the source and save the townspeople.'"
                          rows={6}
                          {...form.register('prompt')}
                          className="resize-none"
                        />
                        {form.formState.errors.prompt && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.prompt.message}
                          </p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full gradient-primary text-primary-foreground magical-glow text-lg py-6"
                        disabled={!profile || profile.credits_remaining <= 0}
                      >
                        {profile && profile.credits_remaining > 0 ? (
                          <>
                            <Wand2 className="mr-2 h-5 w-5" />
                            Generate Adventure (1 Credit)
                          </>
                        ) : (
                          <>
                            <Crown className="mr-2 h-5 w-5" />
                            Upgrade to Generate
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Example Prompts */}
                <Card className="magical-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Need Inspiration?</CardTitle>
                    <CardDescription>
                      Try one of these example prompts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {examplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => form.setValue('prompt', prompt)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* What You'll Get */}
                <Card className="magical-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">What You'll Get</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm">Complete adventure narrative</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm">NPCs with personalities</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm">Monster stat blocks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm">Magic items & rewards</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm">AI-generated artwork</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm">Exportable PDF format</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}