import { Category, Habit } from '@/context/app-context';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  habit: Habit;
  category: Category | undefined;
  weekCount: number;
};

export default function HabitCard({ habit, category, weekCount }: Props) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel={`${habit.name}, press to view details`}
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/habit/[id]', params: { id: habit.id.toString() } })
      }
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.name}>{habit.name}</Text>

      {habit.description ? (
        <Text style={styles.description} numberOfLines={1}>
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
        <Text style={styles.weekCount}>{weekCount}× this week</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.88,
  },
  name: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: '#6B7280',
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
    borderRadius: 999,
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
    color: '#6B7280',
    fontSize: 12,
  },
});
