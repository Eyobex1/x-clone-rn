import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { UserProfile } from "@/types";
import * as Haptics from "expo-haptics";

interface UserCardProps {
  user: UserProfile;
  currentUserClerkId: string;
  showFollowButton?: boolean;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
  index?: number;
}

const DEFAULT_AVATAR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFD166",
  "#06D6A0",
  "#118AB2",
  "#EF476F",
  "#9D4EDD",
  "#F97316",
];

const UserCard: React.FC<UserCardProps> = ({
  user,
  currentUserClerkId,
  showFollowButton = true,
  onFollowChange,
  index = 0,
}) => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const isCurrentUser = user.clerkId === currentUserClerkId;

  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  const [optimisticIsFollowing, setOptimisticIsFollowing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const followMutation = useFollowUser(user.username, user.clerkId || "");

  const getAvatarColor = (username: string) => {
    if (!username) return DEFAULT_AVATAR_COLORS[0];
    const hash = username.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return DEFAULT_AVATAR_COLORS[Math.abs(hash) % DEFAULT_AVATAR_COLORS.length];
  };

  const avatarColor = getAvatarColor(user.username);
  const userInitial = (
    user.firstName?.[0] ||
    user.username?.[0] ||
    "U"
  ).toUpperCase();

  // DEBUG: Log user data to see what we're getting
  useEffect(() => {
    console.log("UserCard rendering:", {
      username: user.username,
      followers: user.followers,
      followersType: typeof user.followers,
      followersIsArray: Array.isArray(user.followers),
      posts: user.posts,
      postsType: typeof user.posts,
      postsIsArray: Array.isArray(user.posts),
    });
  }, [user]);

  // Calculate real counts with safety checks
  const getFollowersCount = () => {
    if (!user.followers) return 0;
    if (Array.isArray(user.followers)) {
      return user.followers.length;
    }
    if (typeof user.followers === "number") {
      return user.followers;
    }
    if (typeof user.followers === "string") {
      const num = parseInt(user.followers);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const getPostsCount = () => {
    if (!user.posts) return 0;
    if (Array.isArray(user.posts)) {
      return user.posts.length;
    }
    if (typeof user.posts === "number") {
      return user.posts;
    }
    if (typeof user.posts === "string") {
      const num = parseInt(user.posts);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const followersCount = getFollowersCount();
  const postsCount = getPostsCount();

  useEffect(() => {
    const isFollowing = currentUser?.following?.includes(user.clerkId) || false;
    setOptimisticIsFollowing(isFollowing);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, index * 30);
  }, [user.clerkId, currentUser]);

  const navigateToProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/screens/profile/[username]",
      params: { username: user.username },
    });
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFollowToggle = () => {
    if (!user.clerkId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateButton();

    const newFollowingState = !optimisticIsFollowing;
    setOptimisticIsFollowing(newFollowingState);
    setIsMutating(true);

    if (onFollowChange) {
      onFollowChange(user._id, newFollowingState);
    }

    followMutation.mutate(undefined, {
      onError: () => {
        setOptimisticIsFollowing(!newFollowingState);
        setIsMutating(false);
        if (onFollowChange) {
          onFollowChange(user._id, !newFollowingState);
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      },
      onSuccess: () => {
        setIsMutating(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
    });
  };

  const shouldShowFollowButton = showFollowButton && !isCurrentUser;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className="px-4 py-3.5 bg-white active:bg-gray-50"
    >
      <View className="flex-row items-center">
        {/* Profile Image */}
        <TouchableOpacity onPress={navigateToProfile} activeOpacity={0.7}>
          <View className="relative">
            <View className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500" />
            <View className="w-16 h-16 rounded-full border-4 border-white bg-white overflow-hidden">
              {user.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  className="w-full h-full"
                />
              ) : (
                <View
                  className="w-full h-full items-center justify-center"
                  style={{ backgroundColor: avatarColor }}
                >
                  <Text className="text-white font-bold text-xl">
                    {userInitial}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* User Info */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-start justify-between">
            <TouchableOpacity
              onPress={navigateToProfile}
              activeOpacity={0.7}
              className="flex-1"
            >
              <View className="flex-row items-center flex-wrap">
                <Text className="text-gray-900 font-bold text-base">
                  {user.firstName} {user.lastName}
                </Text>
                {optimisticIsFollowing && (
                  <View className="ml-2 px-2 py-0.5 rounded-full bg-blue-100">
                    <Text className="text-blue-600 text-xs font-semibold">
                      Following
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-500 text-sm mt-0.5">
                @{user.username}
              </Text>

              {user.bio && (
                <Text className="text-gray-800 text-sm mt-2" numberOfLines={2}>
                  {user.bio}
                </Text>
              )}

              {/* Stats - Now showing real counts */}
              <View className="flex-row items-center space-x-4 mt-3">
                <View className="flex-row items-center">
                  <Feather name="users" size={14} color="#6B7280" />
                  <Text className="text-gray-900 font-bold text-sm ml-1.5">
                    {formatNumber(followersCount)}
                  </Text>
                  <Text className="text-gray-500 text-xs ml-0.5">
                    followers
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Feather name="image" size={14} color="#6B7280" />
                  <Text className="text-gray-900 font-bold text-sm ml-1.5">
                    {formatNumber(postsCount)}
                  </Text>
                  <Text className="text-gray-500 text-xs ml-0.5">posts</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Follow Button */}
            {shouldShowFollowButton ? (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  className={`px-4 py-2.5 rounded-full flex-row items-center justify-center min-w-[100px] ${
                    optimisticIsFollowing
                      ? "bg-white border border-gray-300"
                      : "bg-black"
                  } ${isMutating && "opacity-70"}`}
                  onPress={handleFollowToggle}
                  disabled={isMutating}
                  activeOpacity={0.7}
                >
                  {isMutating ? (
                    <ActivityIndicator
                      size="small"
                      color={optimisticIsFollowing ? "#000" : "#fff"}
                    />
                  ) : optimisticIsFollowing ? (
                    <>
                      <MaterialIcons name="check" size={18} color="#000" />
                      <Text className="text-gray-900 font-semibold text-sm ml-2">
                        Following
                      </Text>
                    </>
                  ) : (
                    <>
                      <Feather name="user-plus" size={16} color="#fff" />
                      <Text className="text-white font-semibold text-sm ml-2">
                        Follow
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ) : isCurrentUser ? (
              <TouchableOpacity
                className="px-4 py-2.5 rounded-full border border-gray-300 bg-white"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/profile");
                }}
              >
                <Text className="text-gray-900 font-semibold text-sm">
                  Edit
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="w-9 h-9 rounded-full items-center justify-center"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Open more options
                }}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Mutual Connections */}
      {!isCurrentUser && followersCount > 0 && (
        <View className="mt-3 flex-row items-center">
          <View className="flex-row -space-x-3">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 items-center justify-center"
              >
                <Text className="text-gray-600 text-xs font-semibold">
                  {userInitial}
                </Text>
              </View>
            ))}
          </View>
          <Text className="text-gray-500 text-xs ml-2">
            Followed by {Math.min(3, followersCount)} mutual friends
          </Text>
        </View>
      )}

      {/* Verification Badge */}
      {followersCount > 10000 && (
        <View className="mt-2 flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-blue-500 items-center justify-center mr-1.5">
            <Feather name="check" size={10} color="white" />
          </View>
          <Text className="text-blue-500 text-xs font-semibold">
            Verified Creator
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

export default UserCard;
