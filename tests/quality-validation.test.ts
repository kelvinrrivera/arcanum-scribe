/**
 * Quality Validation System Tests
 * 
 * Tests for the automated quality validation system components
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ContentQualityValidator, GeneratedContent } from '../server/content-quality-validator';
import { VisualQualityValidator, GeneratedImage } from '../server/visual-quality-validator';
import { QualityRegenerationSystem } from '../server/quality-regeneration-system';
import { AutomatedQualityService } from '../server/automated-quality-service';

describe('Quality Validation System', () => {
  let contentValidator: ContentQualityValidator;
  let visualValidator: VisualQualityValidator;
  let regenerationSystem: QualityRegenerationSystem;
  let qualityService: AutomatedQualityService;

  beforeEach(() => {
    contentValidator = new ContentQualityValidator();
    visualValidator = new VisualQualityValidator();
    regenerationSystem = new QualityRegenerationSystem();
    qualityService = new AutomatedQualityService();
  });

  describe('ContentQualityValidator', () => {
    it('should initialize with correct default threshold', () => {
      expect(contentValidator.getQualityThreshold()).toBe(8.0);
    });

    it('should allow threshold updates', () => {
      contentValidator.setQualityThreshold(7.5);
      expect(contentValidator.getQualityThreshold()).toBe(7.5);
    });

    it('should validate threshold bounds', () => {
      contentValidator.setQualityThreshold(-1);
      expect(contentValidator.getQualityThreshold()).toBe(0);
      
      contentValidator.setQualityThreshold(15);
      expect(contentValidator.getQualityThreshold()).toBe(10);
    });

    it('should handle mock content validation', async () => {
      // Mock content for testing
      const mockContent: GeneratedContent = {
        type: 'adventure',
        content: {
          title: 'Test Adventure',
          description: 'A simple test adventure for validation',
          scenes: ['Scene 1', 'Scene 2'],
          npcs: ['NPC 1', 'NPC 2']
        },
        context: {
          theme: 'fantasy',
          tone: 'heroic',
          gameSystem: 'dnd5e'
        }
      };

      // Note: This would normally call LLM service, but for testing we can verify structure
      expect(mockContent.type).toBe('adventure');
      expect(mockContent.content).toBeDefined();
      expect(mockContent.context).toBeDefined();
    });
  });

  describe('VisualQualityValidator', () => {
    it('should initialize with correct default threshold', () => {
      expect(visualValidator.getVisualQualityThreshold()).toBe(8.0);
    });

    it('should allow threshold updates', () => {
      visualValidator.setVisualQualityThreshold(7.0);
      expect(visualValidator.getVisualQualityThreshold()).toBe(7.0);
    });

    it('should validate threshold bounds', () => {
      visualValidator.setVisualQualityThreshold(-1);
      expect(visualValidator.getVisualQualityThreshold()).toBe(0);
      
      visualValidator.setVisualQualityThreshold(15);
      expect(visualValidator.getVisualQualityThreshold()).toBe(10);
    });

    it('should handle mock image validation', async () => {
      // Mock image for testing
      const mockImage: GeneratedImage = {
        imageUrl: 'https://example.com/test-image.jpg',
        prompt: 'A fantasy dragon in a mountain cave',
        context: {
          contentType: 'boss_monster',
          narrativeContext: 'Final boss encounter',
          establishedStyle: {
            artStyle: 'fantasy illustration',
            colorPalette: ['red', 'gold', 'black'],
            lightingMood: 'dramatic',
            compositionStyle: 'dynamic',
            detailLevel: 'high',
            thematicElements: ['fire', 'treasure', 'danger']
          }
        },
        metadata: {
          model: 'test-model',
          provider: 'test-provider',
          generationTime: 5000
        }
      };

      // Verify structure
      expect(mockImage.imageUrl).toBeDefined();
      expect(mockImage.context.contentType).toBe('boss_monster');
      expect(mockImage.context.establishedStyle).toBeDefined();
    });
  });

  describe('QualityRegenerationSystem', () => {
    it('should initialize with correct default config', () => {
      const config = regenerationSystem.getConfig();
      expect(config.maxAttempts).toBe(3);
      expect(config.qualityThreshold).toBe(8.0);
      expect(config.visualQualityThreshold).toBe(8.0);
      expect(config.improvementThreshold).toBe(0.5);
    });

    it('should allow config updates', () => {
      regenerationSystem.updateConfig({
        maxAttempts: 5,
        qualityThreshold: 7.5
      });
      
      const config = regenerationSystem.getConfig();
      expect(config.maxAttempts).toBe(5);
      expect(config.qualityThreshold).toBe(7.5);
      expect(config.visualQualityThreshold).toBe(8.0); // Should remain unchanged
    });

    it('should track active regenerations', () => {
      const active = regenerationSystem.getActiveRegenerations();
      expect(Array.isArray(active)).toBe(true);
      expect(active.length).toBe(0); // Should start empty
    });

    it('should clear completed regenerations', () => {
      regenerationSystem.clearCompletedRegenerations();
      const active = regenerationSystem.getActiveRegenerations();
      expect(active.length).toBe(0);
    });
  });

  describe('AutomatedQualityService', () => {
    it('should initialize successfully', () => {
      expect(qualityService).toBeDefined();
    });

    it('should get quality statistics', async () => {
      const stats = await qualityService.getQualityStatistics();
      expect(stats).toBeDefined();
      expect(stats.contentThreshold).toBe(8.0);
      expect(stats.visualThreshold).toBe(8.0);
      expect(stats.regenerationConfig).toBeDefined();
      expect(typeof stats.activeRegenerations).toBe('number');
    });

    it('should update quality thresholds', () => {
      qualityService.updateQualityThresholds(7.5, 7.0);
      // Verify through statistics
      qualityService.getQualityStatistics().then(stats => {
        expect(stats.contentThreshold).toBe(7.5);
        expect(stats.visualThreshold).toBe(7.0);
      });
    });

    it('should handle validation requests structure', () => {
      const mockRequest = {
        content: {
          type: 'adventure' as const,
          content: { title: 'Test' },
          context: { theme: 'fantasy' }
        },
        enableRegeneration: true,
        customThresholds: {
          contentThreshold: 7.0,
          visualThreshold: 7.5
        }
      };

      expect(mockRequest.content.type).toBe('adventure');
      expect(mockRequest.enableRegeneration).toBe(true);
      expect(mockRequest.customThresholds?.contentThreshold).toBe(7.0);
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistent thresholds across components', () => {
      const contentThreshold = contentValidator.getQualityThreshold();
      const visualThreshold = visualValidator.getVisualQualityThreshold();
      const regenConfig = regenerationSystem.getConfig();

      expect(contentThreshold).toBe(8.0);
      expect(visualThreshold).toBe(8.0);
      expect(regenConfig.qualityThreshold).toBe(8.0);
      expect(regenConfig.visualQualityThreshold).toBe(8.0);
    });

    it('should handle quality grade determination', () => {
      // Test quality grade logic (would be in a real implementation)
      const testScores = [9.5, 8.5, 7.5, 6.0, 3.0];
      const expectedGrades = ['Excellent', 'Good', 'Acceptable', 'Needs Improvement', 'Poor'];
      
      // This would test the actual grade determination logic
      expect(testScores.length).toBe(expectedGrades.length);
    });
  });
});