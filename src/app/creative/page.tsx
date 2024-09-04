import { Suspense } from 'react';
import CreativePage from './homePage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreativePage />
    </Suspense>
  );
}