import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface ProgressStep {
  step: number;
  totalSteps: number;
  percentage: number;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
}

interface AdventureProgressProps {
  progress: ProgressStep | null;
  isVisible: boolean;
}

export const AdventureProgress: React.FC<AdventureProgressProps> = ({
  progress,
  isVisible,
}) => {
  if (!isVisible || !progress) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <Card className="max-w-md w-full mx-4 border-border">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-pulse">{progress.icon}</div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Crafting Adventure
              </h2>
              <p className="text-muted-foreground text-sm">
                Step {progress.step} of {progress.totalSteps}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full relative"
                >
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-shimmer" />
                </motion.div>
              </div>
            </div>

            {/* Current Step */}
            <div className="text-center">
              <motion.h3
                key={progress.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-foreground mb-3"
              >
                {progress.title}
              </motion.h3>
              <motion.p
                key={progress.description}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-sm leading-relaxed"
              >
                {progress.description}
              </motion.p>
            </div>

            {/* Completion indicator */}
            {progress.percentage === 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full border-2 border-primary">
                  <span className="text-2xl">✨</span>
                </div>
                <p className="text-primary text-sm mt-2 font-medium">
                  Adventure completed successfully!
                </p>
              </motion.div>
            )}

            {/* Cancel/Error handling */}
            {progress.step === -1 && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center justify-center text-destructive">
                  <span className="text-xl mr-2">⚠️</span>
                  <span className="text-sm">An error occurred</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};