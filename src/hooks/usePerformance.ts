import { useEffect } from 'react';
import { 
  initializePerformanceMonitoring, 
  addResourceHints, 
  preloadCriticalResources,
  deferNonCriticalJS,
  optimizeCriticalResourceLoading,
  setupPerformanceReporting
} from '@/lib/performance-monitor';
import { registerServiceWorker } from '@/lib/service-worker';
import { adaptivePreloading } from '@/components/landing/lazy-sections';

interface UsePerformanceOptions {
  enableServiceWorker?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableResourceHints?: boolean;
  preloadResources?: boolean;
  enableCodeSplitting?: boolean;
  enableCriticalResourceOptimization?: boolean;
  enablePerformanceReporting?: boolean;
}

export function usePerformance(options: UsePerformanceOptions = {}) {
  const {
    enableServiceWorker = true,
    enablePerformanceMonitoring = true,
    enableResourceHints = true,
    preloadResources = true,
    enableCodeSplitting = true,
    enableCriticalResourceOptimization = true,
    enablePerformanceReporting = true,
  } = options;

  useEffect(() => {
    // Initialize performance monitoring with Core Web Vitals tracking
    if (enablePerformanceMonitoring) {
      initializePerformanceMonitoring({
        enableLogging: process.env.NODE_ENV === 'development',
        enableAnalytics: process.env.NODE_ENV === 'production',
        thresholds: {
          lcp: 2500, // 2.5s for good LCP
          fid: 100,  // 100ms for good FID
          cls: 0.1,  // 0.1 for good CLS
        },
      });
    }

    // Register service worker with enhanced caching
    if (enableServiceWorker) {
      registerServiceWorker({
        enabled: true,
        showUpdatePrompt: process.env.NODE_ENV === 'production',
        updateInterval: 300000, // Check for updates every 5 minutes
      });
    }

    // Add resource hints for critical external resources
    if (enableResourceHints) {
      addResourceHints();
    }

    // Optimize critical resource loading for LCP and CLS
    if (enableCriticalResourceOptimization) {
      optimizeCriticalResourceLoading();
    }

    // Preload critical resources based on connection speed
    if (preloadResources) {
      preloadCriticalResources();
      
      // Use adaptive preloading for landing page sections
      if (enableCodeSplitting) {
        adaptivePreloading();
      }
    }

    // Set up performance issue reporting
    if (enablePerformanceReporting) {
      setupPerformanceReporting();
    }

    // Defer non-critical JavaScript to improve initial load performance
    const deferTimeout = setTimeout(() => {
      deferNonCriticalJS();
    }, 3000); // Defer after 3 seconds

    return () => {
      clearTimeout(deferTimeout);
    };
  }, [
    enableServiceWorker, 
    enablePerformanceMonitoring, 
    enableResourceHints, 
    preloadResources,
    enableCodeSplitting,
    enableCriticalResourceOptimization,
    enablePerformanceReporting
  ]);
}