import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { createPostArchiveModel } from '@/content/posts';
import type { LoadedPost, PostArchivePayload, PostSummary } from '@/content/posts/types';
import { usePosts } from '@/context/PostsContext';
import PostPage from './PostPage';

const mockPostRenderer = jest.fn(({ body }: { body: string }) => (
  <div data-testid="post-body">{body}</div>
));

jest.mock('@/components/posts/PostRenderer', () => ({
  __esModule: true,
  default: (props: { body: string }) => mockPostRenderer(props),
}));

jest.mock('@/context/PostsContext', () => ({
  usePosts: jest.fn(),
}));

const mockedUsePosts = jest.mocked(usePosts);

const summaries: readonly PostSummary[] = [
  {
    slug: 'post-a',
    title: 'Post A',
    dek: 'The first test post.',
    status: 'draft',
    sourcePeriod: 'test',
    order: 1,
    themes: { primary: 'theme-a' },
    conceptIds: [],
    relations: [],
    wordCount: 100,
    readingMinutes: 1,
  },
  {
    slug: 'post-b',
    title: 'Post B',
    dek: 'The second test post.',
    status: 'draft',
    sourcePeriod: 'test',
    order: 2,
    themes: { primary: 'theme-b' },
    conceptIds: [],
    relations: [],
    wordCount: 100,
    readingMinutes: 1,
  },
];

const archivePayload: PostArchivePayload = {
  version: 1,
  visibility: 'preview',
  posts: summaries,
  taxonomy: {
    version: 1,
    themes: [
      {
        id: 'theme-a',
        title: 'Theme A',
        description: 'The first test theme.',
        order: 1,
        anchor: { x: 0.25, y: 0.5 },
        tone: 'navy',
      },
      {
        id: 'theme-b',
        title: 'Theme B',
        description: 'The second test theme.',
        order: 2,
        anchor: { x: 0.75, y: 0.5 },
        tone: 'sage',
      },
    ],
    concepts: [],
  },
  bodyLinksBySlug: { 'post-a': [], 'post-b': [] },
  graphLayout: {
    version: 1,
    algorithmVersion: 'test-v1',
    sourceFingerprint: `sha256:${'0'.repeat(64)}`,
    coordinateSpace: 'normalized',
    minimumDistance: 0.05,
    nodes: {
      'theme:theme-a': { x: 0.25, y: 0.5 },
      'theme:theme-b': { x: 0.75, y: 0.5 },
      'post:post-a': { x: 0.3, y: 0.55 },
      'post:post-b': { x: 0.7, y: 0.55 },
    },
  },
};

const loadedPostA: LoadedPost = { ...summaries[0], body: 'Body A' };
const loadedPostB: LoadedPost = { ...summaries[1], body: 'Body B' };

const RouteHarness: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <button type="button" onClick={() => navigate('/posts/post-b')}>
        Open post B
      </button>
      <Routes>
        <Route path="/posts/:slug" element={<PostPage />} />
      </Routes>
    </>
  );
};

describe('PostPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('never renders the previous article while a new slug is loading', async () => {
    const archive = createPostArchiveModel(archivePayload);
    let resolvePostB!: (post: LoadedPost) => void;
    const postBRequest = new Promise<LoadedPost>((resolve) => {
      resolvePostB = resolve;
    });
    const getPost = jest.fn((slug: string) =>
      slug === 'post-a' ? Promise.resolve(loadedPostA) : postBRequest,
    );
    mockedUsePosts.mockReturnValue({
      archive,
      loading: false,
      error: null,
      retry: jest.fn(),
      getPost,
      prefetchPost: jest.fn(),
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter
        initialEntries={['/posts/post-a']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <RouteHarness />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Post A' })).toBeInTheDocument();
    expect(screen.getByTestId('post-body')).toHaveTextContent('Body A');
    mockPostRenderer.mockClear();

    await act(async () => user.click(screen.getByRole('button', { name: 'Open post B' })));
    await waitFor(() => expect(getPost).toHaveBeenCalledWith('post-b'));

    expect(mockPostRenderer).not.toHaveBeenCalled();
    expect(screen.queryByText('Body A')).not.toBeInTheDocument();
    expect(document.title).not.toContain('Post A');

    await act(async () => resolvePostB(loadedPostB));

    expect(await screen.findByRole('heading', { name: 'Post B' })).toBeInTheDocument();
    expect(screen.getByTestId('post-body')).toHaveTextContent('Body B');
    expect(mockPostRenderer).not.toHaveBeenCalledWith(expect.objectContaining({ body: 'Body A' }));
  });
});
