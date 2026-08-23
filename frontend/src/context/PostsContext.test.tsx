import React, { useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import apiService from '@/api/apiService';
import type { LoadedPost, PostArchivePayload } from '@/content/posts/types';
import { PostsProvider, resetPostsCache, usePosts } from './PostsContext';

jest.mock('@/api/apiService', () => ({
  __esModule: true,
  default: {
    getPostArchive: jest.fn(),
    getPostBySlug: jest.fn(),
  },
}));

const mockedApi = jest.mocked(apiService);

const archivePayload: PostArchivePayload = {
  version: 1,
  visibility: 'preview',
  posts: [
    {
      slug: 'small-example',
      title: 'Small example',
      dek: 'A generic post used only in tests.',
      status: 'draft',
      sourcePeriod: 'test',
      order: 1,
      themes: { primary: 'first-theme' },
      conceptIds: ['shared-idea'],
      relations: [],
      wordCount: 220,
      readingMinutes: 1,
    },
  ],
  taxonomy: {
    version: 1,
    themes: [
      {
        id: 'first-theme',
        title: 'First theme',
        description: 'A generic theme.',
        order: 1,
        anchor: { x: 0.5, y: 0.5 },
        tone: 'navy',
      },
    ],
    concepts: [{ id: 'shared-idea', label: 'Shared idea' }],
  },
  bodyLinksBySlug: { 'small-example': [] },
  graphLayout: {
    version: 1,
    algorithmVersion: 'test-v1',
    sourceFingerprint: `sha256:${'0'.repeat(64)}`,
    coordinateSpace: 'normalized',
    minimumDistance: 0.05,
    nodes: {
      'theme:first-theme': { x: 0.5, y: 0.5 },
      'post:small-example': { x: 0.45, y: 0.55 },
    },
  },
};

const loadedPost: LoadedPost = {
  ...archivePayload.posts[0],
  body: 'The body arrived separately.',
};

const Consumer: React.FC = () => {
  const { archive, loading, error, retry, getPost } = usePosts();
  const [body, setBody] = useState('');
  return (
    <div>
      <span>{loading ? 'loading' : error ? 'error' : archive?.posts[0]?.title}</span>
      {error ? <button onClick={retry}>retry</button> : null}
      {archive ? (
        <button onClick={() => void getPost('small-example').then((post) => setBody(post.body))}>
          load body
        </button>
      ) : null}
      <p>{body}</p>
    </div>
  );
};

describe('PostsProvider', () => {
  beforeEach(() => {
    resetPostsCache();
    jest.clearAllMocks();
  });

  it('loads archive metadata first and fetches a body only on demand', async () => {
    mockedApi.getPostArchive.mockResolvedValue(archivePayload);
    mockedApi.getPostBySlug.mockResolvedValue(loadedPost);
    const user = userEvent.setup();

    render(
      <PostsProvider>
        <Consumer />
      </PostsProvider>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(mockedApi.getPostBySlug).not.toHaveBeenCalled();
    expect(await screen.findByText('Small example')).toBeInTheDocument();

    await act(async () => user.click(screen.getByRole('button', { name: 'load body' })));
    expect(await screen.findByText('The body arrived separately.')).toBeInTheDocument();
    expect(mockedApi.getPostBySlug).toHaveBeenCalledWith('small-example');
  });

  it('recovers from an archive request error without reloading the app', async () => {
    mockedApi.getPostArchive
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce(archivePayload);
    const user = userEvent.setup();

    render(
      <PostsProvider>
        <Consumer />
      </PostsProvider>,
    );

    expect(await screen.findByText('error')).toBeInTheDocument();
    await act(async () => user.click(screen.getByRole('button', { name: 'retry' })));
    await waitFor(() => expect(screen.getByText('Small example')).toBeInTheDocument());
    expect(mockedApi.getPostArchive).toHaveBeenCalledTimes(2);
  });
});
