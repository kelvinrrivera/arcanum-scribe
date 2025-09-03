import { z } from 'zod';

// Schema for professional polish analysis
const ProfessionalPolishAnalysisSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(['adventure', 'npc', 'monster', 'location', 'item', 'image']),
  content: z.string(),
  publicationQualityScore: z.number().min(0).max(10),
  professionalStandardsScore: z.number().min(0).max(10),
  premiumQualityScore: z.number().min(0).max(10),
  qualityIndicators: z.array(z.string()),
  deficiencies: z.array(z.string()),
  improvementRecommendations: z.array(z.string()),
  marketReadiness: z.boolean()
});

type ProfessionalPolishAnalysis = z.infer<typeof ProfessionalPolishAnalysisSchema>;

// Professional quality standards
const PROFESSIONAL_STANDARDS = {
  writing: {
    grammar: {
      weight: 0.2,
      indicators: [
        'proper sentence structure',
        'correct punctuation',
        'consistent tense usage',
        'subject-verb agreement',
        'proper capitalization'
      ]
    },
    style: {
      weight: 0.25,
      indicators: [
        'clear and engaging prose',
        'varied sentence structure',
        'appropriate tone',
        'consistent voice',
        'professional vocabulary'
      ]
    },
    structure: {
      weight: 0.2,
      indicators: [
        'logical organization',
        'clear transitions',
        'coherent flow',
        'proper formatting',
        'effective pacing'
      ]
    },
    depth: {
      weight: 0.35,
      indicators: [
        'rich detail and description',
        'complex character development',
        'layered storytelling',
        'thematic resonance',
        'emotional engagement'
      ]
    }
  },
  technical: {
    accuracy: {
      weight: 0.3,
      indicators: [
        'correct game mechanics',
        'balanced encounters',
        'appropriate challenge ratings',
        'consistent rules application',
        'accurate statistics'
      ]
    },
    completeness: {
      weight: 0.25,
      indicators: [
        'all necessary information provided',
        'clear instructions for GMs',
        'comprehensive stat blocks',
        'detailed descriptions',
        'usable reference materials'
      ]
    },
    usability: {
      weight: 0.25,
      indicators: [
        'easy to run at the table',
        'clear organization',
        'quick reference sections',
        'practical implementation',
        'GM-friendly format'
      ]
    },
    innovation: {
      weight: 0.2,
      indicators: [
        'creative mechanics',
        'unique encounters',
        'innovative solutions',
        'fresh approaches',
        'memorable elements'
      ]
    }
  },
  presentation: {
    formatting: {
      weight: 0.3,
      indicators: [
        'consistent formatting',
        'proper headings and sections',
        'clear typography',
        'appropriate spacing',
        'professional layout'
      ]
    },
    readability: {
      weight: 0.3,
      indicators: [
        'scannable content',
        'logical information hierarchy',
        'effective use of whitespace',
        'clear visual organization',
        'easy navigation'
      ]
    },
    polish: {
      weight: 0.4,
      indicators: [
        'publication-ready quality',
        'attention to detail',
        'consistent style',
        'professional appearance',
        'market-ready presentation'
      ]
    }
  }
};

// Premium quality benchmarks
const PREMIUM_BENCHMARKS = {
  wordCount: {
    adventure: { min: 2000, optimal: 4000 },
    npc: { min: 200, optimal: 400 },
    monster: { min: 150, optimal: 300 },
    location: { min: 300, optimal: 600 },
    item: { min: 100, optimal: 200 }
  },
  complexity: {
    sentenceVariety: 0.7, // Ratio of unique sentence structures
    vocabularyRichness: 0.6, // Unique words / total words
    readabilityScore: { min: 60, max: 80 }, // Flesch reading ease
    thematicDepth: 3 // Minimum number of thematic elements
  },
  engagement: {
    emotionalWords: 5, // Minimum emotional vocabulary
    sensoryDetails: 8, // Minimum sensory descriptions
    actionVerbs: 0.15, // Ratio of action verbs to total verbs
    dialogueQuality: 0.1 // Ratio of dialogue to total content
  }
};

export class ProfessionalPolishValidator {
  /**
   * Analyze content for professional polish and publication quality
   */
  async validateProfessionalPolish(
    contentId: string,
    contentType: keyof typeof PREMIUM_BENCHMARKS.wordCount,
    content: string
  ): Promise<ProfessionalPolishAnalysis> {
    const publicationQualityScore = this.assessPublicationQuality(contentType, content);
    const professionalStandardsScore = this.assessProfessionalStandards(contentType, content);
    const premiumQualityScore = this.assessPremiumQuality(contentType, content);
    
    const qualityIndicators = this.identifyQualityIndicators(content);
    const deficiencies = this.identifyDeficiencies(contentType, content);
    const improvementRecommendations = this.generateImprovementRecommendations(
      contentType, content, publicationQualityScore, professionalStandardsScore, premiumQualityScore
    );
    
    const marketReadiness = this.assessMarketReadiness(
      publicationQualityScore, professionalStandardsScore, premiumQualityScore
    );

    return {
      contentId,
      contentType,
      content,
      publicationQualityScore,
      professionalStandardsScore,
      premiumQualityScore,
      qualityIndicators,
      deficiencies,
      improvementRecommendations,
      marketReadiness
    };
  }

  /**
   * Assess publication quality standards
   */
  private assessPublicationQuality(contentType: string, content: string): number {
    let score = 0;
    const weights = PROFESSIONAL_STANDARDS.writing;

    // Grammar assessment
    const grammarScore = this.assessGrammar(content);
    score += grammarScore * weights.grammar.weight;

    // Style assessment
    const styleScore = this.assessWritingStyle(content);
    score += styleScore * weights.style.weight;

    // Structure assessment
    const structureScore = this.assessStructure(content);
    score += structureScore * weights.structure.weight;

    // Depth assessment
    const depthScore = this.assessContentDepth(content);
    score += depthScore * weights.depth.weight;

    return Math.min(10, score * 10);
  }

  /**
   * Assess professional standards compliance
   */
  private assessProfessionalStandards(contentType: string, content: string): number {
    let score = 0;
    const weights = PROFESSIONAL_STANDARDS.technical;

    // Technical accuracy
    const accuracyScore = this.assessTechnicalAccuracy(contentType, content);
    score += accuracyScore * weights.accuracy.weight;

    // Completeness
    const completenessScore = this.assessCompleteness(contentType, content);
    score += completenessScore * weights.completeness.weight;

    // Usability
    const usabilityScore = this.assessUsability(content);
    score += usabilityScore * weights.usability.weight;

    // Innovation
    const innovationScore = this.assessInnovation(content);
    score += innovationScore * weights.innovation.weight;

    return Math.min(10, score * 10);
  }

  /**
   * Assess premium quality standards
   */
  private assessPremiumQuality(contentType: keyof typeof PREMIUM_BENCHMARKS.wordCount, content: string): number {
    let score = 0;

    // Word count assessment
    const wordCountScore = this.assessWordCount(contentType, content);
    score += wordCountScore * 0.2;

    // Complexity assessment
    const complexityScore = this.assessComplexity(content);
    score += complexityScore * 0.3;

    // Engagement assessment
    const engagementScore = this.assessEngagement(content);
    score += engagementScore * 0.3;

    // Presentation assessment
    const presentationScore = this.assessPresentation(content);
    score += presentationScore * 0.2;

    return Math.min(10, score * 10);
  }

  /**
   * Assess grammar quality
   */
  private assessGrammar(content: string): number {
    let score = 1.0;

    // Check for common grammar issues
    const grammarIssues = [
      /\b(there|their|they're)\b/gi, // Homophone confusion indicators
      /\b(its|it's)\b/gi,
      /\b(your|you're)\b/gi,
      /[.!?]\s*[a-z]/g, // Sentences not starting with capital
      /\s{2,}/g, // Multiple spaces
      /[,;]\s*[A-Z]/g // Incorrect capitalization after punctuation
    ];

    grammarIssues.forEach(pattern => {
      const matches = content.match(pattern) || [];
      score -= matches.length * 0.05;
    });

    // Check sentence structure variety
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    if (avgSentenceLength < 8 || avgSentenceLength > 25) {
      score -= 0.1;
    }

    return Math.max(0, score);
  }

  /**
   * Assess writing style quality
   */
  private assessWritingStyle(content: string): number {
    let score = 0.5; // Base score

    // Check for engaging language
    const engagingWords = [
      'vivid', 'striking', 'compelling', 'dramatic', 'intense',
      'mysterious', 'haunting', 'breathtaking', 'magnificent'
    ];
    
    const engagingCount = engagingWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(0.3, engagingCount * 0.05);

    // Check for varied sentence beginnings
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const beginnings = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
    const uniqueBeginnings = new Set(beginnings).size;
    const varietyRatio = uniqueBeginnings / beginnings.length;
    
    score += varietyRatio * 0.2;

    return Math.min(1.0, score);
  }

  /**
   * Assess content structure
   */
  private assessStructure(content: string): number {
    let score = 0.5;

    // Check for clear sections/organization
    const hasHeaders = /^#+\s/m.test(content) || /^[A-Z][^.!?]*:$/m.test(content);
    if (hasHeaders) score += 0.2;

    // Check for logical flow indicators
    const transitionWords = [
      'however', 'meanwhile', 'furthermore', 'consequently',
      'therefore', 'additionally', 'moreover', 'nevertheless'
    ];
    
    const transitionCount = transitionWords.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(0.3, transitionCount * 0.1);

    return Math.min(1.0, score);
  }

  /**
   * Assess content depth and richness
   */
  private assessContentDepth(content: string): number {
    let score = 0.3; // Base score

    // Check for descriptive richness
    const descriptiveWords = [
      'ancient', 'weathered', 'ornate', 'intricate', 'elaborate',
      'towering', 'sprawling', 'shadowy', 'gleaming', 'crumbling'
    ];
    
    const descriptiveCount = descriptiveWords.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(0.3, descriptiveCount * 0.03);

    // Check for emotional depth
    const emotionalWords = [
      'fear', 'hope', 'despair', 'joy', 'anger', 'love',
      'betrayal', 'loyalty', 'sacrifice', 'redemption'
    ];
    
    const emotionalCount = emotionalWords.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(0.4, emotionalCount * 0.05);

    return Math.min(1.0, score);
  }

  /**
   * Assess technical accuracy for RPG content
   */
  private assessTechnicalAccuracy(contentType: string, content: string): number {
    let score = 0.7; // Base score assuming general accuracy

    // Check for RPG-specific terminology usage
    const rpgTerms = [
      'AC', 'HP', 'damage', 'spell', 'ability', 'skill',
      'saving throw', 'attack roll', 'difficulty class'
    ];
    
    const termCount = rpgTerms.filter(term =>
      content.toLowerCase().includes(term.toLowerCase())
    ).length;
    
    if (termCount > 0) score += 0.2;

    // Check for specific mechanical details
    if (/\d+d\d+/g.test(content)) score += 0.1; // Dice notation

    return Math.min(1.0, score);
  }

  /**
   * Assess completeness of content
   */
  private assessCompleteness(contentType: string, content: string): number {
    const benchmarks = PREMIUM_BENCHMARKS.wordCount[contentType as keyof typeof PREMIUM_BENCHMARKS.wordCount];
    const wordCount = content.split(/\s+/).length;
    
    let score = 0.5;
    
    if (wordCount >= benchmarks.min) {
      score += 0.3;
    }
    
    if (wordCount >= benchmarks.optimal) {
      score += 0.2;
    }

    return Math.min(1.0, score);
  }

  /**
   * Assess usability for game masters
   */
  private assessUsability(content: string): number {
    let score = 0.5;

    // Check for GM guidance
    const gmKeywords = [
      'GM note', 'DM note', 'if players', 'when characters',
      'read aloud', 'describe', 'roleplay'
    ];
    
    const gmGuidanceCount = gmKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    score += Math.min(0.3, gmGuidanceCount * 0.1);

    // Check for clear organization
    if (content.includes('**') || content.includes('*')) score += 0.1; // Formatting
    if (/^\s*-|\*|\d+\./m.test(content)) score += 0.1; // Lists

    return Math.min(1.0, score);
  }

  /**
   * Assess innovation and creativity
   */
  private assessInnovation(content: string): number {
    let score = 0.4;

    const innovativeKeywords = [
      'unique', 'innovative', 'creative', 'original', 'unusual',
      'unexpected', 'twist', 'subvert', 'reimagine'
    ];
    
    const innovationCount = innovativeKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    ).length;
    
    score += Math.min(0.6, innovationCount * 0.1);

    return Math.min(1.0, score);
  }

  /**
   * Assess word count against benchmarks
   */
  private assessWordCount(contentType: keyof typeof PREMIUM_BENCHMARKS.wordCount, content: string): number {
    const benchmarks = PREMIUM_BENCHMARKS.wordCount[contentType];
    const wordCount = content.split(/\s+/).length;
    
    if (wordCount < benchmarks.min) {
      return wordCount / benchmarks.min;
    } else if (wordCount >= benchmarks.optimal) {
      return 1.0;
    } else {
      return 0.7 + (wordCount - benchmarks.min) / (benchmarks.optimal - benchmarks.min) * 0.3;
    }
  }

  /**
   * Assess content complexity
   */
  private assessComplexity(content: string): number {
    const words = content.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const vocabularyRichness = uniqueWords / words.length;
    
    let score = 0;
    
    // Vocabulary richness
    if (vocabularyRichness >= PREMIUM_BENCHMARKS.complexity.vocabularyRichness) {
      score += 0.4;
    } else {
      score += (vocabularyRichness / PREMIUM_BENCHMARKS.complexity.vocabularyRichness) * 0.4;
    }

    // Sentence variety
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const lengthVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    
    if (lengthVariance > 20) score += 0.3; // Good sentence variety
    
    // Thematic depth
    const thematicWords = [
      'theme', 'symbolism', 'meaning', 'represents', 'metaphor',
      'allegory', 'significance', 'deeper', 'underlying'
    ];
    
    const thematicCount = thematicWords.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    
    if (thematicCount >= PREMIUM_BENCHMARKS.complexity.thematicDepth) {
      score += 0.3;
    }

    return Math.min(1.0, score);
  }

  /**
   * Assess engagement factors
   */
  private assessEngagement(content: string): number {
    let score = 0;

    // Emotional vocabulary
    const emotionalWords = [
      'thrilling', 'terrifying', 'heartbreaking', 'inspiring',
      'shocking', 'moving', 'captivating', 'haunting'
    ];
    
    const emotionalCount = emotionalWords.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    
    if (emotionalCount >= PREMIUM_BENCHMARKS.engagement.emotionalWords) {
      score += 0.3;
    } else {
      score += (emotionalCount / PREMIUM_BENCHMARKS.engagement.emotionalWords) * 0.3;
    }

    // Sensory details
    const sensoryWords = [
      'see', 'hear', 'smell', 'taste', 'feel', 'touch',
      'sound', 'sight', 'scent', 'texture', 'echo', 'whisper'
    ];
    
    const sensoryCount = sensoryWords.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    
    if (sensoryCount >= PREMIUM_BENCHMARKS.engagement.sensoryDetails) {
      score += 0.4;
    } else {
      score += (sensoryCount / PREMIUM_BENCHMARKS.engagement.sensoryDetails) * 0.4;
    }

    // Action and dialogue
    const actionWords = content.match(/\b(runs?|jumps?|fights?|attacks?|defends?|casts?|strikes?)\b/gi) || [];
    const dialogueMatches = content.match(/"[^"]*"/g) || [];
    
    const actionRatio = actionWords.length / content.split(/\s+/).length;
    const dialogueRatio = dialogueMatches.join(' ').length / content.length;
    
    if (actionRatio >= PREMIUM_BENCHMARKS.engagement.actionVerbs) score += 0.15;
    if (dialogueRatio >= PREMIUM_BENCHMARKS.engagement.dialogueQuality) score += 0.15;

    return Math.min(1.0, score);
  }

  /**
   * Assess presentation quality
   */
  private assessPresentation(content: string): number {
    let score = 0.5; // Base score

    // Check formatting consistency
    if (/^#+\s/m.test(content)) score += 0.1; // Headers
    if (/\*\*[^*]+\*\*/g.test(content)) score += 0.1; // Bold text
    if (/^\s*[-*]\s/m.test(content)) score += 0.1; // Lists
    if (/^\s*\d+\.\s/m.test(content)) score += 0.1; // Numbered lists

    // Check for proper spacing and organization
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) score += 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Identify quality indicators present in content
   */
  private identifyQualityIndicators(content: string): string[] {
    const indicators: string[] = [];

    // Writing quality indicators
    if (this.assessGrammar(content) > 0.8) {
      indicators.push('Excellent grammar and syntax');
    }
    
    if (this.assessWritingStyle(content) > 0.7) {
      indicators.push('Engaging and varied writing style');
    }

    // Content depth indicators
    const emotionalWords = ['fear', 'hope', 'despair', 'joy', 'anger', 'love'];
    const emotionalCount = emotionalWords.filter(word => content.toLowerCase().includes(word)).length;
    if (emotionalCount >= 3) {
      indicators.push('Rich emotional depth');
    }

    // Technical quality indicators
    if (/\d+d\d+/.test(content)) {
      indicators.push('Proper RPG mechanics notation');
    }

    // Innovation indicators
    const innovativeKeywords = ['unique', 'innovative', 'creative', 'original'];
    const innovationCount = innovativeKeywords.filter(keyword => content.toLowerCase().includes(keyword)).length;
    if (innovationCount >= 2) {
      indicators.push('Innovative and creative elements');
    }

    return indicators;
  }

  /**
   * Identify deficiencies in content
   */
  private identifyDeficiencies(contentType: string, content: string): string[] {
    const deficiencies: string[] = [];

    // Word count deficiencies
    const benchmarks = PREMIUM_BENCHMARKS.wordCount[contentType as keyof typeof PREMIUM_BENCHMARKS.wordCount];
    const wordCount = content.split(/\s+/).length;
    
    if (wordCount < benchmarks.min) {
      deficiencies.push(`Content too short (${wordCount} words, minimum ${benchmarks.min})`);
    }

    // Grammar deficiencies
    if (this.assessGrammar(content) < 0.7) {
      deficiencies.push('Grammar and syntax issues detected');
    }

    // Style deficiencies
    if (this.assessWritingStyle(content) < 0.5) {
      deficiencies.push('Writing style lacks engagement and variety');
    }

    // Depth deficiencies
    if (this.assessContentDepth(content) < 0.6) {
      deficiencies.push('Content lacks sufficient depth and detail');
    }

    // Technical deficiencies
    if (this.assessTechnicalAccuracy(contentType, content) < 0.7) {
      deficiencies.push('Technical accuracy and RPG terminology needs improvement');
    }

    return deficiencies;
  }

  /**
   * Generate improvement recommendations
   */
  private generateImprovementRecommendations(
    contentType: string,
    content: string,
    publicationScore: number,
    professionalScore: number,
    premiumScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (publicationScore < 7) {
      recommendations.push('Improve writing quality: focus on grammar, style, and structure');
      recommendations.push('Add more descriptive and engaging language');
    }

    if (professionalScore < 7) {
      recommendations.push('Enhance technical accuracy and RPG-specific content');
      recommendations.push('Improve usability for game masters with clearer instructions');
    }

    if (premiumScore < 7) {
      recommendations.push('Increase content depth and complexity');
      recommendations.push('Add more emotional engagement and sensory details');
    }

    const wordCount = content.split(/\s+/).length;
    const benchmarks = PREMIUM_BENCHMARKS.wordCount[contentType as keyof typeof PREMIUM_BENCHMARKS.wordCount];
    
    if (wordCount < benchmarks.optimal) {
      recommendations.push(`Expand content to reach optimal length (${benchmarks.optimal} words)`);
    }

    if (this.assessInnovation(content) < 0.6) {
      recommendations.push('Add more unique and innovative elements');
    }

    return recommendations;
  }

  /**
   * Assess overall market readiness
   */
  private assessMarketReadiness(
    publicationScore: number,
    professionalScore: number,
    premiumScore: number
  ): boolean {
    const averageScore = (publicationScore + professionalScore + premiumScore) / 3;
    return averageScore >= 7.5 && 
           publicationScore >= 7 && 
           professionalScore >= 7 && 
           premiumScore >= 6;
  }

  /**
   * Batch validate multiple content pieces
   */
  async batchValidateProfessionalPolish(
    contentItems: Array<{
      id: string;
      type: keyof typeof PREMIUM_BENCHMARKS.wordCount;
      content: string;
    }>
  ): Promise<ProfessionalPolishAnalysis[]> {
    const analyses = await Promise.all(
      contentItems.map(item =>
        this.validateProfessionalPolish(item.id, item.type, item.content)
      )
    );

    return analyses;
  }

  /**
   * Get professional polish summary
   */
  getProfessionalPolishSummary(analyses: ProfessionalPolishAnalysis[]): {
    averagePublicationQuality: number;
    averageProfessionalStandards: number;
    averagePremiumQuality: number;
    marketReadyCount: number;
    commonDeficiencies: string[];
    topRecommendations: string[];
  } {
    const avgPublication = analyses.reduce((sum, a) => sum + a.publicationQualityScore, 0) / analyses.length;
    const avgProfessional = analyses.reduce((sum, a) => sum + a.professionalStandardsScore, 0) / analyses.length;
    const avgPremium = analyses.reduce((sum, a) => sum + a.premiumQualityScore, 0) / analyses.length;
    const marketReadyCount = analyses.filter(a => a.marketReadiness).length;

    // Collect common deficiencies
    const allDeficiencies = analyses.flatMap(a => a.deficiencies);
    const deficiencyCounts = allDeficiencies.reduce((counts, deficiency) => {
      counts[deficiency] = (counts[deficiency] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const commonDeficiencies = Object.entries(deficiencyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([deficiency]) => deficiency);

    // Collect top recommendations
    const allRecommendations = analyses.flatMap(a => a.improvementRecommendations);
    const recommendationCounts = allRecommendations.reduce((counts, rec) => {
      counts[rec] = (counts[rec] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const topRecommendations = Object.entries(recommendationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([recommendation]) => recommendation);

    return {
      averagePublicationQuality: avgPublication,
      averageProfessionalStandards: avgProfessional,
      averagePremiumQuality: avgPremium,
      marketReadyCount,
      commonDeficiencies,
      topRecommendations
    };
  }
}

export const professionalPolishValidator = new ProfessionalPolishValidator();