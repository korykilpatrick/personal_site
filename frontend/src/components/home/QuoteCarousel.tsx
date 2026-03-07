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
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quote viewer"
    >
      <div
        className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-[30px] border border-stone-200 bg-stone-50 shadow-[0_28px_80px_rgba(15,41,66,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-stone-500 transition hover:border-primary/30 hover:text-primary"
          aria-label="Close quote viewer"
        >
          <FaTimes className="h-4 w-4" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto px-6 pb-8 pt-16 sm:px-10 sm:pb-10 sm:pt-20">
          <div className="mx-auto max-w-2xl">
            <MarkdownRenderer className="quote-modal-markdown text-stone-700">
              {`"${quote.text}"`}
            </MarkdownRenderer>

            <div className="mt-8 border-t border-stone-200 pt-4">
              {quote.author && (
                <p className="mb-1 font-sans text-sm tracking-[0.08em] text-stone-600">
                  {quote.author}
                </p>
              )}
              {quote.source && (
                <p className="mb-0 text-sm italic text-stone-500">{quote.source}</p>
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
        <div className="relative overflow-hidden rounded-[22px] border border-stone-200/80 bg-white/72 shadow-[0_8px_22px_rgba(15,41,66,0.05)] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label={`Open quote by ${current.author || 'unknown author'}`}
            className="group block h-[5.6rem] w-full cursor-zoom-in px-14 py-3 text-center transition hover:bg-white/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:h-[5.2rem] sm:px-20"
          >
            <div
              key={idx}
              className="transition-opacity duration-700 ease-in-out opacity-0 animate-fade-in mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-1 text-center"
            >
              <p className="quote-preview mb-0 font-serif text-[0.94rem] leading-[1.4] text-stone-700 transition group-hover:text-stone-800 sm:text-[1rem] sm:leading-[1.38]">
                "{previewText}"
              </p>

              {(current.author || current.source) && (
                <p className="quote-meta mb-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[0.68rem] tracking-[0.06em] text-stone-500 sm:text-[0.72rem]">
                  {current.author && <span>{current.author}</span>}
                  {current.author && current.source && <span aria-hidden="true"> · </span>}
                  {current.source && <span className="italic text-stone-400">{current.source}</span>}
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
                className="absolute left-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-textSecondary transition hover:border-primary/30 hover:text-primary sm:left-4"
              >
                <FaChevronLeft className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={nextQuote}
                aria-label="Next quote"
                className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-textSecondary transition hover:border-primary/30 hover:text-primary sm:right-4"
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
              font-size: 1.05rem;
              line-height: 1.9;
              margin-bottom: 1rem;
            }
            .quote-modal-markdown strong {
              color: #1f2937;
            }
            .quote-modal-markdown em {
              color: #57534e;
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
