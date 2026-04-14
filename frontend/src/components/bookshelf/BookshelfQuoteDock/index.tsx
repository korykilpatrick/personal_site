import React, { useEffect, useMemo, useRef } from 'react';
import useActiveQuotes from '@/hooks/useActiveQuotes';
import useMediaQuery from '@/hooks/useMediaQuery';
import { toPlainText } from '@/utils/quoteUtils';
import QuoteDock from './QuoteDock';
import QuoteDockToggle from './QuoteDockToggle';
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

  if (controller.isDockHidden) {
    return <QuoteDockToggle onShowDock={controller.handleShowDock} />;
  }

  return (
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
  );
};

export default React.memo(BookshelfQuoteDock);
