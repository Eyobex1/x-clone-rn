import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, RefreshControl } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useFollowUser } from "@/hooks/useFollowUser";
import PostsList from "@/components/PostsList";
import ProfileHeader from "@/components/ProfileHeader";

const TAB_BAR_HEIGHT = 60;

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ username: string }>();
  const username = params.username ?? "";
  const { userId: currentUserId } = useAuth();

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

  const navigateToFollowList = (type: "followers" | "following") => {
    router.push({
      pathname: "/screens/follower-list/follower-list",
      params: {
        username: localProfile?.username || username,
        type,
      },
    });
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

  const renderProfileHeader = (
    <ProfileHeader
      user={localProfile}
      isOwnProfile={isOwnProfile}
      isFollowing={!!isFollowing}
      isMutating={isMutating}
      onFollowToggle={handleFollowToggle}
      onNavigateToFollowList={navigateToFollowList}
      showFollowButton={!isOwnProfile}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <PostsList
        username={username}
        ListHeaderComponent={renderProfileHeader}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isProfileLoading}
            onRefresh={async () => await refetchProfile()}
            tintColor="#1DA1F2"
          />
        }
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
