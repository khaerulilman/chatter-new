import axios from "axios";

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ==================== AUTH APIs ====================

export const authAPI = {
  // Register new user
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => {
    return api.post("/api/auth/register", data);
  },

  // Verify OTP
  verifyOtp: (data: { email: string; otp: string }) => {
    return api.post("/api/auth/verify-otp", data);
  },

  // Resend OTP
  resendOtp: (data: { email: string }) => {
    return api.post("/api/auth/resend-otp", data);
  },

  // Login
  login: (data: { email: string; password: string }) => {
    return api.post("/api/auth/login", data);
  },

  // Forgot Password - Send OTP
  forgotPassword: (data: { email: string }) => {
    return api.post("/api/auth/forgot-password", data);
  },

  // Forgot Password - Resend OTP
  resendForgotPasswordOtp: (data: { email: string }) => {
    return api.post("/api/auth/forgot-password/resend-otp", data);
  },

  // Reset Password
  resetPassword: (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    return api.post("/api/auth/reset-password", data);
  },
};

// ==================== USERS APIs ====================

export const usersAPI = {
  // Get all users
  getUsers: () => {
    return api.get("/api/users");
  },

  // Get public profile by username (no token)
  getUserByUsername: (username: string) => {
    return api.get(`/api/users/${username}`);
  },

  // Update profile
  updateProfile: (formData: FormData) => {
    return api.put("/api/users/edit-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// ==================== POSTS APIs ====================

export const postsAPI = {
  // Get all posts
  getPosts: () => {
    return api.get("/api/posts");
  },

  // Get posts by user ID
  getPostsByUserId: (userId: string, page: number = 1, limit: number = 20) => {
    return api.get(`/api/users/${userId}/posts`, {
      params: { page, limit },
    });
  },

  // Get post by ID
  getPostById: (postId: string) => {
    return api.get(`/api/posts/${postId}`);
  },

  // Create new post
  createPost: (formData: FormData) => {
    return api.post("/api/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete post
  deletePost: (postId: string) => {
    return api.delete(`/api/posts/${postId}`);
  },
};

// ==================== LIKES APIs ====================

export const likesAPI = {
  // Toggle like on post
  toggleLike: (postId: string) => {
    return api.patch(`/api/posts/${postId}/likes`);
  },

  // Get like status for a post
  getLikeStatus: (postId: string) => {
    return api.get(`/api/posts/${postId}/likes`);
  },
};

// ==================== COMMENTS APIs ====================

export const commentsAPI = {
  // Get all comments for a post
  getComments: (postId: string) => {
    return api.get(`/api/comments/${postId}`);
  },

  // Get comment count for a post
  getCommentStatus: (postId: string) => {
    return api.get(`/api/comments/${postId}/count`);
  },

  // Create new comment
  createComment: (postId: string, content: string) => {
    return api.post(`/api/comments/${postId}`, { content });
  },

  // Get comment by ID
  getCommentById: (postId: string, commentId: string) => {
    return api.get(`/api/comments/${postId}/${commentId}`);
  },

  // Delete comment
  deleteComment: (postId: string, commentId: string) => {
    return api.delete(`/api/comments/${postId}/${commentId}`);
  },
};

// ==================== CHATS APIs ====================

export const chatsAPI = {
  // Get or create a conversation with a user
  getOrCreateConversation: (targetUserId: string) => {
    return api.post("/api/chats/conversations", {
      target_user_id: targetUserId,
    });
  },

  // Get all conversations for the logged-in user
  getConversations: () => {
    return api.get("/api/chats/conversations");
  },

  // Get messages in a conversation (paginated)
  getMessages: (
    conversationId: string,
    page: number = 1,
    limit: number = 30,
  ) => {
    return api.get(`/api/chats/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
  },

  // Send a message (text only or with image)
  sendMessage: (conversationId: string, formData: FormData) => {
    return api.post(
      `/api/chats/conversations/${conversationId}/messages`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
};

// ==================== FOLLOWS APIs ====================

export const followsAPI = {
  // Toggle follow / unfollow a user
  toggleFollow: (userId: string) => {
    return api.patch(`/api/follows/${userId}/toggle`);
  },

  // Get follow status for a user (is the logged-in user following them?)
  getFollowStatus: (userId: string) => {
    return api.get(`/api/follows/${userId}/status`);
  },

  // Get followers list for a user
  getFollowers: (userId: string) => {
    return api.get(`/api/follows/${userId}/followers`);
  },

  // Get following list for a user
  getFollowing: (userId: string) => {
    return api.get(`/api/follows/${userId}/following`);
  },

  // Get follow stats (followerCount, followingCount) for a user
  getFollowStats: (userId: string) => {
    return api.get(`/api/follows/stats/${userId}`);
  },

  // Get recommended users (not yet followed by logged-in user)
  getRecommendedUsers: () => {
    return api.get("/api/follows/recommended");
  },

  // Get IDs of all users the logged-in user follows
  getFollowingIds: () => {
    return api.get("/api/follows/following-ids");
  },
};

// Export the axios instance for custom requests
export default api;
