import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import * as Speech from 'expo-speech';
import { InsightScreen } from '@/components/InsightScreen';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { fonts } from '@/constants/typography';
import { db } from '@/services/firebase';
import { useAccessibilityAnnouncement } from '@/context/accessibility-context';

type Course = {
  id: string;
  name: string;
  category?: string;
  level?: string;
  episodes?: number;
  description?: string;
};

const FALLBACK_COURSES: Course[] = [
  { id: '1', name: 'DSA Mastery', category: 'technical', level: 'Intermediate', episodes: 10, description: 'Core algorithms and data structures.' },
  { id: '2', name: 'Python Basics', category: 'technical', level: 'Beginner', episodes: 8, description: 'Programming fundamentals.' },
  { id: '3', name: 'Public Speaking', category: 'non-technical', level: 'Beginner', episodes: 6, description: 'Communicate with confidence.' },
];

export default function CoursesScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Announce the screen when focused
  useAccessibilityAnnouncement(
    'Courses and Audio Library. Navigate through the list and select a course to play its description.'
  );

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'courses'));
        const loaded: Course[] = [];
        snap.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<Course, 'id'>) });
        });
        setCourses(loaded.length > 0 ? loaded : FALLBACK_COURSES);
      } catch {
        setCourses(FALLBACK_COURSES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const playLesson = (course: Course) => {
    setActiveId(course.id);
    const text = `${course.name}. ${course.description ?? ''} Level ${course.level ?? 'all levels'}. ${course.episodes ?? 0} episodes.`;
    Speech.speak(text, {
      rate: 0.9,
      onDone: () => setActiveId(null),
      onStopped: () => setActiveId(null),
    });
  };

  return (
    <InsightScreen>
      <Text
        style={[styles.title, { color: c.text, fontFamily: fonts.bold }]}
        accessibilityRole="header"
      >
        Courses & audio
      </Text>
      <Text style={[styles.body, { color: c.textSecondary, fontFamily: fonts.regular }]}>
        Tap a course to hear an audio overview. Full lesson player syncs with the web app.
      </Text>

      {loading ? (
        <ActivityIndicator color={c.accent} size="large" style={{ marginTop: 24 }} />
      ) : (
        <View style={styles.list}>
          {courses.map((course) => (
            <Pressable
              key={course.id}
              onPress={() => playLesson(course)}
              accessibilityRole="button"
              accessibilityLabel={`${course.name}. ${course.level ?? ''}. ${course.episodes ?? 0} episodes. ${course.description ?? ''}`}
              accessibilityHint="Double tap to play the audio overview for this course"
              style={[
                styles.row,
                {
                  backgroundColor: c.surface,
                  borderColor: activeId === course.id ? c.accent : c.border,
                },
              ]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: c.text, fontFamily: fonts.bold }]}>
                  {course.name}
                </Text>
                <Text style={[styles.rowMeta, { color: c.textMuted, fontFamily: fonts.regular }]}>
                  {course.level ?? 'All levels'} · {course.episodes ?? 0} episodes · Audio
                </Text>
              </View>
              <Text style={{ color: c.accent, fontFamily: fonts.bold }}>
                {activeId === course.id ? 'Playing…' : 'Play'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </InsightScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  list: { gap: 12 },
  row: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowText: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 17 },
  rowMeta: { fontSize: 13 },
});
