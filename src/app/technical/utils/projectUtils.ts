import fs from 'fs/promises';
import path from 'path';

export interface Media {
  type: 'image' | 'video';
  src: string;
}

export interface LinkWithLabel {
    url: string;
    label: string;
  }
  
  export interface Project {
    id: string;
    title: string;
    image: string;
    description: string;
    languages: string[];
    links: {
      github?: string | LinkWithLabel[];
      youtube?: string;
      external?: string;
      npm?: string;
      documentation?: string;
      googleDrive?: string | LinkWithLabel[];
    };
    media: Media[];
  }

  export async function getProjects(): Promise<Project[]> {
    const projectsDirectory = path.join(process.cwd(), 'public', 'data');
    const projectFolders = await fs.readdir(projectsDirectory);

    const projects = await Promise.all(projectFolders.map(async (folder) => {
        const folderPath = path.join(projectsDirectory, folder);
        const files = await fs.readdir(folderPath);

        const imageFile = files.find(file => /\.(png|jpg|jpeg|webp|svg)$/.test(file));
        if (!imageFile) {
            throw new Error(`No image file found in project folder: ${folder}`);
        }
        const imagePath = `/data/${folder}/${imageFile}`;

        const titleContent = await fs.readFile(path.join(folderPath, 'title.txt'), 'utf-8');
        const descriptionContent = await fs.readFile(path.join(folderPath, 'description.md'), 'utf-8');
        const languagesContent = await fs.readFile(path.join(folderPath, 'languages.txt'), 'utf-8');
        const linksContent = await fs.readFile(path.join(folderPath, 'links.json'), 'utf-8');

        const mediaFolder = path.join(folderPath, 'media');
        let mediaFiles: string[] = [];
        try {
            mediaFiles = await fs.readdir(mediaFolder);
        } catch (error) {
            console.warn(`No media folder found for project: ${folder}`);
        }

        const media = await Promise.all(mediaFiles.map(async (file) => {
            const filePath = path.join(mediaFolder, file);
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
                if (/\.(png|jpg|jpeg|webp|svg)$/.test(file)) {
                    return { type: 'image' as const, src: `/data/${folder}/media/${file}` };
                } else if (file.endsWith('.txt')) {
                    const videoId = await fs.readFile(filePath, 'utf-8');
                    return { type: 'video' as const, src: videoId.trim() };
                }
            }
            return null;
        }));

        return {
            id: folder,
            title: titleContent.trim(),
            image: imagePath,
            description: descriptionContent,
            languages: languagesContent.split('\n').map(lang => lang.trim()).filter(Boolean),
            links: JSON.parse(linksContent),
            media: media.filter((item): item is Media => item !== null),
        };
    }));

    return projects;
}