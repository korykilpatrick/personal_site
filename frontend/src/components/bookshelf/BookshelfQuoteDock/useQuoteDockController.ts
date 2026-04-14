import { useCallback, useEffect, useState } from 'react';
import { POINTER_PAUSE_MS } from './quoteDock.constants';

interface UseQuoteDockControllerOptions {
  quoteCount: number;
}

interface QuoteDockFocusHandlers {
  onFocusCapture: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => void;
}

export interface QuoteDockController {
  currentIndex: number;
  isExpanded: boolean;
  isDockHidden: boolean;
  isAutoAdvancePaused: boolean;
  focusHandlers: QuoteDockFocusHandlers;
  advanceToNext: () => void;
  moveToPrevious: () => void;
  moveToNext: () => void;
  handleExpand: () => void;
  handleCollapse: () => void;
  handleHideDock: () => void;
  handleShowDock: () => void;
}

export default function useQuoteDockController({
  quoteCount,
}: UseQuoteDockControllerOptions): QuoteDockController {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDockHidden, setIsDockHidden] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [interactionPauseUntil, setInteractionPauseUntil] = useState<number | null>(null);

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

  const pauseAfterInteraction = useCallback(() => {
    setInteractionPauseUntil(Date.now() + POINTER_PAUSE_MS);
  }, []);

  const advanceToNext = useCallback(() => {
    if (quoteCount < 2) {
      return;
    }

    setCurrentIndex((index) => (index + 1) % quoteCount);
  }, [quoteCount]);

  const moveToPrevious = useCallback(() => {
    if (quoteCount < 2) {
      return;
    }

    pauseAfterInteraction();
    setCurrentIndex((index) => (index === 0 ? quoteCount - 1 : index - 1));
  }, [pauseAfterInteraction, quoteCount]);

  const moveToNext = useCallback(() => {
    if (quoteCount < 2) {
      return;
    }

    pauseAfterInteraction();
    advanceToNext();
  }, [advanceToNext, pauseAfterInteraction, quoteCount]);

  const handleExpand = useCallback(() => {
    pauseAfterInteraction();
    setIsExpanded(true);
  }, [pauseAfterInteraction]);

  const handleCollapse = useCallback(() => {
    pauseAfterInteraction();
    setIsExpanded(false);
  }, [pauseAfterInteraction]);

  const handleHideDock = useCallback(() => {
    pauseAfterInteraction();
    setIsExpanded(false);
    setIsFocusedWithin(false);
    setIsDockHidden(true);
  }, [pauseAfterInteraction]);

  const handleShowDock = useCallback(() => {
    pauseAfterInteraction();
    setIsDockHidden(false);
  }, [pauseAfterInteraction]);

  const handleBlurCapture = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocusedWithin(false);
    }
  }, []);

  const handleFocusCapture = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      setIsFocusedWithin(true);
      return;
    }

    const isKeyboardFocus =
      typeof target.matches === 'function' ? target.matches(':focus-visible') : true;

    setIsFocusedWithin(isKeyboardFocus);
  }, []);

  return {
    currentIndex,
    isExpanded,
    isDockHidden,
    isAutoAdvancePaused,
    focusHandlers: {
      onFocusCapture: handleFocusCapture,
      onBlurCapture: handleBlurCapture,
    },
    advanceToNext,
    moveToPrevious,
    moveToNext,
    handleExpand,
    handleCollapse,
    handleHideDock,
    handleShowDock,
  };
}
