import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { InsightScreen } from '@/components/InsightScreen';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { fonts } from '@/constants/typography';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { AudioService } from '@/lib/audio';
import { fetchPronunciationQuotes } from '@/lib/pronunciation-quotes';
import { useAccessibilityAnnouncement } from '@/context/accessibility-context';

export default function CoachScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [quotes, setQuotes] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    isRecording,
    uri,
    isPlaying,
    startRecording,
    stopRecording,
    playRecording,
    resetRecording,
  } = useAudioRecorder();

  // Announce the screen when focused
  useAccessibilityAnnouncement(
    'Pronunciation Coach screen. Practice English phrases. Use the buttons below to listen to the phrase, record your practice session, and play back your voice.'
  );

  useEffect(() => {
    fetchPronunciationQuotes().then((q) => {
      setQuotes(q);
      setLoading(false);
    });
  }, []);

  const quote = quotes[index] ?? '';

  const handleRecord = async () => {
    setError('');
    try {
      if (isRecording) await stopRecording();
      else await startRecording();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Recording failed.');
    }
  };

  const handleNext = async () => {
    await resetRecording();
    if (index < quotes.length - 1) setIndex((i) => i + 1);
    else setIndex(0);
  };

  if (loading) {
    return (
      <InsightScreen>
        <ActivityIndicator color={c.accent} size="large" style={{ marginTop: 48 }} />
      </InsightScreen>
    );
  }

  return (
    <InsightScreen>
      <Text
        style={[styles.title, { color: c.text, fontFamily: fonts.bold }]}
        accessibilityRole="header"
      >
        Pronunciation coach
      </Text>

      <View style={[styles.quoteCard, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.phase, { color: c.accent, fontFamily: fonts.semibold }]}>
          Phase {index + 1} of {quotes.length}
        </Text>
        <Text
          style={[styles.quote, { color: c.text, fontFamily: fonts.medium }]}
          accessibilityLabel={`Practice phrase: ${quote}`}
        >
          "{quote}"
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.controls}>
        <ControlBtn
          label="Listen"
          icon="volume-up"
          colors={c}
          accessibilityHint="Hear the correct pronunciation of the phrase read aloud"
          onPress={() => AudioService.speak(quote)}
        />
        <ControlBtn
          label={isRecording ? 'Stop' : 'Record'}
          icon={isRecording ? 'stop' : 'microphone'}
          colors={c}
          active={isRecording}
          accessibilityHint={isRecording ? "Stop recording your voice" : "Start recording your voice using the microphone"}
          onPress={handleRecord}
        />
        <ControlBtn
          label={isPlaying ? 'Playing' : 'Playback'}
          icon="play"
          colors={c}
          disabled={!uri}
          accessibilityHint="Play back your last recording to compare"
          onPress={playRecording}
        />
        <ControlBtn
          label="Next"
          icon="arrow-right"
          colors={c}
          accessibilityHint="Skip to the next practice phrase"
          onPress={handleNext}
        />
      </View>

      <View style={styles.dots}>
        {quotes.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? c.accent : c.border,
                width: i === index ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      <Button label="Stop speech" variant="secondary" colors={c} onPress={() => AudioService.stop()} />
    </InsightScreen>
  );
}

function ControlBtn({
  label,
  icon,
  colors,
  onPress,
  disabled,
  active,
  accessibilityHint,
}: {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  colors: (typeof Colors)['light'];
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={[
        styles.control,
        {
          backgroundColor: active ? colors.accentMuted : colors.surface,
          borderColor: colors.border,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <FontAwesome name={icon} size={22} color={colors.accent} />
      <Text style={[styles.controlLabel, { color: colors.text, fontFamily: fonts.semibold }]}>
        {label}
      </Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  title: { fontSize: 28 },
  quoteCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  phase: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  quote: { fontSize: 22, lineHeight: 32 },
  error: { color: '#e11d48', fontSize: 14 },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  control: {
    width: '47%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: { fontSize: 13 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4 },
});
