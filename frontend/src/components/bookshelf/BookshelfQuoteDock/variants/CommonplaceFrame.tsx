import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import QuoteDockContent from '../QuoteDockContent';
import useQuoteDensity from '../useQuoteDensity';
import type { DockVariantProps } from './variantProps';
import './commonplaceBase.css';

// Quote-cycle motion — locked in after iteration. Both quotes
// co-render during the transition (sync mode). The old quote fades
// out while gaining heavy blur; the new quote fades in while losing
// heavy blur. At the midpoint both sit at ~0.3 opacity with ~5px
// blur — neither is legible, so the brain reads "paper with a
// smudge" rather than trying to parse two layered texts. Resolves
// into focus over 1.5s with a soft decelerate curve, homey library
// cadence, not enterprise-tech snap.
const QUOTE_BODY_EASE: [number, number, number, number] = [
  0.22, 0.61, 0.36, 1,
];
const QUOTE_BODY_MOTION = {
  initial: { opacity: 0, filter: 'blur(7px)' },
  animate: {
    opacity: [0, 0.3, 1],
    filter: ['blur(7px)', 'blur(5px)', 'blur(0px)'],
    transition: {
      duration: 1.5,
      times: [0, 0.55, 1],
      ease: QUOTE_BODY_EASE,
    },
  },
  exit: {
    opacity: [1, 0.3, 0],
    filter: ['blur(0px)', 'blur(5px)', 'blur(7px)'],
    transition: {
      duration: 1.5,
      times: [0, 0.45, 1],
      ease: QUOTE_BODY_EASE,
    },
  },
};

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

// Plate-height model:
//   - Collapsed: fixed at 11rem (mobile) / 12rem (desktop). A scrap
//     of paper of consistent footprint no matter the preview text.
//   - Expanded: sized to fit the quote body + meta, capped at 75vh
//     of the viewport. If the quote is so long it would exceed the
//     cap, the plate is clamped and the body-stack inside scrolls.
//     This gives "the whole quote in view" when it fits, scrollbar-
//     on-paper fallback only when it genuinely doesn't.
//
// The inline style `height` that drives the plate is JS-controlled
// (see the useLayoutEffect below). CSS contributes only the
// `transition: height 1.6s` rule so expand/collapse glides smoothly
// between the collapsed baseline and the measured expanded height.
// Both values are specific pixel lengths so CSS can interpolate
// them — an earlier attempt used `height: auto` for expanded, which
// can't transition.
const COLLAPSED_HEIGHT_MOBILE_PX = 176; // 11rem at 16px base
const COLLAPSED_HEIGHT_DESKTOP_PX = 192; // 12rem at 16px base
const PLATE_VERTICAL_PADDING_PX = 64; // 2rem top + 2rem bottom
const EXPANDED_VIEWPORT_CAP_RATIO = 0.75;
const FALLBACK_VIEWPORT_HEIGHT_PX = 800;

export interface CommonplaceFrameProps extends DockVariantProps {
  outerClassName: string;
  plateClassName: string;
  plateWrapperClassName?: string;
  plateDecoration?: React.ReactNode;
  plateTrailingDecoration?: React.ReactNode;
  plateRotation?: number;
  plateStyleVars?: React.CSSProperties;
}

// `dockHeight` is deliberately not destructured. It's still computed
// upstream by useDockReservation so the page-reservation CSS var
// stays accurate (surrounding page content leaves room for the dock),
// but the frame no longer applies it to the outer element — the plate
// is the single source of truth for visible size now. Kept in the
// prop contract (DockVariantProps) in case other variants want it.
const CommonplaceFrame: React.FC<CommonplaceFrameProps> = ({
  currentIndex,
  currentQuote,
  quotesLength,
  isExpanded,
  isDesktopPreview,
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
  const density = useQuoteDensity(previewText);

  const plateRef = useRef<HTMLDivElement | null>(null);
  const bodyStackRef = useRef<HTMLDivElement | null>(null);

  // ------- Dynamic plate height (expanded sizing) -------
  //
  // When the user clicks "more", we measure the body-stack's natural
  // content height and resize the plate to fit — capped at 75vh.
  // Most quotes fit entirely, so the whole expanded quote is in view
  // inside the paper. Only extraordinarily long quotes hit the cap,
  // in which case the body-stack scrolls internally (see the CSS in
  // commonplaceBase.css for the `[data-expanded='true']
  // .bookshelf-dock-cp-body-stack` rules).
  //
  // We also re-measure when the quote itself changes while expanded
  // (user clicks ‹/› or auto-advance fires) so the plate adapts to
  // each new quote's length instead of locking in the first one.
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined'
      ? window.innerHeight
      : FALLBACK_VIEWPORT_HEIGHT_PX,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const collapsedPlateHeight = isDesktopPreview
    ? COLLAPSED_HEIGHT_DESKTOP_PX
    : COLLAPSED_HEIGHT_MOBILE_PX;
  const [plateHeightPx, setPlateHeightPx] = useState<number>(
    collapsedPlateHeight,
  );

  useLayoutEffect(() => {
    if (!isExpanded) {
      setPlateHeightPx(collapsedPlateHeight);
      return;
    }
    const stack = bodyStackRef.current;
    if (!stack) return;
    // `scrollHeight` returns the content's full natural height
    // regardless of any overflow clipping on the element itself —
    // exactly what we want so the plate can grow to fit.
    const contentNaturalPx = stack.scrollHeight;
    const desiredPlatePx = contentNaturalPx + PLATE_VERTICAL_PADDING_PX;
    const capPx = Math.floor(viewportHeight * EXPANDED_VIEWPORT_CAP_RATIO);
    // Never go smaller than the collapsed baseline — an
    // always-shorter-when-expanded plate would read as a bug even
    // though it's technically "content-sized."
    const nextHeight = Math.max(
      collapsedPlateHeight,
      Math.min(desiredPlatePx, capPx),
    );
    setPlateHeightPx(nextHeight);
  }, [
    isExpanded,
    currentIndex,
    currentQuote,
    viewportHeight,
    collapsedPlateHeight,
  ]);

  const plateInlineStyle = useMemo<React.CSSProperties>(
    () => ({
      ...plateStyleVars,
      height: `${plateHeightPx}px`,
    }),
    [plateStyleVars, plateHeightPx],
  );
  // Keyboard: ← / → nav, ↑ / ↓ expand / collapse, Esc dismiss.
  // Skipped when typing in an input/textarea/contenteditable
  // elsewhere on the page.
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
      } else if (event.key === 'ArrowDown') {
        // Down = expand, but only when the current quote is actually
        // truncated. No-op otherwise so we don't trap page scroll on
        // quotes that fit fully in the preview.
        if (canExpand && !isExpanded) {
          event.preventDefault();
          onExpand();
        }
      } else if (event.key === 'ArrowUp') {
        // Up = collapse. Only meaningful when expanded — otherwise
        // let the arrow pass through so page scroll still works.
        if (isExpanded) {
          event.preventDefault();
          onCollapse();
        }
      } else if (event.key === 'Escape') {
        onHideDock();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    onPrevious,
    onNext,
    onHideDock,
    onExpand,
    onCollapse,
    canExpand,
    isExpanded,
  ]);

  const handleCloseClick = useCallback(() => onHideDock(), [onHideDock]);
  const handlePrevClick = useCallback(() => onPrevious(), [onPrevious]);
  const handleNextClick = useCallback(() => onNext(), [onNext]);

  // Only show the side peeks when there's actually a neighbor to
  // navigate to. With a single quote they'd be pure decoration and
  // imply an interaction that would do nothing.
  const canNavigate = quotesLength > 1;

  return (
    <div
      className={`group/bookshelf-dock bookshelf-dock-cp-outer ${outerClassName}`}
      data-density={density}
      /* Intentionally no `height` inline style. The plate below is
         fixed-height via CSS (see .bookshelf-dock-cp-plate), and
         outer flows to match. Setting an explicit outer height
         created a second transition fighting with the plate's, and
         any measured-height drift per quote (from meta wrapping,
         preview density, etc.) made the paper visibly jitter on
         cycle. `dockHeight` is still computed by useDockReservation
         for the page-reservation CSS var so surrounding content
         leaves room for the dock; it just doesn't drive layout here. */
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
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
            {/* IMPORTANT: the plate MUST stay mounted across
                quote changes. An earlier iteration keyed this on
                `cp-plate-${currentIndex}-...` so the clip-path
                keyframe animation would restart, but that also
                unmounted the AnimatePresence below — which
                silently destroyed every body exit/enter transition.
                We now drive the shape morph via a CSS `transition`
                on `clip-path` (see tornPage.css), so the plate
                doesn't need to remount. The body's AnimatePresence
                inside handles all per-quote motion. */}
            <div
              ref={plateRef}
              className={`bookshelf-dock-cp-plate ${plateClassName}`}
              /* `data-expanded` is the state hook that CSS uses
                 to switch body-stack from centered (collapsed) to
                 scrollable-top-anchored (expanded). The plate's
                 actual pixel height comes from `plateInlineStyle`
                 below — JS-measured to fit content when expanded,
                 fixed at the collapsed baseline otherwise. Cycling
                 a quote leaves expand state alone, so when the user
                 is in the collapsed view the plate stays exactly
                 the same pixel height and only the text swaps. */
              data-expanded={isExpanded ? 'true' : 'false'}
              style={plateInlineStyle}
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

              {/* Quote body crossfade — see QUOTE_BODY_MOTION at the
                  top of this file for the full timing notes. Sync
                  mode means both old and new bodies coexist during
                  the transition, occupying the same grid cell via
                  body-stack's grid-stack, so they overlap at the
                  same position on the paper. Heavy blur at the
                  midpoint makes neither legible, which reads as a
                  smudge resolving into the new quote rather than
                  two quotes fighting each other.

                  The motion key is keyed on `currentIndex` only —
                  NOT on `isExpanded`. Earlier we included expand
                  state in the key so every less/more click kicked
                  off the full quote-cycle animation, which made
                  expand feel laggy. Expand/collapse is now its own
                  gesture (the plate's CSS `transition: height`),
                  independent of this crossfade. */}
              <div
                ref={bodyStackRef}
                className="bookshelf-dock-cp-body-stack"
              >
                <AnimatePresence initial={false}>
                  <motion.div
                    key={`cp-body-${currentIndex}`}
                    initial={QUOTE_BODY_MOTION.initial}
                    animate={QUOTE_BODY_MOTION.animate}
                    exit={QUOTE_BODY_MOTION.exit}
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
              </div>

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
