import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import QuoteForm from './QuoteForm';

describe('QuoteForm', () => {
  it('creates quotes as active by default', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    render(<QuoteForm initialData={null} onSubmit={handleSubmit} isLoading={false} />);

    expect(screen.getByLabelText('Active?')).toBeChecked();

    fireEvent.change(screen.getByLabelText('Quote Text:'), {
      target: { value: 'Default-visible quote' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Quote' }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        text: 'Default-visible quote',
        author: '',
        source: '',
        display_order: 0,
        is_active: true,
      });
    });
  });
});
