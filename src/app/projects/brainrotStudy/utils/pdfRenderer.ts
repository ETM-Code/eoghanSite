import { ContentRenderer, getFileExtension, isValidUrl } from './renderer';
import { createElement } from 'react';

export class PdfRenderer implements ContentRenderer {
  canRender(content: File | string): boolean {
    if (typeof content === 'string') {
      return isValidUrl(content) && content.toLowerCase().endsWith('.pdf');
    }
    return getFileExtension(content) === 'pdf';
  }

  async render(content: File | string): Promise<React.ReactElement> {
    const url = typeof content === 'string' ? content : URL.createObjectURL(content);
    
    return createElement('iframe', {
      src: url,
      style: {
        width: '100%',
        height: '100%',
        border: 'none'
      }
    });
  }
}
