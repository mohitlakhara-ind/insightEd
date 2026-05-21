import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthRedirect } from '@/components/AuthRedirect';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/context/auth-context';
import { AccessibilityProvider } from '@/context/accessibility-context';
import { insightDarkNavigation, insightLightNavigation } from '@/constants/navigationTheme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme =
    colorScheme === 'dark' ? insightDarkNavigation : insightLightNavigation;

  return (
    <ThemeProvider value={theme}>
      <AuthRedirect />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="games/story"
          options={{ title: 'Story Adventure', presentation: 'card' }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'About InsightEd' }}
        />
        <Stack.Screen
          name="profile"
          options={{ presentation: 'modal', title: 'Profile & Settings' }}
        />
      </Stack>
    </ThemeProvider>
  );
}

