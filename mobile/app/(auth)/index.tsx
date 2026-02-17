import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const STEPS = [
  {
    emoji: "1️⃣",
    title: "レースを選んで予想",
    description:
      "気になるレースの1着〜3着を選んで勝負。分析派も直感派も大歓迎！",
    accent: "#bfdbfe",
  },
  {
    emoji: "2️⃣",
    title: "仲間と競争",
    description: "フォローやグループ機能で、友達同士のバトルも盛り上がる。",
    accent: "#bbf7d0",
  },
  {
    emoji: "3️⃣",
    title: "結果発表・ランキング",
    description: "レース後の答え合わせでランキングが決定。競馬王を目指そう！",
    accent: "#fef3c7",
  },
];

const FEATURES = [
  {
    emoji: "💰",
    title: "完全無料",
    description: "お金は不要。純粋な予想力だけで勝負できます。",
  },
  {
    emoji: "👫",
    title: "みんなで楽しい",
    description: "フォロー・グループ機能で仲間と一緒に盛り上がろう。",
  },
];

export default function HomeTabScreen() {
  const { user } = useAuth();

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      {/* Hero */}
      <View className="bg-[#1e1b4b] rounded-2xl p-6 shadow-lg shadow-black/20">
        <Text className="text-[#60a5fa] font-semibold tracking-widest mb-1">
          競馬予想ゲーム
        </Text>
        <Text className="text-white text-3xl font-bold mb-2">
          🏇 Keiba-Battle
        </Text>
        <Text className="text-indigo-100 text-base mb-4">
          友達と競い合う、新感覚の競馬予想ゲーム！
        </Text>

        {/* Badges */}
        <View className="flex-row justify-between mb-4">
          {[
            { emoji: "📈", label: "予想で競争" },
            { emoji: "👥", label: "仲間とバトル" },
            { emoji: "🏆", label: "ランキング" },
          ].map((badge) => (
            <View key={badge.label} className="flex-row items-center gap-1.5">
              <Text className="text-xl">{badge.emoji}</Text>
              <Text className="text-white">{badge.label}</Text>
            </View>
          ))}
        </View>

        {/* Welcome */}
        <View className="border border-white/20 rounded-xl p-4 bg-white/10">
          {/* NOTE: LinkにclassNameを当てる想定。効かない場合はPressable+routerにしてね */}
          <Pressable
            onPress={() => router.replace("/(auth)/login")}
            className="py-2 px-2"
          >
            <Text className="text-white font-semibold ">
              新規登録・ログインはこちら
              <Ionicons name="play" size={24} color="#dd0b0b" />
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Steps card */}
      <View className="bg-white rounded-2xl p-5 shadow shadow-black/5">
        <Text className="text-[22px] font-bold mb-4 text-gray-900">
          🎮 ゲームの仕組み
        </Text>

        <View className="gap-4">
          {STEPS.map((step) => (
            <View key={step.title} className="flex-row items-center gap-4">
              <View
                className="w-[60px] h-[60px] rounded-full items-center justify-center"
                style={{ backgroundColor: step.accent ?? "#e5e7eb" }}
              >
                <Text className="text-[26px]">{step.emoji}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {step.title}
                </Text>
                <Text className="text-gray-600">{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Features */}
      <View className="gap-4">
        {FEATURES.map((feature) => (
          <View
            key={feature.title}
            className="bg-white rounded-2xl p-5 shadow shadow-black/5"
          >
            <Text className="text-[28px] mb-2">{feature.emoji}</Text>
            <Text className="text-lg font-bold mb-1.5">{feature.title}</Text>
            <Text className="text-gray-600">{feature.description}</Text>
          </View>
        ))}
      </View>

      {/* Sample */}
      <View className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
        <Text className="text-xl font-bold text-center mb-4">
          📱 こんな感じで予想します
        </Text>

        <View className="bg-white rounded-xl p-4 gap-2.5 shadow shadow-black/5">
          <Text className="font-bold mb-1">🏁 第4R 新馬戦</Text>

          <View className="gap-2">
            <Row label="1着予想" value="3番 サクラチャンス" color="#2563EB" />
            <Row label="2着予想" value="7番 ミラクルホース" color="#16A34A" />
            <Row label="3着予想" value="1番 スピードスター" color="#CA8A04" />
          </View>

          <Text className="text-xs text-gray-500 mt-2">
            💬 「3番の血統が良い！今回は堅く行きます」
          </Text>
        </View>

        <Text className="text-center text-gray-600 mt-3">
          シンプルで分かりやすい！初心者でもすぐに参加できます。
        </Text>
      </View>
    </ScrollView>
  );
}

const Row = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <View className="flex-row justify-between">
    <Text className="text-gray-700">{label}</Text>
    <Text className="font-bold" style={{ color }}>
      {value}
    </Text>
  </View>
);
