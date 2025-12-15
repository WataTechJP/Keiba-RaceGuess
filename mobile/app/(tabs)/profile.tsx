import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-transparent">
      {/* プロフィールヘッダー */}
      <View className="bg-transparent items-center py-8 border-b border-gray-200">
        <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
          <Ionicons name="person" size={60} color="#9ca3af" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          {user?.username || "ユーザー名"}
        </Text>
        <Text className="text-sm text-gray-500 text-center px-8">
          競馬予想を楽しんでいます！
        </Text>
      </View>

      {/* 統計情報 */}
      <View className="flex-row bg-white mt-4 py-5 border-t border-b border-gray-200">
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-1">0</Text>
          <Text className="text-xs text-gray-500">予想数</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-1">0</Text>
          <Text className="text-xs text-gray-500">的中数</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-1">0</Text>
          <Text className="text-xs text-gray-500">ポイント</Text>
        </View>
      </View>

      {/* メニューリスト */}
      <View className="mt-4 bg-white border-t border-b border-gray-200">
        <TouchableOpacity className="flex-row items-center py-4 px-5 border-b border-gray-100">
          <Ionicons name="settings-outline" size={24} color="#374151" />
          <Text className="flex-1 text-base text-gray-700 ml-4">設定</Text>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-4 px-5 border-b border-gray-100">
          <Ionicons name="notifications-outline" size={24} color="#374151" />
          <Text className="flex-1 text-base text-gray-700 ml-4">通知設定</Text>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-4 px-5 border-b border-gray-100">
          <Ionicons name="help-circle-outline" size={24} color="#374151" />
          <Text className="flex-1 text-base text-gray-700 ml-4">ヘルプ</Text>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 px-5"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text className="flex-1 text-base text-red-500 ml-4">ログアウト</Text>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
