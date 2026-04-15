let warmBookshelfPromise: Promise<void> | null = null;

export const warmBookshelfExperience = (): Promise<void> => {
  if (!warmBookshelfPromise) {
    warmBookshelfPromise = import('../context/BooksContext')
      .then(({ prefetchBooks }) => prefetchBooks())
      .then(() => undefined)
      .finally(() => {
        warmBookshelfPromise = null;
      });
  }

  return warmBookshelfPromise;
};
