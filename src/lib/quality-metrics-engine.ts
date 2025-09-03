/**
 * Quality Metrics Engine - The Unicorn Score Calculator
 * 
 * This engine calculates comprehensive quality metrics that determine if content
 * is ready for Silicon Valley unicorn status. It evaluates everything from
 * content quality to viral potential, providing users with clear feedback
 * on their adventure's professional readiness.
 */

import type { ProfessionalEnhancement } from './professional-mode-manager';

// Core quality metric interfaces
export interface QualityMetrics {
  contentQuality: number;        // 0-100: Content depth, creativity, and engagement
  mechanicalAccuracy: number;    // 0-100: Rules accuracy and game balance
  editorialStandards: number;    // 0-100: Writing quality, formatting, and polish
  userExperience: number;        // 0-100: Usability, accessibility, and clarity
  professionalReadiness: number; // 0-100: Publication and commercial readiness
  overallScore: number;          // Weighted average of all metrics
  unicornScore: number;          // 0-100: Viral potential and memorability
  processingTime: number;        // Generation time in milliseconds
  featuresSuccessRate: number;   // Percentage of features that applied successfully
}

export interface QualityBreakdown {
  metrics: QualityMetrics;
  grade: ProfessionalGrade;
  strengths: string[];
  improvements: string[];
  unicornFactors: UnicornFactor[];
  competitorComparison: CompetitorComparison;
  marketReadiness: MarketReadiness;
}

export interface UnicornFactor {
  category: 'viral-potential' | 'memorability' | 'shareability' | 'innovation' | 'epicness';
  score: number;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'unicorn-level';
}

export interface CompetitorComparison {
  vsStandardContent: number;     // How much better than standard content (percentage)
  vsIndustryAverage: number;     // How much better than industry average (percentage)
  vsPremiumContent: number;      // How much better than premium content (percentage)
  marketPosition: 'below-average' | 'average' | 'above-average' | 'premium' | 'unicorn-tier';
}

export interface MarketReadiness {
  commercialViability: number;   // 0-100: Ready for commercial use
  scalabilityPotential: number;  // 0-100: Potential for scaling
  userAdoptionLikelihood: number; // 0-100: Likelihood users will adopt
  revenueGeneration: number;     // 0-100: Potential for revenue generation
  overallReadiness: number;      // Weighted average
}

export type ProfessionalGrade = 'Standard' | 'Professional' | 'Premium' | 'Publication-Ready' | 'Unicorn-Tier';

/**
 * Quality Metrics Engine - The Silicon Valley Quality Calculator
 */
export class QualityMetricsEngine {
  private industryBenchmarks = {
    standardContent: 65,
    industryAverage: 72,
    premiumContent: 85,
    unicornThreshold: 95
  };

  private weightings = {
    contentQuality: 0.25,
    mechanicalAccuracy: 0.20,
    editorialStandards: 0.20,
    userExperience: 0.15,
    professionalReadiness: 0.20
  };

  private unicornWeightings = {
    viralPotential: 0.30,
    memorability: 0.25,
    shareability: 0.20,
    innovation: 0.15,
    epicness: 0.10
  };

  constructor() {
    console.log('📊 [QUALITY-ENGINE] Quality Metrics Engine initializing for unicorn-level analysis...');
  }

  /**
   * Calculate comprehensive quality metrics for an enhanced adventure
   */
  calculateQualityMetrics(enhancement: ProfessionalEnhancement): QualityMetrics {
    console.log('🔍 [QUALITY-ENGINE] Calculating unicorn-level quality metrics...');

    const startTime = Date.now();

    // Calculate individual quality components
    const contentQuality = this.calculateContentQuality(enhancement);
    const mechanicalAccuracy = this.calculateMechanicalAccuracy(enhancement);
    const editorialStandards = this.calculateEditorialStandards(enhancement);
    const userExperience = this.calculateUserExperience(enhancement);
    const professionalReadiness = this.calculateProfessionalReadiness(enhancement);

    // Calculate weighted overall score
    const overallScore = 
      (contentQuality * this.weightings.contentQuality) +
      (mechanicalAccuracy * this.weightings.mechanicalAccuracy) +
      (editorialStandards * this.weightings.editorialStandards) +
      (userExperience * this.weightings.userExperience) +
      (professionalReadiness * this.weightings.professionalReadiness);

    // Calculate unicorn score
    const unicornScore = this.calculateUnicornScore(enhancement);

    // Calculate features success rate
    const totalFeatures = 8; // Total number of professional features
    const appliedFeatures = enhancement.featuresApplied.length;
    const featuresSuccessRate = (appliedFeatures / totalFeatures) * 100;

    const processingTime = Date.now() - startTime;

    const metrics: QualityMetrics = {
      contentQuality: Math.round(contentQuality * 100) / 100,
      mechanicalAccuracy: Math.round(mechanicalAccuracy * 100) / 100,
      editorialStandards: Math.round(editorialStandards * 100) / 100,
      userExperience: Math.round(userExperience * 100) / 100,
      professionalReadiness: Math.round(professionalReadiness * 100) / 100,
      overallScore: Math.round(overallScore * 100) / 100,
      unicornScore: Math.round(unicornScore * 100) / 100,
      processingTime: enhancement.processingTime || 0,
      featuresSuccessRate: Math.round(featuresSuccessRate * 100) / 100
    };

    console.log(`📊 [QUALITY-ENGINE] Quality metrics calculated:`);
    console.log(`   📝 Content Quality: ${metrics.contentQuality}/100`);
    console.log(`   ⚖️ Mechanical Accuracy: ${metrics.mechanicalAccuracy}/100`);
    console.log(`   ✨ Editorial Standards: ${metrics.editorialStandards}/100`);
    console.log(`   👤 User Experience: ${metrics.userExperience}/100`);
    console.log(`   🏆 Professional Readiness: ${metrics.professionalReadiness}/100`);
    console.log(`   🎯 Overall Score: ${metrics.overallScore}/100`);
    console.log(`   🦄 Unicorn Score: ${metrics.unicornScore}/100`);

    return metrics;
  }

  /**
   * Generate comprehensive quality breakdown with unicorn analysis
   */
  generateQualityBreakdown(enhancement: ProfessionalEnhancement): QualityBreakdown {
    console.log('📋 [QUALITY-ENGINE] Generating comprehensive quality breakdown...');

    const metrics = this.calculateQualityMetrics(enhancement);
    const grade = this.determineProfessionalGrade(metrics);
    const strengths = this.identifyStrengths(metrics, enhancement);
    const improvements = this.identifyImprovements(metrics, enhancement);
    const unicornFactors = this.analyzeUnicornFactors(enhancement);
    const competitorComparison = this.compareToCompetitors(metrics);
    const marketReadiness = this.assessMarketReadiness(metrics, enhancement);

    const breakdown: QualityBreakdown = {
      metrics,
      grade,
      strengths,
      improvements,
      unicornFactors,
      competitorComparison,
      marketReadiness
    };

    console.log(`🏆 [QUALITY-ENGINE] Quality breakdown complete - Grade: ${grade}`);
    console.log(`🦄 [QUALITY-ENGINE] Unicorn potential: ${metrics.unicornScore}/100`);
    console.log(`📈 [QUALITY-ENGINE] Market position: ${competitorComparison.marketPosition}`);

    return breakdown;
  }

  /**
   * Determine professional grade based on metrics
   */
  determineProfessionalGrade(metrics: QualityMetrics): ProfessionalGrade {
    const score = Math.max(metrics.overallScore, metrics.unicornScore * 0.8);

    if (score >= 99 && metrics.unicornScore >= 95) return 'Unicorn-Tier';
    if (score >= 95) return 'Publication-Ready';
    if (score >= 90) return 'Premium';
    if (score >= 80) return 'Professional';
    return 'Standard';
  }

  // Private calculation methods

  private calculateContentQuality(enhancement: ProfessionalEnhancement): number {
    
    // Fallback for missing professional features
    if (!enhancement.professionalFeatures) {
      console.log('⚠️ [QUALITY-ENGINE] No professional features found, using base score');
      return 75; // Base score for standard content
    }
    let score = 75; // Base score for standard content

    // Bonus for enhanced prompt analysis
    if (enhancement.professionalFeatures?.enhancedPromptAnalysis) {
      const analysis = enhancement.professionalFeatures?.enhancedPromptAnalysis;
      score += (analysis.complexityScore || 0) * 0.15;
      score += (analysis.unicornPotential || 0) * 0.10;
    }

    // Bonus for multi-solution puzzles
    if (enhancement.professionalFeatures?.multiSolutionPuzzles?.length) {
      const avgCreativity = enhancement.professionalFeatures?.multiSolutionPuzzles
        .reduce((sum, puzzle) => sum + (puzzle.creativityScore || 80), 0) / 
        enhancement.professionalFeatures?.multiSolutionPuzzles?.length || 1;
      score += avgCreativity * 0.12;
    }

    // Bonus for enhanced NPCs
    if (enhancement.professionalFeatures?.enhancedNPCs?.length) {
      const avgMemorability = enhancement.professionalFeatures?.enhancedNPCs
        .reduce((sum, npc) => sum + (npc.memoryFactor || 80), 0) / 
        enhancement.professionalFeatures?.enhancedNPCs?.length || 1;
      score += avgMemorability * 0.10;
    }

    return Math.min(100, score);
  }

  private calculateMechanicalAccuracy(enhancement: ProfessionalEnhancement): number {
    let score = 80; // Base score for standard mechanics

    // Bonus for mathematical validation
    if (enhancement.professionalFeatures?.validationReport) {
      const report = enhancement.professionalFeatures?.validationReport;
      score = Math.max(score, report.mathematicalAccuracy || 80);
    }

    // Bonus for tactical combat features
    if (enhancement.professionalFeatures?.tacticalCombat?.length) {
      score += 8; // Tactical combat adds mechanical depth
    }

    // Bonus for multi-solution puzzles (mechanical variety)
    if (enhancement.professionalFeatures?.multiSolutionPuzzles?.length) {
      score += 5;
    }

    return Math.min(100, score);
  }

  private calculateEditorialStandards(enhancement: ProfessionalEnhancement): number {
    let score = 70; // Base score for standard writing

    // Bonus for editorial enhancements
    if (enhancement.professionalFeatures?.editorialEnhancements?.length) {
      const avgQuality = enhancement.professionalFeatures?.editorialEnhancements
        .reduce((sum, edit) => sum + (edit.qualityScore || 80), 0) / 
        enhancement.professionalFeatures?.editorialEnhancements?.length || 1;
      score = Math.max(score, avgQuality);
    }

    // Bonus for professional layout
    if (enhancement.professionalFeatures?.professionalLayout) {
      score += 12; // Professional layout significantly improves editorial standards
    }

    return Math.min(100, score);
  }

  private calculateUserExperience(enhancement: ProfessionalEnhancement): number {
    let score = 75; // Base score for standard UX

    // Bonus for accessibility features
    if (enhancement.professionalFeatures?.accessibilityFeatures?.length) {
      const avgInclusivity = enhancement.professionalFeatures?.accessibilityFeatures
        .reduce((sum, feature) => sum + (feature.inclusivityScore || 80), 0) / 
        enhancement.professionalFeatures?.accessibilityFeatures?.length || 1;
      score += avgInclusivity * 0.15;
    }

    // Bonus for professional layout (improves readability)
    if (enhancement.professionalFeatures?.professionalLayout) {
      score += 8;
    }

    // Bonus for clear structure and organization
    if (enhancement.professionalFeatures?.editorialEnhancements?.length) {
      score += 5;
    }

    return Math.min(100, score);
  }

  private calculateProfessionalReadiness(enhancement: ProfessionalEnhancement): number {
    let score = 70; // Base score for standard content

    // Major bonus for validation report
    if (enhancement.professionalFeatures?.validationReport) {
      const report = enhancement.professionalFeatures?.validationReport;
      score = Math.max(score, report.overallScore || 70);
    }

    // Bonus for editorial excellence
    if (enhancement.professionalFeatures?.editorialEnhancements?.length) {
      score += 10;
    }

    // Bonus for professional layout
    if (enhancement.professionalFeatures?.professionalLayout) {
      score += 8;
    }

    // Bonus for accessibility compliance
    if (enhancement.professionalFeatures?.accessibilityFeatures?.length) {
      score += 7;
    }

    return Math.min(100, score);
  }

  private calculateUnicornScore(enhancement: ProfessionalEnhancement): number {
    let viralPotential = 60;
    let memorability = 60;
    let shareability = 60;
    let innovation = 60;
    let epicness = 60;

    // Analyze viral potential from puzzles
    if (enhancement.professionalFeatures?.multiSolutionPuzzles?.length) {
      const puzzles = enhancement.professionalFeatures?.multiSolutionPuzzles;
      viralPotential = Math.max(viralPotential, 
        puzzles.reduce((max, puzzle) => Math.max(max, puzzle.creativityScore || 60), 60)
      );
    }

    // Analyze memorability from NPCs
    if (enhancement.professionalFeatures?.enhancedNPCs?.length) {
      const npcs = enhancement.professionalFeatures?.enhancedNPCs;
      memorability = Math.max(memorability,
        npcs.reduce((max, npc) => Math.max(max, npc.memoryFactor || 60), 60)
      );
    }

    // Analyze shareability from editorial quality
    if (enhancement.professionalFeatures?.editorialEnhancements?.length) {
      shareability = Math.max(shareability, 85);
    }

    // Analyze innovation from prompt analysis
    if (enhancement.professionalFeatures?.enhancedPromptAnalysis) {
      innovation = Math.max(innovation, enhancement.professionalFeatures?.enhancedPromptAnalysis.unicornPotential || 60);
    }

    // Analyze epicness from tactical combat
    if (enhancement.professionalFeatures?.tacticalCombat?.length) {
      const combat = enhancement.professionalFeatures?.tacticalCombat;
      epicness = Math.max(epicness,
        combat.reduce((max, feature) => Math.max(max, feature.epicnessLevel || 60), 60)
      );
    }

    // Calculate weighted unicorn score
    const unicornScore = 
      (viralPotential * this.unicornWeightings.viralPotential) +
      (memorability * this.unicornWeightings.memorability) +
      (shareability * this.unicornWeightings.shareability) +
      (innovation * this.unicornWeightings.innovation) +
      (epicness * this.unicornWeightings.epicness);

    return Math.min(100, unicornScore);
  }

  private identifyStrengths(metrics: QualityMetrics, enhancement: ProfessionalEnhancement): string[] {
    const strengths: string[] = [];

    if (metrics.contentQuality >= 90) {
      strengths.push('🎨 Exceptional content creativity and depth');
    }
    if (metrics.mechanicalAccuracy >= 95) {
      strengths.push('⚖️ Perfect mechanical accuracy and balance');
    }
    if (metrics.editorialStandards >= 90) {
      strengths.push('✨ Publication-quality writing and formatting');
    }
    if (metrics.userExperience >= 90) {
      strengths.push('👤 Outstanding user experience and accessibility');
    }
    if (metrics.unicornScore >= 90) {
      strengths.push('🦄 Unicorn-level viral potential and memorability');
    }
    if (enhancement.featuresApplied.length >= 7) {
      strengths.push('🚀 Comprehensive professional feature integration');
    }

    if (strengths.length === 0) {
      strengths.push('📝 Solid foundation with room for enhancement');
    }

    return strengths;
  }

  private identifyImprovements(metrics: QualityMetrics, enhancement: ProfessionalEnhancement): string[] {
    const improvements: string[] = [];

    if (metrics.contentQuality < 85) {
      improvements.push('📝 Enhance content creativity and narrative depth');
    }
    if (metrics.mechanicalAccuracy < 90) {
      improvements.push('⚖️ Improve mechanical accuracy and game balance');
    }
    if (metrics.editorialStandards < 85) {
      improvements.push('✨ Polish writing quality and formatting');
    }
    if (metrics.userExperience < 85) {
      improvements.push('👤 Enhance accessibility and user experience');
    }
    if (metrics.unicornScore < 80) {
      improvements.push('🦄 Increase viral potential and memorable moments');
    }
    if (enhancement.featuresApplied.length < 6) {
      improvements.push('🔧 Enable more professional features for better quality');
    }

    if (improvements.length === 0) {
      improvements.push('🏆 Content is already at unicorn-tier quality!');
    }

    return improvements;
  }

  private analyzeUnicornFactors(enhancement: ProfessionalEnhancement): UnicornFactor[] {
    const factors: UnicornFactor[] = [];

    // Viral potential from puzzles
    if (enhancement.professionalFeatures?.multiSolutionPuzzles?.length) {
      factors.push({
        category: 'viral-potential',
        score: 92,
        description: 'Multi-solution puzzles create shareable "aha!" moments',
        impact: 'unicorn-level'
      });
    }

    // Memorability from NPCs
    if (enhancement.professionalFeatures?.enhancedNPCs?.length) {
      factors.push({
        category: 'memorability',
        score: 89,
        description: 'Enhanced NPCs with rich personalities stick in players\' minds',
        impact: 'high'
      });
    }

    // Shareability from quality
    if (enhancement.professionalFeatures?.editorialEnhancements?.length) {
      factors.push({
        category: 'shareability',
        score: 86,
        description: 'Professional polish makes content worth sharing',
        impact: 'high'
      });
    }

    // Innovation from analysis
    if (enhancement.professionalFeatures?.enhancedPromptAnalysis) {
      factors.push({
        category: 'innovation',
        score: 94,
        description: 'AI-enhanced creativity produces unique, innovative content',
        impact: 'unicorn-level'
      });
    }

    // Epicness from combat
    if (enhancement.professionalFeatures?.tacticalCombat?.length) {
      factors.push({
        category: 'epicness',
        score: 91,
        description: 'Tactical combat creates legendary, epic moments',
        impact: 'unicorn-level'
      });
    }

    return factors;
  }

  private compareToCompetitors(metrics: QualityMetrics): CompetitorComparison {
    const score = metrics.overallScore;
    
    const vsStandardContent = ((score - this.industryBenchmarks.standardContent) / this.industryBenchmarks.standardContent) * 100;
    const vsIndustryAverage = ((score - this.industryBenchmarks.industryAverage) / this.industryBenchmarks.industryAverage) * 100;
    const vsPremiumContent = ((score - this.industryBenchmarks.premiumContent) / this.industryBenchmarks.premiumContent) * 100;

    let marketPosition: CompetitorComparison['marketPosition'];
    if (score >= this.industryBenchmarks.unicornThreshold) {
      marketPosition = 'unicorn-tier';
    } else if (score >= this.industryBenchmarks.premiumContent) {
      marketPosition = 'premium';
    } else if (score >= this.industryBenchmarks.industryAverage) {
      marketPosition = 'above-average';
    } else if (score >= this.industryBenchmarks.standardContent) {
      marketPosition = 'average';
    } else {
      marketPosition = 'below-average';
    }

    return {
      vsStandardContent: Math.round(vsStandardContent),
      vsIndustryAverage: Math.round(vsIndustryAverage),
      vsPremiumContent: Math.round(vsPremiumContent),
      marketPosition
    };
  }

  private assessMarketReadiness(metrics: QualityMetrics, enhancement: ProfessionalEnhancement): MarketReadiness {
    const commercialViability = Math.min(100, metrics.professionalReadiness * 1.1);
    const scalabilityPotential = Math.min(100, (metrics.overallScore + metrics.unicornScore) / 2);
    const userAdoptionLikelihood = Math.min(100, metrics.userExperience * 1.05);
    const revenueGeneration = Math.min(100, (metrics.unicornScore + metrics.professionalReadiness) / 2);

    const overallReadiness = (
      commercialViability * 0.3 +
      scalabilityPotential * 0.25 +
      userAdoptionLikelihood * 0.25 +
      revenueGeneration * 0.2
    );

    return {
      commercialViability: Math.round(commercialViability),
      scalabilityPotential: Math.round(scalabilityPotential),
      userAdoptionLikelihood: Math.round(userAdoptionLikelihood),
      revenueGeneration: Math.round(revenueGeneration),
      overallReadiness: Math.round(overallReadiness)
    };
  }
}

// Export singleton instance for unicorn-level quality analysis
export const qualityMetricsEngine = new QualityMetricsEngine();

// 📊 QUALITY METRICS ENGINE READY FOR UNICORN ANALYSIS! 📊
console.log('📊 Quality Metrics Engine loaded - Silicon Valley quality standards activated!');