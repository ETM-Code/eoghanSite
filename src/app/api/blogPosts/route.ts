import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
  thumbnail: string | null;
  tags: string[];
  images: string[];
}

export async function GET(request: NextRequest) {
  try {
    const blogDir = path.join(process.cwd(), 'public', 'creative', 'blog');
    
    const postFolders = await fs.readdir(blogDir);

    const posts: (BlogPost | null)[] = await Promise.all(postFolders.map(async (folder) => {
      const postPath = path.join(blogDir, folder);
      const textMdPath = path.join(postPath, 'text.md');
      const tagsPath = path.join(postPath, 'tags.txt');

      try {
        // Check if required files exist
        await fs.access(textMdPath);
        await fs.access(tagsPath);

        const [textMd, tagsContent] = await Promise.all([
          fs.readFile(textMdPath, 'utf-8'),
          fs.readFile(tagsPath, 'utf-8'),
        ]);

        const lines = textMd.split('\n');
        let title = folder;
        let date = 'Unknown date';
        let contentLines = [...lines];

        // Extract title if the first line starts with "#"
        if (lines[0].startsWith('# ')) {
          title = lines[0].substring(2).trim();
          contentLines = contentLines.slice(1);
        }

        // Extract date if there's a line starting with "Date:"
        const dateLineIndex = contentLines.findIndex(line => line.startsWith('Date:'));
        if (dateLineIndex !== -1) {
          const fullDate = contentLines[dateLineIndex].substring(5).trim();
          // Extract only the date part (assuming format is "YYYY-MM-DD")
          date = fullDate.split('T')[0];
          contentLines.splice(dateLineIndex, 1);
        }

        const content = contentLines.join('\n').trim();


        // Find thumbnail
        const files = await fs.readdir(postPath);
        const thumbnail = files.find(file => 
          file.startsWith('thumbnail.') && 
          ['png', 'jpg', 'svg', 'webp'].includes(path.extname(file).slice(1))
        );

        // Get images from the images folder
        const imagesDir = path.join(postPath, 'images');
        let images: string[] = [];
        try {
          const imageFiles = await fs.readdir(imagesDir);
          images = imageFiles.map(file => `/creative/blog/${folder}/images/${file}`);
        } catch (error) {
          console.warn(`No images folder found for post ${folder}`);
        }

        return {
          id: folder,
          title: title,
          date: date,
          content: content,
          thumbnail: thumbnail ? `/creative/blog/${folder}/${thumbnail}` : null,
          tags: tagsContent.split('\n').filter(Boolean),
          images: images,
        };
      } catch (error) {
        console.error(`Error processing post ${folder}:`, error);
        return null;
      }
    }));

    const validPosts = posts.filter((post): post is BlogPost => post !== null);
    validPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(validPosts);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}