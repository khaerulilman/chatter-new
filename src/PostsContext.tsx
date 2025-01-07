import React, { createContext, useState, useContext, useEffect,  ReactNode } from 'react';
import axios from 'axios'; // Pastikan Anda menginstal axios

interface Post {
  id: string;
  content: string;
  media_url?: string;
  user_name: string;
  user_id: string;
  profile_picture?: string;
  created_at: string;
  likes: number;
  isLiked?: boolean;
}

interface PostsContextType {
  posts: Post[];
  addPost: (newPost: Post) => void;
  updatePost: (updatedPost: Post) => void;
  fetchPosts: () => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('https://chatter-imagekit-mwiert3dk-khaerulilmans-projects.vercel.app/api/auth/posts'); // Ganti dengan URL endpoint Anda
      setPosts(response.data.data); // Sesuaikan dengan struktur respons Anda
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const addPost = (newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const updatePost = (updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
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
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};
