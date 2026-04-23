import { Category, Habit } from '@/context/app-context';
import { useThemeContext } from '@/context/theme-context';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  habit: Habit;
  category: Category | undefined;
  weekCount: number;
  streak: number;
};

export default function HabitCard({ habit, category, weekCount, streak }: Props) {
  const router = useRouter();
  const { colors } = useThemeContext();

  return (
    <Pressable
      accessibilityLabel={`${habit.name}, press to view details`}
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/habit/[id]', params: { id: habit.id.toString() } })
      }
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.nameRow}>
        <Text style={[styles.name, { color: colors.text }]}>{habit.name}</Text>
        {streak > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: colors.streakBg }]}>
            <Text style={[styles.streakText, { color: colors.streakText }]}>
              {streak} day streak
            </Text>
          </View>
        )}
      </View>

      {habit.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
          {habit.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        {category ? (
          <View
            style={[
              styles.catBadge,
              { backgroundColor: category.color + '22', borderColor: category.color + '55' },
            ]}
          >
            <Text style={styles.catIcon}>{category.icon}</Text>
            <Text style={[styles.catName, { color: category.color }]}>{category.name}</Text>
          </View>
        ) : null}
        <Text style={[styles.weekCount, { color: colors.textSecondary }]}>{weekCount}× this week</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.88,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  streakBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  catBadge: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  catIcon: {
    fontSize: 12,
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
  },
  weekCount: {
    fontSize: 12,
  },
});
