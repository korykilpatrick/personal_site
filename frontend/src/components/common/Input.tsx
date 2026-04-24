import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  // Warm focus ring (oxblood at low alpha, matching the site's accent
  // register) + warm disabled fill (cream-deep, not cool-stone).
  const baseStyles =
    'site-field w-full px-3 py-2.5 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:ring-2 focus:ring-oxblood/25 disabled:bg-cream-deep/80';

  return (
    <input
      className={`${baseStyles} ${className}`}
      {...props}
    />
  );
};

export default Input;
