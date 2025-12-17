export type TabType = "my" | "points" | "hit_rate";

export type RaceResult = {
  id: number;
  race_name: string;
  race_location: string;
  race_date: string;
  predicted_1: string;
  predicted_2: string;
  predicted_3: string;
  actual_1: string;
  actual_2: string;
  actual_3: string;
  score: number;
}

export type UserPoint = {
  points: number;
  hit_rate: number;
}

export type RankingUser = {
  rank: number;
  user_id: number;
  username: string;
  profile_image_url?: string;
  points: number;
  hit_rate: number;
  predictions_count: number;
}

export type RankingType = "points" | "hit_rate";
