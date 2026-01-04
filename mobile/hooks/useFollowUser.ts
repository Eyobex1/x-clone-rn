import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, useApiClient } from "@/utils/api";
import { useAuth } from "@clerk/clerk-expo";

export const useFollowUser = (username: string, targetUserClerkId: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { userId: currentUserId } = useAuth();

  return useMutation({
    mutationFn: () => userApi.followUser(api, targetUserClerkId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["userProfile", username] });
      await queryClient.cancelQueries({ queryKey: ["followList"] });
      await queryClient.cancelQueries({ queryKey: ["currentUser"] });

      const previousUserProfile = queryClient.getQueryData([
        "userProfile",
        username,
      ]);
      const previousFollowList = queryClient.getQueryData(["followList"]);
      const previousCurrentUser = queryClient.getQueryData(["currentUser"]);

      queryClient.setQueryData(["userProfile", username], (old: any) => {
        if (!old) return old;
        const isCurrentlyFollowing = old.followers?.includes(currentUserId);
        return {
          ...old,
          followers: isCurrentlyFollowing
            ? old.followers.filter((id: string) => id !== currentUserId)
            : [...(old.followers || []), currentUserId],
        };
      });

      queryClient.setQueryData(["followList"], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((user: any) => {
          if (user.clerkId === targetUserClerkId) {
            const isCurrentlyFollowing =
              user.followers?.includes(currentUserId);
            return {
              ...user,
              followers: isCurrentlyFollowing
                ? user.followers.filter((id: string) => id !== currentUserId)
                : [...(user.followers || []), currentUserId],
              isFollowing: !isCurrentlyFollowing, // CRITICAL FIX
            };
          }
          return user;
        });
      });

      queryClient.setQueryData(["currentUser"], (old: any) => {
        if (!old) return old;
        const isCurrentlyFollowing = old.following?.includes(targetUserClerkId);
        return {
          ...old,
          following: isCurrentlyFollowing
            ? old.following.filter((id: string) => id !== targetUserClerkId)
            : [...(old.following || []), targetUserClerkId],
        };
      });

      return {
        previousUserProfile,
        previousFollowList,
        previousCurrentUser,
      };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousUserProfile) {
        queryClient.setQueryData(
          ["userProfile", username],
          context.previousUserProfile
        );
      }
      if (context?.previousFollowList) {
        queryClient.setQueryData(["followList"], context.previousFollowList);
      }
      if (context?.previousCurrentUser) {
        queryClient.setQueryData(["currentUser"], context.previousCurrentUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === "followList",
      });

      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
