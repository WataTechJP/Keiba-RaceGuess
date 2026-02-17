import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

type Props = {
  onSuccess?: () => void; // 登録成功したらモーダル閉じたい
};

export function RegisterForm({ onSuccess }: Props) {
  const { signUp, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isFormValid = username.trim() !== "" && password.trim() !== "";

  const handleSubmit = async () => {
    if (!isFormValid || loading) return;

    try {
      await signUp({ username, password, email: email || undefined });
      showSuccess(
        "Account created",
        `Welcome to Keiba Battle, ${username}さん! 🐎`
      );
      // ✅ 登録成功 → モーダル閉じる（任意）
      onSuccess?.();

      // ✅ そのままtabsへ（今まで通り）
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 500);
    } catch {
      showError(
        "Sign up failed",
        "ユーザー名が既に使われているか、入力内容に問題があります"
      );
    }
  };

  return (
    <View className="gap-4 mb-12">
      {/* Error */}
      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4">
          <Text className="text-red-600 text-center">{error}</Text>
        </View>
      ) : null}

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

      {/* Email */}
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">メール</Text>
        <TextInput
          placeholder="メール"
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
  );
}
