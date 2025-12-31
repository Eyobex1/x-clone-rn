import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Animated,
  Share,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

import CommentsModal from "@/components/CommentsModal";
import { useApiClient, postApi } from "@/utils/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { Post, Comment } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";

const { width } = Dimensions.get("window");

const PostDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useCurrentUser();
  const api = useApiClient();
  const queryClient = useQueryClient();

  const [showComments, setShowComments] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [imageScale] = useState(new Animated.Value(1));
  const scrollY = useRef(new Animated.Value(0)).current;

  // Use posts hook
  const {
    posts,
    isLoading: isLoadingPosts,
    toggleLike,
    deletePost,
  } = usePosts();

  // Find the specific post from the posts cache
  const post = posts.find((p) => p._id === id);

  // Use React Query for post details if not in cache
  const { data: fetchedPost, isLoading: isLoadingFetchedPost } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await api.get(`/posts/${id}`);
      return res.data.post as Post;
    },
    enabled: !post && !!id,
  });

  // Use React Query for comments
  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ["postComments", id],
    queryFn: async () => {
      const res = await api.get(`/comments/post/${id}`);
      return res.data.comments as Comment[];
    },
    enabled: !!id,
  });

  const currentPost = post || fetchedPost;
  const comments = commentsData || [];

  const isLoading = isLoadingPosts || isLoadingFetchedPost || isLoadingComments;

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Update like state when post is loaded
  React.useEffect(() => {
    if (currentPost) {
      setIsLiked(currentPost.likes.includes(currentUser?._id || ""));
      setLikesCount(currentPost.likes.length);
    }
  }, [currentPost, currentUser]);

  const handleLike = () => {
    if (!id) return;
    toggleLike(id);
    setIsLiked(!isLiked);
    setLikesCount((prev) => prev + (isLiked ? -1 : 1));

    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleShare = async () => {
    try {
      const ANDROID_APP_LINK =
        "https://play.google.com/store/apps/details?id=com.eyob.eyobtweet";

      // Universal message for both Android and iOS
      const message = `📲 Eyob Twitter App\n\n"${currentPost?.content?.substring(0, 100)}..."\n\n🔗 ${ANDROID_APP_LINK}\n\nAvailable on Android • Share with friends!`;

      // This works on BOTH platforms
      await Share.share({
        message: message,
        title: "Share from Eyob Twitter",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePost(id);
            router.back();
          },
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert("Report Post", "Why are you reporting this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Spam", onPress: () => reportPost("spam") },
      { text: "Inappropriate", onPress: () => reportPost("inappropriate") },
      { text: "Harassment", onPress: () => reportPost("harassment") },
      { text: "Other", onPress: () => reportPost("other") },
    ]);
  };

  const reportPost = async (reason: string) => {
    try {
      await api.post(`/posts/${id}/report`, { reason });
      Toast.show({
        type: "success",
        text1: "Reported",
        text2: "Thank you for your report",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to report post",
      });
    }
  };

  const goToProfile = () => {
    if (currentPost?.user?.username) {
      router.push({
        pathname: "/screens/profile/[username]",
        params: { username: currentPost.user.username },
      });
    }
  };

  // Navigate to image viewer
  const goToImageViewer = () => {
    if (currentPost?.image) {
      router.push({
        pathname: "/screens/image-viewer/image-viewer",
        params: {
          uri: currentPost.image,
          postId: currentPost._id,
          imageWidth: currentPost.imageWidth?.toString(),
          imageHeight: currentPost.imageHeight?.toString(),
        },
      });
    }
  };

  const imageAspectRatio =
    currentPost?.imageWidth && currentPost?.imageHeight
      ? currentPost.imageWidth / currentPost.imageHeight
      : 16 / 9;

  const animateImagePress = () => {
    Animated.sequence([
      Animated.timing(imageScale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close all modals
  const closeAllModals = () => {
    setShowComments(false);
    setShowMoreOptions(false);
  };

  // Loading state
  if (isLoading && !currentPost) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-gray-500 mt-4">Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (!currentPost) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="alert-circle" size={70} color="#9CA3AF" />
          <Text className="text-2xl font-bold text-gray-900 mt-6">
            Post not found
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            This post may have been deleted or you don't have permission to view
            it.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-6 py-3 rounded-full bg-black"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnPost = currentPost.user._id === currentUser?._id;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header - CONSTANT (not animated, always visible) */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Post</Text>
          <TouchableOpacity
            onPress={() => setShowMoreOptions(true)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Feather name="more-horizontal" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* User Info */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={goToProfile}>
              <Image
                source={{
                  uri:
                    currentPost.user.profilePicture ||
                    "https://via.placeholder.com/150",
                }}
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
              />
            </TouchableOpacity>
            <View className="ml-3 flex-1">
              <TouchableOpacity onPress={goToProfile}>
                <Text className="font-bold text-gray-900 text-base">
                  {currentPost.user.firstName} {currentPost.user.lastName}
                </Text>
                <Text className="text-gray-500 text-sm">
                  @{currentPost.user.username}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Post Content */}
          {currentPost.content && (
            <Text className="text-gray-900 text-lg leading-7 mt-4">
              {currentPost.content}
            </Text>
          )}

          {/* Post Time */}
          <Text className="text-gray-500 text-sm mt-3">
            {formatDate(currentPost.createdAt)}
          </Text>

          {/* Stats */}
          <View className="flex-row items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
            <TouchableOpacity className="flex-row items-center">
              <Text className="font-bold text-gray-900">
                {formatNumber(likesCount)}
              </Text>
              <Text className="text-gray-500 ml-1">Likes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setShowComments(true)}
            >
              <Text className="font-bold text-gray-900">
                {formatNumber(comments.length)}
              </Text>
              <Text className="text-gray-500 ml-1">Comments</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center">
              <Text className="font-bold text-gray-900">
                {formatNumber(currentPost.reposts?.length || 0)}
              </Text>
              <Text className="text-gray-500 ml-1">Reposts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Image - Updated to navigate to image viewer */}
        {currentPost.image && (
          <View className="mt-4">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={goToImageViewer}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert("Image Options", "", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Save Image", onPress: () => {} },
                  { text: "Share Image", onPress: handleShare },
                  { text: "View Full Screen", onPress: goToImageViewer },
                ]);
              }}
            >
              <Image
                source={{ uri: currentPost.image }}
                style={{ width: "100%", aspectRatio: imageAspectRatio }}
                className="bg-gray-100"
                resizeMode="cover"
              />
              <View className="absolute bottom-4 right-4 bg-black/60 rounded-full px-3 py-1.5">
                <Feather name="maximize-2" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View className="px-4 py-6 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="flex-row items-center space-x-2"
              onPress={handleLike}
            >
              <View
                className={`w-12 h-12 rounded-full ${
                  isLiked ? "bg-red-100" : "bg-gray-100"
                } items-center justify-center`}
              >
                <AntDesign
                  name={isLiked ? "heart" : "hearto"}
                  size={24}
                  color={isLiked ? "#DC2626" : "#666"}
                />
              </View>
              <Text
                className={`text-sm font-medium ${
                  isLiked ? "text-red-600" : "text-gray-600"
                }`}
              >
                Like
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center space-x-2"
              onPress={() => setShowComments(true)}
            >
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
                <Feather name="message-circle" size={24} color="#2563EB" />
              </View>
              <Text className="text-sm font-medium text-gray-600">Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center space-x-2"
              onPress={handleShare}
            >
              <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center">
                <Feather name="send" size={24} color="#7C3AED" />
              </View>
              <Text className="text-sm font-medium text-gray-600">Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Preview */}
        {comments.length > 0 && (
          <View className="px-4 py-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-bold text-gray-900 text-lg">
                Top Comments
              </Text>
              <TouchableOpacity onPress={() => setShowComments(true)}>
                <Text className="text-blue-600 font-medium">View all</Text>
              </TouchableOpacity>
            </View>
            {comments.slice(0, 3).map((comment: Comment) => (
              <View key={comment._id} className="mb-4">
                <View className="flex-row">
                  <Image
                    source={{
                      uri:
                        comment.user.profilePicture ||
                        "https://via.placeholder.com/150",
                    }}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="font-bold text-gray-900 text-sm">
                        {comment.user.firstName} {comment.user.lastName}
                      </Text>
                      <Text className="text-gray-500 text-xs ml-2">
                        {formatDate(comment.createdAt)}
                      </Text>
                    </View>
                    <Text className="text-gray-800 text-sm">
                      {comment.content}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Fixed Comment Button */}
      <TouchableOpacity
        onPress={() => setShowComments(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 items-center justify-center shadow-2xl shadow-blue-500/30"
      >
        <Feather name="message-circle" size={24} color="white" />
        {comments.length > 0 && (
          <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-2 border-white items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {comments.length > 9 ? "9+" : comments.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* More Options Modal - FIXED VERSION */}
      {showMoreOptions && (
        <View className="absolute inset-0 z-50">
          {/* Background Overlay */}
          <TouchableOpacity
            className="flex-1 bg-black/20"
            onPress={closeAllModals}
            activeOpacity={1}
          />

          {/* Modal Content */}
          <View className="absolute bottom-0 left-0 right-0">
            <BlurView
              intensity={90}
              tint="light"
              className="rounded-t-3xl overflow-hidden"
            >
              <View className="bg-white/95 p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-xl font-bold text-gray-900">
                    Post Options
                  </Text>
                  <TouchableOpacity
                    onPress={closeAllModals}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Feather name="x" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View className="space-y-4">
                  {isOwnPost ? (
                    <>
                      <TouchableOpacity
                        className="flex-row items-center p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200"
                        onPress={() => {
                          handleDelete();
                          closeAllModals();
                        }}
                      >
                        <Feather name="trash-2" size={22} color="#DC2626" />
                        <Text className="text-red-600 font-medium ml-3">
                          Delete Post
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        className="flex-row items-center p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200"
                        onPress={() => {
                          handleReport();
                          closeAllModals();
                        }}
                      >
                        <Feather name="flag" size={22} color="#666" />
                        <Text className="text-gray-700 font-medium ml-3">
                          Report Post
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity
                    className="flex-row items-center p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 mb-8"
                    onPress={() => {
                      handleShare();
                      closeAllModals();
                    }}
                  >
                    <Feather name="share-2" size={22} color="#666" />
                    <Text className="text-gray-700 font-medium ml-3">
                      Share Post
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </View>
      )}

      {/* Comments Modal - Make sure it's conditionally rendered properly */}
      {showComments && (
        <CommentsModal selectedPost={currentPost} onClose={closeAllModals} />
      )}
    </SafeAreaView>
  );
};

export default PostDetailScreen;
