// app/creative/page.tsx
"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaYoutube, FaTiktok, FaPodcast, FaArrowRight } from 'react-icons/fa';
import BlogPostCard, { BlogPost } from './components/BlogPostCard';
import { useRouter } from 'next/navigation';

const RECENT_POSTS_COUNT = 3;

const HomePage = () => {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await fetch('/api/blogPosts');
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const data: BlogPost[] = await response.json();
        setRecentPosts(data.slice(0, RECENT_POSTS_COUNT));
      } catch (error) {
        console.error('Error fetching recent blog posts:', error);
      }
    };

    fetchRecentPosts();
  }, []);

  const handlePostClick = (post: BlogPost) => {
    router.push(`/creative/blog?postId=${post.id}`);
  };

  return (
    <div className="space-y-16">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-opacity-80 p-6 rounded-lg w-full mx-auto"
      >
        <h1 className="text-4xl font-bold mb-4">Welcome to My Creative Corner</h1>
        <p className="text-xl">
          Here you'll find a collection of my creative works, including blog posts, fiction, and art.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-3xl font-semibold mb-4">Recent Blog Posts</h2>
        <div className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex-shrink-0 w-full sm:w-80">
                <BlogPostCard post={post} onClick={() => handlePostClick(post)} />
              </div>
            ))}
          </div>
          <Link href="/creative/blog" className="absolute left-0 top-full mt-2 flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors">
            <span className="text-lg font-medium">More...</span>
            <FaArrowRight size={20} />
          </Link>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-3xl font-semibold mb-4">Connect With Me</h2>
        <div className="flex space-x-4 pb-20">
          <Link href="https://youtube.com/your-channel" className="text-3xl text-red-600 hover:text-red-700 transition-colors">
            <FaYoutube />
          </Link>
          <Link href="https://tiktok.com/@your-account" className="text-3xl text-black hover:text-gray-800 transition-colors">
            <FaTiktok />
          </Link>
          <Link href="https://your-podcast-link.com" className="text-3xl text-purple-600 hover:text-purple-700 transition-colors">
            <FaPodcast />
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;