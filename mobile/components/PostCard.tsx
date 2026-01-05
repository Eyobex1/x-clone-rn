import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { BlurView } from "expo-blur";

interface PostCardProps {
  post: Post;
  onLike: (postId: string, liked: boolean) => void;
  onDelete: (postId: string) => void;
  onComment: (post: Post) => void;
  onRepost?: (postId: string) => void;
  isLiked?: boolean;
  currentUser: User;
}

const PostCard = ({
  currentUser,
  onDelete,
  onLike,
  post,
  isLiked = false,
  onComment,
  onRepost,
}: PostCardProps) => {
  const router = useRouter();
  const isOwnPost = post.user._id === currentUser._id;
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Optimistic state for like button
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const commentsCount = post.comments?.length || 0;
  const repostsCount = post.reposts?.length || 0;

  // Confirm delete
  const handleDelete = () => {
    setShowMoreOptions(false);
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(post._id),
        },
      ]
    );
  };

  const goToProfile = () => {
    router.push({
      pathname: "/screens/profile/[username]",
      params: { username: post.user.username },
    });
  };

  const imageAspectRatio =
    post.imageWidth && post.imageHeight
      ? post.imageWidth / post.imageHeight
      : 1;

  // Optimistic like
  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => prev + (newLiked ? 1 : -1));
    onLike(post._id, newLiked);
  };

  const handleComment = () => {
    onComment(post);
  };

  const handleRepost = () => {
    if (onRepost) {
      onRepost(post._id);
    }
  };

  const handleShare = async () => {
    try {
      const ANDROID_APP_LINK =
        "https://play.google.com/store/apps/details?id=com.eyob.eyobtweet";

      // Use the post prop that's already available in this component
      const postContent = post.content || "";
      const previewText =
        postContent.length > 100
          ? `${postContent.substring(0, 100)}...`
          : postContent;

      // Universal message for both Android and iOS
      const message = `📲 Eyob Twitter App\n\n"${previewText}"\n\n🔗 ${ANDROID_APP_LINK}\n\nAvailable on Android • Share with friends!`;

      // This works on BOTH platforms
      await Share.share({
        message: message,
        title: "Share from Eyob Twitter",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View className="bg-white border-b border-gray-100">
      {/* Post Container */}
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-start">
          {/* Avatar */}
          <TouchableOpacity onPress={goToProfile} className="mr-3">
            <View className="relative">
              <Image
                source={{
                  uri:
                    post.user.profilePicture ||
                    "https://i.pravatar.cc/150?img=1",
                }}
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
              />
              <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white items-center justify-center">
                <Feather name="check" size={10} color="white" />
              </View>
            </View>
          </TouchableOpacity>

          {/* User Info & Content */}
          <View className="flex-1">
            {/* Top Row: Name, Username, Time, Options */}
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center flex-wrap">
                <TouchableOpacity onPress={goToProfile} className="mr-2">
                  <Text className="font-bold text-gray-900 text-[16px]">
                    {post.user.firstName} {post.user.lastName}
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-500 text-sm mr-2">
                  @{post.user.username}
                </Text>
                <Text className="text-gray-400 text-xs">·</Text>
                <Text className="text-gray-400 text-sm ml-2">
                  {formatDate(post.createdAt)}
                </Text>
              </View>

              {/* Options Button */}
              <TouchableOpacity
                onPress={() => setShowMoreOptions(!showMoreOptions)}
                className="p-1"
              >
                <MaterialIcons name="more-horiz" size={22} color="#8e8e93" />
              </TouchableOpacity>
            </View>

            {/* More Options Modal */}
            {showMoreOptions && (
              <BlurView
                intensity={90}
                tint="light"
                className="absolute right-0 top-8 rounded-xl overflow-hidden z-50 shadow-lg"
              >
                <View className="bg-white/95 p-2 rounded-xl min-w-[180px]">
                  {isOwnPost ? (
                    <>
                      <TouchableOpacity
                        className="flex-row items-center px-4 py-3"
                        onPress={handleDelete}
                      >
                        <Feather name="trash-2" size={18} color="#FF3B30" />
                        <Text className="ml-3 text-[#FF3B30] font-medium">
                          Delete Post
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-row items-center px-4 py-3">
                        <Feather name="edit-2" size={18} color="#007AFF" />
                        <Text className="ml-3 text-[#007AFF] font-medium">
                          Edit Post
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <></>
                  )}
                  <TouchableOpacity className="flex-row items-center px-4 py-3">
                    <Feather name="bookmark" size={18} color="#2bc09bff" />
                    <Text className="ml-3 text-gray-600 font-medium">
                      save post
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            )}

            {/* Post Content */}
            {post.content && (
              <Text className="text-gray-900 text-[15px] leading-6 mb-3">
                {post.content}
              </Text>
            )}
          </View>
        </View>

        {/* Post Image */}
        {post.image && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/screens/image-viewer/image-viewer",
                params: { uri: post.image },
              })
            }
            className="mt-3 rounded-2xl overflow-hidden bg-gray-100"
          >
            <Image
              source={{ uri: post.image }}
              style={{
                width: "100%",
                aspectRatio: imageAspectRatio > 0 ? imageAspectRatio : 16 / 9,
              }}
              className="rounded-2xl"
              resizeMode="cover"
            />
            <View className="absolute bottom-4 right-4 bg-black/60 rounded-full px-3 py-1">
              <Feather name="maximize-2" size={16} color="white" />
            </View>
          </TouchableOpacity>
        )}

        {/* SINGLE Action Row with counts */}
        <View className="flex-row items-center justify-between mt-4 border-t border-gray-100 pt-4">
          {/* Like */}
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleLike}
          >
            <View
              className={`w-10 h-10 rounded-full ${liked ? "bg-red-50" : "bg-gray-50"} items-center justify-center mr-2`}
            >
              {liked ? (
                <AntDesign name="heart" size={20} color="#FF3B30" />
              ) : (
                <Feather name="heart" size={20} color="#8e8e93" />
              )}
            </View>
            <View>
              <Text
                className={`text-sm font-semibold ${liked ? "text-[#FF3B30]" : "text-gray-600"}`}
              >
                {formatNumber(likesCount)}
              </Text>
              <Text className="text-xs text-gray-400">Likes</Text>
            </View>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleComment}
          >
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-2">
              <Feather name="message-circle" size={20} color="#007AFF" />
            </View>
            <View>
              <Text className="text-sm font-semibold text-gray-600">
                {formatNumber(commentsCount)}
              </Text>
              <Text className="text-xs text-gray-400">Comments</Text>
            </View>
          </TouchableOpacity>

          {/* Repost */}
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleRepost}
          >
            <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-2">
              <Feather name="repeat" size={20} color="#34C759" />
            </View>
            <View>
              <Text className="text-sm font-semibold text-gray-600">
                {formatNumber(repostsCount)}
              </Text>
              <Text className="text-xs text-gray-400">Reposts</Text>
            </View>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleShare}
          >
            <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-2">
              <Feather name="send" size={20} color="#5856D6" />
            </View>
            <View>
              <Text className="text-sm font-semibold text-gray-600">Share</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Background overlay for options modal */}
      {showMoreOptions && (
        <TouchableOpacity
          className="absolute inset-0 bg-transparent"
          onPress={() => setShowMoreOptions(false)}
        />
      )}
    </View>
  );
};

export default PostCard;
