import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useActiveQuotes from '@/hooks/useActiveQuotes';
import useMediaQuery from '@/hooks/useMediaQuery';
import { toPlainText } from '@/utils/quoteUtils';
import QuoteDock from './QuoteDock';
import TornPaperPeek from './TornPaperPeek';
import './TornPaperPeek.css';
import {
  BASE_PREVIEW_DESKTOP_CHAR_LIMIT,
  BASE_PREVIEW_DESKTOP_LINES,
  BASE_PREVIEW_MOBILE_CHAR_LIMIT,
  BASE_PREVIEW_MOBILE_LINES,
} from './quoteDock.constants';
import './quoteDock.css';
import useDockReservation from './useDockReservation';
import useQuoteDockAutoAdvance from './useQuoteDockAutoAdvance';
import usePreviewFit from './usePreviewFit';
import useQuoteDockController from './useQuoteDockController';

// Top-level quote-dock container. Manages the controller state, the
// auto-advance timer, preview fitting, and dock-height reservation.
// Renders the single TornPage commonplace variant via QuoteDock.
// When dismissed, shows a small torn-paper peek at the bottom of
// the viewport as the re-open affordance.
//
// Close / open motion:
//   A slow, library-quiet opacity crossfade between the dock and
//   the peek. Opacity-only, deliberately — both `transform` AND
//   `filter` establish new containing blocks for fixed-positioned
//   descendants, and the dock/peek both rely on `position: fixed`
//   anchored to the viewport bottom. Apply either of those
//   properties on the motion wrapper and the dock visually
//   "detaches" from the viewport and lands somewhere mid-page
//   during the animation. Opacity is the only transition-safe
//   property for wrapping fixed children.
//
// Timing is intentionally unhurried — "slow, homey, library"
// means ~700ms not 300ms. The project's signature ease curve
// (cubic-bezier(0.19, 1, 0.22, 1)) is a gentle ease-out that
// matches the paper's other motions.
//
// The paper's own motion — the clip-path tear-shape shifting as
// each quote cycles — lives inside the torn-page variant's CSS
// (see tornPage.css) and is independent of this crossfade.
const CROSSFADE_DURATION = 0.72;
const CROSSFADE_EASE = [0.19, 1, 0.22, 1] as const;

const BookshelfQuoteDock: React.FC = () => {
  const { quotes, loading, error } = useActiveQuotes();
  const isDesktopPreview = useMediaQuery('(min-width: 640px)');
  const expandedBodyRef = useRef<HTMLDivElement | null>(null);

  const basePreviewCharLimit = isDesktopPreview
    ? BASE_PREVIEW_DESKTOP_CHAR_LIMIT
    : BASE_PREVIEW_MOBILE_CHAR_LIMIT;
  const previewBaseLines = isDesktopPreview
    ? BASE_PREVIEW_DESKTOP_LINES
    : BASE_PREVIEW_MOBILE_LINES;

  const currentPlainTexts = useMemo(
    () => quotes.map((quote) => toPlainText(quote.text)),
    [quotes],
  );

  const controller = useQuoteDockController({ quoteCount: quotes.length });

  const currentQuote = quotes[controller.currentIndex] || null;
  const currentPlainText = currentPlainTexts[controller.currentIndex] || '';

  const { previewFit, previewMeasureRef } = usePreviewFit({
    plainText: currentPlainText,
    baseCharLimit: basePreviewCharLimit,
    previewBaseLines,
  });

  useQuoteDockAutoAdvance({
    currentIndex: controller.currentIndex,
    quoteCount: quotes.length,
    previewText: previewFit.text,
    loading,
    hasError: Boolean(error),
    isPaused: controller.isAutoAdvancePaused,
    onAdvance: controller.advanceToNext,
  });

  useEffect(() => {
    if (expandedBodyRef.current) {
      expandedBodyRef.current.scrollTop = 0;
    }
  }, [controller.currentIndex, controller.isExpanded]);

  const reservationKey = `${controller.currentIndex}-${controller.isExpanded}-${previewFit.text}-${previewFit.minHeight}-${currentQuote?.author ?? ''}-${currentQuote?.source ?? ''}`;
  const { contentWrapperRef, dockHeight } = useDockReservation({
    isDockHidden: controller.isDockHidden,
    reservationKey,
  });

  if (loading || error || !currentQuote) {
    return null;
  }

  return (
    <>
      <AnimatePresence initial={false}>
      {controller.isDockHidden ? (
        <motion.div
          key="peek"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: CROSSFADE_DURATION, ease: CROSSFADE_EASE }}
        >
          <TornPaperPeek onShowDock={controller.handleShowDock} />
        </motion.div>
      ) : (
        <motion.div
          key="dock"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: CROSSFADE_DURATION, ease: CROSSFADE_EASE }}
        >
          <QuoteDock
            currentIndex={controller.currentIndex}
            currentQuote={currentQuote}
            quotesLength={quotes.length}
            isExpanded={controller.isExpanded}
            isDesktopPreview={isDesktopPreview}
            dockHeight={dockHeight}
            previewText={previewFit.text}
            previewMinHeight={previewFit.minHeight}
            canExpand={previewFit.truncated}
            contentWrapperRef={contentWrapperRef}
            expandedBodyRef={expandedBodyRef}
            onPrevious={controller.moveToPrevious}
            onNext={controller.moveToNext}
            onExpand={controller.handleExpand}
            onCollapse={controller.handleCollapse}
            onHideDock={controller.handleHideDock}
            onFocusCapture={controller.focusHandlers.onFocusCapture}
            onBlurCapture={controller.focusHandlers.onBlurCapture}
            previewMeasureRef={previewMeasureRef}
          />
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(BookshelfQuoteDock);
