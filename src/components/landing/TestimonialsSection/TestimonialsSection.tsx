import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '@/lib/animations/ScrollReveal';
import AnimatedSection from '@/lib/animations/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Users, Zap, Shield } from 'lucide-react';
import MobileCarousel from './MobileCarousel';
import { optimizeScrollPerformance, isMobileDevice } from '@/lib/touch-utils';

export interface TestimonialsSectionProps {
  className?: string;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ className }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Optimize scroll performance for mobile
    optimizeScrollPerformance();
    
    // Detect mobile device
    setIsMobile(isMobileDevice());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would integrate with your email service
      console.log('Waitlist signup:', email);
      setIsSubmitted(true);
      setEmail('');
    }
  };

  return (
    <AnimatedSection 
      id="beta-section" 
      className={`py-20 bg-gradient-to-br from-accent/5 to-primary/5 relative overflow-hidden ${className || ''}`}
      variant="stagger"
      viewport="early"
    >
      {/* Background magical elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-accent/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-primary/15 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-accent/25 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-10 w-1.5 h-1.5 bg-primary/20 rounded-full animate-pulse delay-1500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal direction="up" className="text-center space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              🧪 Closed Beta
            </Badge>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            🔮 Join the Inner Circle
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            Be among the first Game Masters to experience the future of D&D content creation. 
            Our closed beta is crafting the next generation of AI-powered storytelling tools.
          </motion.p>
        </ScrollReveal>
        
        {/* Beta Features Grid */}
        {isMobile ? (
          <MobileCarousel
            autoPlay={true}
            autoPlayInterval={4000}
            showIndicators={true}
            className="mb-12"
          >
            {[
              <Card key="early-access" className="magical-glow-border bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Early Access</h3>
                  <p className="text-sm text-muted-foreground">
                    First to experience cutting-edge AI features
                  </p>
                </CardContent>
              </Card>,
              <Card key="direct-feedback" className="magical-glow-border bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Direct Feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Shape the future with your input
                  </p>
                </CardContent>
              </Card>,
              <Card key="exclusive-benefits" className="magical-glow-border bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Exclusive Benefits</h3>
                  <p className="text-sm text-muted-foreground">
                    Special pricing and lifetime perks
                  </p>
                </CardContent>
              </Card>,
              <Card key="community" className="magical-glow-border bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6 text-center">
                  <Mail className="w-8 h-8 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with fellow beta testers
                  </p>
                </CardContent>
              </Card>
            ]}
          </MobileCarousel>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card className="magical-glow-border bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Early Access</h3>
                <p className="text-sm text-muted-foreground">
                  First to experience cutting-edge AI features
                </p>
              </CardContent>
            </Card>

            <Card className="magical-glow-border bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Direct Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Shape the future with your input
                </p>
              </CardContent>
            </Card>

            <Card className="magical-glow-border bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Exclusive Benefits</h3>
                <p className="text-sm text-muted-foreground">
                  Special pricing and lifetime perks
                </p>
              </CardContent>
            </Card>

            <Card className="magical-glow-border bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with fellow beta testers
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Waitlist Form */}
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="magical-glow-border bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-primary/30">
            <CardContent className="p-8">
              {!isSubmitted ? (
                <>
                  <h3 className="text-xl font-bold text-center mb-4">
                    Request Beta Access
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    Join the waitlist to be notified when we open new beta slots
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`magical-glow-border ${isMobile ? 'mobile-cta-button' : ''}`}
                      style={{ fontSize: '16px' }} // Prevents zoom on iOS
                    />
                    <Button 
                      type="submit" 
                      className={`w-full spell-cast-button bg-gradient-to-r from-primary to-accent text-primary-foreground ${
                        isMobile ? 'mobile-cta-button' : ''
                      }`}
                    >
                      🎲 Join the Waitlist
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    No spam, just updates on beta access and launch news
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">You're on the list!</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll notify you as soon as beta slots become available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Development Status */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className="text-sm text-muted-foreground">
            Currently in development • Expected beta launch Q2 2025
          </p>
        </motion.div>
      </div>
    </AnimatedSection>
  );
};