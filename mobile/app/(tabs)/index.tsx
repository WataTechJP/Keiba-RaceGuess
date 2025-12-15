import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import client from "../../src/api/client";
import { LinearGradient } from "expo-linear-gradient";

interface Prediction {
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
}

interface TimelinePrediction {
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
}

interface Race {
  id: number;
  name: string;
}

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
    <LinearGradient
      colors={["#87CEEB", "#4CAF50"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* タブ切り替え */}
      <View className="flex-row bg-white mx-4 mt-4 rounded-2xl p-1 shadow-lg">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl ${
            activeTab === "my" ? "bg-keiba-500" : "bg-transparent"
          }`}
          onPress={() => setActiveTab("my")}
        >
          <Text
            className={`text-center font-bold ${
              activeTab === "my" ? "text-white" : "text-text-secondary"
            }`}
          >
            🏇 俺の予想
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl ${
            activeTab === "timeline" ? "bg-keiba-500" : "bg-transparent"
          }`}
          onPress={() => setActiveTab("timeline")}
        >
          <Text
            className={`text-center font-bold ${
              activeTab === "timeline" ? "text-white" : "text-text-secondary"
            }`}
          >
            🕒 タイムライン
          </Text>
        </TouchableOpacity>
      </View>

      {/* 俺の予想タブ */}
      {activeTab === "my" && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
          refreshControl={
            <RefreshControl refreshing={myRefreshing} onRefresh={onMyRefresh} />
          }
        >
          {/* 予想一覧セクション */}
          <View className="bg-white rounded-2xl p-4 mt-4 shadow-lg">
            <Text className="text-xl font-bold text-text-primary mb-4">
              📋 俺の予想
            </Text>

            {myPredictions.length > 0 ? (
              myPredictions.map((prediction, index) => (
                <View
                  key={prediction.id}
                  className={`bg-keiba-50 rounded-xl p-4 ${
                    index < myPredictions.length - 1 ? "mb-3" : ""
                  }`}
                >
                  {/* レース名 */}
                  <Text className="text-base font-bold text-text-primary mb-3">
                    {prediction.race.name}
                  </Text>

                  {/* 予想順位 */}
                  <View className="gap-y-2">
                    {/* 1着 */}
                    <View className="flex-row items-center">
                      <View className="bg-yellow-400 rounded-lg px-3 py-2 w-14 items-center">
                        <Text className="text-xs font-bold text-white">
                          1着
                        </Text>
                      </View>
                      <Text className="text-sm text-text-primary font-semibold ml-3 flex-1">
                        {prediction.first_position.name}
                      </Text>
                    </View>

                    {/* 2着 */}
                    <View className="flex-row items-center">
                      <View className="bg-gray-400 rounded-lg px-3 py-2 w-14 items-center">
                        <Text className="text-xs font-bold text-white">
                          2着
                        </Text>
                      </View>
                      <Text className="text-sm text-text-primary font-semibold ml-3 flex-1">
                        {prediction.second_position.name}
                      </Text>
                    </View>

                    {/* 3着 */}
                    <View className="flex-row items-center">
                      <View className="bg-orange-600 rounded-lg px-3 py-2 w-14 items-center">
                        <Text className="text-xs font-bold text-white">
                          3着
                        </Text>
                      </View>
                      <Text className="text-sm text-text-primary font-semibold ml-3 flex-1">
                        {prediction.third_position.name}
                      </Text>
                    </View>
                  </View>

                  {/* 投稿日時 */}
                  <Text className="text-xs text-text-secondary mt-3 text-right">
                    {new Date(prediction.created_at).toLocaleDateString(
                      "ja-JP",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
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
        <View className="flex-1 px-4">
          {/* フィルター */}
          <View className="bg-white rounded-2xl p-4 mt-4 mb-4 shadow-lg">
            <Text className="font-bold text-text-primary mb-3">
              🔍 レースで絞り込み
            </Text>
            <View className="border border-border-light rounded-xl overflow-hidden">
              <Picker
                selectedValue={selectedRace}
                onValueChange={handleFilterChange}
                style={{ height: 50 }}
              >
                <Picker.Item label="すべてのレース" value="" />
                {races.map((race) => (
                  <Picker.Item
                    key={race.id}
                    label={race.name}
                    value={String(race.id)}
                  />
                ))}
              </Picker>
            </View>
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
              <View className="bg-white rounded-2xl p-4 mb-3 shadow-lg">
                {/* ヘッダー */}
                <View className="flex-row items-center mb-3">
                  {/* プロフィール画像 */}
                  {item.user.profile_image_url ? (
                    <Image
                      source={{ uri: item.user.profile_image_url }}
                      className="w-12 h-12 rounded-full border border-border-light"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-keiba-100 border border-border-light items-center justify-center">
                      <Text className="text-keiba-600 font-bold">??</Text>
                    </View>
                  )}
                  <View className="ml-3 flex-1">
                    <Text className="text-xs text-text-secondary">
                      {item.user.username} の予想
                    </Text>
                    <Text className="text-base font-bold text-keiba-600">
                      {item.race_name}
                    </Text>
                  </View>
                </View>

                {/* 予想内容 */}
                <View className="bg-keiba-50 rounded-xl p-3 gap-y-2">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">🥇</Text>
                    <Text className="text-sm font-semibold text-text-primary">
                      {item.first_position_name}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">🥈</Text>
                    <Text className="text-sm font-semibold text-text-primary">
                      {item.second_position_name}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">🥉</Text>
                    <Text className="text-sm font-semibold text-text-primary">
                      {item.third_position_name}
                    </Text>
                  </View>
                </View>

                {/* 投稿日時 */}
                <Text className="text-xs text-text-secondary mt-3 text-right">
                  {new Date(item.created_at).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
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
    </LinearGradient>
  );
}
