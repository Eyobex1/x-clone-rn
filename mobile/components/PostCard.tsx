import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { AntDesign, Feather } from "@expo/vector-icons";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onComment: (post: Post) => void;
  isLiked?: boolean;
  currentUser: User;
}

const PostCard = ({
  currentUser,
  onDelete,
  onLike,
  post,
  isLiked,
  onComment,
}: PostCardProps) => {
  const router = useRouter();
  const isOwnPost = post.user._id === currentUser._id;

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

  // Image aspect ratio
  const imageAspectRatio =
    post.imageWidth && post.imageHeight
      ? post.imageWidth / post.imageHeight
      : 1;

  return (
    <View className="border-b border-gray-100 bg-white">
      {/* HEADER (Profile picture + name + timestamp) */}
      <View className="flex-row p-4">
        {/* Profile picture */}
        <TouchableOpacity onPress={goToProfile}>
          <Image
            source={{ uri: post.user.profilePicture || "" }}
            className="w-12 h-12 rounded-full mr-3"
          />
        </TouchableOpacity>

        {/* User info + content (NO IMAGE HERE) */}
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

      {/* FULL-WIDTH IMAGE */}
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
            style={{
              width: "100%",
              aspectRatio: imageAspectRatio,
            }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {/* ACTIONS */}
      <View className="px-4 py-3">
        <View className="flex-row justify-between max-w-xs">
          {/* Comments */}
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => onComment(post)}
          >
            <Feather name="message-circle" size={18} color="#657786" />
            <Text className="text-gray-500 text-sm ml-2">
              {formatNumber(post.comments?.length || 0)}
            </Text>
          </TouchableOpacity>

          {/* Retweet / Repost */}
          <TouchableOpacity className="flex-row items-center">
            <Feather name="repeat" size={18} color="#657786" />
            <Text className="text-gray-500 text-sm ml-2">0</Text>
          </TouchableOpacity>

          {/* Like */}
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => onLike(post._id)}
          >
            {isLiked ? (
              <AntDesign name="heart" size={18} color="#E0245E" />
            ) : (
              <Feather name="heart" size={18} color="#657786" />
            )}
            <Text
              className={`text-sm ml-2 ${
                isLiked ? "text-red-500" : "text-gray-500"
              }`}
            >
              {formatNumber(post.likes?.length || 0)}
            </Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity>
            <Feather name="share" size={18} color="#657786" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
