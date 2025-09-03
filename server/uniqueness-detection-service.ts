import { z } from 'zod';

// Schema for uniqueness analysis
const UniquenessAnalysisSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(['adventure', 'npc', 'monster', 'location', 'item']),
  content: z.string(),
  uniquenessScore: z.number().min(0).max(10),
  genericityIndicators: z.array(z.string()),
  differentiationFactors: z.array(z.string()),
  competitiveAdvantage: z.number().min(0).max(10),
  recommendations: z.array(z.string())
});

type UniquenessAnalysis = z.infer<typeof UniquenessAnalysisSchema>;

// Generic content patterns to detect
const GENERIC_PATTERNS = {
  adventure: [
    /the ancient evil has awakened/i,
    /a mysterious stranger approaches/i,
    /the tavern keeper has a quest/i,
    /goblins have been raiding/i,
    /the princess has been kidnapped/i,
    /a dark cult threatens/i,
    /the artifact must be found/i
  ],
  npc: [
    /gruff but kind hearted/i,
    /mysterious hooded figure/i,
    /wise old sage/i,
    /corrupt noble/i,
    /simple farmer/i,
    /battle-scarred veteran/i
  ],
  monster: [
    /ancient dragon/i,
    /mindless undead/i,
    /savage orc/i,
    /cunning goblin/i,
    /evil wizard/i,
    /demonic entity/i
  ],
  location: [
    /dark dungeon/i,
    /haunted castle/i,
    /mysterious forest/i,
    /ancient ruins/i,
    /bustling tavern/i,
    /peaceful village/i
  ],
  item: [
    /glowing sword/i,
    /ancient tome/i,
    /magical ring/i,
    /healing potion/i,
    /cursed artifact/i,
    /enchanted armor/i
  ]
};

// Market differentiation indicators
const DIFFERENTIATION_INDICATORS = {
  narrative: [
    'unique premise',
    'innovative mechanics',
    'subverted tropes',
    'complex motivations',
    'moral ambiguity',
    'interconnected plots',
    'environmental storytelling'
  ],
  character: [
    'distinctive voice',
    'complex relationships',
    'hidden depths',
    'personal stakes',
    'character growth',
    'memorable quirks',
    'unique background'
  ],
  mechanical: [
    'custom rules',
    'innovative encounters',
    'creative solutions',
    'tactical depth',
    'player agency',
    'meaningful choices',
    'emergent gameplay'
  ]
};

export class UniquenessDetectionService {
  /**
   * Analyze content for uniqueness and market differentiation
   */
  async analyzeUniqueness(
    contentId: string,
    contentType: keyof typeof GENERIC_PATTERNS,
    content: string
  ): Promise<UniquenessAnalysis> {
    const genericityIndicators = this.detectGenericPatterns(contentType, content);
    const differentiationFactors = this.identifyDifferentiationFactors(content);
    const uniquenessScore = this.calculateUniquenessScore(genericityIndicators, differentiationFactors, content);
    const competitiveAdvantage = this.assessCompetitiveAdvantage(differentiationFactors, content);
    const recommendations = this.generateRecommendations(genericityIndicators, differentiationFactors, uniquenessScore);

    return {
      contentId,
      contentType,
      content,
      uniquenessScore,
      genericityIndicators,
      differentiationFactors,
      competitiveAdvantage,
      recommendations
    };
  }

  /**
   * Detect generic content patterns
   */
  private detectGenericPatterns(contentType: keyof typeof GENERIC_PATTERNS, content: string): string[] {
    const patterns = GENERIC_PATTERNS[contentType] || [];
    const indicators: string[] = [];

    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        indicators.push(`Generic ${contentType} pattern: ${pattern.source}`);
      }
    });

    // Additional generic indicators
    const wordCount = content.split(/\s+/).length;
    const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size;
    const vocabularyRichness = uniqueWords / wordCount;

    if (vocabularyRichness < 0.6) {
      indicators.push('Low vocabulary richness indicates generic language');
    }

    // Check for clichéd phrases
    const cliches = [
      'once upon a time',
      'it was a dark and stormy night',
      'little did they know',
      'against all odds',
      'in the nick of time',
      'fate would have it'
    ];

    cliches.forEach(cliche => {
      if (content.toLowerCase().includes(cliche)) {
        indicators.push(`Clichéd phrase detected: "${cliche}"`);
      }
    });

    return indicators;
  }

  /**
   * Identify factors that differentiate content from generic alternatives
   */
  private identifyDifferentiationFactors(content: string): string[] {
    const factors: string[] = [];
    const lowerContent = content.toLowerCase();

    // Check for narrative differentiation
    DIFFERENTIATION_INDICATORS.narrative.forEach(indicator => {
      if (this.hasIndicatorEvidence(lowerContent, indicator)) {
        factors.push(`Narrative: ${indicator}`);
      }
    });

    // Check for character differentiation
    DIFFERENTIATION_INDICATORS.character.forEach(indicator => {
      if (this.hasIndicatorEvidence(lowerContent, indicator)) {
        factors.push(`Character: ${indicator}`);
      }
    });

    // Check for mechanical differentiation
    DIFFERENTIATION_INDICATORS.mechanical.forEach(indicator => {
      if (this.hasIndicatorEvidence(lowerContent, indicator)) {
        factors.push(`Mechanical: ${indicator}`);
      }
    });

    // Check for specific unique elements
    if (this.hasSpecificDetails(content)) {
      factors.push('Rich specific details');
    }

    if (this.hasInnovativeElements(content)) {
      factors.push('Innovative game elements');
    }

    if (this.hasEmotionalDepth(content)) {
      factors.push('Emotional depth and resonance');
    }

    return factors;
  }

  /**
   * Check if content has evidence of a differentiation indicator
   */
  private hasIndicatorEvidence(content: string, indicator: string): boolean {
    const evidencePatterns: Record<string, RegExp[]> = {
      'unique premise': [/unlike.*typical/i, /never.*before/i, /innovative.*approach/i],
      'subverted tropes': [/expects.*but/i, /appears.*actually/i, /twist.*reveals/i],
      'complex motivations': [/because.*and.*also/i, /torn between/i, /conflicted/i],
      'moral ambiguity': [/right.*wrong/i, /gray.*area/i, /difficult.*choice/i],
      'distinctive voice': [/speaks.*manner/i, /unique.*way/i, /characteristic.*speech/i],
      'personal stakes': [/family/i, /revenge/i, /redemption/i, /legacy/i],
      'tactical depth': [/strategy/i, /positioning/i, /terrain/i, /coordination/i]
    };

    const patterns = evidencePatterns[indicator] || [];
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for specific, detailed content vs generic descriptions
   */
  private hasSpecificDetails(content: string): boolean {
    // Count specific numbers, names, and detailed descriptions
    const specificNumbers = (content.match(/\b\d+\b/g) || []).length;
    const properNouns = (content.match(/\b[A-Z][a-z]+\b/g) || []).length;
    const detailedDescriptions = (content.match(/\b(intricate|detailed|specific|particular|precise)\b/gi) || []).length;

    return specificNumbers > 3 || properNouns > 5 || detailedDescriptions > 2;
  }

  /**
   * Check for innovative game elements
   */
  private hasInnovativeElements(content: string): boolean {
    const innovativeKeywords = [
      'innovative', 'unique', 'never seen', 'original', 'creative',
      'custom', 'homebrew', 'experimental', 'unconventional'
    ];

    return innovativeKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
  }

  /**
   * Check for emotional depth and resonance
   */
  private hasEmotionalDepth(content: string): boolean {
    const emotionalKeywords = [
      'fear', 'hope', 'despair', 'joy', 'anger', 'love', 'hate',
      'betrayal', 'loyalty', 'sacrifice', 'redemption', 'loss',
      'grief', 'triumph', 'struggle', 'yearning'
    ];

    const emotionalCount = emotionalKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    ).length;

    return emotionalCount >= 3;
  }

  /**
   * Calculate overall uniqueness score
   */
  private calculateUniquenessScore(
    genericityIndicators: string[],
    differentiationFactors: string[],
    content: string
  ): number {
    let score = 5; // Base score

    // Penalize for generic patterns
    score -= Math.min(genericityIndicators.length * 0.5, 3);

    // Reward for differentiation factors
    score += Math.min(differentiationFactors.length * 0.3, 3);

    // Bonus for content length and complexity
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 500) score += 0.5;
    if (wordCount > 1000) score += 0.5;

    // Ensure score is within bounds
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Assess competitive advantage
   */
  private assessCompetitiveAdvantage(differentiationFactors: string[], content: string): number {
    let advantage = 0;

    // Strong differentiation factors
    const strongFactors = differentiationFactors.filter(factor =>
      factor.includes('innovative') || 
      factor.includes('unique') || 
      factor.includes('complex')
    ).length;

    advantage += strongFactors * 1.5;

    // Professional quality indicators
    if (this.hasSpecificDetails(content)) advantage += 1;
    if (this.hasInnovativeElements(content)) advantage += 1.5;
    if (this.hasEmotionalDepth(content)) advantage += 1;

    return Math.max(0, Math.min(10, advantage));
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(
    genericityIndicators: string[],
    differentiationFactors: string[],
    uniquenessScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (uniquenessScore < 6) {
      recommendations.push('Content needs significant improvement to achieve market differentiation');
    }

    if (genericityIndicators.length > 2) {
      recommendations.push('Remove or subvert generic patterns and clichés');
      recommendations.push('Add unique twists to common tropes');
    }

    if (differentiationFactors.length < 3) {
      recommendations.push('Incorporate more innovative elements');
      recommendations.push('Develop more complex character motivations');
      recommendations.push('Add unique mechanical elements');
    }

    if (!differentiationFactors.some(f => f.includes('Narrative'))) {
      recommendations.push('Strengthen narrative uniqueness with innovative premises');
    }

    if (!differentiationFactors.some(f => f.includes('Character'))) {
      recommendations.push('Develop more distinctive character voices and relationships');
    }

    if (!differentiationFactors.some(f => f.includes('Mechanical'))) {
      recommendations.push('Add custom rules or innovative encounter mechanics');
    }

    return recommendations;
  }

  /**
   * Batch analyze multiple content pieces
   */
  async batchAnalyzeUniqueness(
    contentItems: Array<{
      id: string;
      type: keyof typeof GENERIC_PATTERNS;
      content: string;
    }>
  ): Promise<UniquenessAnalysis[]> {
    const analyses = await Promise.all(
      contentItems.map(item =>
        this.analyzeUniqueness(item.id, item.type, item.content)
      )
    );

    return analyses;
  }

  /**
   * Get market differentiation summary
   */
  getMarketDifferentiationSummary(analyses: UniquenessAnalysis[]): {
    averageUniqueness: number;
    averageCompetitiveAdvantage: number;
    topDifferentiators: string[];
    commonWeaknesses: string[];
    overallRecommendations: string[];
  } {
    const avgUniqueness = analyses.reduce((sum, a) => sum + a.uniquenessScore, 0) / analyses.length;
    const avgAdvantage = analyses.reduce((sum, a) => sum + a.competitiveAdvantage, 0) / analyses.length;

    // Collect all differentiation factors
    const allFactors = analyses.flatMap(a => a.differentiationFactors);
    const factorCounts = allFactors.reduce((counts, factor) => {
      counts[factor] = (counts[factor] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const topDifferentiators = Object.entries(factorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([factor]) => factor);

    // Collect common weaknesses
    const allIndicators = analyses.flatMap(a => a.genericityIndicators);
    const indicatorCounts = allIndicators.reduce((counts, indicator) => {
      counts[indicator] = (counts[indicator] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const commonWeaknesses = Object.entries(indicatorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([indicator]) => indicator);

    // Generate overall recommendations
    const overallRecommendations: string[] = [];
    
    if (avgUniqueness < 7) {
      overallRecommendations.push('Focus on increasing overall content uniqueness');
    }
    
    if (avgAdvantage < 6) {
      overallRecommendations.push('Strengthen competitive differentiation factors');
    }

    if (commonWeaknesses.length > 0) {
      overallRecommendations.push('Address recurring generic patterns across content');
    }

    return {
      averageUniqueness: avgUniqueness,
      averageCompetitiveAdvantage: avgAdvantage,
      topDifferentiators,
      commonWeaknesses,
      overallRecommendations
    };
  }
}

export const uniquenessDetectionService = new UniquenessDetectionService();