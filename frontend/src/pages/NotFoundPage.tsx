import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageMetadata from '@/components/layout/PageMetadata';

const NotFoundPage: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <section className="not-found-room">
      <PageMetadata
        title="Page not found"
        description="That page does not exist."
        path={pathname}
        noIndex
      />
      <p className="site-eyebrow">404</p>
      <h1>Page not found.</h1>
      <Link to="/">Return home</Link>
    </section>
  );
};

export default NotFoundPage;
