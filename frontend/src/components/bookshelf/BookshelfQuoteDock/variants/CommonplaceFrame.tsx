import React, { useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import QuoteDockContent from '../QuoteDockContent';
import useScrollEcho from '../useScrollEcho';
import useQuoteDensity from '../useQuoteDensity';
import usePreviousQuote from '../usePreviousQuote';
import type { DockVariantProps } from './variantProps';
import './commonplaceBase.css';

// Shared frame for the commonplace paradigm. The paper is the focus
// and holds the only visible on-paper control: a faint × in the
// top-right. Navigation is served by TWO affordances that live
// outside the paper's surface but remain continuous with the
// "commonplace book" metaphor:
//
//   1. Keyboard: ← / → cycles, Esc dismisses.
//   2. Side-peeks: thin torn-paper slivers at the left and right
//      edges of the plate, reading as the torn edges of other
//      pages stacked just behind the current one. Always visible
//      at rest (so they serve as the visual cue that there's more
//      to read); clickable for prev/next. Keep them subtle — they
//      are a hint of depth, not a pair of buttons with labels.
//
// Motion vocabulary (slow, homey, library):
//   - Plate clip-path cycles per quote → paper reshapes as each
//     new tear generates (existing behavior, via tornPaperShape.ts
//     and tornPage.css's `bookshelfTornPaperTearIn`).
//   - Quote body crossfade on new quote → fade + subtle blur, ~640ms
//     eased with the project's slow cubic-bezier(0.19, 1, 0.22, 1).
//     Ink bleeds into paper, rests, fades back into haze.
//   - Expand/collapse crossfade → same vocabulary, within QuoteDockContent.
//   - Dock open/close fade → owned by BookshelfQuoteDock, slow.
//
// No other motion. No drag, no sideways shuffle, no particle
// effects. Everything should feel like turning a page in a well-
// loved library book: measured, quiet, paper-weighted.

const QUOTE_FADE_DURATION = 0.64;
const QUOTE_FADE_EASE = [0.19, 1, 0.22, 1] as const;

function deriveEchoFragment(text: string): string {
  if (!text) return '';
  const words = text
    .replace(/[^\p{L}\p{N}\s'-]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const fragment = words.slice(0, 6).join(' ');
  return fragment || text.slice(0, 28);
}

export interface CommonplaceFrameProps extends DockVariantProps {
  outerClassName: string;
  plateClassName: string;
  plateWrapperClassName?: string;
  plateDecoration?: React.ReactNode;
  plateTrailingDecoration?: React.ReactNode;
  plateRotation?: number;
  plateStyleVars?: React.CSSProperties;
}

const CommonplaceFrame: React.FC<CommonplaceFrameProps> = ({
  currentIndex,
  currentQuote,
  quotesLength,
  isExpanded,
  isDesktopPreview,
  dockHeight,
  previewText,
  previewMinHeight,
  canExpand,
  contentWrapperRef,
  expandedBodyRef,
  onPrevious,
  onNext,
  onExpand,
  onCollapse,
  onHideDock,
  onFocusCapture,
  onBlurCapture,
  previewMeasureRef,
  outerClassName,
  plateClassName,
  plateWrapperClassName,
  plateDecoration,
  plateTrailingDecoration,
  plateRotation = 0,
  plateStyleVars,
}) => {
  const echoRef = useScrollEcho<HTMLDivElement>({ idleDrift: true });
  const density = useQuoteDensity(previewText);
  const previousPreviewText = usePreviousQuote(previewText);

  // Keyboard: ← / → nav, Esc dismiss. Skipped when typing in an
  // input/textarea/contenteditable elsewhere on the page.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target && target.isContentEditable) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      } else if (event.key === 'Escape') {
        onHideDock();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPrevious, onNext, onHideDock]);

  const handleCloseClick = useCallback(() => onHideDock(), [onHideDock]);
  const handlePrevClick = useCallback(() => onPrevious(), [onPrevious]);
  const handleNextClick = useCallback(() => onNext(), [onNext]);

  // Only show the side peeks when there's actually a neighbor to
  // navigate to. With a single quote they'd be pure decoration and
  // imply an interaction that would do nothing.
  const canNavigate = quotesLength > 1;

  const echoSourceText = previousPreviewText ?? previewText;
  const echoFragment = useMemo(
    () => deriveEchoFragment(echoSourceText),
    [echoSourceText],
  );

  return (
    <div
      className={`group/bookshelf-dock bookshelf-dock-cp-outer ${outerClassName}`}
      data-density={density}
      style={{ height: `${dockHeight}px` }}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      {/* Ghost echo — previous quote drifting behind the plate. */}
      <div
        ref={echoRef}
        aria-hidden="true"
        className="bookshelf-dock-cp-echo"
        key={`cp-echo-${echoFragment}`}
      >
        <span className="bookshelf-dock-cp-echo__text">{echoFragment}</span>
      </div>

      <div
        ref={contentWrapperRef}
        className="pointer-events-none relative isolate w-full px-4 py-4 sm:px-6 sm:py-5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div className="relative mx-auto max-w-5xl">
          {/* Plate-frame wrapper holds the paper's rotation — no
              drag, no motion wrapper, no peek siblings. Just paper. */}
          <div
            className={`bookshelf-dock-cp-plate-frame relative mx-auto ${plateWrapperClassName ?? ''}`.trim()}
            style={{ ['--plate-rotation' as string]: `${plateRotation}deg` }}
          >
            <div
              className={`bookshelf-dock-cp-plate ${plateClassName}`}
              key={`cp-plate-${currentIndex}-${isExpanded ? 'expanded' : 'collapsed'}`}
              style={plateStyleVars}
            >
              {/* Subtle close × pinned inside the paper's top-right
                  safe zone. Typographic glyph in the paper's own
                  color family — a quiet walnut ink mark, not a UI
                  icon. The torn polygon's top-right corner is
                  tapered (see tornPaperShape.ts) so this position
                  always sits on intact paper. */}
              <button
                type="button"
                onClick={handleCloseClick}
                aria-label="Hide quote dock"
                className="bookshelf-dock-cp-close"
              >
                <span aria-hidden="true">×</span>
              </button>

              {/* Navigation marks — tiny italic ‹ / › glyphs on the
                  paper's inner left/right margins, vertically
                  centered. Typographic (U+2039 / U+203A single-
                  angle quotes), NOT icons — they're ink marks in
                  the paper's own text register, part of the page
                  rather than UI chrome laid on top of it.
                  Barely-there opacity at rest so the paper reads
                  clean; full walnut on hover/focus so the action
                  is clear when the reader moves toward them. */}
              {canNavigate && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevClick}
                    aria-label="Previous quote"
                    className="bookshelf-dock-cp-navmark bookshelf-dock-cp-navmark--prev"
                  >
                    <span aria-hidden="true">&#8249;</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextClick}
                    aria-label="Next quote"
                    className="bookshelf-dock-cp-navmark bookshelf-dock-cp-navmark--next"
                  >
                    <span aria-hidden="true">&#8250;</span>
                  </button>
                </>
              )}

              {plateDecoration}

              {/* Quote body crossfade — on each new quote, the old
                  body fades out with a subtle blur ("ink haze"),
                  then the new body fades in from a matching haze.
                  Keyed on currentIndex+expansion so the animation
                  only runs when the content actually changes. */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`cp-body-${currentIndex}-${isExpanded ? 'expanded' : 'collapsed'}`}
                  initial={{ opacity: 0, filter: 'blur(2.4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(2.4px)' }}
                  transition={{
                    duration: QUOTE_FADE_DURATION,
                    ease: QUOTE_FADE_EASE,
                  }}
                  className="bookshelf-dock-cp-body-wrap"
                >
                  <QuoteDockContent
                    currentIndex={currentIndex}
                    currentQuote={currentQuote}
                    isExpanded={isExpanded}
                    isDesktopPreview={isDesktopPreview}
                    previewText={previewText}
                    previewMinHeight={previewMinHeight}
                    canExpand={canExpand}
                    expandedBodyRef={expandedBodyRef}
                    onExpand={onExpand}
                    onCollapse={onCollapse}
                  />
                </motion.div>
              </AnimatePresence>

              {plateTrailingDecoration}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden preview-measure element for usePreviewFit. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 invisible"
      >
        <div className="w-full px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-[40rem] px-7 sm:px-10">
              <p
                ref={previewMeasureRef}
                className="bookshelf-quote-dock__preview mx-auto max-w-[44rem] font-serif text-[0.93rem] leading-[1.5] text-center text-primary sm:text-[0.98rem] sm:leading-[1.54]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonplaceFrame;
