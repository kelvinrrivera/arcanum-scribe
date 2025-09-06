/**
 * Landing Page Theme Configuration
 * Provides utilities for dark theme optimization and magical effects
 */

export const landingTheme = {
  colors: {
    // Primary magical gold from design system
    magicalGold: 'hsl(38 92% 50%)',
    magicalGoldForeground: 'hsl(40 10% 10%)',
    
    // Dark theme optimized colors
    darkBackground: 'hsl(220 20% 8%)',
    darkCard: 'hsl(220 20% 12%)',
    darkBorder: 'hsl(217 32.6% 17.5%)',
    
    // Gradient definitions
    primaryGradient: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(45 85% 55%))',
    magicalGradient: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(var(--primary)), hsl(38 92% 50%))',
    backgroundGradient: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--primary) / 0.05))',
  },
  
  shadows: {
    magical: '0 10px 30px -10px hsl(38 92% 50% / 0.3)',
    glow: '0 0 40px hsl(38 82% 45% / 0.25)',
    epic: '0 20px 60px hsl(var(--primary) / 0.2), 0 0 40px hsl(38 92% 50% / 0.1)',
  },
  
  animations: {
    durations: {
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
      magical: '4s',
    },
    
    easings: {
      magical: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

/**
 * CSS Custom Property Utilities
 */
export const cssVars = {
  // Set CSS custom properties for magical effects
  setMagicalGlow: (intensity: number = 1) => ({
    '--magical-glow-intensity': intensity.toString(),
    '--magical-glow': `0 0 ${20 * intensity}px hsl(38 92% 50% / ${0.3 * intensity})`,
  }),
  
  setParticleCount: (count: number = 20) => ({
    '--particle-count': count.toString(),
  }),
  
  setAnimationSpeed: (speed: number = 1) => ({
    '--animation-speed': speed.toString(),
  }),
} as const;

/**
 * Responsive Design Utilities
 */
export const responsive = {
  // Container sizes for different breakpoints
  containers: {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-none',
  },
  
  // Grid configurations
  grids: {
    features: {
      default: 'grid-cols-1',
      md: 'md:grid-cols-2',
      lg: 'lg:grid-cols-3',
    },
    testimonials: {
      default: 'grid-cols-1',
      lg: 'lg:grid-cols-2',
      xl: 'xl:grid-cols-3',
    },
    pricing: {
      default: 'grid-cols-1',
      md: 'md:grid-cols-2',
      lg: 'lg:grid-cols-3',
    },
  },
  
  // Typography scales
  typography: {
    hero: {
      title: 'text-6xl md:text-7xl xl:text-8xl',
      subtitle: 'text-3xl md:text-4xl',
      description: 'text-xl md:text-2xl',
    },
    section: {
      title: 'text-4xl md:text-5xl',
      subtitle: 'text-xl md:text-2xl',
      description: 'text-lg md:text-xl',
    },
  },
} as const;

/**
 * Accessibility Utilities
 */
export const a11y = {
  // Reduced motion alternatives
  reducedMotion: {
    'prefers-reduced-motion': {
      animation: 'none',
      transition: 'none',
    },
  },
  
  // Focus styles
  focus: {
    ring: 'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
    visible: 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  },
  
  // Screen reader utilities
  srOnly: 'sr-only',
  notSrOnly: 'not-sr-only',
} as const;

/**
 * Performance Utilities
 */
export const performance = {
  // Will-change properties for animations
  willChange: {
    transform: 'will-change-transform',
    opacity: 'will-change-opacity',
    scroll: 'will-change-scroll-position',
  },
  
  // GPU acceleration
  gpu: {
    accelerate: 'transform-gpu',
    backfaceHidden: 'backface-visibility-hidden',
  },
} as const;

/**
 * Utility function to combine theme classes
 */
export const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Utility function to create magical glow effect
 */
export const createMagicalGlow = (intensity: number = 1, color: string = '38 92% 50%') => {
  return {
    boxShadow: `0 0 ${20 * intensity}px hsl(${color} / ${0.3 * intensity})`,
    filter: `drop-shadow(0 0 ${10 * intensity}px hsl(${color} / ${0.2 * intensity}))`,
  };
};

/**
 * Utility function to create responsive spacing
 */
export const responsiveSpacing = {
  section: 'py-12 md:py-16 lg:py-20',
  container: 'px-4 sm:px-6 lg:px-8',
  gap: 'gap-6 md:gap-8 lg:gap-12',
} as const;