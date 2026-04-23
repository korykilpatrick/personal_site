import { useEffect, useRef } from 'react';

// Scroll-linked motion for the Palimpsest / Echo-plate ghost layer.
//
// Attach the returned ref to the element that should "echo" — this hook
// writes a `--echo-offset` CSS variable on that element, sets a
// `data-scrolling` attribute while scrolling, and (when enabled) keeps a
// gentle sinusoidal idle drift running between scroll events so the
// ghost never goes fully still.
//
// Design choices, documented:
//   - Writes go straight to the DOM via rAF; consumer never rerenders.
//   - Movement is bounded (`MAX_OFFSET_PX`) so aggressive scrolls don't
//     push the ghost off somewhere absurd. Echo, not streak.
//   - After SETTLE_MS without a scroll event we transition from "active
//     scroll motion" into "idle drift mode" — a slow sine wave of a few
//     pixels that reads as breathing.
//   - `prefers-reduced-motion` disables both scroll drift and idle drift.
//     The ghost just sits at rest.

interface UseScrollEchoOptions {
  // Whether to run a slow idle sine-wave drift between scroll events.
  // Defaults to true for Palimpsest / Echo plate; Classic would pass
  // `false` if it ever adopts the hook.
  idleDrift?: boolean;
  // Peak amplitude (px) of idle drift. Default is a small, quiet 2px.
  idleAmplitudePx?: number;
  // Idle drift period in ms. Default 8000 ms — slow enough to feel like
  // a breath, not a pulse.
  idlePeriodMs?: number;
}

const MAX_OFFSET_PX = 22;
const DAMPING = 0.32;
const SETTLE_MS = 280;
const DEFAULT_IDLE_AMPLITUDE_PX = 2;
const DEFAULT_IDLE_PERIOD_MS = 8000;

export default function useScrollEcho<T extends HTMLElement>(
  options: UseScrollEchoOptions = {},
) {
  const ref = useRef<T | null>(null);
  const {
    idleDrift = true,
    idleAmplitudePx = DEFAULT_IDLE_AMPLITUDE_PX,
    idlePeriodMs = DEFAULT_IDLE_PERIOD_MS,
  } = options;

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === 'undefined') {
      return undefined;
    }

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      node.style.setProperty('--echo-offset', '0px');
      return undefined;
    }

    let lastScrollY = window.scrollY;
    let scrollOffset = 0; // offset induced by scroll momentum
    let settleTimeout: number | null = null;
    let scrollRafId: number | null = null;
    let idleRafId: number | null = null;
    let idleStartTime: number | null = null;
    let idleActive = false;

    const writeOffset = (offsetPx: number) => {
      node.style.setProperty('--echo-offset', `${offsetPx.toFixed(2)}px`);
    };

    const scheduleScrollWrite = () => {
      if (scrollRafId == null) {
        scrollRafId = window.requestAnimationFrame(() => {
          writeOffset(scrollOffset);
          scrollRafId = null;
        });
      }
    };

    const stopIdleDrift = () => {
      if (idleRafId != null) {
        window.cancelAnimationFrame(idleRafId);
        idleRafId = null;
      }
      idleStartTime = null;
      idleActive = false;
    };

    const tickIdleDrift = (time: number) => {
      if (idleStartTime == null) {
        idleStartTime = time;
      }
      const elapsed = time - idleStartTime;
      const phase = (elapsed / idlePeriodMs) * 2 * Math.PI;
      writeOffset(Math.sin(phase) * idleAmplitudePx);
      idleRafId = window.requestAnimationFrame(tickIdleDrift);
    };

    const startIdleDrift = () => {
      if (!idleDrift || idleActive) {
        return;
      }
      idleActive = true;
      idleStartTime = null;
      idleRafId = window.requestAnimationFrame(tickIdleDrift);
    };

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;

      stopIdleDrift();
      scrollOffset = Math.max(
        -MAX_OFFSET_PX,
        Math.min(MAX_OFFSET_PX, scrollOffset + delta * DAMPING),
      );
      node.dataset.scrolling = 'true';
      scheduleScrollWrite();

      if (settleTimeout != null) {
        window.clearTimeout(settleTimeout);
      }
      settleTimeout = window.setTimeout(() => {
        scrollOffset = 0;
        delete node.dataset.scrolling;
        // Write 0 immediately; if idle drift is enabled it'll take over.
        writeOffset(0);
        if (scrollRafId != null) {
          window.cancelAnimationFrame(scrollRafId);
          scrollRafId = null;
        }
        settleTimeout = null;
        startIdleDrift();
      }, SETTLE_MS);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Start idle drift on mount so the dock breathes on first paint.
    startIdleDrift();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (settleTimeout != null) {
        window.clearTimeout(settleTimeout);
      }
      if (scrollRafId != null) {
        window.cancelAnimationFrame(scrollRafId);
      }
      stopIdleDrift();
      delete node.dataset.scrolling;
    };
  }, [idleDrift, idleAmplitudePx, idlePeriodMs]);

  return ref;
}
