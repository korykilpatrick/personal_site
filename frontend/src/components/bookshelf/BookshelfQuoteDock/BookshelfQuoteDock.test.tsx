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

  it('renders the current preview and updates when navigating to the next quote', () => {
    render(<BookshelfQuoteDock />);

    expect(screen.getByText(/Short visible preview/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next quote' }));

    expect(screen.getByText(/Second visible preview/)).toBeInTheDocument();
  });

  it('keeps navigation controls inside the centered content rail', () => {
    render(<BookshelfQuoteDock />);

    const previousButton = screen.getByRole('button', { name: 'Previous quote' });
    expect(previousButton.closest('.max-w-5xl')).not.toBeNull();
  });
});
