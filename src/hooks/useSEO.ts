import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  optimizePageForSEO, 
  monitorSEOMetrics, 
  validateSEOImplementation 
} from '@/lib/seo-optimization';
import { STRUCTURED_DATA } from '@/lib/structured-data';
import { SEO_CONFIGS } from '@/components/seo/SEOHead';

interface UseSEOOptions {
  enableOptimization?: boolean;
  enableMonitoring?: boolean;
  enableValidation?: boolean;
  customStructuredData?: object | object[];
}

export function useSEO(options: UseSEOOptions = {}) {
  const {
    enableOptimization = true,
    enableMonitoring = process.env.NODE_ENV === 'production',
    enableValidation = process.env.NODE_ENV === 'development',
    customStructuredData,
  } = options;

  const location = useLocation();

  useEffect(() => {
    // Determine page type from pathname
    const getPageType = (pathname: string) => {
      if (pathname === '/') return 'home';
      if (pathname === '/auth') return 'auth';
      if (pathname === '/pricing') return 'pricing';
      if (pathname.includes('waitlist')) return 'waitlist';
      if (pathname.includes('testimonials')) return 'testimonials';
      if (pathname.includes('about')) return 'about';
      return 'home'; // Default fallback
    };

    const pageType = getPageType(location.pathname);
    const seoConfig = SEO_CONFIGS[pageType as keyof typeof SEO_CONFIGS] || SEO_CONFIGS.home;
    const structuredData = customStructuredData || STRUCTURED_DATA[pageType as keyof typeof STRUCTURED_DATA]?.();

    // Optimize page for SEO
    if (enableOptimization) {
      optimizePageForSEO({
        enablePreloading: true,
        enableResourceHints: true,
        enableStructuredData: true,
        enableSocialMetaTags: true,
        title: seoConfig.title,
        description: seoConfig.description,
        image: '/images/og-image.jpg',
        url: location.pathname,
        structuredData,
      });
    }

    // Monitor SEO metrics
    if (enableMonitoring) {
      monitorSEOMetrics();
    }

    // Validate SEO implementation in development
    if (enableValidation) {
      setTimeout(() => {
        validateSEOImplementation();
      }, 1000);
    }

  }, [location.pathname, enableOptimization, enableMonitoring, enableValidation, customStructuredData]);

  // Return SEO utilities for manual use
  return {
    validateSEO: validateSEOImplementation,
    optimizePage: optimizePageForSEO,
    monitorMetrics: monitorSEOMetrics,
  };
}

// Hook for landing page specific SEO optimizations
export function useLandingPageSEO() {
  const location = useLocation();

  useEffect(() => {
    // Landing page specific optimizations
    if (location.pathname === '/') {
      // Preload critical hero images for LCP
      const heroImages = [
        '/images/hero/hero-bg-1920w.avif',
        '/images/hero/hero-bg-1536w.avif',
      ];

      heroImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.type = 'image/avif';
        link.href = src;
        document.head.appendChild(link);
      });

      // Add landing page specific structured data
      const landingPageData = STRUCTURED_DATA.home();
      if (landingPageData) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(landingPageData, null, 2);
        document.head.appendChild(script);
      }

      // Optimize for Core Web Vitals
      const style = document.createElement('style');
      style.textContent = `
        /* Critical CSS for LCP optimization */
        .hero-section {
          contain: layout style paint;
        }
        
        /* Prevent CLS for hero content */
        .hero-content {
          min-height: 60vh;
        }
        
        /* Optimize font loading */
        @font-face {
          font-family: 'Cinzel';
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }
  }, [location.pathname]);

  return useSEO({
    enableOptimization: true,
    enableMonitoring: true,
    enableValidation: process.env.NODE_ENV === 'development',
  });
}

export default useSEO;