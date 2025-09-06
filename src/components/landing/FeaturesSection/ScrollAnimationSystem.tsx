import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

export interface ScrollAnimationSystemProps {
  children: React.ReactNode;
  className?: string;
}

// Enhanced Intersection Observer hook with performance optimizations
export const useAdvancedInView = (options: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  staggerDelay?: number;
  index?: number;
}) => {
  const {
    threshold = 0.1,
    rootMargin = '-100px 0px -100px 0px',
    triggerOnce = true,
    staggerDelay = 100,
    index = 0,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          // Add stagger delay based on index
          const delay = index * staggerDelay;
          
          setTimeout(() => {
            setIsVisible(true);
            setHasTriggered(true);
          }, delay);
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, staggerDelay, index, hasTriggered]);

  return { ref, isVisible };
};

// Parallax background elements
export const ParallaxBackground: React.FC<{ className?: string }> = ({ className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Smooth spring animations
  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });
  const springY3 = useSpring(y3, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ''}`}>
      {/* Floating D20 dice */}
      <motion.div
        className="absolute top-20 left-10 w-8 h-8 opacity-20"
        style={{ y: springY1 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-primary to-accent rounded-lg d20-float" />
      </motion.div>
      
      <motion.div
        className="absolute top-40 right-20 w-6 h-6 opacity-15"
        style={{ y: springY2 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-accent to-primary rounded-lg d20-float" 
             style={{ animationDelay: '2s' }} />
      </motion.div>

      <motion.div
        className="absolute bottom-40 left-1/4 w-10 h-10 opacity-10"
        style={{ y: springY3 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-primary/50 to-accent/50 rounded-lg d20-float" 
             style={{ animationDelay: '4s' }} />
      </motion.div>

      {/* Magical particles */}
      <div className="particle-background">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              y: useTransform(scrollYProgress, [0, 1], [0, -300 - i * 20])
            }}
          />
        ))}
      </div>

      {/* Gradient overlays for depth */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]) }}
      />
    </div>
  );
};

// Staggered container for feature cards
export const StaggeredContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className, staggerDelay = 150 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    threshold: 0.1, 
    margin: "-100px 0px -100px 0px",
    once: true 
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay / 1000,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
};

// Individual animated item wrapper
export const AnimatedItem: React.FC<{
  children: React.ReactNode;
  index: number;
  className?: string;
  animationType?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scale' | 'magical';
}> = ({ children, index, className, animationType = 'fadeUp' }) => {
  const { ref, isVisible } = useAdvancedInView({
    index,
    staggerDelay: 100,
    threshold: 0.2,
  });

  const animationVariants = {
    fadeUp: {
      hidden: { opacity: 0, y: 60, scale: 0.95 },
      visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        }
      }
    },
    fadeLeft: {
      hidden: { opacity: 0, x: -60, rotateY: -15 },
      visible: { 
        opacity: 1, 
        x: 0, 
        rotateY: 0,
        transition: {
          duration: 0.7,
          ease: [0.4, 0, 0.2, 1],
        }
      }
    },
    fadeRight: {
      hidden: { opacity: 0, x: 60, rotateY: 15 },
      visible: { 
        opacity: 1, 
        x: 0, 
        rotateY: 0,
        transition: {
          duration: 0.7,
          ease: [0.4, 0, 0.2, 1],
        }
      }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8, rotateZ: -5 },
      visible: { 
        opacity: 1, 
        scale: 1, 
        rotateZ: 0,
        transition: {
          duration: 0.5,
          ease: [0.68, -0.55, 0.265, 1.55],
        }
      }
    },
    magical: {
      hidden: { 
        opacity: 0, 
        scale: 0.8
      },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1],
        }
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={animationVariants[animationType]}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}

    >
      {children}
    </motion.div>
  );
};

// Scroll progress indicator
export const ScrollProgressIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent z-50 origin-left ${className || ''}`}
      style={{ scaleX }}
    />
  );
};

// Main scroll animation system wrapper
export const ScrollAnimationSystem: React.FC<ScrollAnimationSystemProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={`relative ${className || ''}`}>
      <ParallaxBackground />
      {children}
    </div>
  );
};