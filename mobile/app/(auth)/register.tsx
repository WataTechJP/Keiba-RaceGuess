import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";

export default function RegisterPage() {
  const { signUp, loading, error, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    if (!username || !password || loading) {
      return;
    }
    try {
      await signUp({ username, password, email: email || undefined });
      router.replace("/(tabs)");
    } catch {
      // エラーは context が保持
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>アカウント作成</Text>
      <Text style={styles.subtitle}>新規ユーザー登録を行います</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        placeholder="ユーザー名"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="メール（任意）"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="パスワード"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Button
        title={loading ? "作成中..." : "登録する"}
        onPress={handleSubmit}
      />

      <View style={styles.footer}>
        <Text>既にアカウントがありますか？</Text>
        <Link href="/(auth)/login" style={styles.link}>
          ログインへ
        </Link>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
  },
  error: {
    color: "#DC2626",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  link: {
    color: "#2563EB",
    fontWeight: "bold",
  },
});
