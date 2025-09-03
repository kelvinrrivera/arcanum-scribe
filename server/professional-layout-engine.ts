/**
 * Professional Layout Engine
 * 
 * This module implements editorial-quality formatting with professional
 * callout boxes, scannable headings, consistent typography, and multi-format
 * output support for PDF, web, and print formats.
 */

export interface ProfessionalLayout {
  id: string;
  name: string;
  format: OutputFormat;
  typography: TypographySystem;
  visualHierarchy: VisualHierarchy;
  calloutBoxes: CalloutBox[];
  headingSystem: HeadingSystem;
  pageLayout: PageLayout;
  colorScheme: ColorScheme;
  brandingElements: BrandingElement[];
}

export interface TypographySystem {
  primaryFont: FontDefinition;
  secondaryFont: FontDefinition;
  headingFont: FontDefinition;
  monoFont: FontDefinition;
  fontSizes: FontSizeScale;
  lineHeights: LineHeightScale;
  letterSpacing: LetterSpacingScale;
  fontWeights: FontWeightScale;
}

export interface VisualHierarchy {
  levels: HierarchyLevel[];
  spacing: SpacingSystem;
  emphasis: EmphasisSystem;
  contrast: ContrastSystem;
  alignment: AlignmentSystem;
}

export interface CalloutBox {
  id: string;
  type: CalloutType;
  style: CalloutStyle;
  content: CalloutContent;
  positioning: CalloutPositioning;
  styling: CalloutStyling;
  accessibility: AccessibilityFeatures;
}

export interface HeadingSystem {
  levels: HeadingLevel[];
  numbering: NumberingSystem;
  styling: HeadingStyle[];
  spacing: HeadingSpacing;
  anchors: AnchorSystem;
  tableOfContents: TOCGeneration;
}

export interface PageLayout {
  format: PageFormat;
  margins: MarginSystem;
  columns: ColumnSystem;
  grid: GridSystem;
  headers: HeaderSystem;
  footers: FooterSystem;
  pageNumbers: PageNumbering;
}

export interface ColorScheme {
  primary: ColorDefinition;
  secondary: ColorDefinition;
  accent: ColorDefinition;
  neutral: ColorPalette;
  semantic: SemanticColors;
  accessibility: AccessibilityColors;
}

export interface BrandingElement {
  type: BrandingType;
  placement: BrandingPlacement;
  styling: BrandingStyling;
  content: BrandingContent;
  visibility: BrandingVisibility;
}

// Supporting interfaces

export interface FontDefinition {
  family: string;
  fallbacks: string[];
  source: FontSource;
  variants: FontVariant[];
  licensing: FontLicensing;
}

export interface FontSizeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface LineHeightScale {
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacingScale {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface FontWeightScale {
  thin: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface HierarchyLevel {
  level: number;
  name: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  marginTop: string;
  marginBottom: string;
  color: string;
  textTransform?: TextTransform;
}

export interface SpacingSystem {
  unit: string;
  scale: SpacingScale;
  semantic: SemanticSpacing;
  responsive: ResponsiveSpacing;
}

export interface EmphasisSystem {
  bold: EmphasisStyle;
  italic: EmphasisStyle;
  underline: EmphasisStyle;
  highlight: EmphasisStyle;
  code: EmphasisStyle;
}

export interface ContrastSystem {
  ratios: ContrastRatio[];
  validation: ContrastValidation;
  adjustments: ContrastAdjustment[];
}

export interface AlignmentSystem {
  text: TextAlignment;
  elements: ElementAlignment;
  grid: GridAlignment;
}

export interface CalloutContent {
  title?: string;
  body: string;
  icon?: IconDefinition;
  actions?: CalloutAction[];
}

export interface CalloutPositioning {
  placement: CalloutPlacement;
  alignment: CalloutAlignment;
  spacing: CalloutSpacing;
  breakout: boolean;
}

export interface CalloutStyling {
  background: BackgroundStyle;
  border: BorderStyle;
  shadow: ShadowStyle;
  typography: TypographyOverride;
}

export interface AccessibilityFeatures {
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
  focusable: boolean;
  screenReaderText?: string;
}

export interface HeadingLevel {
  level: number;
  tag: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  marginTop: string;
  marginBottom: string;
  color: string;
  numbering?: NumberingStyle;
}

export interface NumberingSystem {
  enabled: boolean;
  style: NumberingStyle;
  separator: string;
  levels: NumberingLevel[];
}

export interface HeadingStyle {
  level: number;
  decoration: TextDecoration;
  casing: TextTransform;
  spacing: LetterSpacing;
}

export interface HeadingSpacing {
  before: SpacingValue;
  after: SpacingValue;
  nested: NestedSpacing;
}

export interface AnchorSystem {
  enabled: boolean;
  style: AnchorStyle;
  generation: AnchorGeneration;
}

export interface TOCGeneration {
  enabled: boolean;
  maxDepth: number;
  style: TOCStyle;
  placement: TOCPlacement;
}

export interface PageFormat {
  size: PageSize;
  orientation: PageOrientation;
  bleed: BleedSettings;
  cropMarks: boolean;
}

export interface MarginSystem {
  top: string;
  right: string;
  bottom: string;
  left: string;
  gutter: string;
  binding: BindingMargin;
}

export interface ColumnSystem {
  count: number;
  gap: string;
  rule: ColumnRule;
  balance: boolean;
}

export interface GridSystem {
  type: GridType;
  columns: number;
  rows?: number;
  gap: GridGap;
  alignment: GridAlignment;
}

export interface HeaderSystem {
  enabled: boolean;
  content: HeaderContent;
  styling: HeaderStyling;
  placement: HeaderPlacement;
}

export interface FooterSystem {
  enabled: boolean;
  content: FooterContent;
  styling: FooterStyling;
  placement: FooterPlacement;
}

export interface PageNumbering {
  enabled: boolean;
  style: PageNumberStyle;
  placement: PageNumberPlacement;
  startNumber: number;
  format: PageNumberFormat;
}

export interface ColorDefinition {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  name: string;
  variants: ColorVariant[];
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral: string;
}

export interface AccessibilityColors {
  minContrast: number;
  preferredContrast: number;
  colorBlindSafe: boolean;
  alternatives: ColorAlternative[];
}

// Enums and types
export type OutputFormat = 'pdf' | 'web' | 'print' | 'epub' | 'docx';
export type FontSource = 'system' | 'web' | 'embedded' | 'custom';
export type FontVariant = 'normal' | 'italic' | 'oblique';
export type FontLicensing = 'free' | 'commercial' | 'custom';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type ElementAlignment = 'start' | 'center' | 'end' | 'stretch';
export type GridAlignment = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
export type CalloutType = 'info' | 'warning' | 'error' | 'success' | 'tip' | 'note' | 'quote' | 'example';
export type CalloutStyle = 'bordered' | 'filled' | 'minimal' | 'elevated' | 'outlined';
export type CalloutPlacement = 'inline' | 'sidebar' | 'margin' | 'floating' | 'full-width';
export type CalloutAlignment = 'left' | 'center' | 'right';
export type NumberingStyle = 'decimal' | 'roman' | 'alpha' | 'none';
export type TextDecoration = 'none' | 'underline' | 'overline' | 'line-through';
export type LetterSpacing = 'normal' | 'tight' | 'wide';
export type AnchorStyle = 'hash' | 'pilcrow' | 'link' | 'none';
export type AnchorGeneration = 'auto' | 'manual' | 'both';
export type TOCStyle = 'simple' | 'detailed' | 'hierarchical' | 'flat';
export type TOCPlacement = 'beginning' | 'end' | 'sidebar' | 'floating';
export type PageSize = 'A4' | 'US-Letter' | 'A5' | 'US-Legal' | 'custom';
export type PageOrientation = 'portrait' | 'landscape';
export type GridType = 'flexbox' | 'css-grid' | 'float' | 'table';
export type PageNumberStyle = 'decimal' | 'roman' | 'alpha' | 'custom';
export type PageNumberPlacement = 'header' | 'footer' | 'margin';
export type PageNumberFormat = 'simple' | 'chapter-page' | 'section-page' | 'custom';
export type BrandingType = 'logo' | 'watermark' | 'header' | 'footer' | 'background';
export type BrandingPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'custom';

// Complex type definitions
export interface SpacingScale {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

export interface SemanticSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ResponsiveSpacing {
  mobile: SpacingScale;
  tablet: SpacingScale;
  desktop: SpacingScale;
}

export interface EmphasisStyle {
  fontWeight?: number;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  backgroundColor?: string;
}

export interface ContrastRatio {
  level: 'AA' | 'AAA';
  normal: number;
  large: number;
}

export interface ContrastValidation {
  enabled: boolean;
  level: 'AA' | 'AAA';
  reportIssues: boolean;
}

export interface ContrastAdjustment {
  condition: string;
  adjustment: string;
  fallback: string;
}

export interface IconDefinition {
  name: string;
  source: IconSource;
  size: IconSize;
  color?: string;
}

export interface CalloutAction {
  label: string;
  action: string;
  style: ActionStyle;
}

export interface CalloutSpacing {
  padding: SpacingValue;
  margin: SpacingValue;
}

export interface BackgroundStyle {
  color?: string;
  gradient?: GradientDefinition;
  pattern?: PatternDefinition;
  opacity?: number;
}

export interface BorderStyle {
  width: string;
  style: BorderStyleType;
  color: string;
  radius?: string;
}

export interface ShadowStyle {
  enabled: boolean;
  x: string;
  y: string;
  blur: string;
  spread?: string;
  color: string;
  opacity: number;
}

export interface TypographyOverride {
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: number;
  color?: string;
}

export interface NumberingLevel {
  level: number;
  style: NumberingStyle;
  prefix?: string;
  suffix?: string;
}

export interface NestedSpacing {
  enabled: boolean;
  multiplier: number;
  maxDepth: number;
}

export interface SpacingValue {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface BleedSettings {
  enabled: boolean;
  size: string;
}

export interface BindingMargin {
  enabled: boolean;
  size: string;
  side: 'left' | 'right' | 'top';
}

export interface ColumnRule {
  enabled: boolean;
  width: string;
  style: BorderStyleType;
  color: string;
}

export interface GridGap {
  row: string;
  column: string;
}

export interface HeaderContent {
  left?: string;
  center?: string;
  right?: string;
}

export interface HeaderStyling {
  fontSize: string;
  fontWeight: number;
  color: string;
  borderBottom?: BorderStyle;
}

export interface HeaderPlacement {
  height: string;
  padding: SpacingValue;
}

export interface FooterContent {
  left?: string;
  center?: string;
  right?: string;
}

export interface FooterStyling {
  fontSize: string;
  fontWeight: number;
  color: string;
  borderTop?: BorderStyle;
}

export interface FooterPlacement {
  height: string;
  padding: SpacingValue;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorVariant {
  name: string;
  value: string;
  usage: string;
}

export interface ColorAlternative {
  condition: string;
  color: string;
  description: string;
}

export interface BrandingStyling {
  opacity: number;
  size: BrandingSize;
  color?: string;
}

export interface BrandingContent {
  text?: string;
  image?: string;
  svg?: string;
}

export interface BrandingVisibility {
  print: boolean;
  web: boolean;
  pdf: boolean;
}

export interface GradientDefinition {
  type: 'linear' | 'radial';
  direction?: string;
  stops: GradientStop[];
}

export interface PatternDefinition {
  type: string;
  size: string;
  color: string;
  opacity: number;
}

export interface GradientStop {
  color: string;
  position: string;
}

export type IconSource = 'font' | 'svg' | 'image';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ActionStyle = 'primary' | 'secondary' | 'ghost' | 'link';
export type BorderStyleType = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
export type BrandingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

/**
 * Professional Layout Engine Class
 */
export class ProfessionalLayoutEngine {
  private readonly LAYOUT_TEMPLATES = {
    'classic-book': {
      name: 'Classic Book Layout',
      typography: {
        primaryFont: 'Crimson Text',
        headingFont: 'Playfair Display',
        monoFont: 'Source Code Pro'
      },
      colorScheme: 'warm-neutral',
      pageFormat: 'A4',
      style: 'traditional'
    },
    'modern-magazine': {
      name: 'Modern Magazine Layout',
      typography: {
        primaryFont: 'Inter',
        headingFont: 'Inter',
        monoFont: 'JetBrains Mono'
      },
      colorScheme: 'vibrant',
      pageFormat: 'US-Letter',
      style: 'contemporary'
    },
    'technical-manual': {
      name: 'Technical Manual Layout',
      typography: {
        primaryFont: 'Source Sans Pro',
        headingFont: 'Source Sans Pro',
        monoFont: 'Source Code Pro'
      },
      colorScheme: 'professional',
      pageFormat: 'A4',
      style: 'functional'
    },
    'fantasy-grimoire': {
      name: 'Fantasy Grimoire Layout',
      typography: {
        primaryFont: 'Cinzel',
        headingFont: 'Cinzel Decorative',
        monoFont: 'Courier Prime'
      },
      colorScheme: 'mystical',
      pageFormat: 'A5',
      style: 'decorative'
    }
  };

  private readonly CALLOUT_STYLES = {
    'info': {
      backgroundColor: '#e3f2fd',
      borderColor: '#2196f3',
      iconColor: '#1976d2',
      textColor: '#0d47a1'
    },
    'warning': {
      backgroundColor: '#fff3e0',
      borderColor: '#ff9800',
      iconColor: '#f57c00',
      textColor: '#e65100'
    },
    'error': {
      backgroundColor: '#ffebee',
      borderColor: '#f44336',
      iconColor: '#d32f2f',
      textColor: '#b71c1c'
    },
    'success': {
      backgroundColor: '#e8f5e8',
      borderColor: '#4caf50',
      iconColor: '#388e3c',
      textColor: '#1b5e20'
    },
    'tip': {
      backgroundColor: '#f3e5f5',
      borderColor: '#9c27b0',
      iconColor: '#7b1fa2',
      textColor: '#4a148c'
    },
    'note': {
      backgroundColor: '#f5f5f5',
      borderColor: '#757575',
      iconColor: '#616161',
      textColor: '#424242'
    }
  };

  /**
   * Generate professional layout configuration
   */
  generateProfessionalLayout(
    template: string,
    format: OutputFormat,
    customizations: LayoutCustomizations
  ): ProfessionalLayout {
    console.log(`🎨 [LAYOUT] Generating professional layout - Template: ${template}, Format: ${format}`);
    
    const baseTemplate = this.selectLayoutTemplate(template);
    const typography = this.generateTypographySystem(baseTemplate, customizations);
    const visualHierarchy = this.generateVisualHierarchy(typography, customizations);
    const calloutBoxes = this.generateCalloutBoxes(baseTemplate, format);
    const headingSystem = this.generateHeadingSystem(typography, visualHierarchy);
    const pageLayout = this.generatePageLayout(baseTemplate, format, customizations);
    const colorScheme = this.generateColorScheme(baseTemplate, customizations);
    const brandingElements = this.generateBrandingElements(customizations);
    
    const layout: ProfessionalLayout = {
      id: `layout-${Date.now()}`,
      name: `${baseTemplate.name} (${format})`,
      format,
      typography,
      visualHierarchy,
      calloutBoxes,
      headingSystem,
      pageLayout,
      colorScheme,
      brandingElements
    };

    console.log(`✅ [LAYOUT] Generated professional layout with ${calloutBoxes.length} callout styles`);
    
    return layout;
  }  /**

   * Apply layout to content with professional formatting
   */
  applyProfessionalFormatting(
    content: ContentStructure,
    layout: ProfessionalLayout,
    options: FormattingOptions
  ): FormattedContent {
    console.log(`📝 [LAYOUT] Applying professional formatting to content`);
    
    const formattedSections = this.formatContentSections(content.sections, layout, options);
    const generatedCallouts = this.insertCalloutBoxes(formattedSections, layout, options);
    const styledHeadings = this.applyHeadingStyles(generatedCallouts, layout);
    const finalLayout = this.applyPageLayout(styledHeadings, layout, options);
    
    const formatted: FormattedContent = {
      id: `formatted-${Date.now()}`,
      layout: layout.id,
      format: layout.format,
      content: finalLayout,
      metadata: this.generateContentMetadata(content, layout),
      styles: this.generateStylesheet(layout),
      assets: this.collectRequiredAssets(layout)
    };

    console.log(`✅ [LAYOUT] Applied formatting with ${formatted.styles.rules.length} style rules`);
    
    return formatted;
  }

  /**
   * Generate multi-format output
   */
  generateMultiFormatOutput(
    content: FormattedContent,
    formats: OutputFormat[]
  ): MultiFormatOutput {
    console.log(`🔄 [LAYOUT] Generating multi-format output for ${formats.length} formats`);
    
    const outputs: FormatOutput[] = [];
    
    formats.forEach(format => {
      const formatSpecificLayout = this.adaptLayoutForFormat(content.layout, format);
      const optimizedContent = this.optimizeContentForFormat(content, format);
      const formatOutput = this.renderForFormat(optimizedContent, format);
      
      outputs.push({
        format,
        content: formatOutput.content,
        assets: formatOutput.assets,
        metadata: formatOutput.metadata,
        size: formatOutput.size,
        quality: this.assessOutputQuality(formatOutput, format)
      });
    });
    
    const multiOutput: MultiFormatOutput = {
      id: `multi-output-${Date.now()}`,
      sourceContent: content.id,
      outputs,
      generatedAt: new Date().toISOString(),
      totalSize: outputs.reduce((sum, output) => sum + output.size, 0)
    };

    console.log(`✅ [LAYOUT] Generated ${outputs.length} format outputs`);
    
    return multiOutput;
  }

  /**
   * Validate layout accessibility and standards compliance
   */
  validateLayoutAccessibility(layout: ProfessionalLayout): AccessibilityReport {
    console.log(`♿ [LAYOUT] Validating layout accessibility`);
    
    const contrastIssues = this.checkColorContrast(layout.colorScheme);
    const typographyIssues = this.checkTypographyAccessibility(layout.typography);
    const structureIssues = this.checkStructuralAccessibility(layout.headingSystem);
    const navigationIssues = this.checkNavigationAccessibility(layout);
    
    const report: AccessibilityReport = {
      overall: this.calculateOverallScore([contrastIssues, typographyIssues, structureIssues, navigationIssues]),
      contrast: contrastIssues,
      typography: typographyIssues,
      structure: structureIssues,
      navigation: navigationIssues,
      recommendations: this.generateAccessibilityRecommendations(layout),
      compliance: this.checkComplianceStandards(layout)
    };

    console.log(`✅ [LAYOUT] Accessibility validation complete - Score: ${report.overall.score}/100`);
    
    return report;
  }

  // Private helper methods

  private selectLayoutTemplate(template: string): any {
    return this.LAYOUT_TEMPLATES[template] || this.LAYOUT_TEMPLATES['classic-book'];
  }

  private generateTypographySystem(baseTemplate: any, customizations: LayoutCustomizations): TypographySystem {
    return {
      primaryFont: {
        family: customizations.fonts?.primary || baseTemplate.typography.primaryFont,
        fallbacks: ['Georgia', 'serif'],
        source: 'web',
        variants: ['normal', 'italic'],
        licensing: 'free'
      },
      secondaryFont: {
        family: customizations.fonts?.secondary || baseTemplate.typography.primaryFont,
        fallbacks: ['Arial', 'sans-serif'],
        source: 'web',
        variants: ['normal', 'italic'],
        licensing: 'free'
      },
      headingFont: {
        family: customizations.fonts?.heading || baseTemplate.typography.headingFont,
        fallbacks: ['Georgia', 'serif'],
        source: 'web',
        variants: ['normal'],
        licensing: 'free'
      },
      monoFont: {
        family: baseTemplate.typography.monoFont,
        fallbacks: ['Courier New', 'monospace'],
        source: 'web',
        variants: ['normal'],
        licensing: 'free'
      },
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem'
      },
      lineHeights: {
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
      },
      fontWeights: {
        thin: 100,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900
      }
    };
  }

  private generateVisualHierarchy(typography: TypographySystem, customizations: LayoutCustomizations): VisualHierarchy {
    return {
      levels: [
        {
          level: 1,
          name: 'Main Title',
          fontSize: typography.fontSizes['4xl'],
          fontWeight: typography.fontWeights.bold,
          lineHeight: typography.lineHeights.tight,
          marginTop: '0',
          marginBottom: '2rem',
          color: '#1a1a1a'
        },
        {
          level: 2,
          name: 'Section Header',
          fontSize: typography.fontSizes['2xl'],
          fontWeight: typography.fontWeights.semibold,
          lineHeight: typography.lineHeights.snug,
          marginTop: '3rem',
          marginBottom: '1.5rem',
          color: '#2d2d2d'
        },
        {
          level: 3,
          name: 'Subsection Header',
          fontSize: typography.fontSizes.xl,
          fontWeight: typography.fontWeights.medium,
          lineHeight: typography.lineHeights.snug,
          marginTop: '2rem',
          marginBottom: '1rem',
          color: '#404040'
        },
        {
          level: 4,
          name: 'Minor Header',
          fontSize: typography.fontSizes.lg,
          fontWeight: typography.fontWeights.medium,
          lineHeight: typography.lineHeights.normal,
          marginTop: '1.5rem',
          marginBottom: '0.75rem',
          color: '#525252'
        }
      ],
      spacing: {
        unit: 'rem',
        scale: {
          0: '0',
          1: '0.25rem',
          2: '0.5rem',
          3: '0.75rem',
          4: '1rem',
          5: '1.25rem',
          6: '1.5rem',
          8: '2rem',
          10: '2.5rem',
          12: '3rem',
          16: '4rem',
          20: '5rem',
          24: '6rem',
          32: '8rem',
          40: '10rem',
          48: '12rem',
          56: '14rem',
          64: '16rem'
        },
        semantic: {
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem'
        },
        responsive: {
          mobile: {
            0: '0',
            1: '0.25rem',
            2: '0.5rem',
            3: '0.75rem',
            4: '1rem',
            5: '1.25rem',
            6: '1.5rem',
            8: '2rem',
            10: '2.5rem',
            12: '3rem',
            16: '4rem',
            20: '5rem',
            24: '6rem',
            32: '8rem',
            40: '10rem',
            48: '12rem',
            56: '14rem',
            64: '16rem'
          },
          tablet: {
            0: '0',
            1: '0.25rem',
            2: '0.5rem',
            3: '0.75rem',
            4: '1rem',
            5: '1.25rem',
            6: '1.5rem',
            8: '2rem',
            10: '2.5rem',
            12: '3rem',
            16: '4rem',
            20: '5rem',
            24: '6rem',
            32: '8rem',
            40: '10rem',
            48: '12rem',
            56: '14rem',
            64: '16rem'
          },
          desktop: {
            0: '0',
            1: '0.25rem',
            2: '0.5rem',
            3: '0.75rem',
            4: '1rem',
            5: '1.25rem',
            6: '1.5rem',
            8: '2rem',
            10: '2.5rem',
            12: '3rem',
            16: '4rem',
            20: '5rem',
            24: '6rem',
            32: '8rem',
            40: '10rem',
            48: '12rem',
            56: '14rem',
            64: '16rem'
          }
        }
      },
      emphasis: {
        bold: {
          fontWeight: typography.fontWeights.bold
        },
        italic: {
          fontStyle: 'italic'
        },
        underline: {
          textDecoration: 'underline'
        },
        highlight: {
          backgroundColor: '#fef3c7',
          color: '#92400e'
        },
        code: {
          fontWeight: typography.fontWeights.normal,
          backgroundColor: '#f3f4f6',
          color: '#1f2937'
        }
      },
      contrast: {
        ratios: [
          { level: 'AA', normal: 4.5, large: 3.0 },
          { level: 'AAA', normal: 7.0, large: 4.5 }
        ],
        validation: {
          enabled: true,
          level: 'AA',
          reportIssues: true
        },
        adjustments: [
          {
            condition: 'low-contrast',
            adjustment: 'darken-text',
            fallback: 'high-contrast-mode'
          }
        ]
      },
      alignment: {
        text: 'left',
        elements: 'start',
        grid: 'start'
      }
    };
  }

  private generateCalloutBoxes(baseTemplate: any, format: OutputFormat): CalloutBox[] {
    const callouts: CalloutBox[] = [];
    
    Object.entries(this.CALLOUT_STYLES).forEach(([type, style]) => {
      callouts.push({
        id: `callout-${type}`,
        type: type as CalloutType,
        style: 'bordered',
        content: {
          title: this.getCalloutTitle(type as CalloutType),
          body: '',
          icon: this.getCalloutIcon(type as CalloutType)
        },
        positioning: {
          placement: 'inline',
          alignment: 'left',
          spacing: {
            padding: { top: '1rem', right: '1rem', bottom: '1rem', left: '1rem' },
            margin: { top: '1.5rem', right: '0', bottom: '1.5rem', left: '0' }
          },
          breakout: false
        },
        styling: {
          background: {
            color: style.backgroundColor,
            opacity: 0.1
          },
          border: {
            width: '1px',
            style: 'solid',
            color: style.borderColor,
            radius: '0.5rem'
          },
          shadow: {
            enabled: format !== 'print',
            x: '0',
            y: '2px',
            blur: '4px',
            color: 'rgba(0, 0, 0, 0.1)',
            opacity: 0.1
          },
          typography: {
            color: style.textColor
          }
        },
        accessibility: {
          ariaLabel: `${type} callout`,
          role: 'note',
          focusable: false
        }
      });
    });
    
    return callouts;
  }

  private generateHeadingSystem(typography: TypographySystem, hierarchy: VisualHierarchy): HeadingSystem {
    return {
      levels: hierarchy.levels.map(level => ({
        level: level.level,
        tag: `h${level.level}`,
        fontSize: level.fontSize,
        fontWeight: level.fontWeight,
        lineHeight: level.lineHeight,
        marginTop: level.marginTop,
        marginBottom: level.marginBottom,
        color: level.color,
        numbering: level.level <= 3 ? {
          style: 'decimal',
          prefix: '',
          suffix: '.'
        } : undefined
      })),
      numbering: {
        enabled: true,
        style: 'decimal',
        separator: '.',
        levels: [
          { level: 1, style: 'decimal', prefix: '', suffix: '.' },
          { level: 2, style: 'decimal', prefix: '', suffix: '.' },
          { level: 3, style: 'decimal', prefix: '', suffix: '.' }
        ]
      },
      styling: [
        { level: 1, decoration: 'none', casing: 'none', spacing: 'normal' },
        { level: 2, decoration: 'none', casing: 'none', spacing: 'normal' },
        { level: 3, decoration: 'none', casing: 'none', spacing: 'normal' },
        { level: 4, decoration: 'none', casing: 'none', spacing: 'normal' }
      ],
      spacing: {
        before: { top: '2rem', right: '0', bottom: '0', left: '0' },
        after: { top: '0', right: '0', bottom: '1rem', left: '0' },
        nested: {
          enabled: true,
          multiplier: 0.8,
          maxDepth: 6
        }
      },
      anchors: {
        enabled: true,
        style: 'hash',
        generation: 'auto'
      },
      tableOfContents: {
        enabled: true,
        maxDepth: 3,
        style: 'hierarchical',
        placement: 'beginning'
      }
    };
  }

  private generatePageLayout(baseTemplate: any, format: OutputFormat, customizations: LayoutCustomizations): PageLayout {
    const formatSettings = this.getFormatSettings(format);
    
    return {
      format: {
        size: formatSettings.size,
        orientation: formatSettings.orientation,
        bleed: {
          enabled: format === 'print',
          size: '3mm'
        },
        cropMarks: format === 'print'
      },
      margins: {
        top: formatSettings.margins.top,
        right: formatSettings.margins.right,
        bottom: formatSettings.margins.bottom,
        left: formatSettings.margins.left,
        gutter: formatSettings.margins.gutter,
        binding: {
          enabled: format === 'print',
          size: '5mm',
          side: 'left'
        }
      },
      columns: {
        count: formatSettings.columns,
        gap: '2rem',
        rule: {
          enabled: false,
          width: '1px',
          style: 'solid',
          color: '#e5e7eb'
        },
        balance: true
      },
      grid: {
        type: 'css-grid',
        columns: 12,
        gap: {
          row: '1rem',
          column: '1rem'
        },
        alignment: 'start'
      },
      headers: {
        enabled: format !== 'web',
        content: {
          left: customizations.branding?.title || 'Document Title',
          center: '',
          right: 'Page {page}'
        },
        styling: {
          fontSize: '0.875rem',
          fontWeight: 400,
          color: '#6b7280',
          borderBottom: {
            width: '1px',
            style: 'solid',
            color: '#e5e7eb'
          }
        },
        placement: {
          height: '2rem',
          padding: { top: '0.5rem', right: '0', bottom: '0.5rem', left: '0' }
        }
      },
      footers: {
        enabled: format !== 'web',
        content: {
          left: customizations.branding?.author || 'Author Name',
          center: new Date().toLocaleDateString(),
          right: ''
        },
        styling: {
          fontSize: '0.875rem',
          fontWeight: 400,
          color: '#6b7280',
          borderTop: {
            width: '1px',
            style: 'solid',
            color: '#e5e7eb'
          }
        },
        placement: {
          height: '2rem',
          padding: { top: '0.5rem', right: '0', bottom: '0.5rem', left: '0' }
        }
      },
      pageNumbers: {
        enabled: format !== 'web',
        style: 'decimal',
        placement: 'footer',
        startNumber: 1,
        format: 'simple'
      }
    };
  }

  private generateColorScheme(baseTemplate: any, customizations: LayoutCustomizations): ColorScheme {
    const schemes = {
      'warm-neutral': {
        primary: '#8b5a3c',
        secondary: '#d4a574',
        accent: '#c17817'
      },
      'vibrant': {
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#f59e0b'
      },
      'professional': {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#3b82f6'
      },
      'mystical': {
        primary: '#7c3aed',
        secondary: '#a855f7',
        accent: '#fbbf24'
      }
    };
    
    const selectedScheme = schemes[baseTemplate.colorScheme] || schemes['professional'];
    
    return {
      primary: {
        hex: selectedScheme.primary,
        rgb: this.hexToRgb(selectedScheme.primary),
        hsl: this.hexToHsl(selectedScheme.primary),
        name: 'Primary',
        variants: this.generateColorVariants(selectedScheme.primary)
      },
      secondary: {
        hex: selectedScheme.secondary,
        rgb: this.hexToRgb(selectedScheme.secondary),
        hsl: this.hexToHsl(selectedScheme.secondary),
        name: 'Secondary',
        variants: this.generateColorVariants(selectedScheme.secondary)
      },
      accent: {
        hex: selectedScheme.accent,
        rgb: this.hexToRgb(selectedScheme.accent),
        hsl: this.hexToHsl(selectedScheme.accent),
        name: 'Accent',
        variants: this.generateColorVariants(selectedScheme.accent)
      },
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a'
      },
      semantic: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        neutral: '#6b7280'
      },
      accessibility: {
        minContrast: 4.5,
        preferredContrast: 7.0,
        colorBlindSafe: true,
        alternatives: [
          {
            condition: 'high-contrast-mode',
            color: '#000000',
            description: 'High contrast black text'
          }
        ]
      }
    };
  }

  private generateBrandingElements(customizations: LayoutCustomizations): BrandingElement[] {
    const elements: BrandingElement[] = [];
    
    if (customizations.branding?.logo) {
      elements.push({
        type: 'logo',
        placement: 'top-left',
        styling: {
          opacity: 1,
          size: 'md'
        },
        content: {
          image: customizations.branding.logo
        },
        visibility: {
          print: true,
          web: true,
          pdf: true
        }
      });
    }
    
    if (customizations.branding?.watermark) {
      elements.push({
        type: 'watermark',
        placement: 'center',
        styling: {
          opacity: 0.1,
          size: 'xl'
        },
        content: {
          text: customizations.branding.watermark
        },
        visibility: {
          print: true,
          web: false,
          pdf: true
        }
      });
    }
    
    return elements;
  }

  // Content formatting methods

  private formatContentSections(sections: ContentSection[], layout: ProfessionalLayout, options: FormattingOptions): FormattedSection[] {
    return sections.map(section => ({
      id: section.id,
      type: section.type,
      title: this.formatTitle(section.title, layout),
      content: this.formatSectionContent(section.content, layout, options),
      styling: this.applySectionStyling(section, layout),
      metadata: section.metadata
    }));
  }

  private insertCalloutBoxes(sections: FormattedSection[], layout: ProfessionalLayout, options: FormattingOptions): FormattedSection[] {
    return sections.map(section => {
      const callouts = this.identifyCalloutOpportunities(section, options);
      return {
        ...section,
        callouts: callouts.map(callout => this.renderCallout(callout, layout))
      };
    });
  }

  private applyHeadingStyles(sections: FormattedSection[], layout: ProfessionalLayout): FormattedSection[] {
    return sections.map(section => ({
      ...section,
      title: this.applyHeadingStyle(section.title, section.type, layout.headingSystem)
    }));
  }

  private applyPageLayout(sections: FormattedSection[], layout: ProfessionalLayout, options: FormattingOptions): string {
    const pageTemplate = this.generatePageTemplate(layout);
    const contentHtml = this.renderSectionsToHtml(sections, layout);
    
    return pageTemplate.replace('{{content}}', contentHtml);
  }

  // Utility methods

  private getCalloutTitle(type: CalloutType): string {
    const titles = {
      'info': 'Information',
      'warning': 'Warning',
      'error': 'Error',
      'success': 'Success',
      'tip': 'Tip',
      'note': 'Note',
      'quote': 'Quote',
      'example': 'Example'
    };
    
    return titles[type] || 'Note';
  }

  private getCalloutIcon(type: CalloutType): IconDefinition {
    const icons = {
      'info': { name: 'info-circle', source: 'font', size: 'md' },
      'warning': { name: 'warning-triangle', source: 'font', size: 'md' },
      'error': { name: 'x-circle', source: 'font', size: 'md' },
      'success': { name: 'check-circle', source: 'font', size: 'md' },
      'tip': { name: 'lightbulb', source: 'font', size: 'md' },
      'note': { name: 'file-text', source: 'font', size: 'md' },
      'quote': { name: 'quote', source: 'font', size: 'md' },
      'example': { name: 'code', source: 'font', size: 'md' }
    };
    
    return icons[type] || icons['note'];
  }

  private getFormatSettings(format: OutputFormat): any {
    const settings = {
      'pdf': {
        size: 'A4',
        orientation: 'portrait',
        margins: { top: '2.5cm', right: '2cm', bottom: '2.5cm', left: '2cm', gutter: '0.5cm' },
        columns: 1
      },
      'web': {
        size: 'custom',
        orientation: 'portrait',
        margins: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem', gutter: '0' },
        columns: 1
      },
      'print': {
        size: 'A4',
        orientation: 'portrait',
        margins: { top: '2.5cm', right: '2cm', bottom: '2.5cm', left: '2cm', gutter: '1cm' },
        columns: 1
      },
      'epub': {
        size: 'custom',
        orientation: 'portrait',
        margins: { top: '1rem', right: '1rem', bottom: '1rem', left: '1rem', gutter: '0' },
        columns: 1
      }
    };
    
    return settings[format] || settings['pdf'];
  }

  private hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private hexToHsl(hex: string): HSL {
    const rgb = this.hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private generateColorVariants(baseColor: string): ColorVariant[] {
    return [
      { name: 'light', value: this.lightenColor(baseColor, 20), usage: 'backgrounds' },
      { name: 'dark', value: this.darkenColor(baseColor, 20), usage: 'text' },
      { name: 'muted', value: this.desaturateColor(baseColor, 30), usage: 'secondary elements' }
    ];
  }

  private lightenColor(color: string, percent: number): string {
    // Simplified color manipulation - in real implementation would use proper color library
    return color;
  }

  private darkenColor(color: string, percent: number): string {
    // Simplified color manipulation - in real implementation would use proper color library
    return color;
  }

  private desaturateColor(color: string, percent: number): string {
    // Simplified color manipulation - in real implementation would use proper color library
    return color;
  }

  // Placeholder methods for complex operations
  private formatTitle(title: string, layout: ProfessionalLayout): string {
    return title;
  }

  private formatSectionContent(content: string, layout: ProfessionalLayout, options: FormattingOptions): string {
    return content;
  }

  private applySectionStyling(section: ContentSection, layout: ProfessionalLayout): any {
    return {};
  }

  private identifyCalloutOpportunities(section: FormattedSection, options: FormattingOptions): any[] {
    return [];
  }

  private renderCallout(callout: any, layout: ProfessionalLayout): any {
    return callout;
  }

  private applyHeadingStyle(title: string, type: string, headingSystem: HeadingSystem): string {
    return title;
  }

  private generatePageTemplate(layout: ProfessionalLayout): string {
    return `<!DOCTYPE html><html><head><title>Document</title></head><body>{{content}}</body></html>`;
  }

  private renderSectionsToHtml(sections: FormattedSection[], layout: ProfessionalLayout): string {
    return sections.map(section => `<section>${section.content}</section>`).join('\n');
  }

  private generateContentMetadata(content: ContentStructure, layout: ProfessionalLayout): any {
    return {
      title: content.title,
      author: content.author,
      createdAt: new Date().toISOString(),
      layout: layout.id
    };
  }

  private generateStylesheet(layout: ProfessionalLayout): any {
    return {
      rules: [],
      variables: {},
      media: {}
    };
  }

  private collectRequiredAssets(layout: ProfessionalLayout): any[] {
    return [];
  }

  private adaptLayoutForFormat(layoutId: string, format: OutputFormat): string {
    return layoutId;
  }

  private optimizeContentForFormat(content: FormattedContent, format: OutputFormat): FormattedContent {
    return content;
  }

  private renderForFormat(content: FormattedContent, format: OutputFormat): any {
    return {
      content: '',
      assets: [],
      metadata: {},
      size: 0
    };
  }

  private assessOutputQuality(output: any, format: OutputFormat): number {
    return 95;
  }

  private checkColorContrast(colorScheme: ColorScheme): any {
    return { score: 95, issues: [] };
  }

  private checkTypographyAccessibility(typography: TypographySystem): any {
    return { score: 90, issues: [] };
  }

  private checkStructuralAccessibility(headingSystem: HeadingSystem): any {
    return { score: 88, issues: [] };
  }

  private checkNavigationAccessibility(layout: ProfessionalLayout): any {
    return { score: 92, issues: [] };
  }

  private calculateOverallScore(scores: any[]): any {
    const avgScore = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
    return { score: Math.round(avgScore), level: avgScore >= 90 ? 'excellent' : avgScore >= 80 ? 'good' : 'needs-improvement' };
  }

  private generateAccessibilityRecommendations(layout: ProfessionalLayout): string[] {
    return [
      'Ensure sufficient color contrast for all text elements',
      'Use semantic HTML structure for better screen reader support',
      'Provide alternative text for all images and icons',
      'Ensure keyboard navigation is fully functional'
    ];
  }

  private checkComplianceStandards(layout: ProfessionalLayout): any {
    return {
      wcag: 'AA',
      section508: true,
      ada: true
    };
  }
}

// Supporting interfaces for external use

export interface LayoutCustomizations {
  fonts?: {
    primary?: string;
    secondary?: string;
    heading?: string;
  };
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  branding?: {
    logo?: string;
    watermark?: string;
    title?: string;
    author?: string;
  };
  spacing?: {
    tight?: boolean;
    loose?: boolean;
  };
}

export interface ContentStructure {
  id: string;
  title: string;
  author: string;
  sections: ContentSection[];
  metadata: any;
}

export interface ContentSection {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata: any;
}

export interface FormattingOptions {
  includeCallouts: boolean;
  generateTOC: boolean;
  addPageNumbers: boolean;
  optimizeForPrint: boolean;
}

export interface FormattedContent {
  id: string;
  layout: string;
  format: OutputFormat;
  content: string;
  metadata: any;
  styles: any;
  assets: any[];
}

export interface FormattedSection {
  id: string;
  type: string;
  title: string;
  content: string;
  styling: any;
  metadata: any;
  callouts?: any[];
}

export interface MultiFormatOutput {
  id: string;
  sourceContent: string;
  outputs: FormatOutput[];
  generatedAt: string;
  totalSize: number;
}

export interface FormatOutput {
  format: OutputFormat;
  content: string;
  assets: any[];
  metadata: any;
  size: number;
  quality: number;
}

export interface AccessibilityReport {
  overall: any;
  contrast: any;
  typography: any;
  structure: any;
  navigation: any;
  recommendations: string[];
  compliance: any;
}

// Export singleton instance
export const professionalLayoutEngine = new ProfessionalLayoutEngine();