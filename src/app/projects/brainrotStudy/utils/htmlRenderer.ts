import { ContentRenderer, isValidUrl } from './renderer';
import { createElement } from 'react';

export class HtmlRenderer implements ContentRenderer {
  canRender(content: File | string): boolean {
    if (typeof content === 'string') {
      return isValidUrl(content) && !content.includes('youtube.com') && !content.includes('youtu.be');
    }
    return false;
  }

  async render(content: File | string): Promise<React.ReactElement> {
    if (typeof content !== 'string') {
      throw new Error('HTML renderer only supports URLs');
    }

    return createElement('iframe', {
      src: content,
      style: {
        width: '100%',
        height: '100%',
        border: 'none'
      },
      sandbox: 'allow-same-origin allow-scripts'
    });
  }
}
