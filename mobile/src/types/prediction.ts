import type { User } from "@/types/user"

export type Race = {
  id: number;
  name: string;
  date?: string;
  location?: string;
}

export type Horse = {
  id: number;
  name: string;
  number?: string;
}

export type PredictionFormData = {
  race_id: number;
  first_position: number;
  second_position: number;
  third_position: number;
}

export type Prediction = {
  id: number;
  race: Race;
  race_name?: string;
  race_date?: string;
  race_location?: string;
  first_position: number;  // ID
  second_position: number;  // ID
  third_position: number;  // ID
  first_position_detail: Horse;  // ⭐ 追加
  second_position_detail: Horse;  // ⭐ 追加
  third_position_detail: Horse;  // ⭐ 追加
  comment: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
};

export type TimelinePrediction = {
  id: number;
  race_name: string;
  race_date: string;
  race_location: string;
  first_position_name: string;
  second_position_name: string;
  third_position_name: string;
  comment: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    email: string;
    profile_image_url?: string;
  };
};

export type PredictionCardProps = {
  id: number;
  race?: Race;
  race_name?: string;
  race_date?: string;
  race_location?: string;
  first_position?: Horse;
  first_position_name?: string;
  second_position?: Horse;
  second_position_name?: string;
  third_position?: Horse;
  third_position_name?: string;
  comment?: string | null;
  created_at: string;
  user?: User;
  showDelete?: boolean;
  onDelete?: (id: number, raceName: string) => void;
  onPress?: (id: number) => void;
  variant?: "mine" | "others";
};
