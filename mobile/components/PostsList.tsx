import {
  FlatList,
  ActivityIndicator,
  Text,
  View,
  StyleProp,
  ViewStyle,
  RefreshControlProps,
} from "react-native";
import { usePosts } from "@/hooks/usePosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState, forwardRef, useMemo } from "react";
import PostCard from "./PostCard";
import CommentsModal from "./CommentsModal";

interface PostsListProps {
  username?: string;
  ListHeaderComponent?: React.ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const PostsList = forwardRef<FlatList<any>, PostsListProps>(
  (
    { username, ListHeaderComponent, contentContainerStyle, refreshControl },
    ref
  ) => {
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

    // =========================
    // Deduplicate posts to prevent "duplicate key" warning
    // =========================
    const uniquePosts = useMemo(() => {
      const map = new Map<string, (typeof posts)[0]>();
      posts.forEach((post) => {
        map.set(post._id, post);
      });
      return Array.from(map.values());
    }, [posts]);

    // Show loader if fetching initial posts
    if (isLoading && !posts.length) {
      return (
        <View style={{ padding: 32, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      );
    }

    // Show error if failed to fetch
    if (error && !posts.length) {
      return (
        <View style={{ padding: 32, alignItems: "center" }}>
          <Text>Failed to load posts</Text>
        </View>
      );
    }

    return (
      <>
        <FlatList
          ref={ref}
          data={uniquePosts} // ✅ Use deduplicated posts
          keyExtractor={(item) => item._id} // Safe now since duplicates are removed
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
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator size="small" color="#1DA1F2" />
              </View>
            ) : null
          }
          ListHeaderComponent={ListHeaderComponent ?? null}
          contentContainerStyle={contentContainerStyle}
          refreshControl={refreshControl ?? undefined}
        />

        <CommentsModal
          selectedPost={selectedPost}
          onClose={() => setSelectedPostId(null)}
        />
      </>
    );
  }
);

export default PostsList;
