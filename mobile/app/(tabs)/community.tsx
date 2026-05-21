import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { InsightScreen } from '@/components/InsightScreen';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { fonts } from '@/constants/typography';

const MITRA_REPLIES = [
  "That's a great question! Keep practicing pronunciation daily.",
  "Remember: take your time. Clarity matters more than speed.",
  "You're making progress. Would you like a course recommendation?",
];

export default function CommunityScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [message, setMessage] = useState('');
  const [thread, setThread] = useState<{ role: 'user' | 'mitra'; text: string }[]>([
    { role: 'mitra', text: "Hi! I'm Mitra, your learning companion. How can I help today?" },
  ]);

  const send = () => {
    if (!message.trim()) return;
    const userText = message.trim();
    setThread((prev) => [
      ...prev,
      { role: 'user', text: userText },
      { role: 'mitra', text: MITRA_REPLIES[thread.length % MITRA_REPLIES.length] },
    ]);
    setMessage('');
  };

  return (
    <InsightScreen>
      <Text
        style={[styles.title, { color: c.text, fontFamily: fonts.bold }]}
        accessibilityRole="header"
      >
        Community
      </Text>
      <Text style={[styles.body, { color: c.textSecondary, fontFamily: fonts.regular }]}>
        Chat with Mitra, your AI learning companion. Live peer rooms connect in a future release.
      </Text>

      <View style={[styles.chat, { backgroundColor: c.surface, borderColor: c.border }]}>
        {thread.map((item, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              item.role === 'user'
                ? { alignSelf: 'flex-end', backgroundColor: c.accent }
                : { alignSelf: 'flex-start', backgroundColor: c.accentMuted },
            ]}
            accessibilityLabel={`${item.role === 'user' ? 'You' : 'Mitra'}: ${item.text}`}
          >
            <Text
              style={[
                styles.bubbleText,
                {
                  color: item.role === 'user' ? c.accentFg : c.text,
                  fontFamily: fonts.regular,
                },
              ]}
            >
              {item.text}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message Mitra…"
          placeholderTextColor={c.textMuted}
          accessibilityLabel="Message input"
          style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.surface }]}
        />
        <Button label="Send" onPress={send} colors={c} style={{ minWidth: 88 }} />
      </View>
    </InsightScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  chat: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    minHeight: 280,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
