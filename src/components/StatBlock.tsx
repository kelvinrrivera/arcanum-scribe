import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, Sword, Target, Zap, Eye, MessageCircle } from 'lucide-react';

interface Ability {
  name: string;
  description: string;
}

interface MonsterAbilities {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

interface Monster {
  name: string;
  size: string;
  type: string;
  alignment: string;
  abilities: MonsterAbilities;
  armorClass: number;
  hitPoints: number;
  speed: string;
  skills?: string[];
  senses?: string[];
  languages?: string[];
  challengeRating: string;
  proficiencyBonus: number;
  traits?: Ability[];
  actions?: Ability[];
  bonusActions?: Ability[];
  reactions?: Ability[];
  tactics?: string;
  description?: string;
}

interface StatBlockProps {
  monster: Monster;
  className?: string;
}

const StatBlock: React.FC<StatBlockProps> = ({ monster, className = '' }) => {
  // Helper function to calculate ability modifiers
  const getModifier = (abilityScore: number): string => {
    const modifier = Math.floor((abilityScore - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  // Helper function to format abilities
  const formatAbilities = (abilities: MonsterAbilities) => {
    return Object.entries(abilities).map(([ability, score]) => ({
      name: ability,
      score,
      modifier: getModifier(score)
    }));
  };

  // Helper function to get CR color
  const getCRColor = (cr: string) => {
    const numCR = parseFloat(cr);
    if (numCR <= 1) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (numCR <= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (numCR <= 10) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (numCR <= 15) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-purple-100 text-purple-800 border-purple-300';
  };

  const formattedAbilities = formatAbilities(monster.abilities);

  // Decorative separator component
  const DecorativeSeparator = () => (
    <div className="flex items-center my-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      <div className="mx-3 text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-primary"></div>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
    </div>
  );

  return (
    <Card className={`stat-block border-2 border-border bg-card shadow-lg magical-shadow ${className}`}>
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-4 xl:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl xl:text-2xl font-display font-bold text-foreground mb-1 break-words">
                {monster.name}
              </h2>
              <div className="text-xs sm:text-sm text-muted-foreground italic font-sans break-words">
                {monster.size} {monster.type}, {monster.alignment}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 flex-shrink-0 ${getCRColor(monster.challengeRating)}`}
            >
              CR {monster.challengeRating}
            </Badge>
          </div>
        </div>

        <div className="p-4 xl:p-6">
          {/* Optimized Layout: Better breathing room */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            
            {/* Left Column - Core Stats (30%) */}
            <div className="lg:col-span-1 space-y-4">
              
              {/* Defensive Stats - Mobile Optimized */}
              <div className="bg-muted/20 rounded-lg p-3 xl:p-4 border border-border">
                <div className="grid grid-cols-1 gap-2 xl:gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 xl:h-4 xl:w-4 text-blue-600" />
                      <span className="font-sans font-medium text-xs xl:text-sm">Armor Class</span>
                    </div>
                    <span className="text-lg xl:text-2xl font-bold text-blue-600">{monster.armorClass}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3 xl:h-4 xl:w-4 text-red-600" />
                      <span className="font-sans font-medium text-xs xl:text-sm">Hit Points</span>
                    </div>
                    <span className="text-lg xl:text-2xl font-bold text-red-600">{monster.hitPoints}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 xl:h-4 xl:w-4 text-yellow-600" />
                      <span className="font-sans font-medium text-xs xl:text-sm">Speed</span>
                    </div>
                    <span className="text-sm xl:text-lg font-semibold text-yellow-600 break-all">{monster.speed}</span>
                  </div>
                </div>
              </div>

              {/* Ability Scores - Desktop Enhanced */}
              <div className="bg-muted/20 rounded-lg p-3 xl:p-4 border border-border">
                <h3 className="font-display font-semibold text-xs xl:text-sm text-foreground mb-3 uppercase tracking-wider">
                  Ability Scores
                </h3>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 xl:gap-3">
                  {formattedAbilities.map(({ name, score, modifier }) => (
                    <div key={name} className="text-center bg-background rounded p-2 xl:p-3 border border-border ability-score-box cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="font-display font-bold text-xs xl:text-xs text-muted-foreground uppercase tracking-wide">
                        {name}
                      </div>
                      <div className="text-sm xl:text-base font-medium text-foreground mt-1">{score}</div>
                      <div className="text-base xl:text-xl font-bold text-primary">
                        {modifier}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              {(monster.skills || monster.senses || monster.languages) && (
                <div className="bg-muted/20 rounded-lg p-4 border border-border space-y-2 text-sm">
                  {monster.skills && (
                    <div>
                      <span className="font-sans font-semibold text-foreground">Skills:</span>
                      <span className="ml-2 text-muted-foreground">
                        {Array.isArray(monster.skills) ? monster.skills.join(', ') : monster.skills}
                      </span>
                    </div>
                  )}
                  {monster.senses && (
                    <div className="flex items-start gap-2">
                      <Eye className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-sans font-semibold text-foreground">Senses:</span>
                        <span className="ml-2 text-muted-foreground">
                          {Array.isArray(monster.senses) ? monster.senses.join(', ') : monster.senses}
                        </span>
                      </div>
                    </div>
                  )}
                  {monster.languages && (
                    <div className="flex items-start gap-2">
                      <MessageCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-sans font-semibold text-foreground">Languages:</span>
                        <span className="ml-2 text-muted-foreground">
                          {Array.isArray(monster.languages) ? monster.languages.join(', ') : monster.languages}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Actions & Abilities (70%) */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Special Traits */}
              {monster.traits && monster.traits.length > 0 && (
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    Special Traits
                  </h3>
                  <div className="space-y-3">
                    {monster.traits.map((trait, index) => (
                      <div key={index} className="bg-background rounded-lg p-3 border border-border">
                        <div className="font-sans font-bold text-foreground">
                          {trait.name}.
                        </div>
                        <div className="font-sans text-muted-foreground mt-1 leading-relaxed">
                          {trait.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {monster.actions && monster.actions.length > 0 && (
                <div>
                  <DecorativeSeparator />
                  <h3 className="font-display font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    <Sword className="h-5 w-5 text-red-600" />
                    Actions
                  </h3>
                  <div className="space-y-3">
                    {monster.actions.map((action, index) => (
                      <div key={index} className="bg-background rounded-lg p-3 border border-border border-l-4 border-l-red-500 action-item">
                        <div className="font-sans font-bold text-foreground">
                          {action.name}.
                        </div>
                        <div className="font-sans text-muted-foreground mt-1 leading-relaxed">
                          {action.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bonus Actions */}
              {monster.bonusActions && monster.bonusActions.length > 0 && (
                <div>
                  <DecorativeSeparator />
                  <h3 className="font-display font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Bonus Actions
                  </h3>
                  <div className="space-y-3">
                    {monster.bonusActions.map((action, index) => (
                      <div key={index} className="bg-background rounded-lg p-3 border border-border border-l-4 border-l-blue-500 action-item">
                        <div className="font-sans font-bold text-foreground">
                          {action.name}.
                        </div>
                        <div className="font-sans text-muted-foreground mt-1 leading-relaxed">
                          {action.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reactions */}
              {monster.reactions && monster.reactions.length > 0 && (
                <div>
                  <DecorativeSeparator />
                  <h3 className="font-display font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Reactions
                  </h3>
                  <div className="space-y-3">
                    {monster.reactions.map((reaction, index) => (
                      <div key={index} className="bg-background rounded-lg p-3 border border-border border-l-4 border-l-purple-500 action-item">
                        <div className="font-sans font-bold text-foreground">
                          {reaction.name}.
                        </div>
                        <div className="font-sans text-muted-foreground mt-1 leading-relaxed">
                          {reaction.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Combat Tactics - The Crown Jewel */}
              {monster.tactics && (
                <div>
                  <DecorativeSeparator />
                  <div className="combat-tactics-section rounded-xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    {/* Animated background effect */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.4),transparent_50%)]"></div>
                      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(120,119,198,0.1)_90deg,transparent_180deg)]"></div>
                    </div>
                    
                    {/* Floating orbs for magical effect */}
                    <div className="absolute top-4 right-6 w-2 h-2 rounded-full bg-primary/30 animate-pulse"></div>
                    <div className="absolute bottom-6 left-8 w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse delay-700"></div>
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold text-2xl text-foreground flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                            <Target className="h-6 w-6 text-primary" />
                          </div>
                          Combat Tactics
                        </h3>
                        <Badge variant="secondary" className="text-xs font-medium px-3 py-1 animate-pulse">
                          🧠 Expert AI Analysis
                        </Badge>
                      </div>
                      
                      <div className="bg-background/90 backdrop-blur-sm rounded-xl p-5 border-2 border-border shadow-inner relative overflow-hidden">
                        {/* Inner glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
                        
                        <div className="relative">
                          <div className="font-sans text-foreground leading-relaxed whitespace-pre-line text-sm">
                            {monster.tactics}
                          </div>
                          
                          {/* Strategic importance indicator */}
                          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                              <span className="font-medium">Tactical Intelligence Processed</span>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div key={star} className="w-3 h-3 text-primary">
                                  ⭐
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced GM guidance */}
                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 py-2 border border-primary/20">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Designed by expert game masters for tactical advantage
                          </span>
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-accent to-primary animate-pulse delay-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatBlock;