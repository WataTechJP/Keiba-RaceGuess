import { Stack } from "expo-router";
import { AuthProvider } from "../src/contexts/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
