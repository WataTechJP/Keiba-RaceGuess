// app/(tabs)/predictions.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import client from "../../src/api/client";
import type { Prediction } from "../../src/types/prediction";

export default function PredictionsScreen() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const response = await client.get("/api/predictions/");
      setPredictions(response.data);
    } catch (error) {
      console.error("❌ 予想読み込みエラー:", error);
      Alert.alert("エラー", "予想一覧の読み込みに失敗しました");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPredictions();
  };

  const handleDelete = async (predictionId: number) => {
    Alert.alert("確認", "この予想を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            // NOTE: あなたのコードはここだけURLが違うので一旦そのまま
            await client.delete(`/predictions/${predictionId}/`);
            Alert.alert("成功", "予想を削除しました");
            loadPredictions();
          } catch (error) {
            console.error("削除エラー:", error);
            Alert.alert("エラー", "予想の削除に失敗しました");
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${
      date.getMonth() + 1
    }/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}`;
  };

  const renderPrediction = ({ item }: { item: Prediction }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      {/* ヘッダー */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800 mb-1">
            {item.race.name}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatDate(item.created_at)}
          </Text>
        </View>

        <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-1">
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* 予想内容 */}
      <View>
        {/* 1着 */}
        <View className="flex-row items-center">
          <View className="w-12 py-1 rounded items-center bg-amber-400">
            <Text className="text-xs font-semibold text-white">1着</Text>
          </View>
          <Text className="ml-3 text-sm text-gray-800 flex-1">
            {item.first_position.name}
          </Text>
        </View>

        {/* 2着 */}
        <View className="flex-row items-center mt-2">
          <View className="w-12 py-1 rounded items-center bg-gray-300">
            <Text className="text-xs font-semibold text-white">2着</Text>
          </View>
          <Text className="ml-3 text-sm text-gray-800 flex-1">
            {item.second_position.name}
          </Text>
        </View>

        {/* 3着 */}
        <View className="flex-row items-center mt-2">
          <View className="w-12 py-1 rounded items-center bg-[#cd7f32]">
            <Text className="text-xs font-semibold text-white">3着</Text>
          </View>
          <Text className="ml-3 text-sm text-gray-800 flex-1">
            {item.third_position.name}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent">
      {/* タイトル */}
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-2xl font-bold text-emerald-600">予想一覧</Text>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/submit")}
          className="p-1"
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={32} color="#10b981" />
        </TouchableOpacity>
      </View>

      {predictions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-6xl mb-4">🏇</Text>
          <Text className="text-xl font-semibold text-gray-800 mb-2">
            まだ予想がありません
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            「投稿する」ボタンから予想を投稿しましょう！
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/submit")}
            className="bg-emerald-600 px-6 py-3 rounded-lg"
            activeOpacity={0.85}
          >
            <Text className="text-white font-semibold">予想を投稿する</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPrediction}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}
