import {
  DarkTheme,
  DefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import React, { createContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { Colors, Gradients, type AppThemeColors } from '@/constants/theme';

type AppGradients = (typeof Gradients)[keyof typeof Gradients];

type ThemeContextValue = {
  colors: AppThemeColors;
  gradients: AppGradients;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
  navigationTheme: NavigationTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const gradients = Gradients[colorScheme];

  const navigationTheme = useMemo<NavigationTheme>(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      dark: isDark,
      colors: {
        ...baseTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, isDark]);

  const value = useMemo(
    () => ({ colors, gradients, isDark, colorScheme, navigationTheme }),
    [colors, gradients, isDark, colorScheme, navigationTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const theme = React.use(ThemeContext);

  if (!theme) {
    throw new Error('useAppTheme must be used inside ThemeProvider.');
  }

  return theme;
}
