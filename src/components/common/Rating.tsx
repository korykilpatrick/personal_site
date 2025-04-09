import React from 'react';
import Icon from './Icon';

export interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Rating: React.FC<RatingProps> = ({ value, max = 5, size = 'md', className = '' }) => {
  const iconSizes = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  } as const;

  return (
    <div className={`flex ${className}`}>
      {Array.from({ length: max }, (_, i) => (
        <Icon
          key={i}
          name={i < value ? 'star' : 'star-empty'}
          size={iconSizes[size]}
          className={i < value ? 'text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
};

export default Rating;
