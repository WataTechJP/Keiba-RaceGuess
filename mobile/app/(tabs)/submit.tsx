import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { RaceSelector } from "../../src/components/prediction/RaceSelector";
import { HorseSelector } from "../../src/components/prediction/HorseSelector";
import { Button } from "../../src/components/common/Button";
import { Colors } from "../../src/constants/colors";
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
      // レース変更時は選択をリセット
      setFirstPosition(null);
      setSecondPosition(null);
      setThirdPosition(null);
    } else {
      setHorses([]);
    }
  }, [selectedRaceId]);

  const loadRaces = async () => {
    try {
      console.log("🔍 レース一覧を読み込み中...");
      console.log("🔍 API URL:", client.defaults.baseURL);

      const response = await client.get("/api/races/");

      console.log("✅ レスポンス受信");
      console.log("✅ データ:", response.data);
      console.log("✅ データ型:", Array.isArray(response.data));
      console.log("✅ レース件数:", response.data.length);

      setRaces(response.data);
    } catch (error: any) {
      console.error("❌ レース読み込みエラー:", error);
      console.error("❌ エラー詳細:", error.response?.data);
      Alert.alert("エラー", "レース一覧の読み込みに失敗しました");
    }
  };

  // さらに useEffect にもログ追加
  useEffect(() => {
    console.log("🔍 races 更新:", races);
    console.log("🔍 races.length:", races.length);
  }, [races]);

  const loadHorses = async (raceId: number) => {
    try {
      console.log("馬一覧を読み込み中... レースID:", raceId);
      const response = await client.get(`/api/horses/?race_id=${raceId}`);
      setHorses(response.data);
      console.log("✅ 馬一覧:", response.data.length, "頭");
    } catch (error) {
      console.error("❌ 馬読み込みエラー:", error);
      Alert.alert("エラー", "馬一覧の読み込みに失敗しました");
    }
  };

  const handleSubmit = async () => {
    // バリデーション
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
      console.log("予想を投稿中...");
      await client.post("/api/predictions/", {
        race: selectedRaceId,
        first_position: firstPosition,
        second_position: secondPosition,
        third_position: thirdPosition,
      });

      console.log("✅ 予想投稿成功");

      // ← すべての選択をリセット
      setSelectedRaceId(null);
      setFirstPosition(null);
      setSecondPosition(null);
      setThirdPosition(null);
      setHorses([]);

      Alert.alert("成功", "予想を投稿しました", [
        {
          text: "OK",
          onPress: () => {
            // 何もしない（そのまま投稿画面に留まる）
          },
        },
      ]);
    } catch (error: any) {
      console.error("❌ 予想投稿エラー:", error);
      const errorMessage =
        error.response?.data?.detail || "予想の投稿に失敗しました";
      Alert.alert("エラー", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 選択済みの馬IDリストを取得（重複選択を防ぐ）
  const getDisabledHorseIds = (
    currentPosition: "first" | "second" | "third"
  ) => {
    const disabled: number[] = [];

    if (currentPosition !== "first" && firstPosition) {
      disabled.push(firstPosition);
    }
    if (currentPosition !== "second" && secondPosition) {
      disabled.push(secondPosition);
    }
    if (currentPosition !== "third" && thirdPosition) {
      disabled.push(thirdPosition);
    }

    return disabled;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* タイトル */}
        <Text style={styles.title}>予想を投稿</Text>

        {/* レース選択 */}
        <RaceSelector
          races={races}
          selectedRaceId={selectedRaceId}
          onRaceChange={setSelectedRaceId}
        />

        {/* 馬選択（レース選択後に表示） */}
        {selectedRaceId && horses.length > 0 && (
          <>
            <HorseSelector
              label="1着"
              horses={horses}
              selectedHorseId={firstPosition}
              onHorseChange={setFirstPosition}
              disabledHorseIds={getDisabledHorseIds("first")}
            />

            <HorseSelector
              label="2着"
              horses={horses}
              selectedHorseId={secondPosition}
              onHorseChange={setSecondPosition}
              disabledHorseIds={getDisabledHorseIds("second")}
            />

            <HorseSelector
              label="3着"
              horses={horses}
              selectedHorseId={thirdPosition}
              onHorseChange={setThirdPosition}
              disabledHorseIds={getDisabledHorseIds("third")}
            />
          </>
        )}

        {/* 馬が読み込まれていない場合のメッセージ */}
        {selectedRaceId && horses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              このレースには馬が登録されていません
            </Text>
          </View>
        )}

        {/* 投稿ボタン */}
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
          style={styles.submitButton}
        />

        {/* 予想一覧へのリンク */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/predictions")}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>→ 予想一覧へ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.secondary.main,
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 24,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.neutral.gray600,
    textAlign: "center",
  },
  linkContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    fontSize: 13,
    color: Colors.secondary.main,
  },
});
