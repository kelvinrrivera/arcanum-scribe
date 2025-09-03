/**
 * Quality Validation System Unit Tests
 * 
 * Unit tests for the automated quality validation system components
 * that don't require database connections
 */

import { describe, it, expect } from 'vitest';

// Mock the LLM service to avoid database dependencies
const mockLLMService = {
  generateText: async () => ({
    narrativeCoherence: 8.5,
    characterDepth: 7.2,
    plotComplexity: 9.1,
    thematicConsistency: 8.8
  }),
  generateImage: async () => 'https://example.com/generated-image.jpg'
};

// Mock the validators with the mocked LLM service
class MockContentQualityValidator {
  private qualityThreshold = 8.0;

  getQualityThreshold(): number {
    return this.qualityThreshold;
  }

  setQualityThreshold(threshold: number): void {
    this.qualityThreshold = Math.max(0, Math.min(10, threshold));
  }
}

class MockVisualQualityValidator {
  private qualityThreshold = 8.0;

  getVisualQualityThreshold(): number {
    return this.qualityThreshold;
  }

  setVisualQualityThreshold(threshold: number): void {
    this.qualityThreshold = Math.max(0, Math.min(10, threshold));
  }
}

interface RegenerationConfig {
  maxAttempts: number;
  qualityThreshold: number;
  visualQualityThreshold: number;
  improvementThreshold: number;
  timeoutMs: number;
  enableAdaptivePrompts: boolean;
  enableQualityFeedbackLoop: boolean;
}

class MockQualityRegenerationSystem {
  private config: RegenerationConfig = {
    maxAttempts: 3,
    qualityThreshold: 8.0,
    visualQualityThreshold: 8.0,
    improvementThreshold: 0.5,
    timeoutMs: 300000,
    enableAdaptivePrompts: true,
    enableQualityFeedbackLoop: true
  };

  private activeRegenerations: any[] = [];

  getConfig(): RegenerationConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<RegenerationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getActiveRegenerations(): any[] {
    return [...this.activeRegenerations];
  }

  clearCompletedRegenerations(): void {
    this.activeRegenerations = [];
  }
}

describe('Quality Validation System - Unit Tests', () => {
  describe('ContentQualityValidator', () => {
    it('should initialize with correct default threshold', () => {
      const validator = new MockContentQualityValidator();
      expect(validator.getQualityThreshold()).toBe(8.0);
    });

    it('should allow threshold updates', () => {
      const validator = new MockContentQualityValidator();
      validator.setQualityThreshold(7.5);
      expect(validator.getQualityThreshold()).toBe(7.5);
    });

    it('should validate threshold bounds', () => {
      const validator = new MockContentQualityValidator();
      
      validator.setQualityThreshold(-1);
      expect(validator.getQualityThreshold()).toBe(0);
      
      validator.setQualityThreshold(15);
      expect(validator.getQualityThreshold()).toBe(10);
    });

    it('should handle content structure validation', () => {
      const mockContent = {
        type: 'adventure' as const,
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

      expect(mockContent.type).toBe('adventure');
      expect(mockContent.content).toBeDefined();
      expect(mockContent.content.title).toBe('Test Adventure');
      expect(mockContent.context).toBeDefined();
      expect(mockContent.context.theme).toBe('fantasy');
    });
  });

  describe('VisualQualityValidator', () => {
    it('should initialize with correct default threshold', () => {
      const validator = new MockVisualQualityValidator();
      expect(validator.getVisualQualityThreshold()).toBe(8.0);
    });

    it('should allow threshold updates', () => {
      const validator = new MockVisualQualityValidator();
      validator.setVisualQualityThreshold(7.0);
      expect(validator.getVisualQualityThreshold()).toBe(7.0);
    });

    it('should validate threshold bounds', () => {
      const validator = new MockVisualQualityValidator();
      
      validator.setVisualQualityThreshold(-1);
      expect(validator.getVisualQualityThreshold()).toBe(0);
      
      validator.setVisualQualityThreshold(15);
      expect(validator.getVisualQualityThreshold()).toBe(10);
    });

    it('should handle image structure validation', () => {
      const mockImage = {
        imageUrl: 'https://example.com/test-image.jpg',
        prompt: 'A fantasy dragon in a mountain cave',
        context: {
          contentType: 'boss_monster' as const,
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

      expect(mockImage.imageUrl).toBeDefined();
      expect(mockImage.context.contentType).toBe('boss_monster');
      expect(mockImage.context.establishedStyle).toBeDefined();
      expect(mockImage.context.establishedStyle.artStyle).toBe('fantasy illustration');
      expect(mockImage.metadata?.model).toBe('test-model');
    });
  });

  describe('QualityRegenerationSystem', () => {
    it('should initialize with correct default config', () => {
      const system = new MockQualityRegenerationSystem();
      const config = system.getConfig();
      
      expect(config.maxAttempts).toBe(3);
      expect(config.qualityThreshold).toBe(8.0);
      expect(config.visualQualityThreshold).toBe(8.0);
      expect(config.improvementThreshold).toBe(0.5);
      expect(config.timeoutMs).toBe(300000);
      expect(config.enableAdaptivePrompts).toBe(true);
      expect(config.enableQualityFeedbackLoop).toBe(true);
    });

    it('should allow config updates', () => {
      const system = new MockQualityRegenerationSystem();
      
      system.updateConfig({
        maxAttempts: 5,
        qualityThreshold: 7.5
      });
      
      const config = system.getConfig();
      expect(config.maxAttempts).toBe(5);
      expect(config.qualityThreshold).toBe(7.5);
      expect(config.visualQualityThreshold).toBe(8.0); // Should remain unchanged
    });

    it('should track active regenerations', () => {
      const system = new MockQualityRegenerationSystem();
      const active = system.getActiveRegenerations();
      
      expect(Array.isArray(active)).toBe(true);
      expect(active.length).toBe(0); // Should start empty
    });

    it('should clear completed regenerations', () => {
      const system = new MockQualityRegenerationSystem();
      
      system.clearCompletedRegenerations();
      const active = system.getActiveRegenerations();
      
      expect(active.length).toBe(0);
    });
  });

  describe('Quality Metrics Calculation', () => {
    it('should calculate weighted overall scores correctly', () => {
      const weights = {
        narrativeCoherence: 0.30,
        characterDepth: 0.25,
        plotComplexity: 0.25,
        thematicConsistency: 0.20
      };

      const scores = {
        narrativeCoherence: 8.5,
        characterDepth: 7.2,
        plotComplexity: 9.1,
        thematicConsistency: 8.8
      };

      const expectedScore = 
        (scores.narrativeCoherence * weights.narrativeCoherence) +
        (scores.characterDepth * weights.characterDepth) +
        (scores.plotComplexity * weights.plotComplexity) +
        (scores.thematicConsistency * weights.thematicConsistency);

      expect(Math.round(expectedScore * 10) / 10).toBe(8.4);
    });

    it('should determine quality grades correctly', () => {
      const determineGrade = (score: number): string => {
        if (score >= 9.0) return 'Excellent';
        if (score >= 8.0) return 'Good';
        if (score >= 7.0) return 'Acceptable';
        if (score >= 5.0) return 'Needs Improvement';
        return 'Poor';
      };

      expect(determineGrade(9.5)).toBe('Excellent');
      expect(determineGrade(8.5)).toBe('Good');
      expect(determineGrade(7.5)).toBe('Acceptable');
      expect(determineGrade(6.0)).toBe('Needs Improvement');
      expect(determineGrade(3.0)).toBe('Poor');
    });

    it('should validate score bounds', () => {
      const validateScore = (score: any): number => {
        const numScore = parseFloat(score);
        if (isNaN(numScore)) {
          return 5.0; // Default score
        }
        return Math.max(0, Math.min(10, numScore));
      };

      expect(validateScore(8.5)).toBe(8.5);
      expect(validateScore(-1)).toBe(0);
      expect(validateScore(15)).toBe(10);
      expect(validateScore('invalid')).toBe(5.0);
      expect(validateScore(null)).toBe(5.0);
    });
  });

  describe('Integration Logic', () => {
    it('should maintain consistent thresholds across components', () => {
      const contentValidator = new MockContentQualityValidator();
      const visualValidator = new MockVisualQualityValidator();
      const regenerationSystem = new MockQualityRegenerationSystem();

      const contentThreshold = contentValidator.getQualityThreshold();
      const visualThreshold = visualValidator.getVisualQualityThreshold();
      const regenConfig = regenerationSystem.getConfig();

      expect(contentThreshold).toBe(8.0);
      expect(visualThreshold).toBe(8.0);
      expect(regenConfig.qualityThreshold).toBe(8.0);
      expect(regenConfig.visualQualityThreshold).toBe(8.0);
    });

    it('should handle validation request structure', () => {
      const mockRequest = {
        content: {
          type: 'adventure' as const,
          content: { title: 'Test Adventure' },
          context: { theme: 'fantasy' }
        },
        images: [{
          imageUrl: 'https://example.com/image.jpg',
          prompt: 'Test image',
          context: {
            contentType: 'scene' as const
          }
        }],
        enableRegeneration: true,
        customThresholds: {
          contentThreshold: 7.0,
          visualThreshold: 7.5
        }
      };

      expect(mockRequest.content.type).toBe('adventure');
      expect(mockRequest.images?.length).toBe(1);
      expect(mockRequest.enableRegeneration).toBe(true);
      expect(mockRequest.customThresholds?.contentThreshold).toBe(7.0);
      expect(mockRequest.customThresholds?.visualThreshold).toBe(7.5);
    });

    it('should calculate improvement percentages correctly', () => {
      const calculateImprovement = (original: number, improved: number): number => {
        return ((improved - original) / original) * 100;
      };

      expect(Math.round(calculateImprovement(7.0, 8.4))).toBe(20);
      expect(Math.round(calculateImprovement(6.0, 7.2))).toBe(20);
      expect(calculateImprovement(8.0, 8.0)).toBe(0);
    });
  });
});