import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useAuth } from '@/context/auth-context';
import { useThemeContext } from '@/context/theme-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useThemeContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    const success = await login(email.trim(), password);
    setLoading(false);
    if (!success) setError('Invalid email or password');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.safeArea }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoRow}>
          <Text style={styles.logo}>🌱</Text>
        </View>

        <ScreenHeader title="Welcome back" subtitle="Log in to Habit Tracker" />

        <View style={styles.form}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton label={loading ? 'Logging in…' : 'Log In'} onPress={handleLogin} />

        <View style={[styles.hint, { backgroundColor: colors.hintBg }]}>
          <Text style={[styles.hintText, { color: colors.hintText }]}>
            Demo account: demo@example.com / demo1234
          </Text>
        </View>

        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: colors.textSecondary }]}>
            No account yet?
          </Text>
          <PrimaryButton
            label="Register"
            variant="secondary"
            compact
            onPress={() => router.push('/register')}
          />
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
    paddingBottom: 24,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 24,
  },
  logo: {
    fontSize: 56,
  },
  form: {
    marginBottom: 6,
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  hint: {
    borderRadius: 10,
    marginTop: 12,
    padding: 12,
  },
  hintText: {
    fontSize: 13,
    textAlign: 'center',
  },
  registerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
  },
});
