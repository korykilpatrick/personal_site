import React from 'react';
import { render, screen } from '@testing-library/react';
import apiService from '@/api/apiService';
import { resetBooksCache } from '../context/BooksContext';
import BookshelfPage from './BookshelfPage';

jest.mock('@/api/apiService', () => ({
  __esModule: true,
  default: {
    getBooks: jest.fn(),
  },
}));

const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe('BookshelfPage metadata', () => {
  beforeEach(() => {
    resetBooksCache();
    jest.clearAllMocks();
  });

  it('sets bookshelf metadata while books are loading', () => {
    mockedApiService.getBooks.mockImplementation(() => new Promise(() => undefined));

    render(<BookshelfPage />);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(document.title).toBe('Bookshelf · Kory Kilpatrick');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://korykilpatrick.com/bookshelf',
    );
  });

  it('keeps bookshelf metadata when loading fails', async () => {
    mockedApiService.getBooks.mockRejectedValue(new Error('request failed'));

    render(<BookshelfPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The bookshelf could not be loaded.',
    );
    expect(document.title).toBe('Bookshelf · Kory Kilpatrick');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://korykilpatrick.com/bookshelf',
    );
  });
});
