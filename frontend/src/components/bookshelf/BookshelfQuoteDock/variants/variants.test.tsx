import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Quote } from 'types';
import TornPageDock from './TornPageDock';
import type { DockVariantProps } from './variantProps';

// Smoke-test the TornPage dock (currently the only variant). The
// only visible control on the paper is a single × close button in
// the top-right corner; navigation is keyboard-only (← / →) and
// auto-advance.

const SAMPLE_QUOTE: Quote = {
  id: 1,
  text: 'A sample quote body used in the variant smoke tests.',
  author: 'Author',
  source: 'Source',
  active: true,
};

function buildProps(overrides?: Partial<DockVariantProps>): DockVariantProps {
  const noop = () => undefined;
  const focusNoop = () => undefined;
  return {
    currentIndex: 0,
    currentQuote: SAMPLE_QUOTE,
    quotesLength: 3,
    isExpanded: false,
    isDesktopPreview: true,
    dockHeight: 140,
    previewText: 'A sample quote body used in the variant smoke tests.',
    previewMinHeight: 48,
    canExpand: false,
    contentWrapperRef: { current: null },
    expandedBodyRef: { current: null },
    onPrevious: noop,
    onNext: noop,
    onExpand: noop,
    onCollapse: noop,
    onHideDock: noop,
    onFocusCapture: focusNoop,
    onBlurCapture: focusNoop,
    previewMeasureRef: { current: null },
    ...overrides,
  };
}

describe('TornPageDock', () => {
  it('renders the current preview, the close × button, and prev/next side-peeks', () => {
    render(<TornPageDock {...buildProps()} />);

    expect(screen.getAllByText(/A sample quote body/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: 'Hide quote dock' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Previous quote' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Next quote' }),
    ).toBeInTheDocument();
  });

  it('does not render a numeric page index — the side-peeks carry the nav affordance', () => {
    render(<TornPageDock {...buildProps({ quotesLength: 40 })} />);
    expect(screen.queryByText(/\d+\s*\/\s*\d+/)).toBeNull();
  });

  it('hides the side-peeks when there is only one quote; close stays', () => {
    render(<TornPageDock {...buildProps({ quotesLength: 1 })} />);
    expect(screen.queryByRole('button', { name: 'Previous quote' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next quote' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Hide quote dock' }),
    ).toBeInTheDocument();
  });

  it('exposes both clean and torn clip-path polygons as CSS variables on the plate', () => {
    const { container } = render(<TornPageDock {...buildProps()} />);
    const plate = container.querySelector('.bookshelf-dock-cp-plate');
    expect(plate).not.toBeNull();
    const style = (plate as HTMLElement).getAttribute('style') ?? '';
    expect(style).toContain('--plate-clip-clean');
    expect(style).toContain('--plate-clip-torn');
    expect(style).toContain('polygon(');
  });
});
