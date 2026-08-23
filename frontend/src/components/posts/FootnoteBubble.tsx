import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface FootnoteBubbleProps {
  children?: React.ReactNode;
  href?: string;
  note?: string;
  number?: string | number;
  source?: string;
}

interface BubblePosition {
  arrowLeft: number;
  left: number;
  placement: 'above' | 'below';
  top: number;
  width: number;
}

const DESKTOP_WIDTH = 304;
const VIEWPORT_GUTTER = 16;
const TRIGGER_GAP = 10;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

const FootnoteBubble: React.FC<FootnoteBubbleProps> = ({
  children,
  href = '',
  note = '',
  number = '?',
  source = 'Source',
}) => {
  const reactId = useId();
  const noteId = `post-footnote-${reactId.replace(/:/g, '')}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const sourceRef = useRef<HTMLAnchorElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const pinnedFocusEstablishedRef = useRef(false);
  const suppressFocusOpenRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState<BubblePosition | null>(null);
  const sourceHref = /^https:\/\/[^\s]+$/i.test(href) ? href : undefined;

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    clearCloseTimer();
    setIsOpen(false);
    setIsPinned(false);
  }, [clearCloseTimer]);

  const closeAndRestoreFocus = useCallback(() => {
    suppressFocusOpenRef.current = true;
    close();
    triggerRef.current?.focus();
    suppressFocusOpenRef.current = false;
  }, [close]);

  const scheduleHoverClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      if (!isPinned) {
        setIsOpen(false);
      }
    }, 140);
  }, [clearCloseTimer, isPinned]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === 'undefined') {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const width = Math.min(DESKTOP_WIDTH, window.innerWidth - VIEWPORT_GUTTER * 2);
    const measuredHeight = bubbleRef.current?.offsetHeight ?? 160;
    const centeredLeft = triggerRect.left + triggerRect.width / 2 - width / 2;
    const left = clamp(
      centeredLeft,
      VIEWPORT_GUTTER,
      Math.max(VIEWPORT_GUTTER, window.innerWidth - width - VIEWPORT_GUTTER),
    );
    const spaceAbove = triggerRect.top - VIEWPORT_GUTTER;
    const placement = spaceAbove >= measuredHeight + TRIGGER_GAP ? 'above' : 'below';
    const top =
      placement === 'above'
        ? triggerRect.top - measuredHeight - TRIGGER_GAP
        : triggerRect.bottom + TRIGGER_GAP;
    const triggerCenter = triggerRect.left + triggerRect.width / 2;

    setPosition({
      arrowLeft: clamp(triggerCenter - left, 18, width - 18),
      left,
      placement,
      top: clamp(top, VIEWPORT_GUTTER, window.innerHeight - measuredHeight - VIEWPORT_GUTTER),
      width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isPinned) {
      pinnedFocusEstablishedRef.current = false;
      return;
    }

    if (!isOpen || !position || pinnedFocusEstablishedRef.current) {
      return;
    }

    pinnedFocusEstablishedRef.current = true;
    (sourceRef.current ?? closeButtonRef.current)?.focus({ preventScroll: true });
  }, [isOpen, isPinned, position]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleViewportChange = () => updatePosition();
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || bubbleRef.current?.contains(target)) {
        return;
      }
      close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      closeAndRestoreFocus();
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, closeAndRestoreFocus, isOpen, updatePosition]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const supportsHover = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover)').matches;

  const handleBubbleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!isPinned || event.key !== 'Tab') {
      return;
    }

    const controls = [sourceRef.current, closeButtonRef.current].filter(
      (control): control is HTMLAnchorElement | HTMLButtonElement => Boolean(control),
    );
    if (controls.length === 0) {
      return;
    }

    const activeIndex = controls.indexOf(
      document.activeElement as HTMLAnchorElement | HTMLButtonElement,
    );
    const movingBeforeFirst = event.shiftKey && activeIndex <= 0;
    const movingPastLast = !event.shiftKey && activeIndex === controls.length - 1;
    const focusIsOutsideDialog = activeIndex === -1;

    if (!movingBeforeFirst && !movingPastLast && !focusIsOutsideDialog) {
      return;
    }

    event.preventDefault();
    const target = event.shiftKey ? controls[controls.length - 1] : controls[0];
    target.focus();
  };

  const bubble =
    isOpen && typeof document !== 'undefined' ? (
      <span
        ref={bubbleRef}
        id={noteId}
        role={isPinned ? 'dialog' : 'note'}
        aria-label={`Footnote ${number}`}
        className={`post-footnote-bubble ${position?.placement === 'below' ? 'is-below' : 'is-above'}`}
        style={
          {
            left: position?.left ?? VIEWPORT_GUTTER,
            top: position?.top ?? VIEWPORT_GUTTER,
            visibility: position ? 'visible' : 'hidden',
            width: position?.width ?? DESKTOP_WIDTH,
            '--footnote-arrow-left': `${position?.arrowLeft ?? DESKTOP_WIDTH / 2}px`,
          } as React.CSSProperties
        }
        onPointerEnter={clearCloseTimer}
        onPointerLeave={scheduleHoverClose}
        onKeyDown={handleBubbleKeyDown}
      >
        <span className="post-footnote-bubble-number">{number}</span>
        <span className="post-footnote-bubble-copy">
          {note}
          {sourceHref && (
            <a
              ref={sourceRef}
              className="post-footnote-source"
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {source} <span aria-hidden="true">↗</span>
            </a>
          )}
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          className="post-footnote-close"
          onClick={closeAndRestoreFocus}
          aria-label="Close footnote"
        >
          ×
        </button>
        <span aria-hidden="true" className="post-footnote-arrow" />
      </span>
    ) : null;

  return (
    <span className="post-footnote">
      {children}
      <button
        ref={triggerRef}
        type="button"
        className="post-footnote-marker"
        aria-label={`Open footnote ${number}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={noteId}
        aria-describedby={isOpen ? noteId : undefined}
        onClick={() => {
          clearCloseTimer();
          const nextPinned = !isPinned;
          setIsPinned(nextPinned);
          setIsOpen(nextPinned);
        }}
        onFocus={() => {
          if (!suppressFocusOpenRef.current) {
            setIsOpen(true);
          }
        }}
        onBlur={(event) => {
          const nextFocus = event.relatedTarget as Node | null;
          if (!isPinned && !bubbleRef.current?.contains(nextFocus)) {
            scheduleHoverClose();
          }
        }}
        onPointerEnter={() => {
          if (supportsHover()) {
            clearCloseTimer();
            setIsOpen(true);
          }
        }}
        onPointerLeave={() => {
          if (supportsHover()) {
            scheduleHoverClose();
          }
        }}
      >
        {number}
      </button>
      <span className="post-footnote-print">
        [{number}] {note}{sourceHref ? ` ${source}: ${sourceHref}` : ''}
      </span>
      {bubble ? createPortal(bubble, document.body) : null}
    </span>
  );
};

export default FootnoteBubble;
