import React, { useMemo } from 'react';
import CommonplaceFrame from './CommonplaceFrame';
import type { DockVariantProps } from './variantProps';
import { generateTornPolygon } from './tornPaperShape';
import './tornPage.css';

// Torn page — a single ripped scrap of paper that stays the SAME
// shape across every quote. One polygon is generated per session
// (random seed on mount), so every page load gets its own unique
// silhouette, but within a session the paper identity is
// constant — the torn edges don't rearrange between quotes.
//
// Why static, not per-quote:
//   An earlier iteration morphed the clip-path between quotes so
//   each quote got its own tear shape. It read as competing
//   motion against the quote-text crossfade (paper shape changing
//   BEFORE the text finished fading), and pulled attention off
//   the quote itself. The commonplace-book metaphor is also more
//   honest with a fixed page: same paper, different ink.
//
// Keyboard nav (arrow keys) + auto-advance cycle the quotes; the
// body text crossfades via Framer Motion (see QUOTE_BODY_MOTION at
// the top of CommonplaceFrame.tsx). The plate itself is visually
// fixed: one shape, one rotation, one cream gradient.

const TornPageDock: React.FC<DockVariantProps> = (props) => {
  // One polygon for the whole session. Empty dep array so useMemo
  // runs exactly once — the seed is frozen on first render and
  // the shape never regenerates. Random Math seed so different
  // page loads get different silhouettes; within a single session
  // the paper is consistent.
  const tornPolygon = useMemo(
    () => generateTornPolygon(Math.floor(Math.random() * 100000)),
    [],
  );

  // Memoize the style object too. Without this, every parent render
  // produces a fresh `{ '--plate-clip-torn': ... }` reference, and
  // React re-applies the inline style on the plate even though the
  // value is identical. That's usually a no-op, but style prop
  // churn has been known to interrupt in-flight CSS transitions on
  // the same element in edge cases — the more/less height animation
  // is one of them.
  const plateStyleVars = useMemo(
    () => ({
      ['--plate-clip-torn' as string]: tornPolygon,
    }),
    [tornPolygon],
  );

  return (
    <CommonplaceFrame
      {...props}
      outerClassName="bookshelf-dock-torn-page"
      plateClassName="bookshelf-dock-torn-page-plate"
      plateWrapperClassName="bookshelf-dock-torn-page-plate-wrap"
      plateRotation={-1.4}
      plateStyleVars={plateStyleVars}
    />
  );
};

export default TornPageDock;
