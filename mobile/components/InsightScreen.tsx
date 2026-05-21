import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function InsightScreen({ children }: PropsWithChildren) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Background Blobs */}
      <View
        style={[
          styles.blob,
          {
            backgroundColor: palette.tint,
            opacity: scheme === 'light' ? 0.08 : 0.15,
            top: -50,
            left: -50,
            width: SCREEN_WIDTH * 0.8,
            height: SCREEN_WIDTH * 0.8,
            borderRadius: SCREEN_WIDTH * 0.4,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            backgroundColor: '#ec4899', // Rose blob
            opacity: scheme === 'light' ? 0.05 : 0.1,
            bottom: 100,
            right: -100,
            width: SCREEN_WIDTH * 0.7,
            height: SCREEN_WIDTH * 0.7,
            borderRadius: SCREEN_WIDTH * 0.35,
          },
        ]}
      />

      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 24,
            paddingBottom: insets.bottom + 32,
          },
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    zIndex: -1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 24,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
});
