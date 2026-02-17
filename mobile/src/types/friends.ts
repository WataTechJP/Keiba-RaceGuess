export type User = {
  id: number;
  username: string;
  email: string;
  profile_image_url?: string;
  predictions_count?: number;
};

export type FriendsData = {
  users: User[];
  followed_users: number[];
}

export type Room = {
  id: number;
  name: string;
  description?: string;
  member_count: number;
  created_at: string;
}
