/**
 * Staggered List Component
 * Animates list items with staggered timing for smooth sequential reveals
 */

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useStaggeredAnimation } from '@/hooks/useScrollAnimation';
import { getOptimizedAnimationProps, staggerConfig } from './performance';
import { fadeInUp, staggerContainer } from './motion-variants';

export interface StaggeredListProps extends Omit<MotionProps, 'ref'> {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerType?: keyof typeof staggerConfig;
  itemVariant?: 'fadeInUp' | 'custom';
  as?: keyof JSX.IntrinsicElements;
  itemAs?: keyof JSX.IntrinsicElements;
}

const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className,
  itemClassName,
  staggerType = 'standard',
  itemVariant = 'fadeInUp',
  as: Component = 'div',
  itemAs: ItemComponent = 'div',
  ...motionProps
}) => {
  const { ref, visibleItems, shouldAnimate } = useStaggeredAnimation(
    children.length,
    staggerConfig[staggerType].staggerChildren * 1000
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: staggerConfig[staggerType],
    },
  };

  const itemVariants = itemVariant === 'fadeInUp' ? fadeInUp : motionProps.variants;

  const containerProps = getOptimizedAnimationProps({
    ref,
    className,
    variants: containerVariants,
    initial: 'hidden',
    animate: shouldAnimate ? 'visible' : 'hidden',
    ...motionProps,
  });

  const MotionContainer = motion[Component as keyof typeof motion] as any;
  const MotionItem = motion[ItemComponent as keyof typeof motion] as any;

  return (
    <MotionContainer {...containerProps}>
      {children.map((child, index) => (
        <MotionItem
          key={index}
          className={itemClassName}
          variants={itemVariants}
          initial="hidden"
          animate={visibleItems.includes(index) ? 'visible' : 'hidden'}
        >
          {child}
        </MotionItem>
      ))}
    </MotionContainer>
  );
};

export default StaggeredList;