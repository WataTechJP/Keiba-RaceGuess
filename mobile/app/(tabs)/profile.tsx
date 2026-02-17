import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { AppSnackbar } from "@/components/common/AppSnackbar";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import client from "../../src/api/client";
import type { UserProfile } from "@/types/user";
import Constants from "expo-constants";

// API URLを取得
const getApiUrl = () => {
  if (__DEV__ && Constants.expoConfig?.hostUri) {
    const ip = Constants.expoConfig.hostUri.split(":")[0];
    return `http://${ip}:8000`;
  }
  return process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000";
};

const API_URL = getApiUrl();

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVariant, setSnackbarVariant] = useState<
    "success" | "error" | "info"
  >("info");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // プロフィール情報とフォロー数を取得
      const [profileRes, followingRes] = await Promise.all([
        client.get<UserProfile>(`/api/users/me/profile/`),
        client.get<{ count: number }>(`/api/friends/following/`),
      ]);

      setProfile(profileRes.data);
      setFollowingCount(followingRes.data.count || 0);
      console.log("✅ プロフィール取得成功:", profileRes.data);
    } catch (error) {
      console.error("❌ プロフィール読み込みエラー:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = async () => {
    try {
      await logout();

      setSnackbarMessage("ログアウトしました");
      setSnackbarVariant("success");
      setSnackbarVisible(true);

      // ✅ Snackbar を一瞬見せてから auth へ
      setTimeout(() => {
        router.replace("/(auth)");
      }, 500);
    } catch (e) {
      console.error("Logout error:", e);
      setSnackbarMessage("ログアウトに失敗しました");
      setSnackbarVariant("error");
      setSnackbarVisible(true);
    }
  };

  // ✅ null も undefined も処理できるように
  const getProfileImageUrl = (imageUrl?: string | null): string | undefined => {
    if (!imageUrl) return undefined;

    // すでに完全なURLの場合
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // 相対パスの場合は完全なURLに変換
    if (imageUrl.startsWith("/media/")) {
      return `${API_URL}${imageUrl}`;
    }

    // パスだけの場合
    return `${API_URL}/media/${imageUrl}`;
  };

  // ✅ 正しいパスを使用
  const profileImageUri = getProfileImageUrl(
    profile?.profile?.profile_image_url
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-600 mt-4">読み込み中...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-transparent"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* プロフィールヘッダー */}
        <View className="bg-transparent items-center py-4">
          {/* プロフィール画像 */}
          {profileImageUri ? (
            <Image
              source={{ uri: profileImageUri }}
              className="w-24 h-24 rounded-full mb-2 border-2 border-gray-200"
              resizeMode="cover"
              onError={(error) => {
                console.error(
                  "❌ 画像読み込みエラー:",
                  error.nativeEvent.error
                );
              }}
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-emerald-100 items-center justify-center border-2 border-gray-200">
              <Text className="text-4xl text-emerald-600 font-bold">
                {user?.username?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}

          <Text className="text-2xl font-bold text-text-primary mb-1">
            {user?.username || "NO NAME"}
          </Text>
          <Text className="text-sm text-text-secondary">
            {user?.email || ""}
          </Text>
          <Text className="text-sm text-text-secondary">
            登録日：
            {profile?.date_joined
              ? new Date(profile.date_joined).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </Text>
        </View>

        {/* 統計情報 */}
        <View className="flex-row py-3">
          <TouchableOpacity
            className="flex-1 basis-0 items-center border border-keiba-500 bg-slate-50"
            onPress={() => {
              router.push("/(tabs)/");
            }}
          >
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {profile?.predictions_count || 0}
            </Text>
            <Text className="text-xs text-gray-500">予想数</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 basis-0 items-center border border-keiba-500 bg-slate-50"
            onPress={() => {
              router.push({
                pathname: "/(tabs)/results",
                params: { tab: "points" },
              });
            }}
          >
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {profile?.points || 0}
            </Text>
            <Text className="text-xs text-gray-500">ポイント</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 basis-0 items-center border border-keiba-500 bg-slate-50"
            onPress={() => {
              router.push({
                pathname: "/(tabs)/results",
                params: { tab: "hit_rate" },
              });
            }}
          >
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {profile?.hit_rate || 0}
            </Text>
            <Text className="text-xs text-gray-500">的中率 (%)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 basis-0 items-center border border-keiba-500 bg-slate-50"
            onPress={() => {
              router.push("/(tabs)/friends");
            }}
          >
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {followingCount}
            </Text>
            <Text className="text-xs text-gray-500">フォロー中</Text>
          </TouchableOpacity>
        </View>

        {/* メニューリスト */}
        <View className="mt-4 bg-white border-t border-b border-gray-200">
          <TouchableOpacity className="flex-row items-center py-4 px-5 border-b border-gray-100">
            <Ionicons name="person-outline" size={24} color="#374151" />
            <Text className="flex-1 text-base text-gray-700 ml-4">
              プロフィール編集
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-4 px-5 border-b border-gray-100">
            <Ionicons name="settings-outline" size={24} color="#374151" />
            <Text className="flex-1 text-base text-gray-700 ml-4">設定</Text>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-4 px-5 border-b border-gray-100">
            <Ionicons name="notifications-outline" size={24} color="#374151" />
            <Text className="flex-1 text-base text-gray-700 ml-4">
              通知設定
            </Text>
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
            <Text className="flex-1 text-base text-red-500 ml-4">
              ログアウト
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AppSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        variant={snackbarVariant}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </>
  );
}
