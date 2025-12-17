import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { RankingCard } from "./RankingCard";
import type { RankingUser, RankingType } from "../../types/results";

type RankingListProps = {
  rankings: RankingUser[];
  type: RankingType;
  loading?: boolean;
};

export function RankingList({
  rankings,
  type,
  loading = false,
}: RankingListProps) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-600 mt-4">読み込み中...</Text>
      </View>
    );
  }

  if (rankings.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-6xl mb-4">🏆</Text>
        <Text className="text-xl font-bold text-gray-800 mb-2">
          まだランキングがありません
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          予想を投稿してランキングに参加しましょう
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
    >
      {/* ランキングリスト */}
      {rankings.map((user) => (
        <RankingCard key={user.user_id} user={user} type={type} />
      ))}
    </ScrollView>
  );
}
