import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../src/api/client";

interface User {
  id: number;
  username: string;
  profile_image_url?: string;
  predictions_count?: number;
}

export default function MyFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/users/search/", {
        params: { q: searchQuery },
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      await api.post("/api/follows/", { followed_user_id: userId });
      fetchUsers();
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  return (
    <View className="flex-1 bg-transparent">
      {/* 検索バー */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-lg">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base text-text-primary"
            placeholder="ユーザーを検索..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchUsers}
          />
        </View>
      </View>

      {/* ユーザーリスト */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : users.length === 0 ? (
        <View className="bg-white mx-4 mt-4 rounded-2xl p-8 items-center shadow-lg">
          <Text className="text-6xl mb-4">👥</Text>
          <Text className="text-xl font-bold text-text-primary mb-2">
            ユーザーが見つかりません
          </Text>
          <Text className="text-sm text-text-secondary text-center">
            検索バーでユーザー名を入力してください
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 96,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  {/* プロフィール画像 */}
                  {item.profile_image_url ? (
                    <Image
                      source={{ uri: item.profile_image_url }}
                      className="w-12 h-12 rounded-full border border-border-light"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-keiba-100 border border-border-light items-center justify-center">
                      <Ionicons name="person" size={24} color="#16a34a" />
                    </View>
                  )}
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-bold text-text-primary">
                      {item.username}
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      {item.predictions_count || 0} 予想
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-keiba-500 px-4 py-2 rounded-xl"
                  onPress={() => handleFollow(item.id)}
                >
                  <Text className="text-white font-bold text-sm">フォロー</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
