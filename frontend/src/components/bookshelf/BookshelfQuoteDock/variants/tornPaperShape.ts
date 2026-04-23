// Deterministic per-quote torn-paper polygon generator for the
// Torn page commonplace variant. Produces a CSS `polygon(...)`
// clip-path with randomized bites on all four edges.
//
// Design choices, documented:
//   - Seeded via a linear congruential generator so the same quote
//     always renders with the same tear (no shimmer on rerender),
//     but every quote gets a visibly distinct slip.
//   - Tear depth follows a quadratic distribution (u * u * maxPct)
//     which biases toward shallower tears with occasional deeper
//     bites. Real torn paper has mostly-intact stretches punctuated
//     by the places where fibers gave way.
//   - Point counts are FIXED (same for every seed) so the polygon
//     always has the same cardinality — important if we ever want
//     to CSS-transition between two tears.
//   - Percentages only, so the polygon scales with the plate's
//     border-box at any plate size.
//   - Corners emerge naturally from the last top-edge point meeting
//     the first right-edge point, etc. The kinks look correctly
//     organic — real torn paper doesn't have clean 90° corners.

export interface TornPaperConfig {
  // Maximum tear depth on the top & bottom edges as a % of plate height.
  verticalTearPct: number;
  // Maximum tear depth on the left & right edges as a % of plate width.
  horizontalTearPct: number;
  topPoints: number;
  rightPoints: number;
  bottomPoints: number;
  leftPoints: number;
  // Taper the tear depth as we approach the top-right corner so a
  // close-affordance pinned near that corner (the dog-ear) sits on
  // intact-ish paper rather than floating over a gap where fibers
  // were torn deeply inward. The top-right corner is special because
  // the dismiss button lives there — other corners remain fully torn.
  // The multiplier ramps from `topRightCornerMinMultiplier` at the
  // corner itself back up to 1.0 over `topRightCornerTaperPoints`
  // points along each incoming edge.
  topRightCornerTaperPoints: number;
  topRightCornerMinMultiplier: number;
}

export const DEFAULT_TORN_CONFIG: TornPaperConfig = {
  verticalTearPct: 8,
  horizontalTearPct: 3.5,
  topPoints: 14,
  rightPoints: 8,
  bottomPoints: 14,
  leftPoints: 8,
  // At the corner itself, tears are capped at 18% of their normal
  // max depth; three points in either direction, depth is back to
  // full. Enough intact paper to host the fold-close mark without
  // losing the "torn on all four sides" reading — the tear is still
  // there, just shallower where it meets the corner.
  topRightCornerTaperPoints: 3,
  topRightCornerMinMultiplier: 0.18,
};

// Simple seeded LCG. Not cryptographic — we just need deterministic
// reproducibility from a small integer seed.
function seededRandom(seed: number): () => number {
  // A prime multiplier on the seed helps spread neighboring seeds
  // (adjacent currentIndex values) into visibly different sequences.
  let state = (seed * 2654435761) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function generateTornPolygon(
  seed: number,
  config: Partial<TornPaperConfig> = {},
): string {
  const cfg = { ...DEFAULT_TORN_CONFIG, ...config };
  const rand = seededRandom(seed);

  // Quadratic distribution: most points shallow, occasional deep tears.
  const tearDepth = (maxPct: number): number => {
    const u = rand();
    return u * u * maxPct;
  };

  // Corner taper multiplier: returns a value in [minMult, 1.0] based
  // on how many points the current index is from the corner. At the
  // corner (distance 0), returns minMult. At or beyond taperPoints,
  // returns 1.0. Linear ramp in between — simple and predictable.
  const cornerTaper = (distanceFromCorner: number): number => {
    const { topRightCornerTaperPoints: span, topRightCornerMinMultiplier: min } = cfg;
    if (distanceFromCorner >= span) return 1;
    if (distanceFromCorner <= 0) return min;
    return min + (1 - min) * (distanceFromCorner / span);
  };

  const points: Array<[number, number]> = [];

  // Top edge (left → right). Y is tear depth from the top. Near the
  // top-right corner (high i), the tear depth is tapered down so the
  // corner remains mostly intact to host the dog-ear close mark.
  for (let i = 0; i <= cfg.topPoints; i++) {
    const x = (i / cfg.topPoints) * 100;
    const taper = cornerTaper(cfg.topPoints - i);
    const y = tearDepth(cfg.verticalTearPct * taper);
    points.push([x, y]);
  }

  // Right edge (top → bottom). X is (100 - tear depth from the right).
  // Start at i=1 because i=0 would duplicate the top edge's last point.
  // Near the top (low i), we're close to the top-right corner, so
  // taper the tear inward to match the top edge's corner treatment.
  for (let i = 1; i <= cfg.rightPoints; i++) {
    const y = (i / cfg.rightPoints) * 100;
    const taper = cornerTaper(i);
    const x = 100 - tearDepth(cfg.horizontalTearPct * taper);
    points.push([x, y]);
  }

  // Bottom edge (right → left). Y is (100 - tear depth from the bottom).
  // Start at (bottomPoints - 1) because the last right-edge point is at
  // y=100, which already "sits on" the bottom edge — don't duplicate it.
  for (let i = cfg.bottomPoints - 1; i >= 0; i--) {
    const x = (i / cfg.bottomPoints) * 100;
    const y = 100 - tearDepth(cfg.verticalTearPct);
    points.push([x, y]);
  }

  // Left edge (bottom → top). X is tear depth from the left.
  // Start at (leftPoints - 1) and stop at i=1 because i=0 would
  // duplicate the starting top-left point.
  for (let i = cfg.leftPoints - 1; i > 0; i--) {
    const y = (i / cfg.leftPoints) * 100;
    const x = tearDepth(cfg.horizontalTearPct);
    points.push([x, y]);
  }

  const formatted = points
    .map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`)
    .join(', ');
  return `polygon(${formatted})`;
}
