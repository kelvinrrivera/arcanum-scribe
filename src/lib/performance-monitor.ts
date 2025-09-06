// Core Web Vitals monitoring and performance optimization

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

interface PerformanceConfig {
  enableLogging: boolean;
  enableAnalytics: boolean;
  thresholds: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private config: PerformanceConfig;
  private observer?: PerformanceObserver;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableAnalytics: false,
      thresholds: {
        lcp: 2500, // 2.5s
        fid: 100,  // 100ms
        cls: 0.1,  // 0.1
      },
      ...config,
    };

    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();

    // Monitor resource loading
    this.observeResourceTiming();

    // Monitor long tasks
    this.observeLongTasks();
  }

  private observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      this.metrics.lcp = lastEntry.startTime;
      this.logMetric('LCP', lastEntry.startTime, this.config.thresholds.lcp);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private observeFID() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
        this.logMetric('FID', this.metrics.fid, this.config.thresholds.fid);
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  private observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (sessionValue && 
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            this.metrics.cls = clsValue;
            this.logMetric('CLS', clsValue, this.config.thresholds.cls);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  private observeFCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          this.logMetric('FCP', entry.startTime, 1800); // 1.8s threshold
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  private observeTTFB() {
    if (typeof window === 'undefined') return;

    const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
    if (navigationEntry) {
      this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      this.logMetric('TTFB', this.metrics.ttfb, 800); // 800ms threshold
    }
  }

  private observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        // Log slow resources
        if (entry.duration > 1000) {
          console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private observeLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.warn(`Long task detected: ${entry.duration}ms`);
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  private logMetric(name: string, value: number, threshold: number) {
    if (!this.config.enableLogging) return;

    const status = value <= threshold ? '✅' : '⚠️';
    const color = value <= threshold ? 'color: green' : 'color: orange';
    
    console.log(
      `%c${status} ${name}: ${Math.round(value)}ms (threshold: ${threshold}ms)`,
      color
    );

    // Send to analytics if enabled
    if (this.config.enableAnalytics) {
      this.sendToAnalytics(name, value, threshold);
    }
  }

  private sendToAnalytics(metric: string, value: number, threshold: number) {
    // Integration with Google Analytics 4 or other analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        metric_name: metric,
        metric_value: Math.round(value),
        metric_threshold: threshold,
        is_good: value <= threshold,
        page_path: window.location.pathname,
        user_agent: navigator.userAgent,
      });
    }
    
    // Send to custom analytics endpoint if available
    if (this.config.enableAnalytics) {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          value: Math.round(value),
          threshold,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail if analytics endpoint is not available
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public generateReport(): string {
    const report = Object.entries(this.metrics)
      .map(([key, value]) => `${key.toUpperCase()}: ${Math.round(value || 0)}ms`)
      .join('\n');
    
    return `Performance Report:\n${report}`;
  }

  public disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function initializePerformanceMonitoring(config?: Partial<PerformanceConfig>) {
  if (typeof window === 'undefined') return null;
  
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor(config);
  }
  
  return performanceMonitor;
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return performanceMonitor?.getMetrics() || {};
}

// Resource hints for critical resources
export function addResourceHints() {
  if (typeof document === 'undefined') return;

  const hints = [
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  ];

  hints.forEach(({ rel, href, crossOrigin }) => {
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

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof document === 'undefined') return;

  const criticalResources = [
    '/images/hero/hero-bg.webp',
    '/images/hero/hero-bg.avif',
  ];

  criticalResources.forEach(href => {
    const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
    }
  });
}

// Optimize images based on connection speed
export function getOptimalImageQuality(): number {
  if (typeof navigator === 'undefined') return 85;

  const connection = (navigator as any).connection;
  if (!connection) return 85;

  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 60;
    case '3g':
      return 75;
    case '4g':
    default:
      return 85;
  }
}

// Defer non-critical JavaScript for better FCP and LCP
export function deferNonCriticalJS() {
  if (typeof document === 'undefined') return;

  // Defer analytics and other non-critical scripts
  const scripts = document.querySelectorAll('script[data-defer="true"]');
  scripts.forEach(script => {
    const newScript = document.createElement('script');
    newScript.src = script.getAttribute('src') || '';
    newScript.async = true;
    newScript.loading = 'lazy';
    document.body.appendChild(newScript);
  });
  
  // Defer third-party widgets
  const deferredWidgets = [
    'twitter-wjs',
    'facebook-jssdk',
    'google-analytics',
  ];
  
  deferredWidgets.forEach(widgetId => {
    const widget = document.getElementById(widgetId);
    if (widget && !widget.hasAttribute('data-deferred')) {
      widget.setAttribute('data-deferred', 'true');
      // Move to end of body to defer execution
      document.body.appendChild(widget);
    }
  });
}

// Critical resource loading optimization
export function optimizeCriticalResourceLoading() {
  if (typeof document === 'undefined') return;
  
  // Preload critical fonts to prevent CLS
  const criticalFonts = [
    // Add font URLs when available
  ];
  
  criticalFonts.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = fontUrl;
    document.head.appendChild(link);
  });
  
  // Optimize image loading for LCP
  const heroImages = document.querySelectorAll('[data-hero-image]');
  heroImages.forEach(img => {
    if (img instanceof HTMLImageElement) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
      img.decoding = 'sync';
    }
  });
}

// Monitor and report performance issues
export function setupPerformanceReporting() {
  if (typeof window === 'undefined') return;
  
  // Report long tasks that could affect INP
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn(`Long task detected: ${entry.duration}ms`, entry);
          
          // Report to analytics
          if (typeof gtag !== 'undefined') {
            gtag('event', 'long_task', {
              task_duration: Math.round(entry.duration),
              task_name: entry.name,
            });
          }
        }
      });
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  }
  
  // Monitor memory usage
  if ('memory' in performance) {
    const memoryInfo = (performance as any).memory;
    if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.9) {
      console.warn('High memory usage detected', memoryInfo);
    }
  }
}

export default PerformanceMonitor;