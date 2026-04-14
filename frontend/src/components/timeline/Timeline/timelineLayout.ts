import type { TimelineItem } from '@/types/timeline';

export type PositionedTimelineItem = TimelineItem & {
  lane: number;
  leftPct: number;
  widthPct: number;
  centerPct: number;
  isMilestone: boolean;
  yearSpan: number;
};

export interface TimelineMetrics {
  firstYear: number;
  lastYear: number;
  totalYears: number;
  cellPct: number;
  laneCount: number;
  positioned: PositionedTimelineItem[];
}

type LabelSizing = {
  fontPx: number;
  letterSpacingEm: number;
  paddingPx: number;
};

let labelMeasureContext: CanvasRenderingContext2D | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getYear(date: string): number {
  return parseInt(date.slice(0, 4), 10);
}

function resolveEndDate(item: TimelineItem, currentYearMonth: string): string {
  if (item.ongoing) {
    return currentYearMonth;
  }

  return item.endDate || item.startDate;
}

function getLabelMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') {
    return null;
  }

  if (labelMeasureContext) {
    return labelMeasureContext;
  }

  labelMeasureContext = document.createElement('canvas').getContext('2d');
  return labelMeasureContext;
}

export function getHorizontalLabelSizing(
  label: string,
  segmentWidthPx: number,
  yearSpan: number,
): LabelSizing {
  const displayLabel = label.toUpperCase();
  const paddingPx = clamp(segmentWidthPx * 0.045, 1.5, 14);
  const availablePx = Math.max(segmentWidthPx - paddingPx * 2, 4);
  const letterSpacingEm = clamp(
    0.1 - Math.min(yearSpan, 8) * 0.007 - Math.max(label.length - 8, 0) * 0.003,
    0,
    0.085,
  );
  const minFontPx = 2.2;
  const maxFontPx = clamp(8 + yearSpan * 1.05, 9, 16);
  const measureContext = getLabelMeasureContext();

  if (!measureContext) {
    return {
      fontPx: minFontPx,
      letterSpacingEm,
      paddingPx,
    };
  }

  let low = minFontPx;
  let high = maxFontPx;
  let best = minFontPx;

  while (high - low > 0.2) {
    const mid = (low + high) / 2;
    measureContext.font = `600 ${mid}px "IBM Plex Mono", ui-monospace, SFMono-Regular`;

    const measuredWidth =
      measureContext.measureText(displayLabel).width +
      Math.max(displayLabel.length - 1, 0) * letterSpacingEm * mid;

    if (measuredWidth <= availablePx) {
      best = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  return {
    fontPx: best,
    letterSpacingEm,
    paddingPx,
  };
}

export function buildTimelineMetrics(
  items: TimelineItem[],
  currentYearMonth: string,
): TimelineMetrics | null {
  if (!items.length) {
    return null;
  }

  const firstYear = Math.min(...items.map((item) => getYear(item.startDate)));
  const lastYear = Math.max(
    ...items.map((item) => getYear(resolveEndDate(item, currentYearMonth))),
  );
  const totalYears = lastYear - firstYear + 1;
  const laneEnds: number[] = [];

  const positioned = [...items]
    .sort((a, b) => {
      const startDiff = getYear(a.startDate) - getYear(b.startDate);
      if (startDiff !== 0) {
        return startDiff;
      }

      return a.order - b.order;
    })
    .map<PositionedTimelineItem>((item) => {
      const startYear = getYear(item.startDate);
      const endYear = getYear(resolveEndDate(item, currentYearMonth));
      const startOffset = startYear - firstYear;
      const endExclusive = endYear - firstYear + 1;
      const yearSpan = Math.max(1, endExclusive - startOffset);

      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= startOffset);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(endExclusive);
      } else {
        laneEnds[lane] = endExclusive;
      }

      return {
        ...item,
        lane,
        leftPct: (startOffset / totalYears) * 100,
        widthPct: (yearSpan / totalYears) * 100,
        centerPct: ((startOffset + yearSpan / 2) / totalYears) * 100,
        isMilestone: !item.endDate && !item.ongoing,
        yearSpan,
      };
    })
    .sort((a, b) => a.order - b.order);

  return {
    firstYear,
    lastYear,
    totalYears,
    cellPct: 100 / totalYears,
    laneCount: Math.max(1, laneEnds.length),
    positioned,
  };
}
