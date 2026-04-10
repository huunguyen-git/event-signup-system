import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* 1. Các màn hình chính (Tabs) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* 2. Màn hình Chi tiết sự kiện (Màn hình nền) */}
        <Stack.Screen 
          name="event_details" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right' 
          }} 
        />

        {/* 3. Form Đăng ký (Hiện đè lên màn hình 1) */}
        <Stack.Screen 
          name="registration_form" 
          options={{ 
            presentation: 'transparentModal', // Hiệu ứng pop-up đè lên
            animation: 'fade',                // Hiện ra nhẹ nhàng
            headerShown: false 
          }} 
        />
        
        {/* 4. Thông báo Thành công (Hiện đè lên màn hình 1 hoặc 2) */}
        <Stack.Screen 
          name="success" 
          options={{ 
            presentation: 'transparentModal', 
            animation: 'fade',
            headerShown: false 
          }} 
        />

        {/* Modal mặc định của Expo */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}