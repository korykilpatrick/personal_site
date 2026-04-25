import React from 'react';
import type { DockVariantProps } from './variants/variantProps';
import TornPageDock from './variants/TornPageDock';

// Single-variant thin wrapper. The Torn page commonplace variant
// is the dock. Other variants were prototyped and discarded —
// the structural paradigm (a bounded paper slip overlaying the
// shelf, with a previous-quote ghost echo behind) is carried by
// `CommonplaceFrame`; the physical character is in TornPage.
const QuoteDock: React.FC<DockVariantProps> = (props) => (
  <TornPageDock {...props} />
);

export default QuoteDock;
