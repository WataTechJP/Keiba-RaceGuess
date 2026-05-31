import { Redirect, Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  Text,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

export default function TabsLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [showFriendsMenu, setShowFriendsMenu] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-green-600">
        <ActivityIndicator size="large" color="#f5faf7" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const IconSize = 28;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#8D6E63",
          tabBarInactiveTintColor: "#166534",
          tabBarShowLabel: false,
          headerShown: true,
          headerTintColor: "#fff",
          headerStyle: {
            backgroundColor: "#87CEEB",
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "#4CAF50",
            borderTopWidth: 1,
            elevation: 0,
            height: 64,
            paddingTop: 6,
            paddingBottom: 18,
          },
        }}
      >
        {/* ホーム */}
        <Tabs.Screen
          name="index"
          options={{
            title: "ホーム",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={IconSize} color={color} />
            ),
          }}
        />

        {/* フレンド（長押し対応） - 修正版 */}
        <Tabs.Screen
          name="friends"
          options={{
            title: "フレンド",
            headerShown: false,
            tabBarButton: (props: BottomTabBarButtonProps) => {
              const { ref, ...rest } = props as any;
              return (
                <Pressable
                  {...rest}
                  onLongPress={() => setShowFriendsMenu(true)}
                  style={[
                    rest.style,
                    {
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                />
              );
            },

            tabBarIcon: ({ color }) => (
              <Ionicons name="people" size={IconSize} color={color} />
            ),
          }}
        />

        {/* 投稿 */}
        <Tabs.Screen
          name="submit"
          options={{
            title: "投稿",
            tabBarIcon: ({ color }) => (
              <Ionicons name="add-circle" size={IconSize} color={color} />
            ),
          }}
        />

        {/* 結果 */}
        <Tabs.Screen
          name="results"
          options={{
            title: "結果・ランキング",
            tabBarIcon: ({ color }) => (
              <Ionicons name="trophy" size={IconSize} color={color} />
            ),
          }}
        />

        {/* プロフィール */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "マイページ",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="person" size={IconSize} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* 長押しメニュー（モーダル） */}
      <Modal
        visible={showFriendsMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFriendsMenu(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowFriendsMenu(false)}
        >
          <View
            className="absolute bottom-24 left-0 right-0 mx-4 bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            {/* マイフレンド */}
            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-gray-200"
              onPress={() => {
                setShowFriendsMenu(false);
                router.push("/(tabs)/friends");
              }}
            >
              <View className="w-12 h-12 rounded-full bg-keiba-100 items-center justify-center mr-3">
                <Ionicons name="people" size={24} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-text-primary">
                  マイフレンド
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* ルーム */}
            <TouchableOpacity
              className="flex-row items-center p-4"
              onPress={() => {
                setShowFriendsMenu(false);
                router.push("/(tabs)/friends/rooms");
              }}
            >
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="home" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-text-primary">
                  VIPルーム
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
