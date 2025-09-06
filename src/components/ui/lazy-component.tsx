import React, { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  className?: string;
  minHeight?: string;
}

// Generic lazy loading wrapper
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackComponent?: React.ComponentType
) {
  const LazyComponent = lazy(importFn);
  
  return function WrappedLazyComponent(props: React.ComponentProps<T> & LazyComponentProps) {
    const { fallback, className, minHeight = '200px', ...componentProps } = props;
    
    const defaultFallback = fallbackComponent ? (
      React.createElement(fallbackComponent, componentProps)
    ) : (
      <div className={className} style={{ minHeight }}>
        <Skeleton className="w-full h-full" />
      </div>
    );

    return (
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...componentProps} />
      </Suspense>
    );
  };
}

// Intersection Observer based lazy loading
interface IntersectionLazyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: string;
}

export function IntersectionLazy({
  children,
  fallback,
  rootMargin = '100px',
  threshold = 0.1,
  className,
  minHeight = '200px',
}: IntersectionLazyProps) {
  const [isInView, setIsInView] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const defaultFallback = (
    <div className={className} style={{ minHeight }}>
      <Skeleton className="w-full h-full" />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {isInView ? children : (fallback || defaultFallback)}
    </div>
  );
}

// Preload critical components
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  // Preload the component module
  importFn().catch(() => {
    // Silently fail if preload fails
  });
}

// Performance-optimized image preloader
export function preloadImages(urls: string[]) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Critical resource hints
export function addResourceHints() {
  // DNS prefetch for external resources
  const dnsPrefetchUrls = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  dnsPrefetchUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  });

  // Preconnect to critical origins
  const preconnectUrls = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  preconnectUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}