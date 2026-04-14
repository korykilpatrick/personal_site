import type { TimelineItem } from '@/types/timeline';
import { buildTimelineMetrics } from './timelineLayout';

const timelineItems: TimelineItem[] = [
  {
    id: 'a',
    type: 'career',
    startDate: '2020-01',
    endDate: '2022-01',
    label: 'Alpha',
    summary: 'Alpha summary',
    order: 1,
  },
  {
    id: 'b',
    type: 'project',
    startDate: '2021-01',
    endDate: '2023-01',
    label: 'Beta',
    summary: 'Beta summary',
    order: 2,
  },
  {
    id: 'c',
    type: 'accomplishment',
    startDate: '2023-01',
    label: 'Gamma',
    summary: 'Gamma summary',
    order: 3,
  },
];

describe('buildTimelineMetrics', () => {
  it('places overlapping items on separate lanes and preserves order output', () => {
    const metrics = buildTimelineMetrics(timelineItems, '2024-01');

    expect(metrics).not.toBeNull();
    expect(metrics?.laneCount).toBe(2);
    expect(metrics?.positioned.map((item) => item.id)).toEqual(['a', 'b', 'c']);
    expect(metrics?.positioned.find((item) => item.id === 'a')?.lane).toBe(0);
    expect(metrics?.positioned.find((item) => item.id === 'b')?.lane).toBe(1);
    expect(metrics?.positioned.find((item) => item.id === 'c')?.isMilestone).toBe(true);
  });
});
