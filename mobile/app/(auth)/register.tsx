import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
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

  const handleSubmit = async () => {
    if (!username || !password || loading) return;

    try {
      await signUp({ username, password, email: email || undefined });
      router.replace("/(tabs)");
    } catch {
      // エラーは context が保持
    }
  };

  const isFormValid = username.trim() !== "" && password.trim() !== "";

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      {/* Title */}
      <View className="items-center mb-6">
        <Text className="text-3xl font-bold text-gray-900">アカウント作成</Text>
        <Text className="text-base text-gray-500 mt-2">
          新規ユーザー登録を行います
        </Text>
      </View>

      {/* Error */}
      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <Text className="text-red-600 text-center">{error}</Text>
        </View>
      ) : null}

      {/* Form */}
      <View className="gap-4">
        {/* Username */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            ユーザー名
          </Text>
          <TextInput
            placeholder="ユーザー名"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            editable={!loading}
            textContentType="username"
            autoComplete="username"
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Email (optional) */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            メール（任意）
          </Text>
          <TextInput
            placeholder="メール（任意）"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            textContentType="emailAddress"
            autoComplete="email"
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Password */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            パスワード
          </Text>
          <TextInput
            placeholder="パスワード"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            textContentType="newPassword"
            autoComplete="password-new"
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
          className={`rounded-xl py-4 mt-2 ${
            !isFormValid || loading
              ? "bg-gray-300"
              : "bg-blue-600 active:bg-blue-700"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-center text-base font-semibold">
              登録する
            </Text>
          )}
        </Pressable>
      </View>

      {/* Footer */}
      <View className="flex-row justify-center items-center gap-2 mt-6">
        <Text className="text-gray-600">既にアカウントがありますか？</Text>
        <Pressable onPress={() => router.replace("/(auth)/login")}>
          <Text className="text-blue-600 font-semibold">ログインへ</Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator className="mt-4" /> : null}
    </View>
  );
}
