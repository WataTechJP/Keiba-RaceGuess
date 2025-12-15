import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Link } from "expo-router";
import client from "../../src/api/client";

type Race = {
  id: number;
  name: string;
};

type Prediction = {
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

export default function TimelineScreen() {
  const [races, setRaces] = useState<Race[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const loadData = async (raceId?: string) => {
    setLoading(true);
    try {
      const racePromise = client.get<Race[]>("/api/races/");
      const params = raceId ? { params: { race_id: raceId } } : undefined;
      const predictionPromise = client.get<Prediction[]>(
        "/api/predictions/timeline/",
        params
      );
      const [raceRes, predictionRes] = await Promise.all([
        racePromise,
        predictionPromise,
      ]);
      setRaces(raceRes.data);
      setPredictions(predictionRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (value: string) => {
    setSelectedRace(value);
    loadData(value || undefined);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>TimeLine</Text>
          <Text style={styles.subtitle}>
            あなたとフレンドの最新予想をチェックしよう
          </Text>
        </View>
        <Link href="/submit" style={styles.primaryButton}>
          ＋ 予想を作成
        </Link>
      </View>

      <View style={styles.filter}>
        <Text style={styles.filterLabel}>レースで絞り込み:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedRace}
            onValueChange={handleFilterChange}
            style={styles.picker}
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

      <FlatList
        data={predictions}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => loadData(selectedRace || undefined)}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ProfileImage uri={item.user.profile_image_url} />
              <View>
                <Text style={styles.cardUser}>{item.user.username} の予想</Text>
                <Text style={styles.cardRace}>{item.race_name}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text>🥇 {item.first_position_name}</Text>
              <Text>🥈 {item.second_position_name}</Text>
              <Text>🥉 {item.third_position_name}</Text>
            </View>
            <Text style={styles.cardTimestamp}>
              {new Date(item.created_at).toLocaleString("ja-JP")}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>まだ予想が表示されていません。</Text>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : (
            <Link href="/friends" style={styles.secondaryLink}>
              ← フレンド一覧へ
            </Link>
          )
        }
      />
    </View>
  );
}

const ProfileImage = ({ uri }: { uri?: string }) => {
  if (uri) {
    return <Image source={{ uri }} style={styles.avatar} resizeMode="cover" />;
  }
  return (
    <View style={[styles.avatar, styles.avatarPlaceholder]}>
      <Text style={{ color: "#6B7280", fontWeight: "bold" }}>??</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F4F6",
  },
  header: {
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2563EB",
  },
  subtitle: {
    fontSize: 14,
    color: "#111827",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    color: "white",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  filter: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  filterLabel: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    height: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  cardUser: {
    color: "#6B7280",
    fontSize: 12,
  },
  cardRace: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563EB",
  },
  cardBody: {
    marginTop: 12,
    gap: 4,
  },
  cardTimestamp: {
    marginTop: 8,
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 40,
  },
  secondaryLink: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 16,
  },
});
