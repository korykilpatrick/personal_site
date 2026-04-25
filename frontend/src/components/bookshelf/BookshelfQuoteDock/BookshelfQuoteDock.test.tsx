import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import BookshelfQuoteDock from '.';
import useActiveQuotes from '@/hooks/useActiveQuotes';
import useMediaQuery from '@/hooks/useMediaQuery';
import useDockReservation from './useDockReservation';
import usePreviewFit from './usePreviewFit';

jest.mock('@/hooks/useActiveQuotes');
jest.mock('@/hooks/useMediaQuery');
jest.mock('./useDockReservation');
jest.mock('./usePreviewFit');

const mockUseActiveQuotes = jest.mocked(useActiveQuotes);
const mockUseMediaQuery = jest.mocked(useMediaQuery);
const mockUseDockReservation = jest.mocked(useDockReservation);
const mockUsePreviewFit = jest.mocked(usePreviewFit);

describe('BookshelfQuoteDock', () => {
  const longQuote = Array.from({ length: 40 }, (_, index) => `word${index}`).join(' ');

  beforeEach(() => {
    jest.useFakeTimers();

    mockUseMediaQuery.mockReturnValue(true);
    mockUseActiveQuotes.mockReturnValue({
      quotes: [
        { id: 1, text: longQuote, author: 'Author One', source: 'Source One', active: true },
        {
          id: 2,
          text: 'Second quote body',
          author: 'Author Two',
          source: 'Source Two',
          active: true,
        },
      ],
      loading: false,
      error: null,
    });
    mockUseDockReservation.mockReturnValue({
      contentWrapperRef: { current: null },
      dockHeight: 180,
    });
    mockUsePreviewFit.mockImplementation(({ plainText }) => ({
      previewFit:
        plainText === longQuote
          ? {
              text: 'Short visible preview',
              truncated: true,
              minHeight: 48,
            }
          : {
              text: 'Second visible preview',
              truncated: false,
              minHeight: 48,
            },
      previewMeasureRef: { current: null },
    }));
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('renders the current preview and advances via keyboard arrow key', () => {
    render(<BookshelfQuoteDock />);

    // Commonplace variants render a ghost echo of the preview text in
    // addition to the readable plate, so the text may appear twice.
    expect(screen.getAllByText(/Short visible preview/).length).toBeGreaterThan(0);

    // Keyboard ArrowRight is a window-level listener that advances
    // to the next quote. The body uses an AnimatePresence with
    // mode="wait" for most variants, so we advance fake timers
    // past any exit animation before asserting the new quote is
    // mounted.
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getAllByText(/Second visible preview/).length).toBeGreaterThan(0);
  });

  it('closes the dock when the × button is clicked and shows the torn-paper peek', () => {
    render(<BookshelfQuoteDock />);

    expect(screen.getAllByText(/Short visible preview/).length).toBeGreaterThan(0);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Hide quote dock' }));
    });

    expect(screen.getByRole('button', { name: 'Show quote dock' })).toBeInTheDocument();
  });

  it('dismisses the dock when Escape is pressed and shows the torn-paper peek', () => {
    render(<BookshelfQuoteDock />);

    // Dock is visible — the plate's content exists.
    expect(screen.getAllByText(/Short visible preview/).length).toBeGreaterThan(0);

    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    // After Escape, BookshelfQuoteDock renders the torn-paper peek
    // re-open affordance instead of the full dock.
    expect(screen.getByRole('button', { name: 'Show quote dock' })).toBeInTheDocument();
  });
});
