import React, { useEffect, useRef, useState } from 'react';
import Card from '@/components/common/Card';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Quote } from 'types';
import { ErrorDisplay, Loading } from '@/components/ui';
import api from '@/services/api';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

/**
 * Configuration for quote display timing.
 */
// Average reading speed in words per minute.
const WORDS_PER_MINUTE = 125;
// Milliseconds per word, derived from WORDS_PER_MINUTE.
const MS_PER_WORD = (60 * 1000) / WORDS_PER_MINUTE;
// Minimum time a quote will be displayed, regardless of its length.
const BASE_MIN_DISPLAY_MS = 4000; // 4 seconds
// Maximum time a quote will be displayed, even if it's very long.
const MAX_DISPLAY_MS = 30000; // 20 seconds

/**
 * Calculates the appropriate display time for a given piece of text.
 * @param text The text content of the quote.
 * @returns The calculated display time in milliseconds.
 */
const calculateDisplayTime = (text: string): number => {
  if (!text) return BASE_MIN_DISPLAY_MS;
  // Count words by splitting on whitespace.
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // Calculate time needed based purely on word count.
  const timeNeededForWords = wordCount * MS_PER_WORD;
  // Ensure the display time is within the defined min/max bounds.
  return Math.min(MAX_DISPLAY_MS, Math.max(BASE_MIN_DISPLAY_MS, timeNeededForWords));
};

/**
 * Cycles through active quotes from DB. If none or empty, hides or shows fallback.
 */
const QuoteCarousel: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false); // State for pause on hover

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // For setTimeout

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<Quote[]>('/quotes?active=true');
        setQuotes(res.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load quotes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

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
    if (!loading && quotes.length > 1 && !isHovering && quotes[idx]) {
      const currentQuote = quotes[idx];
      const displayTime = calculateDisplayTime(currentQuote.text);

      timerRef.current = setTimeout(() => {
        setIdx(prevIdx => (prevIdx + 1) % quotes.length);
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
  }, [idx, quotes, loading, isHovering]); // Re-run effect if these change

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

  const prevQuote = () => {
    if (timerRef.current) { // Clear existing timer before navigation
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIdx(i => (i === 0 ? quotes.length - 1 : i - 1));
  };

  const nextQuote = () => {
    if (timerRef.current) { // Clear existing timer before navigation
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIdx(i => (i + 1) % quotes.length);
  };

  return (
    <div
      className="relative text-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Card padding="lg" className="w-full">
        <div
          key={idx}
          className="transition-opacity duration-700 ease-in-out opacity-0 animate-fade-in"
        >
          <div className="text-base mb-2">
            <MarkdownRenderer>{`"${current.text}"`}</MarkdownRenderer>
          </div>
          {current.author && <p className="text-sm text-stone-500">— {current.author}</p>}
          {current.source && <p className="text-xs text-stone-400 italic mt-1">{current.source}</p>}
        </div>

        {quotes.length > 1 && (
          <>
            <button
              onClick={prevQuote}
              aria-label="Previous quote"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextQuote}
              aria-label="Next quote"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary"
            >
              <FaChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <style>{`
          @keyframes fadeInQuote { from { opacity: 0 } to { opacity: 1 } }
          .animate-fade-in { animation: fadeInQuote .7s forwards }
        `}</style>
      </Card>
    </div>
  );
};

export default QuoteCarousel;