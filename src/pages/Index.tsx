import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { 
  Sparkles, 
  Wand2, 
  Scroll, 
  Image, 
  Download, 
  Library, 
  ArrowRight,
  Zap,
  Star,
  Crown
} from 'lucide-react';

const Index = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {user ? (
          // Authenticated User Dashboard
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome back, {profile?.display_name || 'GM'}!
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ready to create your next legendary adventure? Let's bring your imagination to life.
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="secondary" className="px-3 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  {profile?.subscription_tier || 'Free'} Plan
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Zap className="h-3 w-3 mr-1" />
                  {profile?.credits_remaining || 5} Credits
                </Badge>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="magical-shadow hover:magical-glow transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg gradient-primary">
                      <Wand2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <CardTitle>Generate Adventure</CardTitle>
                  </div>
                  <CardDescription>
                    Create a complete adventure from a simple prompt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full gradient-primary text-primary-foreground group-hover:scale-105 transition-transform">
                    <Link to="/generate">
                      Start Creating
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="magical-shadow hover:magical-glow transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg gradient-secondary">
                      <Library className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <CardTitle>My Library</CardTitle>
                  </div>
                  <CardDescription>
                    Browse and manage your saved adventures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full group-hover:scale-105 transition-transform">
                    <Link to="/library">
                      View Library
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="magical-shadow hover:magical-glow transition-all duration-300 cursor-pointer group md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg gradient-accent">
                      <Star className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <CardTitle>Upgrade</CardTitle>
                  </div>
                  <CardDescription>
                    Unlock more features and unlimited credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full group-hover:scale-105 transition-transform">
                    <Link to="/pricing">
                      View Plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Adventures</CardTitle>
                <CardDescription>
                  Your latest creations and magical tales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Scroll className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No adventures yet. Start creating your first masterpiece!</p>
                  <Button asChild className="mt-4 gradient-primary text-primary-foreground">
                    <Link to="/generate">Create Adventure</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Landing Page for Non-Authenticated Users
          <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-8 py-16">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Arcanum Scribe
                </h1>
                <p className="text-2xl md:text-3xl text-muted-foreground">
                  The Ultimate AI-Powered GM Assistant
                </p>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Transform simple prompts into complete TTRPG adventures with stunning artwork, 
                  detailed stat blocks, and professional PDF exports.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="gradient-primary text-primary-foreground magical-glow text-lg px-8">
                  <Link to="/auth">
                    Start Creating Free
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link to="/demo">
                    View Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="magical-shadow hover:magical-glow transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Wand2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>AI-Powered Generation</CardTitle>
                  <CardDescription>
                    Transform any idea into a complete adventure with NPCs, encounters, and plot hooks
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="magical-shadow hover:magical-glow transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg gradient-accent flex items-center justify-center mb-4">
                    <Image className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle>Stunning Artwork</CardTitle>
                  <CardDescription>
                    Every adventure comes with beautiful AI-generated illustrations for monsters and items
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="magical-shadow hover:magical-glow transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg gradient-secondary flex items-center justify-center mb-4">
                    <Download className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <CardTitle>Professional Exports</CardTitle>
                  <CardDescription>
                    Export adventures as beautiful PDFs ready for your table or online sessions
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="magical-shadow hover:magical-glow transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Scroll className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Stat Blocks & Items</CardTitle>
                  <CardDescription>
                    Generate detailed stat blocks for monsters and magical items with custom abilities
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="magical-shadow hover:magical-glow transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg gradient-accent flex items-center justify-center mb-4">
                    <Library className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle>Adventure Library</CardTitle>
                  <CardDescription>
                    Save, organize, and share your creations with the community
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="magical-shadow hover:magical-glow transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg gradient-secondary flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <CardTitle>Lightning Fast</CardTitle>
                  <CardDescription>
                    Generate complete adventures in minutes, not hours of prep time
                  </CardDescription>
                </CardHeader>
              </Card>
            </section>

            {/* CTA Section */}
            <section className="text-center bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-3xl p-16 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your Game?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of Game Masters who are already creating legendary adventures with Arcanum Scribe.
              </p>
              <Button asChild size="lg" className="gradient-primary text-primary-foreground magical-glow text-lg px-8">
                <Link to="/auth">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
