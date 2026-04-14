import { act, renderHook } from '@testing-library/react';
import useTimelineChartWidth from './useTimelineChartWidth';

describe('useTimelineChartWidth', () => {
  const originalResizeObserver = global.ResizeObserver;

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
  });

  it('updates width and cleans up safely without ResizeObserver', () => {
    global.ResizeObserver = undefined as typeof ResizeObserver;

    let width = 720;
    const node = document.createElement('div');
    node.getBoundingClientRect = () =>
      ({
        width,
        height: 0,
        top: 0,
        right: width,
        bottom: 0,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const chartRef = { current: node };
    const { result, unmount } = renderHook(() => useTimelineChartWidth(chartRef));

    expect(result.current).toBe(720);

    act(() => {
      width = 840;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(840);
    expect(() => unmount()).not.toThrow();
  });
});
