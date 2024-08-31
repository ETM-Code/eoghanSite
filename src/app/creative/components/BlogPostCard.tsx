import React from 'react';
import { motion } from 'framer-motion';

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
  thumbnail: string | null;
  tags: string[];
  images: string[];
}

interface BlogPostCardProps {
  post: BlogPost;
  onClick?: () => void;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, onClick }) => {
  return (
    <motion.div
      className="bg-amber-50 rounded-lg shadow-md overflow-hidden m-4 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      {post.thumbnail && (
        <div className="w-full h-auto">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-auto object-contain"
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
        {post.date && <p className="text-sm text-gray-500 mb-2">{post.date}</p>}
        <p className="text-gray-600 line-clamp-3">{post.content.substring(0, 150)}...</p>
      </div>
    </motion.div>
  );
};

export default BlogPostCard;