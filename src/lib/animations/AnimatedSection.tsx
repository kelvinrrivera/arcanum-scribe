/**
 * Animated Section Component
 * Provides scroll-triggered animations for page sections
 */

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { getOptimizedAnimationProps, viewportConfig } from './performance';
import { fadeInUp, staggerContainer } from './motion-variants';

export interface AnimatedSectionProps extends Omit<MotionProps, 'ref'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'fadeInUp' | 'stagger' | 'custom';
  delay?: number;
  stagger?: boolean;
  viewport?: keyof typeof viewportConfig;
  as?: keyof JSX.IntrinsicElements;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  variant = 'fadeInUp',
  delay = 0,
  stagger = false,
  viewport = 'standard',
  as: Component = 'section',
  ...motionProps
}) => {
  const { ref, shouldAnimate } = useScrollAnimation({
    ...viewportConfig[viewport],
    delay,
  });

  // Select animation variant
  const getVariants = () => {
    switch (variant) {
      case 'stagger':
        return staggerContainer;
      case 'fadeInUp':
        return fadeInUp;
      case 'custom':
        return motionProps.variants;
      default:
        return fadeInUp;
    }
  };

  const animationProps = getOptimizedAnimationProps({
    ref,
    className,
    variants: getVariants(),
    initial: 'hidden',
    animate: shouldAnimate ? 'visible' : 'hidden',
    ...motionProps,
  });

  const MotionComponent = motion[Component as keyof typeof motion] as any;

  return (
    <MotionComponent {...animationProps}>
      {children}
    </MotionComponent>
  );
};

export default AnimatedSection;