export type TimelineItemType = 'career' | 'inflection' | 'accomplishment' | 'project';
export type TimelineAccent =
  | 'crimson'
  | 'cobalt'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'slate';

export interface MediaItem {
  type: 'image' | 'link' | 'embed';
  url: string;
  alt?: string;
  caption?: string;
  embedType?: 'youtube' | 'podcast' | 'tweet';
}

export interface TimelineLink {
  label: string;
  url: string;
}

export interface TimelineItem {
  id: string;
  type: TimelineItemType;

  /** Month precision: "YYYY-MM" (e.g. "2025-01") */
  startDate: string;
  /** Month precision: "YYYY-MM". Omit for point-in-time events. */
  endDate?: string;
  /** True if this is a current/ongoing activity */
  ongoing?: boolean;

  /** Short label rendered directly on the timeline */
  label: string;
  /** Optional subtitle — auto-generated from dates if omitted */
  sublabel?: string;
  /** Used for the segment hover state and supporting copy */
  summary: string;
  /** Expanded narrative, supports markdown */
  narrative?: string;

  /** Accent color used for the rendered segment */
  accent?: TimelineAccent;
  /** Rich media for the expanded view */
  media?: MediaItem[];
  /** External links shown as chips in the expanded view */
  links?: TimelineLink[];

  /** Explicit sort order (lower = earlier on timeline) */
  order: number;
  /** Visual emphasis for the detail panel / initial selection */
  featured?: boolean;
}
