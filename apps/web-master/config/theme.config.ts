/**
 * Theme Configuration
 * 
 * Centralized theme configuration including:
 * - Theme token definitions (colors, typography, spacing, etc.)
 * - Theme variants (light, dark, accent)
 * - Vertical-specific theme overrides
 * - Strongly typed theme constants
 * 
 * This configuration provides a single source of truth for all theme-related
 * settings and can be extended or overridden by secondary templates and client sites.
 */

import { ENV } from './env.config';

// ============================================================================
// THEME TYPES
// ============================================================================

export type ThemeVariant = 'default' | 'dark' | 'accent' | 'light';

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  
  // Primary brand colors
  primary: string;
  primaryForeground: string;
  
  // Secondary colors
  secondary: string;
  secondaryForeground: string;
  
  // Muted/subtle colors
  muted: string;
  mutedForeground: string;
  
  // Card/surface colors
  card: string;
  cardForeground: string;
  
  // Border colors
  border: string;
  
  // Input colors
  input: string;
  
  // Ring/focus colors
  ring: string;
  
  // Accent colors
  accent: string;
  accentForeground: string;
  
  // Destructive/error colors
  destructive: string;
  destructiveForeground: string;
  
  // Success colors
  success: string;
  successForeground: string;
  
  // Warning colors
  warning: string;
  warningForeground: string;
  
  // Info colors
  info: string;
  infoForeground: string;
}

export interface ThemeRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyHeading: string;
  fontFamilyMono: string;
  
  // Font sizes
  fontSize: {
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
  };
  
  // Font weights
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  
  // Line heights
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface ThemeGradients {
  primary: string;
  secondary: string;
  accent: string;
  footer: string;
  hero: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface ThemeTokens {
  colors: ThemeColors;
  radius: ThemeRadius;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  gradients: ThemeGradients;
  shadows: ThemeShadows;
}

export interface Theme {
  id: string;
  name: string;
  designSystemVersion: string;
  tokens: ThemeTokens;
}

// ============================================================================
// DEFAULT THEME TOKENS
// ============================================================================

const DEFAULT_COLORS: ThemeColors = {
  background: '#f8fafc',
  foreground: '#0f172a',
  
  primary: '#0ea5e9',
  primaryForeground: '#ffffff',
  
  secondary: '#64748b',
  secondaryForeground: '#ffffff',
  
  muted: '#f1f5f9',
  mutedForeground: '#475569',
  
  card: '#ffffff',
  cardForeground: '#0f172a',
  
  border: '#e2e8f0',
  input: '#e2e8f0',
  ring: '#0ea5e9',
  
  accent: '#f43f5e',
  accentForeground: '#ffffff',
  
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  
  success: '#22c55e',
  successForeground: '#ffffff',
  
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  
  info: '#3b82f6',
  infoForeground: '#ffffff',
};

const DEFAULT_RADIUS: ThemeRadius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  '2xl': '24px',
  full: '9999px',
};

const DEFAULT_TYPOGRAPHY: ThemeTypography = {
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontFamilyHeading: "'Inter', system-ui, -apple-system, sans-serif",
  fontFamilyMono: "'Fira Code', 'Courier New', monospace",
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

const DEFAULT_SPACING: ThemeSpacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
  '4xl': '6rem',  // 96px
  '5xl': '8rem',  // 128px
  '6xl': '12rem', // 192px
};

const DEFAULT_GRADIENTS: ThemeGradients = {
  primary: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
  secondary: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
  accent: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
  footer: 'linear-gradient(135deg, hsl(220, 70%, 32%) 0%, hsl(205, 88%, 68%) 100%)',
  hero: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
};

const DEFAULT_SHADOWS: ThemeShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

// ============================================================================
// THEME VARIANTS
// ============================================================================

export const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Default Light',
  designSystemVersion: 'v1',
  tokens: {
    colors: DEFAULT_COLORS,
    radius: DEFAULT_RADIUS,
    typography: DEFAULT_TYPOGRAPHY,
    spacing: DEFAULT_SPACING,
    gradients: DEFAULT_GRADIENTS,
    shadows: DEFAULT_SHADOWS,
  },
};

export const DARK_THEME: Theme = {
  id: 'dark',
  name: 'Dark',
  designSystemVersion: 'v1',
  tokens: {
    colors: {
      ...DEFAULT_COLORS,
      background: '#0f172a',
      foreground: '#f8fafc',
      
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      
      card: '#1e293b',
      cardForeground: '#f8fafc',
      
      border: '#334155',
      input: '#334155',
    },
    radius: DEFAULT_RADIUS,
    typography: DEFAULT_TYPOGRAPHY,
    spacing: DEFAULT_SPACING,
    gradients: {
      ...DEFAULT_GRADIENTS,
      footer: 'linear-gradient(135deg, hsl(220, 70%, 20%) 0%, hsl(205, 88%, 35%) 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
    },
  },
};

export const ACCENT_THEME: Theme = {
  id: 'accent',
  name: 'Accent Red',
  designSystemVersion: 'v1',
  tokens: {
    colors: {
      ...DEFAULT_COLORS,
      primary: '#f43f5e',
      accent: '#ec4899',
    },
    radius: DEFAULT_RADIUS,
    typography: DEFAULT_TYPOGRAPHY,
    spacing: DEFAULT_SPACING,
    gradients: {
      ...DEFAULT_GRADIENTS,
      primary: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    },
    shadows: DEFAULT_SHADOWS,
  },
};

export const LIGHT_THEME: Theme = DEFAULT_THEME;

// ============================================================================
// THEME REGISTRY
// ============================================================================

export const THEMES: Record<ThemeVariant, Theme> = {
  default: DEFAULT_THEME,
  light: LIGHT_THEME,
  dark: DARK_THEME,
  accent: ACCENT_THEME,
};

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const THEME_CONFIG = {
  // Default theme variant
  defaultVariant: ENV.THEME.DEFAULT_THEME,
  
  // Allow theme switching
  allowThemeSwitching: ENV.THEME.ALLOW_THEME_SWITCHING,
  
  // Design system version
  designSystemVersion: 'v1',
  
  // Available themes
  availableThemes: Object.keys(THEMES) as ThemeVariant[],
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get theme by variant
 */
export function getTheme(variant: ThemeVariant = 'default'): Theme {
  return THEMES[variant] || THEMES.default;
}

/**
 * Get theme from request (placeholder for future server-side theme detection)
 */
export async function getThemeFromRequest(): Promise<Theme> {
  // TODO: Implement server-side theme detection based on:
  // - User preferences
  // - Site configuration
  // - CMS overrides
  return getTheme(THEME_CONFIG.defaultVariant);
}

/**
 * Check if a theme variant exists
 */
export function isValidThemeVariant(variant: string): variant is ThemeVariant {
  return variant in THEMES;
}

/**
 * Get CSS variables for a theme
 */
export function getThemeCSSVariables(theme: Theme): Record<string, string> {
  const { colors, radius, spacing } = theme.tokens;
  
  return {
    // Colors
    '--color-background': colors.background,
    '--color-foreground': colors.foreground,
    '--color-primary': colors.primary,
    '--color-primary-foreground': colors.primaryForeground,
    '--color-secondary': colors.secondary,
    '--color-secondary-foreground': colors.secondaryForeground,
    '--color-muted': colors.muted,
    '--color-muted-foreground': colors.mutedForeground,
    '--color-card': colors.card,
    '--color-card-foreground': colors.cardForeground,
    '--color-border': colors.border,
    '--color-input': colors.input,
    '--color-ring': colors.ring,
    '--color-accent': colors.accent,
    '--color-accent-foreground': colors.accentForeground,
    '--color-destructive': colors.destructive,
    '--color-destructive-foreground': colors.destructiveForeground,
    '--color-success': colors.success,
    '--color-success-foreground': colors.successForeground,
    '--color-warning': colors.warning,
    '--color-warning-foreground': colors.warningForeground,
    '--color-info': colors.info,
    '--color-info-foreground': colors.infoForeground,
    
    // Radius
    '--radius-sm': radius.sm,
    '--radius-md': radius.md,
    '--radius-lg': radius.lg,
    '--radius-xl': radius.xl,
    '--radius-2xl': radius['2xl'],
    '--radius-full': radius.full,
    
    // Spacing
    '--spacing-xs': spacing.xs,
    '--spacing-sm': spacing.sm,
    '--spacing-md': spacing.md,
    '--spacing-lg': spacing.lg,
    '--spacing-xl': spacing.xl,
    '--spacing-2xl': spacing['2xl'],
    '--spacing-3xl': spacing['3xl'],
    '--spacing-4xl': spacing['4xl'],
    '--spacing-5xl': spacing['5xl'],
    '--spacing-6xl': spacing['6xl'],
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  DEFAULT_THEME,
  DARK_THEME,
  ACCENT_THEME,
  LIGHT_THEME,
  THEMES,
  THEME_CONFIG,
  getTheme,
  getThemeFromRequest,
  isValidThemeVariant,
  getThemeCSSVariables,
};
