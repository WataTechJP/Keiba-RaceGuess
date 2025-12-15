// src/types/friends.ts
export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
}

export interface FriendsData {
  users: User[];
  followed_users: number[];
}
