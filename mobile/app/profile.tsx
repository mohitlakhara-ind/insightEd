import { Switch, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useAccessibility, useAccessibilityAnnouncement } from '@/context/accessibility-context';
import { InsightScreen } from '@/components/InsightScreen';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { fonts } from '@/constants/typography';
import { Button } from '@/components/ui/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const { profile, signOutUser } = useAuth();
  const { voiceGuidance, setVoiceGuidance, speak } = useAccessibility();

  // Announce the screen when focused
  useAccessibilityAnnouncement(
    'Profile and accessibility settings page. Here you can toggle voice guidance, view your account details, or sign out.'
  );

  const initials = profile?.displayName
    ? profile.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'LE';

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  const roleText = profile?.role === 'educator' ? 'Educator' : 'Student';

  const handleHearDetails = () => {
    const detailsText = `Profile overview. Name: ${profile?.displayName ?? 'Learner'}. Email: ${
      profile?.email ?? 'Not set'
    }. Role: ${roleText}. Member since: ${memberSince}.`;
    speak(detailsText);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.replace('/(auth)/sign-in');
    } catch (err) {
      console.warn('Sign out failed:', err);
    }
  };

  return (
    <InsightScreen>
      <View style={styles.container}>
        {/* User Card */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.headerRow}>
            <View
              style={[styles.avatar, { backgroundColor: c.accent }]}
              accessibilityLabel={`Profile initials badge: ${initials}`}
              accessibilityRole="image"
            >
              <Text style={[styles.avatarText, { color: c.accentFg, fontFamily: fonts.bold }]}>
                {initials}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.displayName, { color: c.text, fontFamily: fonts.bold }]}>
                {profile?.displayName ?? 'Learner'}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: profile?.role === 'educator' ? '#ecfdf5' : c.accentMuted,
                    borderColor: profile?.role === 'educator' ? '#10b981' : c.accent,
                  },
                ]}
                accessibilityLabel={`Role: ${roleText}`}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: profile?.role === 'educator' ? '#047857' : c.accent,
                      fontFamily: fonts.semibold,
                    },
                  ]}
                >
                  {roleText}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          <View style={styles.detailsList}>
            <DetailItem label="Email" value={profile?.email ?? 'N/A'} colors={c} />
            <DetailItem label="Member since" value={memberSince} colors={c} />
          </View>

          <Pressable
            onPress={handleHearDetails}
            accessibilityRole="button"
            accessibilityLabel="Hear profile overview"
            accessibilityHint="Double tap to have the speech assistant read your profile details aloud."
            style={({ pressed }) => [
              styles.hearBtn,
              { backgroundColor: c.accentMuted, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <FontAwesome name="volume-up" size={16} color={c.accent} />
            <Text style={[styles.hearBtnText, { color: c.accent, fontFamily: fonts.bold }]}>
              Hear profile overview
            </Text>
          </Pressable>
        </View>

        {/* Accessibility Card */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.sectionTitle, { color: c.text, fontFamily: fonts.bold }]}>
            Accessibility settings
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={[styles.settingLabel, { color: c.text, fontFamily: fonts.semibold }]}>
                Voice Guidance
              </Text>
              <Text style={[styles.settingDesc, { color: c.textSecondary, fontFamily: fonts.regular }]}>
                Automatically read screens and instructions aloud using voice assistant
              </Text>
            </View>
            <Switch
              value={voiceGuidance}
              onValueChange={setVoiceGuidance}
              trackColor={{ false: c.border, true: c.accent }}
              thumbColor={voiceGuidance ? c.accentFg : '#f4f3f4'}
              accessibilityLabel="Voice Guidance toggle switch"
              accessibilityHint="Double tap to toggle automatic in-app voice narration"
            />
          </View>
        </View>

        {/* Sign Out Action */}
        <Button
          label="Sign out"
          variant="danger"
          colors={c}
          onPress={handleSignOut}
          accessibilityLabel="Sign out of your account"
          accessibilityHint="Double tap to log out and return to the login screen"
          style={styles.signOutBtn}
        />
      </View>
    </InsightScreen>
  );
}

function DetailItem({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={styles.detailRow} accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: colors.text, fontFamily: fonts.semibold }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  displayName: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 15,
  },
  hearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    marginTop: 8,
  },
  hearBtnText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    letterSpacing: -0.2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  settingMeta: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontSize: 15,
  },
  settingDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  signOutBtn: {
    marginTop: 8,
    height: 54, // Large touch target
  },
});
