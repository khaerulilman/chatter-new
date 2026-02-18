import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const PostsContext = createContext(undefined);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/posts?page=1&limit=20`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      );
      setPosts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
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

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <PostsContext.Provider value={{ posts, addPost, updatePost, fetchPosts }}>
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
