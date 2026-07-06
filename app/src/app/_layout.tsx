import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';
import { Lato_400Regular, Lato_700Bold, Lato_300Light } from '@expo-google-fonts/lato';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';
import { useRouter, useSegments } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } },
});

function useProtectedRoute(isAuthenticated: boolean, isOnboarded: boolean) {
  const segments = useSegments();
  const router = useRouter();
  
  useEffect(() => {
    // Defer navigation to the next tick of the event loop to ensure layout has mounted
    const timeoutId = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!isAuthenticated) {
        if (!isOnboarded && segments[1] !== 'onboarding') {
          router.replace('/(auth)/onboarding');
        } else if (isOnboarded && !inAuthGroup) {
          router.replace('/(auth)/login');
        }
      } else {
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, isOnboarded, segments]);
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    Lato_400Regular,
    Lato_700Bold,
    Lato_300Light,
  });
  
  const { token, isOnboarded, initialize } = useAuthStore();
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    initialize();
  }, []);
  
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [fontsLoaded]);
  
  useProtectedRoute(!!token, isOnboarded);
  
  if (!fontsLoaded || !appReady) return null;
  
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="historia/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="leitor/[capituloId]" options={{ headerShown: false, animation: 'fade' }} />
      </Stack>
    </QueryClientProvider>
  );
}
