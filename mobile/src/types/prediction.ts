export type Race = {
  id: number;
  name: string;
  date?: string;
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
  race: {
    id: number;
    name: string;
  };
  first_position: {
    id: number;
    name: string;
  };
  second_position: {
    id: number;
    name: string;
  };
  third_position: {
    id: number;
    name: string;
  };
  created_at: string;
};

export type TimelinePrediction = {
  id: number;
  race_name: string;
  first_position_name: string;
  second_position_name: string;
  third_position_name: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    email: string;
    profile_image_url?: string;
  };
};
