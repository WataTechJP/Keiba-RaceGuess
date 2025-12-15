// src/components/prediction/RaceSelector.tsx (モーダル版)
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
    <View style={styles.container}>
      <Text style={styles.label}>レース</Text>

      {/* 選択ボタン */}
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.selectButtonText,
            !selectedRace && styles.placeholderText,
          ]}
        >
          {selectedRace ? selectedRace.name : "レースを選択してください"}
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
              <Text style={styles.modalTitle}>レースを選択</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={races}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.raceItem,
                    item.id === selectedRaceId && styles.selectedRaceItem,
                  ]}
                  onPress={() => handleSelect(item.id)}
                >
                  <Text
                    style={[
                      styles.raceItemText,
                      item.id === selectedRaceId && styles.selectedRaceItemText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.id === selectedRaceId && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
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
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    maxHeight: "60%",
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
  raceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  selectedRaceItem: {
    backgroundColor: Colors.primary.light,
  },
  raceItemText: {
    fontSize: 16,
    color: Colors.neutral.gray900,
  },
  selectedRaceItemText: {
    color: Colors.primary.main,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary.main,
  },
});
