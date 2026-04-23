import { HabitLog } from '@/context/app-context';
import { useThemeContext } from '@/context/theme-context';
import { formatDate } from '@/utils/habit-stats';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  log: HabitLog;
};

export default function LogCard({ log }: Props) {
  const { colors } = useThemeContext();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View>
        <Text style={[styles.date, { color: colors.text }]}>{formatDate(log.date)}</Text>
        {log.notes ? (
          <Text style={[styles.notes, { color: colors.textSecondary }]}>{log.notes}</Text>
        ) : null}
      </View>
      <Text style={[styles.count, { color: colors.primary }]}>x{log.count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
  },
  notes: {
    fontSize: 12,
    marginTop: 2,
  },
  count: {
    fontSize: 16,
    fontWeight: '700',
  },
});
