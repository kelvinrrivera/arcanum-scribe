/**
 * Parallax Element Component
 * Creates smooth parallax scrolling effects with performance optimizations
 */

import React from 'react';
import { motion, MotionProps, useScroll, useTransform } from 'framer-motion';
import { useParallaxScroll } from '@/hooks/useScrollAnimation';
import { getOptimizedAnimationProps } from './performance';

export interface ParallaxElementProps extends Omit<MotionProps, 'ref'> {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  as?: keyof JSX.IntrinsicElements;
}

const ParallaxElement: React.FC<ParallaxElementProps> = ({
  children,
  className,
  speed = 0.5,
  direction = 'up',
  as: Component = 'div',
  ...motionProps
}) => {
  const { ref, offsetY } = useParallaxScroll(speed);

  // Calculate transform based on direction
  const getTransform = () => {
    switch (direction) {
      case 'down':
        return `translateY(${offsetY}px)`;
      case 'left':
        return `translateX(${-offsetY}px)`;
      case 'right':
        return `translateX(${offsetY}px)`;
      case 'up':
      default:
        return `translateY(${-offsetY}px)`;
    }
  };

  const animationProps = getOptimizedAnimationProps({
    ref,
    className,
    style: {
      transform: getTransform(),
      ...motionProps.style,
    },
    ...motionProps,
  });

  const MotionComponent = motion[Component as keyof typeof motion] as any;

  return (
    <MotionComponent {...animationProps}>
      {children}
    </MotionComponent>
  );
};

export default ParallaxElement;