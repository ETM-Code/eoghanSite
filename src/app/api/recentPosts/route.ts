import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
  thumbnail: string;
  type: 'creative' | 'technical';
}

const getPostsFromDir = async (dir: string): Promise<(BlogPost | null)[]> => {
  try {
    const postFolders = await fs.readdir(dir);
    return await Promise.all(postFolders.map(async (folder) => {
      try {
        const postPath = path.join(dir, folder);
        const textMdPath = path.join(postPath, 'text.md');
        
        // Check if text.md exists
        await fs.access(textMdPath);
        
        const textMd = await fs.readFile(textMdPath, 'utf-8');
        const { data, content } = matter(textMd);

        let thumbnail = '/default-thumbnail.jpg';
        const thumbnailFiles = await fs.readdir(postPath);
        const thumbnailFile = thumbnailFiles.find(file => file.startsWith('thumbnail.'));
        if (thumbnailFile) {
          thumbnail = `/blog/${folder}/${thumbnailFile}`;
        }

        return {
          id: folder,
          title: data.title || 'Untitled',
          date: data.date || 'Unknown date',
          content: content ? content.substring(0, 200) + '...' : 'No content available',
          thumbnail: thumbnail,
          type: dir.includes('creative') ? 'creative' : 'technical',
        };
      } catch (error) {
        console.error(`Error processing post ${folder}:`, error);
        return null;
      }
    }));
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
};

export async function GET() {
  try {
    const blogDir = path.join(process.cwd(), 'public', 'creative', 'blog');
    const technicalDir = path.join(process.cwd(), 'public', 'technical', 'blog');

    const creativePosts = await getPostsFromDir(blogDir);
    const technicalPosts = await getPostsFromDir(technicalDir);

    const allPosts = [...creativePosts, ...technicalPosts].filter((post): post is BlogPost => post !== null);

    // Sort posts by date, most recent first
    allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Return only the 3 most recent posts
    return NextResponse.json(allPosts.slice(0, 3));
  } catch (error) {
    console.error('Error in recentPosts API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}