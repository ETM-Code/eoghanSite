import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ArtPageContent = dynamic(() => import('./ArtPageContent'), { ssr: false });

const LoadingFallback = () => <div>Loading...</div>;

const ArtPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ArtPageContent />
    </Suspense>
  );
};

export default ArtPage;