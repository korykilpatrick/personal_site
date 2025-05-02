import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/common/Card';

interface NavCardProps {
  title: string;
  href: string;
  emoji: string;
}

/**
 * NavCard
 * Clickable card that routes to another section.
 */
const NavCard: React.FC<NavCardProps> = ({ title, href, emoji }) => (
  <Link to={href} className="no-underline">
    <Card variant="hover" padding="lg" className="h-full text-center cursor-pointer">
      <span className="text-4xl mb-2 block" role="img" aria-label="">
        {emoji}
      </span>
      <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
    </Card>
  </Link>
);

export default NavCard;