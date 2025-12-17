import { Stack } from "expo-router";

export default function FriendsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: "#fff",
        headerStyle: {
          backgroundColor: "#87CEEB",
        },
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "マイフレンド",
        }}
      />
      <Stack.Screen
        name="rooms"
        options={{
          title: "VIPルーム",
        }}
      />
    </Stack>
  );
}
