import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { Stack } from 'expo-router';
import { InsightScreen } from '@/components/InsightScreen';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { fonts } from '@/constants/typography';

type Scene = {
  text: string;
  choices?: { label: string; next: number }[];
};

const STORY: Scene[] = [
  {
    text: 'You enter a quiet library where every book whispers its title aloud. A mentor asks: do you explore science or art first?',
    choices: [
      { label: 'Science wing', next: 1 },
      { label: 'Art gallery', next: 2 },
    ],
  },
  {
    text: 'In the science wing, you build a tiny robot that reads equations aloud. It thanks you and offers a puzzle about patterns.',
    choices: [{ label: 'Solve the puzzle', next: 3 }],
  },
  {
    text: 'In the gallery, colors have sounds. You paint a melody that helps a friend find their way through the maze of halls.',
    choices: [{ label: 'Guide your friend', next: 3 }],
  },
  {
    text: 'You succeed! The library celebrates with a chorus of turning pages. Lesson learned: curiosity connects every path.',
  },
];

export default function StoryScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = STORY[sceneIndex];

  const narrate = (text: string) => {
    Speech.stop();
    Speech.speak(text, { rate: 0.88 });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Story Adventure' }} />
      <InsightScreen>
        <Text
          style={[styles.title, { color: c.text, fontFamily: fonts.bold }]}
          accessibilityRole="header"
        >
          Story adventure
        </Text>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text
            style={[styles.story, { color: c.text, fontFamily: fonts.regular }]}
            accessibilityLabel={scene.text}
          >
            {scene.text}
          </Text>
          <Pressable
            onPress={() => narrate(scene.text)}
            accessibilityRole="button"
            accessibilityLabel="Listen to story"
            style={[styles.listenBtn, { backgroundColor: c.accentMuted }]}
          >
            <Text style={{ color: c.accent, fontFamily: fonts.bold }}>Listen</Text>
          </Pressable>
        </View>

        {scene.choices?.map((choice) => (
          <Pressable
            key={choice.label}
            onPress={() => {
              narrate(STORY[choice.next].text);
              setSceneIndex(choice.next);
            }}
            accessibilityRole="button"
            accessibilityLabel={choice.label}
            style={[styles.choice, { borderColor: c.border, backgroundColor: c.surface }]}
          >
            <Text style={{ color: c.text, fontFamily: fonts.semibold }}>{choice.label}</Text>
          </Pressable>
        ))}

        {sceneIndex === STORY.length - 1 && (
          <Pressable
            onPress={() => setSceneIndex(0)}
            accessibilityRole="button"
            accessibilityLabel="Play again"
            style={[styles.choice, { borderColor: c.accent, backgroundColor: c.accentMuted }]}
          >
            <Text style={{ color: c.accent, fontFamily: fonts.bold }}>Play again</Text>
          </Pressable>
        )}
      </InsightScreen>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26 },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  story: { fontSize: 17, lineHeight: 28 },
  listenBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  choice: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
});
