import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PostPage from './PostPage';
import PostsPage from './PostsPage';
import { PostsProvider } from '@/context/PostsContext';

const PostsRoutes: React.FC = () => (
  <PostsProvider>
    <Routes>
      <Route index element={<PostsPage />} />
      <Route path=":slug" element={<PostPage />} />
      <Route path="*" element={<PostPage />} />
    </Routes>
  </PostsProvider>
);

export default PostsRoutes;
