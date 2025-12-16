import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import client from "../../src/api/client";

interface RaceResult {
  id: number;
  race_name: string;
  race_date: string;
  predicted_1: string;
  predicted_2: string;
  predicted_3: string;
  actual_1: string;
  actual_2: string;
  actual_3: string;
  score: number;
}

interface UserPoint {
  points: number;
}

export default function ResultsScreen() {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [userPoint, setUserPoint] = useState<UserPoint>({ points: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      // 結果一覧を取得
      const resultsResponse = await client.get("/api/results/");
      setResults(resultsResponse.data);

      // ユーザーポイントを取得
      const pointsResponse = await client.get("/api/user-points/");
      setUserPoint(pointsResponse.data);
    } catch (error) {
      console.error("❌ 結果読み込みエラー:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadResults();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-600 mt-4">読み込み中...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* タイトル */}
        <Text className="text-2xl font-bold text-emerald-600 mb-2">
          結果一覧
        </Text>

        {/* 獲得ポイント */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center">
            <Ionicons name="trophy" size={32} color="#f43f5e" />
            <View className="ml-3 flex-1">
              <Text className="text-sm text-gray-600">
                あなたの獲得ポイント
              </Text>
              <Text className="text-3xl font-bold text-rose-600">
                {userPoint.points} <Text className="text-lg">pt</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 結果リスト */}
        {results.length > 0 ? (
          results.map((result) => (
            <View
              key={result.id}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            >
              {/* ヘッダー */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800 mb-1">
                    {result.race_name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(result.race_date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View className="bg-emerald-100 px-3 py-1 rounded-full">
                  <Text className="text-sm font-bold text-emerald-600">
                    {result.score} pt
                  </Text>
                </View>
              </View>

              {/* 予想と結果 */}
              <View className="flex-row gap-3">
                {/* あなたの予想 */}
                <View className="flex-1 bg-blue-50 rounded-xl p-3">
                  <Text className="text-xs font-semibold text-blue-600 mb-2">
                    あなたの予想
                  </Text>
                  <View className="space-y-1">
                    <Text className="text-sm text-gray-800">
                      1着: {result.predicted_1}
                    </Text>
                    <Text className="text-sm text-gray-800">
                      2着: {result.predicted_2}
                    </Text>
                    <Text className="text-sm text-gray-800">
                      3着: {result.predicted_3}
                    </Text>
                  </View>
                </View>

                {/* 結果 */}
                <View className="flex-1 bg-emerald-50 rounded-xl p-3">
                  <Text className="text-xs font-semibold text-emerald-600 mb-2">
                    結果
                  </Text>
                  <View className="space-y-1">
                    <Text className="text-sm text-gray-800">
                      1着: {result.actual_1}
                    </Text>
                    <Text className="text-sm text-gray-800">
                      2着: {result.actual_2}
                    </Text>
                    <Text className="text-sm text-gray-800">
                      3着: {result.actual_3}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          // 空状態
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
            <Text className="text-6xl mb-4">📊</Text>
            <Text className="text-xl font-bold text-gray-800 mb-2">
              まだ結果がありません
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              結果が反映された予想はまだありません
            </Text>
          </View>
        )}

        {/* ポイント説明 */}
        <View className="bg-blue-50 rounded-2xl p-4 mt-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text className="text-sm font-bold text-blue-600 ml-2">
              獲得ポイントについて
            </Text>
          </View>
          <Text className="text-sm text-gray-700 leading-6">
            獲得ポイントは、あなたの予想がどれだけ正確だったかに基づいています。
            {"\n"}
            {"\n"}• 1着の的中: <Text className="font-bold">3ポイント</Text>
            {"\n"}• 2着の的中: <Text className="font-bold">2ポイント</Text>
            {"\n"}• 3着の的中: <Text className="font-bold">1ポイント</Text>
            {"\n"}
            {"\n"}
            予想が的中しなかった場合はポイントは加算されません。
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
