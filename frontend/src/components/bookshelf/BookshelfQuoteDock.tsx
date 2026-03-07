import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaQuoteLeft,
  FaTimes,
} from 'react-icons/fa';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import useActiveQuotes from '@/hooks/useActiveQuotes';
import { calculateDisplayTime, toPlainText, truncateAtWordBoundary } from '@/utils/quoteUtils';

const BASE_PREVIEW_MOBILE_CHAR_LIMIT = 200;
const BASE_PREVIEW_DESKTOP_CHAR_LIMIT = 360;
const BASE_PREVIEW_MOBILE_LINES = 4;
const BASE_PREVIEW_DESKTOP_LINES = 5;
const AUTO_ADVANCE_MIN_MS = 4000;
const AUTO_ADVANCE_MAX_MS = 7000;
const POINTER_PAUSE_MS = 1500;
const INITIAL_DOCK_HEIGHT = 112;
const HIDDEN_DOCK_HEIGHT = 52;
const FALLBACK_PREVIEW_MIN_HEIGHT = 48;
const DESKTOP_EXPANDED_BODY_MAX_HEIGHT = 'min(45vh, 24rem)';
const MOBILE_EXPANDED_BODY_MAX_HEIGHT = 'calc(50vh - 5rem - env(safe-area-inset-bottom))';

interface PreviewFitState {
  text: string;
  truncated: boolean;
  minHeight: number;
}

const BookshelfQuoteDock: React.FC = () => {
  const { quotes, loading, error } = useActiveQuotes();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDockHidden, setIsDockHidden] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [interactionPauseUntil, setInteractionPauseUntil] = useState<number | null>(null);
  const [isDesktopPreview, setIsDesktopPreview] = useState(false);
  const [dockHeight, setDockHeight] = useState(INITIAL_DOCK_HEIGHT);
  const [previewFit, setPreviewFit] = useState<PreviewFitState>({
    text: '',
    truncated: false,
    minHeight: FALLBACK_PREVIEW_MIN_HEIGHT,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandedBodyRef = useRef<HTMLDivElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const previewMeasureRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (typeof window.matchMedia !== 'function') {
      setIsDesktopPreview(window.innerWidth >= 640);
      return undefined;
    }

    const mediaQuery = window.matchMedia('(min-width: 640px)');
    const syncViewport = () => setIsDesktopPreview(mediaQuery.matches);

    syncViewport();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncViewport);
      return () => {
        mediaQuery.removeEventListener('change', syncViewport);
      };
    }

    mediaQuery.addListener(syncViewport);

    return () => {
      mediaQuery.removeListener(syncViewport);
    };
  }, []);

  useEffect(() => {
    if (interactionPauseUntil === null) {
      return undefined;
    }

    const remaining = interactionPauseUntil - Date.now();
    if (remaining <= 0) {
      setInteractionPauseUntil(null);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setInteractionPauseUntil(null), remaining);
    return () => window.clearTimeout(timeoutId);
  }, [interactionPauseUntil]);

  useEffect(() => {
    if (expandedBodyRef.current) {
      expandedBodyRef.current.scrollTop = 0;
    }
  }, [currentIndex, isExpanded]);

  const currentQuote = quotes[currentIndex] || null;
  const currentPlainText = useMemo(
    () => (currentQuote ? toPlainText(currentQuote.text) : ''),
    [currentQuote],
  );
  const basePreviewCharLimit = isDesktopPreview
    ? BASE_PREVIEW_DESKTOP_CHAR_LIMIT
    : BASE_PREVIEW_MOBILE_CHAR_LIMIT;
  const previewBaseLines = isDesktopPreview
    ? BASE_PREVIEW_DESKTOP_LINES
    : BASE_PREVIEW_MOBILE_LINES;
  const previewText = previewFit.text;
  const canExpand = previewFit.truncated;

  const isInteractionPaused =
    interactionPauseUntil !== null && interactionPauseUntil > Date.now();
  const isAutoAdvancePaused = isExpanded || isFocusedWithin || isInteractionPaused;

  useLayoutEffect(() => {
    if (!currentPlainText) {
      setPreviewFit({
        text: '',
        truncated: false,
        minHeight: FALLBACK_PREVIEW_MIN_HEIGHT,
      });
      return;
    }

    const previewMeasure = previewMeasureRef.current;
    if (!previewMeasure || typeof window === 'undefined') {
      const fallbackText = truncateAtWordBoundary(currentPlainText, basePreviewCharLimit);
      setPreviewFit({
        text: fallbackText,
        truncated: fallbackText !== currentPlainText,
        minHeight: FALLBACK_PREVIEW_MIN_HEIGHT,
      });
      return;
    }

    const computedStyles = window.getComputedStyle(previewMeasure);
    const lineHeight =
      Number.parseFloat(computedStyles.lineHeight) || FALLBACK_PREVIEW_MIN_HEIGHT / 2;
    const minHeight = Math.ceil(lineHeight * previewBaseLines);
    const maxHeight = minHeight;
    const hardCappedText =
      currentPlainText.length > basePreviewCharLimit
        ? truncateAtWordBoundary(currentPlainText, basePreviewCharLimit)
        : currentPlainText;

    const measureHeight = (candidate: string) => {
      previewMeasure.textContent = candidate ? `"${candidate}"` : '';
      return Math.ceil(previewMeasure.getBoundingClientRect().height);
    };

    let nextText = hardCappedText;
    let truncated = nextText !== currentPlainText;

    if (measureHeight(hardCappedText) > maxHeight) {
      const upperBound = Math.min(basePreviewCharLimit, currentPlainText.length);
      let low = 1;
      let high = upperBound;
      let bestFit = truncateAtWordBoundary(currentPlainText, Math.min(24, upperBound));

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const candidate = truncateAtWordBoundary(currentPlainText, mid);

        if (measureHeight(candidate) <= maxHeight) {
          bestFit = candidate;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      nextText = bestFit;
      truncated = true;
    }

    setPreviewFit((previous) => {
      if (
        previous.text === nextText &&
        previous.truncated === truncated &&
        previous.minHeight === minHeight
      ) {
        return previous;
      }

      return {
        text: nextText,
        truncated,
        minHeight,
      };
    });
  }, [
    currentPlainText,
    basePreviewCharLimit,
    previewBaseLines,
  ]);

  useLayoutEffect(() => {
    if (isDockHidden) {
      return undefined;
    }

    const contentWrapper = contentWrapperRef.current;
    if (!contentWrapper) {
      return undefined;
    }

    const syncHeight = () => {
      const nextHeight = Math.ceil(contentWrapper.getBoundingClientRect().height);
      if (Number.isFinite(nextHeight) && nextHeight > 0) {
        setDockHeight(nextHeight);
      }
    };

    syncHeight();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncHeight);
      return () => {
        window.removeEventListener('resize', syncHeight);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      syncHeight();
    });

    resizeObserver.observe(contentWrapper);
    window.addEventListener('resize', syncHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncHeight);
    };
  }, [
    currentIndex,
    isDockHidden,
    isExpanded,
    previewText,
    previewFit.minHeight,
    currentQuote?.author,
    currentQuote?.source,
  ]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const reservedHeight = isDockHidden ? HIDDEN_DOCK_HEIGHT : dockHeight;
    document.documentElement.style.setProperty(
      '--bookshelf-quote-dock-height',
      `${reservedHeight}px`,
    );
  }, [dockHeight, isDockHidden]);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.removeProperty('--bookshelf-quote-dock-height');
      }
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (loading || error || quotes.length < 2 || !currentQuote || isAutoAdvancePaused) {
      return undefined;
    }

    const displayTime = calculateDisplayTime(previewText, {
      minDisplayMs: AUTO_ADVANCE_MIN_MS,
      maxDisplayMs: AUTO_ADVANCE_MAX_MS,
    });

    timerRef.current = setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % quotes.length);
    }, displayTime);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentQuote, error, isAutoAdvancePaused, loading, previewText, quotes.length]);

  const pauseAfterInteraction = () => {
    setInteractionPauseUntil(Date.now() + POINTER_PAUSE_MS);
  };

  const moveToPrevious = () => {
    if (quotes.length < 2) {
      return;
    }

    pauseAfterInteraction();
    setCurrentIndex((index) => (index === 0 ? quotes.length - 1 : index - 1));
  };

  const moveToNext = () => {
    if (quotes.length < 2) {
      return;
    }

    pauseAfterInteraction();
    setCurrentIndex((index) => (index + 1) % quotes.length);
  };

  const handleExpand = () => {
    pauseAfterInteraction();
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    pauseAfterInteraction();
    setIsExpanded(false);
  };

  const handleHideDock = () => {
    pauseAfterInteraction();
    setIsExpanded(false);
    setIsFocusedWithin(false);
    setIsDockHidden(true);
  };

  const handleShowDock = () => {
    pauseAfterInteraction();
    setIsDockHidden(false);
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocusedWithin(false);
    }
  };

  const handleFocusCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      setIsFocusedWithin(true);
      return;
    }

    const isKeyboardFocus =
      typeof target.matches === 'function' ? target.matches(':focus-visible') : true;

    setIsFocusedWithin(isKeyboardFocus);
  };

  if (loading || error || !currentQuote) {
    return null;
  }

  if (isDockHidden) {
    return (
      <button
        type="button"
        onClick={handleShowDock}
        aria-label="Show quote dock"
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-[rgba(250,249,247,0.9)] px-4 py-2 text-[0.75rem] font-medium tracking-[0.12em] text-stone-600 shadow-[0_12px_28px_rgba(15,41,66,0.12)] backdrop-blur-[14px] transition-all duration-[820ms] ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 0.875rem)' }}
      >
        <FaQuoteLeft className="h-3 w-3" />
        <span>Quotes</span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 overflow-hidden bg-[linear-gradient(to_top,rgba(250,249,247,0.98),rgba(250,249,247,0.92)_58%,rgba(250,249,247,0.84))] shadow-[0_-18px_42px_rgba(15,41,66,0.1)] backdrop-blur-[14px] transition-[height,box-shadow,background] duration-[1180ms] ease-[cubic-bezier(0.19,1,0.22,1)] will-change-[height]"
      style={{ height: `${dockHeight}px` }}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/80 via-white/28 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-px h-px bg-white/70"
      />

      <div
        ref={contentWrapperRef}
        className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-4 py-3 sm:px-6 sm:py-3.5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        {isExpanded ? (
          <div
            ref={expandedBodyRef}
            key={`expanded-${currentIndex}`}
            className="bookshelf-quote-dock__body row-start-1 min-w-0 overflow-y-auto pr-1 sm:pr-2"
            style={{
              maxHeight: isDesktopPreview
                ? DESKTOP_EXPANDED_BODY_MAX_HEIGHT
                : MOBILE_EXPANDED_BODY_MAX_HEIGHT,
            }}
          >
            <MarkdownRenderer className="bookshelf-quote-dock__markdown text-stone-700">
              {`"${currentQuote.text}"`}
            </MarkdownRenderer>
          </div>
        ) : canExpand ? (
          <button
            type="button"
            key={`collapsed-${currentIndex}`}
            onClick={handleExpand}
            aria-label={`Expand quote by ${currentQuote.author || 'unknown author'}`}
            className="bookshelf-quote-dock__body flex min-w-0 items-center justify-center overflow-hidden text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            style={{ minHeight: `${previewFit.minHeight}px` }}
          >
            <p className="bookshelf-quote-dock__preview mb-0 max-w-[48rem] font-serif text-[0.93rem] leading-[1.5] text-stone-800 sm:text-[0.98rem] sm:leading-[1.54]">
              "{previewText}"
            </p>
          </button>
        ) : (
          <div
            key={`collapsed-${currentIndex}`}
            className="bookshelf-quote-dock__body flex min-w-0 items-center justify-center overflow-hidden text-center"
            style={{ minHeight: `${previewFit.minHeight}px` }}
          >
            <p className="bookshelf-quote-dock__preview mb-0 max-w-[48rem] font-serif text-[0.93rem] leading-[1.5] text-stone-800 sm:text-[0.98rem] sm:leading-[1.54]">
              "{previewText}"
            </p>
          </div>
        )}

        <div className="row-span-2 col-start-2 flex items-center gap-1 self-center pl-1">
          <button
            type="button"
            onClick={moveToPrevious}
            aria-label="Previous quote"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/70 bg-white/58 text-stone-500 transition hover:border-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <FaChevronLeft className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={moveToNext}
            aria-label="Next quote"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/70 bg-white/58 text-stone-500 transition hover:border-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <FaChevronRight className="h-3 w-3" />
          </button>

          {(canExpand || isExpanded) && (
            <button
              type="button"
              onClick={isExpanded ? handleCollapse : handleExpand}
              aria-label={isExpanded ? 'Collapse quote dock' : 'Expand quote dock'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/70 bg-white/58 text-stone-500 transition hover:border-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              {isExpanded ? (
                <FaChevronDown className="h-3 w-3" />
              ) : (
                <FaChevronUp className="h-3 w-3" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleHideDock}
            aria-label="Hide quote dock"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/70 bg-white/58 text-stone-500 transition hover:border-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <FaTimes className="h-3 w-3" />
          </button>
        </div>

        {(currentQuote.author || currentQuote.source) && (
          <p
            key={`meta-${currentIndex}-${isExpanded ? 'expanded' : 'collapsed'}`}
            className="bookshelf-quote-dock__meta row-start-2 mb-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-center font-sans text-[0.7rem] tracking-[0.06em] text-stone-500 sm:text-[0.74rem]"
          >
            {currentQuote.author && <span>{currentQuote.author}</span>}
            {currentQuote.author && currentQuote.source && <span aria-hidden="true"> · </span>}
            {currentQuote.source && <span className="italic text-stone-400">{currentQuote.source}</span>}
          </p>
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 invisible"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] gap-x-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="min-w-0">
            <p
              ref={previewMeasureRef}
              className="bookshelf-quote-dock__preview mx-auto max-w-[48rem] font-serif text-[0.93rem] leading-[1.5] text-center text-stone-800 sm:text-[0.98rem] sm:leading-[1.54]"
            />
          </div>
          <div className="w-[7.25rem]" />
        </div>
      </div>

      <style>{`
        @keyframes fadeInBookshelfDockQuote {
          from {
            opacity: 0;
            transform: translateY(12px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .bookshelf-quote-dock__body {
          opacity: 0;
          animation: fadeInBookshelfDockQuote 1.1s 120ms cubic-bezier(0.19, 1, 0.22, 1) both;
        }

        .bookshelf-quote-dock__meta {
          opacity: 0;
          animation: fadeInBookshelfDockQuote 1.18s 220ms cubic-bezier(0.19, 1, 0.22, 1) both;
        }

        .bookshelf-quote-dock__preview {
          text-wrap: pretty;
        }

        .bookshelf-quote-dock__markdown p {
          font-size: 0.95rem;
          line-height: 1.62;
          margin-bottom: 0.75rem;
          color: #292524;
          text-align: center;
        }

        .bookshelf-quote-dock__markdown {
          max-width: 48rem;
          margin: 0 auto;
        }

        .bookshelf-quote-dock__markdown p:last-child {
          margin-bottom: 0;
        }

        .bookshelf-quote-dock__markdown strong {
          color: #1f2937;
        }

        .bookshelf-quote-dock__markdown em {
          color: #57534e;
        }

        @media (min-width: 640px) {
          .bookshelf-quote-dock__markdown p {
            font-size: 0.98rem;
            line-height: 1.66;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(BookshelfQuoteDock);
