import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  demoComponent?: React.ComponentType;
  magicalEffect?: 'glow' | 'float' | 'pulse' | 'shimmer';
  className?: string;
}

const cardVariants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    scale: 1.02,
    y: -8,
    boxShadow: '0 20px 60px rgba(56, 178, 172, 0.2), 0 0 40px rgba(251, 191, 36, 0.1)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const iconVariants = {
  rest: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const contentVariants = {
  rest: {
    opacity: 1,
    height: 'auto',
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const glowVariants = {
  rest: {
    opacity: 0,
    scale: 0.8,
  },
  hover: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  features,
  demoComponent: DemoComponent,
  magicalEffect = 'glow',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleShowDemo = () => {
    setShowDemo(!showDemo);
  };

  return (
    <motion.div
      className={`feature-card relative ${className}`}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"

    >
      {/* Magical glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-xl"
        variants={glowVariants}
        style={{ zIndex: -1 }}
      />
      
      <Card className="magical-glow-border h-full bg-gradient-to-br from-card/90 to-card/60 border-primary/20">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Icon and Title */}
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              className={`p-3 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 ${
                magicalEffect === 'pulse' ? 'magical-pulse' : ''
              } ${magicalEffect === 'float' ? 'magical-float' : ''}`}
              variants={iconVariants}
            >
              {icon}
            </motion.div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-2 ${
                magicalEffect === 'shimmer' ? 'magical-text' : ''
              }`}>
                {title}
              </h3>
              <Badge variant="secondary" className="text-xs">
                ✨ AI-Powered
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-4 flex-1">
            {description}
          </p>

          {/* Features List */}
          <motion.div
            className="space-y-2 mb-4"
            variants={contentVariants}
            animate={isExpanded ? 'expanded' : 'rest'}
          >
            {features.slice(0, isExpanded ? features.length : 2).map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                {feature}
              </motion.div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            {features.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                className="flex-1 text-xs"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Show More
                  </>
                )}
              </Button>
            )}
            
            {DemoComponent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowDemo}
                className="flex-1 text-xs spell-cast-button"
              >
                🎲 Try Demo
              </Button>
            )}
          </div>

          {/* Demo Component */}
          {showDemo && DemoComponent && (
            <motion.div
              className="mt-4 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DemoComponent />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};