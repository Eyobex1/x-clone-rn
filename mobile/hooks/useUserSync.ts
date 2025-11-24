import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { useApiClient, userApi } from "../utils/api";

export const useUserSync = () => {
  const { isSignedIn, getToken } = useAuth();
  const api = useApiClient();

  // Mutation to sync user
  const syncUserMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("User not authenticated");
      const response = await userApi.syncUser(api);
      return response.data.user;
    },
    onSuccess: (user) => console.log("User synced successfully:", user),
    onError: (err: any) =>
      console.error("User sync failed:", err.message || err),
  });

  // Query to get current user from backend
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("User not authenticated");
      try {
        const res = await userApi.getCurrentUser(api);
        return res.data.user;
      } catch (err: any) {
        if (err.response?.status === 404) {
          // User not found → sync
          const syncRes = await syncUserMutation.mutateAsync();
          return syncRes;
        }
        throw err;
      }
    },
    enabled: isSignedIn, // only fetch if signed in
  });

  // Auto-refetch when signed in
  useEffect(() => {
    if (isSignedIn) {
      refetch();
    }
  }, [isSignedIn, refetch]);

  return { user: data, isLoading, isError: !!error, error };
};
