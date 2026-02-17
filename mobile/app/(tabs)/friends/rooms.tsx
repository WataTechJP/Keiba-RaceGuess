import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../src/api/client";
import type { Room } from "@/types/friends";

export default function RoomsScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/groups/");
      setRooms(response.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleJoinRoom = async (roomId: number) => {
    try {
      await api.post(`/api/groups/${roomId}/join/`);
      fetchRooms();
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  return (
    <View className="flex-1 bg-transparent">
      {/* ルーム作成ボタン */}
      <View className="mx-4 mt-4 mb-4">
        <TouchableOpacity className="bg-white rounded-2xl p-4 shadow-lg flex-row items-center justify-center">
          <Ionicons name="add-circle" size={24} color="#22c55e" />
          <Text className="text-keiba-600 font-bold text-base ml-2">
            新しいルームを作成
          </Text>
        </TouchableOpacity>
      </View>

      {/* ルーム一覧 */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : rooms.length === 0 ? (
        <View className="bg-white mx-4 rounded-2xl p-8 items-center shadow-lg">
          <Text className="text-6xl mb-4">🏠</Text>
          <Text className="text-xl font-bold text-text-primary mb-2">
            まだルームがありません
          </Text>
          <Text className="text-sm text-text-secondary text-center">
            ルームを作成して友達と予想を楽しもう！
          </Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-lg">
              {/* ルーム名 */}
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full bg-keiba-100 items-center justify-center mr-3">
                  <Ionicons name="home" size={20} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-text-primary">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    {item.member_count} メンバー
                  </Text>
                </View>
              </View>

              {/* 参加ボタン */}
              <TouchableOpacity
                className="bg-keiba-500 py-3 rounded-xl items-center"
                onPress={() => handleJoinRoom(item.id)}
              >
                <Text className="text-white font-bold">参加する</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
