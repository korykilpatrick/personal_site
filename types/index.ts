/**
 * Frontend/back shared types
 *
 * This file serves as the central repository for all shared types in the application.
 * All components should import types from here rather than defining their own duplicate types.
 */

// Application configuration
export interface AppConfig {
  apiBaseUrl: string;
}

// Authentication
export interface User {
  username: string;
}

/**
 * Base model interface that all models will extend
 */
export interface BaseRecord {
  id: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/**
 * Book model
 */
export interface Book extends BaseRecord {
  goodreads_id: number;
  img_url: string | null;
  img_url_small: string | null;
  title: string;
  book_link: string | null;
  author: string;
  author_link: string | null;
  num_pages: number | null;
  avg_rating: number | null;
  num_ratings: number | null;
  date_pub: string | null;
  rating: number | null;
  blurb: string | null;
  date_added: string | null;
  date_started: string | null;
  date_read: string | null;
}

export interface BookWithShelves extends Book {
  shelves: BookshelfSummary[];
}

export interface Bookshelf extends BaseRecord {
  name: string;
}

export interface BookshelfSummary {
  id: number;
  name: string;
}

export interface BookshelfWithBooks extends Bookshelf {
  books: Book[];
}

/**
 * Link icon type used across the application
 */
export type LinkIconName = 'github' | 'linkedin' | 'twitter' | 'youtube' | 'website' | 'other' | string | undefined;

/**
 * Project related types
 */
export interface ProjectLink {
  title: string;
  url: string;
  icon?: LinkIconName;
}

export interface Project extends BaseRecord {
  title: string;
  description: string;
  media_urls: string[];
  links: ProjectLink[];
  writeup?: string;
  tags?: string[];
}

export interface MediaEntry {
  type: 'image' | 'video' | '';
  url: string;
}

/**
 * Work entry related types
 */
export interface WorkEntryLink {
  title: string;
  url: string;
  icon?: LinkIconName;
}

export interface WorkEntry extends BaseRecord {
  company: string;
  role: string;
  duration: string;
  achievements: string;
  links?: WorkEntryLink[];
}

/**
 * SiteNote model
 */
export interface SiteNote extends BaseRecord {
  content: string;
  is_active: boolean;
}

/**
 * Quote model
 */
export interface Quote extends BaseRecord {
  text: string;
  author?: string;
  source?: string;
  display_order?: number;
  is_active: boolean;
}

/**
 * LibraryItem model
 */
export interface LibraryItem extends BaseRecord {
  item_type_id: number;
  link: string;
  title: string;
  blurb?: string | null;
  thumbnail_url?: string | null;
  tags?: string[];
  creators?: string[];
  type_name?: string; // name from joined library_item_types, optional
}

/**
 * API response with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export type SortOption = {
  label: string;
  value: string;
};