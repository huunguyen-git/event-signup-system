import { Stack } from "expo-router";

export default function AttendeeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="EditProfileScreen" />
      <Stack.Screen name="ChangePasswordScreen" />
    </Stack>
  );
}
