import { ContentRenderer, getFileExtension, getYoutubeVideoId, isValidUrl } from './renderer';
import { createElement } from 'react';

export class VideoRenderer implements ContentRenderer {
  canRender(content: File | string): boolean {
    if (typeof content === 'string') {
      if (!isValidUrl(content)) return false;
      return content.includes('youtube.com') || content.includes('youtu.be');
    }
    
    const validExtensions = ['mp4', 'webm', 'ogg'];
    return validExtensions.includes(getFileExtension(content));
  }

  async render(content: File | string): Promise<React.ReactElement> {
    if (typeof content === 'string') {
      const videoId = getYoutubeVideoId(content);
      if (!videoId) throw new Error('Invalid YouTube URL');
      
      return createElement('iframe', {
        width: '100%',
        height: '100%',
        src: `https://www.youtube.com/embed/${videoId}`,
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowFullScreen: true
      });
    }

    const url = URL.createObjectURL(content);
    return createElement('video', {
      controls: true,
      style: { width: '100%', height: '100%' }
    }, 
      createElement('source', {
        src: url,
        type: content.type
      }),
      'Your browser does not support the video tag.'
    );
  }
}
