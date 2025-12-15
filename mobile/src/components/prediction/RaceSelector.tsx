// src/components/prediction/RaceSelector.tsx (モーダル版 / nativewind)
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";

interface Race {
  id: number;
  name: string;
}

interface RaceSelectorProps {
  races: Race[];
  selectedRaceId: number | null;
  onRaceChange: (raceId: number) => void;
}

export function RaceSelector({
  races,
  selectedRaceId,
  onRaceChange,
}: RaceSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedRace = races.find((r) => r.id === selectedRaceId);

  const handleSelect = (raceId: number) => {
    onRaceChange(raceId);
    setModalVisible(false);
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-2">レース</Text>

      {/* 選択ボタン */}
      <TouchableOpacity
        className="flex-row justify-between items-center bg-white border border-gray-300 rounded-lg px-4 py-4 min-h-[50px]"
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text
          className={`text-base flex-1 ${
            selectedRace ? "text-gray-900" : "text-gray-500"
          }`}
          numberOfLines={1}
        >
          {selectedRace ? selectedRace.name : "レースを選択してください"}
        </Text>
        <Text className="text-xs text-gray-600 ml-2">▼</Text>
      </TouchableOpacity>

      {/* モーダル */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center px-5"
          onPress={() => setModalVisible(false)}
        >
          {/* ここで Pressable の外タップを検知して閉じる。
              modalContent 内タップで閉じないように stopPropagation */}
          <Pressable
            className="bg-white rounded-2xl max-h-[60%] overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <View className="flex-row justify-between items-center px-5 py-5 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                レースを選択
              </Text>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-1"
                activeOpacity={0.8}
              >
                <Text className="text-2xl text-gray-600">✕</Text>
              </TouchableOpacity>
            </View>

            {/* リスト */}
            <FlatList
              data={races}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedRaceId;

                return (
                  <TouchableOpacity
                    className={`flex-row justify-between items-center px-4 py-4 border-b border-gray-100 ${
                      isSelected ? "bg-emerald-50" : "bg-white"
                    }`}
                    onPress={() => handleSelect(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text
                      className={`text-base ${
                        isSelected
                          ? "text-emerald-600 font-semibold"
                          : "text-gray-900"
                      }`}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>

                    {isSelected && (
                      <Text className="text-xl text-emerald-600">✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
