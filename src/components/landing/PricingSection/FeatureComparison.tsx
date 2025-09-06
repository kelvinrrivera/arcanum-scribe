import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Info, ChevronDown, ChevronUp, Sparkles, Crown, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Feature {
  name: string;
  description: string;
  reader: boolean | string;
  creator: boolean | string;
  architect: boolean | string;
  category: 'generation' | 'access' | 'features' | 'support';
}

const features: Feature[] = [
  // Generation Features - IMPLEMENTED
  {
    name: 'Adventure Generation',
    description: 'Create complete D&D adventures with encounters, NPCs, and storylines',
    reader: false,
    creator: '3 ✨ per adventure',
    architect: '3 ✨ per adventure',
    category: 'generation'
  },
  {
    name: 'Individual Components',
    description: 'Generate monsters, NPCs, magic items, and puzzles separately',
    reader: false,
    creator: '1 ✨ per component',
    architect: '1 ✨ per component',
    category: 'generation'
  },
  {
    name: 'Monthly Magic Credits',
    description: 'Your creative currency for generating new content',
    reader: '0 ✨',
    creator: '10 ✨',
    architect: '30 ✨',
    category: 'generation'
  },
  {
    name: 'Additional Credits Purchase',
    description: 'Buy extra credits when you need more creative power',
    reader: false,
    creator: 'Coming Soon',
    architect: 'Coming Soon',
    category: 'generation'
  },
  
  // Access Features - IMPLEMENTED
  {
    name: 'Public Legend Library',
    description: 'Browse and download adventures created by the community',
    reader: true,
    creator: true,
    architect: true,
    category: 'access'
  },
  {
    name: 'PDF Downloads',
    description: 'Download adventures as beautifully formatted PDFs',
    reader: '3 per month (watermarked)',
    creator: 'Unlimited (watermark-free)',
    architect: 'Unlimited (watermark-free)',
    category: 'access'
  },
  {
    name: 'Private Adventures',
    description: 'Keep your creations private for your table only',
    reader: false,
    creator: false,
    architect: true,
    category: 'access'
  },
  {
    name: 'Public Sharing',
    description: 'Share your adventures with the community',
    reader: false,
    creator: 'Default setting',
    architect: 'Optional',
    category: 'access'
  },
  
  // Advanced Features - ROADMAP ITEMS
  {
    name: 'Adventure Forge (Coming Soon)',
    description: 'Visual node-based adventure builder for complex narratives - In Development',
    reader: false,
    creator: false,
    architect: 'Coming Soon',
    category: 'features'
  },
  {
    name: 'Game Systems',
    description: 'Currently supports D&D 5e, with Pathfinder 2e in development',
    reader: 'D&D 5e (view only)',
    creator: 'D&D 5e',
    architect: 'D&D 5e + Pathfinder 2e (Coming Soon)',
    category: 'features'
  },
  {
    name: 'Professional PDF Templates',
    description: 'Enhanced layouts and formatting options',
    reader: false,
    creator: 'Basic templates',
    architect: 'Enhanced templates',
    category: 'features'
  },
  {
    name: 'VTT Export (Coming Soon)',
    description: 'Export to Roll20, FoundryVTT - In Development',
    reader: false,
    creator: false,
    architect: 'Coming Soon',
    category: 'features'
  },
  
  // Support Features - PARTIALLY IMPLEMENTED
  {
    name: 'Generation Priority (Coming Soon)',
    description: 'Priority queue system - In Development',
    reader: false,
    creator: 'Standard queue',
    architect: 'Coming Soon',
    category: 'support'
  },
  {
    name: 'Creator Analytics (Coming Soon)',
    description: 'Track views, downloads, and ratings - In Development',
    reader: false,
    creator: 'Coming Soon',
    architect: 'Coming Soon',
    category: 'support'
  },
  {
    name: 'Community Features (Coming Soon)',
    description: 'Ratings, comments, and community interaction - In Development',
    reader: 'Coming Soon',
    creator: 'Coming Soon',
    architect: 'Coming Soon',
    category: 'support'
  }
];

const categoryNames = {
  generation: 'Content Generation',
  access: 'Library Access',
  features: 'Advanced Features',
  support: 'Support & Recognition'
};

const categoryIcons = {
  generation: Sparkles,
  access: BookOpen,
  features: Crown,
  support: Info
};

export interface FeatureComparisonProps {
  className?: string;
}

export const FeatureComparison: React.FC<FeatureComparisonProps> = ({ className }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['generation', 'access']));
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const renderFeatureValue = (value: boolean | string, tier: 'reader' | 'creator' | 'architect') => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground mx-auto" />
      );
    }
    
    const colorClass = tier === 'reader' ? 'text-blue-400' : 
                     tier === 'creator' ? 'text-primary' : 'text-accent';
    
    return (
      <span className={`text-sm font-medium ${colorClass}`}>
        {value}
      </span>
    );
  };

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Mobile Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="w-full"
        >
          {isMobileExpanded ? 'Hide' : 'Show'} Feature Comparison
          {isMobileExpanded ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Comparison Table */}
      <div className={`${isMobileExpanded ? 'block' : 'hidden lg:block'}`}>
        <Card className="overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Feature Comparison
            </CardTitle>
            <p className="text-muted-foreground">
              Compare what each character class can do
            </p>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Header Row */}
            <div className="grid grid-cols-4 border-b border-border bg-muted/30">
              <div className="p-4 font-semibold">Features</div>
              <div className="p-4 text-center font-semibold border-l border-border">
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  The Reader
                </div>
              </div>
              <div className="p-4 text-center font-semibold border-l border-border">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  The Creator
                </div>
              </div>
              <div className="p-4 text-center font-semibold border-l border-border">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="h-4 w-4 text-accent" />
                  The Architect
                </div>
              </div>
            </div>

            {/* Feature Categories */}
            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
              const isExpanded = expandedCategories.has(category);
              const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
              
              return (
                <div key={category}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full grid grid-cols-4 border-b border-border bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="p-3 text-left font-medium flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4 text-primary" />
                      {categoryNames[category as keyof typeof categoryNames]}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 ml-auto" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      )}
                    </div>
                    <div className="border-l border-border"></div>
                    <div className="border-l border-border"></div>
                    <div className="border-l border-border"></div>
                  </button>

                  {/* Category Features */}
                  {isExpanded && categoryFeatures.map((feature, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="grid grid-cols-4 border-b border-border hover:bg-muted/30 transition-colors cursor-help">
                            <div className="p-4 flex items-center gap-2">
                              <span className="font-medium">{feature.name}</span>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div className="p-4 text-center border-l border-border flex items-center justify-center">
                              {renderFeatureValue(feature.reader, 'reader')}
                            </div>
                            <div className="p-4 text-center border-l border-border flex items-center justify-center">
                              {renderFeatureValue(feature.creator, 'creator')}
                            </div>
                            <div className="p-4 text-center border-l border-border flex items-center justify-center">
                              {renderFeatureValue(feature.architect, 'architect')}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{feature.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Beta Notice */}
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-primary mb-1">Beta Development Notice</h4>
              <p className="text-sm text-muted-foreground">
                These features represent our planned functionality. Some features may be adjusted during beta development 
                based on user feedback and technical considerations. Join our beta waitlist to be notified when these 
                character classes become available!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};