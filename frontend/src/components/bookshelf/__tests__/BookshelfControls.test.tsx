import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookshelfControls from '../BookshelfControls';

const renderControls = (
  overrides: Partial<React.ComponentProps<typeof BookshelfControls>> = {},
) => {
  const props: React.ComponentProps<typeof BookshelfControls> = {
    sortOptions: [{ label: 'Recent', value: 'date_read' }],
    selectedSortBy: 'date_read',
    onSortChange: jest.fn(),
    allBookshelves: [
      { id: 1, name: 'Biography' },
      { id: 2, name: 'Currently Reading' },
    ],
    shelfBookCounts: new Map([
      [1, 12],
      [2, 1],
    ]),
    selectedShelfIds: [],
    onToggleShelf: jest.fn(),
    bookCount: 13,
    searchQuery: '',
    onSearchChange: jest.fn(),
    ...overrides,
  };

  return { props, ...render(<BookshelfControls {...props} />) };
};

describe('BookshelfControls shelf counts', () => {
  it('shows inline parenthetical counts with descriptive accessible names', async () => {
    const user = userEvent.setup();
    renderControls();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Filter by shelf' }));
    });

    const biography = screen.getByRole('menuitemcheckbox', {
      name: 'Biography, 12 books',
    });
    const currentlyReading = screen.getByRole('menuitemcheckbox', {
      name: 'Currently Reading, 1 book',
    });

    expect(biography).toHaveTextContent('Biography (12)');
    expect(currentlyReading).toHaveTextContent('Currently Reading (1)');
  });

  it('preserves shelf selection behavior when a counted option is chosen', async () => {
    const user = userEvent.setup();
    const onToggleShelf = jest.fn();
    renderControls({ onToggleShelf, selectedShelfIds: [1] });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Filter by shelf (1 selected)' }));
    });
    const biography = screen.getByRole('menuitemcheckbox', {
      name: 'Biography, 12 books',
    });

    expect(biography).toHaveAttribute('aria-checked', 'true');

    await act(async () => {
      await user.click(biography);
    });

    expect(onToggleShelf).toHaveBeenCalledWith(1);
  });
});
