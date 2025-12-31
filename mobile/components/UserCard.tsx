import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { UserProfile } from "@/types";

interface UserCardProps {
  user: UserProfile;
  currentUserClerkId: string;
  showFollowButton?: boolean;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
  showStats?: boolean;
  compact?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  currentUserClerkId,
  showFollowButton = true,
  onFollowChange,
  showStats = false,
  compact = false,
}) => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const isCurrentUser = user.clerkId === currentUserClerkId;
  const [scaleAnim] = useState(new Animated.Value(1));

  // Use the follow hook
  const followMutation = useFollowUser(user.username, user.clerkId || "");

  // Local state for optimistic updates
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useState(false);
  const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);

  // Initialize optimistic state based on user data
  useEffect(() => {
    // Check if current user follows this user
    if (currentUser && user.clerkId) {
      const isFollowing =
        currentUser.following?.includes(user.clerkId) || false;
      setOptimisticIsFollowing(isFollowing);
    }
  }, [user.clerkId, currentUser]);

  const navigateToProfile = () => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFollowToggle = () => {
    if (!user.clerkId) {
      console.error("No clerkId for user:", user.username);
      return;
    }

    animateButton();

    // Optimistic update: immediately change the UI
    const newFollowingState = !optimisticIsFollowing;
    setOptimisticIsFollowing(newFollowingState);
    setIsOptimisticUpdate(true);

    // Notify parent component if callback provided
    if (onFollowChange) {
      onFollowChange(user._id, newFollowingState);
    }

    // Make the API call
    followMutation.mutate(undefined, {
      onError: (error) => {
        // Revert optimistic update if API call fails
        setOptimisticIsFollowing(!newFollowingState);
        setIsOptimisticUpdate(false);
        if (onFollowChange) {
          onFollowChange(user._id, !newFollowingState);
        }
        console.error("Follow error:", error);
      },
      onSuccess: () => {
        setIsOptimisticUpdate(false);
      },
    });
  };

  // Determine if follow button should be shown
  const shouldShowFollowButton =
    showFollowButton && !isCurrentUser && user.clerkId;
  const isMutating = followMutation.status === "pending" || isOptimisticUpdate;

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <View className="px-4 py-3 border-b border-gray-100 bg-white">
      <View className="flex-row items-center">
        {/* Profile Image with Shadow Effect */}
        <TouchableOpacity onPress={navigateToProfile} activeOpacity={0.8}>
          <View className="relative">
            {/* Gradient effect using multiple borders */}
            <View className="absolute -inset-1 rounded-full bg-gradient-to-br from-pink-500 via-orange-500 to-teal-400 opacity-20" />
            <View className="w-16 h-16 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
              <Image
                source={{
                  uri: user.profilePicture || "https://via.placeholder.com/150",
                }}
                className="w-full h-full"
              />
            </View>
            {/* Online indicator */}
            {optimisticIsFollowing && (
              <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white items-center justify-center">
                <Feather name="check" size={10} color="white" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* User Info */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <TouchableOpacity onPress={navigateToProfile} activeOpacity={0.8}>
                <View className="flex-row items-center flex-wrap">
                  <Text className="font-bold text-gray-900 text-base">
                    {user.firstName} {user.lastName}
                  </Text>
                  {optimisticIsFollowing && (
                    <View className="ml-2 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      <Text className="text-blue-600 text-xs font-medium">
                        Following
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-500 text-sm mt-0.5">
                  @{user.username}
                </Text>
              </TouchableOpacity>

              {!compact && user.bio && (
                <Text className="text-gray-800 text-sm mt-2" numberOfLines={2}>
                  {user.bio}
                </Text>
              )}

              {showStats && !compact && (
                <View className="flex-row items-center space-x-4 mt-2">
                  <View className="flex-row items-center">
                    <Text className="font-bold text-gray-900 text-sm">
                      {formatNumber(user.posts?.length || 0)}
                    </Text>
                    <Text className="text-gray-500 text-xs ml-1">posts</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="font-bold text-gray-900 text-sm">
                      {formatNumber(user.followers?.length || 0)}
                    </Text>
                    <Text className="text-gray-500 text-xs ml-1">
                      followers
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="font-bold text-gray-900 text-sm">
                      {formatNumber(user.following?.length || 0)}
                    </Text>
                    <Text className="text-gray-500 text-xs ml-1">
                      following
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Follow Button */}
            {shouldShowFollowButton ? (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg min-w-[88px] flex-row items-center justify-center ${
                    optimisticIsFollowing
                      ? "bg-white border border-gray-300 shadow-sm"
                      : "bg-black shadow-md"
                  } ${isMutating && "opacity-70"}`}
                  onPress={handleFollowToggle}
                  disabled={isMutating}
                  activeOpacity={0.8}
                >
                  {isMutating ? (
                    <ActivityIndicator
                      size="small"
                      color={optimisticIsFollowing ? "#666" : "#fff"}
                    />
                  ) : optimisticIsFollowing ? (
                    <>
                      <MaterialIcons name="check" size={16} color="#666" />
                      <Text className="text-gray-700 font-semibold text-sm ml-1">
                        Following
                      </Text>
                    </>
                  ) : (
                    <>
                      <Feather name="user-plus" size={16} color="#fff" />
                      <Text className="text-white font-semibold text-sm ml-1">
                        Follow
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ) : isCurrentUser ? (
              <TouchableOpacity
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm"
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Text className="text-gray-700 font-semibold text-sm">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="p-2 rounded-full hover:bg-gray-100"
                onPress={() => {
                  // Handle more options
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Actions (for compact view) */}
          {compact && (
            <View className="flex-row items-center space-x-4 mt-3">
              <TouchableOpacity
                className="flex-row items-center p-1.5 rounded-lg bg-gray-50"
                activeOpacity={0.7}
              >
                <Ionicons name="heart-outline" size={18} color="#666" />
                <Text className="text-gray-700 text-xs font-medium ml-1.5">
                  {formatNumber(user.followers?.length || 0)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center p-1.5 rounded-lg bg-gray-50"
                activeOpacity={0.7}
              >
                <Feather name="user" size={16} color="#666" />
                <Text className="text-gray-700 text-xs font-medium ml-1.5">
                  {formatNumber(user.following?.length || 0)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center p-1.5 rounded-lg bg-gray-50"
                activeOpacity={0.7}
              >
                <Feather name="image" size={16} color="#666" />
                <Text className="text-gray-700 text-xs font-medium ml-1.5">
                  {formatNumber(user.posts?.length || 0)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Mutual Followers Badge */}
      {!compact && optimisticIsFollowing && (
        <View className="mt-3 flex-row items-center">
          <View className="flex-row -space-x-2">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className={`w-6 h-6 rounded-full border-2 border-white ${
                  i === 1
                    ? "bg-blue-100"
                    : i === 2
                      ? "bg-green-100"
                      : "bg-purple-100"
                }`}
              />
            ))}
          </View>
          <Text className="text-gray-500 text-xs ml-2">
            Followed by 3 mutual friends
          </Text>
        </View>
      )}

      {/* Verification Badge (Optional) */}
      {(user.followers?.length || 0) > 1000 && (
        <View className="mt-2 flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-blue-500 items-center justify-center mr-1">
            <Feather name="check" size={10} color="white" />
          </View>
          <Text className="text-blue-600 text-xs font-medium">
            Popular Creator
          </Text>
        </View>
      )}
    </View>
  );
};

export default UserCard;
