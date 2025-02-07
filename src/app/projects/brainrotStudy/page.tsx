import dynamic from 'next/dynamic';
import Script from 'next/script';

const StudyPage = dynamic(() => import('./components/studyPage'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Script src="https://www.youtube.com/iframe_api" strategy="beforeInteractive" />
      <StudyPage />
    </>
  );
}