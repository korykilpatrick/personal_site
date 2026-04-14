import type { MutableRefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  BOOKSHELF_DOCK_HEIGHT_CSS_VARIABLE,
  HIDDEN_DOCK_HEIGHT,
  INITIAL_DOCK_HEIGHT,
} from './quoteDock.constants';

interface UseDockReservationOptions {
  isDockHidden: boolean;
  reservationKey: string;
}

export default function useDockReservation({
  isDockHidden,
  reservationKey,
}: UseDockReservationOptions): {
  contentWrapperRef: MutableRefObject<HTMLDivElement | null>;
  dockHeight: number;
} {
  const [dockHeight, setDockHeight] = useState(INITIAL_DOCK_HEIGHT);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (isDockHidden) {
      return undefined;
    }

    const contentWrapper = contentWrapperRef.current;
    if (!contentWrapper) {
      return undefined;
    }

    const syncHeight = () => {
      const nextHeight = Math.ceil(contentWrapper.getBoundingClientRect().height);
      if (Number.isFinite(nextHeight) && nextHeight > 0) {
        setDockHeight(nextHeight);
      }
    };

    syncHeight();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncHeight);
      return () => {
        window.removeEventListener('resize', syncHeight);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      syncHeight();
    });

    resizeObserver.observe(contentWrapper);
    window.addEventListener('resize', syncHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncHeight);
    };
  }, [isDockHidden, reservationKey]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const reservedHeight = isDockHidden ? HIDDEN_DOCK_HEIGHT : dockHeight;
    document.documentElement.style.setProperty(
      BOOKSHELF_DOCK_HEIGHT_CSS_VARIABLE,
      `${reservedHeight}px`,
    );
  }, [dockHeight, isDockHidden]);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.removeProperty(BOOKSHELF_DOCK_HEIGHT_CSS_VARIABLE);
      }
    };
  }, []);

  return {
    contentWrapperRef,
    dockHeight,
  };
}
