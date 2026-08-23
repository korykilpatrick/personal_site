import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import apiService from '@/api/apiService';
import config from '@/config';
import {
  createPostArchiveModel,
  type PostArchiveModel,
} from '@/content/posts';
import type { LoadedPost } from '@/content/posts/types';

interface PostsState {
  archive: PostArchiveModel | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
  getPost: (slug: string) => Promise<LoadedPost>;
  prefetchPost: (slug: string) => void;
}

const PostsContext = createContext<PostsState | null>(null);

let archiveCache: PostArchiveModel | null = null;
let archiveRequest: Promise<PostArchiveModel> | null = null;
const publicPostCache = new Map<string, LoadedPost>();
const publicPostRequests = new Map<string, Promise<LoadedPost>>();

const loadArchive = async (): Promise<PostArchiveModel> => {
  if (!config.postsPreview && archiveCache) return archiveCache;
  if (!archiveRequest) {
    archiveRequest = apiService
      .getPostArchive()
      .then(createPostArchiveModel)
      .then((archive) => {
        if (!config.postsPreview) archiveCache = archive;
        return archive;
      })
      .finally(() => {
        archiveRequest = null;
      });
  }
  return archiveRequest;
};

const loadPost = async (
  slug: string,
  cache: Map<string, LoadedPost>,
  requests: Map<string, Promise<LoadedPost>>,
): Promise<LoadedPost> => {
  const cached = cache.get(slug);
  if (cached) return cached;

  const pending = requests.get(slug);
  if (pending) return pending;

  const request = apiService
    .getPostBySlug(slug)
    .then((post) => {
      cache.set(slug, post);
      return post;
    })
    .finally(() => {
      requests.delete(slug);
    });
  requests.set(slug, request);
  return request;
};

export const resetPostsCache = (): void => {
  archiveCache = null;
  archiveRequest = null;
  publicPostCache.clear();
  publicPostRequests.clear();
};

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [archive, setArchive] = useState<PostArchiveModel | null>(() => archiveCache);
  const [loading, setLoading] = useState(() => archiveCache === null);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const previewPostCacheRef = useRef(new Map<string, LoadedPost>());
  const previewPostRequestsRef = useRef(new Map<string, Promise<LoadedPost>>());

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    void loadArchive()
      .then((loaded) => {
        if (active) setArchive(loaded);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    archiveCache = null;
    archiveRequest = null;
    setAttempt((value) => value + 1);
  }, []);
  const getPost = useCallback(
    (slug: string) =>
      loadPost(
        slug,
        config.postsPreview ? previewPostCacheRef.current : publicPostCache,
        config.postsPreview ? previewPostRequestsRef.current : publicPostRequests,
      ),
    [],
  );
  const prefetchPost = useCallback((slug: string) => {
    void loadPost(
      slug,
      config.postsPreview ? previewPostCacheRef.current : publicPostCache,
      config.postsPreview ? previewPostRequestsRef.current : publicPostRequests,
    ).catch(() => undefined);
  }, []);

  const value = useMemo<PostsState>(
    () => ({ archive, loading, error, retry, getPost, prefetchPost }),
    [archive, error, getPost, loading, prefetchPost, retry],
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

export const usePosts = (): PostsState => {
  const value = useContext(PostsContext);
  if (!value) throw new Error('usePosts must be used inside PostsProvider');
  return value;
};
