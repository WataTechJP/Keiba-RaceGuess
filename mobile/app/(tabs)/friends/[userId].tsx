import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import api from "../../../src/api/client";
import PredictionCard from "../../../src/components/prediction/PredictionCard";
import type { TimelinePrediction } from "@/types/prediction";
import type { User } from "@/types/user";

type UserPredictionsResponse = {
  user: User;
  predictions: TimelinePrediction[];
  count: number;
};

export default function FriendPredictionsScreen() {
  const { userId, username } = useLocalSearchParams<{
    userId: string;
    username?: string;
  }>();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<TimelinePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const displayName = targetUser?.username || username || "フレンド";

  const loadPredictions = useCallback(async () => {
    if (!userId) {
      setErrorMessage("ユーザー情報が見つかりません");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setErrorMessage("");
      const response = await api.get<UserPredictionsResponse>(
        `/api/predictions/user/${userId}/`
      );
      setTargetUser(response.data.user);
      setPredictions(response.data.predictions || []);
    } catch (error) {
      console.error("Error loading friend predictions:", error);
      setPredictions([]);
      setErrorMessage("予想の読み込みに失敗しました");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPredictions();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-transparent items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent">
      <View className="bg-white mx-4 mt-2 rounded-2xl px-5 py-2 shadow-lg">
        <Text className="text-base font-bold text-text-primary">
          {displayName} の予想{" "}
          <Text className="text-sm font-normal text-text-secondary">
            ({predictions.length}件)
          </Text>
        </Text>
      </View>

      {errorMessage ? (
        <View className="bg-white mx-4 mt-4 rounded-2xl p-8 items-center shadow-lg">
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text className="text-base font-bold text-text-primary mt-3">
            {errorMessage}
          </Text>
        </View>
      ) : predictions.length === 0 ? (
        <View className="bg-white mx-4 mt-4 rounded-2xl p-8 items-center shadow-lg">
          <Ionicons name="newspaper-outline" size={40} color="#9ca3af" />
          <Text className="text-xl font-bold text-text-primary mt-3 mb-2">
            まだ予想がありません
          </Text>
          <Text className="text-sm text-text-secondary text-center">
            {displayName} の予想が投稿されるとここに表示されます
          </Text>
        </View>
      ) : (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 96,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <PredictionCard
              id={item.id}
              race_name={item.race_name}
              race_date={item.race_date}
              race_location={item.race_location}
              first_position_name={item.first_position_name}
              second_position_name={item.second_position_name}
              third_position_name={item.third_position_name}
              comment={item.comment}
              created_at={item.created_at}
              user={item.user}
              variant="others"
            />
          )}
        />
      )}
    </View>
  );
}
