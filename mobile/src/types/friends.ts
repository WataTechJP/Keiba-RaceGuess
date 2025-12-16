export type User = {
  id: number;
  username: string;
  email: string;
  bio?: string;
};

export type FriendsData = {
  users: User[];
  followed_users: number[];
}
