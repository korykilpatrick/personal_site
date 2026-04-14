import React from 'react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import type { Quote } from 'types';
import type { MutableRefObject } from 'react';
import {
  COLLAPSE_LABEL,
  DESKTOP_EXPANDED_BODY_MAX_HEIGHT,
  EXPAND_LABEL,
  MOBILE_EXPANDED_BODY_MAX_HEIGHT,
} from './quoteDock.constants';

interface QuoteDockContentProps {
  currentIndex: number;
  currentQuote: Quote;
  isExpanded: boolean;
  isDesktopPreview: boolean;
  previewText: string;
  previewMinHeight: number;
  canExpand: boolean;
  expandedBodyRef: MutableRefObject<HTMLDivElement | null>;
  onExpand: () => void;
  onCollapse: () => void;
}

const QuoteDockContent: React.FC<QuoteDockContentProps> = ({
  currentIndex,
  currentQuote,
  isExpanded,
  isDesktopPreview,
  previewText,
  previewMinHeight,
  canExpand,
  expandedBodyRef,
  onExpand,
  onCollapse,
}) => (
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
        style={{ minHeight: `${previewMinHeight}px` }}
      >
        <p className="bookshelf-quote-dock__preview mb-0 max-w-[44rem] font-serif text-[0.93rem] leading-[1.5] text-primary sm:text-[0.98rem] sm:leading-[1.54]">
          <span>{`"${previewText}`}</span>
          {canExpand ? (
            <>
              <span aria-hidden="true">...</span>{' '}
              <button
                type="button"
                onClick={onExpand}
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
            onClick={onCollapse}
            className="bookshelf-quote-dock__inline-toggle text-[0.62rem] tracking-[0.18em]"
          >
            {COLLAPSE_LABEL}
          </button>
        )}
      </p>
    )}
  </div>
);

export default QuoteDockContent;
