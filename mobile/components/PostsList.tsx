import {
  FlatList,
  ActivityIndicator,
  Text,
  View,
  RefreshControl,
  RefreshControlProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { usePosts } from "@/hooks/usePosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import PostCard from "./PostCard";
import CommentsModal from "./CommentsModal";

interface PostsListProps {
  username?: string;
  ListHeaderComponent?: React.ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>; // Fixed typing
}

const PostsList: React.FC<PostsListProps> = ({
  username,
  ListHeaderComponent,
  contentContainerStyle,
  refreshControl,
}) => {
  const { currentUser } = useCurrentUser();
  const {
    posts,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    toggleLike,
    deletePost,
  } = usePosts(username);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const selectedPost = selectedPostId
    ? posts.find((p) => p._id === selectedPostId)
    : null;

  if (isLoading && !posts.length) {
    return (
      <View className="p-8 items-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (error && !posts.length) {
    return (
      <View className="p-8 items-center">
        <Text>Failed to load posts</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUser={currentUser}
            onLike={() => toggleLike(item._id)}
            onDelete={() => deletePost(item._id)}
            onComment={() => setSelectedPostId(item._id)}
            isLiked={item.likes.includes(currentUser?._id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#1DA1F2" />
            </View>
          ) : null
        }
        ListHeaderComponent={ListHeaderComponent ?? null}
        contentContainerStyle={contentContainerStyle}
        refreshControl={refreshControl} // Type now matches RefreshControlProps
      />

      <CommentsModal
        selectedPost={selectedPost}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  );
};

export default PostsList;
