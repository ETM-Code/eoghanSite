import dynamic from 'next/dynamic';

const ClientSideHomePage = dynamic(() => import('./ClientSideHomePage'), {
  ssr: false,
});

export default function Home() {
  return <ClientSideHomePage />;
}