import React, { useMemo } from 'react';
import CommonplaceFrame from './CommonplaceFrame';
import type { DockVariantProps } from './variantProps';
import { generateTornPolygon } from './tornPaperShape';
import './tornPage.css';

// Torn page — ripped from a pocket notebook, torn on all four
// edges with unpredictable geometry per quote. Paired with gesture
// navigation (drag left/right → nav, flick down → dismiss) handled
// in CommonplaceFrame. No chevrons, no close button — the paper
// itself IS the control surface.
//
// Two polygons per quote (same seed, different tear config):
//   - `cleanPolygon`: 0% tear, rectangle on the border-box.
//   - `tornPolygon`:  8% vertical / 3.5% horizontal tear defaults.
// CSS interpolates clip-path between them for a smooth tear-in
// animation on quote change (see tornPage.css).
const TornPageDock: React.FC<DockVariantProps> = (props) => {
  const { cleanPolygon, tornPolygon } = useMemo(() => {
    const seed = props.currentIndex * 9176 + 31;
    return {
      cleanPolygon: generateTornPolygon(seed, {
        verticalTearPct: 0,
        horizontalTearPct: 0,
      }),
      tornPolygon: generateTornPolygon(seed),
    };
  }, [props.currentIndex]);

  return (
    <CommonplaceFrame
      {...props}
      outerClassName="bookshelf-dock-torn-page"
      plateClassName="bookshelf-dock-torn-page-plate"
      plateWrapperClassName="bookshelf-dock-torn-page-plate-wrap"
      plateRotation={-1.4}
      plateStyleVars={{
        ['--plate-clip-clean' as string]: cleanPolygon,
        ['--plate-clip-torn' as string]: tornPolygon,
      }}
    />
  );
};

export default TornPageDock;
