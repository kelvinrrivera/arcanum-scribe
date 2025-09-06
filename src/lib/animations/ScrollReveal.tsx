/**
 * Scroll Reveal Component
 * Reveals content as it enters the viewport with customizable animations
 */

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { getOptimizedAnimationProps } from './performance';
import { scrollReveal, fadeInUp, fadeInLeft, fadeInRight, scaleIn } from './motion-variants';

export interface ScrollRevealProps extends Omit<MotionProps, 'ref'> {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  direction = 'up',
  delay = 0,
  threshold = 0.1,
  rootMargin = '0px 0px -100px 0px',
  triggerOnce = true,
  as: Component = 'div',
  ...motionProps
}) => {
  const { ref, shouldAnimate } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce,
    delay,
  });

  // Select animation based on direction
  const getVariants = () => {
    switch (direction) {
      case 'left':
        return fadeInLeft;
      case 'right':
        return fadeInRight;
      case 'scale':
        return scaleIn;
      case 'up':
      default:
        return scrollReveal;
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

export default ScrollReveal;