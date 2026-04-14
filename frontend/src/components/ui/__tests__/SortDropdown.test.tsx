import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SortDropdown from '../SortDropdown';

const sortOptions = [
  { value: 'recent', label: 'Recently Read' },
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'date_pub', label: 'Published Date' },
  { value: 'rating', label: 'Rating' },
];

describe('SortDropdown', () => {
  it('renders the selected option label', () => {
    render(
      <SortDropdown options={sortOptions} selected="recent" onChange={jest.fn()} />
    );
    expect(screen.getByText('Recently Read')).toBeInTheDocument();
  });

  it('shows all options when clicked', async () => {
    const user = userEvent.setup();
    render(
      <SortDropdown options={sortOptions} selected="recent" onChange={jest.fn()} />
    );

    await user.click(screen.getByText('Recently Read'));

    for (const option of sortOptions) {
      expect(screen.getByRole('menuitem', { name: option.label })).toBeInTheDocument();
    }
  });

  it('calls onChange when an option is selected', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <SortDropdown options={sortOptions} selected="recent" onChange={onChange} />
    );

    await user.click(screen.getByText('Recently Read'));
    await user.click(screen.getByRole('menuitem', { name: 'Title' }));

    expect(onChange).toHaveBeenCalledWith('title');
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <SortDropdown options={sortOptions} selected="recent" onChange={jest.fn()} />
        <div data-testid="outside">Outside</div>
      </div>
    );

    // Open dropdown
    await user.click(screen.getByText('Recently Read'));
    expect(screen.getByRole('menuitem', { name: 'Title' })).toBeInTheDocument();

    // Click outside
    await user.click(screen.getByTestId('outside'));

    // Options should no longer be visible
    expect(screen.queryByRole('menuitem', { name: 'Title' })).not.toBeInTheDocument();
  });
});
