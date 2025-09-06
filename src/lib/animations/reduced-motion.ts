/**
 * Reduced Motion Support
 * Provides fallback animations and utilities for accessibility
 */

import { MotionProps } from 'framer-motion';

/**
 * Reduced motion media query hook
 */
export const useReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Fallback animations for reduced motion users
 */
export const reducedMotionVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'linear',
    },
  },
};

/**
 * Create accessible animation props
 */
export const createAccessibleAnimation = (
  animationProps: MotionProps,
  reducedProps?: Partial<MotionProps>
): MotionProps => {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return {
      ...reducedProps,
      variants: reducedMotionVariants,
      transition: { duration: 0.2 },
      // Disable complex animations
      whileHover: undefined,
      whileTap: undefined,
      drag: false,
    };
  }
  
  return animationProps;
};

/**
 * Reduced motion CSS class utilities
 */
export const reducedMotionClasses = {
  // Apply these classes when reduced motion is preferred
  noAnimation: 'motion-reduce:animate-none',
  noTransform: 'motion-reduce:transform-none',
  noTransition: 'motion-reduce:transition-none',
  fastTransition: 'motion-reduce:duration-75',
  
  // Combined utility
  accessible: 'motion-reduce:animate-none motion-reduce:transform-none motion-reduce:transition-none',
} as const;

/**
 * Animation configuration with reduced motion support
 */
export const accessibleAnimationConfig = {
  // Standard animations with reduced motion fallbacks
  fadeIn: {
    standard: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
    reduced: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
    },
  },
  
  slideIn: {
    standard: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
    reduced: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
    },
  },
  
  scale: {
    standard: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    reduced: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
    },
  },
} as const;

/**
 * Utility to get appropriate animation config
 */
export const getAccessibleAnimation = (
  animationType: keyof typeof accessibleAnimationConfig
) => {
  const prefersReducedMotion = useReducedMotion();
  const config = accessibleAnimationConfig[animationType];
  
  return prefersReducedMotion ? config.reduced : config.standard;
};

/**
 * CSS-in-JS styles for reduced motion
 */
export const reducedMotionStyles = `
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    
    /* Disable specific animations */
    .magical-float,
    .magical-pulse,
    .d20-float,
    .particle-float,
    .scroll-glow {
      animation: none !important;
    }
    
    /* Simplify transforms */
    .feature-card:hover,
    .spell-cast-button:hover,
    .tier-card:hover {
      transform: none !important;
    }
    
    /* Keep essential feedback */
    .spell-cast-button:hover {
      opacity: 0.9;
    }
    
    .feature-card:hover {
      border-color: hsl(var(--primary) / 0.5);
    }
  }
`;

/**
 * Inject reduced motion styles into document
 */
export const injectReducedMotionStyles = (): void => {
  if (typeof document === 'undefined') return;
  
  const existingStyle = document.getElementById('reduced-motion-styles');
  if (existingStyle) return;
  
  const style = document.createElement('style');
  style.id = 'reduced-motion-styles';
  style.textContent = reducedMotionStyles;
  document.head.appendChild(style);
};