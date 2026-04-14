import { useEffect, useRef } from 'react';
import { calculateDisplayTime } from '@/utils/quoteUtils';
import {
  AUTO_ADVANCE_MAX_MS,
  AUTO_ADVANCE_MIN_MS,
} from './quoteDock.constants';

interface UseQuoteDockAutoAdvanceOptions {
  currentIndex: number;
  quoteCount: number;
  previewText: string;
  loading: boolean;
  hasError: boolean;
  isPaused: boolean;
  onAdvance: () => void;
}

export default function useQuoteDockAutoAdvance({
  currentIndex,
  quoteCount,
  previewText,
  loading,
  hasError,
  isPaused,
  onAdvance,
}: UseQuoteDockAutoAdvanceOptions): void {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (loading || hasError || quoteCount < 2 || isPaused) {
      return undefined;
    }

    const displayTime = calculateDisplayTime(previewText, {
      minDisplayMs: AUTO_ADVANCE_MIN_MS,
      maxDisplayMs: AUTO_ADVANCE_MAX_MS,
    });

    timerRef.current = window.setTimeout(() => {
      onAdvance();
    }, displayTime);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, hasError, isPaused, loading, onAdvance, previewText, quoteCount]);
}
