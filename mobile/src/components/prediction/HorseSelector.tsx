// src/components/prediction/HorseSelector.tsx (モーダル版)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { Colors } from "../../constants/colors";

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
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* 選択ボタン */}
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.selectButtonText,
            !selectedHorse && styles.placeholderText,
          ]}
        >
          {selectedHorse ? selectedHorse.name : "馬を選択してください"}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* モーダル */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}を選択</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={horses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isDisabled = disabledHorseIds.includes(item.id);
                const isSelected = item.id === selectedHorseId;

                return (
                  <TouchableOpacity
                    style={[
                      styles.horseItem,
                      isSelected && styles.selectedHorseItem,
                      isDisabled && styles.disabledHorseItem,
                    ]}
                    onPress={() => handleSelect(item.id)}
                    disabled={isDisabled}
                  >
                    <Text
                      style={[
                        styles.horseItemText,
                        isSelected && styles.selectedHorseItemText,
                        isDisabled && styles.disabledHorseItemText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isDisabled && (
                      <Text style={styles.disabledLabel}>選択済み</Text>
                    )}
                    {isSelected && !isDisabled && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.neutral.gray700,
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.gray300,
    borderRadius: 8,
    padding: 16,
    minHeight: 50,
  },
  selectButtonText: {
    fontSize: 16,
    color: Colors.neutral.gray900,
    flex: 1,
  },
  placeholderText: {
    color: Colors.neutral.gray500,
  },
  arrow: {
    fontSize: 12,
    color: Colors.neutral.gray600,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center", // ← 中央に変更
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    maxHeight: "60%", // ← 高さ調整
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.gray900,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.neutral.gray600,
  },
  horseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  selectedHorseItem: {
    backgroundColor: Colors.primary.light,
  },
  disabledHorseItem: {
    backgroundColor: Colors.neutral.gray50,
  },
  horseItemText: {
    fontSize: 16,
    color: Colors.neutral.gray900,
    flex: 1,
  },
  selectedHorseItemText: {
    color: Colors.primary.main,
    fontWeight: "600",
  },
  disabledHorseItemText: {
    color: Colors.neutral.gray400,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary.main,
  },
  disabledLabel: {
    fontSize: 12,
    color: Colors.neutral.gray500,
    backgroundColor: Colors.neutral.gray200,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
