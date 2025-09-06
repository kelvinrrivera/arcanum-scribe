import React from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '@/lib/animations/ScrollReveal';
import AnimatedSection from '@/lib/animations/AnimatedSection';
import { FeatureCard } from './FeatureCard';
// import { AdventureDemo, NPCDemo, MonsterDemo } from './DemoComponents'; // Temporarily disabled to avoid false expectations
import { 
  ScrollIcon, 
  DiceIcon, 
  WandIcon, 
  CrystalIcon, 
  BookIcon, 
  ShieldIcon, 
  DragonIcon, 
  MapIcon 
} from './DDIcons';
import { 
  ScrollAnimationSystem, 
  StaggeredContainer, 
  AnimatedItem,
  ParallaxBackground 
} from './ScrollAnimationSystem';

export interface FeaturesSectionProps {
  className?: string;
}

const featuresData = [
  {
    icon: <ScrollIcon className="w-6 h-6 text-primary" />,
    title: "Epic D&D 5e Adventure Generator",
    description: "Create complete, playable D&D 5e adventures with rich narratives, balanced encounters, and memorable NPCs in minutes.",
    features: [
      "Complete D&D 5e adventures (3-5 scenes)",
      "Balanced encounter design with CR calculations",
      "Rich narrative descriptions",
      "Read-aloud text for GMs",
      "Multiple difficulty options",
      "Custom D&D 5e setting integration"
    ],
    // demoComponent: AdventureDemo, // Disabled temporarily
    magicalEffect: 'glow' as const
  },
  {
    icon: <DragonIcon className="w-6 h-6 text-primary" />,
    title: "D&D 5e Creature Forge",
    description: "Forge unique D&D 5e monsters and NPCs with complete stat blocks, tactical abilities, and compelling backstories.",
    features: [
      "Complete D&D 5e stat blocks",
      "Tactical combat abilities",
      "Rich personality traits",
      "Balanced CR calculations",
      "Custom artwork prompts",
      "Voice and mannerism details"
    ],
    // demoComponent: MonsterDemo, // Disabled temporarily
    magicalEffect: 'pulse' as const
  },
  {
    icon: <WandIcon className="w-6 h-6 text-primary" />,
    title: "D&D 5e Character Weaver",
    description: "Breathe life into memorable D&D 5e NPCs with detailed personalities, motivations, and dialogue samples.",
    features: [
      "Detailed personality profiles",
      "Compelling backstories",
      "Dialogue samples",
      "Relationship dynamics",
      "Character arc suggestions",
      "Voice acting guidance"
    ],
    // demoComponent: NPCDemo, // Disabled temporarily
    magicalEffect: 'shimmer' as const
  },
  {
    icon: <CrystalIcon className="w-6 h-6 text-primary" />,
    title: "Magic Item Artificer",
    description: "Craft legendary artifacts and magical items with unique properties and rich histories.",
    features: [
      "Unique magical properties",
      "Rich item histories",
      "Balanced mechanics",
      "Curse and blessing options",
      "Attunement requirements",
      "Discovery scenarios"
    ],
    magicalEffect: 'float' as const
  },
  {
    icon: <MapIcon className="w-6 h-6 text-primary" />,
    title: "World Builder",
    description: "Design entire realms with interconnected locations, political intrigue, and living ecosystems.",
    features: [
      "Interconnected locations",
      "Political systems",
      "Economic networks",
      "Cultural details",
      "Historical timelines",
      "Random encounter tables"
    ],
    magicalEffect: 'glow' as const
  },
  {
    icon: <BookIcon className="w-6 h-6 text-primary" />,
    title: "Lore Keeper",
    description: "Generate rich histories, mythologies, and cultural details that bring your world to life.",
    features: [
      "Historical timelines",
      "Mythological systems",
      "Cultural traditions",
      "Language elements",
      "Religious pantheons",
      "Legendary figures"
    ],
    magicalEffect: 'pulse' as const
  }
];

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className }) => {
  return (
    <ScrollAnimationSystem>
      <AnimatedSection 
        id="features-section" 
        className={`py-20 relative ${className || ''}`}
        variant="stagger"
        viewport="early"
      >
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center space-y-4 mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-display font-bold magical-text"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              🔮 Powers of Creation
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              Wield the ancient arts of storytelling, enhanced by the most powerful AI magic ever conceived. 
              Each tool is crafted to transform your imagination into legendary adventures.
            </motion.p>
          </ScrollReveal>
          
          <StaggeredContainer 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            staggerDelay={120}
          >
            {featuresData.map((feature, index) => (
              <AnimatedItem
                key={index}
                index={index}
                animationType={index % 2 === 0 ? 'magical' : 'fadeUp'}
                className="h-full"
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  features={feature.features}
                  // demoComponent={feature.demoComponent} // Disabled temporarily
                  magicalEffect={feature.magicalEffect}
                  className="h-full"
                />
              </AnimatedItem>
            ))}
          </StaggeredContainer>

          {/* Call to Action with enhanced animations */}
          <AnimatedItem 
            index={featuresData.length} 
            animationType="scale"
            className="text-center mt-16"
          >
            <motion.div 
              className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 magical-glow-border relative overflow-hidden"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 60px rgba(56, 178, 172, 0.15), 0 0 40px rgba(251, 191, 36, 0.1)"
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary/30 rounded-full"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 2) * 40}%`,
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              <motion.h3 
                className="text-2xl font-bold mb-4 magical-text relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Ready to Master the Art of Creation?
              </motion.h3>
              <motion.p 
                className="text-muted-foreground mb-6 max-w-2xl mx-auto relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Experience the future of AI-enhanced storytelling. 
                Your next legendary campaign awaits.
              </motion.p>
              <motion.button
                className="spell-cast-button px-8 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                ✨ Begin Your Journey
              </motion.button>
            </motion.div>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </ScrollAnimationSystem>
  );
};