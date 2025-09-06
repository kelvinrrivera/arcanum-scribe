/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * Optimized for performance with proper cleanup and reduced motion support
 */

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
    delay = 0,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    threshold,
    margin: rootMargin,
    once: triggerOnce,
  });

  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setShouldAnimate(true);
      return;
    }

    if (isInView) {
      if (delay > 0) {
        const timer = setTimeout(() => {
          setShouldAnimate(true);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        setShouldAnimate(true);
      }
    }
  }, [isInView, delay]);

  return {
    ref,
    isInView,
    shouldAnimate,
  };
};

export const useStaggeredAnimation = (itemCount: number, staggerDelay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const { ref, shouldAnimate } = useScrollAnimation();

  useEffect(() => {
    if (shouldAnimate) {
      const timers: NodeJS.Timeout[] = [];
      
      for (let i = 0; i < itemCount; i++) {
        const timer = setTimeout(() => {
          setVisibleItems(prev => [...prev, i]);
        }, i * staggerDelay);
        timers.push(timer);
      }

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [shouldAnimate, itemCount, staggerDelay]);

  return {
    ref,
    visibleItems,
    shouldAnimate,
  };
};

export const useParallaxScroll = (speed: number = 0.5) => {
  const [offsetY, setOffsetY] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return;
    }

    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * speed;
        
        // Only update if element is in viewport
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          setOffsetY(rate);
        }
      }
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return {
    ref,
    offsetY,
  };
};

export const useMouseParallax = (strength: number = 0.1) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;
        
        setMousePosition({ x: deltaX, y: deltaY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [strength]);

  return {
    ref,
    mousePosition,
  };
};

export const useAnimationSequence = (steps: Array<{ delay: number; duration: number }>) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const { ref, shouldAnimate } = useScrollAnimation();

  useEffect(() => {
    if (shouldAnimate && !isComplete) {
      const timers: NodeJS.Timeout[] = [];
      let totalDelay = 0;

      steps.forEach((step, index) => {
        totalDelay += step.delay;
        
        const timer = setTimeout(() => {
          setCurrentStep(index);
          
          // Mark as complete after the last step
          if (index === steps.length - 1) {
            setTimeout(() => {
              setIsComplete(true);
            }, step.duration);
          }
        }, totalDelay);
        
        timers.push(timer);
      });

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [shouldAnimate, steps, isComplete]);

  return {
    ref,
    currentStep,
    isComplete,
    shouldAnimate,
  };
};