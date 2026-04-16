import React, { act } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BookshelfControls from '../BookshelfControls';

jest.mock('../../ui', () => {
  const actual = jest.requireActual('../../ui');

  return {
    ...actual,
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const sortOptions = [
  { label: 'Recently Read', value: 'date_read' },
  { label: 'Title', value: 'title' },
];

const shelves = [
  { id: 1, name: 'All-Time' },
  { id: 2, name: 'Bio-Neuro' },
];

describe('BookshelfControls', () => {
  it('opens the shelves ribbon, shows the library card, and resets active filters', async () => {
    const onSortChange = jest.fn();
    const onClearShelves = jest.fn();
    const onSearchChange = jest.fn();

    render(
      <BookshelfControls
        sortOptions={sortOptions}
        selectedSortBy="title"
        onSortChange={onSortChange}
        allBookshelves={shelves}
        selectedShelfIds={[2]}
        onToggleShelf={jest.fn()}
        onClearShelves={onClearShelves}
        bookCount={24}
        searchQuery="borges"
        onSearchChange={onSearchChange}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /shelves controls/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Bio-Neuro')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^reset$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }));

    expect(onClearShelves).toHaveBeenCalledTimes(1);
    expect(onSortChange).toHaveBeenCalledWith('date_read');
    expect(onSearchChange).toHaveBeenCalledWith('');
  });
});
