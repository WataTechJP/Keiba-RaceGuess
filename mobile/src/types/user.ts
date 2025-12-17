// src/types/user.ts
export type User = {
  id: number;
  username: string;
  email: string;
  profile_image_url?: string;
}

export type UserProfile = {
  id: number;
  user: User;
  profile_image: string | null;
  profile_image_url: string | null;
  updated_at: string;
}

// タイムラインなどで使う簡易版
export type UserBasic = {
  username: string;
  profile_image_url: string | null;
}

// プロフィール画面で使う詳細版
export type UserDetail = {
  id: number;
  username: string;
  email: string;
  profile: {
    profile_image_url: string | null;
    updated_at: string;
  };
  // 統計情報
  predictions_count?: number;
  hit_rate?: number;
  points?: number;
  followers_count?: number;
  following_count?: number;
}
