import React from 'react';
import { FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface QuoteDockControlsProps {
  quoteCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onHideDock: () => void;
}

const QuoteDockControls: React.FC<QuoteDockControlsProps> = ({
  quoteCount,
  onPrevious,
  onNext,
  onHideDock,
}) => (
  <>
    <button
      type="button"
      onClick={onHideDock}
      aria-label="Hide quote dock"
      className="bookshelf-quote-dock__collapse-control absolute right-3 top-2 z-10 sm:right-4 sm:top-3"
    >
      <FaChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
    </button>

    {quoteCount > 1 && (
      <>
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Previous quote"
          className="bookshelf-quote-dock__edge-control absolute left-1 top-1/2 z-10 -translate-y-1/2 sm:left-3"
        >
          <FaChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next quote"
          className="bookshelf-quote-dock__edge-control absolute right-10 top-1/2 z-10 -translate-y-1/2 sm:right-12"
        >
          <FaChevronRight className="h-3.5 w-3.5" />
        </button>
      </>
    )}
  </>
);

export default QuoteDockControls;
