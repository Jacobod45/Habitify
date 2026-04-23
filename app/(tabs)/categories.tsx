import PrimaryButton from '@/components/ui/primary-button';
import { useApp } from '@/context/app-context';
import { useThemeContext } from '@/context/theme-context';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const { categories, habits } = useApp();
  const { colors } = useThemeContext();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {categories.length} category{categories.length === 1 ? '' : 'ies'}
          </Text>
        </View>
        <PrimaryButton
          label="+ Add"
          compact
          onPress={() => router.push('/category/add')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyHeading, { color: colors.text }]}>No categories yet</Text>
            <Text style={[styles.emptyText, { color: colors.empty }]}>
              Create categories to organise your habits by theme or area of life.
            </Text>
          </View>
        ) : (
          categories.map((cat) => {
            const count = habits.filter((h) => h.categoryId === cat.id).length;
            return (
              <Pressable
                key={cat.id}
                accessibilityLabel={`${cat.name}, ${count} habit${count === 1 ? '' : 's'}, tap to edit`}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/category/[id]/edit',
                    params: { id: cat.id.toString() },
                  })
                }
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && styles.cardPressed,
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: cat.color + '22', borderColor: cat.color + '55' },
                  ]}
                >
                  <Text style={styles.icon}>{cat.icon}</Text>
                </View>

                <View style={styles.info}>
                  <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                  <Text style={[styles.catCount, { color: colors.textSecondary }]}>
                    {count} habit{count === 1 ? '' : 's'}
                  </Text>
                </View>

                <View style={[styles.colorBar, { backgroundColor: cat.color }]} />
              </Pressable>
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
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    paddingBottom: 32,
  },
  card: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  catName: {
    fontSize: 16,
    fontWeight: '700',
  },
  catCount: {
    fontSize: 13,
    marginTop: 2,
  },
  colorBar: {
    borderRadius: 3,
    height: 36,
    width: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
