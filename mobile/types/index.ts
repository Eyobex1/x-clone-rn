// ===== User =====
export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

// ===== Comment =====
export interface Comment {
  _id: string;
  content: string;
  user: User;
  likes: string[];
  replies?: Comment[];
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

// ===== Post =====
export interface Post {
  _id: string;
  content: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  createdAt: string;
  updatedAt?: string;
  user: User;
  likes: string[]; // array of user IDs
  comments: Comment[];
  reposts?: string[];
}

// ===== Notification =====
export interface Notification {
  _id: string;
  from: {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  to: string;
  type: "like" | "comment" | "follow";
  post?: {
    _id: string;
    content: string;
    image?: string;
  };
  comment?: {
    _id: string;
    content: string;
  };
  createdAt: string;
  uniqueKey: string;
  isRead?: boolean;
}

// ===== UserProfile =====
export interface UserProfile {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
  bannerImage?: string;
  followers?: string[];
  following?: string[];
  createdAt: string;
  posts?: Post[];
  clerkId: string;
  isFollowing: boolean;
  postsCount?: number;
}
