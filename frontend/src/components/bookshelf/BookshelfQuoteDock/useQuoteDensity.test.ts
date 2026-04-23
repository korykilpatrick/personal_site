import useQuoteDensity, { classifyQuoteDensity } from './useQuoteDensity';
import { renderHook } from '@testing-library/react';

describe('classifyQuoteDensity', () => {
  it('returns "light" for short quotes', () => {
    expect(classifyQuoteDensity('A short one.')).toBe('light');
    expect(classifyQuoteDensity('Fewer than eighty characters in this one.')).toBe('light');
  });

  it('returns "medium" for mid-length quotes', () => {
    const text = 'A'.repeat(120);
    expect(classifyQuoteDensity(text)).toBe('medium');
  });

  it('returns "dense" for long passages', () => {
    const text = 'A'.repeat(300);
    expect(classifyQuoteDensity(text)).toBe('dense');
  });

  it('treats empty text as "light"', () => {
    expect(classifyQuoteDensity('')).toBe('light');
  });

  it('boundary: 79 chars = light, 80 chars = medium', () => {
    expect(classifyQuoteDensity('A'.repeat(79))).toBe('light');
    expect(classifyQuoteDensity('A'.repeat(80))).toBe('medium');
  });

  it('boundary: 239 chars = medium, 240 chars = dense', () => {
    expect(classifyQuoteDensity('A'.repeat(239))).toBe('medium');
    expect(classifyQuoteDensity('A'.repeat(240))).toBe('dense');
  });
});

describe('useQuoteDensity', () => {
  it('returns the same classification as the pure function', () => {
    const { result } = renderHook(() => useQuoteDensity('Short one.'));
    expect(result.current).toBe('light');
  });
});
