/**
 * Performance-optimized animation utilities
 * Handles reduced motion, GPU acceleration, and frame rate optimization
 */

import { MotionProps } from 'framer-motion';

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get optimized animation props based on user preferences
 */
export const getOptimizedAnimationProps = (
  animationProps: MotionProps,
  fallbackProps?: MotionProps
): MotionProps => {
  if (prefersReducedMotion()) {
    return {
      ...fallbackProps,
      initial: false,
      animate: false,
      transition: { duration: 0 },
    };
  }
  
  return {
    ...animationProps,
    // Enable GPU acceleration
    style: {
      ...animationProps.style,
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
    },
  };
};

/**
 * Optimized transition configurations
 */
export const transitions = {
  // Fast transitions for UI feedback
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  },
  
  // Standard transitions for most animations
  standard: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
  
  // Slow transitions for dramatic effects
  slow: {
    duration: 0.6,
    ease: [0.4, 0, 0.2, 1],
  },
  
  // Spring transitions for bouncy effects
  spring: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
  },
  
  // Magical spring for D&D effects
  magicalSpring: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 12,
    mass: 0.8,
  },
  
  // Smooth transitions for scroll animations
  smooth: {
    duration: 0.8,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
} as const;

/**
 * Easing functions for different animation types
 */
export const easings = {
  // Standard easing curves
  easeInOut: [0.4, 0, 0.2, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  
  // Bouncy easing for playful animations
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  
  // Smooth easing for elegant animations
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  
  // Sharp easing for quick feedback
  sharp: [0.4, 0, 0.6, 1] as const,
} as const;

/**
 * Viewport-based animation triggers
 */
export const viewportConfig = {
  // Trigger when element is 10% visible
  minimal: {
    threshold: 0.1,
    margin: '0px 0px -10% 0px',
  },
  
  // Trigger when element is 25% visible
  standard: {
    threshold: 0.25,
    margin: '0px 0px -25% 0px',
  },
  
  // Trigger when element is 50% visible
  half: {
    threshold: 0.5,
    margin: '0px 0px -50% 0px',
  },
  
  // Trigger early for better UX
  early: {
    threshold: 0.1,
    margin: '0px 0px 100px 0px',
  },
  
  // Trigger late for dramatic effect
  late: {
    threshold: 0.8,
    margin: '0px 0px -80% 0px',
  },
} as const;

/**
 * Stagger configurations for sequential animations
 */
export const staggerConfig = {
  // Fast stagger for quick reveals
  fast: {
    staggerChildren: 0.05,
    delayChildren: 0.1,
  },
  
  // Standard stagger for most use cases
  standard: {
    staggerChildren: 0.1,
    delayChildren: 0.2,
  },
  
  // Slow stagger for dramatic effect
  slow: {
    staggerChildren: 0.2,
    delayChildren: 0.3,
  },
  
  // Magical stagger with varying delays
  magical: {
    staggerChildren: 0.15,
    delayChildren: 0.25,
  },
} as const;

/**
 * Performance monitoring utilities
 */
export class AnimationPerformanceMonitor {
  private static instance: AnimationPerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  
  static getInstance(): AnimationPerformanceMonitor {
    if (!AnimationPerformanceMonitor.instance) {
      AnimationPerformanceMonitor.instance = new AnimationPerformanceMonitor();
    }
    return AnimationPerformanceMonitor.instance;
  }
  
  startMonitoring(): void {
    const measureFPS = (currentTime: number) => {
      this.frameCount++;
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        // Log performance warnings
        if (this.fps < 30) {
          console.warn(`Low FPS detected: ${this.fps}fps. Consider reducing animation complexity.`);
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }
  
  getCurrentFPS(): number {
    return this.fps;
  }
  
  shouldReduceAnimations(): boolean {
    return this.fps < 30 || prefersReducedMotion();
  }
}

/**
 * Utility to create performance-aware animation variants
 */
export const createPerformantVariants = (
  variants: Record<string, any>,
  fallbackVariants?: Record<string, any>
) => {
  const monitor = AnimationPerformanceMonitor.getInstance();
  
  if (monitor.shouldReduceAnimations()) {
    return fallbackVariants || {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.1 } },
    };
  }
  
  return variants;
};

/**
 * Debounced scroll handler for performance
 */
export const createDebouncedScrollHandler = (
  callback: () => void,
  delay: number = 16 // ~60fps
) => {
  let timeoutId: NodeJS.Timeout;
  let lastCallTime = 0;
  
  return () => {
    const now = Date.now();
    
    if (now - lastCallTime >= delay) {
      callback();
      lastCallTime = now;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback();
        lastCallTime = Date.now();
      }, delay - (now - lastCallTime));
    }
  };
};

/**
 * Intersection Observer with performance optimizations
 */
export const createOptimizedObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * GPU acceleration utilities
 */
export const gpuAcceleration = {
  // Force GPU layer creation
  willChange: {
    willChange: 'transform, opacity',
  },
  
  // Optimize for transforms
  transform3d: {
    transform: 'translate3d(0, 0, 0)',
  },
  
  // Prevent subpixel rendering issues
  backfaceHidden: {
    backfaceVisibility: 'hidden' as const,
  },
  
  // Combined optimization
  optimized: {
    willChange: 'transform, opacity',
    transform: 'translate3d(0, 0, 0)',
    backfaceVisibility: 'hidden' as const,
  },
} as const;