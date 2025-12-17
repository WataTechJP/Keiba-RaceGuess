// src/components/friends/UserCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/colors";

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
}

interface UserCardProps {
  user: User;
  currentUserId: number;
  isFollowing: boolean;
  onFollow: (userId: number) => void;
  onUnfollow: (userId: number) => void;
}

export function UserCard({
  user,
  currentUserId,
  isFollowing,
  onFollow,
  onUnfollow,
}: UserCardProps) {
  const isCurrentUser = user.id === currentUserId;
  const initial = user.username.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* ユーザー情報 */}
      <View style={styles.userInfo}>
        {/* アバター */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        {/* テキスト情報 */}
        <View style={styles.textContainer}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.bio && (
            <Text style={styles.bio} numberOfLines={1}>
              {user.bio}
            </Text>
          )}
        </View>
      </View>

      {/* フォローボタン */}
      <View style={styles.buttonContainer}>
        {isCurrentUser ? (
          <View style={styles.currentUserBadge}>
            <Text style={styles.currentUserText}>あなた</Text>
          </View>
        ) : isFollowing ? (
          <TouchableOpacity
            style={styles.followingButton}
            onPress={() => onUnfollow(user.id)}
          >
            <Text style={styles.followingButtonText}>✓ フォロー中</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.followButton}
            onPress={() => onFollow(user.id)}
          >
            <Text style={styles.followButtonText}>+ フォローする</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.neutral.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary.main,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.neutral.white,
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.gray800,
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: Colors.neutral.gray500,
    marginBottom: 2,
  },
  bio: {
    fontSize: 11,
    color: Colors.neutral.gray400,
    marginTop: 2,
  },
  buttonContainer: {
    marginLeft: 8,
  },
  currentUserBadge: {
    backgroundColor: Colors.neutral.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  currentUserText: {
    fontSize: 13,
    color: Colors.neutral.gray500,
  },
  followButton: {
    backgroundColor: Colors.secondary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.neutral.white,
  },
  followingButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followingButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#dc2626",
  },
});
