import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Card from '@/components/common/Card';
import useMediaQuery from '@/hooks/useMediaQuery';
import type { TimelineItem } from '@/types/timeline';
import { getCurrentYearMonth } from '../utils';
import './timeline.css';
import TimelineChart from './TimelineChart';
import TimelineDetailPanel from './TimelineDetailPanel';
import { buildTimelineMetrics } from './timelineLayout';
import useTimelineChartWidth from './useTimelineChartWidth';

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollDetailRef = useRef(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const chartWidthPx = useTimelineChartWidth(chartRef);

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
    () => sorted.find((item) => item.id === activeId) ?? null,
    [activeId, sorted],
  );

  const currentYearMonth = useMemo(() => getCurrentYearMonth(), []);
  const timelineMetrics = useMemo(
    () => buildTimelineMetrics(sorted, currentYearMonth),
    [currentYearMonth, sorted],
  );

  useEffect(() => {
    if (!activeItem || !isMobile || !shouldScrollDetailRef.current) {
      return undefined;
    }

    shouldScrollDetailRef.current = false;
    const frame = window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeItem, isMobile]);

  const handleNodeClick = useCallback((id: string) => {
    shouldScrollDetailRef.current = true;
    setActiveId((previous) => (previous === id ? null : id));
  }, []);

  if (!timelineMetrics) {
    return null;
  }

  return (
    <div className="timeline-root">
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

          <TimelineChart
            chartRef={chartRef}
            metrics={timelineMetrics}
            chartWidthPx={chartWidthPx}
            activeId={activeId}
            onSelect={handleNodeClick}
          />

          <TimelineDetailPanel activeItem={activeItem} detailRef={detailRef} />
        </div>
      </Card>
    </div>
  );
};

export default React.memo(Timeline);
