import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import UserCard from "@/components/UserCard";
import { userApi, useApiClient } from "@/utils/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@clerk/clerk-expo";
import { UserProfile } from "@/types";

// Main Follower List Screen
export default function FollowerListScreen() {
  const router = useRouter();
  const { type, username } = useLocalSearchParams<{
    type: "followers" | "following";
    username: string;
  }>();

  const { currentUser } = useCurrentUser();
  const { userId: currentUserClerkId } = useAuth();
  const api = useApiClient();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    (type as "followers" | "following") || "followers"
  );
  const [localUsers, setLocalUsers] = useState<UserProfile[]>([]);

  // Fetch users list with optimized API calls
  const {
    data: fetchedUsers = [],
    isLoading,
    error,
    refetch,
  } = useQuery<UserProfile[], Error>({
    queryKey: ["followList", username, activeTab],
    queryFn: async () => {
      try {
        const endpoint =
          activeTab === "followers"
            ? userApi.getFollowers(api, username)
            : userApi.getFollowing(api, username);

        const response = await endpoint;

        const processedUsers = response.data.users.map((user: any) => {
          // Check if current user follows this user
          const isFollowing =
            currentUser?.following?.includes(user.clerkId) || false;

          return {
            _id: user._id || user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            bio: user.bio,
            clerkId: user.clerkId,
            // Include other UserProfile fields as needed
            followers: user.followers || [],
            following: user.following || [],
            location: user.location,
            bannerImage: user.bannerImage,
            createdAt: user.createdAt,
            posts: user.posts || [],
          } as UserProfile;
        });

        return processedUsers;
      } catch (error: any) {
        if (error.response?.status === 429) {
          Toast.show({
            type: "error",
            text1: "Rate limit exceeded",
            text2: "Please wait a moment and try again",
            visibilityTime: 4000,
          });
        }
        throw error;
      }
    },
    enabled: !!username,
    retry: (failureCount, error: any) => {
      if (error.response?.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update local users when data is fetched
  useEffect(() => {
    if (fetchedUsers.length > 0) {
      setLocalUsers(fetchedUsers);
    }
  }, [fetchedUsers]);

  // Handle follow state changes - FIXED TYPE
  const handleFollowChange = useCallback(
    (userId: string, isFollowing: boolean) => {
      setLocalUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isFollowing } : user
        )
      );

      // Also update currentUser's following array optimistically
      if (currentUser) {
        const userToUpdate = localUsers.find((u) => u._id === userId);
        if (userToUpdate?.clerkId) {
          if (isFollowing) {
            // Add to following
            if (!currentUser.following?.includes(userToUpdate.clerkId)) {
              currentUser.following = [
                ...(currentUser.following || []),
                userToUpdate.clerkId,
              ];
            }
          } else {
            // Remove from following
            currentUser.following =
              currentUser.following?.filter(
                (id: string) => id !== userToUpdate.clerkId
              ) || [];
          }
        }
      }
    },
    [currentUser, localUsers]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      // Error is handled by the query
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTabChange = (tab: "followers" | "following") => {
    setActiveTab(tab);
    router.setParams({ type: tab, username });
  };

  const renderHeader = () => (
    <View className="bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-gray-900">{username}</Text>
          <Text className="text-gray-500 text-sm">
            {localUsers.length}{" "}
            {activeTab === "followers" ? "followers" : "following"}
          </Text>
        </View>

        <TouchableOpacity
          className="p-2"
          onPress={() => {
            Toast.show({
              type: "info",
              text1: "Search",
              text2: "Search within list coming soon",
            });
          }}
        >
          <Feather name="search" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${
            activeTab === "followers"
              ? "border-b-2 border-blue-500"
              : "border-b-2 border-transparent"
          }`}
          onPress={() => handleTabChange("followers")}
        >
          <Text
            className={`font-semibold text-base ${
              activeTab === "followers" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            Followers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-4 items-center ${
            activeTab === "following"
              ? "border-b-2 border-blue-500"
              : "border-b-2 border-transparent"
          }`}
          onPress={() => handleTabChange("following")}
        >
          <Text
            className={`font-semibold text-base ${
              activeTab === "following" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            Following
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20 px-10">
      <Feather
        name={activeTab === "followers" ? "users" : "user-check"}
        size={70}
        color="#E1E8ED"
      />
      <Text className="text-gray-900 text-xl font-bold mt-6">
        No {activeTab} yet
      </Text>
      <Text className="text-gray-500 text-center mt-2">
        {activeTab === "followers"
          ? "When someone follows you, they'll appear here"
          : "People you follow will appear here"}
      </Text>
    </View>
  );

  const renderFooter = () =>
    localUsers.length > 0 && (
      <View className="py-8 items-center">
        <Text className="text-gray-400 text-sm">
          {localUsers.length}{" "}
          {activeTab === "followers" ? "followers" : "following"} total
        </Text>
      </View>
    );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
          <Text className="text-gray-500 mt-4">Loading {activeTab}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    const errorMessage =
      (error as any).response?.status === 429
        ? "Too many requests. Please wait a moment."
        : "Please check your connection and try again";

    return (
      <SafeAreaView className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center px-10">
          <Feather name="alert-circle" size={60} color="#FF6B6B" />
          <Text className="text-gray-900 text-lg font-semibold mt-6">
            Failed to load {activeTab}
          </Text>
          <Text className="text-gray-500 text-center mt-2">{errorMessage}</Text>
          <TouchableOpacity
            className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
            onPress={handleRetry}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList<UserProfile>
        data={localUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            currentUserClerkId={currentUserClerkId || ""}
            showFollowButton={true}
            onFollowChange={handleFollowChange}
          />
        )}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1DA1F2"
            colors={["#1DA1F2"]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}
