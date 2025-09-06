import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Zap, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerHapticFeedback, ensureTouchTarget } from '@/lib/touch-utils';
import { MOBILE_NAVIGATION, NavigationItem } from '@/lib/mobile-layout';

export interface MobileNavigationProps {
  className?: string;
  onNavigate?: (href: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  className = '',
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Icon mapping for navigation items
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Home': Home,
    'Features': Zap,
    'Beta Access': Users,
    'Pricing': DollarSign,
  };

  // Filter navigation items for mobile
  const mobileNavItems = MOBILE_NAVIGATION.items.filter(
    item => !item.desktopOnly && (item.priority === 'high' || item.priority === 'medium')
  );

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    triggerHapticFeedback('medium');
  };

  const handleNavClick = (item: NavigationItem) => {
    setActiveSection(item.href.replace('#', ''));
    setIsOpen(false);
    triggerHapticFeedback('light');
    
    if (onNavigate) {
      onNavigate(item.href);
    } else {
      // Smooth scroll to section
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = mobileNavItems.map(item => item.href.replace('#', ''));
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileNavItems]);

  // Ensure touch targets meet accessibility requirements
  useEffect(() => {
    const navButtons = document.querySelectorAll('[data-mobile-nav]');
    navButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        ensureTouchTarget(button);
      }
    });
  }, []);

  return (
    <div className={`md:hidden ${className}`}>
      {/* Mobile Menu Toggle */}
      <Button
        data-mobile-nav
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="mobile-nav-toggle relative z-50"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <div className={`hamburger ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </Button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={toggleMenu}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card/95 backdrop-blur-md 
                       border-l border-border shadow-2xl z-40 mobile-safe-top mobile-safe-bottom"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Menu</h2>
                  <Button
                    data-mobile-nav
                    variant="ghost"
                    size="sm"
                    onClick={toggleMenu}
                    className="touch-target"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-6">
                  <ul className="space-y-2">
                    {mobileNavItems.map((item, index) => {
                      const Icon = iconMap[item.label];
                      const isActive = activeSection === item.href.replace('#', '');
                      
                      return (
                        <motion.li
                          key={item.href}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <button
                            data-mobile-nav
                            onClick={() => handleNavClick(item)}
                            className={`
                              w-full flex items-center gap-3 p-4 rounded-lg text-left
                              transition-all duration-200 touch-target
                              ${isActive 
                                ? 'bg-primary text-primary-foreground shadow-lg' 
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                              }
                            `}
                          >
                            {Icon && (
                              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : ''}`} />
                            )}
                            <span className="font-medium">{item.label}</span>
                            
                            {/* Active indicator */}
                            {isActive && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="ml-auto w-2 h-2 bg-primary-foreground rounded-full"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                              />
                            )}
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Footer CTA */}
                <div className="p-6 border-t border-border">
                  <Button
                    data-mobile-nav
                    onClick={() => handleNavClick({ label: 'Beta Access', href: '#beta', priority: 'high' })}
                    className="w-full mobile-cta-button bg-gradient-to-r from-primary to-accent 
                             text-primary-foreground hover:from-primary/90 hover:to-accent/90"
                  >
                    🎲 Join Beta
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar (Alternative Pattern) */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border 
                    mobile-safe-bottom z-30 md:hidden">
        <nav className="flex items-center justify-around p-2">
          {mobileNavItems.slice(0, 4).map((item) => {
            const Icon = iconMap[item.label];
            const isActive = activeSection === item.href.replace('#', '');
            
            return (
              <button
                key={item.href}
                data-mobile-nav
                onClick={() => handleNavClick(item)}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-lg touch-target
                  transition-all duration-200 min-w-0 flex-1
                  ${isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
                aria-label={item.label}
              >
                {Icon && (
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                )}
                <span className="text-xs font-medium truncate">
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="bottomActiveIndicator"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                             w-1 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;