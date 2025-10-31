import dynamic from 'next/dynamic';

const LegacyHomePage = dynamic(() => import('../ClientSideHomePage'), {
  ssr: false,
});

export const metadata = {
  title: 'Legacy Home | Eoghan Collins',
};

export default function LegacyHome() {
  return <LegacyHomePage />;
}
