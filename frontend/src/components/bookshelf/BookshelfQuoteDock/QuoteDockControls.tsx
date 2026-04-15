import React from 'react';
import Icon from '@/components/common/Icon';

interface QuoteDockControlsProps {
  quoteCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

const QuoteDockControls: React.FC<QuoteDockControlsProps> = ({
  quoteCount,
  onPrevious,
  onNext,
}) => (
  <>
    {quoteCount > 1 && (
      <>
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Previous quote"
          className="bookshelf-quote-dock__edge-control absolute left-1 top-1/2 z-10 -translate-y-1/2 sm:left-3"
        >
          <Icon name="chevron-left" className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next quote"
          className="bookshelf-quote-dock__edge-control absolute right-10 top-1/2 z-10 -translate-y-1/2 sm:right-12"
        >
          <Icon name="chevron-right" className="h-3.5 w-3.5" />
        </button>
      </>
    )}
  </>
);

export default QuoteDockControls;
