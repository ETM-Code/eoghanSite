// app/technical/components/TechBlog.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import ReactMarkdown from 'react-markdown';
import { FaArrowLeft } from 'react-icons/fa';
import { TechBlogPost } from '../../api/technicalBlogPosts/route';

const TechBlog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<TechBlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<TechBlogPost | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch('/api/technicalBlogPosts');
        if (!response.ok) {
          throw new Error('Failed to fetch technical blog posts');
        }
        const data: TechBlogPost[] = await response.json();
        setBlogPosts(data);
      } catch (error) {
        console.error('Error fetching technical blog posts:', error);
      }
    };
    fetchBlogPosts();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openPost = (post: TechBlogPost) => {
    setSelectedPost(post);
  };

  const closePost = () => {
    setSelectedPost(null);
  };

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold mb-8 text-white">Technical Blog</h2>
      <Masonry
        breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
        className="flex w-auto"
        columnClassName="bg-clip-padding"
      >
        {blogPosts.map((post) => (
          <motion.div
            key={post.id}
            className="bg-gray-800 rounded-lg shadow-md overflow-hidden m-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => openPost(post)}
          >
            {post.thumbnail && (
              <img src={post.thumbnail} alt={post.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-white">{post.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{post.date}</p>
              <p className="text-gray-300 line-clamp-3">{post.content.substring(0, 150)}...</p>
            </div>
          </motion.div>
        ))}
      </Masonry>

      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[9999]"
            onClick={closePost}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`bg-gray-800 rounded-lg p-8 overflow-y-auto ${
                isMobile ? 'w-full h-full' : 'w-2/3 max-h-[90vh]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {isMobile && (
                <button
                  onClick={closePost}
                  className="mb-4 text-2xl text-white"
                  aria-label="Close"
                >
                  <FaArrowLeft />
                </button>
              )}
              <h2 className="text-3xl font-bold mb-2 text-white">{selectedPost.title}</h2>
              <p className="text-sm text-gray-400 mb-4">{selectedPost.date}</p>
              <ReactMarkdown 
                className="prose prose-invert max-w-none"
              >
                {selectedPost.content}
              </ReactMarkdown>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechBlog;