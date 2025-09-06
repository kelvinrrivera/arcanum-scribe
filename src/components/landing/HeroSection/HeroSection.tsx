import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from './AnimatedBackground';
import { HeroContent } from './HeroContent';
import { CTAButtons } from './CTAButtons';
import { staggerContainer, fadeInUp } from '@/lib/animations/motion-variants';
import { getOptimizedAnimationProps } from '@/lib/animations/performance';
import { getMobileLayoutManager } from '@/lib/mobile-layout';

export interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const layoutManager = getMobileLayoutManager();
    setIsMobile(layoutManager.isMobile());
    
    const cleanup = layoutManager.onSizeChange((size) => {
      setIsMobile(size === 'mobile');
    });
    
    return cleanup;
  }, []);

  const animationProps = getOptimizedAnimationProps({
    variants: staggerContainer,
    initial: 'hidden',
    animate: 'visible',
  });

  return (
    <section 
      id="hero"
      className={`relative ${isMobile ? 'min-h-[100svh]' : 'min-h-screen'} flex items-center justify-center overflow-hidden mobile-section ${className || ''}`}
    >
      <AnimatedBackground />
      <div className={`container mx-auto ${isMobile ? 'mobile-container' : 'px-4'} py-8 relative z-10`}>
        <motion.div 
          className={`text-center ${isMobile ? 'space-y-8 py-12' : 'space-y-12 py-20'}`}
          {...animationProps}
        >
          <motion.div variants={fadeInUp}>
            <HeroContent />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <CTAButtons />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};