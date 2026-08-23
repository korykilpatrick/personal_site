import React, { MouseEvent, useEffect, useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ImageModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  altText?: string;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  isOpen,
  onClose,
  altText = 'Enlarged image',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const isVisible = isOpen && Boolean(imageUrl);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const returnFocusTo =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;

    document.body.style.overflow = 'hidden';
    (closeButtonRef.current ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.closest('[hidden], [aria-hidden="true"]'));

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!dialog.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
      } else if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (returnFocusTo?.isConnected) {
        returnFocusTo.focus();
      }
    };
  }, [isVisible]);

  if (!isVisible || !imageUrl) {
    return null;
  }

  const closeModal = () => onCloseRef.current();

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  return createPortal(
    <div className="image-viewer" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        className="image-viewer__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 id={titleId} className="image-viewer__title">
          Image viewer
        </h2>
        <img src={imageUrl} alt={altText} className="image-viewer__image" />
        <button
          ref={closeButtonRef}
          type="button"
          className="image-viewer__close"
          onClick={closeModal}
          aria-label="Close image viewer"
        >
          <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20">
            <path d="m4.75 4.75 10.5 10.5m0-10.5-10.5 10.5" />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default ImageModal;
