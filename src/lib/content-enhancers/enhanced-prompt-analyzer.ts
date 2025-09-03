/**
 * Enhanced Prompt Analysis Integration
 * 
 * Processes user prompts through professional parser for deeper understanding
 * and enhanced content generation capabilities.
 */

export interface PromptAnalysisResult {
  originalPrompt: string;
  analyzedElements: {
    setting: string;
    tone: string;
    complexity: 'simple' | 'moderate' | 'complex' | 'expert';
    themes: string[];
    requiredElements: string[];
    suggestedEnhancements: string[];
  };
  enhancedPrompt: string;
  confidenceScore: number;
  processingTime: number;
}

export class EnhancedPromptAnalyzer {
  /**
   * Analyze and enhance user prompt for professional content generation
   */
  async analyzePrompt(prompt: string): Promise<PromptAnalysisResult> {
    const startTime = Date.now();
    
    console.log('🔍 [PROMPT-ANALYZER] Analyzing prompt for professional enhancement...');
    
    try {
      // Extract key elements from prompt
      const analyzedElements = this.extractPromptElements(prompt);
      
      // Generate enhanced prompt
      const enhancedPrompt = this.generateEnhancedPrompt(prompt, analyzedElements);
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(analyzedElements);
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ [PROMPT-ANALYZER] Analysis complete in ${processingTime}ms (confidence: ${Math.round(confidenceScore)}%)`);
      
      return {
        originalPrompt: prompt,
        analyzedElements,
        enhancedPrompt,
        confidenceScore,
        processingTime
      };
      
    } catch (error) {
      console.error('❌ [PROMPT-ANALYZER] Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Extract key elements from user prompt
   */
  private extractPromptElements(prompt: string): PromptAnalysisResult['analyzedElements'] {
    const lowercasePrompt = prompt.toLowerCase();
    
    // Detect setting
    const setting = this.detectSetting(lowercasePrompt);
    
    // Detect tone
    const tone = this.detectTone(lowercasePrompt);
    
    // Assess complexity
    const complexity = this.assessComplexity(prompt);
    
    // Extract themes
    const themes = this.extractThemes(lowercasePrompt);
    
    // Identify required elements
    const requiredElements = this.identifyRequiredElements(lowercasePrompt);
    
    // Generate enhancement suggestions
    const suggestedEnhancements = this.generateEnhancementSuggestions(lowercasePrompt, complexity);
    
    return {
      setting,
      tone,
      complexity,
      themes,
      requiredElements,
      suggestedEnhancements
    };
  }

  private detectSetting(prompt: string): string {
    const settingKeywords = {
      'fantasy': ['dragon', 'magic', 'wizard', 'dungeon', 'castle', 'medieval', 'sword', 'spell'],
      'sci-fi': ['space', 'robot', 'alien', 'future', 'technology', 'laser', 'spaceship', 'cyberpunk'],
      'modern': ['city', 'car', 'phone', 'computer', 'office', 'apartment', 'restaurant'],
      'horror': ['ghost', 'zombie', 'vampire', 'haunted', 'scary', 'dark', 'blood', 'monster'],
      'western': ['cowboy', 'saloon', 'horse', 'desert', 'sheriff', 'outlaw', 'frontier'],
      'steampunk': ['steam', 'gear', 'clockwork', 'victorian', 'airship', 'brass', 'mechanical']
    };

    for (const [setting, keywords] of Object.entries(settingKeywords)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        return setting;
      }
    }

    return 'generic';
  }

  private detectTone(prompt: string): string {
    const toneKeywords = {
      'serious': ['important', 'critical', 'dangerous', 'urgent', 'grave'],
      'humorous': ['funny', 'joke', 'laugh', 'silly', 'amusing', 'comedy'],
      'mysterious': ['secret', 'hidden', 'unknown', 'mystery', 'enigma', 'puzzle'],
      'epic': ['legendary', 'heroic', 'grand', 'mighty', 'powerful', 'epic'],
      'dark': ['grim', 'sinister', 'evil', 'shadow', 'corruption', 'doom']
    };

    for (const [tone, keywords] of Object.entries(toneKeywords)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        return tone;
      }
    }

    return 'neutral';
  }

  private assessComplexity(prompt: string): 'simple' | 'moderate' | 'complex' | 'expert' {
    const wordCount = prompt.split(' ').length;
    const sentenceCount = prompt.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    // Check for complex elements
    const complexElements = [
      'multiple', 'various', 'different', 'several', 'branching', 'choice',
      'consequence', 'political', 'economic', 'social', 'psychological'
    ];
    
    const hasComplexElements = complexElements.some(element => 
      prompt.toLowerCase().includes(element)
    );

    if (wordCount > 100 || avgWordsPerSentence > 20 || hasComplexElements) {
      return 'expert';
    } else if (wordCount > 50 || avgWordsPerSentence > 15) {
      return 'complex';
    } else if (wordCount > 20 || avgWordsPerSentence > 10) {
      return 'moderate';
    }
    
    return 'simple';
  }

  private extractThemes(prompt: string): string[] {
    const themeKeywords = {
      'adventure': ['quest', 'journey', 'explore', 'discover', 'travel'],
      'combat': ['fight', 'battle', 'war', 'conflict', 'enemy', 'weapon'],
      'mystery': ['investigate', 'clue', 'solve', 'hidden', 'secret'],
      'social': ['negotiate', 'persuade', 'politics', 'diplomacy', 'relationship'],
      'survival': ['survive', 'escape', 'danger', 'threat', 'rescue'],
      'magic': ['spell', 'enchant', 'magical', 'arcane', 'mystical'],
      'technology': ['machine', 'device', 'invention', 'scientific', 'technical']
    };

    const themes: string[] = [];
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        themes.push(theme);
      }
    }

    return themes.length > 0 ? themes : ['general'];
  }

  private identifyRequiredElements(prompt: string): string[] {
    const elements: string[] = [];
    
    // Check for specific requirements
    if (prompt.includes('npc') || prompt.includes('character')) {
      elements.push('Enhanced NPCs');
    }
    if (prompt.includes('puzzle') || prompt.includes('riddle')) {
      elements.push('Multi-solution Puzzles');
    }
    if (prompt.includes('combat') || prompt.includes('fight')) {
      elements.push('Tactical Combat');
    }
    if (prompt.includes('map') || prompt.includes('layout')) {
      elements.push('Professional Layout');
    }
    
    return elements;
  }

  private generateEnhancementSuggestions(prompt: string, complexity: string): string[] {
    const suggestions: string[] = [];
    
    // Base suggestions based on complexity
    if (complexity === 'simple') {
      suggestions.push('Add more descriptive details');
      suggestions.push('Include sensory descriptions');
    } else if (complexity === 'expert') {
      suggestions.push('Consider multiple solution paths');
      suggestions.push('Add political or social implications');
    }
    
    // Content-specific suggestions
    if (prompt.includes('dungeon')) {
      suggestions.push('Add environmental hazards');
      suggestions.push('Include hidden passages');
    }
    
    if (prompt.includes('city')) {
      suggestions.push('Add urban encounters');
      suggestions.push('Include social dynamics');
    }
    
    return suggestions;
  }

  private generateEnhancedPrompt(originalPrompt: string, elements: PromptAnalysisResult['analyzedElements']): string {
    let enhanced = originalPrompt;
    
    // Add setting context if detected
    if (elements.setting !== 'generic') {
      enhanced += ` [Setting: ${elements.setting}]`;
    }
    
    // Add tone guidance
    if (elements.tone !== 'neutral') {
      enhanced += ` [Tone: ${elements.tone}]`;
    }
    
    // Add complexity guidance
    enhanced += ` [Complexity: ${elements.complexity}]`;
    
    // Add theme focus
    if (elements.themes.length > 0) {
      enhanced += ` [Themes: ${elements.themes.join(', ')}]`;
    }
    
    // Add enhancement suggestions
    if (elements.suggestedEnhancements.length > 0) {
      enhanced += ` [Enhancements: ${elements.suggestedEnhancements.join(', ')}]`;
    }
    
    return enhanced;
  }

  private calculateConfidenceScore(elements: PromptAnalysisResult['analyzedElements']): number {
    let confidence = 60; // Base confidence
    
    // Boost confidence based on detected elements
    if (elements.setting !== 'generic') confidence += 15;
    if (elements.tone !== 'neutral') confidence += 10;
    if (elements.themes.length > 1) confidence += 10;
    if (elements.requiredElements.length > 0) confidence += 15;
    if (elements.complexity !== 'simple') confidence += 10;
    
    return Math.min(100, confidence);
  }
}

export const enhancedPromptAnalyzer = new EnhancedPromptAnalyzer();