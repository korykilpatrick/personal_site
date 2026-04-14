import type { TimelineAccent } from '@/types/timeline';

export type AccentStyles = {
  border: string;
  text: string;
  mutedText: string;
  background: string;
  activeBackground: string;
  shadow: string;
  glow: string;
  surface: string;
};

const ACCENT_STYLES: Record<TimelineAccent, AccentStyles> = {
  crimson: {
    border: 'rgba(154, 47, 47, 0.42)',
    text: '#782828',
    mutedText: '#914040',
    background:
      'linear-gradient(135deg, rgba(213, 88, 88, 0.92), rgba(167, 46, 52, 0.94))',
    activeBackground:
      'linear-gradient(135deg, rgba(176, 48, 56, 0.98), rgba(132, 31, 36, 1))',
    shadow: '0 12px 24px rgba(140, 42, 49, 0.16)',
    glow: '0 16px 32px rgba(154, 47, 47, 0.24)',
    surface: 'rgba(213, 88, 88, 0.1)',
  },
  cobalt: {
    border: 'rgba(49, 91, 156, 0.34)',
    text: '#1f4c86',
    mutedText: '#39608f',
    background:
      'linear-gradient(135deg, rgba(96, 146, 222, 0.94), rgba(47, 96, 170, 0.94))',
    activeBackground:
      'linear-gradient(135deg, rgba(45, 99, 175, 0.98), rgba(24, 63, 124, 1))',
    shadow: '0 12px 24px rgba(47, 96, 170, 0.16)',
    glow: '0 16px 32px rgba(47, 96, 170, 0.24)',
    surface: 'rgba(96, 146, 222, 0.1)',
  },
  violet: {
    border: 'rgba(98, 73, 171, 0.34)',
    text: '#5b4696',
    mutedText: '#725ea8',
    background:
      'linear-gradient(135deg, rgba(158, 128, 230, 0.92), rgba(99, 73, 171, 0.94))',
    activeBackground:
      'linear-gradient(135deg, rgba(109, 79, 189, 0.98), rgba(73, 51, 132, 1))',
    shadow: '0 12px 24px rgba(98, 73, 171, 0.16)',
    glow: '0 16px 32px rgba(98, 73, 171, 0.24)',
    surface: 'rgba(158, 128, 230, 0.1)',
  },
  emerald: {
    border: 'rgba(31, 120, 98, 0.34)',
    text: '#206d5b',
    mutedText: '#3b7e70',
    background:
      'linear-gradient(135deg, rgba(88, 194, 157, 0.94), rgba(31, 120, 98, 0.94))',
    activeBackground:
      'linear-gradient(135deg, rgba(27, 112, 91, 0.98), rgba(18, 77, 63, 1))',
    shadow: '0 12px 24px rgba(31, 120, 98, 0.16)',
    glow: '0 16px 32px rgba(31, 120, 98, 0.24)',
    surface: 'rgba(88, 194, 157, 0.1)',
  },
  amber: {
    border: 'rgba(168, 118, 32, 0.34)',
    text: '#8b5d12',
    mutedText: '#9b701f',
    background:
      'linear-gradient(135deg, rgba(241, 193, 84, 0.94), rgba(196, 135, 21, 0.94))',
    activeBackground:
      'linear-gradient(135deg, rgba(196, 135, 21, 0.98), rgba(142, 96, 13, 1))',
    shadow: '0 12px 24px rgba(196, 135, 21, 0.16)',
    glow: '0 16px 32px rgba(196, 135, 21, 0.24)',
    surface: 'rgba(241, 193, 84, 0.12)',
  },
  slate: {
    border: 'rgba(80, 99, 122, 0.32)',
    text: '#405065',
    mutedText: '#5f6d7e',
    background:
      'linear-gradient(135deg, rgba(152, 169, 188, 0.94), rgba(88, 105, 127, 0.96))',
    activeBackground:
      'linear-gradient(135deg, rgba(80, 99, 122, 0.98), rgba(44, 56, 73, 1))',
    shadow: '0 12px 24px rgba(80, 99, 122, 0.14)',
    glow: '0 16px 32px rgba(80, 99, 122, 0.2)',
    surface: 'rgba(152, 169, 188, 0.12)',
  },
};

export function getAccentStyles(accent?: TimelineAccent): AccentStyles {
  return ACCENT_STYLES[accent || 'slate'];
}
