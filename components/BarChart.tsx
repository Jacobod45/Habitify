import { StyleSheet, Text, View } from 'react-native';

type BarData = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: BarData[];
  barColor?: string;
  labelColor?: string;
  height?: number;
};

export default function BarChart({
  data,
  barColor = '#0F766E',
  labelColor = '#6B7280',
  height = 130,
}: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barAreaHeight = height - 20;

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { height }]}>
        {data.map((item, i) => {
          const barHeight = (item.value / max) * barAreaHeight;
          return (
            <View key={i} style={styles.barGroup}>
              {item.value > 0 && (
                <Text style={[styles.valueLabel, { color: labelColor }]}>{item.value}</Text>
              )}
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(barHeight, item.value > 0 ? 4 : 0),
                    backgroundColor: item.color ?? barColor,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labelRow}>
        {data.map((item, i) => (
          <Text key={i} style={[styles.label, { color: labelColor }]}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartArea: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 2,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 2,
    minHeight: 2,
    width: '80%',
  },
  valueLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  labelRow: {
    flexDirection: 'row',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  label: {
    flex: 1,
    fontSize: 11,
    textAlign: 'center',
  },
});
