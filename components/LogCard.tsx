import { HabitLog } from '@/context/app-context';
import { formatDate } from '@/utils/habit-stats';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  log: HabitLog;
};

export default function LogCard({ log }: Props) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.date}>{formatDate(log.date)}</Text>
        {log.notes ? <Text style={styles.notes}>{log.notes}</Text> : null}
      </View>
      <Text style={styles.count}>×{log.count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  date: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
  },
  notes: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  count: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '700',
  },
});
