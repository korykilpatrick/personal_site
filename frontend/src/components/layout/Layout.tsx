import React from 'react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const room = pathname.startsWith('/posts')
    ? 'posts'
    : pathname === '/bookshelf'
      ? 'bookshelf'
      : pathname === '/'
        ? 'home'
        : 'standard';

  return (
    <div className={`site-shell site-shell--${room}`}>
      <div className="site-shell-inner">{children}</div>
    </div>
  );
};

export default Layout;
