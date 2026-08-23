import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { compileContentGraph } from '@/content/posts/graph/compileContentGraph';
import type { ContentTaxonomy, PostGraphLayout, PostSummary } from '@/content/posts/types';
import PostAtlasMap from './PostAtlasMap';

const taxonomy: ContentTaxonomy = {
  version: 1,
  themes: [
    {
      id: 'first-theme',
      title: 'First theme',
      description: 'First',
      order: 1,
      anchor: { x: 0.2, y: 0.5 },
      tone: 'navy',
    },
    {
      id: 'second-theme',
      title: 'Second theme',
      description: 'Second',
      order: 2,
      anchor: { x: 0.8, y: 0.5 },
      tone: 'rust',
    },
  ],
  concepts: [{ id: 'shared', label: 'Shared' }],
};

const makePost = (
  slug: string,
  title: string,
  order: number,
  primary: string,
  relations: PostSummary['relations'] = [],
): PostSummary => ({
  slug,
  title,
  order,
  dek: `${title} dek`,
  status: 'draft',
  sourcePeriod: 'test',
  themes: { primary },
  conceptIds: ['shared'],
  relations,
  wordCount: 440,
  readingMinutes: 2,
});

const posts = [
  makePost('alpha', 'Alpha post', 1, 'first-theme', [
    { to: 'beta', kind: 'continues', reason: 'The next part of the thought.' },
    { to: 'gamma', kind: 'contrasts', reason: 'A useful disagreement.' },
  ]),
  makePost('beta', 'Beta post', 2, 'first-theme'),
  makePost('gamma', 'Gamma post', 3, 'second-theme'),
  makePost('delta', 'Delta post', 4, 'second-theme'),
] as const;

const graph = compileContentGraph({ posts, taxonomy, visibility: 'all' });
const layout: PostGraphLayout = {
  version: 1,
  algorithmVersion: 'test',
  sourceFingerprint: `sha256:${'0'.repeat(64)}`,
  coordinateSpace: 'normalized',
  minimumDistance: 0.05,
  nodes: {
    'theme:first-theme': { x: 0.2, y: 0.5 },
    'theme:second-theme': { x: 0.8, y: 0.5 },
    'post:alpha': { x: 0.12, y: 0.32 },
    'post:beta': { x: 0.3, y: 0.35 },
    'post:gamma': { x: 0.68, y: 0.32 },
    'post:delta': { x: 0.86, y: 0.36 },
  },
};

const Harness = ({
  compactOverview = false,
  showHistoryControl = false,
}: {
  compactOverview?: boolean;
  showHistoryControl?: boolean;
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>();
  const [focusedSlug, setFocusedSlug] = useState<string>();
  return (
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      {showHistoryControl && (
        <button type="button" onClick={() => setFocusedSlug(undefined)}>
          Simulate history pop
        </button>
      )}
      <PostAtlasMap
        posts={posts}
        graph={graph}
        taxonomy={taxonomy}
        layout={layout}
        visibleSlugs={new Set(posts.map((post) => post.slug))}
        selectedThemeId={selectedThemeId}
        focusedSlug={focusedSlug}
        compactOverview={compactOverview}
        onFocusPost={setFocusedSlug}
        onSelectTheme={setSelectedThemeId}
        onSelectConcept={() => setFocusedSlug(undefined)}
      />
    </MemoryRouter>
  );
};

describe('PostAtlasMap', () => {
  test('uses roving spatial keyboard navigation for themes and posts', () => {
    const { container } = render(<Harness />);
    const themeButtons = [
      ...container.querySelectorAll<HTMLButtonElement>('.post-atlas-theme-node'),
    ];
    const postButtons = [...container.querySelectorAll<HTMLButtonElement>('.post-atlas-post-node')];

    expect(themeButtons.filter((button) => button.tabIndex === 0)).toHaveLength(1);
    expect(postButtons.filter((button) => button.tabIndex === 0)).toHaveLength(1);

    const [firstTheme, secondTheme] = themeButtons;
    act(() => firstTheme.focus());
    fireEvent.keyDown(firstTheme, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(secondTheme);

    expect(screen.getByRole('button', { name: /alpha post/i })).not.toHaveAttribute(
      'aria-haspopup',
    );
  });

  test('reveals only the strongest local constellation on observation', () => {
    const { container } = render(<Harness />);
    expect(container.querySelectorAll('.post-atlas-theme-bridge')).toHaveLength(1);
    expect(container.querySelectorAll('.post-atlas-relation-path')).toHaveLength(0);
    fireEvent.mouseEnter(screen.getByRole('button', { name: /alpha post/i }));

    const neighbors = container.querySelectorAll('.post-atlas-post-node.is-context-neighbor');
    expect(neighbors.length).toBeGreaterThan(0);
    expect(neighbors.length).toBeLessThanOrEqual(3);
    expect(container.querySelectorAll('.post-atlas-relation-pulse')).toHaveLength(neighbors.length);
    expect(container.querySelector('.post-atlas-post-node.is-muted-by-observation')).toBeTruthy();
  });

  test('opens a nonmodal desktop dossier without disabling map navigation', () => {
    const { container } = render(<Harness />);
    const alpha = screen.getByRole('button', { name: /alpha post/i });
    act(() => alpha.focus());
    fireEvent.click(alpha);

    expect(screen.getByRole('complementary', { name: 'Alpha post' })).not.toHaveAttribute(
      'aria-modal',
    );
    expect(document.activeElement).toBe(alpha);
    expect(container.querySelector('.post-atlas-field-lines')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeEnabled();
    expect(container.querySelector('.post-atlas-dossier-backdrop')).toBeNull();
  });

  test('turns the compact dossier into a modal bottom sheet', () => {
    render(<Harness compactOverview />);
    fireEvent.click(screen.getByRole('button', { name: '2 posts First theme' }));
    const alpha = screen.getByRole('button', { name: /alpha post/i });
    expect(alpha).toHaveAttribute('aria-haspopup', 'dialog');
    fireEvent.click(alpha);

    expect(screen.getByRole('dialog', { name: 'Alpha post' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Zoom in', hidden: true })).toBeDisabled();
  });

  test('closes the dossier before leaving its selected theme on Escape', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: '2 posts First theme' }));
    const alpha = screen.getByRole('button', { name: /alpha post/i });
    fireEvent.click(alpha);
    act(() => alpha.focus());
    fireEvent.keyDown(alpha, { key: 'Escape' });

    await waitFor(() =>
      expect(screen.queryByRole('complementary', { name: 'Alpha post' })).toBeNull(),
    );
    expect(screen.getByRole('button', { name: 'Return to all themes' })).toBeInTheDocument();
  });

  test('restores node focus when a dossier concept changes the filter', async () => {
    render(<Harness />);
    const alpha = screen.getByRole('button', { name: /alpha post/i });
    fireEvent.click(alpha);
    fireEvent.click(screen.getByRole('button', { name: 'Shared' }));

    await waitFor(() => expect(document.activeElement).toBe(alpha));
  });

  test('restores node focus when URL history closes the focused dossier', async () => {
    render(<Harness showHistoryControl />);
    const alpha = screen.getByRole('button', { name: /alpha post/i });
    fireEvent.click(alpha);
    act(() => screen.getByRole('button', { name: 'Close post details' }).focus());
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close post details' }));

    act(() => screen.getByRole('button', { name: 'Simulate history pop' }).click());
    await waitFor(() => expect(document.activeElement).toBe(alpha));
  });

  test('keeps keyboard focus anchored while tracing a desktop connection', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /alpha post/i }));
    const connectionsSummary = screen.getByText('Connections').closest('summary');
    expect(connectionsSummary).not.toBeNull();
    fireEvent.click(connectionsSummary as HTMLElement);

    fireEvent.click(screen.getByRole('button', { name: 'Trace connection to Beta post' }));

    await waitFor(() =>
      expect(screen.getByRole('complementary', { name: 'Beta post' })).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Close post details' }),
      ),
    );
  });

  test('restores full emphasis to a focused post outside the active constellation', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /alpha post/i }));
    const delta = screen.getByRole('button', { name: /delta post/i });
    expect(delta).toHaveClass('is-muted-by-observation');

    act(() => delta.focus());
    expect(delta).not.toHaveClass('is-muted-by-observation');
  });

  test('returns keyboard focus to the clearing when leaving a theme', async () => {
    const { container } = render(<Harness />);
    const firstTheme = container.querySelector<HTMLButtonElement>('.post-atlas-theme-node');
    expect(firstTheme).not.toBeNull();
    fireEvent.click(firstTheme as HTMLButtonElement);
    fireEvent.click(screen.getByRole('button', { name: 'Return to all themes' }));
    await waitFor(() => expect(document.activeElement).toBe(firstTheme));
  });
});
