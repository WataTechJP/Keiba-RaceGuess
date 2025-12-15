// app/(tabs)/friends.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  FlatList,
  Text,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { SearchForm } from "../../src/components/friends/SearchForm";
import { UserCard } from "../../src/components/friends/UserCard";
import { EmptyState } from "../../src/components/friends/EmptyState";
import { Colors } from "../../src/constants/colors";
import client from "../../src/api/client";
import type { User } from "../../src/types/friends";

export default function FriendsScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [followedUsers, setFollowedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 初期データ読み込み（フォロー中のユーザー）
  useEffect(() => {
    loadFollowedUsers();
  }, []);

  const loadFollowedUsers = async () => {
    try {
      const response = await client.get("/api/friends/following/");
      setFollowedUsers(response.data.followed_users || []);
    } catch (error) {
      console.error("フォロー中ユーザーの読み込みエラー:", error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("エラー", "検索キーワードを入力してください");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      console.log("ユーザー検索中:", searchQuery);
      const response = await client.get("/api/friends/search/", {
        params: { search: searchQuery },
      });

      setUsers(response.data.users || []);
      setFollowedUsers(response.data.followed_users || []);

      console.log("✅ 検索完了:", response.data.users?.length || 0, "人");
    } catch (error: any) {
      console.error("❌ 検索エラー:", error);
      Alert.alert("エラー", "ユーザーの検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      await client.post(`/api/friends/${userId}/follow/`);

      // フォロー状態を更新
      setFollowedUsers((prev) => [...prev, userId]);

      Alert.alert("成功", "フォローしました");
    } catch (error: any) {
      console.error("フォローエラー:", error);
      Alert.alert("エラー", "フォローに失敗しました");
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await client.post(`/api/friends/${userId}/unfollow/`);

      // フォロー状態を更新
      setFollowedUsers((prev) => prev.filter((id) => id !== userId));

      Alert.alert("成功", "フォローを解除しました");
    } catch (error: any) {
      console.error("フォロー解除エラー:", error);
      Alert.alert("エラー", "フォロー解除に失敗しました");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setUsers([]);
    setHasSearched(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (hasSearched && searchQuery) {
      await searchUsers();
    } else {
      await loadFollowedUsers();
    }
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* タイトル */}
        <Text style={styles.title}>フレンド</Text>

        {/* 検索フォーム */}
        <SearchForm
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={searchUsers}
          onClear={handleClearSearch}
        />

        {/* コンテンツ */}
        {!hasSearched ? (
          // 初期表示
          <EmptyState type="initial" />
        ) : users.length > 0 ? (
          // 検索結果表示
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>検索結果</Text>
              <Text style={styles.resultsCount}>({users.length}人)</Text>
            </View>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <UserCard
                  user={item}
                  currentUserId={user.id}
                  isFollowing={followedUsers.includes(item.id)}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                />
              )}
              scrollEnabled={false}
            />
          </View>
        ) : (
          // 検索結果なし
          <EmptyState type="no-results" searchQuery={searchQuery} />
        )}

        {/* フォロー中のユーザー表示（検索していない時） */}
        {!hasSearched && followedUsers.length === 0 && (
          <View style={styles.followingSection}>
            <Text style={styles.sectionTitle}>👥 フォロー中のユーザー</Text>
            <EmptyState type="no-following" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.secondary.main,
    marginBottom: 16,
  },
  resultsContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.gray800,
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.neutral.gray500,
    marginLeft: 8,
  },
  followingSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.gray800,
    marginBottom: 16,
  },
});
