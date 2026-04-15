import React from 'react';
import { render, screen } from '@testing-library/react';
import apiService from '@/api/apiService';
import useActiveQuotes, { resetActiveQuotesCache } from '../useActiveQuotes';

jest.mock('@/api/apiService', () => ({
  __esModule: true,
  default: {
    getActiveQuotes: jest.fn(),
  },
}));

const mockedApiService = apiService as jest.Mocked<typeof apiService>;

const ActiveQuotesConsumer: React.FC = () => {
  const { quotes, loading, error } = useActiveQuotes();

  return (
    <div>
      <span>{loading ? 'loading' : 'ready'}</span>
      <span>{`quotes:${quotes.length}`}</span>
      <span>{error ?? 'no-error'}</span>
    </div>
  );
};

describe('useActiveQuotes', () => {
  beforeEach(() => {
    resetActiveQuotesCache();
    jest.clearAllMocks();
  });

  it('reuses cached quotes across remounts', async () => {
    mockedApiService.getActiveQuotes.mockResolvedValue([
      {
        id: 1,
        text: 'Stay with the friction.',
        author: 'Unknown',
        source: 'Notebook',
        active: true,
      },
    ] as never);

    const firstRender = render(<ActiveQuotesConsumer />);

    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(await screen.findByText('ready')).toBeInTheDocument();
    expect(screen.getByText('quotes:1')).toBeInTheDocument();
    expect(mockedApiService.getActiveQuotes).toHaveBeenCalledTimes(1);

    firstRender.unmount();

    render(<ActiveQuotesConsumer />);

    expect(screen.getByText('ready')).toBeInTheDocument();
    expect(screen.getByText('quotes:1')).toBeInTheDocument();
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
    expect(mockedApiService.getActiveQuotes).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent quote requests', async () => {
    let resolveQuotes: ((quotes: unknown) => void) | null = null;

    mockedApiService.getActiveQuotes.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveQuotes = resolve;
        }) as never,
    );

    render(
      <>
        <ActiveQuotesConsumer />
        <ActiveQuotesConsumer />
      </>,
    );

    expect(mockedApiService.getActiveQuotes).toHaveBeenCalledTimes(1);

    resolveQuotes?.([
      {
        id: 2,
        text: 'Build the thing that feels inevitable.',
        author: 'Unknown',
        source: 'Notes',
        active: true,
      },
    ]);

    expect(await screen.findAllByText('ready')).toHaveLength(2);
    expect(screen.getAllByText('quotes:1')).toHaveLength(2);
    expect(mockedApiService.getActiveQuotes).toHaveBeenCalledTimes(1);
  });
});
