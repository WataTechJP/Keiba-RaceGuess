import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import type { PredictionCardProps } from "../../types/prediction";

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
  race_date,
  race_location,
  first_position,
  first_position_name,
  second_position,
  second_position_name,
  third_position,
  third_position_name,
  comment,
  created_at,
  user,
  showDelete = false,
  onDelete,
  onPress,
  variant = "mine",
}: PredictionCardProps) {
  const raceName = race?.name || race_name || "";
  const raceDate = race?.date || race_date || "";
  const raceLocation = race?.location || race_location || "";
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

  const getProfileImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    if (imageUrl.startsWith("/media/")) {
      return `${API_URL}${imageUrl}`;
    }
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
        {/* タイムライン用ヘッダー */}
        {variant === "others" && user && (
          <View className="flex-row items-center mb-1">
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
              <View className="flex-row justify-between">
                <View className="flex-col">
                  <Text
                    className="text-lg font-bold text-text-primary"
                    numberOfLines={1}
                  >
                    {raceName}
                  </Text>
                  <View className="flex-row items-center gap-2 mb-1">
                    {raceDate && (
                      <Text className="text-xs text-text-secondary">
                        {new Date(raceDate).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    )}
                    {raceLocation && (
                      <Text className="text-xs text-text-secondary">
                        {raceLocation}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-gray-500">
                    {formatDate(created_at)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* My予想用ヘッダー */}
        {variant === "mine" && (
          <>
            <View className="flex-row items-center justify-between">
              <Text
                className="text-lg font-bold text-text-primary flex-1"
                numberOfLines={1}
              >
                {raceName}
              </Text>
              <Text className="text-xs text-text-secondary">
                {formatDate(created_at)}
              </Text>
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
            <View className="flex-row items-center gap-2 mb-1">
              {raceDate && (
                <Text className="text-xs text-text-secondary">
                  {new Date(raceDate).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              )}
              {raceLocation && (
                <Text className="text-xs text-text-secondary">
                  {raceLocation}
                </Text>
              )}
            </View>
          </>
        )}

        {/* 予想順位 */}
        <View className="bg-emerald-50 rounded-xl p-2 space-y-1">
          <View className="flex-row items-center">
            <View className="w-14 py-1 rounded-lg items-center bg-amber-400">
              <Text className="text-sm font-bold text-white">1着</Text>
            </View>
            <Text className="ml-3 text-sm font-semibold text-gray-800 flex-1">
              {firstPositionName}
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="w-14 py-1 rounded-lg items-center bg-gray-400">
              <Text className="text-sm font-bold text-white">2着</Text>
            </View>
            <Text className="ml-3 text-sm font-semibold text-gray-800 flex-1">
              {secondPositionName}
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="w-14 py-1 rounded-lg items-center bg-orange-600">
              <Text className="text-sm font-bold text-white">3着</Text>
            </View>
            <Text className="ml-3 text-sm font-semibold text-gray-800 flex-1">
              {thirdPositionName}
            </Text>
          </View>
        </View>
        {comment ? (
          <View>
            <Text>
              <Ionicons name="chatbubble-ellipses" size={20} color="#b9b9b9" />
              {comment}
            </Text>
          </View>
        ) : null}
      </View>
    </CardWrapper>
  );
}
