import { describe, it, expect, beforeEach } from 'vitest';
import { uniquenessDetectionService } from '../server/uniqueness-detection-service';
import { professionalPolishValidator } from '../server/professional-polish-validator';
import { userSatisfactionMetrics } from '../server/user-satisfaction-metrics';
import { marketDifferentiationValidator } from '../server/market-differentiation-validator';

describe('Market Differentiation Validation System', () => {
  describe('UniquenessDetectionService', () => {
    it('should detect generic patterns in adventure content', async () => {
      const genericAdventure = `
        The ancient evil has awakened in the dark dungeon. 
        A mysterious stranger approaches the party in the bustling tavern.
        Goblins have been raiding the peaceful village.
      `;

      const analysis = await uniquenessDetectionService.analyzeUniqueness(
        'test-1', 'adventure', genericAdventure
      );

      expect(analysis.uniquenessScore).toBeLessThan(6);
      expect(analysis.genericityIndicators.length).toBeGreaterThan(0);
      expect(analysis.genericityIndicators.some(indicator => 
        indicator.includes('ancient evil') || 
        indicator.includes('mysterious stranger') ||
        indicator.includes('goblins')
      )).toBe(true);
    });

    it('should identify differentiation factors in unique content', async () => {
      const uniqueAdventure = `
        The Clockwork Rebellion has begun in the steam-powered city of Gearsholm.
        Artificer-rebels have turned the city's mechanical servants against their masters,
        creating a complex web of political intrigue where players must navigate
        between the oppressed construct workers and the wealthy gear-barons.
        This innovative premise subverts typical fantasy tropes by exploring
        themes of artificial consciousness and industrial revolution dynamics.
      `;

      const analysis = await uniquenessDetectionService.analyzeUniqueness(
        'test-2', 'adventure', uniqueAdventure
      );

      expect(analysis.uniquenessScore).toBeGreaterThan(6);
      expect(analysis.differentiationFactors.length).toBeGreaterThan(0);
      expect(analysis.competitiveAdvantage).toBeGreaterThan(5);
    });

    it('should provide improvement recommendations for generic content', async () => {
      const genericContent = 'A simple farmer needs help with goblins.';

      const analysis = await uniquenessDetectionService.analyzeUniqueness(
        'test-3', 'adventure', genericContent
      );

      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.recommendations.some(rec => 
        rec.includes('unique') || rec.includes('innovative')
      )).toBe(true);
    });
  });

  describe('ProfessionalPolishValidator', () => {
    it('should assess publication quality standards', async () => {
      const highQualityContent = `
        # The Shattered Crown Campaign

        ## Background
        The kingdom of Valdris stands on the precipice of civil war. When the ancient Crown of Stars—a powerful artifact that has maintained peace for centuries—shatters into seven fragments, the delicate balance of power crumbles with it.

        ## Adventure Overview
        This epic campaign follows the heroes as they race against time to recover the crown fragments before they fall into the wrong hands. Each fragment grants immense power but also corrupts its bearer, creating moral dilemmas that will test the party's resolve.

        ### Act I: The Shattering
        The adventure begins during the Festival of Lights in the capital city of Lumenhall. As the king performs the traditional blessing ceremony, the Crown of Stars suddenly fractures, sending shockwaves of magical energy throughout the realm.

        **Read Aloud:** "The golden crown atop King Aldric's head begins to glow with an otherworldly light. Suddenly, a crack appears across its surface, spreading like lightning through crystal. With a sound like breaking glass amplified a thousandfold, the Crown of Stars explodes into seven brilliant fragments that streak across the sky like falling stars."

        ### Key NPCs
        - **King Aldric Valdris**: A just ruler now weakened by the crown's destruction
        - **Duchess Morwyn Blackthorn**: Ambitious noble secretly allied with dark forces
        - **Sage Theron**: Ancient scholar who knows the crown's true history
      `;

      const analysis = await professionalPolishValidator.validateProfessionalPolish(
        'test-4', 'adventure', highQualityContent
      );

      expect(analysis.publicationQualityScore).toBeGreaterThan(7);
      expect(analysis.professionalStandardsScore).toBeGreaterThan(6);
      expect(analysis.marketReadiness).toBe(true);
    });

    it('should identify deficiencies in low-quality content', async () => {
      const lowQualityContent = 'kill goblins get gold';

      const analysis = await professionalPolishValidator.validateProfessionalPolish(
        'test-5', 'adventure', lowQualityContent
      );

      expect(analysis.publicationQualityScore).toBeLessThan(5);
      expect(analysis.deficiencies.length).toBeGreaterThan(0);
      expect(analysis.marketReadiness).toBe(false);
    });

    it('should provide specific improvement recommendations', async () => {
      const mediumQualityContent = `
        The party enters a dungeon. There are monsters inside.
        They fight the monsters and find treasure.
        The end.
      `;

      const analysis = await professionalPolishValidator.validateProfessionalPolish(
        'test-6', 'adventure', mediumQualityContent
      );

      expect(analysis.improvementRecommendations.length).toBeGreaterThan(0);
      expect(analysis.improvementRecommendations.some(rec =>
        rec.includes('depth') || rec.includes('detail') || rec.includes('quality')
      )).toBe(true);
    });
  });

  describe('UserSatisfactionMetrics', () => {
    beforeEach(() => {
      // Reset satisfaction data for clean tests
      userSatisfactionMetrics['satisfactionData'].clear();
    });

    it('should record and analyze user satisfaction', async () => {
      const satisfactionData = {
        userId: 'user-1',
        contentId: 'content-1',
        contentType: 'adventure' as const,
        qualityRating: 8,
        usabilityRating: 7,
        creativityRating: 9,
        overallSatisfaction: 8,
        feedback: 'Great adventure with unique twists!',
        wouldRecommend: true,
        premiumQualityPerception: true,
        competitorComparison: 'better' as const,
        usageContext: 'personal_game' as const,
        experienceLevel: 'intermediate' as const
      };

      await userSatisfactionMetrics.recordSatisfaction(satisfactionData);

      const analysis = await userSatisfactionMetrics.analyzeSatisfaction('content-1');

      expect(analysis.averageOverallSatisfaction).toBe(8);
      expect(analysis.recommendationRate).toBe(1);
      expect(analysis.premiumPerceptionRate).toBe(1);
      expect(analysis.competitorAdvantageScore).toBeGreaterThan(5);
    });

    it('should track satisfaction trends over time', async () => {
      // Record multiple satisfaction entries over time
      const baseData = {
        userId: 'user-1',
        contentId: 'content-trend',
        contentType: 'adventure' as const,
        qualityRating: 6,
        usabilityRating: 6,
        creativityRating: 6,
        overallSatisfaction: 6,
        wouldRecommend: false,
        premiumQualityPerception: false
      };

      // Simulate improving satisfaction over time
      for (let i = 0; i < 5; i++) {
        await userSatisfactionMetrics.recordSatisfaction({
          ...baseData,
          userId: `user-${i}`,
          overallSatisfaction: 6 + i * 0.5
        });
      }

      const analysis = await userSatisfactionMetrics.analyzeSatisfaction('content-trend');
      expect(analysis.satisfactionTrend).toBe('improving');
    });

    it('should generate improvement recommendations', async () => {
      const lowSatisfactionData = {
        userId: 'user-low',
        contentId: 'content-low',
        contentType: 'adventure' as const,
        qualityRating: 4,
        usabilityRating: 3,
        creativityRating: 4,
        overallSatisfaction: 4,
        feedback: 'Generic content, needs more creativity',
        wouldRecommend: false,
        premiumQualityPerception: false
      };

      await userSatisfactionMetrics.recordSatisfaction(lowSatisfactionData);

      const recommendations = await userSatisfactionMetrics.generateImprovementRecommendations('content-low');

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.priority === 'high')).toBe(true);
    });
  });

  describe('MarketDifferentiationValidator', () => {
    it('should perform comprehensive market differentiation analysis', async () => {
      const testContent = `
        # The Quantum Heist Campaign

        In the neon-soaked streets of Neo-Tokyo 2087, reality itself has become malleable. 
        Quantum hackers can phase between parallel dimensions, stealing not just data, 
        but entire possibilities. The party plays as interdimensional investigators 
        tracking a master thief who's been erasing successful timelines and selling 
        them to the highest bidder.

        This innovative campaign blends cyberpunk aesthetics with quantum mechanics, 
        creating unique encounters where players must think in four dimensions. 
        Combat involves manipulating probability fields, and social encounters 
        require navigating the complex politics of multiple realities.

        ## Key Features
        - **Quantum Combat System**: Players can phase between dimensions mid-fight
        - **Reality Corruption Mechanics**: Actions in one timeline affect others
        - **Multidimensional NPCs**: Characters with different personalities across realities
        - **Probability Puzzles**: Challenges that require quantum thinking

        ## Professional Quality Elements
        - Comprehensive GM guidance for running quantum mechanics
        - Detailed stat blocks for interdimensional creatures
        - Ready-to-use handouts and visual aids
        - Balanced encounter design with multiple solution paths
      `;

      const analysis = await marketDifferentiationValidator.validateMarketDifferentiation(
        'quantum-heist', 'adventure', testContent
      );

      expect(analysis.uniquenessScore).toBeGreaterThan(7);
      expect(analysis.publicationQualityScore).toBeGreaterThan(6);
      expect(analysis.overallMarketDifferentiation).toBeGreaterThan(6);
      expect(analysis.marketPosition).toBeOneOf(['market_leader', 'competitive']);
      expect(analysis.differentiationFactors.length).toBeGreaterThan(0);
    });

    it('should identify content requiring immediate action', async () => {
      const poorContent = 'kill orcs get gold the end';

      const analysis = await marketDifferentiationValidator.validateMarketDifferentiation(
        'poor-content', 'adventure', poorContent
      );

      expect(analysis.actionRequired).toBe(true);
      expect(analysis.marketPosition).toBe('below_standard');
      expect(analysis.priorityRecommendations.some(rec => 
        rec.includes('CRITICAL')
      )).toBe(true);
    });

    it('should provide detailed improvement plans', async () => {
      const mediumContent = `
        The party goes to a castle. There's a dragon inside.
        They fight the dragon and rescue the princess.
        She gives them a reward.
      `;

      const analysis = await marketDifferentiationValidator.validateMarketDifferentiation(
        'medium-content', 'adventure', mediumContent
      );

      expect(analysis.improvementPlan.length).toBeGreaterThan(0);
      expect(analysis.improvementPlan.some(plan => 
        plan.priority === 'high' || plan.priority === 'critical'
      )).toBe(true);
      expect(analysis.improvementPlan.every(plan => 
        plan.timeframe && plan.expectedImpact
      )).toBe(true);
    });

    it('should handle batch validation correctly', async () => {
      const contentItems = [
        {
          id: 'batch-1',
          type: 'adventure' as const,
          content: 'High quality innovative adventure with unique mechanics and professional polish.'
        },
        {
          id: 'batch-2', 
          type: 'npc' as const,
          content: 'Generic tavern keeper who gives quests.'
        }
      ];

      const analyses = await marketDifferentiationValidator.batchValidateMarketDifferentiation(contentItems);

      expect(analyses.length).toBe(2);
      expect(analyses[0].overallMarketDifferentiation).toBeGreaterThan(analyses[1].overallMarketDifferentiation);
    });
  });

  describe('Integration Tests', () => {
    it('should provide consistent scoring across all validation systems', async () => {
      const testContent = `
        # The Chrono-Merchant's Gambit

        ## Overview
        In the bustling trade city of Temporalis, time itself has become a commodity. 
        The Chrono-Merchants Guild controls the flow of temporal energy, selling 
        minutes, hours, and even years to the highest bidders. But when someone 
        begins stealing time from the city's residents, aging them rapidly, 
        the party must navigate a complex web of temporal politics and quantum economics.

        ## Unique Mechanics
        - **Time Banking System**: Players can deposit and withdraw temporal energy
        - **Aging Consequences**: Characters physically age based on time expenditure
        - **Temporal Arbitrage**: Economic puzzles involving time value fluctuations
        - **Chronological Combat**: Initiative and action economy become strategic resources

        ## Professional Elements
        - Detailed economic system with time-based currency
        - Comprehensive aging mechanics with stat modifications
        - Multiple investigation paths with meaningful player choices
        - Rich NPC network with interconnected motivations
        - Environmental storytelling through temporal anomalies

        This adventure challenges traditional RPG assumptions about time and resources,
        creating a unique experience that players will remember long after the campaign ends.
      `;

      // Test all three systems
      const uniquenessAnalysis = await uniquenessDetectionService.analyzeUniqueness(
        'integration-test', 'adventure', testContent
      );

      const polishAnalysis = await professionalPolishValidator.validateProfessionalPolish(
        'integration-test', 'adventure', testContent
      );

      const marketAnalysis = await marketDifferentiationValidator.validateMarketDifferentiation(
        'integration-test', 'adventure', testContent
      );

      // All systems should recognize this as high-quality content
      expect(uniquenessAnalysis.uniquenessScore).toBeGreaterThan(7);
      expect(polishAnalysis.publicationQualityScore).toBeGreaterThan(6);
      expect(marketAnalysis.overallMarketDifferentiation).toBeGreaterThan(7);

      // Market analysis should incorporate findings from other systems
      expect(marketAnalysis.uniquenessScore).toBe(uniquenessAnalysis.uniquenessScore);
      expect(marketAnalysis.publicationQualityScore).toBe(polishAnalysis.publicationQualityScore);
    });
  });
});