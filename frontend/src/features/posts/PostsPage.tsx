import React from 'react';
import PostsExplorer from '@/components/posts/PostsExplorer';
import PageMetadata from '@/components/layout/PageMetadata';
import { usePosts } from '@/context/PostsContext';
import PostsState from './PostsState';

const PostsPage: React.FC = () => {
  const { archive, loading, error, retry, prefetchPost } = usePosts();
  const noIndex = archive?.visibility === 'preview' || !archive?.posts.some((post) => post.status === 'published');

  return (
    <div className="posts-archive-page">
      <PageMetadata
        title="Posts"
        description="Essays and shorter notes by Kory Kilpatrick on poker, AI, learning, attention, beauty, and the other games he cannot stop trying to solve."
        path="/posts"
        noIndex={noIndex}
      />

      {loading && !archive ? <PostsState kind="loading" /> : null}
      {error && !archive ? <PostsState kind="error" onRetry={retry} /> : null}
      {archive && archive.posts.length === 0 ? <PostsState kind="empty" /> : null}
      {archive && archive.posts.length > 0 ? (
        <PostsExplorer
          posts={archive.posts}
          contentGraph={archive.contentGraph}
          taxonomy={archive.taxonomy}
          graphLayout={archive.graphLayout}
          onPrefetchPost={prefetchPost}
        />
      ) : null}
    </div>
  );
};

export default PostsPage;
