// src/constants/colors.ts
// これまでのプロジェクトで使用してきたカラー定義

export const Colors = {
  // プライマリカラー（緑系）
  primary: {
    main: '#22c55e',      // メインの緑
    light: '#4ade80',     // 明るい緑
    dark: '#16a34a',      // 暗い緑
  },

  // セカンダリカラー（青系）
  secondary: {
    main: '#3b82f6',      // メインの青
    light: '#60a5fa',     // 明るい青
    dark: '#2563eb',      // 暗い青
  },

  // アクセントカラー（紫系）
  accent: {
    purple: '#7c3aed',    // 紫
    pink: '#ec4899',      // ピンク
  },

  // ニュートラルカラー（グレースケール）
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
  },

  // ステータスカラー
  status: {
    success: '#22c55e',   // 成功（緑）
    error: '#ef4444',     // エラー（赤）
    warning: '#f59e0b',   // 警告（オレンジ）
    info: '#3b82f6',      // 情報（青）
  },

  // 背景カラー
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
  },
};

// グラデーション定義
export const Gradients = {
  hero: ['#2563eb', '#7c3aed'],           // 青→紫
  primary: ['#22c55e', '#16a34a'],        // 緑のグラデーション
  secondary: ['#3b82f6', '#2563eb'],      // 青のグラデーション
  cta: ['#7c3aed', '#ec4899'],            // 紫→ピンク
};
