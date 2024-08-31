// app/api/artPieces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface ArtPiece {
  id: string;
  title: string;
  date: string;
  description: string;
  artwork: string | null;  // Changed to allow null
  thumbnail: string | null;
  timelapse: string | null;
  tags: string[];
}

export async function GET(request: NextRequest) {
  try {
    const artDir = path.join(process.cwd(), 'public', 'creative', 'art');
    const pieceFolders = await fs.readdir(artDir);

    const pieces: (ArtPiece | null)[] = await Promise.all(pieceFolders.map(async (folder) => {
      const piecePath = path.join(artDir, folder);
      const infoMdPath = path.join(piecePath, 'info.md');
      const tagsPath = path.join(piecePath, 'tags.txt');

      try {
        await fs.access(infoMdPath);
        await fs.access(tagsPath);

        const [infoMd, tagsContent] = await Promise.all([
          fs.readFile(infoMdPath, 'utf-8'),
          fs.readFile(tagsPath, 'utf-8'),
        ]);

        const { data, content } = matter(infoMd);

        const files = await fs.readdir(piecePath);
        const artwork = files.find(file => file.startsWith('artwork.'));
        const thumbnail = files.find(file => file.startsWith('thumbnail.'));
        const timelapse = files.find(file => file.startsWith('timelapse.'));

        return {
          id: folder,
          title: data.title || 'Untitled',
          date: data.date || 'Unknown date',
          description: content,
          artwork: artwork ? `/creative/art/${folder}/${artwork}` : null,
          thumbnail: thumbnail ? `/creative/art/${folder}/${thumbnail}` : null,
          timelapse: timelapse ? `/creative/art/${folder}/${timelapse}` : null,
          tags: tagsContent.split('\n').filter(Boolean),
        };
      } catch (error) {
        console.error(`Error processing art piece ${folder}:`, error);
        return null;
      }
    }));

    const validPieces = pieces.filter((piece): piece is ArtPiece => piece !== null);
    validPieces.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(validPieces);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}