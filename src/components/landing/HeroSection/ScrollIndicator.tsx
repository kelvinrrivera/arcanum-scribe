import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, MousePointer } from 'lucide-react';
import { getOptimizedAnimationProps } from '@/lib/animations/performance';

export interface ScrollIndicatorProps {
  className?: string;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ className }) => {
  const [isHovered, setIsHovered] = useState(false);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
      
      // Track scroll interaction
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'scroll_indicator_click', {
          event_category: 'engagement',
          event_label: 'hero_to_features'
        });
      }
    }
  };

  const indicatorVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 2.8,
        ease: "easeOut"
      }
    }
  };

  const bounceVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    rest: {
      boxShadow: '0 0 20px hsl(38 92% 50% / 0.3)',
      scale: 1
    },
    hover: {
      boxShadow: [
        '0 0 20px hsl(38 92% 50% / 0.3)',
        '0 0 40px hsl(38 92% 50% / 0.6)',
        '0 0 60px hsl(38 92% 50% / 0.4)'
      ],
      scale: 1.1,
      transition: {
        boxShadow: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        },
        scale: {
          duration: 0.3
        }
      }
    }
  };

  return (
    <motion.div
      className={`absolute bottom-24 lg:bottom-32 left-1/2 transform -translate-x-1/2 ${className || ''}`}
      {...getOptimizedAnimationProps({
        variants: indicatorVariants,
        initial: 'hidden',
        animate: 'visible'
      })}
    >
      <motion.button
        onClick={scrollToFeatures}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="scroll-indicator relative p-3 rounded-full bg-primary/20 border-2 border-primary/30 hover:bg-primary/30 transition-all duration-300 group min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Scroll to features section"
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulsing glow background */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30"
          variants={glowVariants}
          initial="rest"
          animate={isHovered ? "hover" : "rest"}
        />
        
        {/* Animated chevron */}
        <motion.div
          variants={bounceVariants}
          animate="animate"
          className="relative z-10"
        >
          <ChevronDown 
            className="h-6 w-6 text-primary group-hover:text-accent transition-colors duration-300" 
            aria-hidden="true"
          />
        </motion.div>
        
        {/* Ripple effect on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/50"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>
      
      {/* Scroll hint text */}
      <motion.div
        className="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground/60 whitespace-nowrap flex items-center gap-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.5, duration: 0.8 }}
      >
        <MousePointer className="h-3 w-3" aria-hidden="true" />
        <span>Scroll to explore</span>
      </motion.div>
    </motion.div>
  );
};