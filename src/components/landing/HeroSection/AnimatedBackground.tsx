import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getOptimizedAnimationProps } from '@/lib/animations/performance';

export interface AnimatedBackgroundProps {
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

interface D20Dice {
  id: number;
  x: number;
  y: number;
  size: number;
  rotationSpeed: number;
  floatSpeed: number;
  initialRotation: number;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const diceRef = useRef<D20Dice[]>([]);

  // Initialize particles and dice
  useEffect(() => {
    const initializeParticles = () => {
      const particles: Particle[] = [];
      const particleCount = window.innerWidth < 768 ? 30 : 50;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.6 + 0.2,
          color: Math.random() > 0.5 ? 'hsl(38, 92%, 50%)' : 'hsl(var(--primary))',
        });
      }
      
      particlesRef.current = particles;
    };

    const initializeDice = () => {
      const dice: D20Dice[] = [];
      const diceCount = window.innerWidth < 768 ? 3 : 6;
      
      for (let i = 0; i < diceCount; i++) {
        dice.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 40 + 20,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          floatSpeed: Math.random() * 0.3 + 0.1,
          initialRotation: Math.random() * Math.PI * 2,
        });
      }
      
      diceRef.current = dice;
    };

    initializeParticles();
    initializeDice();

    const handleResize = () => {
      initializeParticles();
      initializeDice();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016; // ~60fps

      // Animate particles
      particlesRef.current.forEach((particle) => {
        // Update particle position
        particle.y -= particle.speed;
        particle.x += Math.sin(time + particle.id) * 0.5;

        // Reset particle when it goes off screen
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity * (0.8 + 0.2 * Math.sin(time * 2 + particle.id));
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.restore();
      });

      // Animate D20 dice
      diceRef.current.forEach((dice) => {
        // Update dice position (floating motion)
        dice.y += Math.sin(time * dice.floatSpeed + dice.id) * 0.5;
        dice.x += Math.cos(time * dice.floatSpeed * 0.7 + dice.id) * 0.3;

        // Keep dice within bounds
        if (dice.x < -dice.size) dice.x = canvas.width + dice.size;
        if (dice.x > canvas.width + dice.size) dice.x = -dice.size;
        if (dice.y < -dice.size) dice.y = canvas.height + dice.size;
        if (dice.y > canvas.height + dice.size) dice.y = -dice.size;

        // Draw D20 dice (simplified geometric representation)
        ctx.save();
        ctx.translate(dice.x, dice.y);
        ctx.rotate(dice.initialRotation + time * dice.rotationSpeed);
        
        // Draw dice as a diamond shape with subtle magical glow
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = 'hsl(38, 92%, 50%, 0.3)';
        ctx.fillStyle = 'hsl(38, 92%, 50%, 0.05)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'hsl(38, 92%, 50%, 0.4)';
        
        const size = dice.size;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.7, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Add inner lines for D20 effect
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.moveTo(-size * 0.7, 0);
        ctx.lineTo(size * 0.7, 0);
        ctx.stroke();
        
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Static D20 dice for CSS-based animation fallback
  const staticDice = Array.from({ length: 6 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute d20-float"
      style={{
        left: `${15 + i * 15}%`,
        top: `${20 + (i % 2) * 30}%`,
        fontSize: `${20 + i * 5}px`,
      }}
      {...getOptimizedAnimationProps({
        initial: { opacity: 0, scale: 0 },
        animate: { 
          opacity: 0.1, 
          scale: 1,
          rotate: [0, 360],
        },
        transition: { 
          duration: 8 + i * 2, 
          repeat: Infinity, 
          ease: "linear",
          delay: i * 0.5,
        },
      })}
    >
      <div className="text-primary/15 select-none">⚀</div>
    </motion.div>
  ));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ''}`}>
      {/* Canvas for advanced animations */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Fallback CSS animations for reduced motion or canvas issues */}
      <div className="absolute inset-0">
        {staticDice}
      </div>
      
      {/* Gradient background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-primary/2 to-transparent" />
      
      {/* Parallax layers */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 20% 80%, hsl(38 92% 50% / 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.1) 0%, transparent 50%)',
        }}
        {...getOptimizedAnimationProps({
          animate: {
            backgroundPosition: ['0% 0%', '100% 100%'],
          },
          transition: {
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          },
        })}
      />
    </div>
  );
};