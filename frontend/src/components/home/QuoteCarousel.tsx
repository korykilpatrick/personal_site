import React, { useEffect, useRef, useState } from 'react';
import Card from '@/components/common/Card';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Quote {
  text: string;
  author?: string;
}

const quotes: Quote[] = [
  { text: 'In the beginner’s mind there are many possibilities, in the expert’s there are few.', author: 'Shunryū Suzuki' },
  { text: 'What you truly seek is seeking you.', author: 'Rumi' },
  { text: 'The obstacle is the way.', author: 'Marcus Aurelius' },
];

const DISPLAY_MS = 6000;

const QuoteCarousel: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAuto = () => {
    timer.current = setInterval(() => setIdx(i => (i + 1) % quotes.length), DISPLAY_MS);
  };

  const resetAuto = () => {
    if (timer.current) clearInterval(timer.current);
    startAuto();
  };

  // start on mount
  useEffect(() => {
    startAuto();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const prev = () => {
    setIdx(i => (i === 0 ? quotes.length - 1 : i - 1));
    resetAuto();
  };

  const next = () => {
    setIdx(i => (i + 1) % quotes.length);
    resetAuto();
  };

  const current = quotes[idx];

  return (
    <Card padding="lg" className="relative text-center">
      {/* Quote text */}
      <div
        key={idx} /* triggers key-based re-animation */
        className="transition-opacity duration-700 ease-in-out opacity-0 animate-fade-in"
      >
        <p className="italic text-base mb-2">&ldquo;{current.text}&rdquo;</p>
        {current.author && <p className="text-sm text-stone-500">— {current.author}</p>}
      </div>

      {/* Navigation arrows */}
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

      {/* Local keyframes */}
      <style>{`
        @keyframes fadeInQuote { from { opacity: 0 } to { opacity: 1 } }
        .animate-fade-in { animation: fadeInQuote .7s forwards }
      `}</style>
    </Card>
  );
};

export default QuoteCarousel;