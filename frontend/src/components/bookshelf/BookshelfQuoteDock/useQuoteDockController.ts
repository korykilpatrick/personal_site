import { useEffect, useRef, useState } from 'react';
import { calculateDisplayTime } from '@/utils/quoteUtils';
import {
  AUTO_ADVANCE_MAX_MS,
  AUTO_ADVANCE_MIN_MS,
  POINTER_PAUSE_MS,
} from './quoteDock.constants';

interface UseQuoteDockControllerOptions {
  quoteCount: number;
  getPreviewText: (index: number) => string;
  loading: boolean;
  hasError: boolean;
}

interface QuoteDockFocusHandlers {
  onFocusCapture: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => void;
}

export interface QuoteDockController {
  currentIndex: number;
  isExpanded: boolean;
  isDockHidden: boolean;
  focusHandlers: QuoteDockFocusHandlers;
  moveToPrevious: () => void;
  moveToNext: () => void;
  handleExpand: () => void;
  handleCollapse: () => void;
  handleHideDock: () => void;
  handleShowDock: () => void;
}

export default function useQuoteDockController({
  quoteCount,
  getPreviewText,
  loading,
  hasError,
}: UseQuoteDockControllerOptions): QuoteDockController {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDockHidden, setIsDockHidden] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [interactionPauseUntil, setInteractionPauseUntil] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!quoteCount) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((index) => (index >= quoteCount ? 0 : index));
  }, [quoteCount]);

  useEffect(() => {
    setIsExpanded(false);
  }, [currentIndex]);

  useEffect(() => {
    if (interactionPauseUntil === null) {
      return undefined;
    }

    const remaining = interactionPauseUntil - Date.now();
    if (remaining <= 0) {
      setInteractionPauseUntil(null);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setInteractionPauseUntil(null), remaining);
    return () => window.clearTimeout(timeoutId);
  }, [interactionPauseUntil]);

  const isInteractionPaused =
    interactionPauseUntil !== null && interactionPauseUntil > Date.now();
  const isAutoAdvancePaused = isExpanded || isFocusedWithin || isInteractionPaused;

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (loading || hasError || quoteCount < 2 || isAutoAdvancePaused) {
      return undefined;
    }

    const previewText = getPreviewText(currentIndex);
    const displayTime = calculateDisplayTime(previewText, {
      minDisplayMs: AUTO_ADVANCE_MIN_MS,
      maxDisplayMs: AUTO_ADVANCE_MAX_MS,
    });

    timerRef.current = setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % quoteCount);
    }, displayTime);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, getPreviewText, hasError, isAutoAdvancePaused, loading, quoteCount]);

  const pauseAfterInteraction = () => {
    setInteractionPauseUntil(Date.now() + POINTER_PAUSE_MS);
  };

  const moveToPrevious = () => {
    if (quoteCount < 2) {
      return;
    }

    pauseAfterInteraction();
    setCurrentIndex((index) => (index === 0 ? quoteCount - 1 : index - 1));
  };

  const moveToNext = () => {
    if (quoteCount < 2) {
      return;
    }

    pauseAfterInteraction();
    setCurrentIndex((index) => (index + 1) % quoteCount);
  };

  const handleExpand = () => {
    pauseAfterInteraction();
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    pauseAfterInteraction();
    setIsExpanded(false);
  };

  const handleHideDock = () => {
    pauseAfterInteraction();
    setIsExpanded(false);
    setIsFocusedWithin(false);
    setIsDockHidden(true);
  };

  const handleShowDock = () => {
    pauseAfterInteraction();
    setIsDockHidden(false);
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocusedWithin(false);
    }
  };

  const handleFocusCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      setIsFocusedWithin(true);
      return;
    }

    const isKeyboardFocus =
      typeof target.matches === 'function' ? target.matches(':focus-visible') : true;

    setIsFocusedWithin(isKeyboardFocus);
  };

  return {
    currentIndex,
    isExpanded,
    isDockHidden,
    focusHandlers: {
      onFocusCapture: handleFocusCapture,
      onBlurCapture: handleBlurCapture,
    },
    moveToPrevious,
    moveToNext,
    handleExpand,
    handleCollapse,
    handleHideDock,
    handleShowDock,
  };
}
