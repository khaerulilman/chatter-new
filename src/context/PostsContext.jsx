import React, { createContext, useState, useContext, useEffect } from "react";
import { postsAPI } from "../api/api";
import { useAuth } from "./AuthContext";

const PostsContext = createContext(undefined);

export const PostsProvider = ({ children }) => {
  const { authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts(1, 20);
      setPosts(response.data.data || []);
      setCurrentPage(1);
      setHasMore((response.data.data || []).length >= 20);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await postsAPI.getPosts(nextPage, 20);
      const newPosts = response.data.data || [];

      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setCurrentPage(nextPage);
      setHasMore(newPosts.length >= 20);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const addPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const updatePost = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post,
      ),
    );
  };

  // Wait for auth to be ready (silent refresh) before fetching posts
  // so the access token is available and requesterId is sent
  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [authLoading]);

  return (
    <PostsContext.Provider
      value={{
        posts,
        addPost,
        updatePost,
        fetchPosts,
        loading,
        loadMorePosts,
        loadingMore,
        hasMore,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};
