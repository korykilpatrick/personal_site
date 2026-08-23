import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import PostRenderer, { headingId } from './PostRenderer';

const renderPost = (body: string) =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PostRenderer body={body} />
    </MemoryRouter>,
  );

describe('PostRenderer', () => {
  test('keeps internal links in the app and opens external links separately', () => {
    renderPost('[Internal](/posts/example) and [External](https://example.com).');

    expect(screen.getByRole('link', { name: 'Internal' })).not.toHaveAttribute('target');
    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('target', '_blank');
  });

  test('preserves the atlas origin through body-level post links', async () => {
    const user = userEvent.setup();
    const LocationState = () => {
      const location = useLocation();
      return <output>{JSON.stringify(location.state)}</output>;
    };

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PostRenderer
          body={'<PostLink slug="second-post">Keep tracing</PostLink>'}
          postsOrigin="/posts?view=map&focus=first-post"
        />
        <LocationState />
      </MemoryRouter>,
    );

    await act(async () => user.click(screen.getByRole('link', { name: 'Keep tracing' })));
    expect(screen.getByRole('status')).toHaveTextContent('/posts?view=map&focus=first-post');
  });

  test('keeps markdown links mounted across parent rerenders', () => {
    const body = '[Keep tracing](/posts/second-post)';
    const view = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PostRenderer body={body} postsOrigin="/posts?view=map" />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Keep tracing' });
    link.focus();

    view.rerender(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PostRenderer body={body} postsOrigin="/posts?view=map" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Keep tracing' })).toBe(link);
    expect(link).toHaveFocus();
  });

  test('renders rejected link protocols as inert text instead of crashing', () => {
    renderPost('[Do not run this](javascript:alert(1)).');

    expect(document.querySelector('.post-prose')).toHaveTextContent('Do not run this.');
    expect(screen.queryByRole('link', { name: 'Do not run this' })).not.toBeInTheDocument();
  });

  test('drops executable raw HTML and unsafe DOM attributes from database content', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      renderPost(
        'Safe text <script>window.bad = true</script><iframe src="https://example.com"></iframe><span style="color:red" onclick="alert(1)">kept words</span>',
      );

      expect(document.querySelector('script')).toBeNull();
      expect(document.querySelector('iframe')).toBeNull();
      expect(screen.queryByText('window.bad = true')).not.toBeInTheDocument();
      const rawSpan = screen.getByText('kept words');
      expect(rawSpan).not.toHaveAttribute('style');
      expect(rawSpan).not.toHaveAttribute('onclick');
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  test('adds stable IDs to headings', () => {
    renderPost('## Beauty, order & life');

    expect(screen.getByRole('heading', { name: 'Beauty, order & life' })).toHaveAttribute(
      'id',
      'beauty-order-life',
    );
    expect(headingId('Déjà vu')).toBe('deja-vu');
  });

  test('opens and closes an accessible footnote', async () => {
    const user = userEvent.setup();
    renderPost('A <Footnote note="A useful aside.">loaded phrase</Footnote> here.');

    const trigger = screen.getByRole('button', { name: 'Open footnote 1' });
    await act(async () => user.click(trigger));
    const dialog = screen.getByRole('dialog', { name: 'Footnote 1' });
    expect(dialog).toHaveTextContent('A useful aside.');
    expect(trigger).toHaveAttribute('aria-describedby', dialog.id);
    expect(screen.getByRole('button', { name: 'Close footnote' })).toHaveFocus();

    await act(async () => user.keyboard('{Escape}'));
    expect(screen.queryByRole('dialog', { name: 'Footnote 1' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test('keeps source and close controls in the pinned footnote focus sequence', async () => {
    const user = userEvent.setup();
    renderPost(
      'A <Footnote note="Evidence lives here." href="https://example.com/paper" source="Original paper">claim</Footnote>.',
    );

    const trigger = screen.getByRole('button', { name: 'Open footnote 1' });
    await act(async () => user.click(trigger));
    const source = screen.getByRole('link', { name: /Original paper/ });
    const close = screen.getByRole('button', { name: 'Close footnote' });

    expect(source).toHaveAttribute('href', 'https://example.com/paper');
    expect(source).toHaveAttribute('target', '_blank');
    expect(source).toHaveFocus();

    await act(async () => user.tab());
    expect(close).toHaveFocus();

    await act(async () => user.tab());
    expect(source).toHaveFocus();

    await act(async () => user.tab({ shift: true }));
    expect(close).toHaveFocus();

    await act(async () => user.click(close));
    expect(screen.queryByRole('dialog', { name: 'Footnote 1' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test('keeps focus-preview passive until keyboard activation pins the footnote', async () => {
    const user = userEvent.setup();
    renderPost('A <Footnote note="A keyboard aside.">loaded phrase</Footnote> here.');

    const trigger = screen.getByRole('button', { name: 'Open footnote 1' });
    await act(async () => user.tab());

    expect(trigger).toHaveFocus();
    expect(screen.getByRole('note', { name: 'Footnote 1' })).toHaveTextContent('A keyboard aside.');

    await act(async () => user.keyboard('{Enter}'));
    expect(screen.getByRole('dialog', { name: 'Footnote 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close footnote' })).toHaveFocus();

    await act(async () => user.keyboard('{Escape}'));
    expect(screen.queryByRole('dialog', { name: 'Footnote 1' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test('rejects a YouTube lookalike host', () => {
    renderPost('<YouTube url="https://youtube.example.com/watch?v=dQw4w9WgXcQ" title="Nope" />');

    expect(screen.queryByTitle('Nope')).not.toBeInTheDocument();
  });
});
