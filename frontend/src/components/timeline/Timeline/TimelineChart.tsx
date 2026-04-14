import React from 'react';
import type { MutableRefObject } from 'react';
import {
  AXIS_HEIGHT,
  CHART_TOP_PADDING,
  LANE_HEIGHT,
} from './timeline.constants';
import type { TimelineMetrics } from './timelineLayout';
import TimelineSegment from './TimelineSegment';

interface TimelineChartProps {
  chartRef: MutableRefObject<HTMLDivElement | null>;
  metrics: TimelineMetrics;
  chartWidthPx: number;
  activeId: string | null;
  onSelect: (id: string) => void;
}

const TimelineChart: React.FC<TimelineChartProps> = ({
  chartRef,
  metrics,
  chartWidthPx,
  activeId,
  onSelect,
}) => {
  const chartHeight = CHART_TOP_PADDING + metrics.laneCount * LANE_HEIGHT + AXIS_HEIGHT + 28;
  const years = Array.from(
    { length: metrics.lastYear - metrics.firstYear + 1 },
    (_, index) => metrics.firstYear + index,
  );

  return (
    <div className="site-card-soft overflow-hidden rounded-[24px] border border-[rgba(21,38,63,0.1)] p-4 sm:p-5">
      <div
        className="overflow-x-auto pb-3 md:overflow-visible md:pb-0"
        role="region"
        aria-label="Linear timeline showing overlapping segments across years"
      >
        <div
          ref={chartRef}
          className="relative w-full min-w-[720px] md:min-w-0"
          style={{ height: chartHeight }}
        >
          {years.map((year, index) => (
            <React.Fragment key={year}>
              <div
                aria-hidden="true"
                className={`absolute top-0 rounded-[18px] ${
                  index % 2 === 0 ? 'bg-white/28' : 'bg-white/12'
                }`}
                style={{
                  left: `${index * metrics.cellPct}%`,
                  width: `${metrics.cellPct}%`,
                  height: chartHeight - AXIS_HEIGHT + 4,
                }}
              />
              <div
                aria-hidden="true"
                className="absolute top-0 w-px bg-[rgba(21,38,63,0.08)]"
                style={{
                  left: `${index * metrics.cellPct}%`,
                  height: chartHeight - AXIS_HEIGHT + 4,
                }}
              />
              <div
                aria-hidden="true"
                className="absolute bottom-[3.15rem] h-px bg-[rgba(21,38,63,0.12)]"
                style={{
                  left: `${index * metrics.cellPct}%`,
                  width: `${metrics.cellPct}%`,
                }}
              />
              <div
                className="absolute bottom-0 flex flex-col gap-1"
                style={{
                  left: `${index * metrics.cellPct}%`,
                  width: `${metrics.cellPct}%`,
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

          {metrics.positioned.map((item) => (
            <TimelineSegment
              key={item.id}
              item={item}
              activeId={activeId}
              chartHeight={chartHeight}
              chartWidthPx={chartWidthPx}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;
