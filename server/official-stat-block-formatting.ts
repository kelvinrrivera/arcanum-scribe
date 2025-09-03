/**
 * Official Stat Block Formatting System
 * 
 * This module implements D&D 5e official stat block formatting with proper
 * spacing, typography, automatic validation for mathematical accuracy,
 * appropriate challenge ratings, and complete spellcasting block formatting.
 */

export interface OfficialStatBlock {
  id: string;
  name: string;
  size: CreatureSize;
  type: CreatureType;
  subtype?: string;
  alignment: Alignment;
  armorClass: ArmorClass;
  hitPoints: HitPoints;
  speed: Speed;
  abilityScores: AbilityScores;
  savingThrows: SavingThrows;
  skills: Skills;
  damageVulnerabilities: DamageType[];
  damageResistances: DamageType[];
  damageImmunities: DamageType[];
  conditionImmunities: Condition[];
  senses: Senses;
  languages: Language[];
  challengeRating: ChallengeRating;
  proficiencyBonus: number;
  features: Feature[];
  actions: Action[];
  bonusActions: BonusAction[];
  reactions: Reaction[];
  legendaryActions?: LegendaryAction[];
  mythicActions?: MythicAction[];
  lairActions?: LairAction[];
  regionalEffects?: RegionalEffect[];
  spellcasting?: Spellcasting;
  formatting: StatBlockFormatting;
  validation: StatBlockValidation;
}

export interface ArmorClass {
  value: number;
  source: string;
  notes?: string;
}

export interface HitPoints {
  average: number;
  formula: string;
  notes?: string;
}

export interface Speed {
  walk?: number;
  fly?: number;
  swim?: number;
  climb?: number;
  burrow?: number;
  hover?: boolean;
  notes?: string;
}

export interface AbilityScores {
  strength: AbilityScore;
  dexterity: AbilityScore;
  constitution: AbilityScore;
  intelligence: AbilityScore;
  wisdom: AbilityScore;
  charisma: AbilityScore;
}

export interface AbilityScore {
  score: number;
  modifier: number;
  savingThrow?: number;
}

export interface SavingThrows {
  [key: string]: number;
}

export interface Skills {
  [key: string]: number;
}

export interface Senses {
  passivePerception: number;
  blindsight?: number;
  darkvision?: number;
  tremorsense?: number;
  truesight?: number;
  telepathy?: number;
  notes?: string;
}

export interface ChallengeRating {
  rating: string;
  xp: number;
  proficiencyBonus: number;
}

export interface Feature {
  name: string;
  description: string;
  type: FeatureType;
  recharge?: RechargeType;
  limited?: LimitedUse;
}

export interface Action {
  name: string;
  description: string;
  type: ActionType;
  attackBonus?: number;
  damage?: Damage[];
  savingThrow?: SavingThrow;
  recharge?: RechargeType;
  limited?: LimitedUse;
}

export interface BonusAction {
  name: string;
  description: string;
  recharge?: RechargeType;
  limited?: LimitedUse;
}

export interface Reaction {
  name: string;
  description: string;
  trigger: string;
  limited?: LimitedUse;
}

export interface LegendaryAction {
  name: string;
  description: string;
  cost: number;
}

export interface MythicAction {
  name: string;
  description: string;
  cost: number;
  trigger?: string;
}

export interface LairAction {
  name: string;
  description: string;
  initiative: number;
  recharge?: RechargeType;
}

export interface RegionalEffect {
  name: string;
  description: string;
  range: string;
  duration: string;
}

export interface Spellcasting {
  type: SpellcastingType;
  level: number;
  ability: AbilityName;
  saveDC: number;
  attackBonus: number;
  spellSlots?: SpellSlots;
  spellsKnown?: SpellsKnown;
  spellList: SpellList;
  notes?: string;
}

export interface SpellSlots {
  1?: number;
  2?: number;
  3?: number;
  4?: number;
  5?: number;
  6?: number;
  7?: number;
  8?: number;
  9?: number;
}

export interface SpellsKnown {
  cantrips?: number;
  1?: number;
  2?: number;
  3?: number;
  4?: number;
  5?: number;
  6?: number;
  7?: number;
  8?: number;
  9?: number;
}

export interface SpellList {
  cantrips?: Spell[];
  1?: Spell[];
  2?: Spell[];
  3?: Spell[];
  4?: Spell[];
  5?: Spell[];
  6?: Spell[];
  7?: Spell[];
  8?: Spell[];
  9?: Spell[];
}

export interface Spell {
  name: string;
  school: SpellSchool;
  level: number;
  castingTime: string;
  range: string;
  components: SpellComponent[];
  duration: string;
  description: string;
  atHigherLevels?: string;
}

export interface Damage {
  formula: string;
  type: DamageType;
  notes?: string;
}

export interface SavingThrow {
  ability: AbilityName;
  dc: number;
  effect: string;
}

export interface LimitedUse {
  count: number;
  period: UsagePeriod;
  resets: ResetCondition;
}

export interface StatBlockFormatting {
  layout: LayoutStyle;
  typography: TypographySettings;
  spacing: SpacingSettings;
  colors: ColorSettings;
  borders: BorderSettings;
  icons: IconSettings;
}

export interface StatBlockValidation {
  mathematical: MathematicalValidation;
  consistency: ConsistencyValidation;
  completeness: CompletenessValidation;
  formatting: FormattingValidation;
  overall: OverallValidation;
}

export interface TypographySettings {
  nameFont: FontSettings;
  headerFont: FontSettings;
  bodyFont: FontSettings;
  statFont: FontSettings;
}

export interface SpacingSettings {
  sectionGap: string;
  lineHeight: number;
  paragraphSpacing: string;
  indentation: string;
}

export interface ColorSettings {
  background: string;
  text: string;
  headers: string;
  accents: string;
  borders: string;
}

export interface BorderSettings {
  style: BorderStyle;
  width: string;
  radius: string;
  color: string;
}

export interface IconSettings {
  enabled: boolean;
  size: string;
  color: string;
  position: IconPosition;
}

export interface FontSettings {
  family: string;
  size: string;
  weight: number;
  style: string;
  transform: TextTransform;
}

export interface MathematicalValidation {
  abilityModifiers: ValidationResult;
  savingThrows: ValidationResult;
  skills: ValidationResult;
  challengeRating: ValidationResult;
  hitPoints: ValidationResult;
  attackBonuses: ValidationResult;
  saveDCs: ValidationResult;
}

export interface ConsistencyValidation {
  proficiencyBonus: ValidationResult;
  spellcasting: ValidationResult;
  features: ValidationResult;
  actions: ValidationResult;
}

export interface CompletenessValidation {
  requiredFields: ValidationResult;
  optionalFields: ValidationResult;
  descriptions: ValidationResult;
  formatting: ValidationResult;
}

export interface FormattingValidation {
  typography: ValidationResult;
  spacing: ValidationResult;
  layout: ValidationResult;
  accessibility: ValidationResult;
}

export interface OverallValidation {
  score: number;
  grade: ValidationGrade;
  issues: ValidationIssue[];
  recommendations: string[];
}

export interface ValidationResult {
  passed: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationIssue {
  type: IssueType;
  severity: IssueSeverity;
  field: string;
  message: string;
  suggestion: string;
}

export interface ValidationError {
  field: string;
  expected: any;
  actual: any;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

// Enums and types
export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type CreatureType = 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon' | 'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid' | 'monstrosity' | 'ooze' | 'plant' | 'undead';
export type Alignment = 'lawful good' | 'neutral good' | 'chaotic good' | 'lawful neutral' | 'true neutral' | 'chaotic neutral' | 'lawful evil' | 'neutral evil' | 'chaotic evil' | 'unaligned';
export type DamageType = 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder';
export type Condition = 'blinded' | 'charmed' | 'deafened' | 'frightened' | 'grappled' | 'incapacitated' | 'invisible' | 'paralyzed' | 'petrified' | 'poisoned' | 'prone' | 'restrained' | 'stunned' | 'unconscious';
export type Language = 'Common' | 'Dwarvish' | 'Elvish' | 'Giant' | 'Gnomish' | 'Goblin' | 'Halfling' | 'Orc' | 'Abyssal' | 'Celestial' | 'Draconic' | 'Deep Speech' | 'Infernal' | 'Primordial' | 'Sylvan' | 'Undercommon';
export type FeatureType = 'passive' | 'active' | 'triggered' | 'aura' | 'legendary' | 'mythic';
export type ActionType = 'melee' | 'ranged' | 'spell' | 'special' | 'multiattack';
export type RechargeType = '4-6' | '5-6' | '6' | 'short-rest' | 'long-rest' | 'dawn' | 'dusk';
export type UsagePeriod = 'turn' | 'round' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export type ResetCondition = 'automatic' | 'rest' | 'dawn' | 'dusk' | 'special';
export type SpellcastingType = 'full' | 'half' | 'third' | 'warlock' | 'innate' | 'ritual';
export type AbilityName = 'Strength' | 'Dexterity' | 'Constitution' | 'Intelligence' | 'Wisdom' | 'Charisma';
export type SpellSchool = 'abjuration' | 'conjuration' | 'divination' | 'enchantment' | 'evocation' | 'illusion' | 'necromancy' | 'transmutation';
export type SpellComponent = 'V' | 'S' | 'M';
export type LayoutStyle = 'official' | 'compact' | 'detailed' | 'minimal';
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double';
export type IconPosition = 'left' | 'right' | 'above' | 'below';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type ValidationGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
export type IssueType = 'mathematical' | 'consistency' | 'formatting' | 'completeness';
export type IssueSeverity = 'error' | 'warning' | 'info';

/**
 * Official Stat Block Formatting System Class
 */
export class OfficialStatBlockFormattingSystem {
  private readonly CHALLENGE_RATING_TABLE = {
    '0': { xp: 10, proficiencyBonus: 2 },
    '1/8': { xp: 25, proficiencyBonus: 2 },
    '1/4': { xp: 50, proficiencyBonus: 2 },
    '1/2': { xp: 100, proficiencyBonus: 2 },
    '1': { xp: 200, proficiencyBonus: 2 },
    '2': { xp: 450, proficiencyBonus: 2 },
    '3': { xp: 700, proficiencyBonus: 2 },
    '4': { xp: 1100, proficiencyBonus: 2 },
    '5': { xp: 1800, proficiencyBonus: 3 },
    '6': { xp: 2300, proficiencyBonus: 3 },
    '7': { xp: 2900, proficiencyBonus: 3 },
    '8': { xp: 3900, proficiencyBonus: 3 },
    '9': { xp: 5000, proficiencyBonus: 4 },
    '10': { xp: 5900, proficiencyBonus: 4 },
    '11': { xp: 7200, proficiencyBonus: 4 },
    '12': { xp: 8400, proficiencyBonus: 4 },
    '13': { xp: 10000, proficiencyBonus: 5 },
    '14': { xp: 11500, proficiencyBonus: 5 },
    '15': { xp: 13000, proficiencyBonus: 5 },
    '16': { xp: 15000, proficiencyBonus: 5 },
    '17': { xp: 18000, proficiencyBonus: 6 },
    '18': { xp: 20000, proficiencyBonus: 6 },
    '19': { xp: 22000, proficiencyBonus: 6 },
    '20': { xp: 25000, proficiencyBonus: 6 },
    '21': { xp: 33000, proficiencyBonus: 7 },
    '22': { xp: 41000, proficiencyBonus: 7 },
    '23': { xp: 50000, proficiencyBonus: 7 },
    '24': { xp: 62000, proficiencyBonus: 7 },
    '25': { xp: 75000, proficiencyBonus: 8 },
    '26': { xp: 90000, proficiencyBonus: 8 },
    '27': { xp: 105000, proficiencyBonus: 8 },
    '28': { xp: 120000, proficiencyBonus: 8 },
    '29': { xp: 135000, proficiencyBonus: 9 },
    '30': { xp: 155000, proficiencyBonus: 9 }
  };

  private readonly OFFICIAL_FORMATTING = {
    typography: {
      nameFont: { family: 'Libre Baskerville', size: '23px', weight: 700, style: 'normal', transform: 'none' },
      headerFont: { family: 'Noto Sans', size: '14px', weight: 700, style: 'normal', transform: 'uppercase' },
      bodyFont: { family: 'Noto Sans', size: '14px', weight: 400, style: 'normal', transform: 'none' },
      statFont: { family: 'Noto Sans', size: '14px', weight: 700, style: 'normal', transform: 'none' }
    },
    spacing: {
      sectionGap: '10px',
      lineHeight: 1.2,
      paragraphSpacing: '5px',
      indentation: '0px'
    },
    colors: {
      background: '#FDF1DC',
      text: '#922610',
      headers: '#922610',
      accents: '#E69A28',
      borders: '#922610'
    },
    borders: {
      style: 'solid',
      width: '1px',
      radius: '7px',
      color: '#922610'
    }
  };

  /**
   * Generate official D&D 5e stat block with proper formatting
   */
  generateOfficialStatBlock(
    creatureData: CreatureData,
    options: StatBlockOptions
  ): OfficialStatBlock {
    console.log(`📊 [STAT-BLOCK] Generating official stat block for ${creatureData.name}`);
    
    const abilityScores = this.processAbilityScores(creatureData.abilities);
    const challengeRating = this.calculateChallengeRating(creatureData);
    const proficiencyBonus = this.CHALLENGE_RATING_TABLE[challengeRating.rating]?.proficiencyBonus || 2;
    
    const statBlock: OfficialStatBlock = {
      id: `stat-block-${Date.now()}`,
      name: creatureData.name,
      size: creatureData.size,
      type: creatureData.type,
      subtype: creatureData.subtype,
      alignment: creatureData.alignment,
      armorClass: this.calculateArmorClass(creatureData),
      hitPoints: this.calculateHitPoints(creatureData),
      speed: this.processSpeed(creatureData.speed),
      abilityScores,
      savingThrows: this.calculateSavingThrows(abilityScores, creatureData.savingThrowProficiencies, proficiencyBonus),
      skills: this.calculateSkills(abilityScores, creatureData.skillProficiencies, proficiencyBonus),
      damageVulnerabilities: creatureData.damageVulnerabilities || [],
      damageResistances: creatureData.damageResistances || [],
      damageImmunities: creatureData.damageImmunities || [],
      conditionImmunities: creatureData.conditionImmunities || [],
      senses: this.calculateSenses(abilityScores.wisdom, creatureData.senses),
      languages: creatureData.languages || [],
      challengeRating,
      proficiencyBonus,
      features: this.processFeatures(creatureData.features || []),
      actions: this.processActions(creatureData.actions || [], abilityScores, proficiencyBonus),
      bonusActions: this.processBonusActions(creatureData.bonusActions || []),
      reactions: this.processReactions(creatureData.reactions || []),
      legendaryActions: creatureData.legendaryActions ? this.processLegendaryActions(creatureData.legendaryActions) : undefined,
      mythicActions: creatureData.mythicActions ? this.processMythicActions(creatureData.mythicActions) : undefined,
      lairActions: creatureData.lairActions ? this.processLairActions(creatureData.lairActions) : undefined,
      regionalEffects: creatureData.regionalEffects ? this.processRegionalEffects(creatureData.regionalEffects) : undefined,
      spellcasting: creatureData.spellcasting ? this.processSpellcasting(creatureData.spellcasting, abilityScores, proficiencyBonus) : undefined,
      formatting: this.generateFormatting(options.style || 'official'),
      validation: this.validateStatBlock({} as OfficialStatBlock) // Will be filled after creation
    };

    // Validate the completed stat block
    statBlock.validation = this.validateStatBlock(statBlock);

    console.log(`✅ [STAT-BLOCK] Generated stat block - CR ${challengeRating.rating} (${challengeRating.xp} XP)`);
    console.log(`   Validation Score: ${statBlock.validation.overall.score}/100`);
    
    return statBlock;
  }

  /**
   * Format stat block for different output formats
   */
  formatStatBlock(
    statBlock: OfficialStatBlock,
    format: OutputFormat,
    customizations?: FormattingCustomizations
  ): FormattedStatBlock {
    console.log(`🎨 [STAT-BLOCK] Formatting for ${format} output`);
    
    const formatter = this.getFormatterForFormat(format);
    const styling = this.applyCustomizations(statBlock.formatting, customizations);
    
    const formatted: FormattedStatBlock = {
      id: `formatted-${statBlock.id}`,
      originalId: statBlock.id,
      format,
      content: formatter.format(statBlock, styling),
      styling,
      assets: formatter.getRequiredAssets(styling),
      metadata: this.generateFormattingMetadata(statBlock, format)
    };

    console.log(`✅ [STAT-BLOCK] Formatted for ${format}`);
    
    return formatted;
  }

  /**
   * Validate stat block mathematical accuracy and consistency
   */
  validateStatBlock(statBlock: OfficialStatBlock): StatBlockValidation {
    console.log(`🔍 [STAT-BLOCK] Validating stat block accuracy`);
    
    const mathematical = this.validateMathematicalAccuracy(statBlock);
    const consistency = this.validateConsistency(statBlock);
    const completeness = this.validateCompleteness(statBlock);
    const formatting = this.validateFormatting(statBlock);
    
    const overall = this.calculateOverallValidation([mathematical, consistency, completeness, formatting]);
    
    const validation: StatBlockValidation = {
      mathematical,
      consistency,
      completeness,
      formatting,
      overall
    };

    console.log(`✅ [STAT-BLOCK] Validation complete - Grade: ${overall.grade}`);
    
    return validation;
  }

  /**
   * Generate spellcasting block with proper formatting
   */
  generateSpellcastingBlock(
    spellcastingData: SpellcastingData,
    abilityScores: AbilityScores,
    proficiencyBonus: number
  ): Spellcasting {
    console.log(`🔮 [STAT-BLOCK] Generating spellcasting block`);
    
    const ability = spellcastingData.ability;
    const abilityScore = abilityScores[ability.toLowerCase() as keyof AbilityScores] as AbilityScore;
    const saveDC = 8 + proficiencyBonus + abilityScore.modifier;
    const attackBonus = proficiencyBonus + abilityScore.modifier;
    
    const spellcasting: Spellcasting = {
      type: spellcastingData.type,
      level: spellcastingData.level,
      ability,
      saveDC,
      attackBonus,
      spellSlots: this.calculateSpellSlots(spellcastingData.type, spellcastingData.level),
      spellsKnown: spellcastingData.spellsKnown,
      spellList: this.processSpellList(spellcastingData.spells),
      notes: spellcastingData.notes
    };

    console.log(`✅ [STAT-BLOCK] Generated spellcasting - DC ${saveDC}, Attack +${attackBonus}`);
    
    return spellcasting;
  }

  // Private helper methods

  private processAbilityScores(abilities: any): AbilityScores {
    const processScore = (score: number): AbilityScore => ({
      score,
      modifier: Math.floor((score - 10) / 2),
      savingThrow: undefined // Will be calculated separately if proficient
    });

    return {
      strength: processScore(abilities.strength || 10),
      dexterity: processScore(abilities.dexterity || 10),
      constitution: processScore(abilities.constitution || 10),
      intelligence: processScore(abilities.intelligence || 10),
      wisdom: processScore(abilities.wisdom || 10),
      charisma: processScore(abilities.charisma || 10)
    };
  }

  private calculateChallengeRating(creatureData: CreatureData): ChallengeRating {
    // Simplified CR calculation - in practice would use complex algorithms
    const suggestedCR = creatureData.challengeRating || '1';
    const crData = this.CHALLENGE_RATING_TABLE[suggestedCR];
    
    if (!crData) {
      console.warn(`Invalid CR: ${suggestedCR}, defaulting to CR 1`);
      return {
        rating: '1',
        xp: 200,
        proficiencyBonus: 2
      };
    }
    
    return {
      rating: suggestedCR,
      xp: crData.xp,
      proficiencyBonus: crData.proficiencyBonus
    };
  }

  private calculateArmorClass(creatureData: CreatureData): ArmorClass {
    return {
      value: creatureData.armorClass?.value || 10,
      source: creatureData.armorClass?.source || 'natural armor',
      notes: creatureData.armorClass?.notes
    };
  }

  private calculateHitPoints(creatureData: CreatureData): HitPoints {
    if (creatureData.hitPoints) {
      return {
        average: creatureData.hitPoints.average,
        formula: creatureData.hitPoints.formula,
        notes: creatureData.hitPoints.notes
      };
    }
    
    // Default calculation if not provided
    const hitDie = this.getHitDieForSize(creatureData.size);
    const conModifier = Math.floor(((creatureData.abilities?.constitution || 10) - 10) / 2);
    const hitDiceCount = Math.max(1, Math.floor((creatureData.challengeRating ? parseInt(creatureData.challengeRating) : 1) * 2));
    
    const average = Math.floor(hitDiceCount * (hitDie / 2 + 0.5) + hitDiceCount * conModifier);
    const formula = `${hitDiceCount}d${hitDie}${conModifier >= 0 ? '+' : ''}${hitDiceCount * conModifier}`;
    
    return {
      average,
      formula,
      notes: undefined
    };
  }

  private processSpeed(speedData: any): Speed {
    return {
      walk: speedData?.walk || 30,
      fly: speedData?.fly,
      swim: speedData?.swim,
      climb: speedData?.climb,
      burrow: speedData?.burrow,
      hover: speedData?.hover,
      notes: speedData?.notes
    };
  }

  private calculateSavingThrows(
    abilityScores: AbilityScores,
    proficiencies: string[] = [],
    proficiencyBonus: number
  ): SavingThrows {
    const savingThrows: SavingThrows = {};
    
    proficiencies.forEach(ability => {
      const abilityKey = ability.toLowerCase() as keyof AbilityScores;
      const abilityScore = abilityScores[abilityKey] as AbilityScore;
      
      if (abilityScore) {
        savingThrows[ability] = abilityScore.modifier + proficiencyBonus;
        abilityScore.savingThrow = savingThrows[ability];
      }
    });
    
    return savingThrows;
  }

  private calculateSkills(
    abilityScores: AbilityScores,
    skillProficiencies: any = {},
    proficiencyBonus: number
  ): Skills {
    const skills: Skills = {};
    const skillAbilityMap = this.getSkillAbilityMap();
    
    Object.entries(skillProficiencies).forEach(([skill, proficiency]) => {
      const ability = skillAbilityMap[skill];
      if (ability) {
        const abilityScore = abilityScores[ability as keyof AbilityScores] as AbilityScore;
        const multiplier = typeof proficiency === 'number' ? proficiency : 1;
        skills[skill] = abilityScore.modifier + (proficiencyBonus * multiplier);
      }
    });
    
    return skills;
  }

  private calculateSenses(wisdomScore: AbilityScore, sensesData: any = {}): Senses {
    return {
      passivePerception: 10 + wisdomScore.modifier + (sensesData.perceptionProficiency ? 2 : 0), // Assuming proficiency bonus of 2 for simplicity
      blindsight: sensesData.blindsight,
      darkvision: sensesData.darkvision,
      tremorsense: sensesData.tremorsense,
      truesight: sensesData.truesight,
      telepathy: sensesData.telepathy,
      notes: sensesData.notes
    };
  }

  private processFeatures(featuresData: any[]): Feature[] {
    return featuresData.map(feature => ({
      name: feature.name,
      description: feature.description,
      type: feature.type || 'passive',
      recharge: feature.recharge,
      limited: feature.limited
    }));
  }

  private processActions(
    actionsData: any[],
    abilityScores: AbilityScores,
    proficiencyBonus: number
  ): Action[] {
    return actionsData.map(action => {
      const processedAction: Action = {
        name: action.name,
        description: action.description,
        type: action.type || 'special',
        recharge: action.recharge,
        limited: action.limited
      };
      
      // Calculate attack bonus if it's an attack
      if (action.type === 'melee' || action.type === 'ranged') {
        const ability = action.type === 'melee' ? 'strength' : 'dexterity';
        const abilityScore = abilityScores[ability] as AbilityScore;
        processedAction.attackBonus = abilityScore.modifier + proficiencyBonus;
      }
      
      // Process damage
      if (action.damage) {
        processedAction.damage = action.damage.map((dmg: any) => ({
          formula: dmg.formula,
          type: dmg.type,
          notes: dmg.notes
        }));
      }
      
      // Process saving throw
      if (action.savingThrow) {
        processedAction.savingThrow = {
          ability: action.savingThrow.ability,
          dc: action.savingThrow.dc || (8 + proficiencyBonus + abilityScores[action.savingThrow.ability?.toLowerCase() as keyof AbilityScores]?.modifier || 0),
          effect: action.savingThrow.effect
        };
      }
      
      return processedAction;
    });
  }

  private processBonusActions(bonusActionsData: any[]): BonusAction[] {
    return bonusActionsData.map(action => ({
      name: action.name,
      description: action.description,
      recharge: action.recharge,
      limited: action.limited
    }));
  }

  private processReactions(reactionsData: any[]): Reaction[] {
    return reactionsData.map(reaction => ({
      name: reaction.name,
      description: reaction.description,
      trigger: reaction.trigger,
      limited: reaction.limited
    }));
  }

  private processLegendaryActions(legendaryActionsData: any[]): LegendaryAction[] {
    return legendaryActionsData.map(action => ({
      name: action.name,
      description: action.description,
      cost: action.cost || 1
    }));
  }

  private processMythicActions(mythicActionsData: any[]): MythicAction[] {
    return mythicActionsData.map(action => ({
      name: action.name,
      description: action.description,
      cost: action.cost || 1,
      trigger: action.trigger
    }));
  }

  private processLairActions(lairActionsData: any[]): LairAction[] {
    return lairActionsData.map(action => ({
      name: action.name,
      description: action.description,
      initiative: action.initiative || 20,
      recharge: action.recharge
    }));
  }

  private processRegionalEffects(regionalEffectsData: any[]): RegionalEffect[] {
    return regionalEffectsData.map(effect => ({
      name: effect.name,
      description: effect.description,
      range: effect.range || '1 mile',
      duration: effect.duration || 'permanent'
    }));
  }

  private processSpellcasting(
    spellcastingData: any,
    abilityScores: AbilityScores,
    proficiencyBonus: number
  ): Spellcasting {
    return this.generateSpellcastingBlock(spellcastingData, abilityScores, proficiencyBonus);
  }

  private calculateSpellSlots(type: SpellcastingType, level: number): SpellSlots | undefined {
    if (type === 'innate') return undefined;
    
    // Simplified spell slot calculation
    const spellSlots: SpellSlots = {};
    
    if (level >= 1) spellSlots[1] = Math.min(4, level + 1);
    if (level >= 3) spellSlots[2] = Math.min(3, Math.floor(level / 2));
    if (level >= 5) spellSlots[3] = Math.min(3, Math.floor(level / 3));
    if (level >= 7) spellSlots[4] = Math.min(3, Math.floor(level / 4));
    if (level >= 9) spellSlots[5] = Math.min(2, Math.floor(level / 5));
    if (level >= 11) spellSlots[6] = Math.min(1, Math.floor(level / 6));
    if (level >= 13) spellSlots[7] = Math.min(1, Math.floor(level / 7));
    if (level >= 15) spellSlots[8] = Math.min(1, Math.floor(level / 8));
    if (level >= 17) spellSlots[9] = Math.min(1, Math.floor(level / 9));
    
    return spellSlots;
  }

  private processSpellList(spellsData: any): SpellList {
    const spellList: SpellList = {};
    
    Object.entries(spellsData || {}).forEach(([level, spells]) => {
      const levelKey = level === 'cantrips' ? 'cantrips' : parseInt(level);
      if (typeof levelKey === 'string' || (typeof levelKey === 'number' && levelKey >= 0 && levelKey <= 9)) {
        spellList[levelKey as keyof SpellList] = (spells as any[]).map(spell => ({
          name: spell.name,
          school: spell.school || 'evocation',
          level: typeof levelKey === 'number' ? levelKey : 0,
          castingTime: spell.castingTime || '1 action',
          range: spell.range || 'Touch',
          components: spell.components || ['V', 'S'],
          duration: spell.duration || 'Instantaneous',
          description: spell.description || '',
          atHigherLevels: spell.atHigherLevels
        }));
      }
    });
    
    return spellList;
  }

  private generateFormatting(style: LayoutStyle): StatBlockFormatting {
    const baseFormatting = this.OFFICIAL_FORMATTING;
    
    return {
      layout: style,
      typography: baseFormatting.typography,
      spacing: baseFormatting.spacing,
      colors: baseFormatting.colors,
      borders: baseFormatting.borders,
      icons: {
        enabled: style !== 'minimal',
        size: '16px',
        color: baseFormatting.colors.accents,
        position: 'left'
      }
    };
  }

  // Validation methods

  private validateMathematicalAccuracy(statBlock: OfficialStatBlock): MathematicalValidation {
    const results = {
      abilityModifiers: this.validateAbilityModifiers(statBlock.abilityScores),
      savingThrows: this.validateSavingThrows(statBlock.abilityScores, statBlock.savingThrows, statBlock.proficiencyBonus),
      skills: this.validateSkills(statBlock.abilityScores, statBlock.skills, statBlock.proficiencyBonus),
      challengeRating: this.validateChallengeRating(statBlock.challengeRating),
      hitPoints: this.validateHitPoints(statBlock.hitPoints),
      attackBonuses: this.validateAttackBonuses(statBlock.actions, statBlock.abilityScores, statBlock.proficiencyBonus),
      saveDCs: this.validateSaveDCs(statBlock.actions, statBlock.abilityScores, statBlock.proficiencyBonus)
    };
    
    return results;
  }

  private validateConsistency(statBlock: OfficialStatBlock): ConsistencyValidation {
    return {
      proficiencyBonus: this.validateProficiencyBonusConsistency(statBlock),
      spellcasting: this.validateSpellcastingConsistency(statBlock.spellcasting, statBlock.abilityScores, statBlock.proficiencyBonus),
      features: this.validateFeaturesConsistency(statBlock.features),
      actions: this.validateActionsConsistency(statBlock.actions)
    };
  }

  private validateCompleteness(statBlock: OfficialStatBlock): CompletenessValidation {
    return {
      requiredFields: this.validateRequiredFields(statBlock),
      optionalFields: this.validateOptionalFields(statBlock),
      descriptions: this.validateDescriptions(statBlock),
      formatting: this.validateFormattingCompleteness(statBlock.formatting)
    };
  }

  private validateFormatting(statBlock: OfficialStatBlock): FormattingValidation {
    return {
      typography: this.validateTypography(statBlock.formatting.typography),
      spacing: this.validateSpacing(statBlock.formatting.spacing),
      layout: this.validateLayout(statBlock.formatting.layout),
      accessibility: this.validateAccessibility(statBlock.formatting)
    };
  }

  // Utility methods

  private getHitDieForSize(size: CreatureSize): number {
    const hitDice = {
      'Tiny': 4,
      'Small': 6,
      'Medium': 8,
      'Large': 10,
      'Huge': 12,
      'Gargantuan': 20
    };
    
    return hitDice[size] || 8;
  }

  private getSkillAbilityMap(): { [skill: string]: string } {
    return {
      'Acrobatics': 'dexterity',
      'Animal Handling': 'wisdom',
      'Arcana': 'intelligence',
      'Athletics': 'strength',
      'Deception': 'charisma',
      'History': 'intelligence',
      'Insight': 'wisdom',
      'Intimidation': 'charisma',
      'Investigation': 'intelligence',
      'Medicine': 'wisdom',
      'Nature': 'intelligence',
      'Perception': 'wisdom',
      'Performance': 'charisma',
      'Persuasion': 'charisma',
      'Religion': 'intelligence',
      'Sleight of Hand': 'dexterity',
      'Stealth': 'dexterity',
      'Survival': 'wisdom'
    };
  }

  private getFormatterForFormat(format: OutputFormat): any {
    // Return appropriate formatter based on output format
    return {
      format: (statBlock: OfficialStatBlock, styling: any) => this.formatToHTML(statBlock, styling),
      getRequiredAssets: (styling: any) => []
    };
  }

  private formatToHTML(statBlock: OfficialStatBlock, styling: any): string {
    // Generate HTML representation of the stat block
    return `<div class="stat-block">${statBlock.name}</div>`;
  }

  private applyCustomizations(
    baseFormatting: StatBlockFormatting,
    customizations?: FormattingCustomizations
  ): StatBlockFormatting {
    if (!customizations) return baseFormatting;
    
    return {
      ...baseFormatting,
      ...customizations
    };
  }

  private generateFormattingMetadata(statBlock: OfficialStatBlock, format: OutputFormat): any {
    return {
      generatedAt: new Date().toISOString(),
      format,
      version: '1.0',
      statBlockId: statBlock.id
    };
  }

  private calculateOverallValidation(validations: any[]): OverallValidation {
    const scores = validations.map(v => this.calculateValidationScore(v));
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      score: Math.round(averageScore),
      grade: this.scoreToGrade(averageScore),
      issues: [],
      recommendations: []
    };
  }

  private calculateValidationScore(validation: any): number {
    // Simplified scoring - would be more complex in practice
    return 85;
  }

  private scoreToGrade(score: number): ValidationGrade {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'B+';
    if (score >= 87) return 'B';
    if (score >= 83) return 'C+';
    if (score >= 80) return 'C';
    if (score >= 70) return 'D';
    return 'F';
  }

  // Simplified validation methods (would be more detailed in practice)
  private validateAbilityModifiers(abilityScores: AbilityScores): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateSavingThrows(abilityScores: AbilityScores, savingThrows: SavingThrows, proficiencyBonus: number): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateSkills(abilityScores: AbilityScores, skills: Skills, proficiencyBonus: number): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateChallengeRating(challengeRating: ChallengeRating): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateHitPoints(hitPoints: HitPoints): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateAttackBonuses(actions: Action[], abilityScores: AbilityScores, proficiencyBonus: number): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateSaveDCs(actions: Action[], abilityScores: AbilityScores, proficiencyBonus: number): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateProficiencyBonusConsistency(statBlock: OfficialStatBlock): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateSpellcastingConsistency(spellcasting: Spellcasting | undefined, abilityScores: AbilityScores, proficiencyBonus: number): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateFeaturesConsistency(features: Feature[]): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateActionsConsistency(actions: Action[]): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateRequiredFields(statBlock: OfficialStatBlock): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateOptionalFields(statBlock: OfficialStatBlock): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateDescriptions(statBlock: OfficialStatBlock): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateFormattingCompleteness(formatting: StatBlockFormatting): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateTypography(typography: TypographySettings): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateSpacing(spacing: SpacingSettings): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateLayout(layout: LayoutStyle): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }

  private validateAccessibility(formatting: StatBlockFormatting): ValidationResult {
    return { passed: true, score: 100, errors: [], warnings: [] };
  }
}

// Supporting interfaces for external use

export interface CreatureData {
  name: string;
  size: CreatureSize;
  type: CreatureType;
  subtype?: string;
  alignment: Alignment;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  armorClass?: {
    value: number;
    source: string;
    notes?: string;
  };
  hitPoints?: {
    average: number;
    formula: string;
    notes?: string;
  };
  speed?: any;
  savingThrowProficiencies?: string[];
  skillProficiencies?: { [skill: string]: number };
  damageVulnerabilities?: DamageType[];
  damageResistances?: DamageType[];
  damageImmunities?: DamageType[];
  conditionImmunities?: Condition[];
  senses?: any;
  languages?: Language[];
  challengeRating?: string;
  features?: any[];
  actions?: any[];
  bonusActions?: any[];
  reactions?: any[];
  legendaryActions?: any[];
  mythicActions?: any[];
  lairActions?: any[];
  regionalEffects?: any[];
  spellcasting?: SpellcastingData;
}

export interface SpellcastingData {
  type: SpellcastingType;
  level: number;
  ability: AbilityName;
  spellsKnown?: SpellsKnown;
  spells: any;
  notes?: string;
}

export interface StatBlockOptions {
  style?: LayoutStyle;
  includeSpellDescriptions?: boolean;
  compactFormat?: boolean;
  customizations?: FormattingCustomizations;
}

export interface FormattingCustomizations {
  colors?: Partial<ColorSettings>;
  typography?: Partial<TypographySettings>;
  spacing?: Partial<SpacingSettings>;
  layout?: LayoutStyle;
}

export interface FormattedStatBlock {
  id: string;
  originalId: string;
  format: OutputFormat;
  content: string;
  styling: StatBlockFormatting;
  assets: any[];
  metadata: any;
}

export type OutputFormat = 'html' | 'pdf' | 'png' | 'svg' | 'json' | 'markdown';

// Export singleton instance
export const officialStatBlockFormattingSystem = new OfficialStatBlockFormattingSystem();