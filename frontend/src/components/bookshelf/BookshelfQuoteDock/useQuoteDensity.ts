// Quote density classification. Returns a qualitative "size" bucket for a
// quote's plain text, used by variants to pick density-appropriate
// treatments (ghost opacity, plate width, halo tightness, etc.).
//
// Thresholds are empirical — short one-liners (<80 chars) can afford
// light treatments (minimal plate, bigger ghost); standard quotes
// (80-240 chars) are the baseline; dense passages (240+ chars) need
// the strongest plate and the quietest background.

export type QuoteDensity = 'light' | 'medium' | 'dense';

const LIGHT_MAX_CHARS = 80;
const MEDIUM_MAX_CHARS = 240;

export function classifyQuoteDensity(text: string): QuoteDensity {
  const length = text?.length ?? 0;
  if (length < LIGHT_MAX_CHARS) {
    return 'light';
  }
  if (length < MEDIUM_MAX_CHARS) {
    return 'medium';
  }
  return 'dense';
}

export default function useQuoteDensity(text: string): QuoteDensity {
  // Pure function of text length — no state needed. Kept as a hook to
  // match the conventions of the other useX helpers in this module.
  return classifyQuoteDensity(text);
}
