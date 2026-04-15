import React from 'react';
import { LinkIconName } from 'types'; // Import from the central types repository
import Icon, { IconName } from './Icon';

interface LinkIconProps {
  /** The pre-determined icon name (e.g., 'github', 'website'). Takes precedence over URL. */
  iconName?: LinkIconName;
  /** The URL to derive the icon from if iconName is not provided. */
  url?: string;
  /** Additional CSS classes to apply to the icon. */
  className?: string;
  /** Aria label for accessibility. Defaults will be provided. */
  ariaLabel?: string;
}

/**
 * Renders an appropriate icon for a link, based on a predefined name or URL analysis.
 * Defaults to an external link icon.
 */
const LinkIcon: React.FC<LinkIconProps> = ({
  iconName,
  url,
  className = '',
  ariaLabel,
}) => {
  let determinedIconName: IconName = 'external-link';
  let determinedLabel = 'Link';

  let effectiveIconName = iconName;

  // 1. If iconName is not provided, try to derive it from the URL
  if (!effectiveIconName && url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.includes('github.com')) effectiveIconName = 'github';
      else if (hostname.includes('linkedin.com')) effectiveIconName = 'linkedin';
      else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) effectiveIconName = 'youtube';
      else if (hostname.includes('twitter.com') || hostname.includes('x.com')) effectiveIconName = 'twitter';
      else if (hostname.includes('localhost')) effectiveIconName = 'website'; // Treat localhost as generic website/external
      else effectiveIconName = 'website'; // Default derived icon is website/external
    } catch (e) {
      // Invalid URL, default to 'other' or 'website'
      effectiveIconName = 'website';
    }
  }

  // 2. Map the effectiveIconName (or lack thereof) to the component and default label
  switch (effectiveIconName) {
    case 'github':
      determinedIconName = 'github';
      determinedLabel = 'GitHub Icon';
      break;
    case 'linkedin':
      determinedIconName = 'linkedin';
      determinedLabel = 'LinkedIn Icon';
      break;
    case 'youtube':
      determinedIconName = 'youtube';
      determinedLabel = 'YouTube Icon';
      break;
    case 'twitter':
      determinedIconName = 'twitter';
      determinedLabel = 'X Icon';
      break;
    case 'website':
    case 'other': // Treat 'other' explicitly as external link
    default: // Default case if iconName is undefined and URL didn't match known sites
      determinedIconName = 'external-link';
      determinedLabel = 'External Link Icon';
      break;
  }

  const iconTitle = ariaLabel === '' ? undefined : ariaLabel || determinedLabel;

  return <Icon name={determinedIconName} className={className} title={iconTitle} />;
};

export default LinkIcon; 
