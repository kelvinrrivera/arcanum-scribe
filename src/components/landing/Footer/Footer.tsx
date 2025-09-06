import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={`py-12 border-t border-border/50 bg-gradient-to-br from-background to-primary/5 ${className || ''}`}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Arcanum Scribe
              </span>
            </div>
            <p className="text-muted-foreground">
              Where legends are born and adventures come to life through the power of AI magic.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Product</h3>
            <div className="space-y-2">
              <Link to="/generate" className="block text-muted-foreground hover:text-primary transition-colors">
                Generate Adventures
              </Link>
              <Link to="/gallery" className="block text-muted-foreground hover:text-primary transition-colors">
                Gallery
              </Link>
              <Link to="/pricing" className="block text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <div className="space-y-2">
              <Link to="/docs" className="block text-muted-foreground hover:text-primary transition-colors">
                Documentation
              </Link>
              <Link to="/help" className="block text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <div className="space-y-2">
              <Link to="/privacy" className="block text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-muted-foreground">
          <p>&copy; 2024 Arcanum Scribe. All rights reserved. Crafted with ⚡ for legendary Game Masters.</p>
        </div>
      </div>
    </footer>
  );
};