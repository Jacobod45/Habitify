import LogCard from '@/components/LogCard';
import PrimaryButton from '@/components/ui/primary-button';
import { useApp } from '@/context/app-context';
import { useThemeContext } from '@/context/theme-context';
import { db } from '@/db/client';
import { habitLogs, habits as habitsTable } from '@/db/schema';
import { todayStr } from '@/utils/habit-stats';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, categories, logs, refreshHabits, refreshLogs } = useApp();
  const { colors } = useThemeContext();

  const habit = habits.find((h) => h.id === Number(id));
  if (!habit) return null;

  const category = categories.find((c) => c.id === habit.categoryId);
  const habitLogsForHabit = logs
    .filter((l) => l.habitId === habit.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  const today = todayStr();
  const loggedToday = logs.some(
    (l) => l.habitId === habit.id && l.date === today && l.completed === 1
  );

  const quickLog = async () => {
    await db.insert(habitLogs).values({
      habitId: habit.id,
      date: today,
      count: 1,
      completed: 1,
      notes: null,
      createdAt: new Date().toISOString(),
    });
    await refreshLogs();
  };

  const deleteHabit = async () => {
    await db.delete(habitLogs).where(eq(habitLogs.habitId, habit.id));
    await db.delete(habitsTable).where(eq(habitsTable.id, habit.id));
    await refreshHabits();
    await refreshLogs();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.name, { color: colors.text }]}>{habit.name}</Text>

        {category && (
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: category.color + '22', borderColor: category.color + '55' },
            ]}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[styles.categoryName, { color: category.color }]}>{category.name}</Text>
          </View>
        )}

        {habit.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {habit.description}
          </Text>
        ) : null}

        <View style={styles.actions}>
          {loggedToday ? (
            <View style={styles.loggedBadge}>
              <Text style={styles.loggedText}>✅ Logged today</Text>
            </View>
          ) : (
            <PrimaryButton label="✓ Log Today" onPress={quickLog} />
          )}
          <View style={styles.actionRow}>
            <PrimaryButton
              label="Log Activity"
              variant="secondary"
              compact
              onPress={() =>
                router.push({ pathname: '/habit/[id]/log', params: { id: habit.id.toString() } })
              }
            />
            <PrimaryButton
              label="Edit"
              variant="secondary"
              compact
              onPress={() =>
                router.push({ pathname: '/habit/[id]/edit', params: { id: habit.id.toString() } })
              }
            />
            <PrimaryButton label="Delete" variant="danger" compact onPress={deleteHabit} />
          </View>
        </View>

        <Text style={[styles.historyTitle, { color: colors.text }]}>
          Recent Activity ({habitLogsForHabit.length})
        </Text>

        {habitLogsForHabit.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.empty }]}>
            No logs yet for this habit.
          </Text>
        ) : (
          habitLogsForHabit.map((log) => <LogCard key={log.id} log={log} />)
        )}
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
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  actions: {
    gap: 10,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  loggedBadge: {
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  loggedText: {
    color: '#166534',
    fontSize: 15,
    fontWeight: '600',
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    paddingTop: 8,
    textAlign: 'center',
  },
});
