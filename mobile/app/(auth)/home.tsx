import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";

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
    gradient: ["#4ade80", "#38bdf8"],
  },
  {
    emoji: "👫",
    title: "みんなで楽しい",
    description: "フォロー・グループ機能で仲間と一緒に盛り上がろう。",
    gradient: ["#c084fc", "#f472b6"],
  },
];

export default function HomeTabScreen() {
  const { user } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <View style={styles.hero}>
        <Text style={styles.heroSubtitle}>競馬予想ゲーム</Text>
        <Text style={styles.heroTitle}>🏇 Keiba-Battle</Text>
        <Text style={styles.heroDescription}>
          友達と競い合う、新感覚の競馬予想ゲーム！
        </Text>

        <View style={styles.heroBadges}>
          {[
            { emoji: "📈", label: "予想で競争" },
            { emoji: "👥", label: "仲間とバトル" },
            { emoji: "🏆", label: "ランキング" },
          ].map((badge) => (
            <View key={badge.label} style={styles.badge}>
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeText}>
            <Text style={{ fontWeight: "bold" }}>{user?.username}</Text> さん、
            ようこそ！
          </Text>
          <Link href="/" style={styles.primaryButton}>
            予想を始める →
          </Link>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🎮 ゲームの仕組み</Text>
        <View style={{ gap: 16 }}>
          {STEPS.map((step) => (
            <View key={step.title} style={styles.step}>
              <View
                style={[
                  styles.stepIcon,
                  { backgroundColor: step.accent ?? "#e5e7eb" },
                ]}
              >
                <Text style={{ fontSize: 26 }}>{step.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 16 }}>
        {FEATURES.map((feature) => (
          <View key={feature.title} style={styles.featureCard}>
            <Text style={styles.featureEmoji}>{feature.emoji}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sampleCard}>
        <Text style={styles.sampleTitle}>📱 こんな感じで予想します</Text>
        <View style={styles.sampleInner}>
          <Text style={styles.sampleRace}>🏁 第4R 新馬戦</Text>
          <View style={{ gap: 8 }}>
            <Row label="1着予想" value="3番 サクラチャンス" color="#2563EB" />
            <Row label="2着予想" value="7番 ミラクルホース" color="#16A34A" />
            <Row label="3着予想" value="1番 スピードスター" color="#CA8A04" />
          </View>
          <Text style={styles.sampleNote}>
            💬 「3番の血統が良い！今回は堅く行きます」
          </Text>
        </View>
        <Text style={styles.sampleFooter}>
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
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b81e1e",
  },
  hero: {
    backgroundColor: "#1e1b4b",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  heroSubtitle: {
    color: "#60a5fa",
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  heroDescription: {
    color: "#e0e7ff",
    fontSize: 16,
    marginBottom: 16,
  },
  heroBadges: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeEmoji: {
    fontSize: 20,
  },
  badgeLabel: {
    color: "white",
  },
  welcomeBox: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  welcomeText: {
    color: "white",
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: "#22c55e",
    color: "white",
    paddingVertical: 12,
    borderRadius: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
  },
  step: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  stepDescription: {
    color: "#4B5563",
  },
  featureCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  featureDescription: {
    color: "#4B5563",
  },
  sampleCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sampleTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  sampleInner: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sampleRace: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  sampleNote: {
    fontSize: 12,
    color: "#6B7280",
  },
  sampleFooter: {
    textAlign: "center",
    color: "#4B5563",
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLabel: {
    color: "#374151",
  },
  rowValue: {
    fontWeight: "bold",
  },
});
