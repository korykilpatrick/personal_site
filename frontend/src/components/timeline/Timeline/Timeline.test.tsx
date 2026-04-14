import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import useMediaQuery from '@/hooks/useMediaQuery';
import type { TimelineItem } from '@/types/timeline';
import Timeline from '.';

jest.mock('@/hooks/useMediaQuery');

const mockUseMediaQuery = jest.mocked(useMediaQuery);

const timelineItems: TimelineItem[] = [
  {
    id: 'alpha',
    type: 'career',
    startDate: '2020-01',
    endDate: '2021-01',
    label: 'Alpha',
    summary: 'Alpha summary',
    narrative: 'Alpha narrative',
    order: 1,
  },
  {
    id: 'beta',
    type: 'project',
    startDate: '2021-01',
    endDate: '2022-01',
    label: 'Beta',
    summary: 'Beta summary',
    narrative: 'Beta narrative',
    order: 2,
  },
];

describe('Timeline', () => {
  const scrollIntoView = jest.fn();
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false);
    scrollIntoView.mockReset();
    Element.prototype.scrollIntoView = scrollIntoView;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      font: '',
      measureText: (text: string) => ({ width: text.length * 8 }),
    })) as typeof HTMLCanvasElement.prototype.getContext;
    window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    window.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    jest.resetAllMocks();
  });

  it('only auto-scrolls detail after a mobile selection, not after a breakpoint change', () => {
    const { rerender } = render(<Timeline items={timelineItems} />);

    expect(screen.getByText('Alpha narrative')).toBeInTheDocument();
    expect(scrollIntoView).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Beta/ }));

    expect(screen.getByText('Beta narrative')).toBeInTheDocument();
    expect(scrollIntoView).not.toHaveBeenCalled();

    mockUseMediaQuery.mockReturnValue(true);
    rerender(<Timeline items={[...timelineItems]} />);

    expect(scrollIntoView).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Alpha/ }));

    expect(screen.getByText('Alpha narrative')).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });
});
