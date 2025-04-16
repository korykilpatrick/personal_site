// src/types/work.ts

export interface WorkEntry {
  id: number;
  company: string;
  role: string;
  duration: string;
  achievements: string;
  work_entry_links?: string; // Stored as text (comma-separated?) in DB
  created_at: string;
  updated_at: string;
}

// Type for data used in forms
export type WorkEntryFormData = Omit<WorkEntry, 'id' | 'created_at' | 'updated_at'>; 