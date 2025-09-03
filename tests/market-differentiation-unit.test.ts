import { describe, it, expect } from 'vitest';
import { uniquenessDetectionService } from '../server/uniqueness-detection-service';
import { professionalPolishValidator } from '../server/professional-polish-validator';

describe('Market Differentiation Validation - Unit Tests', () => {
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

      expect(analysis.contentId).toBe('test-1');
      expect(analysis.contentType).toBe('adventure');
      expect(analysis.uniquenessScore).toBeTypeOf('number');
      expect(analysis.uniquenessScore).toBeGreaterThanOrEqual(0);
      expect(analysis.uniquenessScore).toBeLessThanOrEqual(10);
      expect(analysis.genericityIndicators).toBeInstanceOf(Array);
      expect(analysis.differentiationFactors).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
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

      expect(analysis.uniquenessScore).toBeGreaterThan(5);
      expect(analysis.differentiationFactors.length).toBeGreaterThan(0);
      expect(analysis.competitiveAdvantage).toBeGreaterThan(0);
    });

    it('should provide improvement recommendations', async () => {
      const content = 'A simple farmer needs help.';

      const analysis = await uniquenessDetectionService.analyzeUniqueness(
        'test-3', 'adventure', content
      );

      expect(analysis.recommendations).toBeInstanceOf(Array);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle batch analysis', async () => {
      const contentItems = [
        { id: 'batch-1', type: 'adventure' as const, content: 'Unique innovative content' },
        { id: 'batch-2', type: 'npc' as const, content: 'Generic tavern keeper' }
      ];

      const analyses = await uniquenessDetectionService.batchAnalyzeUniqueness(contentItems);

      expect(analyses).toBeInstanceOf(Array);
      expect(analyses.length).toBe(2);
      expect(analyses[0].contentId).toBe('batch-1');
      expect(analyses[1].contentId).toBe('batch-2');
    });

    it('should calculate market differentiation summary', () => {
      const mockAnalyses = [
        {
          contentId: 'test-1',
          contentType: 'adventure',
          content: 'test',
          uniquenessScore: 8,
          genericityIndicators: ['indicator1'],
          differentiationFactors: ['factor1', 'factor2'],
          competitiveAdvantage: 7,
          recommendations: ['rec1']
        },
        {
          contentId: 'test-2',
          contentType: 'npc',
          content: 'test',
          uniquenessScore: 6,
          genericityIndicators: ['indicator1', 'indicator2'],
          differentiationFactors: ['factor1'],
          competitiveAdvantage: 5,
          recommendations: ['rec2']
        }
      ];

      const summary = uniquenessDetectionService.getMarketDifferentiationSummary(mockAnalyses);

      expect(summary.averageUniqueness).toBe(7);
      expect(summary.averageCompetitiveAdvantage).toBe(6);
      expect(summary.topDifferentiators).toContain('factor1');
      expect(summary.commonWeaknesses).toContain('indicator1');
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

        ### Key NPCs
        - **King Aldric Valdris**: A just ruler now weakened by the crown's destruction
        - **Duchess Morwyn Blackthorn**: Ambitious noble secretly allied with dark forces
      `;

      const analysis = await professionalPolishValidator.validateProfessionalPolish(
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
    });

    it('should identify deficiencies in low-quality content', async () => {
      const lowQualityContent = 'kill goblins get gold';

      const analysis = await professionalPolishValidator.validateProfessionalPolish(
        'test-5', 'adventure', lowQualityContent
      );

      expect(analysis.publicationQualityScore).toBeLessThan(8);
      expect(analysis.deficiencies.length).toBeGreaterThan(0);
      expect(analysis.marketReadiness).toBe(false);
    });

    it('should handle batch validation', async () => {
      const contentItems = [
        { id: 'batch-1', type: 'adventure' as const, content: 'High quality content with proper structure and detail.' },
        { id: 'batch-2', type: 'npc' as const, content: 'Short content.' }
      ];

      const analyses = await professionalPolishValidator.batchValidateProfessionalPolish(contentItems);

      expect(analyses).toBeInstanceOf(Array);
      expect(analyses.length).toBe(2);
      expect(analyses[0].contentId).toBe('batch-1');
      expect(analyses[1].contentId).toBe('batch-2');
    });

    it('should calculate professional polish summary', () => {
      const mockAnalyses = [
        {
          contentId: 'test-1',
          contentType: 'adventure',
          content: 'test',
          publicationQualityScore: 8,
          professionalStandardsScore: 7,
          premiumQualityScore: 6,
          qualityIndicators: ['indicator1'],
          deficiencies: ['deficiency1'],
          improvementRecommendations: ['rec1'],
          marketReadiness: true
        },
        {
          contentId: 'test-2',
          contentType: 'npc',
          content: 'test',
          publicationQualityScore: 6,
          professionalStandardsScore: 5,
          premiumQualityScore: 4,
          qualityIndicators: [],
          deficiencies: ['deficiency1', 'deficiency2'],
          improvementRecommendations: ['rec1', 'rec2'],
          marketReadiness: false
        }
      ];

      const summary = professionalPolishValidator.getProfessionalPolishSummary(mockAnalyses);

      expect(summary.averagePublicationQuality).toBe(7);
      expect(summary.averageProfessionalStandards).toBe(6);
      expect(summary.averagePremiumQuality).toBe(5);
      expect(summary.marketReadyCount).toBe(1);
      expect(summary.commonDeficiencies).toContain('deficiency1');
    });
  });

  describe('Content Analysis Edge Cases', () => {
    it('should handle empty content gracefully', async () => {
      const analysis = await uniquenessDetectionService.analyzeUniqueness(
        'empty-test', 'adventure', ''
      );

      expect(analysis.uniquenessScore).toBeGreaterThanOrEqual(0);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it('should handle very short content', async () => {
      const analysis = await professionalPolishValidator.validateProfessionalPolish(
        'short-test', 'adventure', 'Short.'
      );

      expect(analysis.publicationQualityScore).toBeGreaterThanOrEqual(0);
      expect(analysis.deficiencies.length).toBeGreaterThan(0);
    });

    it('should handle very long content', async () => {
      const longContent = 'This is a very long piece of content. '.repeat(1000);
      
      const analysis = await uniquenessDetectionService.analyzeUniqueness(
        'long-test', 'adventure', longContent
      );

      expect(analysis.uniquenessScore).toBeGreaterThanOrEqual(0);
      expect(analysis.uniquenessScore).toBeLessThanOrEqual(10);
    });

    it('should handle special characters and formatting', async () => {
      const formattedContent = `
        # Title with **bold** and *italic*
        
        - List item 1
        - List item 2
        
        > Blockquote text
        
        \`\`\`
        Code block
        \`\`\`
      `;

      const analysis = await professionalPolishValidator.validateProfessionalPolish(
        'formatted-test', 'adventure', formattedContent
      );

      expect(analysis.publicationQualityScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Scoring Consistency', () => {
    it('should provide consistent scoring ranges', async () => {
      const testContents = [
        'Poor quality content',
        'Medium quality content with some detail and structure',
        'High quality content with excellent structure, rich detail, innovative elements, and professional polish that demonstrates mastery-level craft'
      ];

      const uniquenessScores: number[] = [];
      const polishScores: number[] = [];

      for (let i = 0; i < testContents.length; i++) {
        const uniquenessAnalysis = await uniquenessDetectionService.analyzeUniqueness(
          `consistency-${i}`, 'adventure', testContents[i]
        );
        const polishAnalysis = await professionalPolishValidator.validateProfessionalPolish(
          `consistency-${i}`, 'adventure', testContents[i]
        );

        uniquenessScores.push(uniquenessAnalysis.uniquenessScore);
        polishScores.push(polishAnalysis.publicationQualityScore);
      }

      // Scores should generally increase with content quality
      expect(uniquenessScores[2]).toBeGreaterThan(uniquenessScores[0]);
      expect(polishScores[2]).toBeGreaterThan(polishScores[0]);

      // All scores should be within valid range
      uniquenessScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10);
      });

      polishScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10);
      });
    });
  });
});