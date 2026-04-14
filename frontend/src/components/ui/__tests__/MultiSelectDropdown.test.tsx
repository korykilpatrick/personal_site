import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiSelectDropdown from '../MultiSelectDropdown';

const shelves = [
  { id: 1, label: 'Fiction' },
  { id: 2, label: 'Non-Fiction' },
  { id: 3, label: 'Currently Reading' },
];

describe('MultiSelectDropdown', () => {
  it('renders "All" when nothing is selected', () => {
    render(
      <MultiSelectDropdown
        label="Select Shelves"
        items={shelves}
        selectedItems={[]}
        toggleItem={jest.fn()}
      />
    );
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('shows count when items are selected', () => {
    render(
      <MultiSelectDropdown
        label="Select Shelves"
        items={shelves}
        selectedItems={[1, 3]}
        toggleItem={jest.fn()}
      />
    );
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('shows all shelf options when clicked', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelectDropdown
        label="Select Shelves"
        items={shelves}
        selectedItems={[]}
        toggleItem={jest.fn()}
      />
    );

    await user.click(screen.getByText('All'));

    for (const shelf of shelves) {
      expect(screen.getByText(shelf.label)).toBeInTheDocument();
    }
  });

  it('calls toggleItem when a checkbox is clicked', async () => {
    const toggleItem = jest.fn();
    const user = userEvent.setup();
    render(
      <MultiSelectDropdown
        label="Select Shelves"
        items={shelves}
        selectedItems={[]}
        toggleItem={toggleItem}
      />
    );

    await user.click(screen.getByText('All'));
    await user.click(screen.getByText('Fiction'));

    expect(toggleItem).toHaveBeenCalledWith(1);
  });

  it('shows checkboxes as checked for selected items', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelectDropdown
        label="Select Shelves"
        items={shelves}
        selectedItems={[2]}
        toggleItem={jest.fn()}
      />
    );

    await user.click(screen.getByText('1 selected'));

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked(); // Fiction
    expect(checkboxes[1]).toBeChecked();      // Non-Fiction
    expect(checkboxes[2]).not.toBeChecked(); // Currently Reading
  });
});
