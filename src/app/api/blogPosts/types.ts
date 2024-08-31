export interface BlogPost {
    id: string;
    title: string;
    date: string;
    content: string;
    thumbnail: string | null;
    tags: string[];
    images: string[];
  }
  
  export interface RecentBlogPost {
    id: string;
    title: string;
    date: string;
    preview: string;
    thumbnail: string | null;
  }