// app/creative/page.tsx
"use client"
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaYoutube, FaTiktok, FaPodcast } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="space-y-16">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
        <h2 className="text-3xl font-semibold mb-4">Featured Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Add your featured works here */}
          <Image src="/path-to-image1.jpg" alt="Featured Work 1" width={300} height={200} className="rounded-lg" />
          <Image src="/path-to-image2.jpg" alt="Featured Work 2" width={300} height={200} className="rounded-lg" />
          <Image src="/path-to-image3.jpg" alt="Featured Work 3" width={300} height={200} className="rounded-lg" />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-3xl font-semibold mb-4">Recent Blog Posts</h2>
        <div className="space-y-4">
          {/* Add your recent blog posts here */}
          <Link href="/creative/blog/post-1" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold">Blog Post Title 1</h3>
            <p className="text-gray-600">Preview of the blog post content...</p>
          </Link>
          <Link href="/creative/blog/post-2" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold">Blog Post Title 2</h3>
            <p className="text-gray-600">Preview of the blog post content...</p>
          </Link>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-3xl font-semibold mb-4">Connect With Me</h2>
        <div className="flex space-x-4">
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