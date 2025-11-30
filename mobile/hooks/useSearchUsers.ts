import { useQuery } from "@tanstack/react-query";
import { useApiClient, searchApi } from "@/utils/api";

export const useSearchUsers = (query: string) => {
  const api = useApiClient();

  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await searchApi.search(api, query);
      return res.data.users; // assuming API returns { users: [], posts: [] }
    },
    enabled: query.length > 0,
  });
};
