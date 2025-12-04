import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { AntDesign, Feather } from "@expo/vector-icons"; // Use only original icons
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  onLike: (postId: string, liked: boolean) => void; // Pass liked state to parent
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

  // Optimistic state for like button
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  // Confirm delete
  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(post._id),
      },
    ]);
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

  return (
    <View className="border-b border-gray-100 bg-white">
      {/* HEADER */}
      <View className="flex-row p-4">
        <TouchableOpacity onPress={goToProfile}>
          <Image
            source={{ uri: post.user.profilePicture || "" }}
            className="w-12 h-12 rounded-full mr-3"
          />
        </TouchableOpacity>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <TouchableOpacity onPress={goToProfile}>
              <Text className="font-bold text-gray-900">
                {post.user.firstName} {post.user.lastName}
              </Text>
              <Text className="text-gray-500">
                @{post.user.username} · {formatDate(post.createdAt)}
              </Text>
            </TouchableOpacity>
            {isOwnPost && (
              <TouchableOpacity onPress={handleDelete}>
                <Feather name="trash" size={20} color="red" />
              </TouchableOpacity>
            )}
          </View>
          {post.content && (
            <Text className="text-gray-900 text-base leading-5 mt-2">
              {post.content}
            </Text>
          )}
        </View>
      </View>

      {/* IMAGE */}
      {post.image && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/screens/image-viewer/image-viewer",
              params: { uri: post.image },
            })
          }
        >
          <Image
            source={{ uri: post.image }}
            style={{ width: "100%", aspectRatio: imageAspectRatio }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {/* ACTIONS: Order → Comment, Repost, Share, Like */}
      <View className="flex-row border-t border-b border-gray-100 mt-2">
        {/* Like */}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3 "
          onPress={handleLike}
        >
          {liked ? (
            <AntDesign name="heart" size={22} color="#E0245E" />
          ) : (
            <Feather name="heart" size={22} color="#657786" />
          )}
          <Text className={`ml-2 ${liked ? "text-red-500" : "text-gray-500"}`}>
            {formatNumber(likesCount)}
          </Text>
        </TouchableOpacity>
        {/* Comments */}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3"
          onPress={() => onComment(post)}
        >
          <Feather name="message-circle" size={22} color="#657786" />
          <Text className="ml-2 text-gray-500">
            {formatNumber(post.comments?.length || 0)}
          </Text>
        </TouchableOpacity>

        {/* Repost */}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3"
          onPress={() => onRepost && onRepost(post._id)}
        >
          <Feather name="repeat" size={22} color="#657786" />
          <Text className="ml-2 text-gray-500">
            {formatNumber(post.reposts?.length || 0)}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3"
          onPress={() => alert("Share post")}
        >
          <Feather name="share" size={22} color="#657786" />
          <Text className="ml-2 text-gray-500">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;
