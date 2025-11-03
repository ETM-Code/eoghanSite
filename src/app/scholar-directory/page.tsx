import type { Metadata } from 'next';
import ScholarDirectoryClient from './scholar-directory-client';

export const metadata: Metadata = {
  title: 'Scholar Directory | Eoghan Collins',
  description:
    'A vibrant social directory where Web Summit scholars showcase their work and discover collaborators.',
};

export default function ScholarDirectoryPage() {
  return <ScholarDirectoryClient />;
}
