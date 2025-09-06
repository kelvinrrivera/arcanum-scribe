/**
 * Mobile-First Layout System
 * Implements progressive enhancement for larger screen experiences
 */

export interface LayoutBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export const BREAKPOINTS: LayoutBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

/**
 * Get current screen size category
 */
export function getScreenSize(): ScreenSize {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  if (width < BREAKPOINTS.desktop) return 'desktop';
  return 'wide';
}

/**
 * Mobile-first content hierarchy configuration
 */
export interface ContentHierarchy {
  mobile: {
    sections: string[];
    priority: 'essential' | 'important' | 'optional';
  };
  tablet: {
    sections: string[];
    priority: 'essential' | 'important' | 'optional';
  };
  desktop: {
    sections: string[];
    priority: 'essential' | 'important' | 'optional';
  };
  wide: {
    sections: string[];
    priority: 'essential' | 'important' | 'optional';
  };
}

export const LANDING_PAGE_HIERARCHY: ContentHierarchy = {
  mobile: {
    sections: ['hero', 'features-core', 'testimonials', 'cta-primary'],
    priority: 'essential',
  },
  tablet: {
    sections: ['hero', 'features-core', 'testimonials', 'pricing', 'cta-primary'],
    priority: 'important',
  },
  desktop: {
    sections: ['hero', 'features-core', 'testimonials', 'pricing', 'cta-primary'],
    priority: 'optional',
  },
  wide: {
    sections: ['hero', 'features-core', 'testimonials', 'pricing', 'cta-primary'],
    priority: 'optional',
  },
};

/**
 * Mobile-specific navigation patterns
 */
export interface MobileNavigation {
  type: 'hamburger' | 'bottom-tabs' | 'slide-out';
  items: NavigationItem[];
  collapsible: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  priority: 'high' | 'medium' | 'low';
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export const MOBILE_NAVIGATION: MobileNavigation = {
  type: 'hamburger',
  collapsible: true,
  items: [
    { label: 'Home', href: '#hero', priority: 'high' },
    { label: 'Features', href: '#features', priority: 'high' },
    { label: 'Beta Access', href: '#beta', priority: 'high', mobileOnly: true },
    { label: 'Pricing', href: '#pricing', priority: 'medium' },
    { label: 'About', href: '#about', priority: 'low', desktopOnly: true },
    { label: 'Contact', href: '#contact', priority: 'low', desktopOnly: true },
  ],
};

/**
 * Typography scaling for mobile readability
 */
export interface TypographyScale {
  mobile: {
    h1: string;
    h2: string;
    h3: string;
    body: string;
    small: string;
  };
  tablet: {
    h1: string;
    h2: string;
    h3: string;
    body: string;
    small: string;
  };
  desktop: {
    h1: string;
    h2: string;
    h3: string;
    body: string;
    small: string;
  };
}

export const TYPOGRAPHY_SCALE: TypographyScale = {
  mobile: {
    h1: 'clamp(1.75rem, 5vw, 2.5rem)',
    h2: 'clamp(1.5rem, 4vw, 2rem)',
    h3: 'clamp(1.25rem, 3vw, 1.5rem)',
    body: '16px',
    small: '14px',
  },
  tablet: {
    h1: 'clamp(2rem, 4vw, 3rem)',
    h2: 'clamp(1.75rem, 3vw, 2.25rem)',
    h3: 'clamp(1.5rem, 2.5vw, 1.75rem)',
    body: '16px',
    small: '14px',
  },
  desktop: {
    h1: 'clamp(2.5rem, 3vw, 4rem)',
    h2: 'clamp(2rem, 2.5vw, 3rem)',
    h3: 'clamp(1.75rem, 2vw, 2.25rem)',
    body: '18px',
    small: '16px',
  },
};

/**
 * Spacing system for mobile-first design
 */
export interface SpacingScale {
  mobile: {
    section: string;
    container: string;
    element: string;
  };
  tablet: {
    section: string;
    container: string;
    element: string;
  };
  desktop: {
    section: string;
    container: string;
    element: string;
  };
}

export const SPACING_SCALE: SpacingScale = {
  mobile: {
    section: '3rem 1rem',
    container: '0 1rem',
    element: '1rem',
  },
  tablet: {
    section: '4rem 2rem',
    container: '0 2rem',
    element: '1.5rem',
  },
  desktop: {
    section: '6rem 3rem',
    container: '0 3rem',
    element: '2rem',
  },
};

/**
 * Progressive enhancement utilities
 */
export function getResponsiveClasses(
  mobileClass: string,
  tabletClass?: string,
  desktopClass?: string
): string {
  const classes = [mobileClass];
  
  if (tabletClass) {
    classes.push(`md:${tabletClass}`);
  }
  
  if (desktopClass) {
    classes.push(`lg:${desktopClass}`);
  }
  
  return classes.join(' ');
}

/**
 * Content prioritization based on screen size
 */
export function shouldShowContent(
  contentType: string,
  screenSize: ScreenSize,
  priority: 'essential' | 'important' | 'optional' = 'important'
): boolean {
  const hierarchy = LANDING_PAGE_HIERARCHY[screenSize];
  
  // Safety check for undefined hierarchy
  if (!hierarchy) {
    console.warn(`Unknown screen size: ${screenSize}, defaulting to desktop`);
    return shouldShowContent(contentType, 'desktop', priority);
  }
  
  if (priority === 'essential') {
    return true; // Always show essential content
  }
  
  if (screenSize === 'mobile' && priority === 'optional') {
    return false; // Hide optional content on mobile
  }
  
  return hierarchy.sections.includes(contentType);
}

/**
 * Mobile-specific interaction patterns
 */
export interface InteractionPattern {
  type: 'tap' | 'swipe' | 'long-press' | 'pinch';
  element: string;
  action: string;
  feedback: 'haptic' | 'visual' | 'audio';
}

export const MOBILE_INTERACTIONS: InteractionPattern[] = [
  {
    type: 'tap',
    element: 'feature-card',
    action: 'expand',
    feedback: 'haptic',
  },
  {
    type: 'swipe',
    element: 'carousel',
    action: 'navigate',
    feedback: 'haptic',
  },
  {
    type: 'long-press',
    element: 'cta-button',
    action: 'preview',
    feedback: 'visual',
  },
  {
    type: 'pinch',
    element: 'image',
    action: 'zoom',
    feedback: 'visual',
  },
];

/**
 * Performance optimization for mobile
 */
export interface PerformanceConfig {
  lazyLoading: boolean;
  imageOptimization: boolean;
  animationReduction: boolean;
  prefetchCritical: boolean;
}

export function getMobilePerformanceConfig(screenSize: ScreenSize): PerformanceConfig {
  return {
    lazyLoading: screenSize === 'mobile',
    imageOptimization: true,
    animationReduction: screenSize === 'mobile',
    prefetchCritical: screenSize !== 'mobile',
  };
}

/**
 * Accessibility enhancements for mobile
 */
export interface AccessibilityConfig {
  touchTargetSize: number;
  contrastRatio: number;
  fontSize: number;
  focusIndicators: boolean;
}

export function getMobileAccessibilityConfig(): AccessibilityConfig {
  return {
    touchTargetSize: 44, // Minimum 44px for touch targets
    contrastRatio: 4.5, // WCAG AA compliance
    fontSize: 16, // Prevents zoom on iOS
    focusIndicators: true,
  };
}

/**
 * Layout utilities
 */
export class MobileLayoutManager {
  private screenSize: ScreenSize = 'desktop';
  private listeners: Array<(size: ScreenSize) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.screenSize = getScreenSize();
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  private handleResize(): void {
    const newSize = getScreenSize();
    if (newSize !== this.screenSize) {
      this.screenSize = newSize;
      this.listeners.forEach(listener => listener(newSize));
    }
  }

  public getCurrentSize(): ScreenSize {
    return this.screenSize;
  }

  public onSizeChange(callback: (size: ScreenSize) => void): () => void {
    this.listeners.push(callback);
    
    // Return cleanup function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public isMobile(): boolean {
    return this.screenSize === 'mobile';
  }

  public isTablet(): boolean {
    return this.screenSize === 'tablet';
  }

  public isDesktop(): boolean {
    return this.screenSize === 'desktop' || this.screenSize === 'wide';
  }

  public getTypography(): TypographyScale[ScreenSize] {
    return TYPOGRAPHY_SCALE[this.screenSize];
  }

  public getSpacing(): SpacingScale[ScreenSize] {
    return SPACING_SCALE[this.screenSize];
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize.bind(this));
    }
    this.listeners = [];
  }
}

// Singleton instance
let layoutManager: MobileLayoutManager | null = null;

export function getMobileLayoutManager(): MobileLayoutManager {
  if (!layoutManager) {
    layoutManager = new MobileLayoutManager();
  }
  return layoutManager;
}