import type { MutableRefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  EXPAND_LABEL,
  FALLBACK_PREVIEW_MIN_HEIGHT,
} from './quoteDock.constants';
import { PreviewFitState, fitPreviewText, truncatePreviewCandidate } from './previewFit';

interface UsePreviewFitOptions {
  plainText: string;
  baseCharLimit: number;
  previewBaseLines: number;
}

const EMPTY_PREVIEW_FIT: PreviewFitState = {
  text: '',
  truncated: false,
  minHeight: FALLBACK_PREVIEW_MIN_HEIGHT,
};

export default function usePreviewFit({
  plainText,
  baseCharLimit,
  previewBaseLines,
}: UsePreviewFitOptions): {
  previewFit: PreviewFitState;
  previewMeasureRef: MutableRefObject<HTMLParagraphElement | null>;
} {
  const [previewFit, setPreviewFit] = useState<PreviewFitState>(EMPTY_PREVIEW_FIT);
  const previewMeasureRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    if (!plainText) {
      setPreviewFit(EMPTY_PREVIEW_FIT);
      return;
    }

    const previewMeasure = previewMeasureRef.current;
    if (!previewMeasure || typeof window === 'undefined') {
      const fallbackText = truncatePreviewCandidate(plainText, baseCharLimit);
      setPreviewFit({
        text: fallbackText,
        truncated: fallbackText !== plainText,
        minHeight: FALLBACK_PREVIEW_MIN_HEIGHT,
      });
      return;
    }

    const computedStyles = window.getComputedStyle(previewMeasure);
    const lineHeight =
      Number.parseFloat(computedStyles.lineHeight) || FALLBACK_PREVIEW_MIN_HEIGHT / 2;
    const minHeight = Math.ceil(lineHeight * previewBaseLines);
    const maxHeight = minHeight;

    const nextPreviewFit = fitPreviewText({
      plainText,
      baseCharLimit,
      maxHeight,
      measureHeight: (candidate, truncated) => {
        const suffix = truncated ? `... ${EXPAND_LABEL}` : '';
        previewMeasure.textContent = candidate ? `"${candidate}${suffix}` : '';
        return Math.ceil(previewMeasure.getBoundingClientRect().height);
      },
    });

    setPreviewFit((previous) => {
      if (
        previous.text === nextPreviewFit.text &&
        previous.truncated === nextPreviewFit.truncated &&
        previous.minHeight === minHeight
      ) {
        return previous;
      }

      return {
        ...nextPreviewFit,
        minHeight,
      };
    });
  }, [baseCharLimit, plainText, previewBaseLines]);

  return {
    previewFit,
    previewMeasureRef,
  };
}
