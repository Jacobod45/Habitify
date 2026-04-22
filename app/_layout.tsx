import { AppProvider } from '@/context/app-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { seedIfEmpty } from '@/db/seed';
import { requestNotificationPermissions } from '@/services/notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

function AppProviderWithSeed({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void seedIfEmpty();
    void requestNotificationPermissions();
  }, []);

  return <AppProvider>{children}</AppProvider>;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProviderWithSeed>
          <RootNavigator />
        </AppProviderWithSeed>
      </AuthProvider>
    </ThemeProvider>
  );
}
