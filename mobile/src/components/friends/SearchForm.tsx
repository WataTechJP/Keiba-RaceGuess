// src/components/friends/SearchForm.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

interface SearchFormProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function SearchForm({
  searchQuery,
  onSearchChange,
  onSearch,
  onClear,
}: SearchFormProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 フレンドを検索</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>メールアドレスまたはユーザー名で検索</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="example@email.com または ユーザー名"
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
            <Text style={styles.searchButtonText}>検索</Text>
          </TouchableOpacity>
        </View>
      </View>

      {searchQuery !== "" && (
        <View style={styles.resultBar}>
          <Text style={styles.resultText}>
            <Text style={styles.resultQuery}>"{searchQuery}"</Text> の検索結果
          </Text>
          <TouchableOpacity onPress={onClear}>
            <Text style={styles.clearText}>検索をクリア</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 検索のコツ */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 検索のコツ</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• 完全なメールアドレスを入力</Text>
          <Text style={styles.tipItem}>• ユーザー名の一部でも検索可能</Text>
          <Text style={styles.tipItem}>• 大文字・小文字は区別されません</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.gray800,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.neutral.gray700,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.neutral.gray300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: Colors.neutral.white,
  },
  searchButton: {
    backgroundColor: Colors.secondary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  searchButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: "600",
  },
  resultBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultText: {
    color: "#1e40af",
    fontSize: 13,
  },
  resultQuery: {
    fontWeight: "bold",
  },
  clearText: {
    color: "#2563eb",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  tipsContainer: {
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 8,
    padding: 16,
    marginTop: 4,
  },
  tipsTitle: {
    color: "#1e40af",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    color: "#1e3a8a",
    fontSize: 12,
  },
});
