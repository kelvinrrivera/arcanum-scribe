import { describe, it, expect } from 'vitest';

// Import the services directly without database dependencies
import { UniquenessDetectionService } from '../server/uniqueness-detection-service';
import { ProfessionalPolishValidator } from '../server/professional-polish-validator';
import { UserSatisfactionMetrics } from '../server/user-satisfaction-metrics';
import { MarketDifferentiationValidator } from '../server/market-differentiation-validator';

// Create instances for testing
const uniquenessService = new UniquenessDetectionService();
const polishValidator = new ProfessionalPolishValidator();
const satisfactionMetrics = new UserSatisfactionMetrics();
const marketValidator = new MarketDifferentiationValidator();

describe('Market Differentiation Validation System - Standalone Tests', () => {
  describe('UniquenessDetectionService', () => {
    it('should detect generic patterns in adventure content', async () => {
      const genericAdventure = `
        The ancient evil has awakened in the dark dungeon. 
        A mysterious stranger approaches the party in the bustling tavern.
        Goblins have been raiding the peaceful village.
      `;

      const analysis = await uniquenessService.analyzeUniqueness(
        'test-1', 'adventure', genericAdventure
      );

      expect(analysis.contentId).toBe('test-1');
      expect(analysis.contentType).toBe('adventure');
      expect(analysis.uniquenessScore).toBeTypeOf('number');
      expect(analysis.uniquenessScore).toBeGreaterThanOrEqual(0);
      expect(analysis.uniquenessScore).toBeLessThanOrEqual(10);
      expect(analysis.genericityIndicators).toBeInstanceOf(Array);
      expect(analysis.differentiationFactors).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
      
      // Should detect generic patterns
      expect(analysis.genericityIndicators.length).toBeGreaterThan(0);
      expect(analysis.uniquenessScore).toBeLessThan(7); // Generic content should score lower
    });

    it('should identify differentiation factors in unique content', async () => {
      const uniqueAdventure = `
        The Clockwork Rebellion has begun in the steam-powered city of Gearsholm.
        Artificer-rebels have turned the city's mechanical servants against their masters,
        creating a complex web of political intrigue where players must navigate
        between the oppressed construct workers and the wealthy gear-barons.
        This innovative premise subverts typical fantasy tropes by exploring
        themes of artificial consciousness and industrial revolution dynamics.
        The adventure features unique mechanics where players can reprogram constructs,
        negotiate with artificial intelligences, and explore moral questions about
        consciousness and freedom in a steampunk setting.
      `;

      const analysis = await uniquenessService.analyzeUniqueness(
        'test-2', 'adventure', uniqueAdventure
      );

      expect(analysis.uniquenessScore).toBeGreaterThan(5);
      expect(analysis.differentiationFactors.length).toBeGreaterThan(0);
      expect(analysis.competitiveAdvantage).toBeGreaterThan(0);
    });

    it('should provide improvement recommendations for low-scoring content', async () => {
      const content = 'A simple farmer needs help.';

      const analysis = await uniquenessService.analyzeUniqueness(
        'test-3', 'adventure', content
      );

      expect(analysis.recommendations).toBeInstanceOf(Array);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.uniquenessScore).toBeLessThan(6);
    });

    it('should handle batch analysis correctly', async () => {
      const contentItems = [
        { id: 'batch-1', type: 'adventure' as const, content: 'Unique innovative adventure with creative mechanics' },
        { id: 'batch-2', type: 'npc' as const, content: 'Generic tavern keeper who gives quests' }
      ];

      const analyses = await uniquenessService.batchAnalyzeUniqueness(contentItems);

      expect(analyses).toBeInstanceOf(Array);
      expect(analyses.length).toBe(2);
      expect(analyses[0].contentId).toBe('batch-1');
      expect(analyses[1].contentId).toBe('batch-2');
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
        - **King Aldric Valdris**: A just ruler now weakened by the crown's destruction (AC 18, HP 165, Challenge Rating 12)
        - **Duchess Morwyn Blackthorn**: Ambitious noble secretly allied with dark forces
        - **Sage Theron**: Ancient scholar who knows the crown's true history

        ### Encounter Design
        Each crown fragment creates unique tactical challenges:
        - Fragment of Might: Enhances physical combat but causes berserker rage
        - Fragment of Mind: Grants telepathic abilities but risks madness
        - Fragment of Spirit: Allows communication with the dead but attracts undead
      `;

      const analysis = await polishValidator.validateProfessionalPolish(
        'test-4', 'adventure', highQualityContent
      );

      expect(analysis.contentId).toBe('test-4');
      expect(analysis.contentType).toBe('adventure');
      expect(analysis.publicationQualityScore).toBeTypeOf('number');
      expect(analysis.professionalStandardsScore).toBeTypeOf('number');
      expect(analysis.premiumQualityScore).toBeTypeOf('number');
      expect(analysis.marketReadiness).toBeTypeOf('boolean');
      expect(analysis.qualityIndicators).toBeInstanceOf(Array);
      expect(analysis.deficiencies).toBeInstanceOf(Array);
      expect(analysis.improvementRecommendations).toBeInstanceOf(Array);
      
      // High quality content should score well
      expect(analysis.publicationQualityScore).toBeGreaterThan(6);
    });

    it('should identify deficiencies in low-quality content', async () => {
      const lowQualityContent = 'kill goblins get gold';

      const analysis = await polishValidator.validateProfessionalPolish(
        'test-5', 'adventure', lowQualityContent
      );

      expect(analysis.publicationQualityScore).toBeLessThan(6);
      expect(analysis.deficiencies.length).toBeGreaterThan(0);
      expect(analysis.marketReadiness).toBe(false);
      expect(analysis.improvementRecommendations.length).toBeGreaterThan(0);
    });

    it('should handle different content types appropriately', async () => {
      const npcContent = `
        ## Theron the Wise
        
        **Race:** Human  
        **Class:** Wizard (Divination School)  
        **Alignment:** Lawful Good
        
        ### Background
        Theron has served as the royal advisor for over three decades. His weathered face bears the lines of countless sleepless nights spent poring over ancient tomes and prophecies. Despite his advanced age, his eyes still sparkle with keen intelligence and unwavering determination.
        
        ### Personality
        Theron speaks in measured tones, often pausing to consider his words carefully. He has a habit of stroking his long white beard when deep in thought. While patient with genuine seekers of knowledge, he has little tolerance for those who would use magic for selfish gain.
        
        ### Roleplaying Notes
        - Quotes ancient proverbs and historical precedents
        - Offers cryptic advice that becomes clear in hindsight  
        - Shows particular interest in young spellcasters
        - Becomes animated when discussing magical theory
      `;

      const analysis = await polishValidator.validateProfessionalPolish(
        'test-6', 'npc', npcContent
      );

      expect(analysis.contentType).toBe('npc');
      expect(analysis.publicationQualityScore).toBeGreaterThan(5);
    });
  });

  describe('UserSatisfactionMetrics', () => {
    it('should record and analyze satisfaction data', async () => {
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

      await satisfactionMetrics.recordSatisfaction(satisfactionData);

      const analysis = await satisfactionMetrics.analyzeSatisfaction('content-1');

      expect(analysis.contentId).toBe('content-1');
      expect(analysis.averageOverallSatisfaction).toBe(8);
      expect(analysis.recommendationRate).toBe(1);
      expect(analysis.premiumPerceptionRate).toBe(1);
      expect(analysis.competitorAdvantageScore).toBeGreaterThan(5);
    });

    it('should generate improvement recommendations based on low satisfaction', async () => {
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

      await satisfactionMetrics.recordSatisfaction(lowSatisfactionData);

      const recommendations = await satisfactionMetrics.generateImprovementRecommendations('content-low');

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.priority === 'high')).toBe(true);
    });
  });

  describe('MarketDifferentiationValidator Integration', () => {
    it('should perform comprehensive market differentiation analysis', async () => {
      const testContent = `
        # The Quantum Heist Campaign

        ## Overview
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
        - Detailed stat blocks for interdimensional creatures (CR 1-15)
        - Ready-to-use handouts and visual aids
        - Balanced encounter design with multiple solution paths
        - Rich environmental storytelling through dimensional anomalies

        ## Tactical Encounters
        ### The Probability Storm (CR 8 Encounter)
        **Setup:** The party must navigate a reality storm where multiple timelines collapse
        **Mechanics:** Each round, roll 1d6 to determine which timeline is active
        **Victory Conditions:** Stabilize the quantum field or escape to a safe dimension
        
        ### NPCs Across Dimensions
        **Dr. Sarah Chen (Timeline Alpha):** Brilliant scientist working to stop the thief
        **Dr. Sarah Chen (Timeline Beta):** Corrupted researcher allied with the villain
        **Dr. Sarah Chen (Timeline Gamma):** Quantum ghost seeking redemption
      `;

      const analysis = await marketValidator.validateMarketDifferentiation(
        'quantum-heist', 'adventure', testContent
      );

      expect(analysis.contentId).toBe('quantum-heist');
      expect(analysis.contentType).toBe('adventure');
      expect(analysis.uniquenessScore).toBeGreaterThan(6);
      expect(analysis.publicationQualityScore).toBeGreaterThan(6);
      expect(analysis.overallMarketDifferentiation).toBeGreaterThan(6);
      expect(analysis.marketPosition).toBeOneOf(['market_leader', 'competitive']);
      expect(analysis.differentiationFactors.length).toBeGreaterThan(0);
      expect(analysis.priorityRecommendations).toBeInstanceOf(Array);
      expect(analysis.improvementPlan).toBeInstanceOf(Array);
    });

    it('should identify content requiring immediate action', async () => {
      const poorContent = 'kill orcs get gold the end';

      const analysis = await marketValidator.validateMarketDifferentiation(
        'poor-content', 'adventure', poorContent
      );

      expect(analysis.actionRequired).toBe(true);
      expect(analysis.marketPosition).toBe('below_standard');
      expect(analysis.priorityRecommendations.some(rec => 
        rec.includes('CRITICAL')
      )).toBe(true);
      expect(analysis.improvementPlan.length).toBeGreaterThan(0);
    });

    it('should handle batch validation correctly', async () => {
      const contentItems = [
        {
          id: 'batch-good',
          type: 'adventure' as const,
          content: 'High quality innovative adventure with unique mechanics, professional polish, rich detail, and creative storytelling that subverts traditional tropes.'
        },
        {
          id: 'batch-poor', 
          type: 'npc' as const,
          content: 'Generic tavern keeper.'
        }
      ];

      const analyses = await marketValidator.batchValidateMarketDifferentiation(contentItems);

      expect(analyses.length).toBe(2);
      expect(analyses[0].contentId).toBe('batch-good');
      expect(analyses[1].contentId).toBe('batch-poor');
      expect(analyses[0].overallMarketDifferentiation).toBeGreaterThan(analyses[1].overallMarketDifferentiation);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty content gracefully', async () => {
      const analysis = await uniquenessService.analyzeUniqueness(
        'empty-test', 'adventure', ''
      );

      expect(analysis.uniquenessScore).toBeGreaterThanOrEqual(0);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it('should handle very short content', async () => {
      const analysis = await polishValidator.validateProfessionalPolish(
        'short-test', 'adventure', 'Short.'
      );

      expect(analysis.publicationQualityScore).toBeGreaterThanOrEqual(0);
      expect(analysis.deficiencies.length).toBeGreaterThan(0);
    });

    it('should handle special characters and formatting', async () => {
      const formattedContent = `
        # Title with **bold** and *italic*
        
        - List item 1
        - List item 2
        
        > Blockquote text
        
        \`\`\`
        Code block with special chars: @#$%^&*()
        \`\`\`
        
        Unicode characters: ñáéíóú 中文 العربية
      `;

      const analysis = await polishValidator.validateProfessionalPolish(
        'formatted-test', 'adventure', formattedContent
      );

      expect(analysis.publicationQualityScore).toBeGreaterThanOrEqual(0);
      expect(analysis.publicationQualityScore).toBeLessThanOrEqual(10);
    });
  });

  describe('Scoring Consistency and Validation', () => {
    it('should provide consistent scoring ranges across quality levels', async () => {
      const testContents = [
        'Poor quality content',
        'Medium quality content with some detail and structure that provides adequate information',
        'High quality content with excellent structure, rich detail, innovative elements, professional polish, comprehensive mechanics, engaging storytelling, and masterful craft that demonstrates publication-ready standards'
      ];

      const results = [];

      for (let i = 0; i < testContents.length; i++) {
        const uniquenessAnalysis = await uniquenessService.analyzeUniqueness(
          `consistency-${i}`, 'adventure', testContents[i]
        );
        const polishAnalysis = await polishValidator.validateProfessionalPolish(
          `consistency-${i}`, 'adventure', testContents[i]
        );

        results.push({
          uniqueness: uniquenessAnalysis.uniquenessScore,
          polish: polishAnalysis.publicationQualityScore
        });
      }

      // Scores should generally increase with content quality
      expect(results[2].uniqueness).toBeGreaterThan(results[0].uniqueness);
      expect(results[2].polish).toBeGreaterThan(results[0].polish);

      // All scores should be within valid range
      results.forEach(result => {
        expect(result.uniqueness).toBeGreaterThanOrEqual(0);
        expect(result.uniqueness).toBeLessThanOrEqual(10);
        expect(result.polish).toBeGreaterThanOrEqual(0);
        expect(result.polish).toBeLessThanOrEqual(10);
      });
    });

    it('should maintain scoring consistency across content types', async () => {
      const contentByType = {
        adventure: 'Epic quest with innovative mechanics and rich storytelling',
        npc: 'Complex character with detailed background and motivations',
        monster: 'Unique creature with tactical abilities and lore',
        location: 'Atmospheric setting with environmental storytelling',
        item: 'Magical artifact with interesting properties and history'
      };

      const scores = [];

      for (const [type, content] of Object.entries(contentByType)) {
        const analysis = await polishValidator.validateProfessionalPolish(
          `type-${type}`, type as any, content
        );
        scores.push(analysis.publicationQualityScore);
      }

      // All scores should be reasonable for similar quality content
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      scores.forEach(score => {
        expect(Math.abs(score - avgScore)).toBeLessThan(3); // Scores shouldn't vary too wildly
      });
    });
  });
});