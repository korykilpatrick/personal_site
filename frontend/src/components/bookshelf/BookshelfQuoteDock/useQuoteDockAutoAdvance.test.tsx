import { act, renderHook } from '@testing-library/react';
import useQuoteDockAutoAdvance from './useQuoteDockAutoAdvance';

describe('useQuoteDockAutoAdvance', () => {
  let setTimeoutSpy: jest.SpiedFunction<typeof window.setTimeout>;

  beforeEach(() => {
    jest.useFakeTimers();
    setTimeoutSpy = jest.spyOn(window, 'setTimeout');
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    setTimeoutSpy.mockRestore();
    jest.useRealTimers();
  });

  it('schedules auto-advance from the rendered preview text and does not reschedule on a parent rerender', () => {
    const onAdvance = jest.fn();
    const props = {
      currentIndex: 0,
      quoteCount: 2,
      previewText: 'Short visible preview',
      loading: false,
      hasError: false,
      isPaused: false,
      onAdvance,
    };

    const { rerender } = renderHook(useQuoteDockAutoAdvance, {
      initialProps: props,
    });

    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 18000);

    rerender(props);

    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(onAdvance).not.toHaveBeenCalled();
  });
});
