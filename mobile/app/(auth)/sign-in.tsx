import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { InsightScreen } from '@/components/InsightScreen';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/context/auth-context';

export default function SignInScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InsightScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrap}
      >
        <Text style={[styles.title, { color: c.text, fontFamily: fonts.bold }]}>
          Welcome back
        </Text>
        <Text style={[styles.subtitle, { color: c.textSecondary, fontFamily: fonts.regular }]}>
          Sign in to continue your learning journey.
        </Text>

        {error ? (
          <Text style={[styles.error, { fontFamily: fonts.medium }]} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textMuted, fontFamily: fonts.medium }]}>
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            accessibilityLabel="Email address"
            style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.surface }]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textMuted, fontFamily: fonts.medium }]}>
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            accessibilityLabel="Password"
            style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.surface }]}
          />
        </View>

        <Button label="Sign in" onPress={handleSubmit} loading={loading} colors={c} />

        <Text style={[styles.footer, { color: c.textSecondary, fontFamily: fonts.regular }]}>
          New here?{' '}
          <Text
            onPress={() => router.push('/(auth)/sign-up')}
            style={{ color: c.accent, fontFamily: fonts.bold }}
            accessibilityRole="link"
          >
            Create account
          </Text>
        </Text>
      </KeyboardAvoidingView>
    </InsightScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16, paddingTop: 24 },
  title: { fontSize: 32 },
  subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
  error: { color: '#e11d48', fontSize: 14 },
  field: { gap: 8 },
  label: { fontSize: 13 },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  footer: { textAlign: 'center', marginTop: 16, fontSize: 15 },
});
