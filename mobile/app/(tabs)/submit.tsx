// app/(tabs)/submit.tsx
import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RaceSelector } from "../../src/components/prediction/RaceSelector";
import { HorseSelector } from "../../src/components/prediction/HorseSelector";
import { Button } from "../../src/components/common/Button";
import client from "../../src/api/client";
import type { Race, Horse } from "../../src/types/prediction";

export default function SubmitPredictionScreen() {
  const router = useRouter();

  // State
  const [races, setRaces] = useState<Race[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);
  const [firstPosition, setFirstPosition] = useState<number | null>(null);
  const [secondPosition, setSecondPosition] = useState<number | null>(null);
  const [thirdPosition, setThirdPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // レース一覧を読み込み
  useEffect(() => {
    loadRaces();
  }, []);

  // レース選択時に馬一覧を読み込み
  useEffect(() => {
    if (selectedRaceId) {
      loadHorses(selectedRaceId);
      setFirstPosition(null);
      setSecondPosition(null);
      setThirdPosition(null);
    } else {
      setHorses([]);
    }
  }, [selectedRaceId]);

  const loadRaces = async () => {
    try {
      const response = await client.get("/api/races/");
      const racesData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setRaces(racesData);
    } catch (error: any) {
      console.error("❌ レース読み込みエラー:", error);
      Alert.alert("エラー", "レース一覧の読み込みに失敗しました");
    }
  };

  const loadHorses = async (raceId: number) => {
    try {
      const response = await client.get(`/api/horses/?race_id=${raceId}`);
      const horsesData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setHorses(horsesData);
    } catch (error) {
      console.error("❌ 馬読み込みエラー:", error);
      Alert.alert("エラー", "馬一覧の読み込みに失敗しました");
    }
  };

  // ✅ 選択全解除
  const handleClearAll = () => {
    setSelectedRaceId(null);
    setFirstPosition(null);
    setSecondPosition(null);
    setThirdPosition(null);
    setHorses([]);
  };

  const handleSubmit = async () => {
    if (!selectedRaceId) {
      Alert.alert("エラー", "レースを選択してください");
      return;
    }
    if (!firstPosition || !secondPosition || !thirdPosition) {
      Alert.alert("エラー", "1着、2着、3着すべてを選択してください");
      return;
    }

    setLoading(true);
    try {
      await client.post("/api/predictions/", {
        race: selectedRaceId,
        first_position: firstPosition,
        second_position: secondPosition,
        third_position: thirdPosition,
      });

      // 投稿成功後にクリア
      handleClearAll();

      Alert.alert("Good Luck!", "予想を投稿しました");
    } catch (error: any) {
      console.error("❌ 予想投稿エラー:", error);
      const errorMessage =
        error.response?.data?.detail || "予想の投稿に失敗しました";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDisabledHorseIds = (
    currentPosition: "first" | "second" | "third"
  ) => {
    const disabled: number[] = [];
    if (currentPosition !== "first" && firstPosition)
      disabled.push(firstPosition);
    if (currentPosition !== "second" && secondPosition)
      disabled.push(secondPosition);
    if (currentPosition !== "third" && thirdPosition)
      disabled.push(thirdPosition);
    return disabled;
  };

  // 何か選択されているか
  const hasSelection =
    selectedRaceId || firstPosition || secondPosition || thirdPosition;

  return (
    <View className="flex-1 bg-transparent">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* ヘッダー */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-emerald-600">
            予想を投稿
          </Text>

          {/* 選択全解除ボタン */}
          {hasSelection && (
            <TouchableOpacity
              onPress={handleClearAll}
              className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={18} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-1 font-medium">
                クリア
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* レース選択 */}
        <RaceSelector
          races={races}
          selectedRaceId={selectedRaceId}
          onRaceChange={setSelectedRaceId}
        />

        {/* 馬選択 */}
        {selectedRaceId && horses.length > 0 && (
          <View className="mt-4">
            <HorseSelector
              label="1着"
              horses={horses}
              selectedHorseId={firstPosition}
              onHorseChange={setFirstPosition}
              disabledHorseIds={getDisabledHorseIds("first")}
            />

            <View className="mt-3">
              <HorseSelector
                label="2着"
                horses={horses}
                selectedHorseId={secondPosition}
                onHorseChange={setSecondPosition}
                disabledHorseIds={getDisabledHorseIds("second")}
              />
            </View>

            <View className="mt-3">
              <HorseSelector
                label="3着"
                horses={horses}
                selectedHorseId={thirdPosition}
                onHorseChange={setThirdPosition}
                disabledHorseIds={getDisabledHorseIds("third")}
              />
            </View>
          </View>
        )}

        {/* 馬がいない */}
        {selectedRaceId && horses.length === 0 && (
          <View className="p-8 items-center bg-white rounded-xl my-4">
            <Text className="text-sm text-gray-600 text-center">
              このレースには馬が登録されていません
            </Text>
          </View>
        )}

        {/* 投稿ボタン */}
        <View className="mt-6">
          <Button
            title="投稿する"
            onPress={handleSubmit}
            loading={loading}
            disabled={
              !selectedRaceId ||
              !firstPosition ||
              !secondPosition ||
              !thirdPosition
            }
            style={{ marginTop: 0 }}
          />
        </View>

        {/* 予想一覧へ */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/predictions")}
          className="mt-4 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-sm text-white font-medium">→ 予想一覧へ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
