import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.tabIconSelected,
        tabBarInactiveTintColor: palette.tabIconDefault,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
        headerTintColor: palette.text,
        headerStyle: { backgroundColor: palette.surface },
        headerShown: useClientOnlyValue(false, true),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 14 }}>
            <Pressable
              onPress={() => router.push('/modal')}
              accessibilityRole="button"
              accessibilityLabel="About InsightEd"
              accessibilityHint="Double tap to open about page"
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                padding: 4, // Exceed target size
              })}
            >
              <FontAwesome name="info-circle" size={22} color={palette.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/profile')}
              accessibilityRole="button"
              accessibilityLabel="User profile and accessibility settings"
              accessibilityHint="Double tap to open profile, voice guidance toggle, or sign out"
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                padding: 4, // Exceed target size
              })}
            >
              <FontAwesome name="user-circle" size={22} color={palette.text} />
            </Pressable>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home, learning hub',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="home" color={color} />
          ),
          headerTitle: 'InsightEd',
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarAccessibilityLabel: 'Courses and audio library',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="headphones" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarLabel: 'Coach',
          tabBarAccessibilityLabel: 'Pronunciation coach',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="microphone" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarAccessibilityLabel: 'Community and mentors',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="users" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

