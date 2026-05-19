import { Colors } from "../constants/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from 'expo-font';
import { useEffect } from "react";
import { SplashScreen, Stack } from 'expo-router';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: Colors.color.primary },
          headerTintColor: Colors.color.white,
        }}
      >
        <Stack.Screen
          name="(Auth)/LoginScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(attendee)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
