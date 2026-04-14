import type { MutableRefObject } from 'react';
import { useEffect, useState } from 'react';

export default function useTimelineChartWidth(
  chartRef: MutableRefObject<HTMLDivElement | null>,
): number {
  const [chartWidthPx, setChartWidthPx] = useState(720);

  useEffect(() => {
    const node = chartRef.current;
    if (!node) {
      return undefined;
    }

    const updateWidth = () => {
      const nextWidth = node.getBoundingClientRect().width;
      if (nextWidth > 0) {
        setChartWidthPx(nextWidth);
      }
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => {
        cancelled = true;
        window.removeEventListener('resize', updateWidth);
      };
    }

    const resizeObserver = new ResizeObserver(() => updateWidth());
    resizeObserver.observe(node);

    let cancelled = false;

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        if (!cancelled) {
          updateWidth();
        }
      });
    }

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [chartRef]);

  return chartWidthPx;
}
