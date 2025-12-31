import { Notification } from "@/types";
import { formatDate } from "@/utils/formatters";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
  isDeleting?: boolean;
}

const NotificationCard = ({
  notification,
  onDelete,
  isDeleting = false,
}: NotificationCardProps) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const getNotificationText = () => {
    const name = `${notification.from.firstName} ${notification.from.lastName}`;
    switch (notification.type) {
      case "like":
        return `${name} liked your post`;
      case "comment":
        return `${name} commented on your post`;
      case "follow":
        return `${name} started following you`;
      default:
        return "";
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return (
          <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
            <Feather name="heart" size={18} color="#DC2626" />
          </View>
        );
      case "comment":
        return (
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
            <Feather name="message-circle" size={18} color="#2563EB" />
          </View>
        );
      case "follow":
        return (
          <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
            <Feather name="user-plus" size={18} color="#059669" />
          </View>
        );
      default:
        return (
          <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
            <Feather name="bell" size={18} color="#7C3AED" />
          </View>
        );
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case "like":
        return "#DC2626";
      case "comment":
        return "#2563EB";
      case "follow":
        return "#059669";
      default:
        return "#7C3AED";
    }
  };

  const handleDelete = () => {
    if (isDeleting) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      try {
        onDelete(notification._id);
        setIsVisible(false);
      } catch (error) {
        // Revert animation if error
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        Alert.alert("Error", "Failed to delete notification");
      }
    });
  };

  const goToProfile = () => {
    router.push({
      pathname: "/screens/profile/[username]",
      params: { username: notification.from.username },
    });
  };

  const goToPost = () => {
    if (notification.post) {
      router.push({
        pathname: "/screens/post/[id]",
        params: { id: notification.post._id },
      });
    }
  };

  if (!isVisible) return null;

  const showUnreadIndicator = notification.isRead === false;

  {
    showUnreadIndicator && (
      <View className="absolute top-4 left-0 w-1 h-8 rounded-r-full bg-blue-500" />
    );
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }} className="mx-4 my-2">
      <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Notification Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-50">
          <View className="flex-row items-center flex-1">
            {getNotificationIcon()}
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-gray-900 text-sm">
                {notification.type.charAt(0).toUpperCase() +
                  notification.type.slice(1)}
              </Text>
              <Text className="text-gray-500 text-xs">
                {formatDate(notification.createdAt)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleDelete}
            className="p-2 rounded-full hover:bg-gray-100"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#9CA3AF" />
            ) : (
              <Feather name="x" size={18} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Notification Body */}
        <View className="p-4">
          {/* User Info */}
          <TouchableOpacity
            onPress={goToProfile}
            className="flex-row items-center mb-3"
            disabled={isDeleting}
          >
            <View className="relative">
              <Image
                source={{
                  uri:
                    notification.from.profilePicture ||
                    "https://via.placeholder.com/100",
                }}
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
              />
              <View
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white items-center justify-center"
                style={{ backgroundColor: getNotificationColor() }}
              >
                {notification.type === "like" ? (
                  <Feather name="heart" size={8} color="white" />
                ) : notification.type === "comment" ? (
                  <Feather name="message-circle" size={8} color="white" />
                ) : (
                  <Feather name="user-plus" size={8} color="white" />
                )}
              </View>
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-gray-900 text-sm">
                {notification.from.firstName} {notification.from.lastName}
              </Text>
              <Text className="text-gray-500 text-xs">
                @{notification.from.username}
              </Text>
            </View>

            <TouchableOpacity
              onPress={goToProfile}
              className="px-3 py-1.5 rounded-full bg-gray-100"
              disabled={isDeleting}
            >
              <Text className="text-gray-700 text-xs font-medium">View</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Notification Text */}
          <Text className="text-gray-800 text-sm leading-5 mb-3">
            {getNotificationText()}
          </Text>

          {/* Post/Content Preview */}
          {(notification.post || notification.comment) && (
            <TouchableOpacity
              onPress={goToPost}
              className="bg-gray-50 rounded-xl p-3 border border-gray-200"
              disabled={isDeleting}
            >
              {notification.post && (
                <>
                  <Text className="text-gray-600 text-xs font-medium mb-1">
                    Post
                  </Text>
                  <Text
                    className="text-gray-800 text-sm mb-2"
                    numberOfLines={2}
                  >
                    {notification.post.content}
                  </Text>
                  {notification.post.image && (
                    <Image
                      source={{ uri: notification.post.image }}
                      className="w-full h-40 rounded-lg"
                      resizeMode="cover"
                    />
                  )}
                </>
              )}

              {notification.comment && (
                <>
                  <View className="flex-row items-center mb-1">
                    <Feather name="message-square" size={12} color="#6B7280" />
                    <Text className="text-gray-600 text-xs font-medium ml-1">
                      Comment
                    </Text>
                  </View>
                  <View className="bg-white rounded-lg p-3 border border-gray-200">
                    <Text
                      className="text-gray-800 text-sm italic"
                      numberOfLines={2}
                    >
                      "{notification.comment.content}"
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row border-t border-gray-100">
          <TouchableOpacity
            className="flex-1 py-3 flex-row items-center justify-center border-r border-gray-100"
            onPress={goToProfile}
            disabled={isDeleting}
          >
            <Feather name="user" size={16} color="#6B7280" />
            <Text className="text-gray-600 text-sm font-medium ml-2">
              Profile
            </Text>
          </TouchableOpacity>

          {notification.post && (
            <TouchableOpacity
              className="flex-1 py-3 flex-row items-center justify-center"
              onPress={goToPost}
              disabled={isDeleting}
            >
              <Feather name="external-link" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm font-medium ml-2">
                View Post
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-1 py-3 flex-row items-center justify-center border-l border-gray-100"
            onPress={() => {
              Alert.alert(
                "More options",
                "Additional actions would appear here"
              );
            }}
            disabled={isDeleting}
          >
            <Feather name="more-horizontal" size={16} color="#6B7280" />
            <Text className="text-gray-600 text-sm font-medium ml-2">More</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Unread Indicator */}
      {showUnreadIndicator && (
        <View className="absolute top-4 left-0 w-1 h-8 rounded-r-full bg-blue-500" />
      )}
    </Animated.View>
  );
};

export default NotificationCard;
