import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { CharacterTestimonialCard, CharacterTestimonial } from './CharacterTestimonialCard';

export interface TestimonialCarouselProps {
  testimonials: CharacterTestimonial[];
  autoRotate?: boolean;
  autoRotateInterval?: number;
  className?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  autoRotate = true,
  autoRotateInterval = 5000,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoRotate);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      if (newDirection === 1) {
        return prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1;
      } else {
        return prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1;
      }
    });
  }, [testimonials.length]);

  const goToSlide = useCallback((index: number) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setDirection(newDirection);
    setCurrentIndex(index);
  }, [currentIndex]);

  const nextSlide = useCallback(() => paginate(1), [paginate]);
  const prevSlide = useCallback(() => paginate(-1), [paginate]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(!isAutoPlaying);
  }, [isAutoPlaying]);

  // Auto-rotation logic
  useEffect(() => {
    if (isAutoPlaying && !isPaused && testimonials.length > 1) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, autoRotateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, isPaused, nextSlide, autoRotateInterval, testimonials.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextSlide();
          break;
        case ' ':
          event.preventDefault();
          toggleAutoPlay();
          break;
        case 'Home':
          event.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          event.preventDefault();
          goToSlide(testimonials.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide, toggleAutoPlay, goToSlide, testimonials.length]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (testimonials.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No testimonials available
      </div>
    );
  }

  return (
    <div 
      className={`testimonial-carousel relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Character testimonials carousel"
    >
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="w-full"
          >
            <CharacterTestimonialCard
              testimonial={testimonials[currentIndex]}
              isActive={true}
              className="w-full max-w-2xl mx-auto"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={prevSlide}
          className="magical-glow-border bg-background/80 backdrop-blur-sm hover:bg-primary/10"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary scale-125 magical-glow'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={nextSlide}
          className="magical-glow-border bg-background/80 backdrop-blur-sm hover:bg-primary/10"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Auto-play Control */}
      {testimonials.length > 1 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoPlay}
            className="text-xs text-muted-foreground hover:text-foreground"
            aria-label={isAutoPlaying ? "Pause auto-rotation" : "Start auto-rotation"}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Play
              </>
            )}
          </Button>
        </div>
      )}

      {/* Progress Indicator */}
      {isAutoPlaying && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: autoRotateInterval / 1000, ease: "linear" }}
            key={currentIndex}
          />
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground">
          Use arrow keys to navigate • Space to pause • Swipe on mobile
        </p>
      </div>
    </div>
  );
};