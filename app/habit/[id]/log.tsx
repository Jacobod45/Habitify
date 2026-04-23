import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useApp } from '@/context/app-context';
import { useThemeContext } from '@/context/theme-context';
import { db } from '@/db/client';
import { habitLogs } from '@/db/schema';
import { todayStr } from '@/utils/habit-stats';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function LogActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, refreshLogs } = useApp();
  const { colors } = useThemeContext();
  const [date, setDate] = useState(todayStr());
  const [count, setCount] = useState('1');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const habit = habits.find((h) => h.id === Number(id));
  if (!habit) return null;

  const save = async () => {
    setError('');

    if (!DATE_REGEX.test(date.trim())) {
      setError('Date must be in YYYY-MM-DD format (e.g. 2026-04-23)');
      return;
    }

    const parsedCount = parseInt(count, 10);
    if (isNaN(parsedCount) || parsedCount < 1) {
      setError('Count must be a number of at least 1');
      return;
    }

    await db.insert(habitLogs).values({
      habitId: habit.id,
      date: date.trim(),
      count: parsedCount,
      completed: 1,
      notes: notes.trim() || null,
      createdAt: new Date().toISOString(),
    });
    await refreshLogs();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Log Activity" subtitle={habit.name} />

        <View style={styles.form}>
          <FormField
            label="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={(t) => { setDate(t); setError(''); }}
            placeholder="2026-04-23"
          />
          <FormField
            label="Count"
            value={count}
            onChangeText={(t) => { setCount(t); setError(''); }}
            keyboardType="numeric"
            placeholder="1"
          />
          <FormField
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {error ? (
          <Text
            style={[styles.error, { color: colors.danger }]}
            accessibilityRole="alert"
          >
            {error}
          </Text>
        ) : null}

        <PrimaryButton label="Save Log" onPress={save} />
        <View style={styles.cancelBtn}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 20,
  },
  content: {
    paddingBottom: 32,
  },
  form: {
    marginBottom: 6,
  },
  error: {
    fontSize: 14,
    marginBottom: 12,
  },
  cancelBtn: {
    marginTop: 10,
  },
});
