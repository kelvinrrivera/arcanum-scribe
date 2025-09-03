/**
 * Professional Mode Configuration Panel
 * 
 * Advanced configuration interface for professional mode features,
 * allowing users to customize individual feature settings and preferences.
 */

import React, { useState, useEffect } from 'react';
import type { ProfessionalModeConfig } from '../../lib/professional-mode-manager';

interface ProfessionalConfigPanelProps {
  config: ProfessionalModeConfig;
  onConfigChange: (config: ProfessionalModeConfig) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const ProfessionalConfigPanel: React.FC<ProfessionalConfigPanelProps> = ({
  config,
  onConfigChange,
  onClose,
  isOpen
}) => {
  const [localConfig, setLocalConfig] = useState<ProfessionalModeConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
    setHasChanges(false);
  }, [config]);

  const handleFeatureToggle = (featureName: keyof ProfessionalModeConfig['features']) => {
    const newConfig = {
      ...localConfig,
      features: {
        ...localConfig.features,
        [featureName]: !localConfig.features[featureName]
      }
    };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handlePerformanceModeChange = (mode: ProfessionalModeConfig['performanceMode']) => {
    const newConfig = {
      ...localConfig,
      performanceMode: mode
    };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    const defaultConfig: ProfessionalModeConfig = {
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
      performanceMode: 'balanced'
    };
    setLocalConfig(defaultConfig);
    setHasChanges(true);
  };

  const featureDescriptions = {
    enhancedPromptAnalysis: {
      name: 'Enhanced Prompt Analysis',
      description: 'Advanced AI analysis of user prompts for better content generation',
      impact: 'Improves content relevance and quality'
    },
    multiSolutionPuzzles: {
      name: 'Multi-Solution Puzzles',
      description: 'Creates puzzles with multiple valid solutions for increased replayability',
      impact: 'Enhances player agency and engagement'
    },
    professionalLayout: {
      name: 'Professional Layout',
      description: 'Publication-ready typography and formatting',
      impact: 'Creates polished, professional-looking documents'
    },
    enhancedNPCs: {
      name: 'Enhanced NPCs',
      description: 'Rich NPCs with detailed personalities, dialogue, and backgrounds',
      impact: 'Adds depth and immersion to adventures'
    },
    tacticalCombat: {
      name: 'Tactical Combat',
      description: 'Advanced combat encounters with environmental factors and strategy',
      impact: 'Creates more engaging and strategic combat'
    },
    editorialExcellence: {
      name: 'Editorial Excellence',
      description: 'Professional editing and proofreading standards',
      impact: 'Ensures high-quality, error-free content'
    },
    accessibilityFeatures: {
      name: 'Accessibility Features',
      description: 'WCAG-compliant accessibility enhancements',
      impact: 'Makes content accessible to all users'
    },
    mathematicalValidation: {
      name: 'Mathematical Validation',
      description: 'Validates game mechanics and statistical accuracy',
      impact: 'Ensures balanced and fair gameplay'
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Professional Mode Configuration</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close configuration panel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Performance Mode Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['speed', 'balanced', 'quality'] as const).map((mode) => (
                <label
                  key={mode}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                    localConfig.performanceMode === mode
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="performanceMode"
                    value={mode}
                    checked={localConfig.performanceMode === mode}
                    onChange={() => handlePerformanceModeChange(mode)}
                    className="sr-only"
                  />
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      localConfig.performanceMode === mode
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {localConfig.performanceMode === mode && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="font-medium capitalize">{mode}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {mode === 'speed' && 'Optimized for fast generation with essential features'}
                    {mode === 'balanced' && 'Balanced performance with most features enabled'}
                    {mode === 'quality' && 'Maximum quality with all features enabled'}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* Feature Configuration */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Features</h3>
            <div className="space-y-4">
              {Object.entries(featureDescriptions).map(([featureKey, feature]) => {
                const isEnabled = localConfig.features[featureKey as keyof typeof localConfig.features];
                
                return (
                  <div
                    key={featureKey}
                    className={`border rounded-lg p-4 transition-colors ${
                      isEnabled ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium text-gray-800">{feature.name}</h4>
                          {isEnabled && (
                            <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                              Enabled
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                        <p className="text-xs text-purple-600 font-medium">{feature.impact}</p>
                      </div>
                      
                      <label className="flex items-center ml-4">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleFeatureToggle(featureKey as keyof ProfessionalModeConfig['features'])}
                          className="sr-only"
                        />
                        <div className={`relative w-12 h-6 rounded-full transition-colors ${
                          isEnabled ? 'bg-purple-500' : 'bg-gray-300'
                        }`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            isEnabled ? 'transform translate-x-6' : ''
                          }`}></div>
                        </div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Configuration Summary</h4>
            <div className="text-sm text-gray-600">
              <p>Performance Mode: <span className="font-medium capitalize">{localConfig.performanceMode}</span></p>
              <p>
                Enabled Features: {Object.values(localConfig.features).filter(Boolean).length} of {Object.keys(localConfig.features).length}
              </p>
              {localConfig.performanceMode === 'speed' && (
                <p className="text-yellow-600 mt-2">⚡ Speed mode may disable some features for optimal performance</p>
              )}
              {localConfig.performanceMode === 'quality' && (
                <p className="text-purple-600 mt-2">🦄 Quality mode enables all features for maximum enhancement</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Reset to Defaults
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-4 py-2 rounded-md transition-colors ${
                  hasChanges
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};