import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

type Race = {
  id: number;
  name: string;
  horses: { id: number; name: string }[];
};

type Prediction = {
  id: number;
  race_name: string;
  first_position_detail?: { name: string };
  second_position_detail?: { name: string };
  third_position_detail?: { name: string };
};

const RaceListScreen = () => {
  const { signOut, user } = useAuth();
  const [races, setRaces] = useState<Race[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [raceRes, predictionRes] = await Promise.all([
        client.get<Race[]>("races/"),
        client.get<Prediction[]>("predictions/"),
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>ようこそ</Text>
          <Text style={styles.subtitle}>{user?.username}</Text>
        </View>
        <Button title="ログアウト" onPress={signOut} />
      </View>

      <FlatList
        data={races}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>レース一覧</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>登録馬: {item.horses.length} 頭</Text>
          </View>
        )}
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle}>自分の予想</Text>
            {predictions.map((prediction) => (
              <View key={prediction.id} style={styles.card}>
                <Text style={styles.cardTitle}>{prediction.race_name}</Text>
                <Text>
                  🥇 {prediction.first_position_detail?.name ?? "-"} / 🥈{" "}
                  {prediction.second_position_detail?.name ?? "-"} / 🥉{" "}
                  {prediction.third_position_detail?.name ?? "-"}
                </Text>
              </View>
            ))}
          </>
        }
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardMeta: {
    color: "#6B7280",
  },
});

export default RaceListScreen;
