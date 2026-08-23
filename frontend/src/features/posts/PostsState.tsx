import React from 'react';

interface PostsStateProps {
  kind: 'loading' | 'error' | 'empty';
  onRetry?: () => void;
}

const copy = {
  loading: 'Opening the archive…',
  error: 'The archive could not be opened.',
  empty: 'No published posts yet.',
} as const;

const PostsState: React.FC<PostsStateProps> = ({ kind, onRetry }) => (
  <section className="posts-data-state" role={kind === 'error' ? 'alert' : 'status'}>
    <span className="posts-data-state-mark" aria-hidden="true">
      {kind === 'loading' ? '◌' : '◆'}
    </span>
    <p>{copy[kind]}</p>
    {kind === 'error' && onRetry ? (
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    ) : null}
  </section>
);

export default PostsState;
