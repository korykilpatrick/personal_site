import React from 'react';
import { render, screen } from '@testing-library/react';
import BookshelfPill from '../BookshelfPill';

describe('BookshelfPill', () => {
  it('renders bookshelf filters with readable dark styling', () => {
    render(<BookshelfPill label="Bio-Neuro" onRemove={jest.fn()} />);

    const pill = screen.getByText('Bio-Neuro').closest('div');

    expect(pill).toHaveClass(
      'bg-[linear-gradient(180deg,rgba(21,38,63,0.96),rgba(12,23,39,0.98))]',
      'text-cream-light',
    );
  });
});
