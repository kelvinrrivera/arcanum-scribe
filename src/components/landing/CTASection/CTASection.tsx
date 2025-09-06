import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Crown } from 'lucide-react';

export interface CTASectionProps {
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({ className }) => {
  return (
    <section className={`py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 ${className || ''}`}>
      <div className="container mx-auto px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ⚡ Your Legend Awaits ⚡
            </h2>
            <p className="text-xl text-muted-foreground">
              Be among the first to experience the future of D&D content creation. 
              The realm of infinite possibilities is just one click away.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-primary-foreground shadow-2xl hover:shadow-3xl text-xl px-12 py-4 rounded-xl transition-all duration-500 transform hover:scale-105"
              onClick={() => {
                const betaSection = document.getElementById('beta-section');
                betaSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Crown className="h-6 w-6" />
              Join Beta Waitlist
              <Sparkles className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};