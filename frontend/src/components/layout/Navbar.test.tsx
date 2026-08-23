import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

const renderNavbar = () =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
    </MemoryRouter>,
  );

describe('Navbar', () => {
  test('keeps the closed mobile menu inert and restores trigger focus on Escape', async () => {
    renderNavbar();

    const trigger = screen.getByRole('button', { name: 'Open menu' });
    const mobileNavigation = document.querySelector<HTMLElement>('#mobile-site-menu');
    const mobileAbout = mobileNavigation?.querySelector<HTMLAnchorElement>('a[href="/about"]');

    expect(mobileNavigation).not.toBeNull();
    expect(mobileAbout).not.toBeNull();
    expect(mobileNavigation).toHaveAttribute('aria-hidden', 'true');
    expect(mobileNavigation).toHaveAttribute('inert');
    expect(mobileAbout).toHaveAttribute('tabindex', '-1');

    fireEvent.click(trigger);
    expect(mobileNavigation).toHaveAttribute('aria-hidden', 'false');
    expect(mobileNavigation).not.toHaveAttribute('inert');
    expect(mobileAbout).not.toHaveAttribute('tabindex');

    mobileAbout?.focus();
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(mobileNavigation).toHaveAttribute('aria-hidden', 'true');
    expect(mobileNavigation).toHaveAttribute('inert');
    expect(mobileAbout).toHaveAttribute('tabindex', '-1');
  });
});
