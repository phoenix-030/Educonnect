import { useMemo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';

import type { AppThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

type StyleRecord = Record<string, ViewStyle | object>;

const normalize = (value: string) => value.trim().toLowerCase();

function mapForeground(value: string, colors: AppThemeColors): string {
  const color = normalize(value);

  if (['#000', '#000000', '#060606', '#070808', '#0f172a', '#111827', '#1e293b', '#334155', '#374151'].includes(color)) {
    return colors.text;
  }
  if (['#475569', '#4b5563', '#60646c', '#64748b'].includes(color)) {
    return colors.textSecondary;
  }
  if (['#6b7280', '#94a3b8', '#9ca3af', '#a1a1aa', '#b0b0b0'].includes(color)) {
    return colors.textMuted;
  }
  if (['#2563eb', '#1d4ed8', '#0c54f0', '#0073ff', '#3b82f6'].includes(color)) {
    return colors.primary;
  }
  if (['#7e22ce', '#9333ea', '#a855f7'].includes(color)) {
    return colors.purple;
  }
  if (['#14532d', '#15803d', '#166534', '#16a34a', '#22c55e'].includes(color)) {
    return colors.success;
  }
  if (['#9a3412', '#ea580c', '#f97316'].includes(color)) {
    return colors.warning;
  }
  if (['#991b1b', '#dc2626', '#ef4444'].includes(color)) {
    return colors.danger;
  }

  return value;
}

function mapBackground(value: string, colors: AppThemeColors): string {
  const color = normalize(value);

  if (['#fff', '#ffffff'].includes(color)) return colors.surface;
  if (['#f3f4f6', '#f0f0f3'].includes(color)) return colors.background;
  if (['#f8fafc', '#f9fafb', '#f5f5f6'].includes(color)) return colors.surfaceMuted;
  if (['#eff6ff', '#eef2ff', '#dbeafe'].includes(color)) return colors.infoSurface;
  if (['#f0fdf4', '#ecfdf3', '#dcfce7'].includes(color)) return colors.successSurface;
  if (['#fff7ed', '#ffedd5'].includes(color)) return colors.warningSurface;
  if (['#fef2f2', '#fee2e2'].includes(color)) return colors.dangerSurface;
  if (['#faf5ff', '#f3e8ff', '#fdf2f8'].includes(color)) return colors.purpleSurface;
  if (color === '#f1f5f9') return colors.backgroundElement;

  return value;
}

function mapBorder(value: string, colors: AppThemeColors): string {
  const color = normalize(value);

  if (['#dbe4f0', '#e2e8f0', '#e5e7eb', '#f1f5f9', '#f3f4f6'].includes(color)) {
    return colors.border;
  }
  if (['#cbd5e1', '#d1d5db'].includes(color)) return colors.borderStrong;
  if (['#bfdbfe', '#c7d2fe'].includes(color)) return colors.primary;
  if (['#86efac', '#bbf7d0'].includes(color)) return colors.success;

  return value;
}

export function resolveThemeColor(
  value: string,
  colors: AppThemeColors,
  role: 'foreground' | 'background' | 'border' = 'foreground',
): string {
  if (role === 'background') return mapBackground(value, colors);
  if (role === 'border') return mapBorder(value, colors);
  return mapForeground(value, colors);
}

function mapStyle(style: object, colors: AppThemeColors): object {
  return Object.fromEntries(
    Object.entries(style).map(([property, value]) => {
      if (typeof value !== 'string') return [property, value];

      if (property === 'color' || property === 'textDecorationColor') {
        return [property, mapForeground(value, colors)];
      }
      if (property === 'backgroundColor') {
        return [property, mapBackground(value, colors)];
      }
      if (property.toLowerCase().includes('border') && property.toLowerCase().includes('color')) {
        return [property, mapBorder(value, colors)];
      }
      if (property === 'shadowColor') return [property, colors.shadow];

      return [property, value];
    }),
  );
}

export function useThemedStyles<T extends StyleRecord>(baseStyles: T): T {
  const { colors, isDark } = useAppTheme();

  return useMemo(() => {
    if (!isDark) return baseStyles;

    return Object.fromEntries(
      Object.entries(baseStyles).map(([name, style]) => [
        name,
        mapStyle(StyleSheet.flatten(style), colors),
      ]),
    ) as T;
  }, [baseStyles, colors, isDark]);
}
