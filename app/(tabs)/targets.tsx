import ProgressBar from '@/components/ProgressBar';
import PrimaryButton from '@/components/ui/primary-button';
import { useApp } from '@/context/app-context';
import { useThemeContext } from '@/context/theme-context';
import { db } from '@/db/client';
import { targets as targetsTable } from '@/db/schema';
import { calculateProgress } from '@/utils/habit-stats';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TargetsScreen() {
  const router = useRouter();
  const { targets, habits, logs, refreshTargets } = useApp();
  const { colors } = useThemeContext();

  const deleteTarget = async (id: number) => {
    await db.delete(targetsTable).where(eq(targetsTable.id, id));
    await refreshTargets();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>🎯 Goals</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {targets.length} active goal{targets.length === 1 ? '' : 's'}
          </Text>
        </View>
        <PrimaryButton label="+ Add" compact onPress={() => router.push('/target/add')} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {targets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={[styles.emptyText, { color: colors.empty }]}>
              No goals yet. Set a weekly or monthly target to stay on track.
            </Text>
          </View>
        ) : (
          targets.map((target) => {
            const current = calculateProgress(target, logs);
            const progress = Math.min(current / target.goalValue, 1);
            const habit = habits.find((h) => h.id === target.habitId);
            const label = habit ? habit.name : 'All habits';
            const isExceeded = current >= target.goalValue;
            const isClose = progress >= 0.75 && !isExceeded;

            const statusColor = isExceeded
              ? '#10B981'
              : isClose
              ? '#F59E0B'
              : colors.danger;

            const statusLabel = isExceeded
              ? '✅ Target met!'
              : isClose
              ? '⚠️ Almost there'
              : '❌ Behind target';

            return (
              <View
                key={target.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <Text style={[styles.cardLabel, { color: colors.text }]}>{label}</Text>
                    <Text style={[styles.cardType, { color: colors.textSecondary }]}>
                      {target.type === 'weekly' ? 'Weekly' : 'Monthly'} goal
                    </Text>
                  </View>
                  <PrimaryButton
                    label="Edit"
                    variant="secondary"
                    compact
                    onPress={() =>
                      router.push({ pathname: '/target/[id]/edit', params: { id: target.id.toString() } })
                    }
                  />
                </View>

                <View style={styles.progressRow}>
                  <Text style={[styles.progressText, { color: statusColor }]}>
                    {current} / {target.goalValue}
                  </Text>
                  <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
                </View>

                <ProgressBar current={current} goal={target.goalValue} color={colors.primary} />

                <View style={styles.deleteRow}>
                  <PrimaryButton
                    label="Delete"
                    variant="danger"
                    compact
                    onPress={() => deleteTarget(target.id)}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    paddingBottom: 32,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLeft: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardType: {
    fontSize: 13,
    marginTop: 2,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteRow: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
