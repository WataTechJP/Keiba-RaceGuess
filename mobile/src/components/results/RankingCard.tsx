// src/components/results/RankingCard.tsx
import React from "react";
import { View, Text, Image } from "react-native";
import type { RankingUser } from "../../types/results";
import Constants from "expo-constants";

type RankingCardProps = {
  user: RankingUser;
  type: "points" | "hit_rate";
};

// API URLを取得
const getApiUrl = () => {
  if (__DEV__ && Constants.expoConfig?.hostUri) {
    const ip = Constants.expoConfig.hostUri.split(":")[0];
    return `http://${ip}:8000`;
  }
  return process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000";
};

const API_URL = getApiUrl();

export function RankingCard({ user, type }: RankingCardProps) {
  // ランクに応じたメダルアイコン
  const getRankIcon = () => {
    switch (user.rank) {
      case 1:
        return <Text className="text-3xl">🥇</Text>;
      case 2:
        return <Text className="text-3xl">🥈</Text>;
      case 3:
        return <Text className="text-3xl">🥉</Text>;
      default:
        return (
          <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
            <Text className="text-base font-bold text-gray-600">
              {user.rank}
            </Text>
          </View>
        );
    }
  };

  // プロフィール画像URL
  const getProfileImageUrl = (imageUrl?: string): string | undefined => {
    if (!imageUrl) return undefined;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    if (imageUrl.startsWith("/media/")) {
      return `${API_URL}${imageUrl}`;
    }
    return `${API_URL}/media/${imageUrl}`;
  };

  const profileImageUri = getProfileImageUrl(user.profile_image_url);

  return (
    <View className="flex-row items-center bg-white rounded-2xl p-1 mb-1">
      {/* ランク */}
      <View className="w-12 items-center mr-3">{getRankIcon()}</View>

      {/* プロフィール画像 */}
      {profileImageUri ? (
        <Image
          source={{ uri: profileImageUri }}
          className="w-12 h-12 rounded-full border border-gray-200 mr-3"
          resizeMode="cover"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-emerald-100 border border-gray-200 items-center justify-center mr-3">
          <Text className="text-emerald-600 font-bold text-lg">
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* ユーザー情報 */}
      <View className="flex-1">
        <Text className="text-base font-bold text-primary">
          {user.username}
        </Text>
        <Text className="text-xs text-secondary">
          予想数: {user.predictions_count}
        </Text>
      </View>

      {/* スコア */}
      <View className="items-end">
        {type === "points" ? (
          <View className="flex-row items-baseline mr-2">
            <Text className="text-2xl font-bold text-text-primary mr-2">
              {user.points}
            </Text>
            <Text className="text-xs text-text-secondary">pt</Text>
          </View>
        ) : (
          <View className="flex-row items-baseline mr-2">
            <Text className="text-2xl font-bold text-text-primary mr-2">
              {user.hit_rate}
            </Text>
            <Text className="text-xs text-text-secondary">%</Text>
          </View>
        )}
      </View>
    </View>
  );
}
