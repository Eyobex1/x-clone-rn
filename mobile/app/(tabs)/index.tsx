import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import SignOutButton from "@/components/SignOutButton";
import { usePosts } from "@/hooks/usePosts";
import { useUserSync } from "@/hooks/useUserSync";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const HomeScreen = () => {
  const [isRefetching, setIsRefetching] = useState(false);
  const { posts, isLoading, refetch: refetchPosts } = usePosts();
  const insets = useSafeAreaInsets();

  useUserSync();

  const handlePullToRefresh = async () => {
    setIsRefetching(true);
    await refetchPosts();
    setIsRefetching(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
        <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
        <Text className="text-xl font-bold text-gray-900">Home</Text>
        <SignOutButton />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100 + insets.bottom, // Same as NotificationsScreen
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePullToRefresh}
            tintColor="#1DA1F2"
          />
        }
      >
        <PostComposer />

        {/* Loading state */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center p-8">
            <ActivityIndicator size="large" color="#1DA1F2" />
            <Text className="text-gray-500 mt-4">Loading posts...</Text>
          </View>
        ) : (
          <PostsList />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
