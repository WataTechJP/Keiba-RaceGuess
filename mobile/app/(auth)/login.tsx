import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
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

export default function LoginPage() {
  const { signIn, loading, error, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      await signIn({ username, password });
      router.replace("/(tabs)");
    } catch {
      // エラー表示は context が担当
    }
  };

  const isFormValid = username.trim() !== "" && password.trim() !== "";

  return (
    <View className="flex-1 bg-white">
      {/* Header Section */}
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Keiba Battle
          </Text>
          <Text className="text-base text-gray-500 text-center">
            アカウントでログインしてください
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-600 text-center">{error}</Text>
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
        <View className="flex-row justify-center items-center gap-2 mt-6">
          <Text className="text-gray-600">アカウントを持っていませんか？</Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="text-blue-600 font-semibold">
                サインアップへ
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
