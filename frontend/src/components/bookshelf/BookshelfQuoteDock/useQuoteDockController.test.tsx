import { act, renderHook } from '@testing-library/react';
import useQuoteDockController from './useQuoteDockController';

describe('useQuoteDockController', () => {
  it('advances to the next quote when requested', () => {
    const { result } = renderHook(() => useQuoteDockController({ quoteCount: 3 }));

    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.advanceToNext();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it('marks auto-advance as paused while expanded', () => {
    const { result } = renderHook(() => useQuoteDockController({ quoteCount: 3 }));

    expect(result.current.isAutoAdvancePaused).toBe(false);

    act(() => {
      result.current.handleExpand();
    });

    expect(result.current.isAutoAdvancePaused).toBe(true);
  });
});
