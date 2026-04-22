import CryptoJS from 'crypto-js';
import { db } from './client';
import { categories, habitLogs, habits, targets, users } from './schema';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export async function seedIfEmpty() {
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) return;

  const passwordHash = CryptoJS.SHA256('demo1234').toString();

  await db.insert(users).values({
    name: 'Demo User',
    email: 'demo@example.com',
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  const userId = 1;

  await db.insert(categories).values([
    { name: 'Exercise', color: '#10B981', icon: '🏃', userId },
    { name: 'Mindfulness', color: '#8B5CF6', icon: '🧘', userId },
    { name: 'Learning', color: '#3B82F6', icon: '📚', userId },
  ]);

  const now = new Date().toISOString();

  await db.insert(habits).values([
    { name: 'Morning Run', description: '30 min run each morning', categoryId: 1, userId, isActive: 1, createdAt: now },
    { name: 'Meditation', description: '10 min mindfulness session', categoryId: 2, userId, isActive: 1, createdAt: now },
    { name: 'Reading', description: 'Read for at least 20 minutes', categoryId: 3, userId, isActive: 1, createdAt: now },
    { name: 'Drink Water', description: '8 glasses of water per day', categoryId: 1, userId, isActive: 1, createdAt: now },
    { name: 'Journaling', description: 'Write in journal daily', categoryId: 2, userId, isActive: 1, createdAt: now },
  ]);

  const runDays = [1, 2, 4, 5, 7, 9, 10, 12, 14, 15, 17, 19, 21, 22, 24, 26, 28, 30, 32, 35];
  const meditationDays = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 35];
  const readingDays = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
  const waterDays = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
  const journalDays = [2, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

  const logEntries = [
    ...runDays.map((d) => ({ habitId: 1, date: daysAgo(d), count: 1, completed: 1, notes: null, createdAt: now })),
    ...meditationDays.map((d) => ({ habitId: 2, date: daysAgo(d), count: 10 + (d % 11), completed: 1, notes: null, createdAt: now })),
    ...readingDays.map((d) => ({ habitId: 3, date: daysAgo(d), count: 20 + (d % 3) * 10, completed: 1, notes: null, createdAt: now })),
    ...waterDays.map((d) => ({ habitId: 4, date: daysAgo(d), count: 6 + (d % 4), completed: 1, notes: null, createdAt: now })),
    ...journalDays.map((d) => ({ habitId: 5, date: daysAgo(d), count: 1, completed: 1, notes: null, createdAt: now })),
  ];

  await db.insert(habitLogs).values(logEntries);

  await db.insert(targets).values([
    { userId, habitId: 1, type: 'weekly', goalValue: 3, createdAt: now },
    { userId, habitId: null, type: 'weekly', goalValue: 20, createdAt: now },
    { userId, habitId: 3, type: 'monthly', goalValue: 15, createdAt: now },
  ]);
}
