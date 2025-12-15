import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text as RNText, View } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { Colors } from "../../src/constants/colors";

export default function TabsLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "#22c55e",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "ホーム",
          tabBarIcon: ({ color }) => (
            <RNText style={{ fontSize: 24, color }}>🏠</RNText>
          ),
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: "投稿",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="predictions"
        options={{
          title: "予想一覧",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarIcon: ({ color }) => (
            <RNText style={{ fontSize: 24, color }}>🏠</RNText>
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: "タイムライン",
          tabBarIcon: ({ color }) => (
            <RNText style={{ fontSize: 24, color }}>🕒</RNText>
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "フレンド",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
