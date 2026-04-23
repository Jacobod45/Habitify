import { useThemeContext } from '@/context/theme-context';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

function TabIcon({ letter, focused }: { letter: string; focused: boolean }) {
  return (
    <View style={[styles.iconBox, focused ? styles.iconBoxActive : styles.iconBoxInactive]}>
      <Text style={[styles.letter, focused ? styles.letterActive : styles.letterInactive]}>
        {letter}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useThemeContext();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Habits',
          tabBarIcon: ({ focused }) => <TabIcon letter="H" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ focused }) => <TabIcon letter="C" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ focused }) => <TabIcon letter="I" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="targets"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon letter="P" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  iconBoxActive: {
    backgroundColor: '#F59E0B',
  },
  iconBoxInactive: {
    borderColor: '#9CA3AF',
    borderWidth: 1.5,
  },
  letter: {
    fontSize: 15,
    fontWeight: '700',
  },
  letterActive: {
    color: '#FFFFFF',
  },
  letterInactive: {
    color: '#9CA3AF',
  },
});
