// app/creative/blog/page.tsx
"use client"
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const BlogPageContent = dynamic(() => import('./BlogPageContent'), { ssr: false });

const LoadingFallback = () => <div>Loading...</div>;

const BlogPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BlogPageContent />
    </Suspense>
  );
};

export default BlogPage;