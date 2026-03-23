import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Card from '@/components/common/Card';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import { MediaItem, TimelineAccent, TimelineItem } from '@/types/timeline';
import { formatDateRange, getCurrentYearMonth } from './utils';

interface TimelineProps {
  items: TimelineItem[];
}

const EASING = 'cubic-bezier(0.19, 1, 0.22, 1)';
const LANE_HEIGHT = 80;
const BAR_HEIGHT = 34;
const CHART_TOP_PADDING = 22;
const AXIS_HEIGHT = 56;

type AccentStyles = {
  border: string;
  text: string;
  mutedText: string;
  background: string;
  activeBackground: string;
  shadow: string;
  glow: string;
  surface: string;
};

type PositionedItem = TimelineItem & {
  lane: number;
  leftPct: number;
  widthPct: number;
  centerPct: number;
  isMilestone: boolean;
  yearSpan: number;
};

const TYPE_LABELS: Record<TimelineItem['type'], string> = {
  career: 'Career',
  inflection: 'Turning point',
  accomplishment: 'Accomplishment',
  project: 'Project',
};

const ACCENT_STYLES: Record<TimelineAccent, AccentStyles> = {
  crimson: {
    border: 'rgba(154, 47, 47, 0.42)',
    text: '#782828',
    mutedText: '#914040',
    background:
      'linear-gradient(135deg, rgba(213, 88, 88, 0.92), rgba(167, 46, 52, 0.94))',
    activeBackground:
      'linear-gradient(135deg, rgba(176, 48, 56, 0.98), rgba(132, 31, 36, 1))',
    shadow: '0 12px 24px rgba(140, 42, 49, 0.16)',
    glow: '0 16px 32px rgba(154, 47, 47, 0.24)',
    surface: 'rgba(213, 88, 88, 0.1)',
  },
  cobalt: {
    border: 'rgba(49, 91, 156, 0.34)',
    text: '#1f4c86',
    mutedText: '#39608f',
    background:
      'linear-gradient(135deg, rgba(96, 146, 222, 0.94), rgba(47, 96, 170, 0.94))',
    activeBackground:
      'linear-gradient(135deg, rgba(45, 99, 175, 0.98), rgba(24, 63, 124, 1))',
    shadow: '0 12px 24px rgba(47, 96, 170, 0.16)',
    glow: '0 16px 32px rgba(47, 96, 170, 0.24)',
    surface: 'rgba(96, 146, 222, 0.1)',
  },
  violet: {
    border: 'rgba(98, 73, 171, 0.34)',
    text: '#5b4696',
    mutedText: '#725ea8',
    background:
      'linear-gradient(135deg, rgba(158, 128, 230, 0.92), rgba(99, 73, 171, 0.94))',
    activeBackground:
      'linear-gradient(135deg, rgba(109, 79, 189, 0.98), rgba(73, 51, 132, 1))',
    shadow: '0 12px 24px rgba(98, 73, 171, 0.16)',
    glow: '0 16px 32px rgba(98, 73, 171, 0.24)',
    surface: 'rgba(158, 128, 230, 0.1)',
  },
  emerald: {
    border: 'rgba(31, 120, 98, 0.34)',
    text: '#206d5b',
    mutedText: '#3b7e70',
    background:
      'linear-gradient(135deg, rgba(88, 194, 157, 0.94), rgba(31, 120, 98, 0.94))',
    activeBackground:
      'linear-gradient(135deg, rgba(27, 112, 91, 0.98), rgba(18, 77, 63, 1))',
    shadow: '0 12px 24px rgba(31, 120, 98, 0.16)',
    glow: '0 16px 32px rgba(31, 120, 98, 0.24)',
    surface: 'rgba(88, 194, 157, 0.1)',
  },
  amber: {
    border: 'rgba(168, 118, 32, 0.34)',
    text: '#8b5d12',
    mutedText: '#9b701f',
    background:
      'linear-gradient(135deg, rgba(241, 193, 84, 0.94), rgba(196, 135, 21, 0.94))',
    activeBackground:
      'linear-gradient(135deg, rgba(196, 135, 21, 0.98), rgba(142, 96, 13, 1))',
    shadow: '0 12px 24px rgba(196, 135, 21, 0.16)',
    glow: '0 16px 32px rgba(196, 135, 21, 0.24)',
    surface: 'rgba(241, 193, 84, 0.12)',
  },
  slate: {
    border: 'rgba(80, 99, 122, 0.32)',
    text: '#405065',
    mutedText: '#5f6d7e',
    background:
      'linear-gradient(135deg, rgba(152, 169, 188, 0.94), rgba(88, 105, 127, 0.96))',
    activeBackground:
      'linear-gradient(135deg, rgba(80, 99, 122, 0.98), rgba(44, 56, 73, 1))',
    shadow: '0 12px 24px rgba(80, 99, 122, 0.14)',
    glow: '0 16px 32px rgba(80, 99, 122, 0.2)',
    surface: 'rgba(152, 169, 188, 0.12)',
  },
};

function getAccentStyles(accent?: TimelineAccent): AccentStyles {
  return ACCENT_STYLES[accent || 'slate'];
}

function resolveEndDate(item: TimelineItem, currentYearMonth: string): string {
  if (item.ongoing) return currentYearMonth;
  return item.endDate || item.startDate;
}

function getYear(date: string): number {
  return parseInt(date.slice(0, 4), 10);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type LabelSizing = {
  fontPx: number;
  letterSpacingEm: number;
  paddingPx: number;
};

let labelMeasureContext: CanvasRenderingContext2D | null = null;

function getLabelMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (labelMeasureContext) return labelMeasureContext;

  labelMeasureContext = document.createElement('canvas').getContext('2d');
  return labelMeasureContext;
}

function getHorizontalLabelSizing(label: string, segmentWidthPx: number, yearSpan: number): LabelSizing {
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

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollDetailRef = useRef(false);
  const [chartWidthPx, setChartWidthPx] = useState(720);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.order - b.order),
    [items],
  );

  const defaultActiveId = useMemo(
    () =>
      sorted.find((item) => item.featured)?.id ||
      sorted.find((item) => item.ongoing)?.id ||
      sorted[0]?.id ||
      null,
    [sorted],
  );

  const [activeId, setActiveId] = useState<string | null>(defaultActiveId);

  useEffect(() => {
    if (!sorted.length) {
      setActiveId(null);
      return;
    }

    setActiveId((current) =>
      current && sorted.some((item) => item.id === current) ? current : defaultActiveId,
    );
  }, [defaultActiveId, sorted]);

  const activeItem = useMemo(
    () => sorted.find((i) => i.id === activeId) ?? null,
    [sorted, activeId],
  );

  const currentYearMonth = useMemo(() => getCurrentYearMonth(), []);

  const timelineMetrics = useMemo(() => {
    if (!sorted.length) return null;

    const firstYear = Math.min(...sorted.map((item) => getYear(item.startDate)));
    const lastYear = Math.max(
      ...sorted.map((item) => getYear(resolveEndDate(item, currentYearMonth))),
    );
    const totalYears = lastYear - firstYear + 1;
    const laneEnds: number[] = [];

    const positioned = [...sorted]
      .sort((a, b) => {
        const startDiff = getYear(a.startDate) - getYear(b.startDate);
        if (startDiff !== 0) return startDiff;
        return a.order - b.order;
      })
      .map<PositionedItem>((item) => {
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
  }, [currentYearMonth, sorted]);

  useEffect(() => {
    if (!activeItem) return;
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    if (!shouldScrollDetailRef.current) return;

    shouldScrollDetailRef.current = false;
    const frame = window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeItem]);

  useEffect(() => {
    const node = chartRef.current;
    if (!node) return;

    const updateWidth = () => {
      const nextWidth = node.getBoundingClientRect().width;
      if (nextWidth > 0) {
        setChartWidthPx(nextWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => updateWidth());
    resizeObserver.observe(node);

    let cancelled = false;

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        if (!cancelled) updateWidth();
      });
    }

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, []);

  const handleNodeClick = useCallback(
    (id: string) => {
      shouldScrollDetailRef.current = true;
      setActiveId((prev) => (prev === id ? null : id));
    },
    [],
  );

  if (!timelineMetrics) return null;

  const chartHeight =
    CHART_TOP_PADDING + timelineMetrics.laneCount * LANE_HEIGHT + AXIS_HEIGHT + 28;
  const years = Array.from(
    { length: timelineMetrics.lastYear - timelineMetrics.firstYear + 1 },
    (_, index) => timelineMetrics.firstYear + index,
  );

  return (
    <div className="timeline-root">
      <style>{`
        .timeline-detail-panel {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 680ms ${EASING};
        }
        .timeline-detail-panel--open {
          grid-template-rows: 1fr;
        }
        .timeline-detail-panel__inner {
          overflow: hidden;
        }

        /* ---- Detail content entrance ---- */
        @keyframes timelineDetailIn {
          from {
            opacity: 0;
            transform: translateY(14px);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        .timeline-detail-content {
          opacity: 0;
          animation: timelineDetailIn 800ms 80ms ${EASING} both;
        }
      `}</style>

      <Card padding="lg" className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_20%_80%,rgba(63,127,216,0.06),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(21,38,63,0.05),transparent_35%)]"
        />

        <div className="relative space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="site-eyebrow mb-3">The arc so far</p>
              <h2 className="mb-3 text-[2rem] sm:text-[2.4rem]">A linear view of what overlapped when.</h2>
              <p className="mb-0">
                The whole 2008 through 2026 range sits on one axis. Overlaps stack into separate
                lanes, so you can pick any year and see what was in motion at once.
              </p>
            </div>
            <p className="site-meta mb-0">Desktop fits the full range. On smaller screens, swipe sideways.</p>
          </div>

          <div className="site-card-soft overflow-hidden rounded-[24px] border border-[rgba(21,38,63,0.1)] p-4 sm:p-5">
            <div
              className="overflow-x-auto pb-3 md:overflow-visible md:pb-0"
              role="region"
              aria-label="Linear timeline showing overlapping segments across years"
            >
              <div
                ref={chartRef}
                className="relative w-full min-w-[720px] md:min-w-0"
                style={{
                  height: chartHeight,
                }}
              >
                {years.map((year, index) => (
                  <React.Fragment key={year}>
                    <div
                      aria-hidden="true"
                      className={`absolute top-0 rounded-[18px] ${
                        index % 2 === 0 ? 'bg-white/28' : 'bg-white/12'
                      }`}
                      style={{
                        left: `${index * timelineMetrics.cellPct}%`,
                        width: `${timelineMetrics.cellPct}%`,
                        height: chartHeight - AXIS_HEIGHT + 4,
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute top-0 w-px bg-[rgba(21,38,63,0.08)]"
                      style={{
                        left: `${index * timelineMetrics.cellPct}%`,
                        height: chartHeight - AXIS_HEIGHT + 4,
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute bottom-[3.15rem] h-px bg-[rgba(21,38,63,0.12)]"
                      style={{
                        left: `${index * timelineMetrics.cellPct}%`,
                        width: `${timelineMetrics.cellPct}%`,
                      }}
                    />
                    <div
                      className="absolute bottom-0 flex flex-col gap-1"
                      style={{
                        left: `${index * timelineMetrics.cellPct}%`,
                        width: `${timelineMetrics.cellPct}%`,
                      }}
                    >
                      <span className="text-center font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-primary sm:text-[0.72rem] md:text-[0.66rem] lg:text-[0.72rem]">
                        {year}
                      </span>
                    </div>
                  </React.Fragment>
                ))}

                <div
                  aria-hidden="true"
                  className="absolute top-0 w-px bg-[rgba(21,38,63,0.08)]"
                  style={{
                    left: '100%',
                    height: chartHeight - AXIS_HEIGHT + 4,
                  }}
                />

                {timelineMetrics.positioned.map((item) => {
                  const accent = getAccentStyles(item.accent);
                  const isActive = item.id === activeId;
                  const top = CHART_TOP_PADDING + item.lane * LANE_HEIGHT;
                  const shouldAlignRight = item.leftPct > 74;
                  const segmentWidthPx = (item.widthPct / 100) * chartWidthPx;
                  const labelSizing = getHorizontalLabelSizing(
                    item.label,
                    segmentWidthPx,
                    item.yearSpan,
                  );

                  return (
                    <React.Fragment key={item.id}>
                      {item.isMilestone && (
                        <>
                          <div
                            aria-hidden="true"
                            className="absolute w-px bg-[rgba(21,38,63,0.16)]"
                            style={{
                              left: `${item.centerPct}%`,
                              top: top + BAR_HEIGHT,
                              height: chartHeight - AXIS_HEIGHT - top - BAR_HEIGHT - 10,
                            }}
                          />
                          <div
                            aria-hidden="true"
                            className="absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-white shadow-[0_0_0_4px_rgba(255,255,255,0.38)]"
                            style={{
                              left: `${item.centerPct}%`,
                              top: chartHeight - AXIS_HEIGHT - 5,
                              background: accent.activeBackground,
                            }}
                          />
                        </>
                      )}

                      <div
                        className="group absolute"
                        style={{
                          top,
                          left: `${item.leftPct}%`,
                          width: `${item.widthPct}%`,
                          minWidth: item.isMilestone ? '4.5rem' : undefined,
                          height: BAR_HEIGHT,
                        }}
                      >
                        <div
                          aria-hidden="true"
                          className={`pointer-events-none absolute -top-3 z-20 w-[220px] -translate-y-full transition duration-300 ${
                            isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                          }`}
                          style={shouldAlignRight ? { right: 0 } : { left: 0 }}
                        >
                          <div className="site-card-soft rounded-[16px] border border-[rgba(21,38,63,0.12)] px-3.5 py-3 shadow-[0_14px_28px_rgba(21,38,63,0.12)]">
                            <p
                              className="mb-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
                              style={{ color: accent.text }}
                            >
                              {TYPE_LABELS[item.type]}
                            </p>
                            <p className="mb-0 text-[0.82rem] leading-[1.55]" style={{ color: accent.mutedText }}>
                              {item.summary}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleNodeClick(item.id)}
                          aria-expanded={isActive}
                          aria-controls="timeline-detail-panel"
                          aria-label={`${item.label} — ${formatDateRange(item.startDate, item.endDate, item.ongoing)}. ${
                            isActive ? 'Click to collapse.' : 'Click to expand.'
                          }`}
                          className={`flex h-full w-full overflow-visible rounded-[16px] border text-left transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            'items-center'
                          }`}
                          style={{
                            borderColor: accent.border,
                            background: isActive ? accent.activeBackground : accent.background,
                            boxShadow: isActive ? accent.glow : accent.shadow,
                            paddingInline: `${labelSizing.paddingPx}px`,
                            transitionTimingFunction: EASING,
                          }}
                        >
                          <span
                            className="block whitespace-nowrap font-mono font-semibold uppercase text-white"
                            style={{
                              fontSize: `${labelSizing.fontPx}px`,
                              letterSpacing: `${labelSizing.letterSpacingEm}em`,
                            }}
                          >
                            {item.label}
                          </span>
                        </button>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            id="timeline-detail-panel"
            ref={detailRef}
            className={`timeline-detail-panel mt-2 ${
              activeItem ? 'timeline-detail-panel--open' : ''
            }`}
            aria-live="polite"
          >
            <div className="timeline-detail-panel__inner">
              {activeItem && (
                <div
                  key={activeItem.id}
                  className="timeline-detail-content px-2 pb-1 pt-4 md:px-6"
                >
                  <div className="site-card-soft rounded-[20px] px-5 py-5 sm:px-7 sm:py-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
                      <div className="min-w-0 flex-1">
                        <div className="mb-4 flex flex-wrap items-center gap-2.5">
                          <span
                            className="inline-flex rounded-full border px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em]"
                            style={{
                              color: getAccentStyles(activeItem.accent).text,
                              borderColor: getAccentStyles(activeItem.accent).border,
                              background: getAccentStyles(activeItem.accent).surface,
                            }}
                          >
                            {TYPE_LABELS[activeItem.type]}
                          </span>
                        </div>

                        <h3 className="mb-2 text-[1.2rem] font-semibold leading-[1.2] text-primary sm:text-[1.35rem]">
                          {activeItem.label}
                        </h3>

                        {activeItem.narrative && (
                          <div className="text-[0.94rem] leading-[1.72] text-textSecondary">
                            <MarkdownRenderer>{activeItem.narrative}</MarkdownRenderer>
                          </div>
                        )}

                        {activeItem.links && activeItem.links.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {activeItem.links.map((link) => (
                              <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="site-link-chip"
                              >
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {activeItem.media && activeItem.media.length > 0 && (
                        <div className="flex flex-shrink-0 flex-col gap-3 sm:w-[240px]">
                          {activeItem.media.map((m, idx) => (
                            <MediaRenderer key={idx} media={m} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ---- Media renderer ---- */

const MediaRenderer: React.FC<{ media: MediaItem }> = ({ media }) => {
  if (media.type === 'image') {
    return (
      <figure className="mb-0">
        <img
          src={media.url}
          alt={media.alt || ''}
          className="w-full rounded-[14px] object-cover shadow-[0_8px_20px_rgba(21,38,63,0.10)]"
        />
        {media.caption && (
          <figcaption className="mt-1.5 text-center font-mono text-[0.6rem] uppercase tracking-[0.12em] text-textTertiary">
            {media.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (media.type === 'embed' && media.embedType === 'youtube') {
    const videoId = extractYouTubeId(media.url);
    if (!videoId) return null;
    return (
      <div className="relative overflow-hidden rounded-[14px] pb-[56.25%] shadow-[0_8px_20px_rgba(21,38,63,0.10)]">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={media.alt || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (media.type === 'link') {
    return (
      <a
        href={media.url}
        target="_blank"
        rel="noopener noreferrer"
        className="site-link-chip"
      >
        {media.alt || media.url}
      </a>
    );
  }

  return null;
};

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

export default React.memo(Timeline);
