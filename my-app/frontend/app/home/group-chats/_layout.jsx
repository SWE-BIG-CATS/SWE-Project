import { Stack } from 'expo-router';

export default function GroupChatsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="[chatId]/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="[chatId]/edit" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="[chatId]/add-people" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="[chatId]/more" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

