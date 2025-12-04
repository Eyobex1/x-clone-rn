import NoNotificationsFound from "@/components/NoNotificationsFound";
import NotificationCard from "@/components/NotificationCard";
import { Notification } from "@/types";
import { Feather } from "@expo/vector-icons";
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
import { useEffect, useState } from "react";
import { useApiClient } from "@/utils/api";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";

const NotificationsScreen = () => {
  const api = useApiClient();
  const insets = useSafeAreaInsets();

  // ================================
  // Infinite Scroll State
  // ================================
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ================================
  // Unread Badge State
  // ================================
  const { refetch: refetchUnread } = useUnreadNotifications();

  // ================================
  // Fetch Notifications (Paginated)
  // ================================
  const fetchNotifications = async (pageNumber = 1, refresh = false) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // API now supports pagination: page + limit
      const res = await api.get("/notifications", {
        params: { page: pageNumber, limit: 10 },
      });

      const newNotifications = res.data.notifications;
      const totalPages = res.data.totalPages;

      // Merge or replace notifications based on refresh
      setNotifications((prev) =>
        refresh ? newNotifications : [...prev, ...newNotifications]
      );
      setPage(pageNumber);
      setHasMore(pageNumber < totalPages);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
      if (refresh) setIsRefreshing(false);
    }
  };

  // ================================
  // Refresh Notifications
  // ================================
  const refreshNotifications = () => {
    setIsRefreshing(true);
    fetchNotifications(1, true); // reset page 1
  };

  // ================================
  // Load More Notifications (Infinite Scroll)
  // ================================
  const loadMore = () => {
    if (!hasMore || isLoading) return;
    fetchNotifications(page + 1);
  };

  // ================================
  // Mark all notifications as read on mount
  // ================================
  useEffect(() => {
    api
      .put("/notifications/mark-read") // backend endpoint to mark all read
      .then(() => {
        refetchUnread(); // update unread badge
      })
      .catch((err) =>
        console.error("Error marking notifications as read:", err)
      );

    // Initial fetch
    fetchNotifications();
  }, []);

  // ================================
  // Render Single Notification Item
  // ================================
  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationCard
      notification={item}
      onDelete={async () => {
        await api.delete(`/notifications/${item._id}`);
        setNotifications((prev) => prev.filter((n) => n._id !== item._id));
        refetchUnread(); // update badge
      }}
    />
  );

  // ================================
  // Render
  // ================================
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Notifications</Text>
        <TouchableOpacity>
          <Feather name="settings" size={24} color="#657786" />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        onEndReached={loadMore} // infinite scroll trigger
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshNotifications}
            tintColor={"#1DA1F2"}
          />
        }
        // ⭐ Fixed Type error: return null instead of false
        ListEmptyComponent={isLoading ? null : <NoNotificationsFound />}
        ListFooterComponent={
          isLoading ? (
            <View className="p-4 items-center justify-center">
              <ActivityIndicator size="small" color="#1DA1F2" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;
