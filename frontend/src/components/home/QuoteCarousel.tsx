import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { Quote } from 'types';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import useActiveQuotes from '@/hooks/useActiveQuotes';
import { calculateDisplayTime, toPlainText, truncateAtWordBoundary } from '@/utils/quoteUtils';

const BASE_MIN_DISPLAY_MS = 3500;
const MAX_DISPLAY_MS = 9000;
const TRUNCATED_PREVIEW_MAX_DISPLAY_MS = 6500;
// Keep the bookshelf quote strip concise and use the modal for full reading.
const FEATURED_PREVIEW_CHAR_COUNT = 115;

interface QuoteModalProps {
  isOpen: boolean;
  quote: Quote | null;
  onClose: () => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, quote, onClose }) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !quote) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/48 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quote viewer"
    >
      <div
        className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-[24px] border border-[rgba(21,38,63,0.12)] bg-[linear-gradient(180deg,rgba(252,254,255,0.96),rgba(240,246,252,0.92))] shadow-[0_28px_80px_rgba(12,23,39,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-primary/12 bg-white/74 text-textSecondary transition hover:border-secondary/24 hover:text-primary"
          aria-label="Close quote viewer"
        >
          <FaTimes className="h-4 w-4" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto px-6 pb-8 pt-16 sm:px-10 sm:pb-10 sm:pt-20">
          <div className="mx-auto max-w-2xl">
            <MarkdownRenderer className="quote-modal-markdown text-textSecondary">
              {`"${quote.text}"`}
            </MarkdownRenderer>

            <div className="mt-8 border-t border-primary/10 pt-4">
              {quote.author && (
                <p className="mb-1 font-mono text-[0.76rem] uppercase tracking-[0.12em] text-textSecondary">
                  {quote.author}
                </p>
              )}
              {quote.source && (
                <p className="mb-0 text-sm italic text-textTertiary">{quote.source}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Cycles through active quotes from DB. If none or empty, hides or shows fallback.
 */
const QuoteCarousel: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const { quotes, loading, error } = useActiveQuotes();
  const [isHovering, setIsHovering] = useState(false); // State for pause on hover
  const [isModalOpen, setIsModalOpen] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // For setTimeout

  useEffect(() => {
    // Clear any existing timer before setting a new one or deciding not to.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Conditions for auto-advancing:
    // 1. Not loading.
    // 2. More than one quote is available.
    // 3. The carousel is not currently being hovered over.
    // 4. There's a valid quote at the current index.
    if (!loading && quotes.length > 1 && !isHovering && !isModalOpen && quotes[idx]) {
      const currentQuote = quotes[idx];
      const previewText = truncateAtWordBoundary(
        toPlainText(currentQuote.text),
        FEATURED_PREVIEW_CHAR_COUNT,
      );
      const isTruncatedPreview = previewText !== toPlainText(currentQuote.text);
      const displayTime = calculateDisplayTime(previewText, {
        minDisplayMs: BASE_MIN_DISPLAY_MS,
        maxDisplayMs: isTruncatedPreview ? TRUNCATED_PREVIEW_MAX_DISPLAY_MS : MAX_DISPLAY_MS,
      });

      timerRef.current = setTimeout(() => {
        setIdx((prevIdx) => (prevIdx + 1) % quotes.length);
      }, displayTime);
    }

    // Cleanup function: ensures the timer is cleared if dependencies change
    // or if the component unmounts while a timer is active.
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [idx, quotes, loading, isHovering, isModalOpen]); // Re-run effect if these change

  useEffect(() => {
    setIsModalOpen(false);
  }, [idx]);

  if (loading) {
    return null; // or <Loading />
  }
  if (error) {
    return null; // or <ErrorDisplay error={error} />
  }
  if (!quotes || quotes.length === 0) {
    return null; // no active quotes means hide the carousel
  }

  const current = quotes[idx];
  const currentPlainText = toPlainText(current.text);
  const previewText = truncateAtWordBoundary(currentPlainText, FEATURED_PREVIEW_CHAR_COUNT);
  const isPreviewTruncated = previewText !== currentPlainText;

  const prevQuote = () => {
    if (timerRef.current) {
      // Clear existing timer before navigation
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIdx((i) => (i === 0 ? quotes.length - 1 : i - 1));
  };

  const nextQuote = () => {
    if (timerRef.current) {
      // Clear existing timer before navigation
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIdx((i) => (i + 1) % quotes.length);
  };

  return (
    <>
      <div
        className="relative text-center"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="site-card-soft relative overflow-hidden rounded-[22px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(63,127,216,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.22),transparent_56%)]"
          />
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label={`Open quote by ${current.author || 'unknown author'}`}
            className="group relative block h-[6.3rem] w-full cursor-zoom-in px-14 py-4 text-center transition hover:bg-white/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/25 sm:h-[6rem] sm:px-20"
          >
            <div
              key={idx}
              className="animate-fade-in mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-1.5 text-center opacity-0 transition-opacity duration-700 ease-in-out"
            >
              <p className="quote-preview mb-0 font-serif text-[1rem] leading-[1.48] text-primary transition group-hover:text-primary-dark sm:text-[1.06rem] sm:leading-[1.46]">
                "{previewText}"
              </p>

              {(current.author || current.source) && (
                <p className="quote-meta mb-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[0.66rem] uppercase tracking-[0.1em] text-textTertiary sm:text-[0.7rem]">
                  {current.author && <span>{current.author}</span>}
                  {current.author && current.source && <span aria-hidden="true"> · </span>}
                  {current.source && <span className="italic normal-case tracking-[0.08em] text-textSecondary">{current.source}</span>}
                </p>
              )}
            </div>
          </button>

          {quotes.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevQuote}
                aria-label="Previous quote"
                className="absolute left-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[12px] border border-primary/10 bg-white/54 text-textSecondary transition hover:border-secondary/24 hover:bg-white/72 hover:text-primary sm:left-4"
              >
                <FaChevronLeft className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={nextQuote}
                aria-label="Next quote"
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[12px] border border-primary/10 bg-white/54 text-textSecondary transition hover:border-secondary/24 hover:bg-white/72 hover:text-primary sm:right-4"
              >
                <FaChevronRight className="h-3 w-3" />
              </button>
            </>
          )}

          <style>{`
            @keyframes fadeInQuote { from { opacity: 0 } to { opacity: 1 } }
            .animate-fade-in { animation: fadeInQuote .7s forwards }
            .quote-preview {
              overflow: hidden;
              max-height: calc(1.4em * 2 + 0.1rem);
            }
            .quote-meta {
              display: block;
            }
            .quote-modal-markdown p {
              font-size: 1.08rem;
              line-height: 1.92;
              margin-bottom: 1rem;
            }
            .quote-modal-markdown strong {
              color: #15263f;
            }
            .quote-modal-markdown em {
              color: #5f7286;
            }
            @media (min-width: 640px) {
              .quote-preview {
                max-height: calc(1.38em * 2 + 0.1rem);
              }
              .quote-modal-markdown p {
                font-size: 1.12rem;
              }
            }
          `}</style>
        </div>
      </div>

      <QuoteModal isOpen={isModalOpen} quote={current} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default React.memo(QuoteCarousel);
