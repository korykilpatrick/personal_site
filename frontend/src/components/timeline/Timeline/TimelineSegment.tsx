import React from 'react';
import {
  AXIS_HEIGHT,
  BAR_HEIGHT,
  CHART_TOP_PADDING,
  EASING,
  LANE_HEIGHT,
  TYPE_LABELS,
} from './timeline.constants';
import { formatDateRange } from './timelineDate';
import {
  PositionedTimelineItem,
  getHorizontalLabelSizing,
} from './timelineLayout';
import { getAccentStyles } from './timelineTheme';

interface TimelineSegmentProps {
  item: PositionedTimelineItem;
  activeId: string | null;
  chartHeight: number;
  chartWidthPx: number;
  onSelect: (id: string) => void;
}

const TimelineSegment: React.FC<TimelineSegmentProps> = ({
  item,
  activeId,
  chartHeight,
  chartWidthPx,
  onSelect,
}) => {
  const accent = getAccentStyles(item.accent);
  const isActive = item.id === activeId;
  const top = CHART_TOP_PADDING + item.lane * LANE_HEIGHT;
  const shouldAlignRight = item.leftPct > 74;
  const segmentWidthPx = (item.widthPct / 100) * chartWidthPx;
  const labelSizing = getHorizontalLabelSizing(item.label, segmentWidthPx, item.yearSpan);

  return (
    <>
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
          onClick={() => onSelect(item.id)}
          aria-expanded={isActive}
          aria-controls="timeline-detail-panel"
          aria-label={`${item.label} — ${formatDateRange(item.startDate, item.endDate, item.ongoing)}. ${
            isActive ? 'Click to collapse.' : 'Click to expand.'
          }`}
          className="flex h-full w-full items-center overflow-visible rounded-[16px] border text-left transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
    </>
  );
};

export default TimelineSegment;
