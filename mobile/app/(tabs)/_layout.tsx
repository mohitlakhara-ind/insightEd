import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

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
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/modal')}
              accessibilityRole="button"
              accessibilityLabel="About InsightEd"
              style={{ marginRight: 16 }}
            >
              {({ pressed }) => (
                <FontAwesome
                  name="info-circle"
                  size={22}
                  color={palette.text}
                  style={{ opacity: pressed ? 0.6 : 1 }}
                />
              )}
            </Pressable>
          ),
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
