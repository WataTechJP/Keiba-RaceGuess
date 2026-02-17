import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { showSuccess, showError } from "@/utils/toast";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import * as LocalAuthentication from "expo-local-authentication";
import { InfoModal } from "@/components/common/InfoModal";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function LoginPage() {
  const { signIn, loading, error, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password || loading) return;

    try {
      await signIn({ username, password });

      showSuccess("Login successful", `おかえりなさい！${username}さん`);

      // ✅ 少し待ってから遷移（これ超大事）
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 500);
    } catch (err) {
      showError("Login failed", "ユーザー名またはパスワードが違います");
    }
  };

  const isFormValid = username.trim() !== "" && password.trim() !== "";

  const biometricLogin = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) return;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Login with Face ID",
    });

    if (result.success) {
      // SecureStore から token を取り出してログイン
      router.replace("/(tabs)");
    }
  };

  return (
    <>
      <View className="flex-1 bg-transparent">
        {/* Header Section */}
        <View className="flex-1 justify-center px-6">
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold text-text-primary mb-2">
              Keiba Battle
            </Text>
            <Text className="text-base text-text-primary text-center">
              アカウントでログインしてください
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-accent-red text-center">{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View className="gap-4">
            {/* Username Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                ユーザー名
              </Text>
              <TextInput
                placeholder="ユーザー名を入力"
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

            {/* Password Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                パスワード
              </Text>
              <View className="relative">
                <TextInput
                  placeholder="パスワードを入力"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  textContentType="password"
                  autoComplete="password"
                  className="border border-gray-300 rounded-xl px-4 py-3.5 pr-12 text-base bg-white"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5"
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
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
                  ログイン
                </Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View className="flex-col">
            <View className="flex-row justify-center items-center gap-2 mt-6">
              <Text className="text-gray-600">
                アカウントを持っていませんか？
              </Text>
              <Pressable onPress={() => setRegisterOpen(true)}>
                <Text className="text-blue-600 font-semibold">
                  サインアップへ
                </Text>
              </Pressable>
            </View>
            <View className="items-center">
              <Pressable
                onPress={() => router.replace("/")}
                className="py-2 px-2"
              >
                <Text className="text-blue-600 font-semibold underline">
                  Keiba Battleについてはこちら
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      <InfoModal
        visible={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="サインアップ"
      >
        <RegisterForm onSuccess={() => setRegisterOpen(false)} />
      </InfoModal>
    </>
  );
}
