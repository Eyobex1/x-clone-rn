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

  const [localIsFollowing, setLocalIsFollowing] = useState(
    user.isFollowing || false
  );
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

  const followersCount = Array.isArray(user.followers)
    ? user.followers.length
    : 0;
  const followingCount = Array.isArray(user.following)
    ? user.following.length
    : 0;

  useEffect(() => {
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
  }, [index]);

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
    if (!user.clerkId || isMutating || isCurrentUser) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateButton();

    const newFollowingState = !localIsFollowing;
    setLocalIsFollowing(newFollowingState);
    setIsMutating(true);

    if (onFollowChange) {
      onFollowChange(user._id, newFollowingState);
    }

    followMutation.mutate(undefined, {
      onError: (error) => {
        setLocalIsFollowing(!newFollowingState);
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
                {localIsFollowing && shouldShowFollowButton && (
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

              <View className="flex-row items-center space-x-4 mt-3">
                <View className="flex-row items-center">
                  <Feather name="users" size={14} color="#6B7280" />
                  <Text className="text-gray-900 font-bold text-sm ml-1.5">
                    {formatNumber(followersCount)}
                  </Text>
                  <Text className="text-gray-500 text-xs ml-0.5 mr-2">
                    followers
                  </Text>
                </View>
                <Text>|</Text>
                <View className="flex-row items-center ml-2">
                  <Feather name="user-check" size={14} color="#6B7280" />
                  <Text className="text-gray-900 font-bold text-sm ml-1.5">
                    {formatNumber(followingCount)}
                  </Text>
                  <Text className="text-gray-500 text-xs ml-0.5">
                    following
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {shouldShowFollowButton ? (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  onPress={handleFollowToggle}
                  disabled={isMutating}
                  activeOpacity={0.7}
                  style={isMutating ? { opacity: 0.7 } : {}}
                >
                  <View
                    className={`px-4 py-2.5 rounded-full flex-row items-center justify-center min-w-[100px] ${
                      localIsFollowing
                        ? "bg-white border border-gray-300"
                        : "bg-black"
                    }`}
                  >
                    {isMutating ? (
                      <ActivityIndicator
                        size="small"
                        color={localIsFollowing ? "#000" : "#fff"}
                      />
                    ) : localIsFollowing ? (
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
                  </View>
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
