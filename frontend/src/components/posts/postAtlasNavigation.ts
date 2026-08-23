export type AtlasDirectionKey = 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp';

export interface AtlasNavigationPoint {
  id: string;
  x: number;
  y: number;
}

const DIRECTION_VECTORS: Record<AtlasDirectionKey, { x: number; y: number }> = {
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
};

export const isAtlasDirectionKey = (key: string): key is AtlasDirectionKey =>
  key in DIRECTION_VECTORS;

/** Finds the nearest visually sensible node in an arrow-key direction. */
export function findDirectionalNodeId(
  points: readonly AtlasNavigationPoint[],
  currentId: string,
  directionKey: AtlasDirectionKey,
): string | undefined {
  const current = points.find((point) => point.id === currentId);
  if (!current) return undefined;

  const direction = DIRECTION_VECTORS[directionKey];
  let best: { id: string; score: number } | undefined;

  for (const candidate of points) {
    if (candidate.id === currentId) continue;
    const dx = candidate.x - current.x;
    const dy = candidate.y - current.y;
    const forward = dx * direction.x + dy * direction.y;
    if (forward <= 0) continue;

    const perpendicular = Math.abs(dx * direction.y - dy * direction.x);
    const distance = Math.hypot(dx, dy);
    const score = distance + perpendicular * 2.25;
    if (
      !best ||
      score < best.score - Number.EPSILON ||
      (Math.abs(score - best.score) <= Number.EPSILON && candidate.id < best.id)
    ) {
      best = { id: candidate.id, score };
    }
  }

  return best?.id;
}
