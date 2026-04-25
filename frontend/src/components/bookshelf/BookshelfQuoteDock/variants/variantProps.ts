import type { FocusEvent, MutableRefObject } from 'react';
import type { Quote } from 'types';

// Shared prop contract for every dock variant. The router (QuoteDock.tsx)
// and the variant components import this so the call-site stays identical
// across variants — swapping variants is a pure-visual change.

export interface DockVariantProps {
  currentIndex: number;
  currentQuote: Quote;
  quotesLength: number;
  isExpanded: boolean;
  isDesktopPreview: boolean;
  dockHeight: number;
  previewText: string;
  previewMinHeight: number;
  canExpand: boolean;
  contentWrapperRef: MutableRefObject<HTMLDivElement | null>;
  expandedBodyRef: MutableRefObject<HTMLDivElement | null>;
  onPrevious: () => void;
  onNext: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onHideDock: () => void;
  onFocusCapture: (event: FocusEvent<HTMLDivElement>) => void;
  onBlurCapture: (event: FocusEvent<HTMLDivElement>) => void;
  previewMeasureRef: MutableRefObject<HTMLParagraphElement | null>;
}
