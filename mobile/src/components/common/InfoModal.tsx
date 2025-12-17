// src/components/common/InfoModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function InfoModal({
  visible,
  onClose,
  title,
  children,
}: InfoModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable className="bg-white rounded-t-3xl max-h-[80%]">
          {/* ヘッダー */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={24} color="#3b82f6" />
              <Text className="text-lg font-bold text-gray-800 ml-2">
                {title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-1"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* コンテンツ */}
          <ScrollView className="p-6">{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
