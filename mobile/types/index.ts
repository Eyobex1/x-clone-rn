// types.ts

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
  createdAt: string;
  user: User;
}

// ===== Post =====
export interface Post {
  _id: string;
  content: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  createdAt: string;
  user: User;
  likes: string[]; // array of user IDs
  comments: Comment[];
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
  followers?: string[]; // array of user IDs
  following?: string[]; // array of user IDs
  createdAt: string;
  posts?: Post[]; // optional, user's posts
  clerkId: string;
}
