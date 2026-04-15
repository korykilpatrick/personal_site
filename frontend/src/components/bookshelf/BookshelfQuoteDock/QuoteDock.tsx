import React from 'react';
import type { Quote } from 'types';
import type { MutableRefObject } from 'react';
import QuoteDockContent from './QuoteDockContent';
import QuoteDockControls from './QuoteDockControls';

interface QuoteDockProps {
  currentIndex: number;
  currentQuote: Quote;
  quotesLength: number;
  isExpanded: boolean;
  isDesktopPreview: boolean;
  dockHeight: number;
  previewText: string;
  previewMinHeight: number;
  canExpand: boolean;
  contentWrapperRef: MutableRefObject<HTMLDivElement | null>;
  expandedBodyRef: MutableRefObject<HTMLDivElement | null>;
  onPrevious: () => void;
  onNext: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onHideDock: () => void;
  onFocusCapture: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => void;
  previewMeasureRef: MutableRefObject<HTMLParagraphElement | null>;
}

const QuoteDock: React.FC<QuoteDockProps> = ({
  currentIndex,
  currentQuote,
  quotesLength,
  isExpanded,
  isDesktopPreview,
  dockHeight,
  previewText,
  previewMinHeight,
  canExpand,
  contentWrapperRef,
  expandedBodyRef,
  onPrevious,
  onNext,
  onExpand,
  onCollapse,
  onHideDock,
  onFocusCapture,
  onBlurCapture,
  previewMeasureRef,
}) => (
  <div
    className="group/bookshelf-dock fixed inset-x-0 bottom-0 z-30 overflow-hidden bg-[linear-gradient(to_top,rgba(241,246,252,0.62),rgba(241,246,252,0.4)_34%,rgba(241,246,252,0.16)_62%,rgba(241,246,252,0.02))] shadow-[0_-10px_24px_rgba(12,23,39,0.08)] backdrop-blur-[3px] backdrop-saturate-130 transition-[height,box-shadow,background] duration-[1180ms] ease-[cubic-bezier(0.19,1,0.22,1)] will-change-[height]"
    style={{ height: `${dockHeight}px` }}
    onFocusCapture={onFocusCapture}
    onBlurCapture={onBlurCapture}
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

      <div className="absolute inset-x-0 -top-0.5 z-10 flex justify-center">
        <button
          type="button"
          onClick={onHideDock}
          aria-label="Hide quote dock"
          className="bookshelf-quote-dock__collapse-control bookshelf-quote-dock__collapse-handle"
        >
          <span aria-hidden="true" className="bookshelf-quote-dock__collapse-bar" />
        </button>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <QuoteDockControls
          quoteCount={quotesLength}
          onPrevious={onPrevious}
          onNext={onNext}
        />

        <QuoteDockContent
          currentIndex={currentIndex}
          currentQuote={currentQuote}
          isExpanded={isExpanded}
          isDesktopPreview={isDesktopPreview}
          previewText={previewText}
          previewMinHeight={previewMinHeight}
          canExpand={canExpand}
          expandedBodyRef={expandedBodyRef}
          onExpand={onExpand}
          onCollapse={onCollapse}
        />
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
  </div>
);

export default QuoteDock;
