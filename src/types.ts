export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface ContentItem {
  id: string;
  type: 'article' | 'video' | 'glossary';
  category: 'uzbekistan' | 'global' | 'speech' | 'opinion' | 'historical';
  title_uz: string;
  title_ru: string;
  title_en: string;
  excerpt_uz: string;
  excerpt_ru: string;
  excerpt_en: string;
  body_uz?: string | null;
  body_ru?: string | null;
  body_en?: string | null;
  author: string;
  video_url?: string;
  created_at: string;
  is_preview?: boolean;
}

export type Language = 'uz' | 'en' | 'ru';
