/**
 * Animation utilities and configurations for the landing page
 * Provides a comprehensive animation system with performance optimizations
 */

export * from './motion-variants';
export * from './performance';
export * from './reduced-motion';

// Re-export commonly used Framer Motion components with optimizations
export { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';

// Custom animation components
export { default as AnimatedSection } from './AnimatedSection';
export { default as ScrollReveal } from './ScrollReveal';
export { default as StaggeredList } from './StaggeredList';
export { default as ParallaxElement } from './ParallaxElement';