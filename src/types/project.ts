// src/types/project.ts

export interface Project {
  id: number;
  title: string;
  description: string;
  media_urls?: string; // Stored as JSON string in DB based on migration
  project_links?: string; // Stored as text (comma-separated?) in DB
  writeup?: string; 
  project_tags?: string; // Stored as text (comma-separated?) in DB
  created_at: string; // Timestamps received as strings from API
  updated_at: string;
}

// Type for data used in forms (omitting server-generated fields)
export type ProjectFormData = Omit<Project, 'id' | 'created_at' | 'updated_at'>; 