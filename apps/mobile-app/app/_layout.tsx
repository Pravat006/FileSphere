import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';
import '../global.css';
import '@/lib/firebase';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { AuthProvider, useAuth } from '../context/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutClient() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  React.useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inVerifyEmail = segments[1] === 'verify-email';

    if (!user && !inAuthGroup && !inOnboarding) {
      router.replace('/(auth)/login');
    } else if (user) {
      if (!user.emailVerified && !inVerifyEmail) {
        router.replace('/(auth)/verify-email');
      } else if (user.emailVerified && (inAuthGroup || inOnboarding)) {
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutClient />
    </AuthProvider>
  );
}
