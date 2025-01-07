import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definisikan tipe untuk komentar
interface Comment {
  userId: string;
  content: string;
  timestamp: string;
}

// Definisikan tipe untuk konteks komentar
interface CommentsContextType {
  comments: Record<string, Comment[]>; // Menyimpan komentar berdasarkan ID post
  addComment: (postId: string, newComment: Comment) => void; // Fungsi untuk menambah komentar
}

// Buat konteks dengan nilai default undefined
const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

// Komponen provider untuk komentar
export const CommentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<Record<string, Comment[]>>({}); // State untuk menyimpan komentar

  const addComment = (postId: string, newComment: Comment) => {
    setComments((prevComments) => {
      const postComments = prevComments[postId] || [];
      return { ...prevComments, [postId]: [...postComments, newComment] };
    });
  };

  return (
    <CommentsContext.Provider value={{ comments, addComment }}>
      {children}
    </CommentsContext.Provider>
  );
};

// Hook untuk menggunakan CommentsContext
export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return context;
};
