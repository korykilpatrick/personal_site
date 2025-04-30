import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component providing a consistent page structure.
 * - Applies standard vertical padding and background color.
 * - Centers content within a defined maximum width.
 * - Adds consistent horizontal padding.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // Outermost div: Handles background and full height, reduced vertical padding
    <div className="py-4 min-h-screen">
      {/* Inner div: Constrains width, centers content, and adds horizontal padding */}
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {children} {/* Renders the specific page content */}
      </div>
    </div>
  );
};

export default Layout; 