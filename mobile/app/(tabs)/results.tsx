import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import client from "../../src/api/client";
import type {
  RaceResult,
  RaceResultSummary,
  UserPoint,
  RankingUser,
  TabType,
} from "../../src/types/results";
import { TabSwitch } from "../../src/components/common/TabSwitch";
import { InfoModal } from "../../src/components/common/InfoModal";
import { RankingList } from "../../src/components/results/RankingList";
import { useLocalSearchParams } from "expo-router";

export default function ResultsScreen() {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [raceResults, setRaceResults] = useState<RaceResultSummary[]>([]);
  const [userPoint, setUserPoint] = useState<UserPoint>({
    points: 0,
    hit_rate: 0,
  });
  const [pointsRanking, setPointsRanking] = useState<RankingUser[]>([]);
  const [hitRateRanking, setHitRateRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  // タブ切り替え
  const { tab } = useLocalSearchParams<{ tab?: TabType }>();

  const [activeTab, setActiveTab] = useState<TabType>(
    tab === "points" ||
      tab === "hit_rate" ||
      tab === "my" ||
      tab === "race_results"
      ? tab
      : "my",
  );

  useEffect(() => {
    loadResults();
  }, []);

  // タブ変更時にランキングを読み込む
  useEffect(() => {
    if (activeTab === "points" || activeTab === "hit_rate") {
      loadRankings();
    }
  }, [activeTab]);

  useEffect(() => {
    if (
      tab === "points" ||
      tab === "hit_rate" ||
      tab === "my" ||
      tab === "race_results"
    ) {
      setActiveTab(tab);
    }
  }, [tab]);

  const loadResults = async () => {
    try {
      // 結果一覧を取得
      const resultsResponse = await client.get("/api/results/");
      setResults(resultsResponse.data);

      const raceResultsResponse = await client.get("/api/race-results/");
      setRaceResults(raceResultsResponse.data);

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

  const loadRankings = async () => {
    setRankingLoading(true);
    try {
      // ポイントランキング
      const pointsResponse = await client.get("/api/rankings/points/");
      setPointsRanking(pointsResponse.data);

      // 的中率ランキング
      const hitRateResponse = await client.get("/api/rankings/hit-rate/");
      setHitRateRanking(hitRateResponse.data);
    } catch (error) {
      console.error("❌ ランキング読み込みエラー:", error);
    } finally {
      setRankingLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === "my" || activeTab === "race_results") {
      loadResults();
    } else {
      loadRankings();
      setRefreshing(false);
    }
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
    <View className="flex-1 bg-transparent px-4">
      {/* タブ切り替え */}
      <TabSwitch
        tabs={[
          { key: "my", label: "My結果" },
          { key: "race_results", label: "レース結果" },
          { key: "points", label: "ポイント" },
          { key: "hit_rate", label: "的中率" },
        ]}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as TabType)}
      />

      {/* My結果タブ */}
      {activeTab === "my" && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 96 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 獲得ポイント */}
          <View className="bg-keiba-500 rounded-2xl p-3 mb-2 shadow-sm">
            <View className="flex-row items-center">
              <View className="ml-3 flex-1">
                <View className="flex-row items-center gap-6">
                  <Text className="text-sm text-text-secondary">
                    現在の獲得ポイントと的中率
                  </Text>
                  <TouchableOpacity
                    onPress={() => setInfoModalVisible(true)}
                    activeOpacity={0.7}
                    aria-label="獲得ポイントに関して"
                    className="flex-row items-center"
                  >
                    <Text className="text-xs text-[#e1ba21]">
                      ポイントとは？
                    </Text>

                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color="#e1ba21"
                    />
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-baseline px-12 text-text-primary">
                  <Text className="text-3xl font-bold">
                    {userPoint.points}
                    <Text className="text-lg">pt</Text>
                  </Text>
                  <Text className="text-3xl font-bold">
                    {userPoint.hit_rate} <Text className="text-lg">%</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 結果リスト */}
          {results.length > 0 ? (
            results.map((result) => (
              <View
                key={result.id}
                className="bg-white rounded-xl p-2 mb-1 shadow-sm"
              >
                {/* ヘッダー */}
                <View className="flex-row justify-between items-start mb-1">
                  <View className="flex-col items-baseline">
                    <Text className="text-lg font-bold text-gray-800 mr-3">
                      {result.race_name}
                    </Text>
                    <View className="flex-row">
                      <Text className="text-xs text-gray-500 mr-2">
                        {result.race_location}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(result.race_date).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-emerald-100 px-3 py-1 flex-row items-baseline rounded-full">
                    <Ionicons name="medal" size={20} color="#fbbf24" />
                    <Text className="text-sm font-bold ml-2 text-text-primary">
                      {result.score}
                    </Text>
                    <Text className="ml-1 text-xs text-text-secondary">pt</Text>
                  </View>
                </View>

                {/* 予想と結果 */}
                <View className="flex-row gap-2">
                  {/* あなたの予想 */}
                  <View className="flex-1 bg-blue-50 rounded-xl p-3">
                    <Text className="text-xs font-semibold text-blue-600 mb-1">
                      予想
                    </Text>
                    <View className="space-y-1">
                      <Text className="text-sm text-text-primary">
                        1着: {result.predicted_1}
                      </Text>
                      <Text className="text-sm text-text-primary">
                        2着: {result.predicted_2}
                      </Text>
                      <Text className="text-sm text-text-primary">
                        3着: {result.predicted_3}
                      </Text>
                    </View>
                  </View>

                  {/* 結果 */}
                  <View className="flex-1 bg-emerald-50 rounded-xl p-3">
                    <Text className="text-xs font-semibold text-emerald-600 mb-1">
                      結果
                    </Text>
                    <View className="space-y-1">
                      <Text className="text-sm text-text-primary">
                        1着: {result.actual_1}
                      </Text>
                      <Text className="text-sm text-text-primary">
                        2着: {result.actual_2}
                      </Text>
                      <Text className="text-sm text-text-primary">
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
        </ScrollView>
      )}

      {/* レース結果タブ */}
      {activeTab === "race_results" && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 96 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {raceResults.length > 0 ? (
            raceResults.map((result) => {
              const reflected = result.status === "reflected";
              const raceDate = result.race_date
                ? new Date(result.race_date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : null;

              return (
                <View
                  key={result.id}
                  className="bg-white rounded-xl p-3 mb-2 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-3">
                      <Text className="text-lg font-bold text-gray-800">
                        {result.race_name}
                      </Text>
                      <View className="flex-row flex-wrap mt-1">
                        {result.race_location && (
                          <Text className="text-xs text-gray-500 mr-2">
                            {result.race_location}
                          </Text>
                        )}
                        {raceDate && (
                          <Text className="text-xs text-gray-500">
                            {raceDate}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View
                      className={`px-3 py-1 rounded-full ${
                        reflected ? "bg-emerald-100" : "bg-amber-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          reflected ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {reflected ? "結果確定" : "反映中"}
                      </Text>
                    </View>
                  </View>

                  {reflected ? (
                    <View className="bg-emerald-50 rounded-xl p-3">
                      <Text className="text-sm text-text-primary mb-1">
                        1着: {result.actual_1}
                      </Text>
                      <Text className="text-sm text-text-primary mb-1">
                        2着: {result.actual_2}
                      </Text>
                      <Text className="text-sm text-text-primary">
                        3着: {result.actual_3}
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-amber-50 rounded-xl p-3">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color="#b45309"
                        />
                        <Text className="text-sm font-semibold text-amber-700 ml-2">
                          レース結果は反映中です
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <Text className="text-6xl mb-4">📋</Text>
              <Text className="text-xl font-bold text-gray-800 mb-2">
                レースがありません
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                登録済みのレースがまだありません
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ポイントランキングタブ */}
      {activeTab === "points" && (
        <RankingList
          rankings={pointsRanking}
          type="points"
          loading={rankingLoading}
        />
      )}

      {/* 的中率ランキングタブ */}
      {activeTab === "hit_rate" && (
        <RankingList
          rankings={hitRateRanking}
          type="hit_rate"
          loading={rankingLoading}
        />
      )}
      {/* ポイント説明 */}
      <InfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        title="獲得ポイントについて"
      >
        <Text className="text-base text-gray-700 leading-7">
          獲得ポイントは、あなたの予想がどれだけ正確だったかに基づいています。
        </Text>

        <View className="mt-6 bg-emerald-50 rounded-xl p-4">
          <Text className="text-base font-bold text-gray-800 mb-3">
            ポイント配分
          </Text>

          <View className="flex-row items-center mb-2">
            <View className="w-16 h-8 bg-amber-400 rounded-lg items-center justify-center mr-3">
              <Text className="text-sm font-bold text-white">1着</Text>
            </View>
            <Text className="text-base text-gray-700">
              的中すると{" "}
              <Text className="font-bold text-emerald-600">3ポイント</Text>
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <View className="w-16 h-8 bg-gray-400 rounded-lg items-center justify-center mr-3">
              <Text className="text-sm font-bold text-white">2着</Text>
            </View>
            <Text className="text-base text-gray-700">
              的中すると{" "}
              <Text className="font-bold text-emerald-600">2ポイント</Text>
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="w-16 h-8 bg-orange-600 rounded-lg items-center justify-center mr-3">
              <Text className="text-sm font-bold text-white">3着</Text>
            </View>
            <Text className="text-base text-gray-700">
              的中すると{" "}
              <Text className="font-bold text-emerald-600">1ポイント</Text>
            </Text>
          </View>
          <Text>ボーナスポイント</Text>
        </View>

        <View className="mt-6 bg-blue-50 rounded-xl p-4">
          <Text className="text-base font-bold text-gray-800 mb-2">
            📊 計算例
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            あるレースで1着と3着を的中させた場合：{"\n"}
            3ポイント（1着）+ 1ポイント（3着）={" "}
            <Text className="font-bold">4ポイント獲得</Text>
          </Text>
        </View>

        <View className="mt-6 bg-red-50 rounded-xl p-4">
          <Text className="text-base font-bold text-gray-800 mb-2">
            ⚠️ 注意
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            予想が的中しなかった場合はポイントは加算されません。
          </Text>
        </View>
      </InfoModal>
    </View>
  );
}
