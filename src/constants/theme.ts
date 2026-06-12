import { Platform } from 'react-native';

const shared = {
  primary: '#2563eb',
  primaryStrong: '#1d4ed8',
  purple: '#9333ea',
  success: '#16a34a',
  warning: '#ea580c',
  danger: '#dc2626',
  onBrand: '#ffffff',
} as const;

export const Colors = {
  light: {
    ...shared,
    text: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#6b7280',
    background: '#f3f4f6',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    surfaceMuted: '#f8fafc',
    backgroundElement: '#f0f0f3',
    backgroundSelected: '#e0e7ff',
    border: '#e5e7eb',
    borderStrong: '#cbd5e1',
    input: '#ffffff',
    inputText: '#111827',
    placeholder: '#94a3b8',
    icon: '#64748b',
    tabBar: '#ffffff',
    tabBarBorder: '#e5e7eb',
    chartGrid: '#e2e8f0',
    chartLabel: '#64748b',
    overlay: 'rgba(15, 23, 42, 0.45)',
    shadow: 'rgba(15, 23, 42, 0.14)',
    infoSurface: '#eff6ff',
    successSurface: '#f0fdf4',
    warningSurface: '#fff7ed',
    dangerSurface: '#fef2f2',
    purpleSurface: '#faf5ff',
    authCard: 'rgba(255, 255, 255, 0.94)',
  },
  dark: {
    ...shared,
    primary: '#60a5fa',
    primaryStrong: '#3b82f6',
    purple: '#c084fc',
    success: '#4ade80',
    warning: '#fb923c',
    danger: '#f87171',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    background: '#0b1120',
    surface: '#111827',
    surfaceElevated: '#172033',
    surfaceMuted: '#1e293b',
    backgroundElement: '#1e293b',
    backgroundSelected: '#25345a',
    border: '#334155',
    borderStrong: '#475569',
    input: '#111827',
    inputText: '#f8fafc',
    placeholder: '#94a3b8',
    icon: '#cbd5e1',
    tabBar: '#111827',
    tabBarBorder: '#334155',
    chartGrid: '#334155',
    chartLabel: '#cbd5e1',
    overlay: 'rgba(2, 6, 23, 0.72)',
    shadow: 'rgba(0, 0, 0, 0.45)',
    infoSurface: '#172554',
    successSurface: '#052e16',
    warningSurface: '#431407',
    dangerSurface: '#450a0a',
    purpleSurface: '#3b0764',
    authCard: 'rgba(17, 24, 39, 0.95)',
  },
} as const;

export type AppThemeColors = (typeof Colors)[keyof typeof Colors];
export type ThemeColor = keyof AppThemeColors;

export const Gradients = {
  light: {
    auth: ['#2563eb', '#9333ea', '#4338ca'] as const,
    brand: ['#2563eb', '#9333ea'] as const,
    profile: ['#4f46e5', '#a855f7'] as const,
  },
  dark: {
    auth: ['#172554', '#3b0764', '#1e1b4b'] as const,
    brand: ['#1d4ed8', '#7e22ce'] as const,
    profile: ['#312e81', '#6b21a8'] as const,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
