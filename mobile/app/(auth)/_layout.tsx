import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Keiba Battle",
          headerShown: true, // ← ヘッダーを出す場合
        }}
      />
      <Stack.Screen name="login" options={{ title: "ログイン" }} />
    </Stack>
  );
}
