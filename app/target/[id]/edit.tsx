import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useApp } from '@/context/app-context';
import { useThemeContext } from '@/context/theme-context';
import { db } from '@/db/client';
import { targets as targetsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditTargetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { targets, habits, refreshTargets } = useApp();
  const { colors } = useThemeContext();
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [type, setType] = useState<'weekly' | 'monthly'>('weekly');
  const [goalValue, setGoalValue] = useState('');

  const target = targets.find((t) => t.id === Number(id));

  useEffect(() => {
    if (target) {
      setSelectedHabitId(target.habitId ?? null);
      setType(target.type as 'weekly' | 'monthly');
      setGoalValue(target.goalValue.toString());
    }
  }, [target?.id]);

  if (!target) return null;

  const save = async () => {
    const parsed = parseInt(goalValue, 10);
    if (isNaN(parsed) || parsed < 1) return;
    await db
      .update(targetsTable)
      .set({ habitId: selectedHabitId, type, goalValue: parsed })
      .where(eq(targetsTable.id, target.id));
    await refreshTargets();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Edit Goal" subtitle="Update your target" />

        <Text style={[styles.label, { color: colors.text }]}>Habit (optional)</Text>
        <View style={styles.habitRow}>
          <Pressable
            accessibilityLabel="Target all habits"
            accessibilityRole="button"
            onPress={() => setSelectedHabitId(null)}
            style={[
              styles.habitChip,
              {
                backgroundColor: selectedHabitId === null ? colors.filterActive : colors.filterInactive,
                borderColor: selectedHabitId === null ? colors.filterActiveBorder : colors.filterInactiveBorder,
              },
            ]}
          >
            <Text style={[styles.habitChipText, { color: selectedHabitId === null ? colors.filterTextActive : colors.filterTextInactive }]}>
              All Habits
            </Text>
          </Pressable>
          {habits.map((habit) => {
            const isSelected = selectedHabitId === habit.id;
            return (
              <Pressable
                key={habit.id}
                accessibilityLabel={`Target habit ${habit.name}`}
                accessibilityRole="button"
                onPress={() => setSelectedHabitId(habit.id)}
                style={[
                  styles.habitChip,
                  {
                    backgroundColor: isSelected ? colors.filterActive : colors.filterInactive,
                    borderColor: isSelected ? colors.filterActiveBorder : colors.filterInactiveBorder,
                  },
                ]}
              >
                <Text style={[styles.habitChipText, { color: isSelected ? colors.filterTextActive : colors.filterTextInactive }]}>
                  {habit.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Period</Text>
        <View style={styles.typeRow}>
          {(['weekly', 'monthly'] as const).map((t) => (
            <Pressable
              key={t}
              accessibilityLabel={`Set ${t} target`}
              accessibilityRole="button"
              onPress={() => setType(t)}
              style={[
                styles.typeChip,
                {
                  backgroundColor: type === t ? colors.primary : colors.card,
                  borderColor: type === t ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.typeChipText, { color: type === t ? '#FFFFFF' : colors.text }]}>
                {t === 'weekly' ? 'Weekly' : 'Monthly'}
              </Text>
            </Pressable>
          ))}
        </View>

        <FormField
          label="Goal (number of completions)"
          value={goalValue}
          onChangeText={setGoalValue}
          keyboardType="numeric"
        />

        <PrimaryButton label="Save Changes" onPress={save} />
        <View style={styles.cancelBtn}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  habitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  habitChip: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  habitChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeChip: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  typeChipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 10,
  },
});
