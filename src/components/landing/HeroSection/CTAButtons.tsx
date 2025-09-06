import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame, Sparkles, Eye, ArrowRight, Zap, Star } from 'lucide-react';
import { getOptimizedAnimationProps } from '@/lib/animations/performance';

export interface CTAButtonsProps {
  className?: string;
}

export const CTAButtons: React.FC<CTAButtonsProps> = ({ className }) => {
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);

  // Analytics tracking function
  const trackCTAClick = (buttonType: 'primary' | 'secondary', destination: string) => {
    // Track conversion events
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'engagement',
        event_label: buttonType,
        destination: destination,
        page_location: window.location.href
      });
    }
    
    // Console log for development
    console.log(`CTA Click: ${buttonType} -> ${destination}`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 1.8,
        staggerChildren: 0.2
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const spellCastVariants = {
    rest: { 
      scale: 1, 
      rotateZ: 0,
      boxShadow: '0 10px 40px hsl(38 92% 50% / 0.2)'
    },
    hover: { 
      scale: 1.05, 
      rotateZ: [0, -1, 1, 0],
      boxShadow: [
        '0 10px 40px hsl(38 92% 50% / 0.2)',
        '0 15px 60px hsl(38 92% 50% / 0.4)',
        '0 20px 80px hsl(38 92% 50% / 0.6)'
      ],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        boxShadow: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        },
        rotateZ: {
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse"
        }
      }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const secondaryButtonVariants = {
    rest: { 
      scale: 1,
      borderColor: 'hsl(var(--primary) / 0.3)',
      backgroundColor: 'transparent'
    },
    hover: { 
      scale: 1.02,
      borderColor: 'hsl(var(--primary) / 0.6)',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      boxShadow: '0 10px 30px hsl(var(--primary) / 0.2)',
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  return (
    <motion.div 
      className={`flex flex-col sm:flex-row gap-6 justify-center items-center ${className || ''}`}
      {...getOptimizedAnimationProps({
        variants: containerVariants,
        initial: 'hidden',
        animate: 'visible'
      })}
    >
      {/* Primary CTA - Begin Your Legend */}
      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onHoverStart={() => setPrimaryHovered(true)}
        onHoverEnd={() => setPrimaryHovered(false)}
      >
        <motion.div
          variants={spellCastVariants}
          initial="rest"
          animate={primaryHovered ? "hover" : "rest"}
          className="relative"
        >
          <Button 
            asChild 
            size="lg" 
            className="mobile-cta-button spell-cast-button bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-primary-foreground shadow-2xl text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-xl relative overflow-hidden group"
          >
            <Link 
              to="/auth" 
              className="flex items-center gap-3 relative z-10"
              onClick={() => trackCTAClick('primary', '/auth')}
              aria-label="Begin your legend - Start creating D&D adventures"
            >
              <motion.div
                animate={primaryHovered ? { rotate: [0, 15, -15, 0] } : { rotate: 0 }}
                transition={{ duration: 0.6, repeat: primaryHovered ? Infinity : 0 }}
              >
                <Flame className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </motion.div>
              
              <span className="font-semibold">Begin Your Legend</span>
              
              <motion.div
                animate={primaryHovered ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360] 
                } : { scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 1.2, 
                  repeat: primaryHovered ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </motion.div>
            </Link>
          </Button>
          
          {/* Magical particles effect */}
          {primaryHovered && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-accent rounded-full"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    y: [-10, -30, -10],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      {/* Secondary CTA - Witness the Magic */}
      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onHoverStart={() => setSecondaryHovered(true)}
        onHoverEnd={() => setSecondaryHovered(false)}
      >
        <motion.div
          variants={secondaryButtonVariants}
          initial="rest"
          animate={secondaryHovered ? "hover" : "rest"}
          className="relative"
        >
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="mobile-cta-button text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-xl border-2 transition-all duration-300 group"
          >
            <Link 
              to="/gallery" 
              className="flex items-center gap-3"
              onClick={() => trackCTAClick('secondary', '/gallery')}
              aria-label="Witness the magic - View example adventures"
            >
              <motion.div
                animate={secondaryHovered ? { 
                  scale: [1, 1.1, 1],
                  rotateY: [0, 180, 360]
                } : { scale: 1, rotateY: 0 }}
                transition={{ 
                  duration: 1,
                  repeat: secondaryHovered ? Infinity : 0
                }}
              >
                <Eye className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </motion.div>
              
              <span className="font-semibold">Witness the Magic</span>
              
              <motion.div
                animate={secondaryHovered ? { x: [0, 5, 0] } : { x: 0 }}
                transition={{ 
                  duration: 0.8,
                  repeat: secondaryHovered ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </motion.div>
            </Link>
          </Button>
          
          {/* Subtle glow effect for secondary button */}
          {secondaryHovered && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 blur-sm -z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Trust indicators */}
      <motion.div
        className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/60 mt-4 sm:mt-0 sm:absolute sm:bottom-[-3rem] sm:left-1/2 sm:transform sm:-translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" aria-hidden="true" />
        <span>Free to Start</span>
        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-accent ml-2" aria-hidden="true" />
        <span>Beta Access Available</span>
      </motion.div>
    </motion.div>
  );
};