/**
 * DEMO COMPONENTS - TEMPORARILY DISABLED
 * 
 * These demo components have been disabled to avoid:
 * 1. Creating false expectations about features not yet aligned with the real dashboard
 * 2. Unnecessary AI token consumption without guaranteed ROI
 * 
 * They can be re-enabled once the actual dashboard features are ready
 * and properly aligned with these demonstrations.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Zap } from 'lucide-react';

// Typewriter effect hook
const useTypewriter = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    setDisplayText('');
    setIsComplete(false);
    let i = 0;
    
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
};

// Adventure Generation Demo
export const AdventureDemo: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState('');
  const [thinkingPhase, setThinkingPhase] = useState(0);

  const prompts = [
    "A mysterious tavern where time flows differently...",
    "Ancient ruins hiding a forgotten civilization...",
    "A dragon's hoard with a peculiar guardian...",
    "A festival that only appears during eclipses...",
    "A library where books write themselves...",
  ];

  const thinkingSteps = [
    "Analyzing narrative themes...",
    "Generating encounter balance...",
    "Creating memorable NPCs...",
    "Crafting plot hooks...",
    "Finalizing adventure structure..."
  ];

  const results = [
    `**The Temporal Tavern**
    
*"Welcome, travelers, to the Hourglass Inn - where every moment matters, and some last forever."*

**Hook:** The party seeks shelter during a storm and discovers a tavern where each room exists in a different time period.

**Scene 1 - The Common Room (Present)**
The barkeep, Chronos Brewmaster (Ancient Wizard), serves drinks that age decades in seconds. Patrons from different eras mingle awkwardly.

**Scene 2 - The Past Wing**
A room frozen 100 years ago holds the ghost of a murdered noble who knows the location of a lost treasure.

**Scene 3 - The Future Chamber**
A glimpse of what's to come reveals the party's destiny, but changing it requires a terrible sacrifice.

**Encounters:**
- Temporal Anomalies (CR 2)
- Time-Lost Assassin (CR 4)
- Chronos Brewmaster (CR 6)`,
    
    `**The Sunken Spires of Aethermoor**
    
*"Crystalline towers pierce through jungle canopy, humming with residual magic that makes the very air shimmer."*

**Hook:** Ancient maps lead to ruins of the Skywright civilization, masters of aerial magic.

**Scene 1 - The Approach**
Floating stone platforms require careful navigation. Crystal Guardians (CR 3) patrol the perimeter.

**Scene 2 - The Archive Chamber**
Gravity-defying puzzles protect knowledge of flight magic. Solve riddles to unlock the Skywright's secrets.

**Scene 3 - The Apex Spire**
The Skywright Lich (CR 8) offers a bargain: serve as his agents in exchange for the power of flight.

**Treasure:**
- Wings of the Skywright (Legendary)
- Levitation Crystals (x3)
- Aerial Navigation Charts`,
    
    `**The Librarian's Hoard**
    
*"Books flutter like birds around mountains of gold, organizing themselves by ancient systems only the dragon understands."*

**Hook:** Rumors speak of a dragon who hoards knowledge instead of gold, seeking the rarest tale of all.

**Scene 1 - The Reading Room**
Sentient books (CR 1/2) test visitors with riddles. Each correct answer grants access deeper into the hoard.

**Scene 2 - The Story Vaults**
Trapped souls within books tell their tales. Free them to gain allies, or leave them to avoid the dragon's wrath.

**Scene 3 - The Dragon's Study**
Bibliotheca the Ancient (CR 12) seeks the "Story That Ends All Stories" - a tale so perfect it would complete her collection.

**Unique Mechanics:**
- Story-telling skill challenges
- Books as living NPCs
- Knowledge as currency`,

    `**The Eclipse Festival**
    
*"Once every seven years, when the moon devours the sun, the Shadowfair materializes in the town square."*

**Hook:** A festival that exists only during eclipses brings wonders and terrors from the Shadowfell.

**Scene 1 - The Arrival**
As darkness falls, shadow merchants appear selling impossible wares. Shadow Fey (CR 2) mingle with mortals.

**Scene 2 - The Games**
Participate in shadow contests: riddle competitions, shadow puppet battles, and races through darkness.

**Scene 3 - The Price**
The festival demands payment - memories, emotions, or years of life. Negotiate with the Shadow Court.

**Special Events:**
- Memory auctions
- Shadow puppet theater
- Twilight masquerade ball`,

    `**The Self-Writing Library**
    
*"Quills dance through the air, writing stories that haven't happened yet, while books reorganize themselves by dreams and nightmares."*

**Hook:** A library where books write themselves has begun producing prophecies that always come true.

**Scene 1 - The Scribing Hall**
Animated quills (CR 1/4) write constantly. The Head Librarian, a Sphinx (CR 8), maintains order among chaos.

**Scene 2 - The Prophecy Wing**
Books predict the future, but reading them makes the prophecies more likely to occur. Choose wisely.

**Scene 3 - The Author's Chamber**
The original author, now a Lich (CR 10), seeks to write the ultimate story - one that rewrites reality itself.

**Moral Dilemma:**
- Stop the Lich and lose prophetic knowledge
- Allow the rewriting of reality
- Find a third option through clever negotiation`
  ];

  const { displayText, isComplete } = useTypewriter(
    isGenerating ? results[currentStep] : '', 
    25
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    setThinkingPhase(0);
    setCurrentStep(Math.floor(Math.random() * prompts.length));
    
    // Simulate AI thinking phases
    const thinkingInterval = setInterval(() => {
      setThinkingPhase(prev => {
        if (prev >= thinkingSteps.length - 1) {
          clearInterval(thinkingInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 300);
    
    // Start generating after thinking
    setTimeout(() => {
      setGeneratedContent(results[currentStep]);
    }, thinkingSteps.length * 300 + 500);
  };

  const handleReset = () => {
    setIsGenerating(false);
    setGeneratedContent('');
    setThinkingPhase(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Adventure Generator
        </h4>
        <Badge variant="outline" className="text-xs">
          GPT-4 Powered
        </Badge>
      </div>

      <div className="p-3 rounded-lg bg-muted/50 border border-primary/20">
        <p className="text-sm text-muted-foreground mb-2">Prompt:</p>
        <p className="text-sm font-medium">
          {isGenerating ? prompts[currentStep] : "Click generate to see AI magic!"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isGenerating && (
          <motion.div
            className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!isComplete && (
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">
                  {generatedContent ? "Writing adventure..." : thinkingSteps[thinkingPhase]}
                </span>
              </div>
            )}
            <div className="text-sm whitespace-pre-line">
              {displayText}
              {!isComplete && <span className="animate-pulse">|</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={isGenerating && !isComplete}
          className="flex-1 text-xs"
        >
          {isGenerating && !isComplete ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 mr-1" />
              Generate Adventure
            </>
          )}
        </Button>
        
        {isGenerating && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="text-xs"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

// NPC Generation Demo
export const NPCDemo: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [npcData, setNpcData] = useState<any>(null);

  const npcExamples = [
    {
      name: "Grimbold Ironwhisper",
      race: "Mountain Dwarf",
      class: "Forge Cleric",
      personality: "Gruff but kind-hearted, speaks in mining metaphors",
      quirk: "Always tapping rhythms with his hammer",
      voice: "Deep, gravelly, with a slight echo",
      motivation: "Seeks to restore his clan's lost forge techniques",
      dialogue: "\"Aye, that problem's harder than dragon-scale ore, but we'll crack it with patience and the right tools.\""
    },
    {
      name: "Lyralei Moonweaver",
      race: "Wood Elf",
      class: "Circle of Stars Druid",
      personality: "Mysterious and wise, speaks in riddles",
      quirk: "Her eyes reflect the current phase of the moon",
      voice: "Melodic, like wind through leaves",
      motivation: "Protects ancient groves from encroaching civilization",
      dialogue: "\"The stars whisper of change, young one. Will you listen to their counsel, or forge your own constellation?\""
    },
    {
      name: "Pip Lightfingers",
      race: "Halfling",
      class: "Arcane Trickster Rogue",
      personality: "Cheerful troublemaker with a heart of gold",
      quirk: "Unconsciously juggles small objects while thinking",
      voice: "Quick and animated, with frequent chuckles",
      motivation: "Searching for his missing sister, taken by slavers",
      dialogue: "\"*chuckle* Oh, that locked door? Consider it more of a... friendly suggestion than an actual barrier!\""
    },
    {
      name: "Madame Corvina Blackquill",
      race: "Tiefling",
      class: "Divination Wizard",
      personality: "Theatrical fortune teller with genuine prophetic abilities",
      quirk: "Her quill writes by itself when she's concentrating",
      voice: "Dramatic and flowing, with theatrical pauses",
      motivation: "Seeks to prevent a catastrophic future she's foreseen",
      dialogue: "\"The cards... they show three paths before you. Choose wisely, for I have seen what lies at the end of each.\""
    },
    {
      name: "Captain Thorne Saltbeard",
      race: "Human",
      class: "Storm Sorcerer",
      personality: "Weathered sea captain with a tempestuous temper",
      quirk: "Weather changes subtly around him based on his mood",
      voice: "Booming and commanding, like crashing waves",
      motivation: "Hunting the kraken that destroyed his first ship",
      dialogue: "\"Har! The sea's in my blood, and my blood calls the storms! Ready the sails - we sail with the lightning!\""
    }
  ];

  const { displayText, isComplete } = useTypewriter(
    npcData ? JSON.stringify(npcData, null, 2) : '',
    20
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    setNpcData(null);
    
    setTimeout(() => {
      const randomNPC = npcExamples[Math.floor(Math.random() * npcExamples.length)];
      setNpcData(randomNPC);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          NPC Generator
        </h4>
        <Badge variant="outline" className="text-xs">
          Character Builder
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        {isGenerating && (
          <motion.div
            className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!npcData && (
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Creating unique character...</span>
              </div>
            )}
            
            {npcData && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">{npcData.name}</span>
                  <Badge variant="secondary" className="text-xs">{npcData.race}</Badge>
                  <Badge variant="outline" className="text-xs">{npcData.class}</Badge>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium">Personality:</span> {npcData.personality}
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Quirk:</span> {npcData.quirk}
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Voice:</span> {npcData.voice}
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Motivation:</span> {npcData.motivation}
                  </div>
                </div>

                {npcData.dialogue && (
                  <div className="p-2 rounded bg-muted/50 border-l-2 border-primary/50">
                    <span className="text-xs text-muted-foreground font-medium">Sample Dialogue:</span>
                    <p className="text-xs italic mt-1">{npcData.dialogue}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating && !npcData}
        className="w-full text-xs"
      >
        {isGenerating && !npcData ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Generating NPC...
          </>
        ) : (
          <>
            <Zap className="w-3 h-3 mr-1" />
            Create Character
          </>
        )}
      </Button>
    </div>
  );
};

// Monster Generation Demo
export const MonsterDemo: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [monster, setMonster] = useState<any>(null);

  const monsterExamples = [
    {
      name: "Shadowmere Wisp",
      cr: "CR 3",
      type: "Undead",
      size: "Large",
      ac: "14 (Natural Armor)",
      hp: "45 (7d10 + 7)",
      speed: "50 ft., fly 50 ft. (hover)",
      description: "A ghostly horse that phases between the material and shadow planes, leaving trails of darkness in its wake",
      abilities: [
        "Ethereal Jaunt: Can shift to Ethereal Plane as bonus action",
        "Shadow Step: Teleport 60 ft. between shadows",
        "Necrotic Hooves: Hooves deal necrotic damage and reduce max HP"
      ],
      tactics: "Uses hit-and-run tactics, phasing through walls to attack from unexpected angles"
    },
    {
      name: "Crystalback Basilisk",
      cr: "CR 5",
      type: "Monstrosity",
      size: "Medium",
      ac: "17 (Crystal Scales)",
      hp: "68 (8d10 + 24)",
      speed: "20 ft., burrow 10 ft.",
      description: "A basilisk whose scales have crystallized over centuries, refracting its petrifying gaze into rainbow death",
      abilities: [
        "Prismatic Gaze: Petrification save or suffer random color effect",
        "Crystal Armor: Resistance to piercing, reflects spells 25% chance",
        "Shard Spray: Cone of crystal shards, slashing damage"
      ],
      tactics: "Positions itself to maximize gaze attacks, uses crystal armor to deflect ranged attacks"
    },
    {
      name: "Void Touched Owlbear",
      cr: "CR 4",
      type: "Monstrosity",
      size: "Large",
      ac: "13 (Natural Armor)",
      hp: "59 (7d10 + 21)",
      speed: "40 ft., climb 30 ft.",
      description: "An owlbear corrupted by eldritch energy, sprouting writhing tentacles and unblinking eyes across its form",
      abilities: [
        "Eldritch Roar: Frightens enemies and causes psychic damage",
        "Tentacle Slam: Grapples and restrains multiple targets",
        "Void Sight: Sees through illusions and into other planes"
      ],
      tactics: "Roars to scatter enemies, then uses tentacles to isolate and crush individual targets"
    },
    {
      name: "Flameheart Phoenix Wyrmling",
      cr: "CR 6",
      type: "Dragon",
      size: "Medium",
      ac: "16 (Natural Armor)",
      hp: "75 (10d8 + 30)",
      speed: "30 ft., fly 80 ft.",
      description: "A young phoenix-dragon hybrid with molten gold feathers and scales that burn with inner fire",
      abilities: [
        "Rebirth Flame: When reduced to 0 HP, explodes and reforms next turn",
        "Molten Breath: Cone of liquid fire that ignites terrain",
        "Phoenix Song: Healing melody that also charms listeners"
      ],
      tactics: "Stays airborne, uses breath weapon to control battlefield, saves rebirth for critical moments"
    }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setMonster(null);
    
    setTimeout(() => {
      const randomMonster = monsterExamples[Math.floor(Math.random() * monsterExamples.length)];
      setMonster(randomMonster);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Monster Forge
        </h4>
        <Badge variant="outline" className="text-xs">
          Creature Creator
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        {isGenerating && (
          <motion.div
            className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!monster && (
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Forging new creature...</span>
              </div>
            )}
            
            {monster && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-primary">{monster.name}</span>
                  <Badge variant="secondary" className="text-xs">{monster.cr}</Badge>
                  <Badge variant="outline" className="text-xs">{monster.type}</Badge>
                  <Badge variant="outline" className="text-xs">{monster.size}</Badge>
                </div>
                
                <p className="text-xs text-muted-foreground italic">{monster.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">AC:</span> {monster.ac}</div>
                  <div><span className="text-muted-foreground">HP:</span> {monster.hp}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Speed:</span> {monster.speed}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-primary">Special Abilities:</span>
                  {monster.abilities.map((ability: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                      <span>{ability}</span>
                    </div>
                  ))}
                </div>

                {monster.tactics && (
                  <div className="p-2 rounded bg-muted/50 border-l-2 border-accent/50">
                    <span className="text-xs text-muted-foreground font-medium">Combat Tactics:</span>
                    <p className="text-xs mt-1">{monster.tactics}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating && !monster}
        className="w-full text-xs"
      >
        {isGenerating && !monster ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Forging Monster...
          </>
        ) : (
          <>
            <Zap className="w-3 h-3 mr-1" />
            Forge Creature
          </>
        )}
      </Button>
    </div>
  );
};