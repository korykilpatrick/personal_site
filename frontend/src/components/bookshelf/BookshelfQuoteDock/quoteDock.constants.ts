// Preview sizing — tuned so the truncated text fits comfortably in
// the fixed-height plate (see .bookshelf-dock-cp-plate in
// commonplaceBase.css: 11rem mobile / 12rem desktop). At the paper's
// 34rem max-width, about 42 chars fit per line, so 150 desktop chars
// maps to roughly 3-4 wrapped lines — which sits well in the ~8rem
// content area after subtracting padding and meta. Earlier limits
// (230+) silently produced 5-6 wrapped lines that clipped under
// overflow. Shorter previews also read better at the "scrap of
// paper" scale.
export const BASE_PREVIEW_MOBILE_CHAR_LIMIT = 95;
export const BASE_PREVIEW_DESKTOP_CHAR_LIMIT = 150;
export const BASE_PREVIEW_MOBILE_LINES = 3;
export const BASE_PREVIEW_DESKTOP_LINES = 4;
// Quotes rotate at a library cadence — long enough that the reader finishes
// the line, sits with it, and notices the change as a page turning, not a
// slide swapping. Short quotes hold at the min; long ones hold at the max.
export const AUTO_ADVANCE_MIN_MS = 18000;
export const AUTO_ADVANCE_MAX_MS = 26000;
export const POINTER_PAUSE_MS = 1500;
export const INITIAL_DOCK_HEIGHT = 112;
export const HIDDEN_DOCK_HEIGHT = 52;
export const FALLBACK_PREVIEW_MIN_HEIGHT = 48;
// Legacy body max-height constants removed. Sizing is now driven
// by CommonplaceFrame measuring the body-stack's scrollHeight on
// expand and setting the plate's `height` inline — the body itself
// renders at natural content height and the body-stack (plate's
// flex child) handles any overflow when the plate's 75vh cap
// kicks in. See CommonplaceFrame's useLayoutEffect and the
// `[data-expanded='true'] .bookshelf-dock-cp-body-stack` rules in
// commonplaceBase.css.
export const EXPAND_LABEL = 'more';
export const COLLAPSE_LABEL = 'less';
export const BOOKSHELF_DOCK_HEIGHT_CSS_VARIABLE = '--bookshelf-quote-dock-height';
