import React from 'react';
import NavCard from './NavCard';

interface ExploreGridProps {
  showProjects?: boolean;
}

/**
 * ExploreGrid – centres each NavCard for a balanced layout.
 */
const ExploreGrid: React.FC<ExploreGridProps> = ({ showProjects = true }) => {
  const navItems = [
    { title: 'My Work Journey', href: '/work', emoji: '💼' },
    { title: 'My Bookshelf', href: '/bookshelf', emoji: '📚' },
    { title: 'About Me', href: '/about', emoji: '👋' },
    { title: 'Projects', href: '/projects', emoji: '🛠️', hidden: !showProjects },
  ].filter(item => !item.hidden);

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 justify-items-center">
      {navItems.map(item => (
        <NavCard key={item.title} title={item.title} href={item.href} emoji={item.emoji} />
      ))}
    </div>
  );
};

export default ExploreGrid;