import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Crown, Sparkles, Scroll, Sword, Shield } from 'lucide-react';
import { getOptimizedAnimationProps } from '@/lib/animations/performance';

export interface HeroContentProps {
  className?: string;
}

const typewriterTexts = [
  "Where Legends Are Born",
  "Where Adventures Begin", 
  "Where Magic Comes Alive",
  "Where Stories Unfold"
];

export const HeroContent: React.FC<HeroContentProps> = ({ className }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setDisplayText(typewriterTexts[0]);
      return;
    }

    let timeout: NodeJS.Timeout;
    const currentText = typewriterTexts[currentTextIndex];
    
    if (isTyping) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, 100);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setCurrentTextIndex((prev) => (prev + 1) % typewriterTexts.length);
          setIsTyping(true);
        }, 500);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentTextIndex, displayText, isTyping]);

  // Animation variants
  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.4, 0, 0.2, 1] 
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1],
        delay: 0.3 
      }
    }
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1],
        delay: 0.5 
      }
    }
  };

  const featuresVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        delay: 0.7,
        staggerChildren: 0.1
      }
    }
  };

  const featureItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Main Title */}
      <motion.div 
        className="relative"
        {...getOptimizedAnimationProps({
          variants: titleVariants,
          initial: 'hidden',
          animate: 'visible'
        })}
      >
        <h1 
          className="mobile-heading md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-display"
          role="banner"
          aria-label="Forge Epic D&D 5e Adventures with AI Magic"
        >
          AI-powered TTRPG adventure generator
        </h1>
      </motion.div>
        
      
      <div className="space-y-6">
        {/* Animated Subtitle with Typewriter Effect */}
        <motion.div
          className="min-h-[3rem] sm:min-h-[4rem] flex items-center justify-center"
          {...getOptimizedAnimationProps({
            variants: subtitleVariants,
            initial: 'hidden',
            animate: 'visible'
          })}
        >
          <h2 className="mobile-subheading md:text-3xl lg:text-4xl font-display font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {displayText}
            <motion.span
              className="inline-block w-1 mobile-heading md:h-10 lg:h-12 bg-primary ml-1"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
              aria-hidden="true"
            />
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p 
          className="mobile-body md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4"
          {...getOptimizedAnimationProps({
            variants: descriptionVariants,
            initial: 'hidden',
            animate: 'visible'
          })}
        >
          Harness the power of ancient magic and cutting-edge AI to create complete D&D 5e adventures. 
          Generate encounters, NPCs, and storylines that will captivate your players.
        </motion.p>
      </div>

      {/* Feature Highlights */}
      <motion.div 
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-base sm:text-lg text-muted-foreground px-4"
        {...getOptimizedAnimationProps({
          variants: featuresVariants,
          initial: 'hidden',
          animate: 'visible'
        })}
        role="list"
        aria-label="Key features"
      >
        <motion.div 
          className="flex items-center gap-2"
          variants={featureItemVariants}
          role="listitem"
        >
          <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
          <span>AI-Powered Magic</span>
        </motion.div>
        
        <div className="hidden sm:block w-2 h-2 bg-muted-foreground rounded-full" aria-hidden="true" />
        
        <motion.div 
          className="flex items-center gap-2"
          variants={featureItemVariants}
          role="listitem"
        >
          <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-accent" aria-hidden="true" />
          <span>Master-Crafted</span>
        </motion.div>
        
        <div className="hidden sm:block w-2 h-2 bg-muted-foreground rounded-full" aria-hidden="true" />
        
        <motion.div 
          className="flex items-center gap-2"
          variants={featureItemVariants}
          role="listitem"
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
          <span>Infinitely Creative</span>
        </motion.div>
      </motion.div>

      {/* Additional D&D Themed Features */}
      <motion.div 
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base text-muted-foreground/80 px-4"
        {...getOptimizedAnimationProps({
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay: 2.0 }
        })}
        role="list"
        aria-label="Additional features"
      >
        <div className="flex items-center gap-2" role="listitem">
          <Scroll className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
          <span>Epic Quests</span>
        </div>
        
        <div className="flex items-center gap-2" role="listitem">
          <Sword className="h-4 w-4 sm:h-5 sm:w-5 text-primary" aria-hidden="true" />
          <span>Legendary NPCs</span>
        </div>
        
        <div className="flex items-center gap-2" role="listitem">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
          <span>Balanced Encounters</span>
        </div>
      </motion.div>
    </div>
  );
};