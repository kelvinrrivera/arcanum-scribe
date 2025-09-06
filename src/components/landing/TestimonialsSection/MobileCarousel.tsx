import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeDetector, triggerHapticFeedback, ensureTouchTarget } from '@/lib/touch-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface MobileCarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  className?: string;
}

export const MobileCarousel: React.FC<MobileCarouselProps> = ({
  children,
  autoPlay = false,
  autoPlayInterval = 5000,
  showIndicators = true,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const containerRef = useRef<HTMLDivElement>(null);
  const swipeDetectorRef = useRef<SwipeDetector | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = children.length;

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
    triggerHapticFeedback('light');
  }, [totalItems]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
    triggerHapticFeedback('light');
  }, [totalItems]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    triggerHapticFeedback('medium');
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && totalItems > 1) {
      autoPlayTimerRef.current = setInterval(goToNext, autoPlayInterval);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, goToNext, autoPlayInterval, totalItems]);

  // Pause auto-play on user interaction
  const handleUserInteraction = useCallback(() => {
    setIsAutoPlaying(false);
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
  }, []);

  // Swipe detection setup
  useEffect(() => {
    if (containerRef.current) {
      swipeDetectorRef.current = new SwipeDetector(
        containerRef.current,
        (swipeEvent) => {
          handleUserInteraction();
          
          if (swipeEvent.direction === 'left') {
            goToNext();
          } else if (swipeEvent.direction === 'right') {
            goToPrevious();
          }
        }
      );
    }

    return () => {
      if (swipeDetectorRef.current) {
        swipeDetectorRef.current.destroy();
      }
    };
  }, [goToNext, goToPrevious, handleUserInteraction]);

  // Ensure touch targets meet accessibility requirements
  useEffect(() => {
    const navButtons = containerRef.current?.querySelectorAll('[data-carousel-nav]');
    navButtons?.forEach((button) => {
      if (button instanceof HTMLElement) {
        ensureTouchTarget(button);
      }
    });
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Main carousel container */}
      <div
        ref={containerRef}
        className="touch-carousel overflow-hidden rounded-lg"
        role="region"
        aria-label="Testimonials carousel"
        aria-live="polite"
      >
        <div 
          className="touch-carousel-container"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="touch-carousel-item"
              aria-hidden={index !== currentIndex}
            >
              <AnimatePresence mode="wait">
                {index === currentIndex && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {child}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {totalItems > 1 && (
        <>
          <button
            data-carousel-nav
            onClick={() => {
              handleUserInteraction();
              goToPrevious();
            }}
            className="touch-target absolute left-2 top-1/2 -translate-y-1/2 z-10 
                     bg-background/80 backdrop-blur-sm border border-border rounded-full
                     hover:bg-background/90 transition-all duration-200
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <button
            data-carousel-nav
            onClick={() => {
              handleUserInteraction();
              goToNext();
            }}
            className="touch-target absolute right-2 top-1/2 -translate-y-1/2 z-10
                     bg-background/80 backdrop-blur-sm border border-border rounded-full
                     hover:bg-background/90 transition-all duration-200
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </>
      )}

      {/* Swipe indicators */}
      {showIndicators && totalItems > 1 && (
        <div className="swipe-indicator">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                handleUserInteraction();
                goToSlide(index);
              }}
              className={`swipe-dot ${index === currentIndex ? 'active' : ''}`}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Swipe hint for first-time users */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                    text-xs text-muted-foreground opacity-60 md:hidden">
        Swipe to navigate
      </div>
    </div>
  );
};

export default MobileCarousel;