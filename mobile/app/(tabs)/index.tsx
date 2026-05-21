import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { InsightScreen } from '@/components/InsightScreen';
import { FeatureTile } from '@/components/ui/FeatureTile';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/context/auth-context';
import { useAccessibilityAnnouncement } from '@/context/accessibility-context';

export default function TodayScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const { profile } = useAuth();

  const firstName = profile?.displayName?.split(' ')[0] ?? 'Learner';

  // Announce the screen when focused
  useAccessibilityAnnouncement(
    `Home screen, Learning Hub. Hello ${firstName}. You can explore pronunciation drills, courses, games, or the community.`
  );

  return (
    <InsightScreen>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: c.textMuted, fontFamily: fonts.medium }]}>
            Hello, {firstName}
          </Text>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: c.text, fontFamily: fonts.bold }]}
          >
            Your learning hub
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile and settings"
          accessibilityHint="Double tap to open profile, voice guidance toggle, or sign out"
          style={[styles.logoutBtn, { borderColor: c.border }]}
        >
          <FontAwesome name="user-circle" size={20} color={c.textSecondary} />
        </Pressable>
      </View>


      <Text style={[styles.lede, { color: c.textSecondary, fontFamily: fonts.regular }]}>
        Vocational audio courses, pronunciation drills, and mind games — built for accessibility first.
      </Text>

      <View style={styles.grid}>
        <FeatureTile
          title="Pronunciation"
          subtitle="Listen, record, and compare your voice"
          icon="microphone"
          colors={c}
          onPress={() => router.push('/(tabs)/coach')}
        />
        <FeatureTile
          title="Courses"
          subtitle="Audio lessons with quizzes"
          icon="headphones"
          colors={c}
          onPress={() => router.push('/(tabs)/courses')}
        />
        <FeatureTile
          title="Mind games"
          subtitle="Story adventures"
          icon="gamepad"
          colors={c}
          onPress={() => router.push('/games/story')}
        />
        <FeatureTile
          title="Community"
          subtitle="AI learning companion Mitra"
          icon="users"
          colors={c}
          onPress={() => router.push('/(tabs)/community')}
        />
      </View>

      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.cardTitle, { color: c.text, fontFamily: fonts.bold }]}>
          Accessibility built in
        </Text>
        <Bullet text="Lexend typography for legibility" colors={c} />
        <Bullet text="Screen reader labels on every action" colors={c} />
        <Bullet text="High contrast indigo and rose palette" colors={c} />
      </View>
    </InsightScreen>
  );
}

function Bullet({ text, colors }: { text: string; colors: (typeof Colors)['light'] }) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.dot, { backgroundColor: colors.accent }]} />
      <Text style={[styles.bulletText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  greeting: { fontSize: 14, marginBottom: 4 },
  title: { fontSize: 30, letterSpacing: -0.5 },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lede: { fontSize: 16, lineHeight: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  cardTitle: { fontSize: 18 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  bulletText: { flex: 1, fontSize: 15 },
});
