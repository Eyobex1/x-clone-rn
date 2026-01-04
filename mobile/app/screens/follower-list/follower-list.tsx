import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
  LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";

import UserCard from "@/components/UserCard";
import { userApi, useApiClient } from "@/utils/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@clerk/clerk-expo";
import { UserProfile } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

  // Tab indicator animation
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(SCREEN_WIDTH / 2);
  const tabContainerRef = useRef<View>(null);
  const indicatorAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // Initialize tab position
  useEffect(() => {
    const initialPosition = type === "following" ? tabWidth : 0;
    tabIndicatorPosition.setValue(initialPosition);
  }, [type, tabWidth]);

  // Update tab indicator
  useEffect(() => {
    if (indicatorAnimation.current) {
      indicatorAnimation.current.stop();
      indicatorAnimation.current = null;
    }

    const toValue = activeTab === "followers" ? 0 : tabWidth;
    indicatorAnimation.current = Animated.timing(tabIndicatorPosition, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    });

    indicatorAnimation.current.start(() => {
      indicatorAnimation.current = null;
    });
  }, [activeTab, tabWidth]);

  // Measure tab width
  const handleTabLayout = (event: LayoutChangeEvent) => {
    const containerWidth = event.nativeEvent.layout.width;
    const newTabWidth = containerWidth / 2;
    setTabWidth(newTabWidth);

    const currentPosition = activeTab === "followers" ? 0 : newTabWidth;
    tabIndicatorPosition.setValue(currentPosition);
  };

  const {
    data: fetchedUsers = [],
    isLoading,
    error,
    refetch,
  } = useQuery<UserProfile[], Error>({
    queryKey: ["followList", username, activeTab],
    queryFn: async () => {
      try {
        const response =
          activeTab === "followers"
            ? await userApi.getFollowers(api, username)
            : await userApi.getFollowing(api, username);

        const usersData = response.data?.users || [];

        return usersData.map((user: any) => {
          const isFollowing = Array.isArray(user.followers)
            ? user.followers.includes(currentUserClerkId)
            : false;

          return {
            _id: user._id || `temp-${Math.random()}`,
            username: user.username || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            profilePicture: user.profilePicture || "",
            bio: user.bio || "",
            clerkId: user.clerkId || "",
            followers: Array.isArray(user.followers) ? user.followers : [],
            following: Array.isArray(user.following) ? user.following : [],
            location: user.location || "",
            bannerImage: user.bannerImage || "",
            createdAt: user.createdAt || new Date().toISOString(),
            isFollowing,
          };
        });
      } catch (error: any) {
        if (error.response?.status === 429) {
          Toast.show({
            type: "error",
            text1: "Slow down!",
            text2: "Too many requests, please wait",
            position: "bottom",
            visibilityTime: 3000,
          });
        } else if (error.response?.status === 401) {
          Toast.show({
            type: "error",
            text1: "Sign in required",
            text2: "Please sign in to view this content",
            position: "bottom",
          });
        } else if (error.response?.status === 404) {
          Toast.show({
            type: "error",
            text1: "User not found",
            text2: `@${username} doesn't exist`,
            position: "bottom",
          });
        }
        throw error;
      }
    },
    enabled: !!username,
    retry: 2,
  });

  useEffect(() => {
    setLocalUsers(fetchedUsers);
  }, [fetchedUsers]);

  const handleFollowChange = useCallback(
    (userId: string, isFollowing: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLocalUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isFollowing } : user
        )
      );
    },
    []
  );

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleTabChange = useCallback(
    (tab: "followers" | "following") => {
      if (tab === activeTab) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(tab);
      router.setParams({ type: tab, username });
    },
    [activeTab, router, username]
  );

  const renderHeader = () => (
    <View className="bg-white border-b border-gray-100">
      <View className="flex-row items-center justify-between px-4 pt-3 pb-3">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-gray-900 text-xl font-bold">{username}</Text>
          <Text className="text-gray-500 text-sm mt-0.5">
            {localUsers.length} {activeTab}
          </Text>
        </View>

        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Toast.show({
              type: "info",
              text1: "Search",
              text2: "Search within list",
              position: "bottom",
            });
          }}
        >
          <Feather name="search" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <View
        ref={tabContainerRef}
        className="relative"
        onLayout={handleTabLayout}
      >
        <View className="flex-row">
          <TouchableOpacity
            className="flex-1 py-4 items-center"
            onPress={() => handleTabChange("followers")}
            activeOpacity={0.7}
          >
            <Text
              className={`font-bold text-base ${
                activeTab === "followers" ? "text-black" : "text-gray-500"
              }`}
            >
              Followers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-4 items-center"
            onPress={() => handleTabChange("following")}
            activeOpacity={0.7}
          >
            <Text
              className={`font-bold text-base ${
                activeTab === "following" ? "text-black" : "text-gray-500"
              }`}
            >
              Following
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: tabWidth,
            height: 2,
            backgroundColor: "#000",
            transform: [{ translateX: tabIndicatorPosition }],
          }}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20 px-10">
      <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-6">
        <Feather
          name={activeTab === "followers" ? "users" : "user-check"}
          size={48}
          color="#9CA3AF"
        />
      </View>
      <Text className="text-gray-900 text-2xl font-bold mb-2">
        No {activeTab} yet
      </Text>
      <Text className="text-gray-500 text-center text-base">
        {activeTab === "followers"
          ? "When someone follows you, they'll show up here"
          : "When you follow people, they'll show up here"}
      </Text>
    </View>
  );

  const renderFooter = () =>
    localUsers.length > 0 && (
      <View className="py-6 items-center">
        <Text className="text-gray-400 text-sm">
          You've seen all {localUsers.length} {activeTab}
        </Text>
      </View>
    );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-500 mt-4">Loading {activeTab}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-6">
            <Feather name="wifi-off" size={36} color="#EF4444" />
          </View>
          <Text className="text-gray-900 text-xl font-bold mb-2">
            Couldn't load {activeTab}
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            {error.message || "Check your connection and try again"}
          </Text>
          <TouchableOpacity
            className="bg-black px-8 py-3.5 rounded-full"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold text-sm">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={localUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <UserCard
            user={item}
            currentUserClerkId={currentUserClerkId || ""}
            showFollowButton={true}
            onFollowChange={handleFollowChange}
            index={index}
          />
        )}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000"
            colors={["#000"]}
            progressBackgroundColor="#F3F4F6"
          />
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ flexGrow: 1 }}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-gray-100 mx-4" />
        )}
      />
    </SafeAreaView>
  );
}
