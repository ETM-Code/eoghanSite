// app/creative/fiction/page.tsx
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const FictionPageContent = dynamic(() => import('./FictionPageContent'), { ssr: false });

const LoadingFallback = () => <div>Loading...</div>;

const FictionPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FictionPageContent />
    </Suspense>
  );
};

export default FictionPage;