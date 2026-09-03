import { formatBookReadDate, formatPublicationYear } from '../dateUtils';

describe('formatBookReadDate', () => {
  it('formats a Goodreads calendar date without shifting its day', () => {
    expect(formatBookReadDate('2025-11-10')).toEqual({
      compact: 'NOV 10 ’25',
      long: 'November 10, 2025',
      iso: '2025-11-10',
    });
  });

  it('accepts valid leap days', () => {
    expect(formatBookReadDate('2024-02-29')).toEqual({
      compact: 'FEB 29 ’24',
      long: 'February 29, 2024',
      iso: '2024-02-29',
    });
    expect(formatBookReadDate('2000-02-29')).toEqual({
      compact: 'FEB 29 ’00',
      long: 'February 29, 2000',
      iso: '2000-02-29',
    });
  });

  it.each([
    null,
    undefined,
    '',
    ' ',
    '2025-1-10',
    '2025-01-1',
    '11/10/2025',
    '2025-11-10T00:00:00Z',
    '0000-01-01',
    '2025-00-01',
    '2025-13-01',
    '2025-11-00',
    '2025-04-31',
    '2025-02-29',
    '1900-02-29',
  ])('rejects missing or invalid date-only input %p', (value) => {
    expect(formatBookReadDate(value)).toBeNull();
  });
});

describe('formatPublicationYear', () => {
  it.each([
    ['1992', '1992'],
    ['180', '180'],
    ['-350', '350 BCE'],
    ['-800', '800 BCE'],
  ])('formats publication year %s as %s', (value, expected) => {
    expect(formatPublicationYear(value)).toBe(expected);
  });

  it.each([null, undefined, '', '0', '-0', 'not-a-year', '1992.5', '1992-01-01'])(
    'rejects missing, zero, or invalid publication year %p',
    (value) => {
      expect(formatPublicationYear(value)).toBeNull();
    },
  );
});
