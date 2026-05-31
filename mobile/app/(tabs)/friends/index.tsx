import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "../../../src/api/client";
import type { User } from "@/types/friends";

export default function MyFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [followedUserIds, setFollowedUserIds] = useState<number[]>([]);
  const [showAllFollowing, setShowAllFollowing] = useState(false);

  const loadFollowing = useCallback(async () => {
    try {
      setFollowingLoading(true);
      const response = await api.get("/api/friends/following/");
      setFollowing(response.data.following || []);
    } catch (error) {
      console.error("Error loading following:", error);
    } finally {
      setFollowingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowing();
  }, [loadFollowing]);

  useEffect(() => {
    const q = searchQuery.trim();

    // 検索文字が空になったら「最初の画面」に戻す
    if (q.length === 0) {
      setHasSearched(false);
      setUsers([]);
      setFollowedUserIds([]);
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  const fetchUsers = async () => {
    const q = searchQuery.trim();

    // 空なら初期画面に戻して終わり
    if (!q) {
      setHasSearched(false);
      setUsers([]);
      setFollowedUserIds([]);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      const response = await api.get("/api/friends/search/", {
        params: { search: q },
      });

      setUsers(response.data.users || []);
      setFollowedUserIds(response.data.followed_users || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      await api.post(`/api/friends/${userId}/follow/`);
      await loadFollowing();

      // 検索中だけ、検索結果を更新（ただし空ならやらない）
      if (hasSearched && searchQuery.trim()) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await api.post(`/api/friends/${userId}/unfollow/`);
      await loadFollowing(); // Reload following list
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const confirmUnfollow = (userId: number, username?: string) => {
    Alert.alert(
      "フォロー解除しますか？",
      username
        ? `${username} のフォローを解除します。`
        : "フォローを解除します。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "解除する",
          style: "destructive",
          onPress: () => handleUnfollow(userId),
        },
      ]
    );
  };

  const openUserPredictions = (user: User) => {
    router.push({
      pathname: "/(tabs)/friends/[userId]",
      params: {
        userId: String(user.id),
        username: user.username,
      },
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadFollowing();
      if (hasSearched) {
        await fetchUsers();
      }
    } finally {
      setRefreshing(false);
    }
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
            autoCapitalize="none"
          />
        </View>
      </View>
      {/* フォロー中のフレンド */}
      {!hasSearched && (
        <>
          <View className="bg-white mx-4 mt-3 rounded-t-2xl px-5 py-2 shadow-lg">
            <Text className="text-base font-bold text-text-primary">
              フォロー中{" "}
              <Text className="text-sm font-normal text-text-secondary">
                ({following.length}件)
              </Text>
            </Text>
          </View>
          {followingLoading ? (
            <View className="bg-white mx-4 rounded-b-2xl p-8 items-center shadow-lg mb-3">
              <ActivityIndicator size="large" color="#22c55e" />
            </View>
          ) : following.length === 0 ? (
            <View className="bg-white mx-4 rounded-b-2xl p-6 items-center shadow-lg mb-3">
              <Text className="text-3xl mb-2">👥</Text>
              <Text className="text-base font-bold text-text-primary mb-1">
                まだフォローしていません
              </Text>
              <Text className="text-sm text-text-secondary text-center">
                下の検索バーでユーザーを探してフォローしましょう
              </Text>
            </View>
          ) : (
            <View className="bg-white mx-4 rounded-b-2xl shadow-lg mb-3 overflow-hidden">
              {(showAllFollowing ? following : following.slice(0, 5)).map((item) => (
                <TouchableOpacity
                  key={item.id.toString()}
                  className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
                  activeOpacity={0.75}
                  onPress={() => openUserPredictions(item)}
                >
                  <View className="flex-row items-center flex-1">
                    {item.profile_image_url ? (
                      <Image
                        source={{ uri: item.profile_image_url }}
                        className="w-10 h-10 rounded-full border border-border-light"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-keiba-100 border border-border-light items-center justify-center">
                        <Ionicons name="person" size={20} color="#16a34a" />
                      </View>
                    )}
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-bold text-text-primary">
                        {item.username}{" "}
                        <Text className="text-xs font-normal text-text-secondary">
                          ({item.predictions_count || 0}件)
                        </Text>
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#9ca3af"
                    style={{ marginRight: 8 }}
                  />
                  <TouchableOpacity
                    className="bg-gray-200 px-3 py-1.5 rounded-xl"
                    onPress={(event) => {
                      event.stopPropagation();
                      confirmUnfollow(item.id, item.username);
                    }}
                  >
                    <Text className="text-gray-600 font-bold text-xs">
                      解除
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              {!showAllFollowing && following.length > 5 && (
                <TouchableOpacity
                  className="flex-row items-center justify-center py-3"
                  onPress={() => setShowAllFollowing(true)}
                >
                  <Text className="text-sm text-keiba-600 font-bold">
                    全{following.length}件の一覧はこちら
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#16a34a" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}

      {/* ユーザーリスト */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : !hasSearched ? (
        <View className="bg-white mx-4 mt-4 rounded-2xl p-8 items-center shadow-lg">
          <Text className="text-4xl mb-3">🔍</Text>
          <Text className="text-xl font-bold text-text-primary mb-2">
            ユーザーを検索
          </Text>
          <Text className="text-sm text-text-secondary text-center">
            検索バーでユーザー名またはメールアドレスを入力してください
          </Text>
        </View>
      ) : users.length === 0 ? (
        <View className="bg-white mx-4 mt-4 rounded-2xl p-8 items-center shadow-lg">
          <Text className="text-4xl mb-3">👥</Text>
          <Text className="text-xl font-bold text-text-primary mb-2">
            ユーザーが見つかりません
          </Text>
          <Text className="text-sm text-text-secondary text-center">
            「{searchQuery}」に一致するユーザーがいません
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
                {followedUserIds.includes(item.id) ? (
                  <View className="bg-gray-300 px-4 py-2 rounded-xl">
                    <Text className="text-gray-600 font-bold text-sm">
                      フォロー中
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="bg-keiba-500 px-4 py-2 rounded-xl"
                    onPress={() => handleFollow(item.id)}
                  >
                    <Text className="text-white font-bold text-sm">
                      フォロー
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
