// app/api/fictionPieces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface FictionPiece {
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
    const fictionDir = path.join(process.cwd(), 'public', 'creative', 'fiction');
    const pieceFolders = await fs.readdir(fictionDir);

    const pieces: (FictionPiece | null)[] = await Promise.all(pieceFolders.map(async (folder) => {
      const piecePath = path.join(fictionDir, folder);
      const textMdPath = path.join(piecePath, 'text.md');
      const tagsPath = path.join(piecePath, 'tags.txt');

      try {
        await fs.access(textMdPath);
        await fs.access(tagsPath);

        const [textMd, tagsContent] = await Promise.all([
          fs.readFile(textMdPath, 'utf-8'),
          fs.readFile(tagsPath, 'utf-8'),
        ]);

        const { data, content } = matter(textMd);

        const files = await fs.readdir(piecePath);
        const thumbnail = files.find(file => 
          file.startsWith('thumbnail.') && 
          ['png', 'jpg', 'svg', 'webp'].includes(path.extname(file).slice(1))
        );

        const imagesDir = path.join(piecePath, 'images');
        let images: string[] = [];
        try {
          const imageFiles = await fs.readdir(imagesDir);
          images = imageFiles.map(file => `/creative/fiction/${folder}/images/${file}`);
        } catch (error) {
          console.warn(`No images folder found for fiction piece ${folder}`);
        }

        return {
          id: folder,
          title: data.title || 'Untitled',
          date: data.date || 'Unknown date',
          content: content,
          thumbnail: thumbnail ? `/creative/fiction/${folder}/${thumbnail}` : null,
          tags: tagsContent.split('\n').filter(Boolean),
          images: images,
        };
      } catch (error) {
        console.error(`Error processing fiction piece ${folder}:`, error);
        return null;
      }
    }));

    const validPieces = pieces.filter((piece): piece is FictionPiece => piece !== null);
    validPieces.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(validPieces);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}