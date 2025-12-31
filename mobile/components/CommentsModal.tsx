import { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useApiClient } from "@/utils/api";
import { Post, Comment } from "@/types";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

interface CommentsModalProps {
  selectedPost: Post | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

const CommentsModal = ({ selectedPost, onClose }: CommentsModalProps) => {
  const { currentUser } = useCurrentUser();
  const api = useApiClient();
  const router = useRouter();

  const {
    commentText,
    setCommentText,
    replyTo,
    setReplyTo,
    createComment,
    toggleLikeComment,
    deleteComment: deleteCommentApi,
    isCreatingComment,
  } = useComments();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (selectedPost) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      fetchComments();
    }
  }, [selectedPost]);

  const fetchComments = () => {
    if (!selectedPost) return;

    setLoading(true);
    api
      .get(`/comments/post/${selectedPost._id}`)
      .then((res) => {
        setComments(res.data.comments || []);
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
        Alert.alert("Error", "Failed to load comments");
      })
      .finally(() => setLoading(false));
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setCommentText("");
      setReplyTo(null);
    });
  };

  if (!selectedPost || !currentUser) return null;

  const goToUserProfile = (username: string) => {
    handleClose();
    setTimeout(() => router.push(`/screens/profile/${username}`), 300);
  };

  const handleLike = (commentId: string) => {
    // Optimistic update
    const updateLikes = (items: Comment[]): Comment[] =>
      items.map((item) => {
        if (item._id === commentId) {
          const isLiked = item.likes.includes(currentUser._id);
          return {
            ...item,
            likes: isLiked
              ? item.likes.filter((id) => id !== currentUser._id)
              : [...item.likes, currentUser._id],
          };
        }
        if (item.replies && item.replies.length > 0) {
          return { ...item, replies: updateLikes(item.replies) };
        }
        return item;
      });

    setComments((prev) => updateLikes(prev));

    // API call
    toggleLikeComment(commentId);
  };

  const handleSend = () => {
    if (!commentText.trim()) return;

    // Create optimistic comment object
    const optimisticComment: Comment = {
      _id: `temp_${Date.now()}`,
      content: commentText.trim(),
      user: currentUser,
      likes: [],
      replies: [],
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    if (replyTo) {
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === replyTo
            ? {
                ...comment,
                replies: [optimisticComment, ...(comment.replies || [])],
              }
            : comment
        )
      );
    } else {
      setComments((prev) => [optimisticComment, ...prev]);
    }

    // API call
    createComment(selectedPost._id, replyTo || undefined);

    // Reset
    setCommentText("");
    setReplyTo(null);
  };

  const handleDelete = (commentId: string) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setComments((prev) => removeComment(prev, commentId));
            deleteCommentApi(commentId);
          },
        },
      ]
    );
  };

  const removeComment = (
    commentsList: Comment[],
    commentId: string
  ): Comment[] =>
    commentsList
      .filter((c) => c._id !== commentId)
      .map((c) => ({
        ...c,
        replies: c.replies ? removeComment(c.replies, commentId) : [],
      }));

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const findCommentUser = (commentId: string): string | null => {
    const findInList = (list: Comment[]): string | null => {
      for (const comment of list) {
        if (comment._id === commentId) return comment.user.username;
        if (comment.replies && comment.replies.length > 0) {
          const found = findInList(comment.replies);
          if (found) return found;
        }
      }
      return null;
    };
    return findInList(comments);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: Comment, isReply = false, level = 0) => {
    const isLiked = comment.likes.includes(currentUser._id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment._id);
    const repliesCount = comment.replies ? comment.replies.length : 0;

    return (
      <View key={comment._id} className={`mb-4 ${isReply ? "ml-12" : ""}`}>
        {/* Comment Content */}
        <View className="flex-row">
          {/* Avatar */}
          <TouchableOpacity
            onPress={() => goToUserProfile(comment.user.username)}
            className="mr-3"
          >
            <Image
              source={{
                uri:
                  comment.user.profilePicture ||
                  "https://via.placeholder.com/150",
              }}
              className="w-9 h-9 rounded-full"
              defaultSource={{ uri: "https://via.placeholder.com/150" }}
            />
          </TouchableOpacity>

          {/* Comment Body */}
          <View className="flex-1">
            {/* User Info & Time */}
            <View className="flex-row justify-between items-start mb-1">
              <View className="flex-1 flex-row items-center flex-wrap">
                <TouchableOpacity
                  onPress={() => goToUserProfile(comment.user.username)}
                >
                  <Text className="font-bold text-gray-900 text-[15px] mr-2">
                    {comment.user.firstName} {comment.user.lastName}
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-500 text-xs mr-2">
                  {formatTime(comment.createdAt)}
                </Text>
              </View>

              {/* Three dots menu */}
              {comment.user._id === currentUser._id && (
                <TouchableOpacity
                  onPress={() => handleDelete(comment._id)}
                  className="ml-2"
                >
                  <MaterialIcons name="more-horiz" size={20} color="#65676B" />
                </TouchableOpacity>
              )}
            </View>

            {/* Comment Text */}
            <Text className="text-gray-900 text-[15px] mb-2 leading-5">
              {comment.content}
            </Text>

            {/* Comment Image (if any) */}
            {comment.image && (
              <Image
                source={{ uri: comment.image }}
                className="w-36 h-36 rounded-lg mb-2"
                resizeMode="cover"
              />
            )}

            {/* Actions Row */}
            <View className="flex-row items-center space-x-6 mb-2">
              {/* Like Button */}
              <TouchableOpacity
                onPress={() => handleLike(comment._id)}
                className="flex-row items-center"
              >
                <AntDesign
                  name={isLiked ? "heart" : "hearto"}
                  size={18}
                  color={isLiked ? "#FF3040" : "#65676B"}
                />
                {comment.likes.length > 0 && (
                  <Text
                    className={`ml-1 text-xs ${isLiked ? "text-[#FF3040] font-semibold" : "text-gray-500"}`}
                  >
                    {comment.likes.length}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Reply Button */}
              <TouchableOpacity
                onPress={() => setReplyTo(comment._id)}
                className="flex-row items-center ml-3"
              >
                <Feather name="corner-up-left" size={18} color="#65676B" />
                <Text className="ml-1 text-gray-500 text-xs">Reply</Text>
              </TouchableOpacity>
            </View>

            {/* View Replies Button */}
            {hasReplies && (
              <TouchableOpacity
                onPress={() => toggleReplies(comment._id)}
                className="flex-row items-center mt-1"
              >
                <View className="w-6 h-[1px] bg-gray-300 mr-2" />
                <Text className="text-blue-500 font-semibold text-xs">
                  {isExpanded ? "Hide" : "View"} {repliesCount}{" "}
                  {repliesCount === 1 ? "reply" : "replies"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Replies */}
            {isExpanded && hasReplies && comment.replies && (
              <View className="mt-3">
                {comment.replies.map((reply) =>
                  renderComment(reply, true, level + 1)
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={!!selectedPost}
      transparent={true}
      animationType="none"
      statusBarTranslucent
    >
      <BlurView intensity={90} tint="dark" className="flex-1">
        <Animated.View
          className="flex-1 mt-12 rounded-t-3xl overflow-hidden"
          style={{ transform: [{ translateY: slideAnim }] }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white"
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          >
            {/* Header */}
            <View className="px-4 pt-4 pb-3 border-b border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <TouchableOpacity onPress={handleClose} className="p-2">
                  <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">
                  Comments
                </Text>
                <View className="w-10" />
              </View>

              {/* Reply Indicator */}
              {replyTo && (
                <View className="flex-row items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                  <View className="flex-row items-center">
                    <Feather name="corner-up-left" size={16} color="#007AFF" />
                    <Text className="ml-2 text-blue-600 text-sm font-medium">
                      Replying to @{findCommentUser(replyTo)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setReplyTo(null)}>
                    <Ionicons name="close" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Content */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {/* Original Post */}
              <View className="px-4 py-4 border-b border-gray-100">
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => goToUserProfile(selectedPost.user.username)}
                    className="mr-3"
                  >
                    <Image
                      source={{
                        uri:
                          selectedPost.user.profilePicture ||
                          "https://via.placeholder.com/150",
                      }}
                      className="w-10 h-10 rounded-full"
                      defaultSource={{ uri: "https://via.placeholder.com/150" }}
                    />
                  </TouchableOpacity>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <View className="flex-1 flex-row items-center flex-wrap">
                        <TouchableOpacity
                          onPress={() =>
                            goToUserProfile(selectedPost.user.username)
                          }
                        >
                          <Text className="font-bold text-gray-900 mr-2">
                            {selectedPost.user.firstName}{" "}
                            {selectedPost.user.lastName}
                          </Text>
                        </TouchableOpacity>
                        <Text className="text-gray-500 text-sm">
                          @{selectedPost.user.username}
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-xs ml-2">
                        {formatTime(selectedPost.createdAt)}
                      </Text>
                    </View>

                    {selectedPost.content && (
                      <Text className="text-gray-900 text-[15px] leading-5 mb-3">
                        {selectedPost.content}
                      </Text>
                    )}

                    {selectedPost.image && (
                      <Image
                        source={{ uri: selectedPost.image }}
                        className="w-full h-64 rounded-xl mb-3"
                        resizeMode="cover"
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* Comments Section */}
              <View className="px-4 pt-4">
                <Text className="font-bold text-lg text-gray-900 mb-4">
                  {comments.length}{" "}
                  {comments.length === 1 ? "Comment" : "Comments"}
                </Text>

                {loading ? (
                  <View className="py-20 items-center">
                    <ActivityIndicator size="large" color="#007AFF" />
                  </View>
                ) : comments.length === 0 ? (
                  <View className="py-20 items-center">
                    <Feather name="message-circle" size={60} color="#D1D1D6" />
                    <Text className="text-gray-500 font-semibold text-lg mt-4">
                      No comments yet
                    </Text>
                    <Text className="text-gray-400 text-sm mt-2">
                      Be the first to share your thoughts!
                    </Text>
                  </View>
                ) : (
                  <View>
                    {comments.map((comment) => renderComment(comment))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Fixed Comment Input */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
              <View className="flex-row items-center">
                <Image
                  source={{
                    uri:
                      currentUser.profilePicture ||
                      "https://via.placeholder.com/150",
                  }}
                  className="w-9 h-9 rounded-full mr-3"
                  defaultSource={{ uri: "https://via.placeholder.com/150" }}
                />
                <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-1">
                  <TextInput
                    placeholder={
                      replyTo
                        ? `Reply to @${findCommentUser(replyTo)}...`
                        : "Add a comment..."
                    }
                    placeholderTextColor="#65676B"
                    value={commentText}
                    onChangeText={setCommentText}
                    className="text-gray-900 text-[15px]"
                    multiline
                  />
                </View>
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!commentText.trim() || isCreatingComment}
                  className={`ml-3 p-3 rounded-full ${commentText.trim() ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  {isCreatingComment ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Feather name="send" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Character Counter */}
              {commentText.length > 0 && (
                <View className="flex-row justify-end mt-2">
                  <Text
                    className={`text-xs ${commentText.length > 280 ? "text-red-500" : "text-gray-500"}`}
                  >
                    {commentText.length}/280
                  </Text>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default CommentsModal;
