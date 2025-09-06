import React, { useEffect, useState } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import { AnimationPerformanceMonitor, injectReducedMotionStyles } from '@/lib/animations';
import { getMobileLayoutManager, shouldShowContent, getMobilePerformanceConfig } from '@/lib/mobile-layout';
import { optimizeScrollPerformance } from '@/lib/touch-utils';

export interface LandingPageProps {
  className?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ className }) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop' | 'wide'>('desktop');
  const [performanceConfig, setPerformanceConfig] = useState(getMobilePerformanceConfig('desktop'));

  useEffect(() => {
    // Initialize mobile layout manager
    const layoutManager = getMobileLayoutManager();
    setScreenSize(layoutManager.getCurrentSize());
    setPerformanceConfig(getMobilePerformanceConfig(layoutManager.getCurrentSize()));
    
    // Listen for screen size changes
    const cleanup = layoutManager.onSizeChange((size) => {
      setScreenSize(size);
      setPerformanceConfig(getMobilePerformanceConfig(size));
    });
    
    // Initialize animation performance monitoring
    const monitor = AnimationPerformanceMonitor.getInstance();
    monitor.startMonitoring();
    
    // Inject reduced motion styles
    injectReducedMotionStyles();
    
    // Optimize scroll performance for mobile
    optimizeScrollPerformance();
    
    return cleanup;
  }, []);

  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';

  return (
    <div className={`min-h-screen mobile-scroll-snap ${className || ''}`}>
      <Navigation />
      <div className="bg-gradient-to-br from-background via-background/95 to-primary/10 relative overflow-hidden">
        {/* Magical Background Elements - Reduced on mobile for performance */}
        {!performanceConfig.animationReduction && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-1 h-1 bg-accent/40 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-primary/20 rounded-full animate-pulse delay-2000"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/30 rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-20 right-10 w-2 h-2 bg-primary/25 rounded-full animate-pulse delay-1500"></div>
          </div>
        )}

        <main className="relative z-10">
          {/* Hero Section - Always shown */}
          <HeroSection />
          
          {/* Features Section - Progressive enhancement */}
          {shouldShowContent('features-core', screenSize) && (
            <FeaturesSection />
          )}
          
          {/* Testimonials/Beta Section - Important content */}
          {shouldShowContent('testimonials', screenSize, 'important') && (
            <TestimonialsSection />
          )}
          
          {/* CTA Section - Essential on mobile, enhanced on desktop */}
          {shouldShowContent('cta-primary', screenSize, 'essential') && (
            <CTASection />
          )}
        </main>
      </div>
      <Footer />
      
      {/* Mobile-specific bottom padding for bottom navigation */}
      {isMobile && <div className="h-20"></div>}
    </div>
  );
};

export default LandingPage;