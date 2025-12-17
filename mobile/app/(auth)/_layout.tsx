import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ presentation: "modal" }}>
      <Stack.Screen name="login" options={{ title: "ログイン" }} />
      <Stack.Screen name="register" options={{ title: "サインアップ" }} />
    </Stack>
  );
}
