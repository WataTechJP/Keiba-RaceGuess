// src/components/friends/EmptyState.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

interface EmptyStateProps {
  type: "initial" | "no-results" | "no-following";
  searchQuery?: string;
}

export function EmptyState({ type, searchQuery }: EmptyStateProps) {
  if (type === "initial") {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>フレンドを見つけよう！</Text>
        <Text style={styles.description}>
          上の検索ボックスにメールアドレスまたはユーザー名を入力して、
          {"\n"}
          フレンドを検索してみてください。
        </Text>
      </View>
    );
  }

  if (type === "no-results") {
    return (
      <View style={styles.container}>
        <Text style={styles.emojiLarge}>🔍</Text>
        <Text style={styles.title}>検索結果が見つかりません</Text>
        <Text style={styles.description}>
          「{searchQuery}」に一致するユーザーが見つかりませんでした。
        </Text>
        <Text style={styles.hint}>
          正確なメールアドレスまたはユーザー名を入力してください。
        </Text>
      </View>
    );
  }

  if (type === "no-following") {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.title}>まだフォローしているユーザーがいません</Text>
        <Text style={styles.description}>
          上の検索機能を使って、フレンドを見つけてフォローしてみましょう！
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emojiLarge: {
    fontSize: 96,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.neutral.gray800,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: Colors.neutral.gray600,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    color: Colors.neutral.gray400,
    textAlign: "center",
  },
});
