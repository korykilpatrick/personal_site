import React from 'react';

// Re-open affordance for the torn-paper dock. A small torn cream
// slip pinned to the bottom-right corner of the viewport, rotated
// for character and labelled "quotes." Click / Enter pulls the
// dock back up.
//
// Why bottom-right (not center, not below-the-fold):
//   The previous position — tucked into the bottom-center with
//   only its torn top edge peeking above the viewport's bottom —
//   was too clever and too hidden. The user's recall pattern is
//   "look at bottom-right corner for the recently-closed thing,"
//   which is where the prior generic pill button lived. We keep
//   the torn-paper vocabulary but respect the established screen
//   location.
//
// The clip-path is a static torn polygon with all four edges
// jagged. We don't regenerate it per dismissal — this is a small
// persistent fixture, and a consistent silhouette helps recall.

interface TornPaperPeekProps {
  onShowDock: () => void;
}

// Static torn polygon with all four edges jagged. Hand-tuned once
// and kept — the peek is a fixture, not one of the quote-card
// torn polygons (those cycle randomly via tornPaperShape.ts).
const PEEK_CLIP_PATH =
  'polygon(0% 18%, 10% 6%, 20% 15%, 30% 6%, 40% 14%, 50% 4%, 60% 12%, 70% 7%, 80% 14%, 90% 6%, 100% 14%, 94% 30%, 100% 50%, 95% 68%, 100% 82%, 92% 95%, 80% 88%, 65% 96%, 50% 90%, 35% 97%, 20% 88%, 8% 95%, 0% 84%, 6% 70%, 0% 50%, 5% 32%)';

const TornPaperPeek: React.FC<TornPaperPeekProps> = ({ onShowDock }) => (
  <button
    type="button"
    onClick={onShowDock}
    aria-label="Show quote dock"
    className="bookshelf-torn-peek"
  >
    <span className="bookshelf-torn-peek__paper" style={{ clipPath: PEEK_CLIP_PATH }}>
      <span className="bookshelf-torn-peek__label">quotes</span>
    </span>
  </button>
);

export default TornPaperPeek;
