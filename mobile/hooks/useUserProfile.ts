import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/utils/api";
import { UserProfile } from "@/types";

export const useUserProfile = (username: string) => {
  const api = useApiClient();

  return useQuery<UserProfile, Error>({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await api.get(`/users/profile/${username}`);
      return res.data.user as UserProfile; // extract 'user'
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};
