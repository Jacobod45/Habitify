import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const REMINDER_KEY = 'habit_reminder_time';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleHabitReminder(hour: number, minute: number): Promise<void> {
  if (Platform.OS === 'web') return;
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
}

export async function cancelHabitReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await SecureStore.deleteItemAsync(REMINDER_KEY);
}

export async function getSavedReminderTime(): Promise<{ hour: number; minute: number } | null> {
  if (Platform.OS === 'web') return null;
  const stored = await SecureStore.getItemAsync(REMINDER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as { hour: number; minute: number };
  } catch {
    return null;
  }
}
