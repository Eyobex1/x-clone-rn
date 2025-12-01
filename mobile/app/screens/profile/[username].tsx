import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePosts } from "@/hooks/usePosts";
import { useFollowUser } from "@/hooks/useFollowUser";
import PostsList from "@/components/PostsList";
import { Feather } from "@expo/vector-icons";

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop";
const DEFAULT_AVATAR = "https://via.placeholder.com/150";
const TAB_BAR_HEIGHT = 60;

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ username: string }>();
  const username = params.username ?? "";
  const { userId: currentUserId } = useAuth();

  // Fetch profile & posts
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useUserProfile(username);

  const [localProfile, setLocalProfile] = useState(profile);

  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  // Redirect to own profile if visiting self
  useEffect(() => {
    if (localProfile?.clerkId === currentUserId) {
      router.replace("/(tabs)/profile");
    }
  }, [localProfile, currentUserId]);

  // Follow / Unfollow logic
  const followMutation = useFollowUser(username, localProfile?.clerkId ?? "");
  const isFollowing = localProfile?.followers?.includes(currentUserId ?? "");
  const isMutating = followMutation.status === "pending";

  const handleFollowToggle = () => {
    if (!localProfile || !currentUserId) return;

    // Optimistic update
    setLocalProfile((prev) => {
      if (!prev) return prev;
      const followers = prev.followers ?? [];
      return {
        ...prev,
        followers: isFollowing
          ? followers.filter((id) => id !== currentUserId)
          : [...followers, currentUserId],
      };
    });

    followMutation.mutate();
  };

  // Navigate to ImageViewer
  const handleImagePress = (imageUri: string | undefined, isBanner = false) => {
    let finalUri = imageUri;

    // Fallback to default if missing
    if (!finalUri) {
      finalUri = isBanner ? DEFAULT_BANNER : DEFAULT_AVATAR;
    }

    // Ensure absolute URL (optional: adjust if your backend serves relative paths)
    if (!finalUri.startsWith("http")) {
      finalUri = `https://your-backend.com${finalUri}`;
    }

    router.push(
      `/screens/image-viewer/image-viewer?uri=${encodeURIComponent(
        finalUri
      )}&t=${Date.now()}`
    );
  };

  if (isProfileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (!localProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">User not found</Text>
      </View>
    );
  }

  const isOwnProfile = localProfile.clerkId === currentUserId;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isProfileLoading}
            onRefresh={async () => {
              await refetchProfile();
            }}
            tintColor="#1DA1F2"
          />
        }
      >
        {/* Banner */}
        <TouchableOpacity
          onPress={() => handleImagePress(localProfile.bannerImage, true)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: localProfile.bannerImage || DEFAULT_BANNER }}
            className="w-full h-48"
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Profile Picture & Buttons */}
        <View className="px-4 -mt-16 flex-row justify-between items-end">
          <TouchableOpacity
            onPress={() => handleImagePress(localProfile.profilePicture)}
          >
            <Image
              source={{ uri: localProfile.profilePicture || DEFAULT_AVATAR }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
          </TouchableOpacity>

          {!isOwnProfile && (
            <View className="flex-row space-x-2">
              {/* Follow Button */}
              <TouchableOpacity
                onPress={handleFollowToggle}
                disabled={isMutating}
                className={`px-4 py-2 rounded-full flex-row items-center justify-center ${
                  isFollowing ? "bg-gray-200" : "bg-blue-500"
                }`}
              >
                <Feather
                  name={isFollowing ? "user-check" : "user-plus"}
                  size={16}
                  color={isFollowing ? "#1f2937" : "white"}
                  className="mr-1"
                />
                <Text
                  className={`font-semibold text-base ${
                    isFollowing ? "text-gray-800" : "text-white"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>

              {/* Chat Button */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/messages",
                    params: { username: localProfile.username },
                  })
                }
                className="bg-blue-500 px-4 py-2 rounded-full flex-row items-center justify-center ml-2"
              >
                <Feather
                  name="message-circle"
                  size={16}
                  color="white"
                  className="mr-1"
                />
                <Text className="text-white font-semibold text-base">
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Name, Username & Bio */}
        <View className="px-4 mt-2">
          <Text className="text-xl font-bold">
            {localProfile.firstName} {localProfile.lastName}
          </Text>
          <Text className="text-gray-500">@{localProfile.username}</Text>
          <Text className="text-gray-900">{localProfile.bio}</Text>

          {/* Followers / Following */}
          <View className="flex-row mb-4 mt-2">
            <Text className="mr-6 text-gray-900">
              <Text className="font-bold">
                {localProfile.following?.length ?? 0}
              </Text>{" "}
              Following
            </Text>
            <Text className="text-gray-900">
              <Text className="font-bold">
                {localProfile.followers?.length ?? 0}
              </Text>{" "}
              Followers
            </Text>
          </View>
        </View>
        <PostsList username={username} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
