import type { Metadata } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import NewHomePage, { type ProjectContent } from './NewHomePage';

export const metadata: Metadata = {
  title: 'Eoghan Collins | Founder & Engineer',
  description: 'Founder and engineer building purposeful systems across learning, energy, and storytelling.',
};

async function getProjectContent(): Promise<ProjectContent> {
  const filePath = path.join(process.cwd(), 'public', 'projects', 'projects.json');
  const file = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(file) as ProjectContent;
}

export default async function Home() {
  const data = await getProjectContent();
  return <NewHomePage {...data} />;
}
