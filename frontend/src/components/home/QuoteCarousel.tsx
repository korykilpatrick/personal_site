import React, { useEffect, useRef, useState } from 'react';
import { Quote } from 'types';
import Icon from '@/components/common/Icon';
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
      /* Walnut-ink backdrop instead of navy so the modal-dim matches the
         warm-library register. `rgba(42, 29, 16, 0.46)` = walnut-dark at
         ~46% alpha — sits between the cream ground and the navbar's
         cool navy without jumping registers. */
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(42,29,16,0.46)] p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quote viewer"
    >
      <div
        /* Cream card matching the `.site-card` / torn-paper dock register:
             - border walnut @14% (same as .site-card)
             - bg cream-light → cream gradient (was cool-white → cool-blueish)
             - shadow walnut instead of navy so the drop-shadow color
               inherits the warm ground rather than a cool cast.
           Keeps the same geometry (rounded-24, max-w-3xl, etc.) — only
           the palette tokens change. */
        className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-[24px] border border-[rgba(74,52,35,0.14)] bg-[linear-gradient(180deg,rgba(250,245,234,0.96),rgba(244,236,216,0.92))] shadow-[0_28px_80px_rgba(74,52,35,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          /* Close × in warm chrome: walnut border at rest, oxblood hover
             (matches the site's link-hover treatment). */
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[rgba(74,52,35,0.16)] bg-[rgba(250,245,234,0.82)] text-textSecondary transition hover:border-oxblood/40 hover:text-oxblood"
          aria-label="Close quote viewer"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto px-6 pb-8 pt-16 sm:px-10 sm:pb-10 sm:pt-20">
          <div className="mx-auto max-w-2xl">
            <MarkdownRenderer className="quote-modal-markdown text-textSecondary" forceBlock>
              {`"${quote.text}"`}
            </MarkdownRenderer>

            {/* Walnut hairline instead of navy so the meta-separator
                reads as a page rule, not chrome. */}
            <div className="mt-8 border-t border-[rgba(74,52,35,0.14)] pt-4">
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
          {/* Warm radial decoration — oxblood-whisper at the top
              (matches the body-background's oxblood radial upper-right)
              plus a cream-tinted linear from the top. Replaces the
              previous cool-blue + stark-white gradient that read as a
              different design world from the bookshelf dock. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(158,58,42,0.08),transparent_30%),linear-gradient(180deg,rgba(255,253,244,0.30),transparent_56%)]"
          />
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label={`Open quote by ${current.author || 'unknown author'}`}
            /* Warm hover + oxblood focus ring (matches body::selection). */
            className="group relative block h-[6.3rem] w-full cursor-zoom-in px-14 py-4 text-center transition hover:bg-[rgba(250,245,234,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30 sm:h-[6rem] sm:px-20"
          >
            <div
              key={idx}
              className="animate-fade-in mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-1.5 text-center opacity-0 transition-opacity duration-700 ease-in-out"
            >
              {/* Quote ink: walnut-dark (not navy `text-primary`) so the
                  /quotes page reads with the same ink register as the
                  torn-paper dock on /bookshelf. Hover darkens via
                  walnut → walnut-dark; the group-hover:text-primary-dark
                  previously produced a tiny navy-shift that read as a
                  chrome tweak rather than a page element responding. */}
              <p className="quote-preview mb-0 font-serif text-[1rem] leading-[1.48] text-walnut-dark transition group-hover:text-[#2a1d10] sm:text-[1.06rem] sm:leading-[1.46]">
                &ldquo;{previewText}&rdquo;
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
                /* Warm chevron chrome: walnut hairline border, cream-light
                   fill, oxblood on hover. Mirrors the nav-mark affordance
                   inside the torn-paper dock. */
                className="absolute left-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[12px] border border-[rgba(74,52,35,0.18)] bg-[rgba(250,245,234,0.62)] text-textSecondary transition hover:border-oxblood/40 hover:bg-[rgba(250,245,234,0.88)] hover:text-oxblood sm:left-4"
              >
                <Icon name="chevron-left" className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={nextQuote}
                aria-label="Next quote"
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[12px] border border-[rgba(74,52,35,0.18)] bg-[rgba(250,245,234,0.62)] text-textSecondary transition hover:border-oxblood/40 hover:bg-[rgba(250,245,234,0.88)] hover:text-oxblood sm:right-4"
              >
                <Icon name="chevron-right" className="h-3 w-3" />
              </button>
            </>
          )}

          {/* Markdown emphasis colors:
               strong — navy for emphasis (matches the dock's
                 `.bookshelf-quote-dock__markdown strong` rule, #15263f)
               em — walnut-mid for italic asides (was cool slate
                 #5f7286, now #6b4f35, matching the dock). */}
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
            /* Modal-body typography matches the bookshelf torn-paper
               dock: Newsreader serif, walnut-dark ink, warm text-shadow
               for a paper-ink read. Without the explicit font-family
               + color here, the body inherits sans-serif + textPrimary
               navy from the global 'p' rule + 'html' defaults, which
               is what made the modal feel like a different design
               world from the /bookshelf dock. */
            .quote-modal-markdown p {
              font-family: 'Newsreader', 'IBM Plex Serif', Georgia, serif;
              font-size: 1.08rem;
              line-height: 1.92;
              font-weight: 400;
              color: #2a1f14;
              margin-bottom: 1rem;
              text-shadow:
                0 1px 0 rgba(255, 253, 244, 0.58),
                0 0 18px rgba(244, 236, 216, 0.30);
            }
            .quote-modal-markdown p:last-child {
              margin-bottom: 0;
            }
            .quote-modal-markdown strong {
              color: #15263f; /* navy ink for emphasis */
            }
            .quote-modal-markdown em {
              color: #6b4f35; /* walnut-mid for italic asides */
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
