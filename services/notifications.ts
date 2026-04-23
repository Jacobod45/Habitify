import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const REMINDER_KEY = 'habit_reminder_time';

function getNotifications() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications') as typeof import('expo-notifications');
}

function setupHandler() {
  try {
    const Notifications = getNotifications();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // not supported in this environment (e.g. Expo Go on Android SDK 53+)
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    setupHandler();
    const Notifications = getNotifications();
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleHabitReminder(hour: number, minute: number): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const Notifications = getNotifications();
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to log your habits!',
        body: 'Keep your streak going — log your habits for today.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    await SecureStore.setItemAsync(REMINDER_KEY, JSON.stringify({ hour, minute }));
  } catch {
    // local notifications not available in this environment
  }
}

export async function cancelHabitReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const Notifications = getNotifications();
    await Notifications.cancelAllScheduledNotificationsAsync();
    await SecureStore.deleteItemAsync(REMINDER_KEY);
  } catch {
    // ignore
  }
}

export async function getSavedReminderTime(): Promise<{ hour: number; minute: number } | null> {
  if (Platform.OS === 'web') return null;
  try {
    const stored = await SecureStore.getItemAsync(REMINDER_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as { hour: number; minute: number };
  } catch {
    return null;
  }
}
