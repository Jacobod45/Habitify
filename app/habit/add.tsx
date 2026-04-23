import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useApp } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { useThemeContext } from '@/context/theme-context';
import { db } from '@/db/client';
import { habits as habitsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddHabitScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { categories, refreshHabits } = useApp();
  const { colors } = useThemeContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter a habit name');
      return;
    }
    if (!selectedCategoryId) {
      setError('Please select a category');
      return;
    }
    if (!user) return;

    await db.insert(habitsTable).values({
      name: name.trim(),
      description: description.trim() || null,
      categoryId: selectedCategoryId,
      userId: user.id,
      isActive: 1,
      createdAt: new Date().toISOString(),
    });
    await refreshHabits();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="New Habit" subtitle="Define a habit to track" />

        <View style={styles.form}>
          <FormField label="Name" value={name} onChangeText={setName} />
          <FormField
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        {categories.length === 0 ? (
          <View style={[styles.noCatBox, { borderColor: colors.border }]}>
            <Text style={[styles.noCatText, { color: colors.textSecondary }]}>
              No categories yet.
            </Text>
            <PrimaryButton
              label="Create a Category"
              variant="secondary"
              compact
              onPress={() => router.push('/category/add')}
            />
          </View>
        ) : (
          <View style={styles.catRow}>
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  accessibilityLabel={`Select category ${cat.name}`}
                  accessibilityRole="button"
                  onPress={() => setSelectedCategoryId(cat.id)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isSelected ? cat.color : colors.card,
                      borderColor: cat.color,
                    },
                  ]}
                >
                  <Text style={styles.catChipIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.catChipText,
                      { color: isSelected ? '#FFFFFF' : cat.color },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttons}>
          <PrimaryButton label="Save Habit" onPress={save} />
          <View style={styles.cancelBtn}>
            <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
          </View>
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
  form: {
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  catChip: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  catChipIcon: {
    fontSize: 14,
  },
  catChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noCatBox: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 16,
    padding: 16,
    gap: 10,
  },
  noCatText: {
    fontSize: 14,
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 10,
  },
  buttons: {
    marginTop: 8,
  },
  cancelBtn: {
    marginTop: 10,
  },
});
