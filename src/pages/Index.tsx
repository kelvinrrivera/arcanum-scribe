import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Wand2, 
  Scroll, 
  Image, 
  Download, 
  Library, 
  ArrowRight,
  Zap,
  Crown,
  BookOpen,
  Flame,
  Shield,
  Sword,
  Eye,
  Compass,
  Feather,
  Gem,
  Moon,
  Sun
} from 'lucide-react';

const Index = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/10 relative overflow-hidden">
      {/* Magical Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-accent/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-primary/20 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/30 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-primary/25 rounded-full animate-pulse delay-1500"></div>
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {user ? (
          // Authenticated User Dashboard - Epic GM Experience
          <div className="space-y-12">
            {/* Epic Welcome Section */}
            <div className="text-center space-y-6 py-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full"></div>
                <h1 className="relative text-5xl xl:text-6xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                  ⚡ Welcome back, Master {profile?.display_name || 'Storyteller'} ⚡
                </h1>
              </div>
              
              <div className="max-w-3xl mx-auto space-y-6">
                <p className="text-xl xl:text-2xl text-muted-foreground font-medium">
                  Your realm of infinite possibilities awaits. The threads of destiny are yours to weave.
                </p>
                
                {/* Epic Rank Badge */}
                <div className="flex justify-center">
                  <div className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-sm"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40">
                        <Crown className="h-5 w-5 text-primary magical-pulse" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          Apprentice Scribe
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Level 1 • Ready for Adventure
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-primary" />
                    <span>Forge Legends</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <Crown className="h-4 w-4 text-accent" />
                    <span>Command Stories</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Create Magic</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Epic Action Cards - The GM's Arsenal */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Primary Action - Adventure Forge */}
              <Card className="lg:col-span-2 relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/5 hover:border-primary/50 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full"></div>
                        <div className="relative p-4 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                          <Wand2 className="h-8 w-8 text-primary-foreground" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          ⚔️ Adventure Forge
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          Weave epic tales from the threads of imagination
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>Complete Adventures</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4 text-accent" />
                      <span>Epic Encounters</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sword className="h-4 w-4 text-primary" />
                      <span>Legendary NPCs</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Gem className="h-4 w-4 text-accent" />
                      <span>Mystical Items</span>
                    </div>
                  </div>
                  <Button asChild size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Link to="/generate" className="flex items-center justify-center gap-2">
                      <Flame className="h-5 w-5" />
                      Begin Your Legend
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Secondary Actions */}
              <div className="space-y-6">
                {/* Library Card */}
                <Card className="relative overflow-hidden border border-border bg-gradient-to-br from-background to-accent/5 hover:border-accent/30 transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20">
                        <Library className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">📚 Grimoire</CardTitle>
                        <CardDescription className="text-sm">Your collection of tales</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full border-accent/30 hover:bg-accent/10 group-hover:scale-105 transition-all">
                      <Link to="/library">
                        <Eye className="h-4 w-4 mr-2" />
                        Explore Library
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Upgrade Card */}
                <Card className="relative overflow-hidden border border-border bg-gradient-to-br from-background to-primary/5 hover:border-primary/30 transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                        <Crown className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">👑 Ascension</CardTitle>
                        <CardDescription className="text-sm">Unlock greater power</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/10 group-hover:scale-105 transition-all">
                      <Link to="/pricing">
                        <Zap className="h-4 w-4 mr-2" />
                        View Powers
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Chronicles of Creation - Recent Adventures */}
            <section className="space-y-8">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <h2 className="text-3xl xl:text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    📜 Chronicles of Creation
                  </h2>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Your legendary tales await their next chapter. Each story a testament to your mastery.
                </p>
              </div>
              
              {/* Epic Empty State */}
              <Card className="relative overflow-hidden border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50"></div>
                <CardContent className="relative z-10 py-16 text-center space-y-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                    <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                      <Scroll className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-w-md mx-auto">
                    <h3 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      The Blank Scroll Awaits
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      Your first legend is but a thought away. Let the magic flow through your words and watch worlds come alive.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
                      <Link to="/generate" className="flex items-center gap-2">
                        <Feather className="h-5 w-5" />
                        Inscribe Your First Tale
                        <Sparkles className="h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-primary/30 hover:bg-primary/10">
                      <Link to="/gallery" className="flex items-center gap-2">
                        <Compass className="h-5 w-5" />
                        Explore Others' Legends
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span>Infinite Possibilities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-500"></div>
                      <span>Boundless Creativity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-1000"></div>
                      <span>Epic Adventures</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Epic Statistics & Achievements */}
            <section className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl xl:text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ⚡ Your Legendary Progress ⚡
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Every great Game Master's journey is marked by epic milestones. Behold your growing mastery.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                  <CardContent className="relative z-10 py-8 space-y-4">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full"></div>
                      <div className="relative p-4 rounded-full bg-gradient-to-br from-primary to-primary/80 border border-primary/40">
                        <Scroll className="h-8 w-8 text-primary-foreground magical-float" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-foreground">
                        0
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Adventures Forged
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent"></div>
                  <CardContent className="relative z-10 py-8 space-y-4">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-accent/30 blur-lg rounded-full"></div>
                      <div className="relative p-4 rounded-full bg-gradient-to-br from-accent to-accent/80 border border-accent/40">
                        <Sword className="h-8 w-8 text-accent-foreground magical-float" style={{ animationDelay: '0.5s' }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-foreground">
                        0
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Epic Encounters
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
                  <CardContent className="relative z-10 py-8 space-y-4">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-lg rounded-full"></div>
                      <div className="relative p-4 rounded-full bg-gradient-to-br from-primary via-accent to-primary border border-primary/40">
                        <Crown className="h-8 w-8 text-primary-foreground magical-float" style={{ animationDelay: '1s' }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-foreground">
                        0
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Legendary NPCs
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5"></div>
                  <CardContent className="relative z-10 py-8 space-y-4">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-primary/30 blur-lg rounded-full"></div>
                      <div className="relative p-4 rounded-full bg-gradient-to-br from-accent via-primary to-accent border border-accent/40">
                        <Gem className="h-8 w-8 text-accent-foreground magical-float" style={{ animationDelay: '1.5s' }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-foreground">
                        0
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Mystical Artifacts
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Mystical Stats & Inspiration */}
            <section className="grid md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 mystical-border">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full"></div>
                      <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 border border-primary/40">
                        <Moon className="h-6 w-6 text-primary-foreground magical-float" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display text-foreground">
                      🌙 Midnight's Wisdom
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground italic leading-relaxed">
                    "In the velvet darkness, the greatest stories are born. Let your imagination be the silver light that guides heroes through their most perilous trials."
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Feather className="h-3 w-3 text-primary" />
                    <span>Ancient Wisdom</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 mystical-border">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent"></div>
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/30 blur-lg rounded-full"></div>
                      <div className="relative p-3 rounded-xl bg-gradient-to-br from-accent to-accent/80 border border-accent/40">
                        <Sun className="h-6 w-6 text-accent-foreground magical-float" style={{ animationDelay: '1s' }} />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display text-foreground">
                      ☀️ Dawn's Revelation
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground italic leading-relaxed">
                    "With each golden sunrise comes the promise of new adventures. Your creativity is the dawn that illuminates uncharted realms."
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Compass className="h-3 w-3 text-accent" />
                    <span>Eternal Journey</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 mystical-border">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"></div>
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-lg rounded-full"></div>
                      <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary via-accent to-primary border border-primary/40">
                        <Sparkles className="h-6 w-6 text-primary-foreground magical-pulse" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display text-foreground">
                      ✨ Arcane Mastery
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground italic leading-relaxed">
                    "The mystical energies flow through every word you inscribe. Channel them with wisdom, for you are the architect of dreams."
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Gem className="h-3 w-3 text-primary" />
                    <span>Infinite Power</span>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        ) : (
          // Epic Landing Page for Aspiring Legends
          <div className="space-y-20">
            {/* Legendary Hero Section */}
            <section className="text-center space-y-12 py-20">
              <div className="space-y-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl rounded-full scale-150"></div>
                  <h1 className="relative text-6xl md:text-7xl xl:text-8xl font-display font-bold bg-gradient-to-r from-primary via-accent via-primary to-accent bg-clip-text text-transparent animate-pulse">
                    ⚡ Arcanum Scribe ⚡
                  </h1>
                </div>
                
                <div className="space-y-6">
                  <p className="text-3xl md:text-4xl font-display font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Where Legends Are Born
                  </p>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                    Harness the power of ancient magic and cutting-edge AI to forge epic adventures that will echo through eternity. 
                    Your imagination is the only limit to the worlds you can create.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 text-lg text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-6 w-6 text-primary" />
                    <span>AI-Powered Magic</span>
                  </div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-accent" />
                    <span>Master-Crafted</span>
                  </div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span>Infinitely Creative</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-primary-foreground shadow-2xl hover:shadow-3xl text-xl px-12 py-4 rounded-xl transition-all duration-500 transform hover:scale-105">
                  <Link to="/auth" className="flex items-center gap-3">
                    <Flame className="h-6 w-6" />
                    Begin Your Legend
                    <Sparkles className="h-6 w-6" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-xl px-12 py-4 rounded-xl border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
                  <Link to="/gallery" className="flex items-center gap-3">
                    <Eye className="h-6 w-6" />
                    Witness the Magic
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </Button>
              </div>
            </section>

            {/* Powers of Creation - Epic Features Grid */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  🔮 Powers of Creation
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Wield the ancient arts of storytelling, enhanced by the most powerful AI magic ever conceived
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full"></div>
                      <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                        <Wand2 className="h-8 w-8 text-primary-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display">⚡ Arcane Generation</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Channel pure imagination into complete adventures. NPCs with souls, encounters with purpose, and plot hooks that ensnare hearts.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="relative overflow-hidden border-2 border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 hover:border-accent/40 hover:shadow-2xl transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-accent/30 blur-xl rounded-full"></div>
                      <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
                        <Image className="h-8 w-8 text-accent-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display">🎨 Mystical Artwork</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Every creature, every artifact springs to life with breathtaking AI-crafted illustrations that capture the essence of your vision.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-xl rounded-full"></div>
                      <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                        <Download className="h-8 w-8 text-primary-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display">📜 Legendary Tomes</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Transform your creations into magnificent PDFs worthy of the greatest libraries, ready for any table or digital realm.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="relative overflow-hidden border-2 border-accent/20 bg-gradient-to-br from-accent/10 to-primary/5 hover:border-accent/40 hover:shadow-2xl transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-primary/30 blur-xl rounded-full"></div>
                      <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
                        <Scroll className="h-8 w-8 text-accent-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display">⚔️ Living Statistics</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Breathe mechanical life into your creations with detailed stat blocks, custom abilities, and balanced encounters that challenge heroes.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-xl rounded-full"></div>
                      <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                        <Library className="h-8 w-8 text-primary-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display">📚 Eternal Archive</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Build your personal collection of legends, share masterpieces with fellow creators, and discover infinite inspiration.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="relative overflow-hidden border-2 border-accent/20 bg-gradient-to-br from-accent/10 to-primary/5 hover:border-accent/40 hover:shadow-2xl transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-primary/30 blur-xl rounded-full"></div>
                      <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
                        <Zap className="h-8 w-8 text-accent-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display">⚡ Instant Manifestation</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      What once took hours of preparation now materializes in moments. Your creativity flows unbound by time's constraints.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </section>

            {/* Epic Call to Destiny */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border-2 border-primary/30 p-20 text-center space-y-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50"></div>
              <div className="absolute top-10 left-10 w-4 h-4 bg-primary/40 rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-3 h-3 bg-accent/40 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse delay-500"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    🌟 Your Destiny Awaits 🌟
                  </h2>
                  <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                    Join the ranks of legendary Game Masters who have already discovered the power of Arcanum Scribe. 
                    Your greatest adventures are waiting to be born.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-8 text-lg text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    <span>Thousands of Legends Created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse delay-700"></div>
                    <span>Infinite Stories Await</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-primary-foreground shadow-2xl hover:shadow-3xl text-2xl px-16 py-6 rounded-2xl transition-all duration-500 transform hover:scale-110">
                    <Link to="/auth" className="flex items-center gap-4">
                      <Crown className="h-7 w-7" />
                      Claim Your Throne
                      <Sparkles className="h-7 w-7" />
                    </Link>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  "The greatest adventures begin with a single spark of imagination..."
                </p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
