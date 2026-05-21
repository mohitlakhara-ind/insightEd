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

export default function SignUpScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign up failed.');
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
          Create account
        </Text>
        <Text style={[styles.subtitle, { color: c.textSecondary, fontFamily: fonts.regular }]}>
          Start your accessibility-first learning profile.
        </Text>

        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        {(['Name', 'Email', 'Password'] as const).map((field) => (
          <View key={field} style={styles.field}>
            <Text style={[styles.label, { color: c.textMuted, fontFamily: fonts.medium }]}>
              {field}
            </Text>
            <TextInput
              value={field === 'Name' ? name : field === 'Email' ? email : password}
              onChangeText={
                field === 'Name' ? setName : field === 'Email' ? setEmail : setPassword
              }
              secureTextEntry={field === 'Password'}
              autoCapitalize={field === 'Email' ? 'none' : 'words'}
              keyboardType={field === 'Email' ? 'email-address' : 'default'}
              accessibilityLabel={field}
              style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.surface }]}
            />
          </View>
        ))}

        <Button label="Create account" onPress={handleSubmit} loading={loading} colors={c} />

        <Text style={[styles.footer, { color: c.textSecondary, fontFamily: fonts.regular }]}>
          Already have an account?{' '}
          <Text
            onPress={() => router.push('/(auth)/sign-in')}
            style={{ color: c.accent, fontFamily: fonts.bold }}
            accessibilityRole="link"
          >
            Sign in
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
