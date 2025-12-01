import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiClient, postApi, PostsResponse } from "../utils/api";

const LIMIT = 10;

export const usePosts = (username?: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const { data, isLoading, error, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery({
      queryKey: username ? ["userPosts", username] : ["posts"],
      initialPageParam: 0,

      queryFn: async (context) => {
        const pageParam = (context.pageParam as number) ?? 0;

        return username
          ? await postApi.getUserPosts(api, username, pageParam, LIMIT)
          : await postApi.getPosts(api, pageParam, LIMIT);
      },

      getNextPageParam: (lastPage, pages) => {
        if (!lastPage || lastPage.posts.length < LIMIT) return undefined;
        return pages.flatMap((p) => p.posts).length;
      },
    });

  // ✅ data.pages is now correctly typed
  const posts: any[] = data?.pages?.flatMap((p) => p.posts) ?? [];

  const likePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.likePost(api, postId),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.deletePost(api, postId),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  return {
    posts,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
    toggleLike: (id: string) => likePostMutation.mutate(id),
    deletePost: (id: string) => deletePostMutation.mutate(id),
  };
};
