import BarChart from '@/components/BarChart';
import ProgressBar from '@/components/ProgressBar';
import PrimaryButton from '@/components/ui/primary-button';
import { useApp } from '@/context/app-context';
import { useThemeContext } from '@/context/theme-context';
import { db } from '@/db/client';
import { targets as targetsTable } from '@/db/schema';
import { fetchDailyQuote, Quote } from '@/services/quotes-api';
import { calculateProgress, getMonthStart, getWeekStart, todayStr } from '@/utils/habit-stats';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InsightsScreen() {
  const { habits, logs, categories, targets, refreshTargets } = useApp();
  const { colors } = useThemeContext();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(false);

  useEffect(() => {
    setQuoteLoading(true);
    setQuoteError(false);
    fetchDailyQuote()
      .then((q) => {
        setQuote(q);
        setQuoteLoading(false);
      })
      .catch(() => {
        setQuoteError(true);
        setQuoteLoading(false);
      });
  }, []);

  const today = todayStr();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().split('T')[0];
  });

  const barData = last7Days.map((date) => {
    const count = logs.filter((l) => l.date === date && l.completed === 1).length;
    const label = new Date(date + 'T00:00:00')
      .toLocaleDateString('en-IE', { weekday: 'short' })
      .slice(0, 2);
    return { label, value: count };
  });

  const weekLogs = logs.filter(
    (l) => l.date >= weekStart && l.date <= today && l.completed === 1
  );
  const monthLogs = logs.filter(
    (l) => l.date >= monthStart && l.date <= today && l.completed === 1
  );
  const uniqueHabitsThisWeek = new Set(weekLogs.map((l) => l.habitId)).size;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Insights</Text>

        {/* Daily Motivational Quote */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Motivation</Text>
          {quoteLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              accessibilityLabel="Loading quote"
              style={styles.loader}
            />
          ) : quoteError ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              Could not load quote. Check your connection.
            </Text>
          ) : quote ? (
            <View>
              <Text style={[styles.quoteText, { color: colors.text }]}>"{quote.quote}"</Text>
              <Text style={[styles.quoteAuthor, { color: colors.textSecondary }]}>
                — {quote.author}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Last 7 Days</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Habit completions per day
          </Text>
          {logs.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.empty }]}>No data yet</Text>
          ) : (
            <BarChart data={barData} barColor={colors.primary} labelColor={colors.textSecondary} />
          )}
        </View>

        <View style={styles.statsRow}>
          <View
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.statValue, { color: colors.primary }]}>{weekLogs.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This week</Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {uniqueHabitsThisWeek}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Habits active</Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.statValue, { color: colors.primary }]}>{monthLogs.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This month</Text>
          </View>
        </View>

        {/* Per-habit this week bar chart */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week by Habit</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Completions per habit since Monday
          </Text>
          {habits.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.empty }]}>No habits yet</Text>
          ) : (
            <BarChart
              data={habits.map((h) => ({
                label: h.name.length > 6 ? h.name.slice(0, 6) + '…' : h.name,
                value: weekLogs.filter((l) => l.habitId === h.id).length,
              }))}
              barColor={colors.primary}
              labelColor={colors.textSecondary}
              height={110}
            />
          )}
        </View>

        {/* Goals / Targets */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.goalHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Goals</Text>
            <PrimaryButton
              label="+ Add Goal"
              compact
              onPress={() => router.push('/target/add')}
            />
          </View>
          {targets.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.empty }]}>
              No goals yet. Tap "+ Add Goal" to set a target.
            </Text>
          ) : (
            targets.map((target) => {
              const current = calculateProgress(target, logs);
              const progress = Math.min(current / target.goalValue, 1);
              const habit = habits.find((h) => h.id === target.habitId);
              const label = habit ? habit.name : 'All habits';
              const isExceeded = current >= target.goalValue;
              const isClose = progress >= 0.75 && !isExceeded;
              const statusColor = isExceeded ? colors.success : isClose ? '#F59E0B' : colors.danger;
              const statusLabel = isExceeded ? 'Target met' : isClose ? 'Almost there' : 'Behind target';

              return (
                <View key={target.id} style={[styles.goalCard, { borderColor: colors.border }]}>
                  <View style={styles.goalRow}>
                    <View style={styles.goalInfo}>
                      <Text style={[styles.goalLabel, { color: colors.text }]}>{label}</Text>
                      <Text style={[styles.goalType, { color: colors.textSecondary }]}>
                        {target.type === 'weekly' ? 'Weekly' : 'Monthly'} — {current}/{target.goalValue}
                      </Text>
                    </View>
                    <View style={styles.goalActions}>
                      <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
                      <PrimaryButton
                        label="Delete"
                        variant="danger"
                        compact
                        onPress={async () => {
                          await db.delete(targetsTable).where(eq(targetsTable.id, target.id));
                          await refreshTargets();
                        }}
                      />
                    </View>
                  </View>
                  <ProgressBar current={current} goal={target.goalValue} color={colors.primary} />
                </View>
              );
            })
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Summary</Text>
          {categories.map((cat) => {
            const catHabits = habits.filter((h) => h.categoryId === cat.id);
            const catLogs = monthLogs.filter((l) =>
              catHabits.some((h) => h.id === l.habitId)
            );
            return (
              <View key={cat.id} style={styles.catRow}>
                <Text style={[styles.catName, { color: colors.text }]}>{cat.icon}  {cat.name}</Text>
                <Text style={[styles.catCount, { color: colors.primary }]}>{catLogs.length}x</Text>
              </View>
            );
          })}
          {categories.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.empty }]}>No categories yet</Text>
          )}
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
    paddingBottom: 32,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    marginBottom: 14,
  },
  loader: {
    marginVertical: 12,
  },
  errorText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginTop: 8,
  },
  quoteAuthor: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  catRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  catIcon: {
    fontSize: 18,
  },
  catName: {
    flex: 1,
    fontSize: 15,
  },
  catCount: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    marginVertical: 8,
    textAlign: 'center',
  },
  goalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalCard: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 12,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalInfo: {
    flex: 1,
    marginRight: 8,
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  goalType: {
    fontSize: 12,
    marginTop: 2,
  },
  goalActions: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
