import { createLazyComponent, preloadComponent } from '@/components/ui/lazy-component';

// Lazy load heavy landing page sections with optimized loading
export const LazyFeaturesSection = createLazyComponent(
  () => import('./FeaturesSection/FeaturesSection').then(module => ({ default: module.FeaturesSection })),
);

export const LazyTestimonialsSection = createLazyComponent(
  () => import('./TestimonialsSection/TestimonialsSection').then(module => ({ default: module.TestimonialsSection })),
);

export const LazyPricingSection = createLazyComponent(
  () => import('./PricingSection/PricingSection').then(module => ({ default: module.PricingSection })),
);

export const LazyCTASection = createLazyComponent(
  () => import('./CTASection/CTASection').then(module => ({ default: module.CTASection })),
);

// Lazy load footer with lower priority
export const LazyFooter = createLazyComponent(
  () => import('./Footer/Footer').then(module => ({ default: module.Footer })),
);

// Code splitting for heavy interactive components
export const LazyAnimatedBackground = createLazyComponent(
  () => import('./HeroSection/AnimatedBackground').then(module => ({ default: module.AnimatedBackground })),
);

// Preload strategy based on user interaction patterns
export function preloadCriticalSections() {
  // Immediate preload for above-the-fold content
  preloadComponent(() => import('./FeaturesSection/FeaturesSection').then(module => ({ default: module.FeaturesSection })));
  
  // Preload based on scroll position
  let hasPreloadedTestimonials = false;
  let hasPreloadedPricing = false;
  
  const handleScroll = () => {
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    // Preload testimonials when user scrolls 25%
    if (scrollPercent > 25 && !hasPreloadedTestimonials) {
      hasPreloadedTestimonials = true;
      preloadComponent(() => import('./TestimonialsSection/TestimonialsSection').then(module => ({ default: module.TestimonialsSection })));
    }
    
    // Preload pricing when user scrolls 50%
    if (scrollPercent > 50 && !hasPreloadedPricing) {
      hasPreloadedPricing = true;
      preloadComponent(() => import('./PricingSection/PricingSection').then(module => ({ default: module.PricingSection })));
    }
    
    // Remove listener when all sections are preloaded
    if (hasPreloadedTestimonials && hasPreloadedPricing) {
      window.removeEventListener('scroll', handleScroll);
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Preload on user interaction (hover, click, touch)
  const preloadOnInteraction = () => {
    preloadComponent(() => import('./TestimonialsSection/TestimonialsSection').then(module => ({ default: module.TestimonialsSection })));
    preloadComponent(() => import('./PricingSection/PricingSection').then(module => ({ default: module.PricingSection })));
    preloadComponent(() => import('./CTASection/CTASection').then(module => ({ default: module.CTASection })));
    
    // Remove listeners after first interaction
    ['mouseenter', 'touchstart', 'click'].forEach(event => {
      document.removeEventListener(event, preloadOnInteraction);
    });
  };
  
  ['mouseenter', 'touchstart', 'click'].forEach(event => {
    document.addEventListener(event, preloadOnInteraction, { once: true, passive: true });
  });
}

// Intelligent preloading based on connection speed
export function adaptivePreloading() {
  const connection = (navigator as any).connection;
  
  if (!connection) {
    // Default preloading for unknown connections
    preloadCriticalSections();
    return;
  }
  
  const { effectiveType, saveData } = connection;
  
  // Respect user's data saving preference
  if (saveData) {
    console.log('Data saver mode detected, skipping preloading');
    return;
  }
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      // Minimal preloading for slow connections
      setTimeout(() => {
        preloadComponent(() => import('./FeaturesSection/FeaturesSection').then(module => ({ default: module.FeaturesSection })));
      }, 2000);
      break;
      
    case '3g':
      // Moderate preloading for 3G
      preloadComponent(() => import('./FeaturesSection/FeaturesSection').then(module => ({ default: module.FeaturesSection })));
      setTimeout(() => {
        preloadComponent(() => import('./TestimonialsSection/TestimonialsSection').then(module => ({ default: module.TestimonialsSection })));
      }, 1500);
      break;
      
    case '4g':
    default:
      // Aggressive preloading for fast connections
      preloadCriticalSections();
      break;
  }
}

// Bundle analysis helper
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    console.group('📦 Landing Page Bundle Analysis');
    
    // Analyze individual section loading times
    const analyzeSection = (name: string, importFn: () => Promise<any>) => {
      const start = performance.now();
      importFn().then(() => {
        const loadTime = performance.now() - start;
        console.log(`${name}: ${loadTime.toFixed(2)}ms`);
      }).catch(() => {
        console.log(`${name}: Failed to load`);
      });
    };
    
    analyzeSection('FeaturesSection', () => import('./FeaturesSection/FeaturesSection'));
    analyzeSection('TestimonialsSection', () => import('./TestimonialsSection/TestimonialsSection'));
    analyzeSection('PricingSection', () => import('./PricingSection/PricingSection'));
    analyzeSection('CTASection', () => import('./CTASection/CTASection'));
    analyzeSection('Footer', () => import('./Footer/Footer'));
    
    console.groupEnd();
  }
}