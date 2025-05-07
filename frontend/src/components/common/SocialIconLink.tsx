import React from 'react';

interface SocialIconLinkProps {
  href: string;
  ariaLabel: string;
  svgPath: string;
  size?: 'small' | 'medium'; // 'medium' will be default
}

const SocialIconLink: React.FC<SocialIconLinkProps> = ({
  href,
  ariaLabel,
  svgPath,
  size = 'medium',
}) => {
  const iconSizeClass = size === 'small' ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="!text-white hover:!text-secondary-light no-underline"
      aria-label={ariaLabel}
    >
      <svg
        className={iconSizeClass}
        fill="currentColor"
        stroke="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d={svgPath} />
      </svg>
    </a>
  );
};

export default SocialIconLink; 