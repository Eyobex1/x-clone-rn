import axios, { AxiosInstance } from "axios";
import { useAuth } from "@clerk/clerk-expo";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://x-clone-rn-mauve.vercel.app/api";

export const createApiClient = (
  getToken: () => Promise<string | null>
): AxiosInstance => {
  const api = axios.create({ baseURL: API_BASE_URL });

  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      else console.warn("No token available, skipping Authorization header");

      // Browser-like User-Agent to bypass bot detection
      config.headers["User-Agent"] =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366";
    } catch (err) {
      console.error("Error fetching token:", err);
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        console.error("Unexpected error:", error);
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
