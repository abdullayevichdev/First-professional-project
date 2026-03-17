export interface Notification {
  id: string;
  message: string;
  contentId: string;
  timestamp: string;
  isSeen: boolean;
}

export interface User {
  id: string;
  email?: string;
  name: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  notifications?: Notification[];
  saved_articles?: string[];
  role?: 'admin' | 'user';
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
  is_admin_added?: boolean;
}

export interface ArticleSubmission {
  id: string;
  userId: string;
  userName: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  excerpt_uz: string;
  excerpt_ru: string;
  excerpt_en: string;
  body_uz: string;
  body_ru: string;
  body_en: string;
  category: ContentItem['category'];
  image_url?: string;
  video_url?: string;
  status: 'pending' | 'accepted' | 'rejected';
  admin_feedback?: string;
  created_at: string;
  updated_at: string;
}

export type Language = 'uz' | 'en' | 'ru';
