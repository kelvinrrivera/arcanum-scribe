/**
 * Framer Motion Animation Variants for Landing Page
 * Provides reusable animation configurations optimized for performance
 */

import { Variants } from 'framer-motion';

// Fade animations
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Scale animations
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const scaleInSpring: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

// Magical effects
export const magicalAppear: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateY: -15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const spellCast: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    rotateX: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.7,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
};

// Stagger animations for containers
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerSlow: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

// Hover animations
export const hoverScale: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const hoverGlow: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 0 0px rgba(56, 178, 172, 0)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 40px rgba(56, 178, 172, 0.3)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const hoverFloat: Variants = {
  rest: {
    y: 0,
  },
  hover: {
    y: -8,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Scroll-triggered animations
export const scrollReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 100,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const scrollSlideIn: Variants = {
  hidden: {
    opacity: 0,
    x: -100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Parallax effect
export const parallaxSlow: Variants = {
  hidden: {
    y: 0,
  },
  visible: {
    y: -50,
    transition: {
      duration: 1,
      ease: 'linear',
    },
  },
};

export const parallaxFast: Variants = {
  hidden: {
    y: 0,
  },
  visible: {
    y: -100,
    transition: {
      duration: 1,
      ease: 'linear',
    },
  },
};

// D20 dice animation
export const d20Roll: Variants = {
  hidden: {
    opacity: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  },
  visible: {
    opacity: 1,
    rotateX: [0, 360, 720],
    rotateY: [0, 180, 360],
    rotateZ: [0, 90, 180],
    transition: {
      duration: 2,
      ease: [0.4, 0, 0.2, 1],
      times: [0, 0.5, 1],
    },
  },
};

// Magical particle effects
export const particleFloat: Variants = {
  hidden: {
    opacity: 0,
    y: 100,
    x: 0,
  },
  visible: {
    opacity: [0, 1, 1, 0],
    y: -100,
    x: [0, 20, -10, 30],
    transition: {
      duration: 4,
      ease: 'linear',
      repeat: Infinity,
      repeatDelay: Math.random() * 2,
    },
  },
};

// Text animations
export const typewriter: Variants = {
  hidden: {
    width: 0,
  },
  visible: {
    width: 'auto',
    transition: {
      duration: 2,
      ease: 'linear',
    },
  },
};

export const textShimmer: Variants = {
  hidden: {
    backgroundPosition: '0% 50%',
  },
  visible: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 3,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// Page transitions
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};