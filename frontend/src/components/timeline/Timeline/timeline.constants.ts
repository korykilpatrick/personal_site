import type { TimelineItem } from '@/types/timeline';

export const EASING = 'cubic-bezier(0.19, 1, 0.22, 1)';
export const LANE_HEIGHT = 80;
export const BAR_HEIGHT = 34;
export const CHART_TOP_PADDING = 22;
export const AXIS_HEIGHT = 56;

export const TYPE_LABELS: Record<TimelineItem['type'], string> = {
  career: 'Career',
  inflection: 'Turning point',
  accomplishment: 'Accomplishment',
  project: 'Project',
};
