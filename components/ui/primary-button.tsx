import { useThemeContext } from '@/context/theme-context';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  compact?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export default function PrimaryButton({
  label,
  onPress,
  compact = false,
  variant = 'primary',
}: Props) {
  const { colors } = useThemeContext();

  const bgColor =
    variant === 'danger'
      ? colors.dangerBg
      : variant === 'secondary'
      ? colors.card
      : colors.primary;

  const borderColor =
    variant === 'danger'
      ? colors.dangerBorder
      : variant === 'secondary'
      ? colors.border
      : colors.primary;

  const textColor =
    variant === 'danger'
      ? colors.dangerText
      : variant === 'secondary'
      ? colors.text
      : colors.primaryText;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor, borderColor, borderWidth: variant !== 'primary' ? 1 : 0 },
        compact && styles.compact,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: textColor }, compact && styles.compactLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  compact: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  compactLabel: {
    fontSize: 13,
  },
});
