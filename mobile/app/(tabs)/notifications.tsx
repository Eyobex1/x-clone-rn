import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";

import NoNotificationsFound from "@/components/NoNotificationsFound";
import NotificationCard from "@/components/NotificationCard";
import { useNotifications } from "@/hooks/useNotifications";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { useApiClient } from "@/utils/api";
import { Notification } from "@/types";

const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const api = useApiClient();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Use the notification hook with infinite scroll
  const {
    notifications,
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteNotification,
    isDeletingNotification,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications();

  const { unreadCount, refetch: refetchUnread } = useUnreadNotifications();

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n: Notification) => !n.isRead) // Backend uses isRead not read
      : notifications;

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put("/notifications/mark-read");
      refetch();
      refetchUnread();
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  }, [api, refetch, refetchUnread]);

  const refreshNotifications = useCallback(() => {
    refetch();
  }, [refetch]);

  const loadMoreNotifications = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const keyExtractor = useCallback((item: Notification) => {
    return item.uniqueKey || `${item._id}_${item.createdAt}_${item.type}`;
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationCard
        notification={item}
        onDelete={deleteNotification}
        isDeleting={isDeletingNotification}
      />
    ),
    [deleteNotification, isDeletingNotification]
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-6 items-center justify-center">
          <ActivityIndicator size="small" color="#007AFF" />
          <Text className="text-gray-500 text-sm mt-2">
            Loading more notifications...
          </Text>
        </View>
      );
    }

    if (hasNextPage) {
      return (
        <View className="py-8 items-center justify-center">
          <TouchableOpacity
            onPress={loadMoreNotifications}
            className="px-4 py-2 rounded-full bg-gray-100"
            disabled={isFetchingNextPage}
          >
            <Text className="text-gray-600 text-sm font-medium">
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredNotifications.length > 0) {
      return (
        <View className="py-8 items-center justify-center">
          <Feather name="check-circle" size={24} color="#10B981" />
          <Text className="text-gray-500 text-sm mt-2">
            You're all caught up!
          </Text>
        </View>
      );
    }

    return null;
  }, [
    isFetchingNextPage,
    hasNextPage,
    loadMoreNotifications,
    filteredNotifications.length,
  ]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-100">
        <View className="px-4 pt-4 pb-3">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">
              Notifications
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={refreshNotifications}
                className="p-2 rounded-full hover:bg-gray-100"
                disabled={isRefetching}
              >
                {isRefetching ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Feather name="refresh-cw" size={22} color="#666" />
                )}
              </TouchableOpacity>
              <TouchableOpacity className="p-2 rounded-full hover:bg-gray-100">
                <Feather name="settings" size={22} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row space-x-4">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${
                activeTab === "all" ? "bg-black" : "bg-gray-100"
              }`}
              onPress={() => setActiveTab("all")}
            >
              <Text
                className={`font-medium ${
                  activeTab === "all" ? "text-white" : "text-gray-700"
                }`}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${
                activeTab === "unread" ? "bg-black" : "bg-gray-100"
              }`}
              onPress={() => setActiveTab("unread")}
            >
              <View className="flex-row items-center">
                <Text
                  className={`font-medium ${
                    activeTab === "unread" ? "text-white" : "text-gray-700"
                  }`}
                >
                  Unread
                </Text>
                {unreadCount > 0 && (
                  <View className="ml-2 w-5 h-5 rounded-full bg-red-500 items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Bar */}
        <View className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={18} color="#666" />
              <Text className="text-gray-600 text-sm ml-2">
                {filteredNotifications.length} total
                {unreadCount > 0 && ` • ${unreadCount} unread`}
              </Text>
            </View>

            <TouchableOpacity
              className="flex-row items-center"
              onPress={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <MaterialIcons
                name="check-circle"
                size={18}
                color={unreadCount === 0 ? "#9CA3AF" : "#10B981"}
              />
              <Text
                className={`text-sm font-medium ml-1 ${
                  unreadCount === 0 ? "text-gray-400" : "text-green-600"
                }`}
              >
                Mark all as read
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notifications List with Infinite Scroll */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 100 + insets.bottom,
          paddingTop: 8,
        }}
        onEndReached={loadMoreNotifications}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refreshNotifications}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center mt-20">
              <ActivityIndicator size="large" color="#007AFF" />
              <Text className="text-gray-500 mt-4">
                Loading notifications...
              </Text>
            </View>
          ) : (
            <View className="mt-8">
              <NoNotificationsFound />
            </View>
          )
        }
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;
