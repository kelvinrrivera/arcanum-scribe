import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Star, Scroll, Shield, Wand2, BookOpen, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FeatureComparison } from './FeatureComparison';
import { ConversionCTA, PricingCTASection } from './ConversionCTA';

export interface PricingSectionProps {
  className?: string;
}

// D&D Character Class themed pricing tiers - AUTHENTIC BETA FEATURES ONLY
const characterClasses = [
  {
    name: 'The Reader',
    characterClass: 'Apprentice Scholar',
    price: 'Free',
    period: 'forever',
    description: 'Begin your journey by exploring the vast libraries of legendary adventures',
    icon: BookOpen,
    iconColor: 'text-blue-400',
    credits: 0,
    downloads: 3,
    level: 'Level 1-3',
    features: [
      'Unlimited access to Public Legend Library',
      '3 PDF downloads per month',
      'Rate and review adventures (Coming Soon)',
      'Bookmark favorite content (Coming Soon)',
      'Search and filter adventures'
    ],
    limitations: [
      'Cannot generate new content',
      'Downloads include watermarks',
      'No private adventures'
    ],
    buttonText: 'Start Your Journey',
    buttonVariant: 'outline' as const,
    popular: false,
    magicalBorder: false,
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20'
  },
  {
    name: 'The Creator',
    characterClass: 'Journeyman Artificer',
    price: 'Coming Soon',
    period: 'per month',
    description: 'Forge legendary adventures and share your creations with fellow adventurers',
    icon: Wand2,
    iconColor: 'text-primary',
    credits: 10,
    downloads: -1,
    level: 'Level 4-10',
    features: [
      '10 Magic Credits ✨ per month',
      'Generate full adventures (3 ✨) and components (1 ✨)',
      'Unlimited downloads, watermark-free',
      'Public sharing by default',
      'Creator analytics (Coming Soon)',
      'Additional credits purchase (Coming Soon)'
    ],
    limitations: [],
    buttonText: 'Join Beta Waitlist',
    buttonVariant: 'default' as const,
    popular: true,
    magicalBorder: true,
    borderColor: 'border-primary',
    glowColor: 'shadow-primary/30'
  },
  {
    name: 'The Architect',
    characterClass: 'Archmage of Worlds',
    price: 'Coming Soon',
    period: 'per month',
    description: 'Master the arcane arts of world-building with ultimate creative power',
    icon: Crown,
    iconColor: 'text-accent',
    credits: 30,
    downloads: -1,
    level: 'Level 11-20',
    features: [
      '30 Magic Credits ✨ per month',
      'Private creations by default',
      'Adventure Forge (Coming Soon)',
      'Multiple game systems (Coming Soon)',
      'Priority generation queue (Coming Soon)',
      'Professional PDF templates',
      'VTT export formats (Coming Soon)'
    ],
    limitations: [],
    buttonText: 'Join Beta Waitlist',
    buttonVariant: 'default' as const,
    popular: false,
    magicalBorder: true,
    borderColor: 'border-accent',
    glowColor: 'shadow-accent/30'
  }
];

export const PricingSection: React.FC<PricingSectionProps> = ({ className }) => {
  const { user, profile } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className={`py-20 bg-gradient-to-br from-background via-background/95 to-primary/5 ${className || ''}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Scroll className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Choose Your Adventure Path</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Advance Your Character Class
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every great adventurer starts somewhere. Choose the path that matches your creative ambitions 
            and unlock the magical powers needed to forge legendary tales.
          </p>
          
          {user && profile && (
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Shield className="h-3 w-3 mr-1" />
                Current: {profile.tier || 'Reader'}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                {profile.magic_credits - profile.credits_used || 0} ✨ Remaining
              </Badge>
            </div>
          )}
        </div>

        {/* Character Class Pricing Tiers */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {characterClasses.map((tier, index) => {
            const IconComponent = tier.icon;
            const isHovered = hoveredCard === index;
            
            return (
              <Card 
                key={index}
                className={`
                  relative transition-all duration-300 cursor-pointer group
                  ${tier.popular ? 'scale-105 z-10' : 'hover:scale-102'}
                  ${tier.magicalBorder ? `border-2 ${tier.borderColor} ${tier.glowColor} shadow-lg` : 'border border-border'}
                  ${isHovered ? 'transform -translate-y-2' : ''}
                  bg-gradient-to-br from-card via-card to-card/80
                  hover:shadow-2xl hover:${tier.glowColor}
                `}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="bg-primary text-primary-foreground shadow-lg animate-pulse">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Magical Glow Effect */}
                {tier.magicalBorder && (
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${tier.borderColor.replace('border-', 'from-')} to-transparent opacity-20 blur-sm`} />
                )}
                
                <CardHeader className="text-center pb-6 relative z-10">
                  {/* Character Class Icon */}
                  <div className={`mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border ${tier.borderColor} w-fit`}>
                    <IconComponent className={`h-8 w-8 ${tier.iconColor}`} />
                  </div>
                  
                  {/* Character Level */}
                  <Badge variant="outline" className="mb-2 text-xs">
                    {tier.level}
                  </Badge>
                  
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <div className="text-sm text-muted-foreground font-medium">{tier.characterClass}</div>
                  
                  {/* Pricing Display */}
                  <div className="space-y-3 mt-4">
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                      {tier.period !== 'forever' && (
                        <span className="text-muted-foreground">/{tier.period}</span>
                      )}
                    </div>
                    
                    {/* Magic Credits Display */}
                    {tier.credits > 0 && (
                      <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg p-3 border border-primary/30">
                        <div className="text-2xl font-bold text-primary">{tier.credits} ✨</div>
                        <div className="text-sm text-muted-foreground">Magic Credits per month</div>
                      </div>
                    )}
                    
                    {/* Downloads Display */}
                    {tier.downloads > 0 && (
                      <div className="bg-muted/50 rounded-lg p-2 border border-border">
                        <div className="text-sm text-muted-foreground">{tier.downloads} downloads/month</div>
                      </div>
                    )}
                    
                    {tier.downloads === -1 && (
                      <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
                        <div className="text-sm text-green-400 font-medium">Unlimited downloads</div>
                      </div>
                    )}
                    
                    <CardDescription className="mt-3 text-center">{tier.description}</CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 relative z-10">
                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Class Abilities:
                    </h4>
                    <ul className="space-y-2">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {tier.limitations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Restrictions:
                      </h4>
                      <ul className="space-y-2">
                        {tier.limitations.map((limitation, limitationIndex) => (
                          <li key={limitationIndex} className="flex items-start space-x-2">
                            <div className="h-4 w-4 rounded-full border border-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Enhanced CTA */}
                  <ConversionCTA
                    tier={tier.name === 'The Reader' ? 'reader' : tier.name === 'The Creator' ? 'creator' : 'architect'}
                    buttonText={tier.buttonText}
                    price={tier.price}
                    popular={tier.popular}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <FeatureComparison className="mb-16" />

        {/* Enhanced CTA Section */}
        <PricingCTASection />
      </div>
    </section>
  );
};