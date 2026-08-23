import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ImageModal from './ImageModal';

const ModalHarness = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open image
      </button>
      <ImageModal
        isOpen={isOpen}
        imageUrl="/images/example.jpg"
        altText="A mountain path"
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

describe('ImageModal', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  test('labels the dialog and moves focus to its close control', () => {
    render(<ModalHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open image' }));

    expect(screen.getByRole('dialog', { name: 'Image viewer' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'A mountain path' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close image viewer' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('closes on Escape, restores focus, and restores the prior scroll style', async () => {
    document.body.style.overflow = 'scroll';
    render(<ModalHarness />);

    const trigger = screen.getByRole('button', { name: 'Open image' });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('scroll');
  });

  test('keeps forward and reverse Tab navigation inside the dialog', () => {
    render(<ModalHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open image' }));

    const closeButton = screen.getByRole('button', { name: 'Close image viewer' });
    const trigger = screen.getByRole('button', { name: 'Open image' });

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    trigger.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(closeButton).toHaveFocus();
  });

  test('closes only when the backdrop itself is clicked', async () => {
    render(<ModalHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open image' }));

    const dialog = screen.getByRole('dialog', { name: 'Image viewer' });
    fireEvent.click(dialog);
    expect(dialog).toBeInTheDocument();

    const backdrop = dialog.parentElement;
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as HTMLElement);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
