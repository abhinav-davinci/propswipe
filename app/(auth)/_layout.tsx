import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="guest-preview" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="otp-verify" />
    </Stack>
  );
}
