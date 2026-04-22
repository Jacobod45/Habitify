import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

export const lightColors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#0F766E',
  primaryText: '#FFFFFF',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FCA5A5',
  dangerText: '#7F1D1D',
  success: '#10B981',
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputText: '#111827',
  searchBorder: '#94A3B8',
  safeArea: '#F8FAFC',
  filterActive: '#0F172A',
  filterActiveBorder: '#0F172A',
  filterInactive: '#FFFFFF',
  filterInactiveBorder: '#94A3B8',
  filterTextActive: '#FFFFFF',
  filterTextInactive: '#0F172A',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabActive: '#0F766E',
  tabInactive: '#9CA3AF',
  empty: '#475569',
  streakBg: '#FEF3C7',
  streakText: '#92400E',
  hintBg: '#EFF6FF',
  hintText: '#1D4ED8',
};

export const darkColors: AppColors = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  primary: '#14B8A6',
  primaryText: '#FFFFFF',
  danger: '#F87171',
  dangerBg: '#450A0A',
  dangerBorder: '#7F1D1D',
  dangerText: '#FCA5A5',
  success: '#34D399',
  inputBg: '#1E293B',
  inputBorder: '#475569',
  inputText: '#F1F5F9',
  searchBorder: '#475569',
  safeArea: '#0F172A',
  filterActive: '#F1F5F9',
  filterActiveBorder: '#F1F5F9',
  filterInactive: '#1E293B',
  filterInactiveBorder: '#475569',
  filterTextActive: '#0F172A',
  filterTextInactive: '#F1F5F9',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  tabActive: '#14B8A6',
  tabInactive: '#64748B',
  empty: '#94A3B8',
  streakBg: '#422006',
  streakText: '#FDE68A',
  hintBg: '#1E3A5F',
  hintText: '#93C5FD',
};

export type AppColors = typeof lightColors;

const THEME_KEY = 'habit_tracker_theme';

type ThemeContextType = {
  theme: 'light' | 'dark';
  colors: AppColors;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light') setTheme(stored);
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    void SecureStore.setItemAsync(THEME_KEY, next);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be inside ThemeProvider');
  return ctx;
}
