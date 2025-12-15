// src/types/prediction.ts
export interface Race {
  id: number;
  name: string;
  date?: string;
}

export interface Horse {
  id: number;
  name: string;
  number?: string;
}

export interface PredictionFormData {
  race_id: number;
  first_position: number;
  second_position: number;
  third_position: number;
}

export interface Prediction {
  id: number;
  race: Race;
  first_position: Horse;
  second_position: Horse;
  third_position: Horse;
  created_at: string;
}
