import HabitCard from '@/components/HabitCard';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useApp } from '@/context/app-context';
import { useThemeContext } from '@/context/theme-context';
import { todayStr } from '@/utils/habit-stats';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, categories, logs } = useApp();
  const { colors } = useThemeContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const today = todayStr();
  const weekStart = (() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return d.toISOString().split('T')[0];
  })();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredHabits = habits.filter((h) => {
    const matchesSearch =
      normalizedQuery.length === 0 || h.name.toLowerCase().includes(normalizedQuery);
    const matchesCategory =
      selectedCategoryId === null || h.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <ScreenHeader title="🌱 My Habits" subtitle={`${habits.length} habits tracked`} />

      <PrimaryButton
        label="+ Add Habit"
        onPress={() => router.push('/habit/add')}
      />

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search habits…"
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.searchBorder,
            color: colors.inputText,
          },
        ]}
        accessibilityLabel="Search habits"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        <Pressable
          accessibilityLabel="Show all categories"
          accessibilityRole="button"
          onPress={() => setSelectedCategoryId(null)}
          style={[
            styles.filterBtn,
            selectedCategoryId === null
              ? { backgroundColor: colors.filterActive, borderColor: colors.filterActiveBorder }
              : { backgroundColor: colors.filterInactive, borderColor: colors.filterInactiveBorder },
          ]}
        >
          <Text
            style={[
              styles.filterBtnText,
              { color: selectedCategoryId === null ? colors.filterTextActive : colors.filterTextInactive },
            ]}
          >
            All
          </Text>
        </Pressable>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <Pressable
              key={cat.id}
              accessibilityLabel={`Filter by ${cat.name}`}
              accessibilityRole="button"
              onPress={() => setSelectedCategoryId(isSelected ? null : cat.id)}
              style={[
                styles.filterBtn,
                isSelected
                  ? { backgroundColor: colors.filterActive, borderColor: colors.filterActiveBorder }
                  : { backgroundColor: colors.filterInactive, borderColor: colors.filterInactiveBorder },
              ]}
            >
              <Text style={styles.filterBtnIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.filterBtnText,
                  { color: isSelected ? colors.filterTextActive : colors.filterTextInactive },
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌿</Text>
            <Text style={[styles.emptyText, { color: colors.empty }]}>
              {habits.length === 0
                ? 'No habits yet. Add your first one!'
                : 'No habits match your search.'}
            </Text>
          </View>
        ) : (
          filteredHabits.map((habit) => {
            const category = categories.find((c) => c.id === habit.categoryId);
            const weekCount = logs.filter(
              (l) => l.habitId === habit.id && l.date >= weekStart && l.date <= today && l.completed === 1
            ).length;
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                category={category}
                weekCount={weekCount}
              />
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
  searchInput: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  filterScroll: {
    marginTop: 10,
    flexGrow: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterBtn: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterBtnIcon: {
    fontSize: 13,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
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
