import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen py-6 sm:py-8 lg:py-10">
      <div className="container">
        {children}
      </div>
    </div>
  );
};

export default Layout; 
