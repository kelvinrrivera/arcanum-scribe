import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap, Star } from 'lucide-react';

const plans = [
  {
    name: 'The Reader',
    price: '€0',
    period: 'forever',
    description: 'Explore a universe of legends created by our community',
    icon: '📚',
    credits: 0,
    downloads: 3,
    features: [
      'Unlimited access to Public Legend Library',
      '3 PDF downloads per month',
      'Rate and review adventures',
      'Bookmark favorite content',
      'Search and filter adventures'
    ],
    limitations: [
      'Cannot generate new content',
      'Downloads include watermarks',
      'No private adventures'
    ],
    buttonText: 'Start Reading',
    buttonVariant: 'outline' as const,
    popular: false
  },
  {
    name: 'The Creator',
    price: '€12',
    period: 'per month',
    description: 'Forge your own legends and share them with the world',
    icon: '⚒️',
    credits: 10,
    downloads: -1,
    features: [
      '10 Magic Credits ✨ per month',
      'Generate full adventures (3 ✨) and components (1 ✨)',
      'Unlimited downloads, watermark-free',
      'Public sharing by default',
      'Creator analytics and recognition',
      'Option to purchase additional credits'
    ],
    limitations: [],
    buttonText: 'Start Creating',
    buttonVariant: 'default' as const,
    popular: true
  },
  {
    name: 'The Architect',
    price: '€29',
    period: 'per month',
    description: 'Design your worlds in secret with master tools',
    icon: '🏛️',
    credits: 30,
    downloads: -1,
    features: [
      '30 Magic Credits ✨ per month',
      'Private creations by default',
      'Access to Adventure Forge (node builder)',
      'Advanced stat blocks for multiple systems',
      'Priority generation queue',
      'Professional PDF templates',
      'Advanced export formats (Roll20, FoundryVTT)'
    ],
    limitations: [],
    buttonText: 'Start Architecting',
    buttonVariant: 'default' as const,
    popular: false
  }
];

export default function Pricing() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ✨ The Magic Credits Economy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your creative power level. Every creation costs Magic Credits ✨ - 
              a transparent, flexible system that grows with your needs.
            </p>
            
            {user && profile && (
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="secondary" className="px-3 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  Current: {profile.tier || 'Reader'}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {profile.magic_credits - profile.credits_used || 0} ✨ Remaining
                </Badge>
              </div>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`magical-shadow relative ${
                  plan.popular 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 scale-105' 
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className="text-4xl mb-2">{plan.icon}</div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    
                    {/* Magic Credits Display */}
                    {plan.credits > 0 && (
                      <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg p-3 mx-4 border border-border">
                        <div className="text-2xl font-bold text-primary">{plan.credits} ✨</div>
                        <div className="text-sm text-muted-foreground">Magic Credits per month</div>
                      </div>
                    )}
                    
                    {plan.downloads > 0 && (
                      <div className="bg-muted/50 rounded-lg p-2 mx-4 border border-border">
                        <div className="text-sm text-muted-foreground">{plan.downloads} downloads/month</div>
                      </div>
                    )}
                    
                    {plan.downloads === -1 && (
                      <div className="bg-green-500/20 rounded-lg p-2 mx-4 border border-green-500/30">
                        <div className="text-sm text-green-400">Unlimited downloads</div>
                      </div>
                    )}
                    
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-muted-foreground">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li key={limitationIndex} className="flex items-start space-x-2">
                            <div className="h-4 w-4 rounded-full border border-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? '' 
                        : ''
                    }`}
                    variant={plan.buttonVariant || (plan.popular ? 'default' : 'outline')}
                    asChild
                  >
                    <Link to={user ? '/generate' : '/auth'}>
                      {plan.buttonText}
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Credit Costs Section */}
          <Card className="magical-shadow">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Magic Credits Cost Guide
              </CardTitle>
              <CardDescription className="text-center">
                Transparent pricing for every creation. Mix and match based on your campaign needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-primary mb-2">3 ✨</div>
                  <div className="font-semibold mb-1 text-foreground">Full Adventure</div>
                  <div className="text-sm text-muted-foreground">Complete adventure with encounters, NPCs, story, and everything you need</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-primary mb-2">1 ✨</div>
                  <div className="font-semibold mb-1 text-foreground">Individual Monster</div>
                  <div className="text-sm text-muted-foreground">Custom monster with stat block, tactics, and lore</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-primary mb-2">1 ✨</div>
                  <div className="font-semibold mb-1 text-foreground">Individual NPC</div>
                  <div className="text-sm text-muted-foreground">Detailed NPC with personality, background, and motivations</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-primary mb-2">1 ✨</div>
                  <div className="font-semibold mb-1 text-foreground">Magic Item</div>
                  <div className="text-sm text-muted-foreground">Unique magic item with properties, history, and mechanics</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-primary/15 to-accent/15 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-primary mb-2">1 ✨</div>
                  <div className="font-semibold mb-1 text-foreground">Puzzle</div>
                  <div className="text-sm text-muted-foreground">Creative puzzle or challenge with multiple solutions</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-accent/15 to-primary/15 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-primary mb-2">1 ✨</div>
                  <div className="font-semibold mb-1 text-foreground">Regenerate Section</div>
                  <div className="text-sm text-muted-foreground">Improve or modify existing content to your liking</div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg border border-border">
                <h4 className="font-semibold text-center mb-3 text-foreground">💡 Strategic Planning Examples</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-foreground">Creator Tier (10 ✨):</strong>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li>• 3 Full Adventures + 1 Component</li>
                      <li>• 2 Full Adventures + 4 Components</li>
                      <li>• 10 Individual Components</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-foreground">Architect Tier (30 ✨):</strong>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li>• 10 Full Adventures</li>
                      <li>• 6 Full Adventures + 12 Components</li>
                      <li>• Any combination you need!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Credits Section */}
          <Card className="magical-shadow">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Need More Credits?
              </CardTitle>
              <CardDescription className="text-center">
                Creator and Architect tier users can purchase additional Magic Credits anytime.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">5 ✨</div>
                  <div className="font-semibold text-foreground">€7</div>
                  <div className="text-sm text-muted-foreground mt-1">Perfect for 1 adventure + extras</div>
                </div>
                
                <div className="text-center p-4 border-2 border-primary rounded-lg bg-primary/10">
                  <Badge className="mb-2 bg-primary text-primary-foreground">Most Popular</Badge>
                  <div className="text-2xl font-bold text-primary mb-2">15 ✨</div>
                  <div className="font-semibold text-foreground">€19</div>
                  <div className="text-sm text-muted-foreground mt-1">Great value pack (10% off)</div>
                </div>
                
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">30 ✨</div>
                  <div className="font-semibold text-foreground">€35</div>
                  <div className="text-sm text-muted-foreground mt-1">Best value (17% off)</div>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                💡 Credits never expire and can be used whenever you need them!
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="magical-shadow">
            <CardHeader>
              <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">How do Magic Credits work?</h4>
                    <p className="text-sm text-muted-foreground">
                      Magic Credits ✨ are your creative currency. Each creation costs a specific amount of credits, giving you full control over what you generate.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Do credits expire?</h4>
                    <p className="text-sm text-muted-foreground">
                      No! Your monthly credits refresh each billing cycle, and any additional credits you purchase never expire.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! You can cancel your subscription at any time. Your access continues until the end of your billing period.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">What's the difference between tiers?</h4>
                    <p className="text-sm text-muted-foreground">
                      Reader tier is for browsing community content. Creator tier lets you generate content publicly. Architect tier adds privacy and advanced features.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Can I buy additional credits?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! Creator and Architect tier users can purchase additional Magic Credits anytime. Credits never expire.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What about private adventures?</h4>
                    <p className="text-sm text-muted-foreground">
                      Only Architect tier includes private adventures by default. Creator tier adventures are public, helping build our community library.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl p-12 space-y-6 border border-border">
            <h2 className="text-3xl font-bold text-foreground">Ready to Harness Your Creative Power?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of Game Masters who are already forging legendary adventures with Magic Credits ✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to={user ? '/generate' : '/auth'}>
                  Start Your Legend
                  <Sparkles className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/gallery">
                  Explore Legend Library
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 