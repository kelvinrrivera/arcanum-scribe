/**
 * Professional Configuration Storage - The Unicorn Memory Bank
 * 
 * This service manages the persistence of professional mode configurations,
 * ensuring users never lose their unicorn-level preferences. It provides
 * secure, reliable storage with validation and fallback mechanisms.
 */

import type { ProfessionalModeConfig } from './professional-mode-manager';

// Storage keys
const STORAGE_KEYS = {
  PROFESSIONAL_CONFIG: 'arcanum_scribe_professional_config',
  USER_PREFERENCES: 'arcanum_scribe_user_preferences',
  FEATURE_USAGE_STATS: 'arcanum_scribe_feature_stats',
  QUALITY_HISTORY: 'arcanum_scribe_quality_history'
} as const;

// Configuration validation schema
interface StoredConfig extends ProfessionalModeConfig {
  version: string;
  lastUpdated: string;
  userId?: string;
}

interface UserPreferences {
  showAdvancedSettings: boolean;
  preferredQualityTarget: ProfessionalModeConfig['qualityTarget'];
  preferredPerformanceMode: ProfessionalModeConfig['performanceMode'];
  autoEnableProfessionalMode: boolean;
  rememberFeatureSettings: boolean;
}

interface FeatureUsageStats {
  [featureName: string]: {
    timesUsed: number;
    lastUsed: string;
    averageQualityImpact: number;
    userSatisfaction: number;
  };
}

interface QualityHistoryEntry {
  timestamp: string;
  overallScore: number;
  unicornScore: number;
  grade: string;
  featuresUsed: string[];
  processingTime: number;
}

/**
 * Professional Configuration Storage Service
 */
export class ProfessionalConfigStorage {
  private readonly CONFIG_VERSION = '1.0.0';
  private readonly MAX_HISTORY_ENTRIES = 50;

  constructor() {
    console.log('💾 [CONFIG-STORAGE] Professional Configuration Storage initialized');
  }

  /**
   * Save professional mode configuration
   */
  saveConfig(config: ProfessionalModeConfig, userId?: string): boolean {
    try {
      const storedConfig: StoredConfig = {
        ...config,
        version: this.CONFIG_VERSION,
        lastUpdated: new Date().toISOString(),
        userId
      };

      // Validate configuration before saving
      if (!this.validateConfig(storedConfig)) {
        console.error('❌ [CONFIG-STORAGE] Invalid configuration, not saving');
        return false;
      }

      localStorage.setItem(STORAGE_KEYS.PROFESSIONAL_CONFIG, JSON.stringify(storedConfig));
      console.log('✅ [CONFIG-STORAGE] Professional configuration saved successfully');
      
      return true;
    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to save configuration:', error);
      return false;
    }
  }

  /**
   * Load professional mode configuration
   */
  loadConfig(userId?: string): ProfessionalModeConfig | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFESSIONAL_CONFIG);
      
      if (!stored) {
        console.log('📝 [CONFIG-STORAGE] No stored configuration found');
        return null;
      }

      const storedConfig: StoredConfig = JSON.parse(stored);

      // Validate stored configuration
      if (!this.validateConfig(storedConfig)) {
        console.warn('⚠️ [CONFIG-STORAGE] Invalid stored configuration, using defaults');
        this.clearConfig();
        return null;
      }

      // Check version compatibility
      if (storedConfig.version !== this.CONFIG_VERSION) {
        console.log('🔄 [CONFIG-STORAGE] Configuration version mismatch, migrating...');
        const migrated = this.migrateConfig(storedConfig);
        if (migrated) {
          this.saveConfig(migrated, userId);
          return migrated;
        } else {
          console.warn('⚠️ [CONFIG-STORAGE] Migration failed, using defaults');
          return null;
        }
      }

      // Check user ID if provided
      if (userId && storedConfig.userId && storedConfig.userId !== userId) {
        console.log('👤 [CONFIG-STORAGE] Different user, not loading stored config');
        return null;
      }

      console.log('✅ [CONFIG-STORAGE] Professional configuration loaded successfully');
      return {
        enabled: storedConfig.enabled,
        features: storedConfig.features,
        qualityTarget: storedConfig.qualityTarget,
        performanceMode: storedConfig.performanceMode,
        fallbackBehavior: storedConfig.fallbackBehavior
      };

    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to load configuration:', error);
      return null;
    }
  }

  /**
   * Save user preferences
   */
  saveUserPreferences(preferences: UserPreferences): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      console.log('✅ [CONFIG-STORAGE] User preferences saved successfully');
      return true;
    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to save user preferences:', error);
      return false;
    }
  }

  /**
   * Load user preferences
   */
  loadUserPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      
      if (!stored) {
        return this.getDefaultUserPreferences();
      }

      const preferences: UserPreferences = JSON.parse(stored);
      
      // Merge with defaults to ensure all properties exist
      return {
        ...this.getDefaultUserPreferences(),
        ...preferences
      };

    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to load user preferences:', error);
      return this.getDefaultUserPreferences();
    }
  }

  /**
   * Update feature usage statistics
   */
  updateFeatureUsageStats(featureName: string, qualityImpact: number, userSatisfaction: number = 5): void {
    try {
      const stats = this.loadFeatureUsageStats();
      
      if (!stats[featureName]) {
        stats[featureName] = {
          timesUsed: 0,
          lastUsed: '',
          averageQualityImpact: 0,
          userSatisfaction: 0
        };
      }

      const feature = stats[featureName];
      feature.timesUsed++;
      feature.lastUsed = new Date().toISOString();
      
      // Update running averages
      feature.averageQualityImpact = 
        (feature.averageQualityImpact * (feature.timesUsed - 1) + qualityImpact) / feature.timesUsed;
      feature.userSatisfaction = 
        (feature.userSatisfaction * (feature.timesUsed - 1) + userSatisfaction) / feature.timesUsed;

      localStorage.setItem(STORAGE_KEYS.FEATURE_USAGE_STATS, JSON.stringify(stats));
      console.log(`📊 [CONFIG-STORAGE] Updated usage stats for ${featureName}`);

    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to update feature usage stats:', error);
    }
  }

  /**
   * Load feature usage statistics
   */
  loadFeatureUsageStats(): FeatureUsageStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FEATURE_USAGE_STATS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to load feature usage stats:', error);
      return {};
    }
  }

  /**
   * Add quality history entry
   */
  addQualityHistoryEntry(entry: Omit<QualityHistoryEntry, 'timestamp'>): void {
    try {
      const history = this.loadQualityHistory();
      
      const newEntry: QualityHistoryEntry = {
        ...entry,
        timestamp: new Date().toISOString()
      };

      history.unshift(newEntry);

      // Keep only the most recent entries
      if (history.length > this.MAX_HISTORY_ENTRIES) {
        history.splice(this.MAX_HISTORY_ENTRIES);
      }

      localStorage.setItem(STORAGE_KEYS.QUALITY_HISTORY, JSON.stringify(history));
      console.log('📈 [CONFIG-STORAGE] Added quality history entry');

    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to add quality history entry:', error);
    }
  }

  /**
   * Load quality history
   */
  loadQualityHistory(): QualityHistoryEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUALITY_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to load quality history:', error);
      return [];
    }
  }

  /**
   * Get quality statistics
   */
  getQualityStatistics(): {
    averageOverallScore: number;
    averageUnicornScore: number;
    mostCommonGrade: string;
    totalGenerations: number;
    averageProcessingTime: number;
    mostUsedFeatures: string[];
  } {
    try {
      const history = this.loadQualityHistory();
      
      if (history.length === 0) {
        return {
          averageOverallScore: 0,
          averageUnicornScore: 0,
          mostCommonGrade: 'Standard',
          totalGenerations: 0,
          averageProcessingTime: 0,
          mostUsedFeatures: []
        };
      }

      const totalGenerations = history.length;
      const averageOverallScore = history.reduce((sum, entry) => sum + entry.overallScore, 0) / totalGenerations;
      const averageUnicornScore = history.reduce((sum, entry) => sum + entry.unicornScore, 0) / totalGenerations;
      const averageProcessingTime = history.reduce((sum, entry) => sum + entry.processingTime, 0) / totalGenerations;

      // Find most common grade
      const gradeCounts: { [grade: string]: number } = {};
      history.forEach(entry => {
        gradeCounts[entry.grade] = (gradeCounts[entry.grade] || 0) + 1;
      });
      const mostCommonGrade = Object.keys(gradeCounts).reduce((a, b) => 
        gradeCounts[a] > gradeCounts[b] ? a : b
      );

      // Find most used features
      const featureCounts: { [feature: string]: number } = {};
      history.forEach(entry => {
        entry.featuresUsed.forEach(feature => {
          featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        });
      });
      const mostUsedFeatures = Object.keys(featureCounts)
        .sort((a, b) => featureCounts[b] - featureCounts[a])
        .slice(0, 5);

      return {
        averageOverallScore: Math.round(averageOverallScore * 100) / 100,
        averageUnicornScore: Math.round(averageUnicornScore * 100) / 100,
        mostCommonGrade,
        totalGenerations,
        averageProcessingTime: Math.round(averageProcessingTime),
        mostUsedFeatures
      };

    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to get quality statistics:', error);
      return {
        averageOverallScore: 0,
        averageUnicornScore: 0,
        mostCommonGrade: 'Standard',
        totalGenerations: 0,
        averageProcessingTime: 0,
        mostUsedFeatures: []
      };
    }
  }

  /**
   * Clear all stored configuration
   */
  clearConfig(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFESSIONAL_CONFIG);
      console.log('🗑️ [CONFIG-STORAGE] Professional configuration cleared');
    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to clear configuration:', error);
    }
  }

  /**
   * Clear all stored data
   */
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('🗑️ [CONFIG-STORAGE] All professional data cleared');
    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to clear all data:', error);
    }
  }

  /**
   * Export configuration for backup
   */
  exportConfiguration(): string {
    try {
      const config = this.loadConfig();
      const preferences = this.loadUserPreferences();
      const stats = this.loadFeatureUsageStats();
      const history = this.loadQualityHistory();

      const exportData = {
        config,
        preferences,
        stats,
        history,
        exportedAt: new Date().toISOString(),
        version: this.CONFIG_VERSION
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to export configuration:', error);
      throw error;
    }
  }

  /**
   * Import configuration from backup
   */
  importConfiguration(data: string, userId?: string): boolean {
    try {
      const importData = JSON.parse(data);

      // Validate import data
      if (!importData.config || !importData.version) {
        throw new Error('Invalid import data format');
      }

      // Import configuration
      if (importData.config) {
        this.saveConfig(importData.config, userId);
      }

      // Import preferences
      if (importData.preferences) {
        this.saveUserPreferences(importData.preferences);
      }

      // Import stats (optional)
      if (importData.stats) {
        localStorage.setItem(STORAGE_KEYS.FEATURE_USAGE_STATS, JSON.stringify(importData.stats));
      }

      // Import history (optional, merge with existing)
      if (importData.history && Array.isArray(importData.history)) {
        const existingHistory = this.loadQualityHistory();
        const mergedHistory = [...importData.history, ...existingHistory]
          .slice(0, this.MAX_HISTORY_ENTRIES);
        localStorage.setItem(STORAGE_KEYS.QUALITY_HISTORY, JSON.stringify(mergedHistory));
      }

      console.log('✅ [CONFIG-STORAGE] Configuration imported successfully');
      return true;

    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Failed to import configuration:', error);
      return false;
    }
  }

  // Private helper methods

  private validateConfig(config: StoredConfig): boolean {
    try {
      // Check required fields
      if (!config.version || !config.lastUpdated) {
        return false;
      }

      // Check features object
      if (!config.features || typeof config.features !== 'object') {
        return false;
      }

      // Check required feature properties
      const requiredFeatures = [
        'enhancedPromptAnalysis',
        'multiSolutionPuzzles',
        'professionalLayout',
        'enhancedNPCs',
        'tacticalCombat',
        'editorialExcellence',
        'accessibilityFeatures',
        'mathematicalValidation'
      ];

      for (const feature of requiredFeatures) {
        if (typeof config.features[feature] !== 'boolean') {
          return false;
        }
      }

      // Check enum values
      const validQualityTargets = ['standard', 'professional', 'premium', 'publication-ready'];
      const validPerformanceModes = ['speed', 'balanced', 'quality'];
      const validFallbackBehaviors = ['graceful', 'strict'];

      if (!validQualityTargets.includes(config.qualityTarget)) {
        return false;
      }

      if (!validPerformanceModes.includes(config.performanceMode)) {
        return false;
      }

      if (!validFallbackBehaviors.includes(config.fallbackBehavior)) {
        return false;
      }

      return true;

    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Configuration validation error:', error);
      return false;
    }
  }

  private migrateConfig(oldConfig: StoredConfig): ProfessionalModeConfig | null {
    try {
      console.log(`🔄 [CONFIG-STORAGE] Migrating configuration from ${oldConfig.version} to ${this.CONFIG_VERSION}`);

      // For now, we only have one version, so no migration needed
      // In the future, this would handle version-specific migrations

      return {
        enabled: oldConfig.enabled,
        features: oldConfig.features,
        qualityTarget: oldConfig.qualityTarget,
        performanceMode: oldConfig.performanceMode,
        fallbackBehavior: oldConfig.fallbackBehavior
      };

    } catch (error) {
      console.error('❌ [CONFIG-STORAGE] Configuration migration failed:', error);
      return null;
    }
  }

  private getDefaultUserPreferences(): UserPreferences {
    return {
      showAdvancedSettings: false,
      preferredQualityTarget: 'professional',
      preferredPerformanceMode: 'balanced',
      autoEnableProfessionalMode: true,
      rememberFeatureSettings: true
    };
  }
}

// Export singleton instance for unicorn-level configuration management
export const professionalConfigStorage = new ProfessionalConfigStorage();

// 💾 PROFESSIONAL CONFIGURATION STORAGE READY FOR UNICORN STATUS! 💾
console.log('💾 Professional Configuration Storage loaded - Silicon Valley persistence guaranteed!');