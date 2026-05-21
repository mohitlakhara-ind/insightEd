import { StatusBar } from 'expo-status-bar';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { fonts } from '@/constants/typography';

export default function ModalScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.title, { color: c.text, fontFamily: fonts.bold }]}>
        InsightEd
      </Text>
      <Text
        style={[
          styles.body,
          { color: c.textSecondary, fontFamily: fonts.regular },
        ]}
      >
        This React Native client is the companion to the Next.js web experience.
        Continue the mission from the open-source lineage on GitHub while you wire
        Firebase auth, courses, and live sessions.
      </Text>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Open InsightEd repository on GitHub"
        onPress={() =>
          Linking.openURL('https://github.com/lagan1/InsightEd')
        }
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: c.accent,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={[styles.buttonLabel, { color: c.accentFg, fontFamily: fonts.semibold }]}>
          View lagan1/InsightEd
        </Text>
      </Pressable>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 16,
  },
});
