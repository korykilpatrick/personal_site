import React from 'react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import type { Quote } from 'types';
import type { MutableRefObject } from 'react';
import { COLLAPSE_LABEL, EXPAND_LABEL } from './quoteDock.constants';

interface QuoteDockContentProps {
  currentIndex: number;
  currentQuote: Quote;
  isExpanded: boolean;
  isDesktopPreview: boolean;
  previewText: string;
  previewMinHeight: number;
  canExpand: boolean;
  expandedBodyRef: MutableRefObject<HTMLDivElement | null>;
  onExpand: () => void;
  onCollapse: () => void;
}

// No Framer Motion on the expand/collapse swap. The swap itself is
// instant (preview ↔ full text); the visible "unfolding" is the
// plate's `transition: height` animating between the collapsed
// baseline and the JS-measured expanded height (see
// CommonplaceFrame.tsx). Adding an inner crossfade with mode="wait"
// creates a dead zone where no text is visible, which reads as lag.
// `isDesktopPreview` is no longer destructured — the expanded body
// used to pick between desktop/mobile maxHeight strings, but the
// plate now owns sizing so that branch is gone.
const QuoteDockContent: React.FC<QuoteDockContentProps> = ({
  currentIndex,
  currentQuote,
  isExpanded,
  previewText,
  previewMinHeight,
  canExpand,
  expandedBodyRef,
  onExpand,
  onCollapse,
}) => (
  <div className="mx-auto min-w-0 max-w-[44rem] px-10 sm:px-14">
    {isExpanded ? (
      /* Expanded body renders at its natural content height — no
         maxHeight, no overflow-y here. The enclosing body-stack is
         the scroll container (see .bookshelf-dock-cp-body-stack in
         commonplaceBase.css), and CommonplaceFrame flex-sizes the
         plate to fit the body's natural height up to a 75vh cap.
         Result: whole quote in view whenever it fits, scrollbar on
         the body-stack only when the quote genuinely exceeds the cap. */
      <div
        ref={expandedBodyRef}
        key={`expanded-${currentIndex}`}
        className="bookshelf-quote-dock__body min-w-0 text-center"
      >
        {/* `forceBlock` is required so single-line quote strings render
            as `<p>` (not `<span>`). The plate-scoped typography rule in
            quoteDock.css targets `.bookshelf-quote-dock__markdown p` —
            without forceBlock, markdown-to-jsx emits a `<span>` for
            bare text and the rule misses, falling back to the wrapper
            div's inherited sans-serif font and wrong color. Caused a
            visible "font changes on more/less" bug. We also drop the
            `text-textSecondary` class from the wrapper — the plate
            rule now owns color; the Tailwind color was only being
            consulted when the <span> fall-through bug was active. */}
        <MarkdownRenderer
          className="bookshelf-quote-dock__markdown"
          forceBlock
        >
          {`"${currentQuote.text}"`}
        </MarkdownRenderer>
      </div>
    ) : (
      <div
        key={`collapsed-${currentIndex}`}
        className="bookshelf-quote-dock__body flex min-w-0 items-center justify-center overflow-hidden text-center"
        style={{ minHeight: `${previewMinHeight}px` }}
      >
        <p className="bookshelf-quote-dock__preview mb-0 max-w-[44rem]">
          <span>{`"${previewText}`}</span>
          {canExpand ? (
            <>
              <span aria-hidden="true">...</span>{' '}
              <button
                type="button"
                onClick={onExpand}
                className="bookshelf-quote-dock__inline-toggle"
              >
                {EXPAND_LABEL}
              </button>
            </>
          ) : (
            <span aria-hidden="true">&rdquo;</span>
          )}
        </p>
      </div>
    )}

    {(currentQuote.author || currentQuote.source || isExpanded) && (
      <p
        key={`meta-${currentIndex}-${isExpanded ? 'expanded' : 'collapsed'}`}
        /* Meta line wraps freely — long titles (e.g. "Pathways to
           Bliss: Mythology and Personal Transformation") used to get
           ellipsed to a single line, which hid the source. Dropping
           the truncation classes lets the meta break onto a second
           line when needed; useDockReservation re-measures and the
           plate grows gracefully. `text-wrap: pretty` yields nicer
           break points than browser default. */
        className="bookshelf-quote-dock__meta mb-0 min-w-0 text-center font-mono text-[0.68rem] tracking-[0.08em] text-textSecondary sm:text-[0.72rem]"
        style={{ textWrap: 'pretty' }}
      >
        {currentQuote.author && <span>{currentQuote.author}</span>}
        {currentQuote.author && currentQuote.source && <span aria-hidden="true"> · </span>}
        {currentQuote.source && <span className="italic text-textTertiary">{currentQuote.source}</span>}
        {isExpanded && (currentQuote.author || currentQuote.source) && (
          <span aria-hidden="true"> · </span>
        )}
        {isExpanded && (
          <button
            type="button"
            onClick={onCollapse}
            className="bookshelf-quote-dock__inline-toggle text-[0.62rem] tracking-[0.18em]"
          >
            {COLLAPSE_LABEL}
          </button>
        )}
      </p>
    )}
  </div>
);

export default QuoteDockContent;
