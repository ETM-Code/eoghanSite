import { ContentRenderer, getFileExtension } from './renderer';
import { createElement } from 'react';

export class AudioRenderer implements ContentRenderer {
  canRender(content: File | string): boolean {
    if (typeof content === 'string') return false;
    const validExtensions = ['mp3', 'wav', 'ogg'];
    return validExtensions.includes(getFileExtension(content));
  }

  async render(content: File | string): Promise<React.ReactElement> {
    if (typeof content !== 'string') {
      const url = URL.createObjectURL(content);
      return createElement('audio', {
        controls: true,
        style: { width: '100%' }
      },
        createElement('source', {
          src: url,
          type: content.type
        }),
        'Your browser does not support the audio element.'
      );
    }
    throw new Error('Audio renderer only supports file uploads');
  }
}
