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
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LogActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, refreshLogs } = useApp();
  const { colors } = useThemeContext();
  const [date, setDate] = useState(todayStr());
  const [count, setCount] = useState('1');
  const [notes, setNotes] = useState('');

  const habit = habits.find((h) => h.id === Number(id));
  if (!habit) return null;

  const save = async () => {
    const parsedCount = parseInt(count, 10);
    await db.insert(habitLogs).values({
      habitId: habit.id,
      date: date.trim(),
      count: isNaN(parsedCount) || parsedCount < 1 ? 1 : parsedCount,
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
            onChangeText={setDate}
            placeholder="2026-04-21"
          />
          <FormField
            label="Count"
            value={count}
            onChangeText={setCount}
            keyboardType="numeric"
          />
          <FormField
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

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
  cancelBtn: {
    marginTop: 10,
  },
});
