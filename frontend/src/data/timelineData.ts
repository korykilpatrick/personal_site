import { TimelineItem } from '@/types/timeline';

/**
 * Timeline entries — ordered chronologically.
 * Dates use "YYYY-MM" format for month precision.
 *
 * Replace placeholder content with real entries.
 */
const timelineData: TimelineItem[] = [
  {
    id: 'poker',
    type: 'career',
    startDate: '2008-01',
    endDate: '2017-12',
    label: 'Poker',
    summary:
      'Professional poker player. Won a World Series of Poker championship bracelet.',
    narrative:
      'Spent years making decisions under uncertainty for a living. The through-line to everything since — risk calibration, pattern recognition, reading situations, staying composed when the stakes are real.',
    accent: 'crimson',
    links: [],
    order: 1,
    featured: true,
  },
  {
    id: 'cfar',
    type: 'inflection',
    startDate: '2015-06',
    label: 'CFAR',
    summary:
      'Attended the Centre for Applied Rationality workshop. Catalyzed a shift toward AI and software.',
    narrative:
      'A turning point. The workshop reframed how I thought about thinking itself — and made AI something I needed to focus on, not just follow.',
    accent: 'violet',
    order: 2,
  },
  {
    id: 'fintech',
    type: 'career',
    startDate: '2018-01',
    endDate: '2023-12',
    label: 'Fintech',
    summary:
      'Built and automated a fintech platform. Designed the system end-to-end and sold software.',
    narrative:
      'Three years of hands-on engineering — designing, building, and automating a platform from scratch. Also sold software to EstablishTheRun during this period.',
    accent: 'cobalt',
    order: 3,
  },
  {
    id: 'twilio',
    type: 'career',
    startDate: '2024-01',
    endDate: '2024-04',
    label: 'Twilio',
    summary: 'Staff Product Manager at Twilio.',
    narrative: 'Product leadership at scale.',
    accent: 'slate',
    order: 4,
  },
  {
    id: 'gauntlet',
    type: 'accomplishment',
    startDate: '2025-01',
    endDate: '2025-03',
    label: 'Gauntlet AI',
    summary:
      'Completed the Gauntlet AI program — an intensive AI engineering cohort.',
    narrative:
      'Three months of deep, focused AI engineering work.',
    accent: 'amber',
    links: [],
    order: 5,
  },
  {
    id: 'consulting',
    type: 'career',
    startDate: '2025-04',
    ongoing: true,
    label: 'AI Consulting',
    summary:
      'Independent AI product consulting. Working with founders and operators on judgment, product, and systems.',
    narrative:
      'Working with founders, operators, and small teams who want to use AI with better judgment, stronger product instincts, and less noise.',
    accent: 'emerald',
    links: [
      {
        label: 'Five Hour Consulting',
        url: 'https://www.5hc.ai/l/kory-kilpatrick/6930b6b6-baa7-419a-a441-eac0a7225a6e',
      },
    ],
    order: 6,
    featured: true,
  },
];

export default timelineData;
