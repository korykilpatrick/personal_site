import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import apiService from '@/api/apiService';
import {
  BOOKS_CACHE_TTL_MS,
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

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
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

  it('serves stale books immediately while revalidating a route remount', async () => {
    let now = 1_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    mockedApiService.getBooks
      .mockResolvedValueOnce([
        {
          id: 3,
          title: 'Stale Book',
          author: 'Old Author',
          shelves: [],
        },
      ] as never)
      .mockResolvedValueOnce([] as never);

    const firstRender = render(
      <BooksProvider>
        <BooksConsumer />
      </BooksProvider>,
    );

    expect(await screen.findByText('ready')).toBeInTheDocument();
    expect(screen.getByText('books:1')).toBeInTheDocument();
    firstRender.unmount();

    now += BOOKS_CACHE_TTL_MS;
    render(
      <BooksProvider>
        <BooksConsumer />
      </BooksProvider>,
    );

    expect(screen.getByText('ready')).toBeInTheDocument();
    expect(screen.getByText('books:1')).toBeInTheDocument();
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
    expect(mockedApiService.getBooks).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('books:0')).toBeInTheDocument();
  });

  it('revalidates an open provider when its cached books expire', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-03T12:00:00Z'));
    mockedApiService.getBooks
      .mockResolvedValueOnce([
        {
          id: 5,
          title: 'Before Sync',
          author: 'An Author',
          shelves: [],
        },
      ] as never)
      .mockResolvedValueOnce([] as never);

    render(
      <BooksProvider>
        <BooksConsumer />
      </BooksProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('books:1')).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(BOOKS_CACHE_TTL_MS);
      await Promise.resolve();
    });

    expect(mockedApiService.getBooks).toHaveBeenCalledTimes(2);
    expect(screen.getByText('books:0')).toBeInTheDocument();
    expect(screen.getByText('ready')).toBeInTheDocument();
  });

  it('keeps the last good snapshot when background revalidation fails', async () => {
    let now = 1_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    mockedApiService.getBooks
      .mockResolvedValueOnce([
        {
          id: 8,
          title: 'Last Good Snapshot',
          author: 'An Author',
          shelves: [],
        },
      ] as never)
      .mockRejectedValueOnce(new Error('temporary API failure'));

    const firstRender = render(
      <BooksProvider>
        <BooksConsumer />
      </BooksProvider>,
    );

    expect(await screen.findByText('books:1')).toBeInTheDocument();
    firstRender.unmount();

    now += BOOKS_CACHE_TTL_MS;
    render(
      <BooksProvider>
        <BooksConsumer />
      </BooksProvider>,
    );

    await waitFor(() => expect(mockedApiService.getBooks).toHaveBeenCalledTimes(2));
    expect(screen.getByText('books:1')).toBeInTheDocument();
    expect(screen.getByText('no-error')).toBeInTheDocument();
  });
});
