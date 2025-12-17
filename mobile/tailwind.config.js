/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 🏇 Keiba Battle のブランドカラー
        keiba: {
          // メインの緑
          50: "#f0fdf4", // 超薄い緑（背景用）
          100: "#dcfce7", // とても薄い緑
          200: "#bbf7d0", // 薄い緑
          300: "#86efac", // 明るい緑
          400: "#4ade80", // 中間の緑
          500: "#22c55e", // ベースカラー（メイン）
          600: "#16a34a", // やや濃い緑
          700: "#15803d", // 濃い緑
          800: "#166534", // とても濃い緑
          900: "#14532d", // 超濃い緑
          950: "#052e16", // ほぼ黒
          1999: "#4CAF50", //芝生の色
          2000: "#8D6E63", //土の色
          2001: "#87CEEB", //空の色
        },
        // アクセントカラー
        accent: {
          blue: "#3b82f6", // 青（情報）
          red: "#ef4444", // 赤（エラー・削除）
          yellow: "#f59e0b", // 黄色（警告）
          purple: "#8b5cf6", // 紫（特別）
        },
        // 背景色
        background: {
          primary: "#f9fafb", // メイン背景（薄いグレー）
          secondary: "#ffffff", // カード背景（白）
          dark: "#1f2937", // ダークモード用
        },
        // テキストカラー
        text: {
          primary: "#111827", // メインテキスト（濃いグレー）
          secondary: "#6b7280", // サブテキスト（グレー）
          disabled: "#9ca3af", // 無効化テキスト（薄いグレー）
          inverse: "#ffffff", // 反転テキスト（白）
        },
        // ボタンカラー
        button: {
          primary: "#22c55e", // プライマリボタン（緑）
          "primary-hover": "#16a34a", // ホバー時
          secondary: "#f3f4f6", // セカンダリボタン（薄いグレー）
          danger: "#ef4444", // 危険なアクション（赤）
          disabled: "#d1d5db", // 無効化（グレー）
        },
        // ボーダーカラー
        border: {
          light: "#e5e7eb", // 薄いボーダー
          default: "#d1d5db", // 標準ボーダー
          dark: "#9ca3af", // 濃いボーダー
        },
      },
    },
  },
  plugins: [],
};
