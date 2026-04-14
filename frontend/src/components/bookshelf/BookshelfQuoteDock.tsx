import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
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
const EXPAND_LABEL = 'more';

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

  useEffect(() => {
    setIsExpanded(false);
  }, [currentIndex]);

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
      const suffix = truncatedAtLimit(candidate) ? `... ${EXPAND_LABEL}` : '';
      previewMeasure.textContent = candidate ? `"${candidate}${suffix}` : '';
      return Math.ceil(previewMeasure.getBoundingClientRect().height);
    };

    const truncatedAtLimit = (candidate: string) =>
      candidate.length < currentPlainText.length || hardCappedText !== currentPlainText;

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
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-[14px] border border-primary/12 bg-[rgba(247,250,255,0.52)] px-4 py-2 text-[0.72rem] font-mono font-medium uppercase tracking-[0.1em] text-textSecondary shadow-[0_10px_24px_rgba(12,23,39,0.08)] backdrop-blur-[6px] backdrop-saturate-135 transition-all duration-[820ms] ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-0.5 hover:border-secondary/30 hover:bg-[rgba(247,250,255,0.68)] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 0.875rem)' }}
      >
        <FaQuoteLeft className="h-3 w-3" />
        <span>Quotes</span>
      </button>
    );
  }

  return (
    <div
      className="group/bookshelf-dock fixed inset-x-0 bottom-0 z-30 overflow-hidden bg-[linear-gradient(to_top,rgba(241,246,252,0.62),rgba(241,246,252,0.4)_34%,rgba(241,246,252,0.16)_62%,rgba(241,246,252,0.02))] shadow-[0_-10px_24px_rgba(12,23,39,0.08)] backdrop-blur-[3px] backdrop-saturate-130 transition-[height,box-shadow,background] duration-[1180ms] ease-[cubic-bezier(0.19,1,0.22,1)] will-change-[height]"
      style={{ height: `${dockHeight}px` }}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/[0.18] via-white/[0.04] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(132,181,255,0.52)] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-[radial-gradient(ellipse_at_top,rgba(233,242,255,0.22),transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[rgba(12,23,39,0.08)] via-[rgba(241,246,252,0.05)] to-transparent"
      />

      <div
        ref={contentWrapperRef}
        className="relative isolate w-full px-4 py-3 sm:px-6 sm:py-3.5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <div
          key={`cloud-${currentIndex}-${isExpanded ? 'expanded' : 'collapsed'}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="bookshelf-quote-dock__reading-cloud absolute inset-0" />
          <div className="bookshelf-quote-dock__reading-glow absolute inset-0" />
          <div className="bookshelf-quote-dock__reading-mist absolute inset-0" />
        </div>

        <button
          type="button"
          onClick={handleHideDock}
          aria-label="Hide quote dock"
          className="bookshelf-quote-dock__collapse-control absolute right-3 top-2 z-10 sm:right-4 sm:top-3"
        >
          <FaChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
        </button>

        <div className="relative mx-auto max-w-5xl">
          {quotes.length > 1 && (
            <>
              <button
                type="button"
                onClick={moveToPrevious}
                aria-label="Previous quote"
                className="bookshelf-quote-dock__edge-control absolute left-1 top-1/2 z-10 -translate-y-1/2 sm:left-3"
              >
                <FaChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={moveToNext}
                aria-label="Next quote"
                className="bookshelf-quote-dock__edge-control absolute right-10 top-1/2 z-10 -translate-y-1/2 sm:right-12"
              >
                <FaChevronRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          <div className="mx-auto min-w-0 max-w-[44rem] px-10 sm:px-14">
          {isExpanded ? (
            <div
              ref={expandedBodyRef}
              key={`expanded-${currentIndex}`}
              className="bookshelf-quote-dock__body min-w-0 overflow-y-auto pr-1 text-center sm:pr-2"
              style={{
                maxHeight: isDesktopPreview
                  ? DESKTOP_EXPANDED_BODY_MAX_HEIGHT
                  : MOBILE_EXPANDED_BODY_MAX_HEIGHT,
              }}
            >
              <MarkdownRenderer className="bookshelf-quote-dock__markdown text-textSecondary">
                {`"${currentQuote.text}"`}
              </MarkdownRenderer>
            </div>
          ) : (
            <div
              key={`collapsed-${currentIndex}`}
              className="bookshelf-quote-dock__body flex min-w-0 items-center justify-center overflow-hidden text-center"
              style={{ minHeight: `${previewFit.minHeight}px` }}
            >
              <p className="bookshelf-quote-dock__preview mb-0 max-w-[44rem] font-serif text-[0.93rem] leading-[1.5] text-primary sm:text-[0.98rem] sm:leading-[1.54]">
                <span>{`"${previewText}`}</span>
                {canExpand ? (
                  <>
                    <span aria-hidden="true">...</span>{' '}
                    <button
                      type="button"
                      onClick={handleExpand}
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
              className="bookshelf-quote-dock__meta mb-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-center font-mono text-[0.68rem] tracking-[0.08em] text-textSecondary sm:text-[0.72rem]"
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
                  onClick={handleCollapse}
                  className="bookshelf-quote-dock__inline-toggle text-[0.62rem] tracking-[0.18em]"
                >
                  less
                </button>
              )}
            </p>
          )}
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 invisible"
      >
        <div className="w-full px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-[44rem] px-10 sm:px-14">
            <p
              ref={previewMeasureRef}
              className="bookshelf-quote-dock__preview mx-auto max-w-[44rem] font-serif text-[0.93rem] leading-[1.5] text-center text-primary sm:text-[0.98rem] sm:leading-[1.54]"
            />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBookshelfDockQuote {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes driftInBookshelfDockVeil {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.97);
            filter: blur(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .bookshelf-quote-dock__body {
          opacity: 0;
          animation: fadeInBookshelfDockQuote 1.28s 180ms cubic-bezier(0.19, 1, 0.22, 1) both;
        }

        .bookshelf-quote-dock__meta {
          opacity: 0;
          animation: fadeInBookshelfDockQuote 1.36s 280ms cubic-bezier(0.19, 1, 0.22, 1) both;
        }

        .bookshelf-quote-dock__reading-cloud,
        .bookshelf-quote-dock__reading-glow,
        .bookshelf-quote-dock__reading-mist {
          animation: driftInBookshelfDockVeil 1.38s cubic-bezier(0.19, 1, 0.22, 1) both;
        }

        .bookshelf-quote-dock__reading-cloud {
          background: radial-gradient(
            ellipse at center,
            rgba(247, 250, 255, 0.82) 0%,
            rgba(247, 250, 255, 0.64) 18%,
            rgba(247, 250, 255, 0.28) 42%,
            rgba(247, 250, 255, 0.08) 62%,
            transparent 100%
          );
        }

        .bookshelf-quote-dock__reading-glow {
          background: radial-gradient(
            ellipse at center,
            rgba(132, 181, 255, 0.18),
            rgba(247, 250, 255, 0.08) 42%,
            transparent 76%
          );
          filter: blur(26px);
        }

        .bookshelf-quote-dock__reading-mist {
          background: radial-gradient(
            ellipse at center,
            rgba(233, 242, 255, 0.12) 0%,
            rgba(233, 242, 255, 0.06) 22%,
            transparent 66%
          );
          filter: blur(44px);
        }

        .bookshelf-quote-dock__preview {
          text-wrap: pretty;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.52),
            0 0 18px rgba(233, 242, 255, 0.32);
        }

        .bookshelf-quote-dock__inline-toggle {
          display: inline-flex;
          align-items: center;
          border: 0;
          background: transparent;
          padding: 0;
          margin: 0;
          color: rgba(48, 90, 154, 0.92);
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          font-size: 0.64rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
          vertical-align: baseline;
          transition: color 420ms cubic-bezier(0.19, 1, 0.22, 1),
            opacity 420ms cubic-bezier(0.19, 1, 0.22, 1);
        }

        .bookshelf-quote-dock__inline-toggle:hover,
        .bookshelf-quote-dock__inline-toggle:focus-visible {
          color: #2d63af;
          opacity: 1;
          outline: none;
        }

        .bookshelf-quote-dock__edge-control {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          color: rgba(62, 84, 112, 0.22);
          opacity: 0.18;
          transition: opacity 620ms cubic-bezier(0.19, 1, 0.22, 1),
            color 620ms cubic-bezier(0.19, 1, 0.22, 1),
            transform 620ms cubic-bezier(0.19, 1, 0.22, 1);
        }

        .group\\/bookshelf-dock:hover .bookshelf-quote-dock__edge-control,
        .group\\/bookshelf-dock:focus-within .bookshelf-quote-dock__edge-control,
        .bookshelf-quote-dock__edge-control:hover,
        .bookshelf-quote-dock__edge-control:focus-visible {
          opacity: 0.72;
          color: rgba(42, 73, 120, 0.84);
          transform: translateY(-50%) scale(1.02);
          outline: none;
        }

        .bookshelf-quote-dock__collapse-control {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 999px;
          border: 1px solid rgba(235, 243, 255, 0.18);
          background: rgba(241, 246, 252, 0.18);
          color: rgba(57, 78, 105, 0.54);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14),
            0 6px 18px rgba(12, 23, 39, 0.05);
          backdrop-filter: blur(4px) saturate(120%);
          opacity: 0.44;
          transition: opacity 520ms cubic-bezier(0.19, 1, 0.22, 1),
            transform 520ms cubic-bezier(0.19, 1, 0.22, 1),
            color 520ms cubic-bezier(0.19, 1, 0.22, 1),
            background 520ms cubic-bezier(0.19, 1, 0.22, 1),
            border-color 520ms cubic-bezier(0.19, 1, 0.22, 1),
            box-shadow 520ms cubic-bezier(0.19, 1, 0.22, 1);
        }

        .group\\/bookshelf-dock:hover .bookshelf-quote-dock__collapse-control,
        .group\\/bookshelf-dock:focus-within .bookshelf-quote-dock__collapse-control,
        .bookshelf-quote-dock__collapse-control:hover,
        .bookshelf-quote-dock__collapse-control:focus-visible {
          opacity: 0.9;
          transform: translateY(-1px);
          color: rgba(45, 99, 175, 0.9);
          background: rgba(241, 246, 252, 0.42);
          border-color: rgba(233, 242, 255, 0.3);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 10px 24px rgba(12, 23, 39, 0.08);
          outline: none;
        }

        .bookshelf-quote-dock__markdown p {
          font-size: 0.95rem;
          line-height: 1.62;
          margin-bottom: 0.75rem;
          color: #223248;
          text-align: center;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.52),
            0 0 18px rgba(233, 242, 255, 0.28);
        }

        .bookshelf-quote-dock__markdown {
          max-width: 44rem;
          margin: 0 auto;
        }

        .bookshelf-quote-dock__markdown p:last-child {
          margin-bottom: 0;
        }

        .bookshelf-quote-dock__markdown strong {
          color: #15263f;
        }

        .bookshelf-quote-dock__markdown em {
          color: #5f7286;
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
