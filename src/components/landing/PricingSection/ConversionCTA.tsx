import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Shield, 
  Clock, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle,
  Lock,
  Zap
} from 'lucide-react';

interface ConversionCTAProps {
  tier: 'reader' | 'creator' | 'architect';
  buttonText: string;
  price: string;
  popular?: boolean;
  className?: string;
}

// Trust signals and social proof elements
const trustSignals = {
  security: {
    icon: Shield,
    text: 'Secure & Private',
    description: 'Your data is encrypted and protected'
  },
  community: {
    icon: Users,
    text: 'Join Beta Community',
    description: 'Be part of our exclusive beta testing group'
  },
  quality: {
    icon: Star,
    text: 'Premium Quality',
    description: 'Professional-grade adventure generation'
  },
  support: {
    icon: CheckCircle,
    text: 'Full Support',
    description: 'Dedicated help during beta period'
  }
};

// Urgency and value messaging - HONEST BETA STATUS
const urgencyMessages = {
  reader: {
    primary: 'Start Exploring Today',
    secondary: 'Free forever • No credit card required',
    urgency: null
  },
  creator: {
    primary: 'Join Beta Development',
    secondary: 'Help shape the future • Early access perks',
    urgency: 'Beta Testing Available'
  },
  architect: {
    primary: 'Beta Access Coming Soon',
    secondary: 'Advanced features in development',
    urgency: 'Join Waitlist for Updates'
  }
};

export const ConversionCTA: React.FC<ConversionCTAProps> = ({
  tier,
  buttonText,
  price,
  popular = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const messaging = urgencyMessages[tier];
  
  // Track CTA interactions (in a real app, this would send to analytics)
  const handleCTAClick = () => {
    setClickCount(prev => prev + 1);
    
    // Analytics tracking would go here
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'pricing',
        event_label: tier,
        tier_name: tier,
        button_text: buttonText,
        price: price
      });
    }
    
    console.log(`CTA clicked: ${tier} tier, button: ${buttonText}`);
  };

  const handleCTAHover = () => {
    setIsHovered(true);
    
    // Track hover events for engagement analysis
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_hover', {
        event_category: 'pricing',
        event_label: tier,
        tier_name: tier
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Urgency Message */}
      {messaging.urgency && (
        <div className="text-center">
          <Badge 
            variant="secondary" 
            className="bg-primary/20 text-primary border-primary/30 animate-pulse"
          >
            <Clock className="h-3 w-3 mr-1" />
            {messaging.urgency}
          </Badge>
        </div>
      )}

      {/* Main CTA Button */}
      <Button
        className={`
          w-full h-12 text-base font-semibold transition-all duration-300 group
          ${popular ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30' : ''}
          ${isHovered ? 'transform scale-105 shadow-xl' : ''}
          ${tier === 'architect' ? 'bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70' : ''}
        `}
        variant={tier === 'reader' ? 'outline' : 'default'}
        asChild
        onMouseEnter={handleCTAHover}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCTAClick}
      >
        <Link to="/auth" className="flex items-center justify-center gap-2">
          {buttonText}
          <ArrowRight className={`h-4 w-4 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
        </Link>
      </Button>

      {/* Value Proposition */}
      <div className="text-center space-y-1">
        <p className="font-medium text-foreground">{messaging.primary}</p>
        <p className="text-sm text-muted-foreground">{messaging.secondary}</p>
      </div>

      {/* Trust Signals */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {Object.entries(trustSignals).slice(0, tier === 'architect' ? 4 : 2).map(([key, signal]) => {
          const IconComponent = signal.icon;
          return (
            <div key={key} className="flex items-center gap-1 text-muted-foreground">
              <IconComponent className="h-3 w-3 text-primary" />
              <span>{signal.text}</span>
            </div>
          );
        })}
      </div>

      {/* Beta Access Notice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-primary mb-1">Beta Access</p>
              <p className="text-muted-foreground">
                Join our exclusive beta program. Full pricing will be available at public launch.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beta Status (for popular tiers) */}
      {popular && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Most requested by beta community</span>
          </div>
        </div>
      )}

      {/* Security & Privacy Notice */}
      <div className="text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-1">
          <Shield className="h-3 w-3 text-green-500" />
          <span>Secure signup • Cancel anytime • No hidden fees</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced CTA Section for bottom of pricing
export interface PricingCTASectionProps {
  className?: string;
}

export const PricingCTASection: React.FC<PricingCTASectionProps> = ({ className }) => {
  const [emailSignup, setEmailSignup] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Track email signup
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'email_signup', {
        event_category: 'conversion',
        event_label: 'pricing_page'
      });
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setEmailSignup('');
    
    // Show success message (in real app, would handle properly)
    alert('Thanks for joining our beta waitlist!');
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Main CTA Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/20 overflow-hidden relative">
        {/* Magical background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-50" />
        
        <CardContent className="p-8 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Limited Beta Access</span>
            </div>
            
            <h3 className="text-3xl font-bold">Ready to Forge Your Legend?</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our exclusive beta community and be among the first to experience 
              the future of D&D adventure creation.
            </p>

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email for beta access"
                  value={emailSignup}
                  onChange={(e) => setEmailSignup(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      Join Beta
                      <Zap className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" />
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span>Join our beta community</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Early access perks</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Button asChild variant="outline" size="lg" className="h-12">
          <Link to="/gallery">
            <Star className="mr-2 h-4 w-4" />
            Explore Adventure Library
          </Link>
        </Button>
        
        <Button asChild variant="outline" size="lg" className="h-12">
          <Link to="/auth">
            <Users className="mr-2 h-4 w-4" />
            Join Community Discord
          </Link>
        </Button>
      </div>
    </div>
  );
};