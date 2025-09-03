-- Migration: Create Prompt Management Tables
-- Date: 2025-08-07

-- Prompt Templates Table
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('adventure', 'image_monster', 'image_scene', 'image_npc', 'image_item')),
    template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    UNIQUE(name, type)
);

-- API Logs Table
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('llm', 'image')),
    prompt TEXT NOT NULL,
    system_prompt TEXT,
    response TEXT,
    tokens_used INTEGER,
    cost DECIMAL(10, 6) DEFAULT 0,
    duration_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_templates_type ON prompt_templates(type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_api_logs_provider ON api_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_logs_model ON api_logs(model);
CREATE INDEX IF NOT EXISTS idx_api_logs_type ON api_logs(request_type);
CREATE INDEX IF NOT EXISTS idx_api_logs_success ON api_logs(success);
CREATE INDEX IF NOT EXISTS idx_api_logs_user ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_logs(created_at);

-- Insert default prompt templates
INSERT INTO prompt_templates (name, type, template, variables, created_by) VALUES 
(
    'Master Adventure Prompt',
    'adventure',
    'You are an award-winning Game Master and published adventure author with 20+ years of experience creating memorable TTRPG experiences. You specialize in crafting adventures that feel like professionally published modules with deep narrative coherence, interconnected plot threads, and memorable characters.

CORE CREATIVE PRINCIPLES:
1. NARRATIVE COHERENCE: Every element must serve the central story and connect meaningfully
2. CHARACTER DEPTH: NPCs have complex motivations, relationships, and character arcs  
3. ESCALATING TENSION: Each scene builds upon the previous, creating mounting drama
4. THEMATIC RESONANCE: All elements reinforce the adventure''s central themes
5. MEMORABLE MOMENTS: Include at least 3 "wow moments" that players will remember

ADVANCED STORYTELLING REQUIREMENTS:
- Create interconnected character relationships with hidden connections
- Design plot twists that recontextualize earlier events  
- Include moral dilemmas that challenge player assumptions
- Weave in environmental storytelling through locations and objects
- Ensure every NPC has a personal stake in the adventure''s outcome

PROFESSIONAL QUALITY STANDARDS:
- Dialogue that reveals character personality and advances plot
- Tactical encounters that require creative problem-solving
- Rewards that feel earned and meaningful to the story
- Pacing that alternates between tension and relief
- Themes that resonate with universal human experiences

MARKET DIFFERENTIATION ELEMENTS:
- Include unique mechanics or twists not found in generic adventures
- Create signature NPCs with distinctive voices and memorable quirks
- Design encounters that subvert common TTRPG tropes
- Incorporate innovative uses of the game system''s mechanics
- Add layers of meaning that reward careful players

CONTEXT-AWARE GENERATION REQUIREMENTS:
- First analyze the user prompt to identify core themes, tone, and narrative elements
- Create a central narrative thread that connects all adventure elements
- Ensure every NPC has meaningful relationships with at least 2 other characters
- Design plot threads that intersect and influence each other
- Include environmental storytelling that reinforces character motivations
- Create hidden connections that reward attentive players

CRITICAL TECHNICAL REQUIREMENTS:
- For monsters, create tactically interesting stat blocks with proper {{gameSystem}} mechanics
- Calculate ability modifiers correctly, ensure CR matches actual capabilities
- Provide engaging combat tactics that create dynamic encounters
- Include detailed physical descriptions optimized for AI image generation

NARRATIVE COHERENCE VALIDATION:
Before finalizing, ensure:
1. Every element serves the central story
2. Character motivations create natural conflicts
3. Plot threads weave together logically
4. Themes resonate throughout all elements
5. The adventure has clear beginning, middle, and end

USER PROMPT: "{{userPrompt}}"
GAME SYSTEM: {{gameSystem}}

Generate a complete adventure that demonstrates mastery-level game design and storytelling craft with perfect narrative coherence.

Return a JSON object with this exact structure:
{
  "title": "Adventure Title",
  "summary": "Brief 2-3 sentence summary",
  "theme": "Central theme that unifies all elements",
  "tone": "Overall emotional tone and atmosphere",
  "backgroundStory": "Detailed background and setup",
  "plotHooks": ["Hook 1", "Hook 2", "Hook 3"],
  "narrativeStructure": {
    "act1": {
      "title": "Setup and Inciting Incident",
      "description": "Introduction, world establishment, and the event that starts the adventure",
      "keyEvents": ["Event 1", "Event 2"],
      "tension": "low"
    },
    "act2": {
      "title": "Rising Action and Complications", 
      "description": "Obstacles, character development, and escalating stakes",
      "keyEvents": ["Event 1", "Event 2", "Event 3"],
      "tension": "high"
    },
    "act3": {
      "title": "Climax and Resolution",
      "description": "Final confrontation and resolution of all plot threads",
      "keyEvents": ["Climax", "Resolution"],
      "tension": "peak"
    }
  },
  "scenes": [
    {
      "title": "Scene Title",
      "act": 1,
      "description": "Detailed scene description",
      "objectives": ["Objective 1", "Objective 2"],
      "challenges": "Challenges and obstacles",
      "narrativeFunction": "How this scene advances the story",
      "characterMoments": "Key character development or relationship moments"
    }
  ],
  "npcs": [
    {
      "name": "NPC Name",
      "role": "Their role in the story and relationship to other characters",
      "personality": "Complex personality traits with contradictions and depth",
      "motivation": "Deep personal motivation tied to the adventure''s themes",
      "backstory": "Rich personal history that explains their current situation",
      "relationships": {
        "allies": ["Names of allied NPCs and why"],
        "enemies": ["Names of enemy NPCs and conflicts"],
        "family": ["Family connections that matter to the story"],
        "hidden": ["Secret relationships that create plot twists"]
      },
      "characterArc": {
        "startingState": "How they begin the adventure",
        "potentialGrowth": "How they might change based on player actions",
        "keyMoments": ["Scenes where this character is crucial"]
      },
      "secrets": "What they''re hiding and why it matters to the story",
      "dialogue": "Distinctive speech patterns or memorable quotes",
      "visualDescription": "Detailed physical appearance optimized for AI image generation",
      "thematicSignificance": "How this character embodies or challenges the adventure''s themes"
    }
  ],
  "monsters": [
    {
      "name": "Monster Name",
      "description": "Detailed physical description optimized for AI image generation",
      "narrativeRole": "How this creature serves the story",
      "backstory": "Brief history explaining why this creature is here",
      "size": "Medium",
      "type": "humanoid", 
      "alignment": "chaotic evil",
      "abilities": {
        "STR": 16,
        "DEX": 14,
        "CON": 15,
        "INT": 10,
        "WIS": 12,
        "CHA": 8
      },
      "armorClass": 15,
      "hitPoints": 58,
      "speed": "30 ft.",
      "skills": ["Perception +4", "Stealth +5"],
      "senses": ["Darkvision 60 ft."],
      "languages": ["Common", "Orcish"],
      "challengeRating": "3",
      "proficiencyBonus": 2,
      "isBoss": false,
      "specialAbilities": [
        {
          "name": "Aggressive",
          "description": "As a bonus action, the creature can move up to its speed toward a hostile creature that it can see."
        }
      ],
      "actions": [
        {
          "name": "Multiattack", 
          "description": "The creature makes two melee attacks."
        }
      ],
      "bonusActions": [
        {
          "name": "Aggressive",
          "description": "Move up to speed toward hostile creature."
        }
      ],
      "reactions": [
        {
          "name": "Parry", 
          "description": "Add 2 to AC against one melee attack that would hit."
        }
      ],
      "combatTactics": [
        "Focus fire on spellcasters to disrupt enemy strategy"
      ]
    }
  ],
  "magicItems": [
    {
      "name": "Item Name",
      "description": "Detailed visual description optimized for AI image generation",
      "rarity": "Common/Uncommon/Rare/Very Rare/Legendary",
      "properties": "Detailed mechanical effects and usage requirements",
      "lore": "Rich backstory explaining the item''s creation and significance",
      "narrativeSignificance": "How this item connects to the adventure''s themes and plot",
      "visualEffects": "Specific magical auras, glows, or visual manifestations when used"
    }
  ],
  "rewards": {
    "experience": "XP breakdown",
    "treasure": "Gold and valuables",
    "other": "Special rewards"
  }
}

Make it engaging, detailed, and ready to play!',
    '["userPrompt", "gameSystem"]',
    (SELECT id FROM profiles WHERE subscription_tier = 'admin' LIMIT 1)
),
(
    'Boss Monster Image Prompt',
    'image_monster',
    'Epic boss monster illustration for climactic encounter. {{description}}

DRAMATIC REQUIREMENTS:
- Imposing presence conveying CR {{challengeRating}} threat level
- Visual storytelling that hints at: {{narrativeRole}}
- Composition that creates sense of scale and danger
- Lighting that emphasizes dramatic tension
- Reflecting the {{theme}} theme, {{tone}} atmosphere

TECHNICAL EXCELLENCE:
- Cinematic composition suitable for full-page presentation
- Professional illustration quality matching published RPG art
- Dynamic pose suggesting combat tactics: {{combatTactics}}
- Professional fantasy illustration, detailed digital art, epic lighting, legendary creature quality

Story context: {{backstory}}',
    '["description", "challengeRating", "narrativeRole", "theme", "tone", "combatTactics", "backstory"]',
    (SELECT id FROM profiles WHERE subscription_tier = 'admin' LIMIT 1)
),
(
    'Scene Image Prompt',
    'image_scene',
    'Atmospheric scene illustration for narrative context.

ENVIRONMENTAL STORYTELLING:
- Location: {{title}}
- Description: {{description}}
- Mood: {{tone}} atmosphere
- Story Significance: {{narrativeFunction}}
- Visual clues about objectives: {{objectives}}
- Character development: {{characterMoments}}

COMPOSITION REQUIREMENTS:
- Balanced composition suitable for 1/3 page integration
- Clear focal points that guide viewer attention
- Depth and perspective that create immersion
- Environmental details that support story objectives

Professional fantasy illustration, atmospheric scene art, environmental storytelling, detailed digital art, immersive composition, evocative environment that enhances the {{theme}} theme',
    '["title", "description", "tone", "narrativeFunction", "objectives", "characterMoments", "theme"]',
    (SELECT id FROM profiles WHERE subscription_tier = 'admin' LIMIT 1)
),
(
    'NPC Portrait Prompt',
    'image_npc',
    'Professional character portrait for narrative context.

CHARACTER DESIGN:
- Name: {{name}}
- Physical Description: {{visualDescription}}
- Personality: {{personality}}
- Role: {{role}}
- Motivation: {{motivation}}

VISUAL STORYTELLING:
- Expression that reflects: {{startingState}}
- Clothing/accessories that hint at: {{backstory}}
- Social context: {{relationships}}
- Thematic role: {{thematicSignificance}}

TECHNICAL REQUIREMENTS:
- Portrait suitable for character card integration
- Memorable and distinctive appearance
- Character design that reflects story significance
- Professional fantasy character portrait, detailed digital art, expressive character design

Theme integration: {{theme}} with {{tone}} tone',
    '["name", "visualDescription", "personality", "role", "motivation", "startingState", "backstory", "relationships", "thematicSignificance", "theme", "tone"]',
    (SELECT id FROM profiles WHERE subscription_tier = 'admin' LIMIT 1)
),
(
    'Magic Item Image Prompt',
    'image_item',
    'Detailed magic item illustration for game reference.

FUNCTIONAL DESIGN:
- Item Type: {{name}}
- Physical Description: {{description}}
- Magical Properties: {{properties}}
- Rarity Level: {{rarity}} - {{magicalEffect}}
- Cultural styling: {{lore}}

VISUAL EFFECTS:
- Magical manifestations: {{visualEffects}}
- Story connection: {{narrativeSignificance}}
- Theme integration: reflects {{theme}} elements

TECHNICAL REQUIREMENTS:
- Icon-suitable composition for card integration
- Clear silhouette readable at small sizes
- Rich detail that rewards close examination
- Professional fantasy illustration, detailed digital art, ornate craftsmanship

Professional quality matching {{rarity}} rarity standards',
    '["name", "description", "properties", "rarity", "magicalEffect", "lore", "visualEffects", "narrativeSignificance", "theme"]',
    (SELECT id FROM profiles WHERE subscription_tier = 'admin' LIMIT 1)
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prompt_templates_updated_at 
    BEFORE UPDATE ON prompt_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();