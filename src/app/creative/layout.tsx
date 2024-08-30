// app/creative/layout.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic'

const MotionMain = dynamic(() => import('framer-motion').then((mod) => mod.motion.main), { ssr: false })


const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen text-gray-800 p-8 relative" style={{ backgroundColor: '#F5E6D3' }}>
      <nav className="mb-8 relative z-10">
        <ul className="flex space-x-4">
          <li>
            <Link href="/creative" className="text-lg hover:text-amber-600 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/creative/blog" className="text-lg hover:text-amber-600 transition-colors">
              Blog
            </Link>
          </li>
          <li>
            <Link href="/creative/fiction" className="text-lg hover:text-amber-600 transition-colors">
              Fiction
            </Link>
          </li>
          <li>
            <Link href="/creative/art" className="text-lg hover:text-amber-600 transition-colors">
              Art
            </Link>
          </li>
        </ul>
      </nav>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;