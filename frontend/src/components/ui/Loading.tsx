import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  return (
    <div className={`site-loading-state ${className}`} role="status" aria-label="Loading">
      <div className={`site-loading-mark ${sizeClasses[size]}`} aria-hidden="true" />
    </div>
  );
};

export default Loading;
