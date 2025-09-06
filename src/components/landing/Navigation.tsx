import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Wand2, 
  Sparkles, 
  Map, 
  Crown, 
  DollarSign,
  LogIn 
} from 'lucide-react';
import MobileNavigation from './Navigation/MobileNavigation';
import { getMobileLayoutManager } from '@/lib/mobile-layout';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Showcase',
    href: '/showcase',
    icon: <Crown className="w-4 h-4" />,
    description: 'Community adventures'
  },
  {
    name: 'Pricing',
    href: '/pricing',
    icon: <DollarSign className="w-4 h-4" />,
    description: 'Beta access plans'
  }
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const layoutManager = getMobileLayoutManager();
    setIsMobile(layoutManager.isMobile());
    
    const cleanup = layoutManager.onSizeChange((size) => {
      setIsMobile(size === 'mobile');
    });
    
    return cleanup;
  }, []);

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 mobile-safe-top">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              <Wand2 className="w-6 h-6 text-primary" />
              <span className={isMobile ? 'hidden' : ''}>Arcanum Scribe</span>
              {isMobile && <span className="text-sm">AS</span>}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Join Beta
              </Button>
            </div>

            {/* Mobile Navigation Component */}
            <MobileNavigation 
              onNavigate={(href) => {
                if (href.startsWith('#')) {
                  // Handle anchor links for landing page
                  const element = document.querySelector(href);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  // Handle route navigation
                  window.location.href = href;
                }
              }}
            />
          </div>
        </div>
      </nav>
      
      {/* Spacer for fixed navigation */}
      <div className="h-16"></div>
    </>
  );
}