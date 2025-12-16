// app/(tabs)/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import client from "../../src/api/client";
import { RaceSelector } from "../../src/components/prediction/RaceSelector";
import PredictionCard from "../../src/components/prediction/PredictionCard";

type Prediction = {
  id: number;
  race: {
    id: number;
    name: string;
  };
  first_position: {
    id: number;
    name: string;
  };
  second_position: {
    id: number;
    name: string;
  };
  third_position: {
    id: number;
    name: string;
  };
  created_at: string;
};

type TimelinePrediction = {
  id: number;
  race_name: string;
  first_position_name: string;
  second_position_name: string;
  third_position_name: string;
  created_at: string;
  user: {
    username: string;
    profile_image_url?: string;
  };
};

type Race = {
  id: number;
  name: string;
};

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

  const [timelinePredictions, setTimelinePredictions] = useState<
    TimelinePrediction[]
  >([]);
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    loadMyPredictions();
    loadTimelineData();
  }, []);

  // 俺の予想を読み込み
  const loadMyPredictions = async () => {
    try {
      console.log("予想一覧を読み込み中...");
      const response = await client.get("/api/predictions/");

      if (Array.isArray(response.data)) {
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
    Alert.alert("確認", `${raceName}の予想を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await client.delete(`/predictions/${predictionId}/`);
            Alert.alert("成功", `${raceName}の予想を削除しました`);
            loadMyPredictions();
          } catch (error) {
            console.error("削除エラー:", error);
            Alert.alert("エラー", "予想の削除に失敗しました");
          }
        },
      },
    ]);
  };

  const handleFilterChange = (value: string) => {
    setSelectedRace(value);
    loadTimelineData(value || undefined);
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
      {/* タブ切り替え */}
      <View className="flex-row bg-white mt-4 mb-2 rounded-2xl p-1 shadow-lg">
        <TouchableOpacity
          className={`flex-1 py-2 rounded-xl ${
            activeTab === "my" ? "bg-keiba-500" : "bg-transparent"
          }`}
          onPress={() => setActiveTab("my")}
        >
          <Text
            className={`text-base text-center font-bold ${
              activeTab === "my" ? "text-white" : "text-text-secondary"
            }`}
          >
            My予想
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2 rounded-xl ${
            activeTab === "timeline" ? "bg-keiba-500" : "bg-transparent"
          }`}
          onPress={() => setActiveTab("timeline")}
        >
          <Text
            className={`text-base text-center font-bold ${
              activeTab === "timeline" ? "text-white" : "text-text-secondary"
            }`}
          >
            TimeLine
          </Text>
        </TouchableOpacity>
      </View>

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
          <View className="bg-white rounded-2xl p-3 mb-2 shadow-lg">
            <Text className="text-xl font-bold text-text-primary mb-3">
              My予想
            </Text>

            {myPredictions.length > 0 ? (
              myPredictions.map((prediction) => (
                <View key={prediction.id} className="mb-3">
                  <PredictionCard
                    id={prediction.id}
                    race={prediction.race}
                    first_position={prediction.first_position}
                    second_position={prediction.second_position}
                    third_position={prediction.third_position}
                    created_at={prediction.created_at}
                    showDelete
                    onDelete={handleDelete}
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

      {/* タイムラインタブ */}
      {activeTab === "timeline" && (
        <View className="flex-1">
          {/* フィルター */}
          <View className="bg-white rounded-2xl p-3 mb-2 shadow-lg">
            <Text className="text-xl font-bold text-text-primary mb-1">
              TimeLine
            </Text>
            <RaceSelector
              races={races}
              selectedRaceId={selectedRaceId}
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
                onRefresh={() => loadTimelineData(selectedRace || undefined)}
              />
            }
            contentContainerStyle={{ paddingBottom: 96 }}
            renderItem={({ item }) => (
              <View className="mb-3">
                <PredictionCard
                  id={item.id}
                  race_name={item.race_name}
                  first_position_name={item.first_position_name}
                  second_position_name={item.second_position_name}
                  third_position_name={item.third_position_name}
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
    </View>
  );
}
