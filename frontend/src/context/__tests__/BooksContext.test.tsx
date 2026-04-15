import React from 'react';
import { render, screen } from '@testing-library/react';
import apiService from '@/api/apiService';
import {
  BooksProvider,
  prefetchBooks,
  resetBooksCache,
  useBooks,
} from '../BooksContext';

jest.mock('@/api/apiService', () => ({
  __esModule: true,
  default: {
    getBooks: jest.fn(),
  },
}));

const mockedApiService = apiService as jest.Mocked<typeof apiService>;

const BooksConsumer: React.FC = () => {
  const { books, loading, error } = useBooks();

  return (
    <div>
      <span>{loading ? 'loading' : 'ready'}</span>
      <span>{`books:${books.length}`}</span>
      <span>{error ? error.message : 'no-error'}</span>
    </div>
  );
};

describe('BooksContext', () => {
  beforeEach(() => {
    resetBooksCache();
    jest.clearAllMocks();
  });

  it('reuses cached books across route remounts', async () => {
    mockedApiService.getBooks.mockResolvedValue([
      {
        id: 1,
        title: 'The Beginning of Infinity',
        author: 'David Deutsch',
        shelves: [],
      },
    ] as never);

    const firstRender = render(
      <BooksProvider>
        <BooksConsumer />
      </BooksProvider>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(await screen.findByText('ready')).toBeInTheDocument();
    expect(screen.getByText('books:1')).toBeInTheDocument();
    expect(mockedApiService.getBooks).toHaveBeenCalledTimes(1);

    firstRender.unmount();

    render(
      <BooksProvider>
        <BooksConsumer />
      </BooksProvider>,
    );

    expect(screen.getByText('ready')).toBeInTheDocument();
    expect(screen.getByText('books:1')).toBeInTheDocument();
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
    expect(mockedApiService.getBooks).toHaveBeenCalledTimes(1);
  });

  it('deduplicates bookshelf warmup requests', async () => {
    let resolveBooks: ((books: unknown) => void) | null = null;
    mockedApiService.getBooks.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveBooks = resolve;
        }) as never,
    );

    const firstRequest = prefetchBooks();
    const secondRequest = prefetchBooks();

    expect(mockedApiService.getBooks).toHaveBeenCalledTimes(1);

    resolveBooks?.([
      {
        id: 2,
        title: 'Impro',
        author: 'Keith Johnstone',
        shelves: [],
      },
    ]);

    await expect(firstRequest).resolves.toHaveLength(1);
    await expect(secondRequest).resolves.toHaveLength(1);
    expect(mockedApiService.getBooks).toHaveBeenCalledTimes(1);
  });
});
