const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export interface YearMonth {
  year: number;
  month: number;
}

export function parseYearMonth(date: string): YearMonth {
  const [year, month] = date.split('-');
  return { year: parseInt(year, 10), month: parseInt(month, 10) };
}

export function toMonthIndex(date: string): number {
  const { year, month } = parseYearMonth(date);
  return year * 12 + (month - 1);
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats a date range for display.
 * "2025-01" → "Jan 2025"
 * "2025-01", "2025-03" → "Jan–Mar 2025"
 * "2020-09", "2024-01" → "Sep 2020–Jan 2024"
 * "2025-04", undefined, true → "Apr 2025–Present"
 */
export function formatDateRange(
  startDate: string,
  endDate?: string,
  ongoing?: boolean,
): string {
  const start = parseYearMonth(startDate);
  const startFormatted = `${MONTH_NAMES[start.month - 1]} ${start.year}`;

  if (ongoing) return `${startFormatted}–Present`;
  if (!endDate) return startFormatted;

  const end = parseYearMonth(endDate);
  const endFormatted = `${MONTH_NAMES[end.month - 1]} ${end.year}`;

  if (start.year === end.year) {
    return `${MONTH_NAMES[start.month - 1]}–${endFormatted}`;
  }

  return `${startFormatted}–${endFormatted}`;
}
