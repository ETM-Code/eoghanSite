// app/creative/PostContext.tsx
"use client";
import React, { createContext, useContext, useState } from 'react';

interface PostContextType {
  isPostOpen: boolean;
  setIsPostOpen: (isOpen: boolean) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPostOpen, setIsPostOpen] = useState(false);

  return (
    <PostContext.Provider value={{ isPostOpen, setIsPostOpen }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
};