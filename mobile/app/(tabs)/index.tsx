// app/(tabs)/index.tsx (修正版)
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../src/constants/colors";
import client from "../../src/api/client";

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

export default function HomeScreen() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]); // 初期値を空配列に
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      console.log("予想一覧を読み込み中...");
      const response = await client.get("/api/predictions/");

      // レスポンスが配列かチェック
      if (Array.isArray(response.data)) {
        setPredictions(response.data);
        console.log("✅ 予想一覧:", response.data.length, "件");
      } else {
        console.error("❌ レスポンスが配列ではありません:", response.data);
        setPredictions([]);
      }
    } catch (error) {
      console.error("❌ 予想読み込みエラー:", error);
      setPredictions([]); // エラー時も空配列をセット
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPredictions();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* タイトル */}
        <Text style={styles.title}>ホーム</Text>

        {/* 予想一覧セクション */}
        <Text style={styles.sectionTitle}>俺の予想</Text>

        {predictions.length > 0 ? (
          predictions.map((prediction) => (
            <View key={prediction.id} style={styles.card}>
              <Text style={styles.cardTitle}>{prediction.race.name}</Text>
              <View style={styles.positions}>
                <View style={styles.positionRow}>
                  <View style={[styles.badge, styles.firstBadge]}>
                    <Text style={styles.badgeText}>1着</Text>
                  </View>
                  <Text style={styles.horseName}>
                    {prediction.first_position.name}
                  </Text>
                </View>
                <View style={styles.positionRow}>
                  <View style={[styles.badge, styles.secondBadge]}>
                    <Text style={styles.badgeText}>2着</Text>
                  </View>
                  <Text style={styles.horseName}>
                    {prediction.second_position.name}
                  </Text>
                </View>
                <View style={styles.positionRow}>
                  <View style={[styles.badge, styles.thirdBadge]}>
                    <Text style={styles.badgeText}>3着</Text>
                  </View>
                  <Text style={styles.horseName}>
                    {prediction.third_position.name}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏇</Text>
            <Text style={styles.emptyTitle}>まだ予想がありません</Text>
            <Text style={styles.emptyText}>予想を投稿してみましょう！</Text>
          </View>
        )}
      </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.gray800,
    marginBottom: 16,
  },
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.gray800,
    marginBottom: 12,
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
    padding: 32,
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
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
  },
});
