import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useApp } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { useThemeContext } from '@/context/theme-context';
import { db } from '@/db/client';
import { categories as categoriesTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLOR_OPTIONS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

const ICON_OPTIONS = ['🏃', '🧘', '📚', '🍎', '💪', '🎯', '💧', '✍️', '🎵', '🌟', '🛌', '🧹'];

export default function AddCategoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshCategories } = useApp();
  const { colors } = useThemeContext();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }
    if (!user) return;
    await db.insert(categoriesTable).values({
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon,
      userId: user.id,
    });
    await refreshCategories();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="New Category" subtitle="Organise your habits" />

        <FormField label="Name" value={name} onChangeText={setName} />

        <Text style={[styles.label, { color: colors.text }]}>Colour</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((color) => (
            <Pressable
              key={color}
              accessibilityLabel={`Select colour ${color}`}
              accessibilityRole="button"
              onPress={() => setSelectedColor(color)}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                selectedColor === color && styles.colorSwatchSelected,
              ]}
            >
              {selectedColor === color && <Text style={styles.colorCheck}>✓</Text>}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Icon</Text>
        <View style={styles.iconRow}>
          {ICON_OPTIONS.map((icon) => (
            <Pressable
              key={icon}
              accessibilityLabel={`Select icon ${icon}`}
              accessibilityRole="button"
              onPress={() => setSelectedIcon(icon)}
              style={[
                styles.iconChip,
                {
                  backgroundColor: selectedIcon === icon ? selectedColor + '33' : colors.card,
                  borderColor: selectedIcon === icon ? selectedColor : colors.border,
                },
              ]}
            >
              <Text style={styles.iconText}>{icon}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.preview, { backgroundColor: selectedColor + '22', borderColor: selectedColor + '55' }]}>
          <Text style={styles.previewIcon}>{selectedIcon}</Text>
          <Text style={[styles.previewName, { color: selectedColor }]}>
            {name || 'Category name'}
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton label="Save Category" onPress={save} />
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
    marginBottom: 10,
    marginTop: 4,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  colorSwatch: {
    alignItems: 'center',
    borderRadius: 4,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  colorSwatchSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  iconChip: {
    borderRadius: 4,
    borderWidth: 2,
    padding: 8,
  },
  iconText: {
    fontSize: 22,
  },
  preview: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    padding: 14,
  },
  previewIcon: {
    fontSize: 20,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 10,
  },
  cancelBtn: {
    marginTop: 10,
  },
});
