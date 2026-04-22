import React from 'react';
import { render } from '@testing-library/react-native';
import IndexScreen from '../app/(tabs)/index';
import { AppContext } from '../context/app-context';
import { ThemeContext, lightColors } from '../context/theme-context';

jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

const mockHabits = [
  {
    id: 1,
    name: 'Morning Run',
    description: '30 min jog',
    categoryId: 1,
    userId: 1,
    isActive: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Meditation',
    description: '10 min session',
    categoryId: 2,
    userId: 1,
    isActive: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const mockCategories = [
  { id: 1, name: 'Exercise', color: '#10B981', icon: '🏃', userId: 1 },
  { id: 2, name: 'Mindfulness', color: '#8B5CF6', icon: '🧘', userId: 1 },
];

const mockLogs = [
  { id: 1, habitId: 1, date: '2026-04-21', count: 1, completed: 1, notes: null, createdAt: '2026-04-21T00:00:00.000Z' },
];

const mockAppContext = {
  habits: mockHabits,
  categories: mockCategories,
  logs: mockLogs,
  targets: [],
  refreshHabits: jest.fn(),
  refreshCategories: jest.fn(),
  refreshLogs: jest.fn(),
  refreshTargets: jest.fn(),
  refreshAll: jest.fn(),
};

const mockThemeContext = {
  theme: 'light' as const,
  colors: lightColors,
  toggleTheme: jest.fn(),
};

describe('HabitsScreen (IndexScreen)', () => {
  it('renders seeded habits from database through context to UI', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <AppContext.Provider value={mockAppContext}>
          <IndexScreen />
        </AppContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText('Meditation')).toBeTruthy();
  });

  it('renders the Add Habit button', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <AppContext.Provider value={mockAppContext}>
          <IndexScreen />
        </AppContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByText('+ Add Habit')).toBeTruthy();
  });

  it('shows empty state when no habits exist', () => {
    const emptyContext = { ...mockAppContext, habits: [] };
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <AppContext.Provider value={emptyContext}>
          <IndexScreen />
        </AppContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByText('No habits yet. Add your first one!')).toBeTruthy();
  });
});
