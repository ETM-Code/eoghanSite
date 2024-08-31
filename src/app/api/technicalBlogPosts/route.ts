// app/api/technicalBlogPosts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface TechBlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
  thumbnail: string | null;
  tags: string[];
}

export async function GET(request: NextRequest) {
  try {
    const blogDir = path.join(process.cwd(), 'public', 'technical', 'blog');
    const postFolders = await fs.readdir(blogDir);

    const posts: (TechBlogPost | null)[] = await Promise.all(postFolders.map(async (folder) => {
      const postPath = path.join(blogDir, folder);
      const textMdPath = path.join(postPath, 'text.md');
      const tagsPath = path.join(postPath, 'tags.txt');

      try {
        await fs.access(textMdPath);
        await fs.access(tagsPath);

        const [textMd, tagsContent] = await Promise.all([
          fs.readFile(textMdPath, 'utf-8'),
          fs.readFile(tagsPath, 'utf-8'),
        ]);

        const { data, content } = matter(textMd);

        const files = await fs.readdir(postPath);
        const thumbnail = files.find(file => 
          file.startsWith('thumbnail.') && 
          ['png', 'jpg', 'svg', 'webp'].includes(path.extname(file).slice(1))
        );

        return {
          id: folder,
          title: data.title || 'Untitled',
          date: data.date || 'Unknown date',
          content: content,
          thumbnail: thumbnail ? `/technical/blog/${folder}/${thumbnail}` : null,
          tags: tagsContent.split('\n').filter(Boolean),
        };
      } catch (error) {
        console.error(`Error processing post ${folder}:`, error);
        return null;
      }
    }));

    const validPosts = posts.filter((post): post is TechBlogPost => post !== null);
    validPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(validPosts);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}