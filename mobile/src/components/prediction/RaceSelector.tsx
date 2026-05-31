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
  date?: string;
  location?: string;
}

interface RaceSelectorProps {
  races: Race[];
  selectedRaceId: number | null;
  now: Date;
  disableClosedRaces?: boolean;
  // ✅ null も受け取れるように変更
  onRaceChange: (raceId: number | null) => void;
}

const POST_DEADLINE_OFFSET_MS = 60 * 1000;

function getPostDeadline(race: Race) {
  if (!race.date) return null;
  return new Date(new Date(race.date).getTime() - POST_DEADLINE_OFFSET_MS);
}

function formatDeadlineLabel(race: Race, now: Date) {
  const deadline = getPostDeadline(race);
  if (!deadline) return "締切未設定";

  const remainingMs = deadline.getTime() - now.getTime();
  if (remainingMs <= 0) return "締切済み";

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `締切まで ${days}日 ${hours}時間 ${minutes}分`;
  }

  if (hours > 0) {
    return `締切まで ${hours}時間 ${minutes}分`;
  }

  return `締切まで ${Math.max(minutes, 1)}分`;
}

function isRaceClosed(race: Race, now: Date) {
  const deadline = getPostDeadline(race);
  return Boolean(deadline && now.getTime() >= deadline.getTime());
}

export function RaceSelector({
  races,
  selectedRaceId,
  now,
  disableClosedRaces = true,
  onRaceChange,
}: RaceSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedRace = races.find((r) => r.id === selectedRaceId);

  // ✅ 同じのを選んだら解除（null）
  const handleSelect = (raceId: number) => {
    const race = races.find((r) => r.id === raceId);
    if (disableClosedRaces && race && isRaceClosed(race, now)) return;

    const nextRaceId = selectedRaceId === raceId ? null : raceId;
    onRaceChange(nextRaceId);
    setModalVisible(false);
  };

  return (
    <View>
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
                const isClosed = isRaceClosed(item, now);
                const disabled = disableClosedRaces && isClosed;
                const deadlineLabel = formatDeadlineLabel(item, now);

                return (
                  <TouchableOpacity
                    className={`flex-row justify-between items-center px-4 py-4 border-b border-gray-100 ${
                      isSelected ? "bg-emerald-50" : disabled ? "bg-gray-50" : "bg-white"
                    }`}
                    onPress={() => handleSelect(item.id)}
                    activeOpacity={disabled ? 1 : 0.85}
                    disabled={disabled}
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className={`text-base ${
                          isSelected
                            ? "text-emerald-600 font-semibold"
                            : disabled
                              ? "text-gray-400"
                              : "text-gray-900"
                        }`}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        className={`text-xs mt-1 ${
                          isClosed ? "text-red-500" : "text-gray-500"
                        }`}
                        numberOfLines={1}
                      >
                        {deadlineLabel}
                      </Text>
                    </View>

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
