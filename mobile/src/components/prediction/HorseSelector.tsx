// src/components/prediction/HorseSelector.tsx (モーダル版 / nativewind)
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";

interface Horse {
  id: number;
  name: string;
}

interface HorseSelectorProps {
  label: string;
  horses: Horse[];
  selectedHorseId: number | null;
  onHorseChange: (horseId: number | null) => void;
  disabledHorseIds: number[];
}

export function HorseSelector({
  label,
  horses,
  selectedHorseId,
  onHorseChange,
  disabledHorseIds,
}: HorseSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedHorse = horses.find((h) => h.id === selectedHorseId);

  const handleSelect = (horseId: number) => {
    if (!disabledHorseIds.includes(horseId)) {
      onHorseChange(horseId);
      setModalVisible(false);
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-2">{label}</Text>

      {/* 選択ボタン */}
      <TouchableOpacity
        className="flex-row justify-between items-center bg-white border border-gray-300 rounded-lg px-4 py-4 min-h-[50px]"
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text
          className={`text-base flex-1 ${
            selectedHorse ? "text-gray-900" : "text-gray-500"
          }`}
          numberOfLines={1}
        >
          {selectedHorse ? selectedHorse.name : "馬を選択してください"}
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
          {/* モーダル本体 */}
          <Pressable
            className="bg-white rounded-2xl max-h-[60%] overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <View className="flex-row justify-between items-center px-5 py-5 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                {label}を選択
              </Text>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-1"
                activeOpacity={0.8}
              >
                <Text className="text-2xl text-gray-600">✕</Text>
              </TouchableOpacity>
            </View>

            {/* 馬リスト */}
            <FlatList
              data={horses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isDisabled = disabledHorseIds.includes(item.id);
                const isSelected = item.id === selectedHorseId;

                return (
                  <TouchableOpacity
                    disabled={isDisabled}
                    onPress={() => handleSelect(item.id)}
                    activeOpacity={0.85}
                    className={`
                      flex-row justify-between items-center px-4 py-4 border-b border-gray-100
                      ${isSelected ? "bg-emerald-50" : "bg-white"}
                      ${isDisabled ? "bg-gray-50" : ""}
                    `}
                  >
                    <Text
                      className={`
                        text-base flex-1
                        ${
                          isDisabled
                            ? "text-gray-400"
                            : isSelected
                            ? "text-emerald-600 font-semibold"
                            : "text-gray-900"
                        }
                      `}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>

                    {isDisabled && (
                      <Text className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        選択済み
                      </Text>
                    )}

                    {isSelected && !isDisabled && (
                      <Text className="ml-2 text-xl text-emerald-600">✓</Text>
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
