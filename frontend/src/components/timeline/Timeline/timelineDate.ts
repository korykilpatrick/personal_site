const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface YearMonth {
  year: number;
  month: number;
}

function parseYearMonth(date: string): YearMonth {
  const [year, month] = date.split('-');
  return { year: Number.parseInt(year, 10), month: Number.parseInt(month, 10) };
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatDateRange(
  startDate: string,
  endDate?: string,
  ongoing?: boolean,
): string {
  const start = parseYearMonth(startDate);
  const startFormatted = `${MONTH_NAMES[start.month - 1]} ${start.year}`;

  if (ongoing) {
    return `${startFormatted}–Present`;
  }

  if (!endDate) {
    return startFormatted;
  }

  const end = parseYearMonth(endDate);
  const endFormatted = `${MONTH_NAMES[end.month - 1]} ${end.year}`;

  if (start.year === end.year) {
    return `${MONTH_NAMES[start.month - 1]}–${endFormatted}`;
  }

  return `${startFormatted}–${endFormatted}`;
}
