/**
 * Enhanced Feature Configuration - Advanced Settings Panel
 * 
 * This component allows users to customize which enhanced features
 * are enabled for their adventure generation.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Puzzle, 
  Palette, 
  Users, 
  Sword, 
  FileText, 
  Heart, 
  Calculator,
  Settings,
  Zap,
  Crown,
  Info,
  RotateCcw
} from 'lucide-react';

import type { ProfessionalModeConfig } from '@/lib/professional-mode-manager';

interface ProfessionalFeatureConfigProps {
  config: ProfessionalModeConfig;
  onConfigChange: (config: ProfessionalModeConfig) => void;
  className?: string;
}

interface FeatureInfo {
  key: keyof ProfessionalModeConfig['features'];
  name: string;
  description: string;
  icon: React.ReactNode;
  impact: 'high' | 'medium' | 'low';
  category: 'content' | 'mechanics' | 'presentation' | 'experience';
}

const FEATURE_INFO: FeatureInfo[] = [
  {
    key: 'enhancedPromptAnalysis',
    name: 'Advanced Prompt Analysis',
    description: 'Deep analysis of your prompts for enhanced creativity and relevance',
    icon: <Brain className="w-5 h-5" />,
    impact: 'high',
    category: 'content'
  },
  {
    key: 'multiSolutionPuzzles',
    name: 'Complex Puzzles',
    description: 'Puzzles with multiple creative solutions that encourage player innovation',
    icon: <Puzzle className="w-5 h-5" />,
    impact: 'high',
    category: 'content'
  },
  {
    key: 'professionalLayout',
    name: 'Enhanced Layout',
    description: 'Professional typography, formatting, and visual design',
    icon: <Palette className="w-5 h-5" />,
    impact: 'medium',
    category: 'presentation'
  },
  {
    key: 'enhancedNPCs',
    name: 'Rich NPCs',
    description: 'Detailed NPCs with complex personalities and motivations',
    icon: <Users className="w-5 h-5" />,
    impact: 'high',
    category: 'content'
  },
  {
    key: 'tacticalCombat',
    name: 'Tactical Combat',
    description: 'Advanced combat encounters with environmental features and tactical options',
    icon: <Sword className="w-5 h-5" />,
    impact: 'medium',
    category: 'mechanics'
  },
  {
    key: 'editorialExcellence',
    name: 'Editorial Polish',
    description: 'Professional editing, proofreading, and content refinement',
    icon: <FileText className="w-5 h-5" />,
    impact: 'medium',
    category: 'presentation'
  },
  {
    key: 'accessibilityFeatures',
    name: 'Accessibility Features',
    description: 'Inclusive design elements for players with different needs',
    icon: <Heart className="w-5 h-5" />,
    impact: 'medium',
    category: 'experience'
  },
  {
    key: 'mathematicalValidation',
    name: 'Mathematical Validation',
    description: 'Precise validation of game mechanics and mathematical accuracy',
    icon: <Calculator className="w-5 h-5" />,
    impact: 'low',
    category: 'mechanics'
  }
];

const QUALITY_TARGETS = [
  { value: 'standard', label: 'Standard', description: 'Good quality content' },
  { value: 'professional', label: 'Professional', description: 'High-quality professional content' },
  { value: 'premium', label: 'Premium', description: 'Premium quality with enhanced features' }
];

const PERFORMANCE_MODES = [
  { value: 'speed', label: 'Speed', description: 'Faster generation, good quality' },
  { value: 'balanced', label: 'Balanced', description: 'Balance of speed and quality' },
  { value: 'quality', label: 'Quality', description: 'Maximum quality, slower generation' }
];

export const ProfessionalFeatureConfig: React.FC<ProfessionalFeatureConfigProps> = ({
  config,
  onConfigChange,
  className = ''
}) => {
  const [localConfig, setLocalConfig] = useState<ProfessionalModeConfig>(config);

  // Handle feature toggle
  const handleFeatureToggle = (featureKey: keyof ProfessionalModeConfig['features'], enabled: boolean) => {
    const newConfig = {
      ...localConfig,
      features: {
        ...localConfig.features,
        [featureKey]: enabled
      }
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  // Handle quality target change
  const handleQualityTargetChange = (target: ProfessionalModeConfig['qualityTarget']) => {
    const newConfig = { ...localConfig, qualityTarget: target };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  // Handle performance mode change
  const handlePerformanceModeChange = (mode: ProfessionalModeConfig['performanceMode']) => {
    const newConfig = { ...localConfig, performanceMode: mode };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  // Reset to defaults
  const handleReset = () => {
    const defaultConfig: ProfessionalModeConfig = {
      enabled: true,
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
    setLocalConfig(defaultConfig);
    onConfigChange(defaultConfig);
  };

  // Calculate enabled features count
  const enabledFeatures = Object.values(localConfig.features).filter(Boolean).length;
  const totalFeatures = Object.keys(localConfig.features).length;

  // Group features by category
  const featuresByCategory = FEATURE_INFO.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureInfo[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return <Brain className="w-4 h-4" />;
      case 'mechanics': return <Settings className="w-4 h-4" />;
      case 'presentation': return <Palette className="w-4 h-4" />;
      case 'experience': return <Heart className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'content': return 'Content & Creativity';
      case 'mechanics': return 'Game Mechanics';
      case 'presentation': return 'Design & Layout';
      case 'experience': return 'User Experience';
      default: return category;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Enhanced Feature Configuration</CardTitle>
                <CardDescription>
                  Customize your advanced adventure generation features
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {enabledFeatures}/{totalFeatures}
              </div>
              <div className="text-sm text-muted-foreground">Features Enabled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent capitalize">
                {localConfig.qualityTarget.replace('-', ' ')}
              </div>
              <div className="text-sm text-muted-foreground">Quality Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary capitalize">
                {localConfig.performanceMode}
              </div>
              <div className="text-sm text-muted-foreground">Performance Mode</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature categories */}
      <div className="space-y-4">
        {Object.entries(featuresByCategory).map(([category, features]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getCategoryIcon(category)}
                <span>{getCategoryName(category)}</span>
                <Badge variant="outline">
                  {features.filter(f => localConfig.features[f.key]).length}/{features.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 rounded-full bg-muted">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{feature.name}</h4>
                          <Badge 
                            variant={feature.impact === 'high' ? 'default' : feature.impact === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {feature.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={localConfig.features[feature.key]}
                        onCheckedChange={(enabled) => handleFeatureToggle(feature.key, enabled)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quality Target */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Quality Target</span>
            </CardTitle>
            <CardDescription>
              Set the desired quality level for generated content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {QUALITY_TARGETS.map((target) => (
                <div
                  key={target.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    localConfig.qualityTarget === target.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handleQualityTargetChange(target.value as any)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{target.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {target.description}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      localConfig.qualityTarget === target.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Performance Mode</span>
            </CardTitle>
            <CardDescription>
              Balance between generation speed and quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {PERFORMANCE_MODES.map((mode) => (
                <div
                  key={mode.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    localConfig.performanceMode === mode.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handlePerformanceModeChange(mode.value as any)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{mode.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {mode.description}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      localConfig.performanceMode === mode.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">
              Configuration Summary
            </span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>• {enabledFeatures} enhanced features enabled</div>
            <div>• Quality target: {localConfig.qualityTarget.replace('-', ' ')}</div>
            <div>• Performance mode: {localConfig.performanceMode}</div>
            <div>• Enhanced features will improve content depth and quality</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalFeatureConfig;