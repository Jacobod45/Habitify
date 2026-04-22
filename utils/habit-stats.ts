import { HabitLog, Target } from '@/context/app-context';

export function calculateStreak(habitId: number, logs: HabitLog[]): number {
  const completedDates = new Set(
    logs.filter((l) => l.habitId === habitId && l.completed === 1).map((l) => l.date)
  );

  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];

  const start = new Date(today);
  if (!completedDates.has(todayKey)) {
    start.setDate(start.getDate() - 1);
  }

  let streak = 0;
  const cursor = new Date(start);
  while (true) {
    const key = cursor.toISOString().split('T')[0];
    if (!completedDates.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function calculateProgress(target: Target, logs: HabitLog[]): number {
  const now = new Date();
  let startDate: Date;

  if (target.type === 'weekly') {
    startDate = new Date(now);
    const day = startDate.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startDate.setDate(startDate.getDate() - diff);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const startStr = startDate.toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  return logs.filter((l) => {
    const inRange = l.date >= startStr && l.date <= todayStr;
    const matchesHabit =
      target.habitId === null || target.habitId === undefined || l.habitId === target.habitId;
    return inRange && matchesHabit && l.completed === 1;
  }).length;
}

export function getWeekStart(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 6 : day - 1;
  today.setDate(today.getDate() - diff);
  return today.toISOString().split('T')[0];
}

export function getMonthStart(): string {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
