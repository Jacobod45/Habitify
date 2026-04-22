import { db } from '@/db/client';
import { categories, habitLogs, habits, targets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';

export type Habit = {
  id: number;
  name: string;
  description: string | null;
  categoryId: number;
  userId: number;
  isActive: number;
  createdAt: string;
};

export type Category = {
  id: number;
  name: string;
  color: string;
  icon: string;
  userId: number;
};

export type HabitLog = {
  id: number;
  habitId: number;
  date: string;
  count: number;
  completed: number;
  notes: string | null;
  createdAt: string;
};

export type Target = {
  id: number;
  userId: number;
  habitId: number | null;
  type: string;
  goalValue: number;
  createdAt: string;
};

type AppContextType = {
  habits: Habit[];
  categories: Category[];
  logs: HabitLog[];
  targets: Target[];
  refreshHabits: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshLogs: () => Promise<void>;
  refreshTargets: () => Promise<void>;
  refreshAll: () => Promise<void>;
};

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [habitList, setHabitList] = useState<Habit[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [logList, setLogList] = useState<HabitLog[]>([]);
  const [targetList, setTargetList] = useState<Target[]>([]);

  const refreshHabits = async () => {
    if (!user) return;
    const rows = await db.select().from(habits).where(eq(habits.userId, user.id));
    setHabitList(rows);
  };

  const refreshCategories = async () => {
    if (!user) return;
    const rows = await db.select().from(categories).where(eq(categories.userId, user.id));
    setCategoryList(rows);
  };

  const refreshLogs = async () => {
    if (!user) return;
    const userHabits = await db.select().from(habits).where(eq(habits.userId, user.id));
    const habitIds = userHabits.map((h) => h.id);
    if (habitIds.length === 0) {
      setLogList([]);
      return;
    }
    const allLogs: HabitLog[] = [];
    for (const id of habitIds) {
      const rows = await db.select().from(habitLogs).where(eq(habitLogs.habitId, id));
      allLogs.push(...rows);
    }
    setLogList(allLogs);
  };

  const refreshTargets = async () => {
    if (!user) return;
    const rows = await db.select().from(targets).where(eq(targets.userId, user.id));
    setTargetList(rows);
  };

  const refreshAll = async () => {
    await Promise.all([refreshHabits(), refreshCategories(), refreshLogs(), refreshTargets()]);
  };

  useEffect(() => {
    if (user) {
      void refreshAll();
    } else {
      setHabitList([]);
      setCategoryList([]);
      setLogList([]);
      setTargetList([]);
    }
  }, [user?.id]);

  return (
    <AppContext.Provider
      value={{
        habits: habitList,
        categories: categoryList,
        logs: logList,
        targets: targetList,
        refreshHabits,
        refreshCategories,
        refreshLogs,
        refreshTargets,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
