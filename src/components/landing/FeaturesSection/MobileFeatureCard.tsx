import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createTouchHover, triggerHapticFeedback } from '@/lib/touch-utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface MobileFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  expandedContent?: React.ReactNode;
  demoComponent?: React.ReactNode;
  className?: string;
}

export const MobileFeatureCard: React.FC<MobileFeatureCardProps> = ({
  icon,
  title,
  description,
  expandedContent,
  demoComponent,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Setup touch hover effects
  useEffect(() => {
    if (cardRef.current) {
      createTouchHover(cardRef.current);
    }
  }, []);

  const handleCardTap = () => {
    setIsExpanded(!isExpanded);
    triggerHapticFeedback('medium');
    
    // Scroll card into view when expanded
    if (!isExpanded && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  };

  const handleDemoTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDemo(!showDemo);
    triggerHapticFeedback('light');
  };

  return (
    <motion.div
      ref={cardRef}
      className={`mobile-feature-card touch-hover ${isExpanded ? 'expanded' : ''} ${className}`}
      onClick={handleCardTap}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`${title} feature card`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardTap();
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Card Header */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <motion.div
          className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 
                   flex items-center justify-center text-primary"
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          {icon}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="mobile-subheading font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="mobile-body text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Expand indicator */}
        <motion.div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/50 
                   flex items-center justify-center text-muted-foreground"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border">
              {/* Additional content */}
              {expandedContent && (
                <div className="mb-4 text-sm text-muted-foreground">
                  {expandedContent}
                </div>
              )}

              {/* Demo component */}
              {demoComponent && (
                <div className="space-y-3">
                  <button
                    onClick={handleDemoTap}
                    className="mobile-cta-button w-full bg-primary/10 text-primary 
                             border border-primary/20 hover:bg-primary/20 
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {showDemo ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Hide Demo
                      </>
                    ) : (
                      <>
                        ✨ Try Demo
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {showDemo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                          {demoComponent}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHapticFeedback('light');
                    // Handle learn more action
                  }}
                  className="flex-1 mobile-cta-button bg-transparent text-primary 
                           border border-primary/30 hover:bg-primary/10
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Learn More
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHapticFeedback('medium');
                    // Handle try now action
                  }}
                  className="flex-1 mobile-cta-button bg-primary text-primary-foreground
                           hover:bg-primary/90 focus-visible:outline-none 
                           focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Try Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Touch feedback overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-primary/5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

export default MobileFeatureCard;