import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import client from "../../src/api/client";
import { RaceSelector } from "../../src/components/prediction/RaceSelector";
import PredictionCard from "../../src/components/prediction/PredictionCard";
import type { Race, Prediction, TimelinePrediction } from "@/types/prediction";
import { TabSwitch } from "../../src/components/common/TabSwitch";

type TabType = "my" | "timeline";

export default function HomeScreen() {
  const router = useRouter();

  // タブ切り替え
  const [activeTab, setActiveTab] = useState<TabType>("my");

  // 俺の予想
  const [myPredictions, setMyPredictions] = useState<Prediction[]>([]);
  const [myLoading, setMyLoading] = useState(true);
  const [myRefreshing, setMyRefreshing] = useState(false);

  // タイムライン
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  const [timelinePredictions, setTimelinePredictions] = useState<
    TimelinePrediction[]
  >([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    loadMyPredictions();
    loadTimelineData();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Watch for race filter changes
  useEffect(() => {
    if (activeTab === "timeline") {
      loadTimelineData(selectedRaceId ? String(selectedRaceId) : undefined);
    }
  }, [selectedRaceId]);

  // 俺の予想を読み込み
  const loadMyPredictions = async () => {
    try {
      console.log("予想一覧を読み込み中...");
      const response = await client.get("/api/predictions/");

      if (Array.isArray(response.data)) {
        // 🔍 My予想のAPIレスポンスを確認
        console.log(
          "My Predictions API Response:",
          JSON.stringify(response.data, null, 2)
        );

        setMyPredictions(response.data);
        console.log("✅ 予想一覧:", response.data.length, "件");
      } else {
        console.error("❌ レスポンスが配列ではありません:", response.data);
        setMyPredictions([]);
      }
    } catch (error) {
      console.error("❌ 予想読み込みエラー:", error);
      setMyPredictions([]);
    } finally {
      setMyLoading(false);
      setMyRefreshing(false);
    }
  };

  // タイムラインを読み込み
  const loadTimelineData = async (raceId?: string) => {
    setTimelineLoading(true);
    try {
      const racePromise = client.get<Race[]>("/api/races/");
      const params = raceId ? { params: { race_id: raceId } } : undefined;
      const predictionPromise = client.get<TimelinePrediction[]>(
        "/api/predictions/timeline/",
        params
      );
      const [raceRes, predictionRes] = await Promise.all([
        racePromise,
        predictionPromise,
      ]);

      // 🔍 APIレスポンスを確認
      console.log(
        "Timeline API Response:",
        JSON.stringify(predictionRes.data, null, 2)
      );

      setRaces(raceRes.data);
      setTimelinePredictions(predictionRes.data);
    } catch (error) {
      console.error("❌ タイムライン読み込みエラー:", error);
    } finally {
      setTimelineLoading(false);
    }
  };

  const onMyRefresh = () => {
    setMyRefreshing(true);
    loadMyPredictions();
  };

  const handleDelete = async (predictionId: number, raceName: string) => {
    Alert.alert("Delete", `${raceName}の予想を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await client.delete(`/api/predictions/${predictionId}/`);
            Alert.alert("Deleted", `${raceName}の予想を削除しました`);
            loadMyPredictions();
          } catch (error) {
            console.error("削除エラー:", error);
            Alert.alert("Error", "予想の削除に失敗しました");
          }
        },
      },
    ]);
  };

  if (myLoading && activeTab === "my") {
    return (
      <View className="flex-1 items-center justify-center bg-keiba-500">
        <View className="bg-white rounded-2xl p-8 shadow-lg">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="text-text-primary mt-4 font-semibold">
            読み込み中...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent px-4">
      <TabSwitch
        tabs={[
          { key: "timeline", label: "TimeLine" },
          { key: "my", label: "My予想" },
        ]}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as TabType)}
      />

      {/* タイムラインタブ */}
      {activeTab === "timeline" && (
        <View className="flex-1">
          {/* フィルター */}
          <View className="bg-transparent rounded-2xl shadow-lg mb-2">
            <RaceSelector
              races={races}
              selectedRaceId={selectedRaceId}
              now={now}
              disableClosedRaces={false}
              onRaceChange={setSelectedRaceId}
            />
          </View>

          {/* タイムライン一覧 */}
          <FlatList
            data={timelinePredictions}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={timelineLoading}
                onRefresh={() =>
                  loadTimelineData(
                    selectedRaceId ? String(selectedRaceId) : undefined
                  )
                }
              />
            }
            contentContainerStyle={{ paddingBottom: 96 }}
            renderItem={({ item }) => (
              <View className="mb-1">
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
              </View>
            )}
            ListEmptyComponent={
              !timelineLoading ? (
                <View className="bg-white rounded-2xl p-8 items-center shadow-lg">
                  <Text className="text-6xl mb-4">👥</Text>
                  <Text className="text-xl font-bold text-text-primary mb-2">
                    まだ予想がありません
                  </Text>
                  <Text className="text-sm text-text-secondary text-center">
                    フレンドをフォローして予想を見よう！
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              timelineLoading ? (
                <View className="py-4">
                  <ActivityIndicator size="large" color="#22c55e" />
                </View>
              ) : null
            }
          />
        </View>
      )}

      {/* My予想タブ */}
      {activeTab === "my" && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 96 }}
          refreshControl={
            <RefreshControl refreshing={myRefreshing} onRefresh={onMyRefresh} />
          }
        >
          {/* 予想一覧セクション */}
          <View className="bg-transparent rounded-2xl shadow-lg">
            {myPredictions.length > 0 ? (
              myPredictions.map((prediction) => (
                <View key={prediction.id} className="mb-1">
                  <PredictionCard
                    id={prediction.id}
                    race={prediction.race}
                    first_position={prediction.first_position_detail}
                    second_position={prediction.second_position_detail}
                    third_position={prediction.third_position_detail}
                    comment={prediction.comment}
                    created_at={prediction.created_at}
                    showDelete
                    onDelete={handleDelete}
                    variant="mine"
                  />
                </View>
              ))
            ) : (
              // 空状態
              <View className="items-center py-12">
                <Text className="text-6xl mb-4">🏇</Text>
                <Text className="text-xl font-bold text-text-primary mb-2">
                  まだ予想がありません
                </Text>
                <Text className="text-sm text-text-secondary text-center px-8">
                  予想を投稿してレースを楽しみましょう！
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
