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

      const previousData = queryClient.getQueryData(["userProfile", username]);

      // Optimistic update
      queryClient.setQueryData(["userProfile", username], (oldData: any) => {
        if (!oldData) return oldData;

        const isFollowing = oldData.followers?.includes(currentUserId);

        return {
          ...oldData,
          followers: isFollowing
            ? oldData.followers.filter((id: string) => id !== currentUserId)
            : [...(oldData.followers || []), currentUserId],
        };
      });

      return { previousData };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(["userProfile", username], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
    },
  });
};
