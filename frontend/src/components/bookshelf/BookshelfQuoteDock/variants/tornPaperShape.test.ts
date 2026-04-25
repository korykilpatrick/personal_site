import {
  DEFAULT_TORN_CONFIG,
  generateTornPolygon,
} from './tornPaperShape';

describe('generateTornPolygon', () => {
  it('is deterministic for the same seed', () => {
    const a = generateTornPolygon(42);
    const b = generateTornPolygon(42);
    expect(a).toBe(b);
  });

  it('produces different polygons for different seeds', () => {
    const a = generateTornPolygon(1);
    const b = generateTornPolygon(2);
    expect(a).not.toBe(b);
  });

  it('adjacent seeds do not yield visually-similar outputs', () => {
    // The prime-multiplier spread in seededRandom should de-correlate
    // neighbors. Comparing the first couple of coordinate strings is
    // enough to catch adjacency-bleed.
    const a = generateTornPolygon(10);
    const b = generateTornPolygon(11);
    const extract = (polygon: string) =>
      polygon
        .match(/(\d+\.\d+)% (\d+\.\d+)%/g)
        ?.slice(0, 4)
        .join(',') ?? '';
    expect(extract(a)).not.toBe(extract(b));
  });

  it('returns a well-formed polygon() expression', () => {
    const result = generateTornPolygon(7);
    expect(result).toMatch(/^polygon\(/);
    expect(result).toMatch(/\)$/);
    const coords = result.match(/\d+\.\d+% \d+\.\d+%/g) ?? [];
    // Top + right + bottom + left (minus duplicate corners):
    // (topPoints + 1) + rightPoints + bottomPoints + (leftPoints - 1)
    // = 15 + 8 + 14 + 7 = 44
    const expected =
      DEFAULT_TORN_CONFIG.topPoints +
      1 +
      DEFAULT_TORN_CONFIG.rightPoints +
      DEFAULT_TORN_CONFIG.bottomPoints +
      (DEFAULT_TORN_CONFIG.leftPoints - 1);
    expect(coords).toHaveLength(expected);
  });

  it('keeps every point inside the [0, 100] box', () => {
    const result = generateTornPolygon(1234);
    const pairs = [...result.matchAll(/(\d+\.\d+)% (\d+\.\d+)%/g)];
    for (const [, xs, ys] of pairs) {
      const x = parseFloat(xs);
      const y = parseFloat(ys);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });

  it('respects the configured tear depth caps', () => {
    const verticalTearPct = 6;
    const horizontalTearPct = 3;
    const result = generateTornPolygon(99, { verticalTearPct, horizontalTearPct });
    const pairs = [...result.matchAll(/(\d+\.\d+)% (\d+\.\d+)%/g)];
    for (const [, xs, ys] of pairs) {
      const x = parseFloat(xs);
      const y = parseFloat(ys);
      // Top points: y in [0, verticalTearPct]
      // Bottom points: y in [100 - verticalTearPct, 100]
      // Left points: x in [0, horizontalTearPct]
      // Right points: x in [100 - horizontalTearPct, 100]
      // Every point must satisfy one of these four — which simplifies
      // to: x or y is within the tear band on at least one edge.
      const onTop = y <= verticalTearPct + 0.001;
      const onBottom = y >= 100 - verticalTearPct - 0.001;
      const onLeft = x <= horizontalTearPct + 0.001;
      const onRight = x >= 100 - horizontalTearPct - 0.001;
      expect(onTop || onBottom || onLeft || onRight).toBe(true);
    }
  });

  it('tapers the top-right corner tear so the dog-ear has intact paper', () => {
    // The corner-taper contract: tear depth near the top-right corner
    // is multiplied by a ramp from `minMult` (at the corner itself)
    // back to 1.0 over `taperPoints` steps along each incoming edge.
    // Verify across many seeds that every tapered point respects its
    // per-step cap.
    const vPct = DEFAULT_TORN_CONFIG.verticalTearPct;
    const hPct = DEFAULT_TORN_CONFIG.horizontalTearPct;
    const minMult = DEFAULT_TORN_CONFIG.topRightCornerMinMultiplier;
    const span = DEFAULT_TORN_CONFIG.topRightCornerTaperPoints;
    const taperMult = (distance: number): number =>
      distance >= span ? 1 : minMult + (1 - minMult) * (distance / span);
    // 0.001 fuzz for floating-point rounding in the toFixed(2) stage.
    const EPS = 0.001;

    for (let seed = 1; seed <= 200; seed++) {
      const result = generateTornPolygon(seed);
      const pairs = [...result.matchAll(/(\d+\.\d+)% (\d+\.\d+)%/g)].map(
        ([, xs, ys]) => [parseFloat(xs), parseFloat(ys)] as const,
      );

      // Last `span+1` top-edge points (including the corner) — their
      // y (tear depth from the top) must respect the tapered cap.
      for (let d = 0; d <= span; d++) {
        const idx = DEFAULT_TORN_CONFIG.topPoints - d;
        const [, y] = pairs[idx];
        expect(y).toBeLessThanOrEqual(vPct * taperMult(d) + EPS);
      }

      // The corner point itself must be exactly x=100% with the
      // tightest cap on y.
      const [cornerX, cornerY] = pairs[DEFAULT_TORN_CONFIG.topPoints];
      expect(cornerX).toBe(100);
      expect(cornerY).toBeLessThanOrEqual(vPct * minMult + EPS);

      // First `span` right-edge points (i=1..span) — their x inset
      // from the right must respect the tapered cap.
      for (let i = 1; i <= span; i++) {
        const idx = DEFAULT_TORN_CONFIG.topPoints + i; // right edge starts at topPoints+1
        const [x] = pairs[idx];
        expect(100 - x).toBeLessThanOrEqual(hPct * taperMult(i) + EPS);
      }
    }
  });

  it('tear distribution is biased toward shallow tears', () => {
    // With u*u distribution on a large point count, the mean should
    // sit at ~maxPct/3 (integral of u*u from 0 to 1 = 1/3), so
    // comfortably less than half of maxPct. Sanity check that the
    // distribution is not uniform.
    const result = generateTornPolygon(555, {
      verticalTearPct: 10,
      horizontalTearPct: 10,
    });
    const pairs = [...result.matchAll(/(\d+\.\d+)% (\d+\.\d+)%/g)];
    // Top-edge points have y in [0, 10]. Collect those and check mean.
    const topYs = pairs
      .map(([, , y]) => parseFloat(y))
      .filter((y) => y < 10);
    const mean = topYs.reduce((a, b) => a + b, 0) / topYs.length;
    // Mean should be close to 10/3 ≈ 3.33, with room for sample noise.
    expect(mean).toBeLessThan(5);
  });
});
