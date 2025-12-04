import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../utils/api";

export const useUnreadNotifications = () => {
  const api = useApiClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const res = await api.get("/notifications/unread-count");
      return res.data.count;
    },
    refetchInterval: 5000, // ⭐ AUTO REFRESH every 5 seconds
  });

  return {
    unreadCount: data || 0,
    isLoading,
    refetch,
  };
};
