import { act, renderHook } from '@testing-library/react';
import usePreviousQuote from './usePreviousQuote';

describe('usePreviousQuote', () => {
  it('returns undefined on first render', () => {
    const { result } = renderHook(({ value }) => usePreviousQuote(value), {
      initialProps: { value: 'first' },
    });
    expect(result.current).toBeUndefined();
  });

  it('returns the previous value after the first update', () => {
    const { result, rerender } = renderHook(({ value }) => usePreviousQuote(value), {
      initialProps: { value: 'first' },
    });

    act(() => {
      rerender({ value: 'second' });
    });

    expect(result.current).toBe('first');
  });

  it('tracks successive updates', () => {
    const { result, rerender } = renderHook(({ value }) => usePreviousQuote(value), {
      initialProps: { value: 'a' },
    });

    act(() => { rerender({ value: 'b' }); });
    expect(result.current).toBe('a');

    act(() => { rerender({ value: 'c' }); });
    expect(result.current).toBe('b');

    act(() => { rerender({ value: 'd' }); });
    expect(result.current).toBe('c');
  });

  it('returns the same value when consecutive renders pass the same input', () => {
    const { result, rerender } = renderHook(({ value }) => usePreviousQuote(value), {
      initialProps: { value: 'same' },
    });

    act(() => { rerender({ value: 'same' }); });
    // After the first commit, the ref holds 'same'. A subsequent
    // rerender with the same value returns that same string — which
    // is the correct "last committed value." The consumer treats
    // this as a no-op for the ghost display.
    expect(result.current).toBe('same');
  });
});
