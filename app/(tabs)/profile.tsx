import PrimaryButton from '@/components/ui/primary-button';
import { useAuth } from '@/context/auth-context';
import { useApp } from '@/context/app-context';
import { useThemeContext } from '@/context/theme-context';
import {
  cancelHabitReminder,
  getSavedReminderTime,
  requestNotificationPermissions,
  scheduleHabitReminder,
} from '@/services/notifications';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const { habits, logs, categories } = useApp();
  const { colors, theme, toggleTheme } = useThemeContext();
  const router = useRouter();

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(9);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    getSavedReminderTime().then((saved) => {
      if (saved) {
        setReminderEnabled(true);
        setReminderHour(saved.hour);
        setReminderMinute(saved.minute);
      }
    });
  }, []);

  const handleToggleReminder = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please allow notifications in your device settings to enable reminders.'
        );
        return;
      }
      await scheduleHabitReminder(reminderHour, reminderMinute);
    } else {
      await cancelHabitReminder();
    }
    setReminderEnabled(value);
  };

  const adjustHour = (delta: number) => {
    const next = (reminderHour + delta + 24) % 24;
    setReminderHour(next);
    if (reminderEnabled) void scheduleHabitReminder(next, reminderMinute);
  };

  const adjustMinute = (delta: number) => {
    const next = (reminderMinute + delta + 60) % 60;
    setReminderMinute(next);
    if (reminderEnabled) void scheduleHabitReminder(reminderHour, next);
  };

  const handleExportCSV = async () => {
    if (logs.length === 0) {
      Alert.alert('No Data', 'You have no habit logs to export yet.');
      return;
    }
    setExportLoading(true);
    try {
      const header = '"Date","Habit","Category","Count","Notes"\n';
      const rows = logs
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((log) => {
          const habit = habits.find((h) => h.id === log.habitId);
          const category = categories.find((c) => c.id === habit?.categoryId);
          const safe = (s: string | null | undefined) =>
            `"${(s ?? '').replace(/"/g, '""')}"`;
          return [
            safe(log.date),
            safe(habit?.name),
            safe(category?.name),
            log.count,
            safe(log.notes),
          ].join(',');
        })
        .join('\n');

      const csv = header + rows;
      const fileUri = (FileSystem.documentDirectory ?? '') + 'habit_logs.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Habit Logs',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Exported', `Saved to: ${fileUri}`);
      }
    } catch {
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAccount() },
      ]
    );
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>

        {/* User info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{habits.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Habits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{logs.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total logs</Text>
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
              accessibilityLabel="Toggle dark mode"
            />
          </View>
        </View>

        {/* Daily Reminder */}
        {Platform.OS !== 'web' && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Reminder</Text>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Enable reminder</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.card}
                accessibilityLabel="Toggle daily reminder"
              />
            </View>
            {reminderEnabled && (
              <View style={styles.timePicker}>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Reminder time</Text>
                <View style={styles.timeRow}>
                  <View style={styles.timeUnit}>
                    <TouchableOpacity
                      onPress={() => adjustHour(1)}
                      accessibilityLabel="Increase hour"
                      style={[styles.timeBtn, { backgroundColor: colors.filterInactive, borderColor: colors.border }]}
                    >
                      <Text style={[styles.timeBtnText, { color: colors.text }]}>▲</Text>
                    </TouchableOpacity>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{pad(reminderHour)}</Text>
                    <TouchableOpacity
                      onPress={() => adjustHour(-1)}
                      accessibilityLabel="Decrease hour"
                      style={[styles.timeBtn, { backgroundColor: colors.filterInactive, borderColor: colors.border }]}
                    >
                      <Text style={[styles.timeBtnText, { color: colors.text }]}>▼</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.timeSep, { color: colors.text }]}>:</Text>
                  <View style={styles.timeUnit}>
                    <TouchableOpacity
                      onPress={() => adjustMinute(5)}
                      accessibilityLabel="Increase minute"
                      style={[styles.timeBtn, { backgroundColor: colors.filterInactive, borderColor: colors.border }]}
                    >
                      <Text style={[styles.timeBtnText, { color: colors.text }]}>▲</Text>
                    </TouchableOpacity>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{pad(reminderMinute)}</Text>
                    <TouchableOpacity
                      onPress={() => adjustMinute(-5)}
                      accessibilityLabel="Decrease minute"
                      style={[styles.timeBtn, { backgroundColor: colors.filterInactive, borderColor: colors.border }]}
                    >
                      <Text style={[styles.timeBtnText, { color: colors.text }]}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Data Export */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Data</Text>
          <Text style={[styles.exportHint, { color: colors.textSecondary }]}>
            Export all your habit logs as a CSV file.
          </Text>
          <PrimaryButton
            label={exportLoading ? 'Exporting…' : 'Export as CSV'}
            variant="secondary"
            onPress={handleExportCSV}
          />
        </View>

        {/* Categories */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
          <PrimaryButton
            label="Manage Categories"
            variant="secondary"
            onPress={() => router.push('/category/add')}
          />
        </View>

        <View style={styles.logoutSection}>
          <PrimaryButton label="Log Out" variant="secondary" onPress={logout} />
          <View style={styles.deleteBtn}>
            <PrimaryButton label="Delete Account" variant="danger" onPress={handleDeleteAccount} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 14,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 15,
  },
  timePicker: {
    marginTop: 14,
  },
  timeLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
  timeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  timeUnit: {
    alignItems: 'center',
    gap: 6,
  },
  timeBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  timeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '700',
    minWidth: 48,
    textAlign: 'center',
  },
  timeSep: {
    fontSize: 28,
    fontWeight: '700',
  },
  exportHint: {
    fontSize: 13,
    marginBottom: 12,
  },
  logoutSection: {
    marginTop: 8,
  },
  deleteBtn: {
    marginTop: 10,
  },
});
