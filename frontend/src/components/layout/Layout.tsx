import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  density?: 'default' | 'compact';
}

const Layout: React.FC<LayoutProps> = ({ children, density = 'default' }) => {
  const spacingClassName =
    density === 'compact'
      ? 'min-h-screen py-2 sm:py-3 lg:py-4'
      : 'min-h-screen py-6 sm:py-8 lg:py-10';

  return (
    <div className={spacingClassName}>
      <div className="container">
        {children}
      </div>
    </div>
  );
};

export default Layout; 
