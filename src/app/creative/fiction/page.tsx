// app/creative/fiction/page.tsx
"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import ReactMarkdown from 'react-markdown';

// Mock data for fiction posts
const fictionPosts = [
  { id: 1, title: 'Short Story 1', content: 'This is the content of short story 1...', image: '/wall.jpg' },
  { id: 2, title: 'Novel Excerpt', content: 'This is an excerpt from my novel...', image: '/wall.jpg' },
  // Add more fiction posts here
];

const FictionPage = () => {
  const [selectedPost, setSelectedPost] = useState(null);

  const openPost = (post: any) => {
    setSelectedPost(post);
  };

  const closePost = () => {
    setSelectedPost(null);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Fiction</h1>
      <Masonry
        breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
        className="flex w-auto"
        columnClassName="bg-clip-padding"
      >
        {fictionPosts.map((post) => (
          <motion.div
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden m-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => openPost(post)}
          >
            <Image src={post.image} alt={post.title} width={300} height={200} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 line-clamp-3">{post.content}</p>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closePost}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-4">{selectedPost.title}</h2>
              <Image src={selectedPost.image} alt={selectedPost.title} width={600} height={400} className="w-full rounded-lg mb-4" />
              <ReactMarkdown className="prose">{selectedPost.content}</ReactMarkdown>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FictionPage;