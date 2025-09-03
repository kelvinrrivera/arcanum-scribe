/**
 * Professional Mode Hook - The Unicorn State Manager
 * 
 * This hook manages the professional mode state, configuration, and
 * integration with the adventure generation flow. It provides a clean
 * interface for components to interact with unicorn-level features.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { professionalMode, type ProfessionalModeConfig, type ProfessionalEnhancement } from '@/lib/professional-mode-manager';
import { professionalIntegration } from '@/services/professional-integration';
import { qualityMetricsEngine, type QualityBreakdown } from '@/lib/quality-metrics-engine';
import { professionalConfigStorage } from '@/lib/professional-config-storage';
import { performanceMonitor, type PerformanceComparison } from '@/lib/performance-monitor';

export interface UseProfessionalModeReturn {
  // State
  isEnabled: boolean;
  isAvailable: boolean;
  isInitialized: boolean;
  config: ProfessionalModeConfig;
  unicornReadiness: number;
  
  // Actions
  enable: () => void;
  disable: () => void;
  updateConfig: (newConfig: Partial<ProfessionalModeConfig>) => void;
  updateFeatures: (features: Partial<ProfessionalModeConfig['features']>) => void;
  
  // Generation
  generateWithProfessionalMode: (prompt: any) => Promise<any>;
  
  // Quality Analysis
  analyzeQuality: (enhancement: ProfessionalEnhancement) => QualityBreakdown;
  
  // Status
  getHealthStatus: () => any;
  getPerformanceMetrics: () => any;
  
  // Configuration Management
  saveConfiguration: () => boolean;
  loadConfiguration: (userId?: string) => boolean;
  exportConfiguration: () => string;
  importConfiguration: (data: string, userId?: string) => boolean;
  clearConfiguration: () => void;
  getQualityStatistics: () => any;
  
  // Performance Monitoring
  getPerformanceComparison: () => PerformanceComparison;
  getPerformanceStatistics: () => any;
  getPerformanceAlerts: () => any[];
  clearPerformanceCache: () => void;
}

export const useProfessionalMode = (): UseProfessionalModeReturn => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [config, setConfig] = useState<ProfessionalModeConfig>({
    enabled: false,
    features: {
      enhancedPromptAnalysis: true,
      multiSolutionPuzzles: true,
      professionalLayout: true,
      enhancedNPCs: true,
      tacticalCombat: true,
      editorialExcellence: true,
      accessibilityFeatures: true,
      mathematicalValidation: true
    },
    qualityTarget: 'professional',
    performanceMode: 'balanced',
    fallbackBehavior: 'graceful'
  });
  const [unicornReadiness, setUnicornReadiness] = useState(0);

  // Initialize professional mode on mount
  useEffect(() => {
    const initializeProfessionalMode = async () => {
      try {
        console.log('🦄 [HOOK] Initializing Professional Mode...');
        
        // Initialize the integration service
        const integrationReady = await professionalIntegration.initialize();
        
        if (integrationReady) {
          // Initialize professional mode manager
          const professionalReady = await professionalMode.initialize();
          
          if (professionalReady) {
            professionalMode.enable();
            setIsAvailable(true);
            setIsInitialized(true);
            
            // Try to load saved configuration
            console.log('💾 [HOOK] Loading saved configuration...');
            const savedConfig = professionalConfigStorage.loadConfig();
            
            let finalConfig: ProfessionalModeConfig;
            if (savedConfig) {
              console.log('✅ [HOOK] Loaded saved configuration');
              finalConfig = savedConfig;
              
              // Apply saved configuration to professional mode
              professionalMode.updateFeatures(savedConfig.features);
              if (savedConfig.enabled) {
                professionalMode.enable();
              } else {
                professionalMode.disable();
              }
            } else {
              console.log('📝 [HOOK] No saved configuration, using defaults');
              finalConfig = professionalMode.getConfig();
            }
            
            setConfig(finalConfig);
            setIsEnabled(finalConfig.enabled);
            
            // Get unicorn readiness
            const readiness = professionalMode.getUnicornReadiness();
            setUnicornReadiness(readiness);
            
            console.log('✅ [HOOK] Professional Mode initialized successfully');
            console.log(`🦄 [HOOK] Unicorn Readiness: ${Math.round(readiness)}/100`);
            
            // Show success toast
            toast.success('Enhanced Mode activated! Advanced features ready.', {
              description: 'Enhanced features are now available for superior quality',
              duration: 3000
            });
          } else {
            console.warn('⚠️ [HOOK] Professional Mode not available');
            setIsAvailable(false);
            setIsInitialized(true);
          }
        } else {
          console.warn('⚠️ [HOOK] Professional Integration Service not available');
          setIsAvailable(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('❌ [HOOK] Failed to initialize Professional Mode:', error);
        setIsAvailable(false);
        setIsInitialized(true);
        
        toast.error('Professional Mode initialization failed', {
          description: 'Falling back to standard mode',
          duration: 3000
        });
      }
    };

    initializeProfessionalMode();
  }, []);

  // Enable professional mode
  const enable = useCallback(() => {
    if (!isAvailable) {
      toast.error('Professional Mode not available');
      return;
    }

    try {
      professionalMode.enable();
      const newConfig = { ...config, enabled: true };
      setConfig(newConfig);
      setIsEnabled(true);
      
      console.log('🏆 [HOOK] Enhanced Mode enabled');
      toast.success('Enhanced Mode enabled!', {
        description: 'Advanced features activated',
        duration: 2000
      });
    } catch (error) {
      console.error('❌ [HOOK] Failed to enable Professional Mode:', error);
      toast.error('Failed to enable Professional Mode');
    }
  }, [isAvailable, config]);

  // Disable professional mode
  const disable = useCallback(() => {
    try {
      professionalMode.disable();
      const newConfig = { ...config, enabled: false };
      setConfig(newConfig);
      setIsEnabled(false);
      
      console.log('📝 [HOOK] Enhanced Mode disabled');
      toast.info('Enhanced Mode disabled', {
        description: 'Using standard generation',
        duration: 2000
      });
    } catch (error) {
      console.error('❌ [HOOK] Failed to disable Professional Mode:', error);
      toast.error('Failed to disable Professional Mode');
    }
  }, [config]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<ProfessionalModeConfig>) => {
    try {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);
      
      // Update professional mode manager
      if (newConfig.features) {
        professionalMode.updateFeatures(newConfig.features);
      }
      
      // Save configuration to storage
      const saved = professionalConfigStorage.saveConfig(updatedConfig);
      if (saved) {
        console.log('💾 [HOOK] Configuration saved to storage');
      } else {
        console.warn('⚠️ [HOOK] Failed to save configuration to storage');
      }
      
      console.log('🔧 [HOOK] Configuration updated:', newConfig);
      
      // Update unicorn readiness if features changed
      if (newConfig.features) {
        const readiness = professionalMode.getUnicornReadiness();
        setUnicornReadiness(readiness);
      }
    } catch (error) {
      console.error('❌ [HOOK] Failed to update configuration:', error);
      toast.error('Failed to update configuration');
    }
  }, [config]);

  // Update features specifically
  const updateFeatures = useCallback((features: Partial<ProfessionalModeConfig['features']>) => {
    updateConfig({ features: { ...config.features, ...features } });
  }, [config.features, updateConfig]);

  // Generate adventure with professional mode
  const generateWithProfessionalMode = useCallback(async (prompt: any) => {
    if (!isAvailable || !isInitialized) {
      throw new Error('Professional Mode not available');
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log('🚀 [HOOK] Starting professional adventure generation...');
      console.log(`🎯 [HOOK] Professional Mode: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
      
      // Start performance monitoring
      performanceMonitor.startTracking(sessionId);
      
      const result = await professionalIntegration.generateWithProfessionalMode(prompt, config);
      
      // End performance monitoring
      const performanceMetrics = performanceMonitor.endTracking(sessionId);
      
      console.log('✅ [HOOK] Professional adventure generation complete');
      
      if (performanceMetrics) {
        console.log(`⚡ [HOOK] Performance: ${performanceMetrics.duration}ms, Success rate: ${Math.round((performanceMetrics.successfulFeatures / performanceMetrics.totalFeatures) * 100)}%`);
      }
      
      // Show success message with quality and performance info
      if (isEnabled && 'professionalGrade' in result) {
        const enhancement = result as ProfessionalEnhancement;
        const performanceInfo = performanceMetrics ? ` | ${performanceMetrics.duration}ms` : '';
        toast.success(`🦄 ${enhancement.professionalGrade} Adventure Created!`, {
          description: `Quality: ${Math.round(enhancement.qualityMetrics.overallScore)}/100 | Unicorn Score: ${Math.round(enhancement.unicornScore)}/100${performanceInfo}`,
          duration: 4000
        });
      } else {
        toast.success('Adventure created successfully!', {
          description: 'Using standard generation',
          duration: 3000
        });
      }
      
      return result;
    } catch (error) {
      // End performance monitoring even on error
      performanceMonitor.endTracking(sessionId);
      
      console.error('❌ [HOOK] Professional generation failed:', error);
      
      // Show appropriate error message
      if (error instanceof Error) {
        toast.error('Adventure generation failed', {
          description: error.message,
          duration: 4000
        });
      } else {
        toast.error('Adventure generation failed', {
          description: 'An unexpected error occurred',
          duration: 4000
        });
      }
      
      throw error;
    }
  }, [isAvailable, isInitialized, isEnabled, config]);

  // Analyze quality of enhancement
  const analyzeQuality = useCallback((enhancement: ProfessionalEnhancement): QualityBreakdown => {
    try {
      console.log('📊 [HOOK] Analyzing adventure quality...');
      
      const breakdown = qualityMetricsEngine.generateQualityBreakdown(enhancement);
      
      console.log(`📊 [HOOK] Quality analysis complete - Grade: ${breakdown.grade}`);
      console.log(`🦄 [HOOK] Unicorn Score: ${Math.round(breakdown.metrics.unicornScore)}/100`);
      
      // Save quality history
      professionalConfigStorage.addQualityHistoryEntry({
        overallScore: breakdown.metrics.overallScore,
        unicornScore: breakdown.metrics.unicornScore,
        grade: breakdown.grade,
        featuresUsed: enhancement.featuresApplied,
        processingTime: enhancement.processingTime
      });
      
      // Update feature usage stats
      enhancement.featuresApplied.forEach(featureName => {
        professionalConfigStorage.updateFeatureUsageStats(
          featureName,
          breakdown.metrics.overallScore,
          5 // Default satisfaction score
        );
      });
      
      console.log('💾 [HOOK] Quality data saved to history');
      
      return breakdown;
    } catch (error) {
      console.error('❌ [HOOK] Quality analysis failed:', error);
      throw error;
    }
  }, []);

  // Get health status
  const getHealthStatus = useCallback(() => {
    try {
      return professionalIntegration.getHealthStatus();
    } catch (error) {
      console.error('❌ [HOOK] Failed to get health status:', error);
      return {
        isHealthy: false,
        metrics: {},
        unicornReadiness: 0,
        recommendations: ['Professional Mode not available']
      };
    }
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    try {
      return professionalMode.getPerformanceMetrics();
    } catch (error) {
      console.error('❌ [HOOK] Failed to get performance metrics:', error);
      return {
        totalGenerations: 0,
        averageQualityScore: 0,
        unicornTierGenerations: 0,
        userSatisfactionScore: 0
      };
    }
  }, []);

  // Configuration management methods
  const saveConfiguration = useCallback((): boolean => {
    try {
      return professionalConfigStorage.saveConfig(config);
    } catch (error) {
      console.error('❌ [HOOK] Failed to save configuration:', error);
      return false;
    }
  }, [config]);

  const loadConfiguration = useCallback((userId?: string): boolean => {
    try {
      const savedConfig = professionalConfigStorage.loadConfig(userId);
      if (savedConfig) {
        setConfig(savedConfig);
        setIsEnabled(savedConfig.enabled);
        
        // Apply to professional mode manager
        professionalMode.updateFeatures(savedConfig.features);
        if (savedConfig.enabled) {
          professionalMode.enable();
        } else {
          professionalMode.disable();
        }
        
        console.log('✅ [HOOK] Configuration loaded successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [HOOK] Failed to load configuration:', error);
      return false;
    }
  }, []);

  const exportConfiguration = useCallback((): string => {
    try {
      return professionalConfigStorage.exportConfiguration();
    } catch (error) {
      console.error('❌ [HOOK] Failed to export configuration:', error);
      throw error;
    }
  }, []);

  const importConfiguration = useCallback((data: string, userId?: string): boolean => {
    try {
      const success = professionalConfigStorage.importConfiguration(data, userId);
      if (success) {
        // Reload configuration after import
        loadConfiguration(userId);
        toast.success('Configuration imported successfully!');
      } else {
        toast.error('Failed to import configuration');
      }
      return success;
    } catch (error) {
      console.error('❌ [HOOK] Failed to import configuration:', error);
      toast.error('Failed to import configuration');
      return false;
    }
  }, [loadConfiguration]);

  const clearConfiguration = useCallback(() => {
    try {
      professionalConfigStorage.clearAllData();
      
      // Reset to defaults
      const defaultConfig: ProfessionalModeConfig = {
        enabled: false,
        features: {
          enhancedPromptAnalysis: true,
          multiSolutionPuzzles: true,
          professionalLayout: true,
          enhancedNPCs: true,
          tacticalCombat: true,
          editorialExcellence: true,
          accessibilityFeatures: true,
          mathematicalValidation: true
        },
        qualityTarget: 'professional',
        performanceMode: 'balanced',
        fallbackBehavior: 'graceful'
      };
      
      setConfig(defaultConfig);
      setIsEnabled(false);
      
      console.log('🗑️ [HOOK] Configuration cleared');
      toast.success('Configuration reset to defaults');
    } catch (error) {
      console.error('❌ [HOOK] Failed to clear configuration:', error);
      toast.error('Failed to clear configuration');
    }
  }, []);

  const getQualityStatistics = useCallback(() => {
    try {
      return professionalConfigStorage.getQualityStatistics();
    } catch (error) {
      console.error('❌ [HOOK] Failed to get quality statistics:', error);
      return {
        averageOverallScore: 0,
        averageUnicornScore: 0,
        mostCommonGrade: 'Standard',
        totalGenerations: 0,
        averageProcessingTime: 0,
        mostUsedFeatures: []
      };
    }
  }, []);

  // Performance monitoring methods
  const getPerformanceComparison = useCallback((): PerformanceComparison => {
    try {
      return performanceMonitor.getPerformanceComparison();
    } catch (error) {
      console.error('❌ [HOOK] Failed to get performance comparison:', error);
      return {
        standardMode: { averageTime: 0, successRate: 0, memoryUsage: 0 },
        professionalMode: { averageTime: 0, successRate: 0, memoryUsage: 0, qualityBoost: 0 },
        performanceRatio: 1,
        qualityRatio: 1,
        efficiency: 1
      };
    }
  }, []);

  const getPerformanceStatistics = useCallback(() => {
    try {
      return performanceMonitor.getStatistics();
    } catch (error) {
      console.error('❌ [HOOK] Failed to get performance statistics:', error);
      return {
        totalSessions: 0,
        averageDuration: 0,
        averageSuccessRate: 0,
        averageMemoryUsage: 0,
        cacheHitRate: 0,
        alertCount: 0,
        topSlowFeatures: []
      };
    }
  }, []);

  const getPerformanceAlerts = useCallback(() => {
    try {
      return performanceMonitor.getAlerts();
    } catch (error) {
      console.error('❌ [HOOK] Failed to get performance alerts:', error);
      return [];
    }
  }, []);

  const clearPerformanceCache = useCallback(() => {
    try {
      performanceMonitor.clearCache();
      toast.success('Performance cache cleared');
    } catch (error) {
      console.error('❌ [HOOK] Failed to clear performance cache:', error);
      toast.error('Failed to clear performance cache');
    }
  }, []);

  return {
    // State
    isEnabled,
    isAvailable,
    isInitialized,
    config,
    unicornReadiness,
    
    // Actions
    enable,
    disable,
    updateConfig,
    updateFeatures,
    
    // Generation
    generateWithProfessionalMode,
    
    // Quality Analysis
    analyzeQuality,
    
    // Status
    getHealthStatus,
    getPerformanceMetrics,
    
    // Configuration Management
    saveConfiguration,
    loadConfiguration,
    exportConfiguration,
    importConfiguration,
    clearConfiguration,
    getQualityStatistics,
    
    // Performance Monitoring
    getPerformanceComparison,
    getPerformanceStatistics,
    getPerformanceAlerts,
    clearPerformanceCache
  };
};

export default useProfessionalMode;