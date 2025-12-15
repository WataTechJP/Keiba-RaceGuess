// app/(tabs)/predictions.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/constants/colors";
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
      console.log("予想一覧を読み込み中...");
      const response = await client.get("/api/predictions/");
      setPredictions(response.data);
      console.log("✅ 予想一覧:", response.data.length, "件");
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
    <View style={styles.predictionCard}>
      {/* ヘッダー */}
      <View style={styles.cardHeader}>
        <View style={styles.raceInfo}>
          <Text style={styles.raceName}>{item.race.name}</Text>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={Colors.status.error}
          />
        </TouchableOpacity>
      </View>

      {/* 予想内容 */}
      <View style={styles.positions}>
        <View style={styles.positionRow}>
          <View style={[styles.badge, styles.firstBadge]}>
            <Text style={styles.badgeText}>1着</Text>
          </View>
          <Text style={styles.horseName}>{item.first_position.name}</Text>
        </View>

        <View style={styles.positionRow}>
          <View style={[styles.badge, styles.secondBadge]}>
            <Text style={styles.badgeText}>2着</Text>
          </View>
          <Text style={styles.horseName}>{item.second_position.name}</Text>
        </View>

        <View style={styles.positionRow}>
          <View style={[styles.badge, styles.thirdBadge]}>
            <Text style={styles.badgeText}>3着</Text>
          </View>
          <Text style={styles.horseName}>{item.third_position.name}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* タイトル */}
      <View style={styles.header}>
        <Text style={styles.title}>予想一覧</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/submit")}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={32} color={Colors.secondary.main} />
        </TouchableOpacity>
      </View>

      {predictions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏇</Text>
          <Text style={styles.emptyTitle}>まだ予想がありません</Text>
          <Text style={styles.emptyText}>
            「投稿する」ボタンから予想を投稿しましょう！
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/submit")}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>予想を投稿する</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPrediction}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.secondary.main,
  },
  addButton: {
    padding: 4,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  predictionCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  raceInfo: {
    flex: 1,
  },
  raceName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.gray800,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.neutral.gray500,
  },
  deleteButton: {
    padding: 4,
  },
  positions: {
    gap: 8,
  },
  positionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    width: 48,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  firstBadge: {
    backgroundColor: "#fbbf24",
  },
  secondBadge: {
    backgroundColor: "#d1d5db",
  },
  thirdBadge: {
    backgroundColor: "#cd7f32",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.neutral.white,
  },
  horseName: {
    fontSize: 14,
    color: Colors.neutral.gray800,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.neutral.gray800,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.neutral.gray600,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.secondary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
