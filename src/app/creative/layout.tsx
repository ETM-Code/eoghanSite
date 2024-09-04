// app/creative/layout.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { usePathname, useSearchParams } from 'next/navigation';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const postId = searchParams?.get('postId');
      setIsPostOpen(!!postId && pathname === '/creative/blog');
    }
  }, [isClient, pathname, searchParams]);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen text-gray-800 relative" style={{ backgroundColor: '#F5E6D3' }}>
      {!isPostOpen && (
        <Link href="/" className="fixed top-4 left-4 z-50 flex items-center space-x-2 bg-gray-200 px-3 py-2 rounded-full shadow-md">
          <FaArrowLeft className="text-xl text-amber-600" />
          <span className="text-amber-600 font-medium">Back to Main</span>
        </Link>
      )}

      {!isPostOpen && (
        <nav className="fixed top-16 left-0 right-0 z-40">
          <div className="px-4">
            <div className="bg-gray-200 rounded-3xl shadow-md mx-auto max-w-3xl md:max-w-2xl lg:max-w-4xl">
              <ul className="flex justify-center space-x-4 py-4 overflow-x-auto whitespace-nowrap">
                <li>
                  <Link href="/creative" className="text-lg hover:text-amber-600 transition-colors px-2">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/creative/blog" className="text-lg hover:text-amber-600 transition-colors px-2">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/creative/fiction" className="text-lg hover:text-amber-600 transition-colors px-2">
                    Fiction
                  </Link>
                </li>
                <li>
                  <Link href="/creative/art" className="text-lg hover:text-amber-600 transition-colors px-2">
                    Art
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${isPostOpen ? '' : 'pt-40'} px-4 sm:px-8 relative z-10`}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;