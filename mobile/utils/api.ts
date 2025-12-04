import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuth } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://x-clone-rn-mauve.vercel.app/api";

export const createApiClient = (
  getToken: () => Promise<string | null>
): AxiosInstance => {
  const api = axios.create({ baseURL: API_BASE_URL });

  // ===== Request Interceptor =====
  api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getToken();

      // Ensure headers exist, cast to AxiosRequestHeaders
      if (!config.headers) {
        config.headers = {} as InternalAxiosRequestConfig["headers"];
      }

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      config.headers["User-Agent"] =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366";
    } catch (err) {
      console.error("Error fetching token:", err);
    }
    return config;
  });

  // ===== Response Interceptor =====
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const data = error.response?.data as any; // ⭐ cast to any

      if (status === 429) {
        const retryAfterSec = parseInt(
          error.response?.headers["retry-after"] || "5",
          10
        );
        Toast.show({
          type: "error",
          text1: "Rate limit exceeded",
          text2: `Please wait ${retryAfterSec} seconds before retrying.`,
          visibilityTime: 4000,
        });

        await new Promise((resolve) =>
          setTimeout(resolve, retryAfterSec * 1000)
        );

        if (error.config) return api.request(error.config);
      } else {
        Toast.show({
          type: "error",
          text1: `Request failed (${status})`,
          text2: data?.error || data?.message || error.message, // ✅ works now
          visibilityTime: 4000,
        });
        console.error("Axios error:", { message: error.message, status, data });
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();
  return createApiClient(getToken);
};

// Response type based on backend
export interface PostsResponse {
  posts: any[];
}

// ===== API ENDPOINTS =====
export const userApi = {
  syncUser: (api: AxiosInstance) => api.post("/users/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  updateProfile: (api: AxiosInstance, data: FormData) =>
    api.put("/users/profile", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  followUser: (api: AxiosInstance, targetUserId: string) =>
    api.post(`/users/follow/${targetUserId}`),
};

export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) =>
    api.post("/posts", data),

  getPosts: (api: AxiosInstance, skip: number = 0, limit: number = 10) =>
    api
      .get<PostsResponse>(`/posts?skip=${skip}&limit=${limit}`)
      .then((res) => res.data),

  getUserPosts: (
    api: AxiosInstance,
    username: string,
    skip: number = 0,
    limit: number = 10
  ) =>
    api
      .get<PostsResponse>(`/posts/user/${username}?skip=${skip}&limit=${limit}`)
      .then((res) => res.data),

  likePost: (api: AxiosInstance, postId: string) =>
    api.post(`/posts/${postId}/like`),

  deletePost: (api: AxiosInstance, postId: string) =>
    api.delete(`/posts/${postId}`),
};

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
};

export const searchApi = {
  search: (api: AxiosInstance, query: string) =>
    api.get(`/search`, {
      params: { query },
    }),
};
