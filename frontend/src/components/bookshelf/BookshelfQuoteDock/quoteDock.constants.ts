export const BASE_PREVIEW_MOBILE_CHAR_LIMIT = 200;
export const BASE_PREVIEW_DESKTOP_CHAR_LIMIT = 360;
export const BASE_PREVIEW_MOBILE_LINES = 4;
export const BASE_PREVIEW_DESKTOP_LINES = 5;
// Quotes rotate at a library cadence — long enough that the reader finishes
// the line, sits with it, and notices the change as a page turning, not a
// slide swapping. Short quotes hold at the min; long ones hold at the max.
export const AUTO_ADVANCE_MIN_MS = 18000;
export const AUTO_ADVANCE_MAX_MS = 26000;
export const POINTER_PAUSE_MS = 1500;
export const INITIAL_DOCK_HEIGHT = 112;
export const HIDDEN_DOCK_HEIGHT = 52;
export const FALLBACK_PREVIEW_MIN_HEIGHT = 48;
export const DESKTOP_EXPANDED_BODY_MAX_HEIGHT = 'min(45vh, 24rem)';
export const MOBILE_EXPANDED_BODY_MAX_HEIGHT =
  'calc(50vh - 5rem - env(safe-area-inset-bottom))';
export const EXPAND_LABEL = 'more';
export const COLLAPSE_LABEL = 'less';
export const BOOKSHELF_DOCK_HEIGHT_CSS_VARIABLE = '--bookshelf-quote-dock-height';
