import { StyleSheet, View } from 'react-native';

type Props = {
  current: number;
  goal: number;
  color?: string;
};

export default function ProgressBar({ current, goal, color = '#0F766E' }: Props) {
  const progress = goal > 0 ? Math.min(current / goal, 1) : 0;
  const isExceeded = current >= goal;

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${progress * 100}%`,
            backgroundColor: isExceeded ? '#10B981' : color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 2,
    height: '100%',
  },
});
