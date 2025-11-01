import type { Metadata } from 'next';
import ScholarMatcherClient from './scholar-matcher-client';

export const metadata: Metadata = {
  title: 'Scholar Matcher | Eoghan Collins',
  description:
    'A vibrant social space where scholars can craft standout profiles, connect, and discover collaborators.',
};

export default function ScholarMatcherPage() {
  return <ScholarMatcherClient />;
}
