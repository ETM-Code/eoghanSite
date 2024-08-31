// app/creative/blog/BlogPageContentpage.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import ReactMarkdown from 'react-markdown';
import { FaArrowLeft } from 'react-icons/fa';
import { Components } from 'react-markdown';
import { useSearchParams } from 'next/navigation';
import BlogPostCard, { BlogPost } from '../components/BlogPostCard';

const BlogPage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch('/api/blogPosts');
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const data: BlogPost[] = await response.json();
        setBlogPosts(data);

        const postId = searchParams?.get('postId');
        if (postId) {
          const post = data.find(p => p.id === postId);
          if (post) {
            setSelectedPost(post);
          }
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      }
    };
    fetchBlogPosts();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [searchParams]);

  const openPost = (post: BlogPost) => {
    setSelectedPost(post);
  };

  const closePost = () => {
    setSelectedPost(null);
  };

  const customRenderers: Components = {
    img: ({ src, alt, ...props }) => {
      const imageSrc = src?.startsWith('images/') 
        ? `/creative/blog/${selectedPost?.id}/${src}`
        : src;
      return <img src={imageSrc} alt={alt} className="w-full h-auto max-h-[400px] object-contain my-4 rounded-lg" {...props} />;
    },
    p: ({ children }) => (
      <p className="mb-4">{children}</p>
    ),
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mt-6 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mt-5 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium mt-4 mb-2">{children}</h3>
    ),
    
  };

  

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <Masonry
        breakpointCols={{ default: 3, 1100: 2, 700: 2 }}
        className="flex w-auto"
        columnClassName="bg-clip-padding"
      >
        {blogPosts.map((post) => (
          <BlogPostCard key={post.id} post={post} onClick={() => openPost(post)} />
        ))}
      </Masonry>

      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
            onClick={closePost}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`bg-amber-50 rounded-lg p-8 z-50 overflow-y-auto ${
                isMobile ? 'w-full h-full' : 'w-2/3 max-h-[90vh]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {isMobile && (
                <button
                  onClick={closePost}
                  className="mb-4 text-2xl"
                  aria-label="Close"
                >
                  <FaArrowLeft />
                </button>
              )}
              <h2 className="text-3xl font-bold mb-2">{selectedPost.title}</h2>
              {selectedPost.date && <p className="text-sm text-gray-500 mb-4">{selectedPost.date}</p>}
              <ReactMarkdown 
                components={customRenderers}
                className="prose prose-lg max-w-none"
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

export default BlogPage;