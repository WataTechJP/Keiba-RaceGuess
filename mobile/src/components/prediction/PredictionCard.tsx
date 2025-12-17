// src/components/common/PredictionCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import type { User } from "../../types/user";

type Horse = {
  id: number;
  name: string;
};

type Race = {
  id: number;
  name: string;
};

type PredictionCardProps = {
  id: number;
  race?: Race; // My予想用
  race_name?: string; // タイムライン用
  first_position?: Horse; // My予想用
  first_position_name?: string; // タイムライン用
  second_position?: Horse; // My予想用
  second_position_name?: string; // タイムライン用
  third_position?: Horse; // My予想用
  third_position_name?: string; // タイムライン用
  created_at: string;

  // タイムライン専用
  user?: User;

  // オプション
  showDelete?: boolean;
  onDelete?: (id: number, raceName: string) => void;
  onPress?: (id: number) => void;
  variant?: "mine" | "others";
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

export default function PredictionCard({
  id,
  race,
  race_name,
  first_position,
  first_position_name,
  second_position,
  second_position_name,
  third_position,
  third_position_name,
  created_at,
  user,
  showDelete = false,
  onDelete,
  onPress,
  variant = "mine",
}: PredictionCardProps) {
  // データの統一（My予想とタイムラインの両方に対応）
  const raceName = race?.name || race_name || "";
  const firstPositionName = first_position?.name || first_position_name || "";
  const secondPositionName =
    second_position?.name || second_position_name || "";
  const thirdPositionName = third_position?.name || third_position_name || "";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return `${
      date.getMonth() + 1
    }/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}`;
  };

  // プロフィール画像のURLを構築
  const getProfileImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return null;

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

  const profileImageUri = getProfileImageUrl(user?.profile_image_url);

  const CardWrapper = onPress ? TouchableOpacity : View;
  const cardProps = onPress
    ? { onPress: () => onPress(id), activeOpacity: 0.7 }
    : {};

  return (
    <CardWrapper {...cardProps}>
      <View className="bg-green-100 rounded-xl p-2 shadow-sm">
        {/* タイムライン用ヘッダー（ユーザー情報） */}
        {variant === "others" && user && (
          <View className="flex-row items-center mb-1">
            {/* プロフィール画像 */}
            {profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                className="w-12 h-12 rounded-full border border-gray-200"
                resizeMode="cover"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-emerald-100 border border-gray-200 items-center justify-center">
                <Text className="text-emerald-600 font-bold text-lg">
                  {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="text-sm text-text-primary">{user.username}</Text>
              <View className="flex flex-row items-center">
                <Text
                  className="text-lg font-bold text-text-primary flex-1 mr-2"
                  numberOfLines={1}
                >
                  {raceName}
                </Text>
                <Text className="text-xs text-gray-500">
                  {formatDate(created_at)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 通常ヘッダー（My予想用） */}
        {variant === "mine" && (
          <View className="flex-row items-center justify-between mb-1">
            {/* レース名 */}
            <Text
              className="text-lg font-bold text-text-primary flex-1 mr-2"
              numberOfLines={1}
            >
              {raceName}
            </Text>

            {/* 右側：投稿日時 + 削除ボタン */}
            <View className="flex-row items-center gap-2">
              {/* 投稿日時 */}
              <Text className="text-xs text-gray-500">
                {formatDate(created_at)}
              </Text>

              {/* 削除ボタン */}
              {showDelete && onDelete && (
                <TouchableOpacity
                  onPress={() => onDelete(id, raceName)}
                  className="p-1"
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* 予想順位 */}
        <View className={"bg-emerald-50 rounded-xl p-2 space-y-1"}>
          {/* 1着 */}
          <View className="flex-row items-center">
            <View className="w-14 py-1 rounded-lg items-center bg-amber-400">
              <Text className="text-sm font-bold text-white">1着</Text>
            </View>
            <Text className="ml-3 text-sm font-semibold text-gray-800 flex-1">
              {firstPositionName}
            </Text>
          </View>

          {/* 2着 */}
          <View className="flex-row items-center">
            <View className="w-14 py-1 rounded-lg items-center bg-gray-400">
              <Text className="text-sm font-bold text-white">2着</Text>
            </View>
            <Text className="ml-3 text-sm font-semibold text-gray-800 flex-1">
              {secondPositionName}
            </Text>
          </View>

          {/* 3着 */}
          <View className="flex-row items-center">
            <View className="w-14 py-1 rounded-lg items-center bg-orange-600">
              <Text className="text-sm font-bold text-white">3着</Text>
            </View>
            <Text className="ml-3 text-sm font-semibold text-gray-800 flex-1">
              {thirdPositionName}
            </Text>
          </View>
        </View>
      </View>
    </CardWrapper>
  );
}
