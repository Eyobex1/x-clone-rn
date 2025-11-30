import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePosts } from "@/hooks/usePosts";
import PostsList from "@/components/PostsList";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ username: string }>();
  const username = params.username;

  // Fetch profile
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useUserProfile(username);

  // Fetch posts
  const {
    posts,
    isLoading: isPostsLoading,
    refetch: refetchPosts,
  } = usePosts(username);

  if (isProfileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">User not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isProfileLoading || isPostsLoading}
            onRefresh={() => {
              refetchProfile();
              refetchPosts();
            }}
            tintColor="#1DA1F2"
          />
        }
      >
        {/* Banner */}
        <Image
          source={{
            uri:
              profile.bannerImage ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />

        {/* Profile Info */}
        <View className="px-4 pb-4 border-b border-gray-100">
          <View className="flex-row justify-between items-end -mt-16 mb-4">
            <Image
              source={{ uri: profile.profilePicture }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl font-bold text-gray-900 mr-1">
                {profile.firstName} {profile.lastName}
              </Text>
              <Feather name="check-circle" size={20} color="#1DA1F2" />
            </View>
            <Text className="text-gray-500 mb-2">@{profile.username}</Text>
            <Text className="text-gray-900 mb-3">{profile.bio}</Text>

            <View className="flex-row items-center mb-2">
              <Feather name="map-pin" size={16} color="#657786" />
              <Text className="text-gray-500 ml-2">{profile.location}</Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Feather name="calendar" size={16} color="#657786" />
              <Text className="text-gray-500 ml-2">
                Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
              </Text>
            </View>

            <View className="flex-row">
              <Text className="mr-6 text-gray-900">
                <Text className="font-bold">{profile.following?.length}</Text>{" "}
                Following
              </Text>
              <Text className="text-gray-900">
                <Text className="font-bold">{profile.followers?.length}</Text>{" "}
                Followers
              </Text>
            </View>
          </View>
        </View>

        {/* User Posts */}
        <PostsList username={username} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
