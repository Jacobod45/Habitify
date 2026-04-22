import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/db/client';
import { categories, habitLogs, habits, targets, users } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const SESSION_KEY = 'habit_tracker_user';

function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(SESSION_KEY).then((stored) => {
      if (stored) {
        try {
          setUser(JSON.parse(stored) as User);
        } catch {
          // ignore corrupt session
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const hash = hashPassword(password);
    const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (rows.length === 0 || rows[0].passwordHash !== hash) return false;
    const sessionUser = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return true;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existing.length > 0) return false;
    const hash = hashPassword(password);
    await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    });
    const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (rows.length === 0) return false;
    const sessionUser = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return true;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setUser(null);
  };

  const deleteAccount = async () => {
    if (!user) return;
    const userHabits = await db.select().from(habits).where(eq(habits.userId, user.id));
    const habitIds = userHabits.map((h) => h.id);
    if (habitIds.length > 0) {
      await db.delete(habitLogs).where(inArray(habitLogs.habitId, habitIds));
    }
    await db.delete(habits).where(eq(habits.userId, user.id));
    await db.delete(targets).where(eq(targets.userId, user.id));
    await db.delete(categories).where(eq(categories.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
