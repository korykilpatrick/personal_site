import { useMemo } from 'react';

interface UseSimplifiedBookSizeProps {
  minWidth?: number; // min book width in pixels
  aspectRatio?: number; // height / width
}

interface BookSize {
  width: number; // This will represent the minimum width for the grid
  height: number;
}

const DEFAULT_MIN_WIDTH = 80; // Minimum realistic book cover width
const DEFAULT_ASPECT_RATIO = 1.5; // Standard book cover ratio (height = width * 1.5)

/**
 * Calculates minimum book dimensions for a responsive grid.
 *
 * @param minWidth The minimum allowed width for a book cover (defaults to 80px).
 * @param aspectRatio The desired aspect ratio (height / width) for book covers (defaults to 1.5).
 * @returns An object containing the calculated minimum `width` and corresponding `height`.
 */
const useDynamicBookSize = ({
  minWidth = DEFAULT_MIN_WIDTH,
  aspectRatio = DEFAULT_ASPECT_RATIO,
}: UseSimplifiedBookSizeProps): BookSize => {

  const bookSize = useMemo(() => {
    // Calculate height based on the minimum width and aspect ratio
    const finalHeight = Math.floor(minWidth * aspectRatio);

    // Return the minimum width and calculated height
    return { width: minWidth, height: finalHeight };
  }, [minWidth, aspectRatio]);

  return bookSize;
};

export default useDynamicBookSize; 