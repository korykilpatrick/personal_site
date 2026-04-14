import { act, renderHook } from '@testing-library/react';
import useQuoteDockController from './useQuoteDockController';

describe('useQuoteDockController', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  it('auto-advances when multiple quotes are available', () => {
    const { result } = renderHook(() =>
      useQuoteDockController({
        quoteCount: 3,
        getPreviewText: () => 'A short quote',
        loading: false,
        hasError: false,
      }),
    );

    expect(result.current.currentIndex).toBe(0);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it('pauses auto-advance while expanded', () => {
    const { result } = renderHook(() =>
      useQuoteDockController({
        quoteCount: 3,
        getPreviewText: () => 'A short quote',
        loading: false,
        hasError: false,
      }),
    );

    act(() => {
      result.current.handleExpand();
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.currentIndex).toBe(0);
  });
});
