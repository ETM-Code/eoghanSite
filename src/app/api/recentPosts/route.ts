//recentPosts API
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET() {
  const blogDir = path.join(process.cwd(), 'public', 'creative', 'blog');
  const postFolders = fs.readdirSync(blogDir);

  const posts = postFolders.map((folder) => {
    const postPath = path.join(blogDir, folder);
    const textMd = fs.readFileSync(path.join(postPath, 'text.md'), 'utf-8');
    const { data, content } = matter(textMd);

    let thumbnail = '/default-thumbnail.jpg';  // Default thumbnail
    const thumbnailFiles = fs.readdirSync(postPath).filter(file => file.startsWith('thumbnail.'));
    if (thumbnailFiles.length > 0) {
      console.log("Hey, I found a thumbnail (${thumbnailFiles.length})");
      thumbnail = `/creative/blog/${folder}/${thumbnailFiles[0]}`;
    }

    return {
      id: folder,
      title: data.title || 'Untitled',
      date: data.date || 'Unknown date',
      preview: content.substring(0, 200) + '...',
      thumbnail: thumbnail,
    };
  });

  // Sort posts by date, most recent first
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Return only the 3 most recent posts
  return NextResponse.json(posts.slice(0, 3));
}