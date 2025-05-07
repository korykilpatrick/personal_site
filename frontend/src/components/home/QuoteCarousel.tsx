import React, { useEffect, useRef, useState } from 'react';
import Card from '@/components/common/Card';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Quote } from 'types';
import { ErrorDisplay, Loading } from '@/components/ui';
import api from '@/services/api';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

/**
 * Cycles through active quotes from DB. If none or empty, hides or shows fallback.
 */
const DISPLAY_MS = 6000;

const QuoteCarousel: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAuto = () => {
    timer.current = setInterval(() => {
      setIdx(i => {
        if (!quotes || quotes.length === 0) return 0;
        return (i + 1) % quotes.length;
      });
    }, DISPLAY_MS);
  };

  const resetAuto = () => {
    if (timer.current) clearInterval(timer.current);
    startAuto();
  };

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
    if (!loading && quotes.length > 1) {
      startAuto();
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [loading, quotes]);

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

  const prev = () => {
    setIdx(i => (i === 0 ? quotes.length - 1 : i - 1));
    resetAuto();
  };

  const next = () => {
    setIdx(i => (i + 1) % quotes.length);
    resetAuto();
  };

  return (
    <Card padding="lg" className="relative text-center">
      <div
        key={idx}
        className="transition-opacity duration-700 ease-in-out opacity-0 animate-fade-in"
      >
        <div className="text-base mb-2">
          <MarkdownRenderer>{`"${current.text}"`}</MarkdownRenderer>
        </div>
        {current.author && <p className="text-sm text-stone-500">— {current.author}</p>}
      </div>

      {quotes.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous quote"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
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
  );
};

export default QuoteCarousel;