/**
 * Formats a date string to a human-readable format
 * @param dateString - Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export interface FormattedBookReadDate {
  compact: string;
  long: string;
  iso: string;
}

/**
 * Formats Goodreads' date-only value without passing it through the local
 * timezone. Parsing `YYYY-MM-DD` with Date can otherwise display the previous
 * day for readers west of UTC.
 */
export const formatBookReadDate = (
  value: string | null | undefined,
): FormattedBookReadDate | null => {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year === 0 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    return null;
  }

  const monthName = MONTH_NAMES[month - 1];
  const shortYear = match[1].slice(-2);

  return {
    compact: `${monthName.slice(0, 3).toUpperCase()} ${day} ’${shortYear}`,
    long: `${monthName} ${day}, ${year}`,
    iso: value,
  };
};

/** Formats Goodreads' integer publication year, including historical BCE data. */
export const formatPublicationYear = (value: string | null | undefined): string | null => {
  if (!value || !/^-?\d+$/.test(value.trim())) return null;

  const year = Number(value);
  if (!Number.isSafeInteger(year) || year === 0) return null;

  return year < 0 ? `${Math.abs(year)} BCE` : String(year);
};

/**
 * Calculates relative time (e.g., "2 days ago")
 * @param dateString - Date string to calculate relative time from
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return dateString;
  }
};
