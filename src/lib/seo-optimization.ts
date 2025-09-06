// SEO optimization utilities for landing page performance

interface SEOOptimizationConfig {
  enablePreloading: boolean;
  enableResourceHints: boolean;
  enableStructuredData: boolean;
  enableSocialMetaTags: boolean;
}

// Critical resource preloading for SEO performance
export function preloadCriticalSEOResources() {
  if (typeof document === 'undefined') return;

  const criticalResources = [
    // Hero images for LCP optimization
    { href: '/images/hero/hero-bg-1920w.avif', as: 'image', type: 'image/avif' },
    { href: '/images/hero/hero-bg-1536w.avif', as: 'image', type: 'image/avif' },
    
    // Critical fonts for CLS prevention
    // Add font URLs when available
  ];

  criticalResources.forEach(({ href, as, type }) => {
    const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      if (as === 'font') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
}

// Add comprehensive resource hints for external domains
export function addSEOResourceHints() {
  if (typeof document === 'undefined') return;

  const resourceHints = [
    // DNS prefetch for external resources
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
    
    // Preconnect for critical external resources
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  ];

  resourceHints.forEach(({ rel, href, crossOrigin }) => {
    const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      document.head.appendChild(link);
    }
  });
}

// Optimize meta tags for social sharing
export function optimizeSocialMetaTags(config: {
  title: string;
  description: string;
  image: string;
  url: string;
}) {
  if (typeof document === 'undefined') return;

  const { title, description, image, url } = config;
  
  // Ensure absolute URLs
  const absoluteImage = image.startsWith('http') ? image : `https://arcanumscribe.com${image}`;
  const absoluteUrl = url.startsWith('http') ? url : `https://arcanumscribe.com${url}`;

  const metaTags = [
    // Open Graph
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: absoluteImage },
    { property: 'og:url', content: absoluteUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Arcanum Scribe' },
    { property: 'og:locale', content: 'en_US' },
    
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: absoluteImage },
    
    // Additional social platforms
    { property: 'article:author', content: 'Arcanum Scribe Team' },
    { property: 'article:section', content: 'Technology' },
    { property: 'article:tag', content: 'AI, D&D, RPG, Beta, Adventure Generator' },
  ];

  metaTags.forEach(({ property, name, content }) => {
    const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      if (property) meta.setAttribute('property', property);
      if (name) meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  });
}

// Add structured data to page
export function addStructuredData(data: object | object[]) {
  if (typeof document === 'undefined') return;

  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(Array.isArray(data) ? data : [data], null, 2);
  document.head.appendChild(script);
}

// Optimize page for Core Web Vitals and SEO
export function optimizePageForSEO(config: SEOOptimizationConfig & {
  title: string;
  description: string;
  image: string;
  url: string;
  structuredData?: object | object[];
}) {
  const {
    enablePreloading,
    enableResourceHints,
    enableStructuredData,
    enableSocialMetaTags,
    title,
    description,
    image,
    url,
    structuredData,
  } = config;

  // Preload critical resources for performance
  if (enablePreloading) {
    preloadCriticalSEOResources();
  }

  // Add resource hints for external domains
  if (enableResourceHints) {
    addSEOResourceHints();
  }

  // Optimize social media meta tags
  if (enableSocialMetaTags) {
    optimizeSocialMetaTags({ title, description, image, url });
  }

  // Add structured data
  if (enableStructuredData && structuredData) {
    addStructuredData(structuredData);
  }
}

// Monitor SEO performance metrics
export function monitorSEOMetrics() {
  if (typeof window === 'undefined') return;

  // Monitor page load performance for SEO
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstByte: navigation.responseStart - navigation.requestStart,
        };

        // Log performance metrics for SEO analysis
        console.group('📊 SEO Performance Metrics');
        console.log('DOM Content Loaded:', `${metrics.domContentLoaded}ms`);
        console.log('Load Complete:', `${metrics.loadComplete}ms`);
        console.log('Time to First Byte:', `${metrics.firstByte}ms`);
        console.groupEnd();

        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
          gtag('event', 'seo_performance', {
            dom_content_loaded: Math.round(metrics.domContentLoaded),
            load_complete: Math.round(metrics.loadComplete),
            time_to_first_byte: Math.round(metrics.firstByte),
          });
        }
      }
    }, 1000);
  });

  // Monitor image loading for LCP optimization
  const images = document.querySelectorAll('img[data-hero-image]');
  images.forEach(img => {
    img.addEventListener('load', () => {
      console.log('🖼️ Hero image loaded:', img.getAttribute('src'));
    });
  });
}

// Validate SEO implementation
export function validateSEOImplementation() {
  if (typeof document === 'undefined') return;

  const checks = {
    hasTitle: !!document.title,
    hasDescription: !!document.querySelector('meta[name="description"]'),
    hasCanonical: !!document.querySelector('link[rel="canonical"]'),
    hasOGImage: !!document.querySelector('meta[property="og:image"]'),
    hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
    hasViewport: !!document.querySelector('meta[name="viewport"]'),
    hasLangAttribute: !!document.documentElement.lang,
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  console.group('🔍 SEO Implementation Check');
  console.log(`✅ Passed: ${passed}/${total} checks`);
  
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check}`);
  });
  
  if (passed < total) {
    console.warn('⚠️ Some SEO optimizations are missing');
  }
  
  console.groupEnd();

  return { passed, total, checks };
}

export default {
  preloadCriticalSEOResources,
  addSEOResourceHints,
  optimizeSocialMetaTags,
  addStructuredData,
  optimizePageForSEO,
  monitorSEOMetrics,
  validateSEOImplementation,
};