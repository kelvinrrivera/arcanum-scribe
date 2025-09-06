import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Star, Dice6 } from 'lucide-react';

export interface CharacterTestimonial {
  id: string;
  characterName: string;
  characterClass: string;
  characterLevel: number;
  campaignName: string;
  testimonialText: string;
  rating: number;
  avatar: string;
  useCase: string;
  location: string;
  playTime: string;
}

export interface CharacterTestimonialCardProps {
  testimonial: CharacterTestimonial;
  isActive?: boolean;
  className?: string;
}

const cardVariants = {
  rest: {
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    y: 0,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    scale: 1.02,
    rotateX: 2,
    rotateY: 2,
    y: -5,
    boxShadow: '0 20px 60px rgba(56, 178, 172, 0.15), 0 0 40px rgba(251, 191, 36, 0.1)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const avatarVariants = {
  rest: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.05,
    rotate: [0, -2, 2, 0],
    transition: {
      duration: 0.6,
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

const RatingDisplay: React.FC<{ rating: number; useDice?: boolean }> = ({ 
  rating, 
  useDice = false 
}) => {
  const maxRating = 5;
  
  if (useDice) {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Dice6 
              className={`w-4 h-4 ${
                index < rating 
                  ? 'text-primary fill-primary/20' 
                  : 'text-muted-foreground/30'
              }`}
            />
          </motion.div>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating}/5 D20s
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Star 
            className={`w-4 h-4 ${
              index < rating 
                ? 'text-primary fill-primary' 
                : 'text-muted-foreground/30'
            }`}
          />
        </motion.div>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {rating}/5 stars
      </span>
    </div>
  );
};

export const CharacterTestimonialCard: React.FC<CharacterTestimonialCardProps> = ({
  testimonial,
  isActive = false,
  className = '',
}) => {
  const {
    characterName,
    characterClass,
    characterLevel,
    campaignName,
    testimonialText,
    rating,
    avatar,
    useCase,
    location,
    playTime
  } = testimonial;

  return (
    <motion.div
      className={`character-testimonial-card relative ${className}`}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      animate={isActive ? "hover" : "rest"}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Magical glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-xl"
        variants={glowVariants}
        style={{ zIndex: -1 }}
      />
      
      <Card className="magical-glow-border h-full bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-primary/30 overflow-hidden">
        <CardContent className="p-0 h-full">
          {/* Character Sheet Header */}
          <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 p-4 border-b border-primary/20">
            <div className="flex items-center gap-4">
              {/* Character Avatar */}
              <motion.div
                className="relative"
                variants={avatarVariants}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 p-1 magical-glow">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-background to-muted overflow-hidden">
                    {avatar ? (
                      <OptimizedImage
                        src={avatar}
                        alt={characterName}
                        className="w-full h-full object-cover"
                        width={64}
                        height={64}
                        lazy={false}
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                        {characterName.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                {/* Level indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {characterLevel}
                </div>
              </motion.div>

              {/* Character Info */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {characterName}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {characterClass}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Level {characterLevel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Campaign: <span className="text-accent font-medium">{campaignName}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial Content */}
          <div className="p-6">
            {/* Use Case Badge */}
            <div className="mb-4">
              <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">
                📜 {useCase}
              </Badge>
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-foreground mb-4 leading-relaxed">
              <span className="text-primary text-lg">"</span>
              {testimonialText}
              <span className="text-primary text-lg">"</span>
            </blockquote>

            {/* Rating */}
            <div className="mb-4">
              <RatingDisplay rating={rating} useDice={true} />
            </div>

            {/* Additional Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
              <span className="flex items-center gap-1">
                🗺️ {location}
              </span>
              <span className="flex items-center gap-1">
                ⏰ {playTime}
              </span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-accent/40 rounded-full animate-pulse delay-1000"></div>
        </CardContent>
      </Card>
    </motion.div>
  );
};