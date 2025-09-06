import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  lazy?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  lazy = true,
  sizes = '100vw',
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  aspectRatio,
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized source URLs with responsive breakpoints
  const generateSources = (baseSrc: string) => {
    const baseUrl = baseSrc.startsWith('/') ? baseSrc : `/${baseSrc}`;
    const pathParts = baseUrl.split('.');
    const extension = pathParts.pop();
    const basePath = pathParts.join('.');
    
    return {
      avif: `${basePath}.avif`,
      webp: `${basePath}.webp`,
      fallback: baseUrl,
    };
  };

  // Generate responsive breakpoints for srcSet
  const generateResponsiveSources = (baseSrc: string, format: string) => {
    if (!width) return baseSrc;
    
    const breakpoints = [320, 480, 768, 1024, 1280, 1536, 1920];
    const pathParts = baseSrc.split('.');
    pathParts.pop(); // Remove extension
    const basePath = pathParts.join('.');
    
    return breakpoints
      .filter(bp => bp <= (width * 2)) // Only include relevant breakpoints
      .map(bp => `${basePath}-${bp}w.${format} ${bp}w`)
      .join(', ');
  };

  const sources = generateSources(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback srcSet generation for simple cases
  const generateSrcSet = (url: string) => {
    if (!width) return url;
    
    const breakpoints = [480, 768, 1024, 1280, 1536];
    return breakpoints
      .filter(bp => bp <= width * 2)
      .map(bp => `${url}?w=${bp} ${bp}w`)
      .join(', ');
  };

  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-muted animate-pulse',
          className
        )}
        style={{ width, height }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'bg-muted flex items-center justify-center text-muted-foreground text-sm',
          className
        )}
        style={{ width, height }}
      >
        Failed to load image
      </div>
    );
  }

  const containerStyle = {
    ...(aspectRatio && { aspectRatio }),
    ...(width && height && !aspectRatio && { width, height }),
  };

  return (
    <picture className={cn('block', className)} style={containerStyle}>
      {/* AVIF format for modern browsers with responsive sources */}
      <source
        srcSet={generateResponsiveSources(sources.avif, 'avif') || generateSrcSet(sources.avif)}
        sizes={sizes}
        type="image/avif"
      />
      
      {/* WebP format for broader support with responsive sources */}
      <source
        srcSet={generateResponsiveSources(sources.webp, 'webp') || generateSrcSet(sources.webp)}
        sizes={sizes}
        type="image/webp"
      />
      
      {/* Fallback image */}
      <img
        ref={imgRef}
        src={sources.fallback}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          objectFit && `object-${objectFit}`,
          className
        )}
        style={{
          ...(placeholder === 'blur' && blurDataURL && !isLoaded && {
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }),
          ...(aspectRatio && { width: '100%', height: '100%' }),
        }}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
      />
    </picture>
  );
}

// Hero background component with optimized loading
interface HeroBackgroundProps {
  className?: string;
  priority?: boolean;
}

export function HeroBackground({ className, priority = true }: HeroBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <picture>
        {/* AVIF with responsive breakpoints */}
        <source
          srcSet="/images/hero/hero-bg-320w.avif 320w,
                  /images/hero/hero-bg-768w.avif 768w,
                  /images/hero/hero-bg-1024w.avif 1024w,
                  /images/hero/hero-bg-1536w.avif 1536w,
                  /images/hero/hero-bg-1920w.avif 1920w"
          sizes="100vw"
          type="image/avif"
        />
        
        {/* WebP with responsive breakpoints */}
        <source
          srcSet="/images/hero/hero-bg-320w.webp 320w,
                  /images/hero/hero-bg-768w.webp 768w,
                  /images/hero/hero-bg-1024w.webp 1024w,
                  /images/hero/hero-bg-1536w.webp 1536w,
                  /images/hero/hero-bg-1920w.webp 1920w"
          sizes="100vw"
          type="image/webp"
        />
        
        {/* Fallback JPEG */}
        <img
          src="/images/hero/hero-bg-1920w.jpg"
          alt="Magical D&D adventure background with floating dice and mystical effects"
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
        />
      </picture>
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 animate-pulse" />
      )}
      
      {/* Magical overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      
      {/* Animated magical particles overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-primary/40 rounded-full animate-ping" />
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

// Preload critical hero images
export function preloadHeroImages() {
  const criticalImages = [
    '/images/hero/hero-bg-1920w.avif',
    '/images/hero/hero-bg-1536w.avif',
    '/images/hero/hero-bg-1024w.avif',
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.type = 'image/avif';
    document.head.appendChild(link);
  });
}